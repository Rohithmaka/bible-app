import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp, firestore, messaging } from 'firebase-admin';
import Anthropic from '@anthropic-ai/sdk';

// Initialize Firebase Admin SDK
initializeApp();
const db = firestore();

// Initialize Anthropic Claude SDK (Requires ANTHROPIC_API_KEY env variable)
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'MOCK_API_KEY_FOR_LOCAL_EMULATOR',
});

// Prompts by personality as defined in system prompt specs
const PERSONALITY_PROMPTS = {
  ruthless: `You are a pixel-art rival character named {rivalName} in a productivity app called ALTER. 
You are ruthless, competitive, and personal. You reference the user's specific incomplete tasks by name. 
You are never encouraging. You are laser-focused on the gap. You speak in short, sharp sentences.
Never use asterisks, markdown, or formatting. 2 sentences max.`,

  silent: `You are a pixel-art rival character named {rivalName} in a productivity app called ALTER.
You are cold and analytical. You only state facts — XP numbers, task names, time remaining.
No emotion. No personality. Just data. 1–2 sentences, numbers only.`,

  mentor: `You are a pixel-art rival character named {rivalName} in a productivity app called ALTER.
You are tough but want the user to improve. You frame the XP gap as a learning opportunity.
You reference specific incomplete tasks and tell the user exactly what to do next.
Firm but constructive. 2 sentences max.`,

  chaotic: `You are a pixel-art rival character named {rivalName} in a productivity app called ALTER.
Your personality changes randomly. Sometimes you're funny, sometimes threatening, sometimes philosophical.
You always reference specific incomplete tasks. Be unpredictable. 1–3 sentences. No formatting.`
};

/**
 * 1. dailyReset Cloud Function
 * Runs every hour to check which users have crossed their local midnight,
 * tallies their scores, updates progress, updates levels/streaks, and spawns the next day.
 */
export const dailyReset = onSchedule("every 60 minutes", async () => {
  const now = new Date();
  
  // Fetch all user profiles
  const usersSnapshot = await db.collection('users').get();
  
  for (const userDoc of usersSnapshot.docs) {
    const uid = userDoc.id;
    const userData = userDoc.data();
    
    // Check timezone (default to UTC if not specified)
    const timezone = userData.timezone || 'UTC';
    
    // Determine the local date and hour for this user
    const localTime = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    const localHour = localTime.getHours();
    
    // If it's midnight (hour 0), execute EOD reset
    if (localHour === 0) {
      const year = localTime.getFullYear();
      const month = String(localTime.getMonth() + 1).padStart(2, '0');
      const day = String(localTime.getDate()).padStart(2, '0');
      const todayDateStr = `${year}-${month}-${day}`; // YYYY-MM-DD representing yesterday's battle that just ended
      
      const battleRef = db.collection('dailyBattle').doc(uid).collection('days').doc(todayDateStr);
      const battleDoc = await battleRef.get();
      
      if (battleDoc.exists && battleDoc.data()?.result === 'pending') {
        const battleData = battleDoc.data()!;
        const playerXP = battleData.playerTotalXP || 0;
        const rivalXP = battleData.rivalTotalXP || 0;
        
        // 1. Determine Day Result
        const result = playerXP >= rivalXP ? 'player' : 'rival';
        
        // 2. Load Rival Data to update level
        const rivalRef = db.collection('rivals').doc(uid);
        const rivalDoc = await rivalRef.get();
        let rivalLevel = 1;
        let rivalName = 'SHADOW';
        let totalRivalXP = 0;
        
        if (rivalDoc.exists) {
          const rData = rivalDoc.data()!;
          rivalLevel = rData.level || 1;
          rivalName = rData.name || 'SHADOW';
          totalRivalXP = rData.totalXP || 0;
        }
        
        // Calculate new level: loss (+1 level), win (-1 level)
        const newRivalLevel = result === 'rival'
          ? Math.min(rivalLevel + 1, 50)
          : Math.max(rivalLevel - 1, 1);
          
        // Determine Evolution Form (0=base, 1=powered, 2=degraded)
        let evolutionForm: 0 | 1 | 2 = 0;
        if (newRivalLevel >= 30) evolutionForm = 1;
        else if (newRivalLevel <= 3) evolutionForm = 2;
        
        // 3. Update Streak & Level
        const cleanDay = battleData.cleanDay || false;
        const currentStreak = userData.currentStreak || 0;
        const nextStreak = cleanDay ? currentStreak + 1 : 0;
        const hotStreakActive = nextStreak >= 3;
        
        const totalWins = result === 'player' ? (userData.totalWins || 0) + 1 : (userData.totalWins || 0);
        const totalLosses = result === 'rival' ? (userData.totalLosses || 0) + 1 : (userData.totalLosses || 0);
        const playerLevel = Math.max(1, Math.floor(totalWins / 5));
        
        // Update user state in database
        await userDoc.ref.update({
          totalWins,
          totalLosses,
          currentStreak: nextStreak,
          hotStreakActive,
          playerLevel
        });
        
        // Update rival level and evolution
        await rivalRef.set({
          level: newRivalLevel,
          evolutionForm,
          totalXP: totalRivalXP + rivalXP
        }, { merge: true });
        
        // Update daily battle doc result
        await battleRef.update({ result });
        
        // 4. Send Push Notification about EOD results
        const deviceToken = userData.pushToken;
        if (deviceToken) {
          const payload = result === 'player' ? {
            notification: {
              title: "✅ YOU WON TODAY",
              body: `Beat ${rivalName} by ${Math.round(playerXP - rivalXP)} XP. Rival drops a level. See you tomorrow!`
            }
          } : {
            notification: {
              title: `🔴 ${rivalName} WINS — +1 LEVEL`,
              body: `Lost by ${Math.round(rivalXP - playerXP)} XP. ${rivalName} gets stronger. Tomorrow starts now.`
            }
          };
          
          await messaging().send({
            token: deviceToken,
            notification: payload.notification
          });
        }
        
        // 5. Initialize tomorrow's document
        const tomorrow = new Date(localTime);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tYear = tomorrow.getFullYear();
        const tMonth = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const tDay = String(tomorrow.getDate()).padStart(2, '0');
        const tomorrowDateStr = `${tYear}-${tMonth}-${tDay}`;
        
        // Fetch active tasks to populate tomorrow's battle
        const tasksSnapshot = await db.collection('tasks').doc(uid).collection('taskList').where('isActive', '==', true).get();
        const battleTasks: Record<string, any> = {};
        
        tasksSnapshot.forEach((tDoc: firestore.QueryDocumentSnapshot) => {
          const tData = tDoc.data();
          battleTasks[tDoc.id] = {
            baseXP: tData.baseXP,
            completedAt: null,
            playerXPEarned: 0,
            rivalXPAccrued: 0
          };
        });
        
        const dayStartTime = new Date(tomorrowDateStr).setHours(0,0,0,0);
        await db.collection('dailyBattle').doc(uid).collection('days').doc(tomorrowDateStr).set({
          date: tomorrowDateStr,
          resetTime: firestore.Timestamp.fromMillis(dayStartTime + 24 * 60 * 60 * 1000 - 1),
          playerTotalXP: 0,
          rivalTotalXP: 0,
          result: 'pending',
          cleanDay: false,
          tasks: battleTasks
        });
      }
    }
  }
});

/**
 * 2. generateTaunt Cloud Function
 * Callable endpoint. Triggers a request to Claude with tasks, score difference, and personality
 * to generate a customized, contextual pixel-art rival taunt.
 */
export const generateTaunt = onCall(async (request: any) => {
  const { uid, incompleteTasks, rivalLevel, playerXP, rivalXP, rivalPersonality, rivalName } = request.data;
  
  if (!uid) {
    throw new HttpsError('invalid-argument', 'User ID (uid) must be provided.');
  }

  // Enforce Max 5 taunts/day limit
  const tauntsRef = db.collection('taunts').doc(uid);
  const tauntsDoc = await tauntsRef.get();
  let todayCount = 0;
  
  if (tauntsDoc.exists) {
    todayCount = tauntsDoc.data()?.todayTauntCount || 0;
  }
  
  if (todayCount >= 5) {
    return { taunt: "...", message: "Daily taunt limit reached." };
  }

  // System Prompt Customization
  const baseSystemPrompt = PERSONALITY_PROMPTS[rivalPersonality as keyof typeof PERSONALITY_PROMPTS] || PERSONALITY_PROMPTS.ruthless;
  const systemPrompt = baseSystemPrompt.replace(/{rivalName}/g, rivalName || 'SHADOW');

  // Context Prompt construction
  const currentHour = new Date().getHours();
  const taskNames = (incompleteTasks || []).map((t: { name: string }) => t.name).join(', ');
  
  const userPrompt = `
    Rival name: ${rivalName || 'SHADOW'}
    Rival level: ${rivalLevel || 1}
    Current XP gap: Rival leads by +${Math.round(rivalXP - playerXP)} XP ahead
    Incomplete tasks: ${taskNames || 'No tasks configured'}
    Time of day: ${currentHour}:00
    
    Generate ONE taunt message. Max 2 sentences. 
    Reference specific incomplete tasks by name if they exist.
    Match the personality: ${rivalPersonality}.
    Never use asterisks or formatting. Plain text only.
  `;

  let tauntText = '';
  
  try {
    // If local offline emulator testing and Anthropic API key is not supplied, use local mock generator
    if (process.env.ANTHROPIC_API_KEY === undefined || process.env.ANTHROPIC_API_KEY === 'MOCK_API_KEY_FOR_LOCAL_EMULATOR') {
      tauntText = mockLocalTauntGenerator(rivalPersonality, rivalName, incompleteTasks, rivalXP - playerXP);
    } else {
      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 150,
        messages: [{ role: "user", content: userPrompt }],
        system: systemPrompt
      });
      
      const contentBlock = response.content[0];
      tauntText = contentBlock.type === 'text' ? contentBlock.text : "Keep bleeding.";
    }
  } catch (error) {
    console.error("Claude API call failed:", error);
    tauntText = `Training yields results, ${rivalName} Lv.${rivalLevel} is waiting.`;
  }

  // Save to database taunts/{uid}
  const timestamp = firestore.Timestamp.now();
  await tauntsRef.set({
    lastTauntAt: timestamp,
    todayTauntCount: todayCount + 1,
    taunts: firestore.FieldValue.arrayUnion({
      message: tauntText,
      sentAt: timestamp,
      type: rivalPersonality
    })
  }, { merge: true });

  // Send Push Notification containing the taunt text
  const userRef = db.collection('users').doc(uid);
  const userDoc = await userRef.get();
  const pushToken = userDoc.data()?.pushToken;
  
  if (pushToken) {
    await messaging().send({
      token: pushToken,
      notification: {
        title: `${rivalName || 'SHADOW'} says:`,
        body: tauntText
      }
    });
  }

  return { taunt: tauntText };
});

/**
 * 3. scheduledTaunts Cloud Function
 * Runs every hour, identifies users whose local times are 12 PM or 8 PM,
 * and executes Claude taunts to push notifications.
 */
export const scheduledTaunts = onSchedule("every 60 minutes", async () => {
  const now = new Date();
  
  const usersSnapshot = await db.collection('users').get();
  
  for (const userDoc of usersSnapshot.docs) {
    const uid = userDoc.id;
    const userData = userDoc.data();
    
    // Check timezone (default to UTC if not specified)
    const timezone = userData.timezone || 'UTC';
    const localTime = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    const localHour = localTime.getHours();
    
    // Scheduled taunt times are 12 PM (noon) and 8 PM (evening)
    if (localHour === 12 || localHour === 20) {
      // Check rival configuration
      const rivalDoc = await db.collection('rivals').doc(uid).get();
      if (!rivalDoc.exists) continue;
      
      const rivalData = rivalDoc.data()!;
      const frequency = rivalData.tauntFrequency || 'balanced';
      
      // Skip if minimal (end-of-day only)
      if (frequency === 'minimal') continue;
      
      // Load current battle data
      const year = localTime.getFullYear();
      const month = String(localTime.getMonth() + 1).padStart(2, '0');
      const day = String(localTime.getDate()).padStart(2, '0');
      const todayDateStr = `${year}-${month}-${day}`;
      
      const battleDoc = await db.collection('dailyBattle').doc(uid).collection('days').doc(todayDateStr).get();
      if (!battleDoc.exists) continue;
      
      const battleData = battleDoc.data()!;
      if (battleData.result !== 'pending') continue; // Battle resolved, no taunts
      
      // Extract tasks that are incomplete
      const incompleteTasks: any[] = [];
      const tasksSnapshot = await db.collection('tasks').doc(uid).collection('taskList').get();
      
      tasksSnapshot.forEach((tDoc: firestore.QueryDocumentSnapshot) => {
        const tId = tDoc.id;
        const bTaskState = battleData.tasks[tId];
        if (bTaskState && bTaskState.completedAt === null) {
          incompleteTasks.push({ id: tId, name: tDoc.data().name });
        }
      });
      
      // Skip scheduled midday if no tasks are incomplete
      if (incompleteTasks.length === 0) continue;
      
      // Trigger Claude Taunt generation by calling our logic directly
      // Build mock request structure
      await generateTaunt.run({
        data: {
          uid,
          incompleteTasks,
          rivalLevel: rivalData.level || 1,
          playerXP: battleData.playerTotalXP || 0,
          rivalXP: battleData.rivalTotalXP || 0,
          rivalPersonality: rivalData.personality || 'ruthless',
          rivalName: rivalData.name || 'SHADOW'
        }
      } as any);
    }
  }
});

/**
 * Helper: Offline Mock Taunt Generator when Claude API Key is not available locally.
 */
function mockLocalTauntGenerator(personality: string, name: string, incompleteTasks: any[], xpGap: number): string {
  const taskName = incompleteTasks?.[0]?.name || "daily tasks";
  
  if (personality === 'silent') {
    return `Score Check: Rival +${Math.round(xpGap)} XP gap. Task outstanding: ${taskName}.`;
  }
  
  if (personality === 'mentor') {
    return `You're letting ${taskName} slip away. Take action and lock that XP before I pull further ahead.`;
  }
  
  if (personality === 'chaotic') {
    const chaoticTaunts = [
      `I am eating ${taskName} for breakfast. Delicious XP.`,
      `Time is a construct, but your bleed on ${taskName} is very real.`,
      `Does your screen look blurrier? No, it's just my level pulling you away.`
    ];
    return chaoticTaunts[Math.floor(Math.random() * chaoticTaunts.length)];
  }
  
  // default: ruthless
  return `You're slacking on ${taskName} and my level rises. I'm +${Math.round(xpGap)} XP ahead already.`;
}
