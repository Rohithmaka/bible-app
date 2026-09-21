import * as admin from 'firebase-admin';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onCall, HttpsError } from 'firebase-functions/v2/https';

// Initialize Firebase Admin SDK
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();
const messaging = admin.messaging();

/**
 * 1. dailyReset: Hourly scheduled cron evaluating midnight battles
 * Runs every 60 minutes. Checks active users whose local midnight just occurred.
 */
export const dailyReset = onSchedule('every 60 minutes', async (event) => {
  const usersSnap = await db.collection('users').get();
  const now = new Date();

  for (const userDoc of usersSnap.docs) {
    const userData = userDoc.data();
    const uid = userDoc.id;
    const timezone = userData.timezone || 'UTC';

    // Calculate user's local hour
    let userLocalHour = now.getUTCHours();
    try {
      const userDateStr = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: 'numeric',
        hour12: false,
      }).format(now);
      userLocalHour = parseInt(userDateStr, 10);
    } catch (_) {}

    // Only process if user is in Hour 0 (Midnight: 00:00 - 00:59)
    if (userLocalHour === 0 || userLocalHour === 24) {
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const dateStr = yesterday.toISOString().split('T')[0];

      const battleRef = db.doc(`dailyBattle/${uid}/days/${dateStr}`);
      const battleSnap = await battleRef.get();

      if (battleSnap.exists) {
        const battleData = battleSnap.data() || {};
        const playerXP = battleData.playerTotalXP || 0;
        const rivalXP = battleData.rivalTotalXP || 0;
        const playerWon = playerXP >= rivalXP;

        // Fetch rival
        const rivalRef = db.doc(`rivals/${uid}`);
        const rivalSnap = await rivalRef.get();
        const rivalData = rivalSnap.data() || { level: 1, evolutionForm: 0 };

        let newRivalLevel = rivalData.level || 1;
        if (!playerWon) {
          newRivalLevel = Math.min(50, newRivalLevel + 1);
        } else {
          newRivalLevel = Math.max(1, newRivalLevel - 1);
        }

        let newForm = 0;
        if (newRivalLevel >= 30) newForm = 1;
        else if (newRivalLevel <= 3) newForm = 2;

        await rivalRef.set({
          level: newRivalLevel,
          evolutionForm: newForm,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

        // Update user stats
        let currentStreak = userData.currentStreak || 0;
        if (battleData.cleanDay) {
          currentStreak += 1;
        } else {
          currentStreak = 0;
        }

        await userDoc.ref.set({
          currentStreak,
          hotStreakActive: currentStreak >= 3,
          totalWins: (userData.totalWins || 0) + (playerWon ? 1 : 0),
          totalLosses: (userData.totalLosses || 0) + (playerWon ? 0 : 1),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

        // Dispatch EOD push alert if push token exists
        if (userData.pushToken) {
          try {
            await messaging.send({
              token: userData.pushToken,
              notification: {
                title: playerWon ? 'Day Won! 🏆' : 'Rival Victory ⚔️',
                body: playerWon
                  ? `You conquered yesterday with ${playerXP} XP! Streak: ${currentStreak} days.`
                  : `Your rival gained ground. Level updated to ${newRivalLevel}. Redeem today!`,
              },
            });
          } catch (_) {}
        }
      }
    }
  }
});

/**
 * 2. generateTaunt: Callable function integrating Claude 3.5 Sonnet for AI Rival Motivation
 */
export const generateTaunt = onCall(async (request) => {
  const uid = request.auth?.uid || request.data?.uid;
  if (!uid) {
    throw new HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const { personality = 'ruthless', incompleteTasks = [], xpGap = 0, rivalName = 'Rival' } = request.data || {};

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Fallback template taunts if Anthropic API key is not configured
    const templates: Record<string, string> = {
      ruthless: `You're trailing by ${xpGap} XP. Those incomplete tasks won't finish themselves.`,
      silent: `Current delta: -${xpGap} XP. ${incompleteTasks.length} pending obligations.`,
      mentor: `The day is slipping away, but your resolve doesn't have to. Step up and finish strong.`,
      chaotic: `Tick-tock! I'm already ahead, and your tasks are waiting for you to notice them!`,
    };
    return {
      message: templates[personality] || templates.ruthless,
      generatedAt: Date.now(),
      model: 'template-fallback',
    };
  }

  try {
    const systemPrompt = `You are "${rivalName}", a psychological fitness and habit rival with a "${personality}" personality archetype.
The user is falling behind in today's daily battle by ${xpGap} XP.
Their incomplete tasks are: ${incompleteTasks.join(', ') || 'general daily habits'}.
Write a direct, punchy, in-character psychological taunt or motivational challenge in exactly 1 or 2 sentences. Do not use hashtags or preamble.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 100,
        messages: [{ role: 'user', content: systemPrompt }],
      }),
    });

    const data = await response.json();
    const text = data?.content?.[0]?.text?.trim() || `Step up. You're behind by ${xpGap} XP.`;

    // Record taunt log in taunts/{uid}
    await db.collection('taunts').doc(uid).set({
      lastTauntAt: admin.firestore.FieldValue.serverTimestamp(),
      latestTaunt: text,
    }, { merge: true });

    return {
      message: text,
      generatedAt: Date.now(),
      model: 'claude-3-5-sonnet-20241022',
    };
  } catch (error: any) {
    return {
      message: `You're down by ${xpGap} XP. Get back to work before midnight!`,
      generatedAt: Date.now(),
      model: 'error-fallback',
    };
  }
});

/**
 * 3. scheduledTaunts: Scheduled midday & evening alerts
 */
export const scheduledTaunts = onSchedule('every 60 minutes', async (event) => {
  const usersSnap = await db.collection('users').get();
  const now = new Date();

  for (const userDoc of usersSnap.docs) {
    const userData = userDoc.data();
    const timezone = userData.timezone || 'UTC';

    let userLocalHour = now.getUTCHours();
    try {
      const userDateStr = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: 'numeric',
        hour12: false,
      }).format(now);
      userLocalHour = parseInt(userDateStr, 10);
    } catch (_) {}

    // Midday (12:00 PM) or Evening (8:00 PM) check
    if (userLocalHour === 12 || userLocalHour === 20) {
      if (userData.pushToken) {
        try {
          await messaging.send({
            token: userData.pushToken,
            notification: {
              title: 'Rival Alert ⚔️',
              body: userLocalHour === 12
                ? 'Midday check-in: Have you completed your reading and prayer goals?'
                : 'Evening battle: Only 4 hours left before midnight reset!',
            },
          });
        } catch (_) {}
      }
    }
  }
});
