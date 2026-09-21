import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { storage } from '../storage/storage';

export type GrowthGoal = 
  | 'faith' 
  | 'prayer' 
  | 'wisdom' 
  | 'purpose' 
  | 'discipline' 
  | 'patience' 
  | 'forgiveness' 
  | 'peace' 
  | 'courage' 
  | 'love' 
  | 'gratitude' 
  | 'relationships';

export type TimeCommitment = '5 min' | '10 min' | '15 min' | '30 min' | '60 min';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'custom';
export type PrayerCategory = 'family' | 'career' | 'relationships' | 'faith' | 'gratitude' | 'personal' | 'other';
export type PrayerStatus = 'praying' | 'waiting' | 'answered';

export interface DailyScriptureItem {
  id: string;
  dateStr: string; // YYYY-MM-DD
  verseText: string;
  reference: string;
  bookId: string;
  chapter: number;
  verse: number;
  translation: string;
  understand: string;
  reflectQuestion: string;
  guidedPrayer: string;
  practicalApplication: string;
}

export interface PrivatePrayer {
  id: string;
  title: string;
  content: string;
  category: PrayerCategory;
  status: PrayerStatus;
  createdAt: number;
  answeredAt?: number;
  answerNote?: string;
  reminderEnabled?: boolean;
}

export interface CommunityPrayerUpdate {
  id: string;
  text: string;
  createdAt: number;
}

export interface CommunityPrayer {
  id: string;
  authorId?: string;
  authorName: string;
  isAnonymous: boolean;
  title: string;
  burdenText: string;
  category: PrayerCategory;
  prayerCount: number;
  standingCount?: number;
  supportCount?: number;
  userHasPrayed: boolean;
  userStandingWithYou?: boolean;
  userSupported?: boolean;
  createdAt: number;
  updates: CommunityPrayerUpdate[];
  isAnswered: boolean;
  circleId?: string;
  isReported?: boolean;
  reportReason?: string;
}

export interface PrayerCircle {
  id: string;
  name: string;
  category: 'family' | 'church' | 'friends' | 'small-group' | 'other';
  inviteCode: string;
  memberCount: number;
  createdAt: number;
  description: string;
  isPrivate: boolean;
}

export interface StructuredBibleStudy {
  id: string;
  verseKey: string; // `${bookId}:${chapter}:${verse}`
  bookName: string;
  chapter: number;
  verse: number;
  passageText: string;
  observations: string;       // What does it say?
  interpretation: string;     // What does it mean?
  personalReflection: string; // What does it mean to me?
  application: string;        // What should I do?
  prayer: string;             // Prayer
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface StoryOfFaith {
  id: string;
  title: string;
  story: string;
  prayingFor: string;
  whatHappened: string;
  whatILearned: string;
  relatedScripture: string;
  category: string;
  authorName: string;
  isAnonymous: boolean;
  createdAt: number;
  iPrayedCount: number;
  userReacted: boolean;
}

export interface MemoryVerse {
  id: string;
  verseKey: string;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
  category: string;
  status: 'learning' | 'reviewing' | 'memorized';
  addedAt: number;
  lastReviewedAt?: number;
}

export interface SpiritualStageInfo {
  step: number;
  title: string;
  badge: string;
  description: string;
  scriptureAnchor: string;
}

export const SPIRITUAL_STAGES: SpiritualStageInfo[] = [
  {
    step: 1,
    title: 'The Inquirer',
    badge: '1 / 10',
    description: 'Exploring spiritual questions, seeking truth, and curious about God.',
    scriptureAnchor: 'Jeremiah 29:13',
  },
  {
    step: 2,
    title: 'The New Believer',
    badge: '2 / 10',
    description: 'Freshly starting the faith walk, learning the basics of grace and salvation.',
    scriptureAnchor: '2 Corinthians 5:17',
  },
  {
    step: 3,
    title: 'Tender Sprout',
    badge: '3 / 10',
    description: 'Beginning to open the Bible regularly and learning how to pray honest prayers.',
    scriptureAnchor: '1 Peter 2:2',
  },
  {
    step: 4,
    title: 'Eager Learner',
    badge: '4 / 10',
    description: 'Developing a hunger for scripture, asking questions, and seeking Christian community.',
    scriptureAnchor: 'Matthew 5:6',
  },
  {
    step: 5,
    title: 'Growing Disciple',
    badge: '5 / 10',
    description: 'Consistent daily scripture reading, learning to trust God in personal decisions.',
    scriptureAnchor: 'Colossians 2:6-7',
  },
  {
    step: 6,
    title: 'Rooted Believer',
    badge: '6 / 10',
    description: 'Overcoming life doubts, understanding biblical context, standing firm against temptation.',
    scriptureAnchor: 'Ephesians 3:17',
  },
  {
    step: 7,
    title: 'Steadfast Follower',
    badge: '7 / 10',
    description: 'Navigating life trials with unwavering faith, letting the Holy Spirit guide daily actions.',
    scriptureAnchor: 'James 1:2-4',
  },
  {
    step: 8,
    title: 'Fruitful Servant',
    badge: '8 / 10',
    description: 'Actively serving others, showing Christ’s love in practical ways, and sharing personal testimony.',
    scriptureAnchor: 'Galatians 5:22-23',
  },
  {
    step: 9,
    title: 'Prayer Warrior & Guide',
    badge: '9 / 10',
    description: 'Interceding deeply for others, mentoring newer believers, and carrying spiritual burdens.',
    scriptureAnchor: '1 Thessalonians 5:16-18',
  },
  {
    step: 10,
    title: 'Mature Ambassador',
    badge: '10 / 10',
    description: 'A life thoroughly surrendered to Christ, possessing deep spiritual discernment and peace.',
    scriptureAnchor: 'Philippians 3:12-14',
  },
];

export interface SpiritualUserState {
  uid: string | null;
  displayName: string;
  age?: string;
  location?: string;
  email?: string;
  spiritualStage: number; // 1 to 10
  spiritualStageTitle: string; // e.g. "Growing Disciple"
  onboarded: boolean;
  growthGoals: GrowthGoal[];
  timeCommitment: TimeCommitment;
  timeOfDay: TimeOfDay;
  notificationTime: string; // e.g. "07:00 AM"
  notificationsEnabled: boolean;

  // Dedicated Reminders: Bible reading & short prayer throughout the day
  bibleReadingTime?: string; // default "07:00 AM"
  morningPrayerTime?: string; // default "08:30 AM"
  afternoonPrayerTime?: string; // default "01:00 PM"
  eveningPrayerTime?: string; // default "07:00 PM"
  nightPrayerTime?: string; // default "09:30 PM"

  bibleReadingEnabled?: boolean;
  morningPrayerEnabled?: boolean;
  afternoonPrayerEnabled?: boolean;
  eveningPrayerEnabled?: boolean;
  nightPrayerEnabled?: boolean;

  // Notification Delivery & Alert Customization
  notificationSoundEnabled?: boolean;
  notificationVibrateEnabled?: boolean;
  notificationShowVerseSnippet?: boolean;
  notificationPersonalizedGreeting?: boolean;
  notificationActiveDays?: 'everyday' | 'weekdays' | 'weekends';
}

export interface SpiritualState {
  user: SpiritualUserState;
  todayScripture: DailyScriptureItem;
  morningCompletedDates: string[]; // YYYY-MM-DD
  eveningCompletedDates: string[]; // YYYY-MM-DD
  
  // Data Collections
  privatePrayers: PrivatePrayer[];
  communityPrayers: CommunityPrayer[];
  bibleStudies: StructuredBibleStudy[];
  storiesOfFaith: StoryOfFaith[];
  memoryVerses: MemoryVerse[];
  prayerCircles: PrayerCircle[];
  followedUserIds: string[];
  reportedPrayerIds: string[];
  
  // Actions
  setOnboardedPreferences: (goals: GrowthGoal[], time: TimeCommitment, tod: TimeOfDay) => void;
  updateUserProfile: (fields: Partial<SpiritualUserState>) => void;
  markMorningJourneyComplete: (dateStr: string) => void;
  markEveningJourneyComplete: (dateStr: string) => void;
  
  // Follow System
  toggleFollowUser: (authorId: string) => void;
  
  // Prayer Circles
  createPrayerCircle: (name: string, category: 'family' | 'church' | 'friends' | 'small-group' | 'other', description: string, isPrivate: boolean) => PrayerCircle;
  joinCircleByCode: (code: string) => boolean;
  addRemoteCircle: (circle: PrayerCircle) => void;

  // Moderation
  reportPrayerRequest: (prayerId: string, reason: string) => void;
  approveFlaggedPrayer: (prayerId: string) => void;
  deleteFlaggedPrayer: (prayerId: string) => void;

  // Private Prayers
  addPrivatePrayer: (prayer: Omit<PrivatePrayer, 'id' | 'createdAt' | 'status'>) => void;
  updatePrivatePrayer: (id: string, fields: Partial<PrivatePrayer>) => void;
  markPrayerAnswered: (id: string, answerNote: string) => void;
  deletePrivatePrayer: (id: string) => void;
  
  // Community Prayers
  addCommunityPrayer: (prayer: Omit<CommunityPrayer, 'id' | 'createdAt' | 'prayerCount' | 'userHasPrayed' | 'updates' | 'isAnswered'>) => void;
  incrementIPrayed: (id: string) => void;
  reactStandingWithYou: (id: string) => void;
  reactSupport: (id: string) => void;
  addCommunityPrayerUpdate: (prayerId: string, updateText: string, markAnswered?: boolean) => void;
  
  // Structured Bible Studies
  saveBibleStudy: (study: Omit<StructuredBibleStudy, 'id' | 'createdAt' | 'updatedAt'>) => void;
  deleteBibleStudy: (id: string) => void;
  
  // Stories of Faith
  addStoryOfFaith: (story: Omit<StoryOfFaith, 'id' | 'createdAt' | 'iPrayedCount' | 'userReacted'>) => void;
  reactToStory: (id: string) => void;
  
  // Memory Verses
  addMemoryVerse: (verse: Omit<MemoryVerse, 'id' | 'addedAt' | 'status'>) => void;
  updateMemoryStatus: (id: string, status: 'learning' | 'reviewing' | 'memorized') => void;
  removeMemoryVerse: (id: string) => void;
}

// Initial Sample Data for Instant Rich Prototype
export const DAILY_SCRIPTURES_ROTATION: Omit<DailyScriptureItem, 'id' | 'dateStr'>[] = [
  {
    verseText: 'Trust in the LORD with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths.',
    reference: 'Proverbs 3:5-6',
    bookId: 'PRO',
    chapter: 3,
    verse: 5,
    translation: 'KJV',
    understand: 'Solomon invites us to surrender intellectual pride and place absolute confidence in God’s character and covenant promises.',
    reflectQuestion: 'What burden or situation are you trying to control today that God is asking you to surrender to Him?',
    guidedPrayer: 'Father, I release my anxiety and limited vision into Your hands. Help me trust Your guidance above my own logic. Amen.',
    practicalApplication: 'Take five quiet minutes today to write down your biggest concern, then actively pray a prayer of surrender over it.',
  },
  {
    verseText: 'Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God. And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.',
    reference: 'Philippians 4:6-7',
    bookId: 'PHP',
    chapter: 4,
    verse: 6,
    translation: 'KJV',
    understand: 'Paul reminds believers in prison that true peace is not the absence of trouble, but the presence of God through thanksgiving in prayer.',
    reflectQuestion: 'What worries can you convert into thankful prayers this morning?',
    guidedPrayer: 'Lord Jesus, thank You that You hear every whisper of my heart. Guard my mind today with Your supernatural peace. Amen.',
    practicalApplication: 'Whenever worry knocks on your mind today, immediately whisper a 10-second prayer of thanksgiving.',
  },
  {
    verseText: 'For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.',
    reference: 'Jeremiah 29:11',
    bookId: 'JER',
    chapter: 29,
    verse: 11,
    translation: 'KJV',
    understand: 'Even during seasons of waiting and hardship, God is orchestrating a redemptive future full of divine hope and purpose.',
    reflectQuestion: 'Are you resting in God’s good intentions for your tomorrow, or stressing over what you cannot see?',
    guidedPrayer: 'Heavenly Father, anchor my soul in the truth that Your plans for me are good. Give me patience to walk in faith today. Amen.',
    practicalApplication: 'Remind a family member or friend today that God has a hopeful future prepared for them.',
  },
  {
    verseText: 'The LORD is my shepherd; I shall not want. He maketh me to lie down in green pastures: he leadeth me beside the still waters.',
    reference: 'Psalm 23:1-2',
    bookId: 'PSA',
    chapter: 23,
    verse: 1,
    translation: 'KJV',
    understand: 'David depicts God as a tender, vigilant Shepherd who provides every physical, emotional, and spiritual necessity.',
    reflectQuestion: 'Where do you need the Good Shepherd to restore your soul and give you quiet rest today?',
    guidedPrayer: 'Dear Shepherd, thank You for watching over me. I rest in Your provision knowing I lack no good thing. Amen.',
    practicalApplication: 'Pause at midday for two minutes of silence and breathe in the reality that God is caring for you right now.',
  },
  {
    verseText: 'But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.',
    reference: 'Isaiah 40:31',
    bookId: 'ISA',
    chapter: 40,
    verse: 31,
    translation: 'KJV',
    understand: 'Human endurance has limits, but those who wait upon the everlasting God receive an inexhaustible supply of divine power.',
    reflectQuestion: 'In what area of your life do you feel weary, and how can you wait upon God for renewed vitality?',
    guidedPrayer: 'Almighty God, I trade my weakness for Your divine strength today. Lift my spirit above discouragement. Amen.',
    practicalApplication: 'When physical or mental tiredness hits today, pause to pray Isaiah 40:31 aloud before continuing.',
  },
  {
    verseText: 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.',
    reference: 'Romans 8:28',
    bookId: 'ROM',
    chapter: 8,
    verse: 28,
    translation: 'KJV',
    understand: 'Not all things that happen are good, but God is so sovereign that He weaves every circumstance into ultimate spiritual victory.',
    reflectQuestion: 'Can you trust that God is working behind the scenes of your current struggle for your eternal good?',
    guidedPrayer: 'Sovereign Lord, even when I do not understand the chapter I am in, I trust the Author of my life. Amen.',
    practicalApplication: 'Write down one past trial where God brought unexpected good, and let it fuel your faith today.',
  },
  {
    verseText: 'Come unto me, all ye that labour and are heavy laden, and I will give you rest. Take my yoke upon you, and learn of me; for I am meek and lowly in heart.',
    reference: 'Matthew 11:28-29',
    bookId: 'MAT',
    chapter: 11,
    verse: 28,
    translation: 'KJV',
    understand: 'Jesus does not demand impossible performance; He offers an intimate sanctuary of restorative soul-rest to the weary.',
    reflectQuestion: 'What heavy burden are you carrying alone that Jesus is asking you to hand over to Him right now?',
    guidedPrayer: 'Jesus, I come to You with all my fatigue and burdens. Grant my soul deep, unshakeable rest today. Amen.',
    practicalApplication: 'Take off your shoes for 3 minutes, sit in stillness, and imagine placing your heavy bag at Jesus’ feet.',
  },
  {
    verseText: 'Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.',
    reference: 'Joshua 1:9',
    bookId: 'JOS',
    chapter: 1,
    verse: 9,
    translation: 'KJV',
    understand: 'Courage is not the absence of fear, but the conviction that the Almighty God walks alongside you into every unknown battle.',
    reflectQuestion: 'What step of obedience or difficult conversation requires you to step out in holy courage today?',
    guidedPrayer: 'Lord, You are with me everywhere I step. Cast out all timidity and fill me with bold, humble courage. Amen.',
    practicalApplication: 'Tackle the most intimidating task on your to-do list first today with the declaration: God is with me.',
  },
  {
    verseText: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
    reference: 'John 3:16',
    bookId: 'JHN',
    chapter: 3,
    verse: 16,
    translation: 'KJV',
    understand: 'The gospel in a single verse: divine, unconditional love proved through the greatest gift ever given in human history.',
    reflectQuestion: 'How deeply has the personal love of Christ transformed the way you see yourself and treat others?',
    guidedPrayer: 'Father, thank You for loving me with an eternal, sacrificial love that nothing can ever tear away. Amen.',
    practicalApplication: 'Express genuine, Christ-like appreciation to at least one person who may be feeling overlooked today.',
  },
  {
    verseText: 'God is our refuge and strength, a very present help in trouble. Therefore will not we fear, though the earth be removed.',
    reference: 'Psalm 46:1-2',
    bookId: 'PSA',
    chapter: 46,
    verse: 1,
    translation: 'KJV',
    understand: 'God is not a distant bystander; He is an immediate, fortress-like sanctuary that cannot be shaken by world storms.',
    reflectQuestion: 'When trouble knocks, is God your first shelter, or do you seek safety in worldly comforts?',
    guidedPrayer: 'God, You are my fortress and safe shelter. Shield my family and heart from fear today. Amen.',
    practicalApplication: 'Memorize the words "God is our refuge and strength" and repeat it whenever tension arises today.',
  },
  {
    verseText: 'Thy word is a lamp unto my feet, and a light unto my path.',
    reference: 'Psalm 119:105',
    bookId: 'PSA',
    chapter: 119,
    verse: 105,
    translation: 'KJV',
    understand: 'Scripture does not always illuminate the whole highway 10 miles ahead, but it always gives enough light for the next step.',
    reflectQuestion: 'Are you seeking God’s guidance for your next step today through His holy Word?',
    guidedPrayer: 'Holy Spirit, let Your Word guide my decisions, speech, and attitudes today like a glowing lamp. Amen.',
    practicalApplication: 'Read one full chapter of scripture before making your major decisions for today.',
  },
  {
    verseText: 'Now unto him that is able to do exceeding abundantly above all that we ask or think, according to the power that worketh in us.',
    reference: 'Ephesians 3:20',
    bookId: 'EPH',
    chapter: 3,
    verse: 20,
    translation: 'KJV',
    understand: 'God’s capacity to answer and bless infinitely outstrips the highest ceiling of our human prayers and imagination.',
    reflectQuestion: 'Have you been praying small prayers, forgetting how immense and generous your Heavenly Father is?',
    guidedPrayer: 'Lord, expand my faith today. You are able to do far beyond all I could dare to ask or dream. Amen.',
    practicalApplication: 'Pray bold, faith-filled prayers for your family, city, and church today.',
  },
  {
    verseText: 'Casting all your care upon him; for he careth for you.',
    reference: '1 Peter 5:7',
    bookId: '1PE',
    chapter: 5,
    verse: 7,
    translation: 'KJV',
    understand: 'You were never designed to carry the heavy luggage of tomorrow; throw every single anxiety onto the shoulders of the Father.',
    reflectQuestion: 'What worry are you still trying to carry that God has already offered to hold for you?',
    guidedPrayer: 'Father, I throw all my anxieties, fears, and doubts onto You, because You care for me deeply. Amen.',
    practicalApplication: 'Physically open your hands upward as a symbol of dropping your worries into God’s care.',
  },
  {
    verseText: 'Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.',
    reference: 'Isaiah 41:10',
    bookId: 'ISA',
    chapter: 41,
    verse: 10,
    translation: 'KJV',
    understand: 'God gives five unshakable guarantees: I am with you; I am your God; I will strengthen you; I will help you; I will uphold you.',
    reflectQuestion: 'Which of God’s five promises in this verse gives your heart the deepest reassurance today?',
    guidedPrayer: 'Lord, hold me firmly with Your righteous right hand. I reject fear because You are standing with me. Amen.',
    practicalApplication: 'Write down Isaiah 41:10 on a card or phone lockscreen to gaze upon throughout the afternoon.',
  }
];

export function getDailyScriptureForDate(date: Date = new Date()): DailyScriptureItem {
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const base = DAILY_SCRIPTURES_ROTATION[dayOfYear % DAILY_SCRIPTURES_ROTATION.length];
  const dateStr = date.toISOString().split('T')[0];
  return {
    ...base,
    id: `ds-${dateStr}`,
    dateStr,
  };
}

const INITIAL_DAILY_SCRIPTURE: DailyScriptureItem = getDailyScriptureForDate();

const INITIAL_PRIVATE_PRAYERS: PrivatePrayer[] = [
  {
    id: 'prv-1',
    title: 'Peace & Wisdom for Family Decision',
    content: 'Praying for clear direction and unity regarding our family housing decision this month.',
    category: 'family',
    status: 'praying',
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'prv-2',
    title: 'Job Interview & Career Direction',
    content: 'Prayed for grace during the interview process at the new firm.',
    category: 'career',
    status: 'answered',
    createdAt: Date.now() - 86400000 * 14,
    answeredAt: Date.now() - 86400000 * 2,
    answerNote: 'Received the job offer with great terms! God truly provided beyond what we asked.',
  },
];

const INITIAL_COMMUNITY_PRAYERS: CommunityPrayer[] = [
  {
    id: 'com-1',
    authorName: 'Hannah M.',
    isAnonymous: false,
    title: 'Strength through difficult medical season',
    burdenText: 'Please pray for my mother as she undergoes health testing this week. Asking God for peace that surpasses understanding and good results.',
    category: 'family',
    prayerCount: 42,
    userHasPrayed: false,
    createdAt: Date.now() - 86400000 * 1,
    updates: [
      {
        id: 'u-1',
        text: 'Initial tests completed today. Thank you everyone praying!',
        createdAt: Date.now() - 43200000,
      }
    ],
    isAnswered: false,
  },
  {
    id: 'com-2',
    authorName: 'Anonymous Believer',
    isAnonymous: true,
    title: 'Restoration in marriage & patience',
    burdenText: 'Asking our prayer community to stand with me in prayer for healing, softer hearts, and open communication in my marriage.',
    category: 'relationships',
    prayerCount: 89,
    userHasPrayed: true,
    createdAt: Date.now() - 86400000 * 2,
    updates: [],
    isAnswered: false,
  },
];

const INITIAL_STORIES: StoryOfFaith[] = [
  {
    id: 'story-1',
    title: 'How God Showed Up in Our Deepest Debt',
    story: 'Two years ago we were struggling financially and felt overwhelmed. Through prayer, discipline, and community support, God provided unexpected freelance work and guided us out of debt.',
    prayingFor: 'Financial relief and provision',
    whatHappened: 'A former client reached out out of nowhere with a long-term contract that covered our exact needs.',
    whatILearned: 'God is never late. He builds our faith in the waiting.',
    relatedScripture: 'Philippians 4:19',
    category: 'Answered Prayer',
    authorName: 'David K.',
    isAnonymous: false,
    createdAt: Date.now() - 86400000 * 5,
    iPrayedCount: 156,
    userReacted: false,
  },
];

const INITIAL_MEMORY_VERSES: MemoryVerse[] = [
  {
    id: 'mem-1',
    verseKey: 'PHI:4:6',
    bookName: 'Philippians',
    chapter: 4,
    verse: 6,
    text: 'Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.',
    category: 'Peace & Trust',
    status: 'learning',
    addedAt: Date.now() - 86400000 * 2,
  },
];

const INITIAL_PRAYER_CIRCLES: PrayerCircle[] = [
  {
    id: 'circle-1',
    name: 'Grace Fellowship Family',
    category: 'family',
    inviteCode: 'GRACE-FAM-2026',
    memberCount: 14,
    createdAt: Date.now() - 86400000 * 10,
    description: 'Private circle for family members to share urgent prayer requests and praises.',
    isPrivate: true,
  },
  {
    id: 'circle-2',
    name: 'Young Adults Bible Study',
    category: 'small-group',
    inviteCode: 'YOUTH-STUDY-99',
    memberCount: 28,
    createdAt: Date.now() - 86400000 * 30,
    description: 'Weekly prayer group for young professionals & students.',
    isPrivate: false,
  },
];

const zustandStorage: StateStorage = {
  getItem: (name) => storage.getString(name) ?? null,
  setItem: (name, value) => storage.set(name, value),
  removeItem: (name) => storage.delete(name),
};

export const useSpiritualStore = create<SpiritualState>()(
  persist(
    (set, get) => ({
      user: {
        uid: null,
        displayName: 'Friend',
        age: '25',
        location: '',
        email: '',
        spiritualStage: 5,
        spiritualStageTitle: 'Growing Disciple',
        onboarded: true,
        growthGoals: ['faith', 'peace', 'prayer', 'wisdom'],
        timeCommitment: '15 min',
        timeOfDay: 'morning',
        notificationTime: '07:00 AM',
        notificationsEnabled: true,
        bibleReadingTime: '07:00 AM',
        morningPrayerTime: '08:30 AM',
        afternoonPrayerTime: '01:00 PM',
        eveningPrayerTime: '07:00 PM',
        nightPrayerTime: '09:30 PM',
        bibleReadingEnabled: true,
        morningPrayerEnabled: true,
        afternoonPrayerEnabled: true,
        eveningPrayerEnabled: true,
        nightPrayerEnabled: true,
        notificationSoundEnabled: true,
        notificationVibrateEnabled: true,
        notificationShowVerseSnippet: true,
        notificationPersonalizedGreeting: true,
        notificationActiveDays: 'everyday',
      },
      todayScripture: INITIAL_DAILY_SCRIPTURE,
      morningCompletedDates: [],
      eveningCompletedDates: [],
      privatePrayers: INITIAL_PRIVATE_PRAYERS,
      communityPrayers: INITIAL_COMMUNITY_PRAYERS,
      bibleStudies: [],
      storiesOfFaith: INITIAL_STORIES,
      memoryVerses: INITIAL_MEMORY_VERSES,
      prayerCircles: INITIAL_PRAYER_CIRCLES,
      followedUserIds: ['author-hannah'],
      reportedPrayerIds: [],

      setOnboardedPreferences: (goals, time, tod) => set((state) => ({
        user: { ...state.user, growthGoals: goals, timeCommitment: time, timeOfDay: tod, onboarded: true },
      })),

      updateUserProfile: (fields) => set((state) => ({
        user: { ...state.user, ...fields },
      })),

      markMorningJourneyComplete: (dateStr) => set((state) => ({
        morningCompletedDates: state.morningCompletedDates.includes(dateStr) 
          ? state.morningCompletedDates 
          : [...state.morningCompletedDates, dateStr],
      })),

      markEveningJourneyComplete: (dateStr) => set((state) => ({
        eveningCompletedDates: state.eveningCompletedDates.includes(dateStr) 
          ? state.eveningCompletedDates 
          : [...state.eveningCompletedDates, dateStr],
      })),

      // Follow System
      toggleFollowUser: (authorId: string) => set((state) => {
        const isFollowing = state.followedUserIds.includes(authorId);
        return {
          followedUserIds: isFollowing
            ? state.followedUserIds.filter(id => id !== authorId)
            : [...state.followedUserIds, authorId],
        };
      }),

      // Prayer Circles
      createPrayerCircle: (name, category, description, isPrivate) => {
        const inviteCode = `${category.toUpperCase().slice(0, 4)}-${Math.floor(1000 + Math.random() * 9000)}`;
        const newCircle: PrayerCircle = {
          id: `circle-${Date.now()}`,
          name,
          category,
          inviteCode,
          memberCount: 1,
          createdAt: Date.now(),
          description,
          isPrivate,
        };
        set(state => ({ prayerCircles: [newCircle, ...state.prayerCircles] }));
        return newCircle;
      },

      joinCircleByCode: (code: string) => {
        const circles = get().prayerCircles;
        const match = circles.find(c => c.inviteCode.trim().toUpperCase() === code.trim().toUpperCase());
        if (match) {
          set(state => ({
            prayerCircles: state.prayerCircles.map(c => c.id === match.id ? { ...c, memberCount: c.memberCount + 1 } : c)
          }));
          return true;
        }
        return false;
      },

      addRemoteCircle: (circle: PrayerCircle) => {
        set(state => {
          const exists = state.prayerCircles.some(c => c.id === circle.id || c.inviteCode === circle.inviteCode);
          if (exists) {
            return {
              prayerCircles: state.prayerCircles.map(c => c.id === circle.id ? { ...c, memberCount: Math.max(c.memberCount, circle.memberCount + 1) } : c)
            };
          }
          return {
            prayerCircles: [{ ...circle, memberCount: circle.memberCount + 1 }, ...state.prayerCircles]
          };
        });
      },

      // Moderation
      reportPrayerRequest: (prayerId: string, reason: string) => set(state => ({
        reportedPrayerIds: [...state.reportedPrayerIds, prayerId],
        communityPrayers: state.communityPrayers.map(p => p.id === prayerId ? { ...p, isReported: true, reportReason: reason } : p)
      })),

      approveFlaggedPrayer: (prayerId: string) => set(state => ({
        reportedPrayerIds: state.reportedPrayerIds.filter(id => id !== prayerId),
        communityPrayers: state.communityPrayers.map(p => p.id === prayerId ? { ...p, isReported: false } : p)
      })),

      deleteFlaggedPrayer: (prayerId: string) => set(state => ({
        reportedPrayerIds: state.reportedPrayerIds.filter(id => id !== prayerId),
        communityPrayers: state.communityPrayers.filter(p => p.id !== prayerId)
      })),

      // Private Prayers
      addPrivatePrayer: (prayerData) => set((state) => {
        const newPrayer: PrivatePrayer = {
          ...prayerData,
          id: `prv-${Date.now()}`,
          status: 'praying',
          createdAt: Date.now(),
        };
        return { privatePrayers: [newPrayer, ...state.privatePrayers] };
      }),

      updatePrivatePrayer: (id, fields) => set((state) => ({
        privatePrayers: state.privatePrayers.map((p) => (p.id === id ? { ...p, ...fields } : p)),
      })),

      markPrayerAnswered: (id, answerNote) => set((state) => ({
        privatePrayers: state.privatePrayers.map((p) => 
          p.id === id ? { ...p, status: 'answered', answeredAt: Date.now(), answerNote } : p
        ),
      })),

      deletePrivatePrayer: (id) => set((state) => ({
        privatePrayers: state.privatePrayers.filter((p) => p.id !== id),
      })),

      // Community Prayers
      addCommunityPrayer: (prayerData) => set((state) => {
        const newPrayer: CommunityPrayer = {
          ...prayerData,
          id: `com-${Date.now()}`,
          createdAt: Date.now(),
          prayerCount: 1,
          standingCount: 0,
          supportCount: 0,
          userHasPrayed: true,
          userStandingWithYou: false,
          userSupported: false,
          updates: [],
          isAnswered: false,
        };
        return { communityPrayers: [newPrayer, ...state.communityPrayers] };
      }),

      incrementIPrayed: (id) => set((state) => ({
        communityPrayers: state.communityPrayers.map((p) => {
          if (p.id === id) {
            const already = p.userHasPrayed;
            return {
              ...p,
              userHasPrayed: true,
              prayerCount: already ? p.prayerCount : p.prayerCount + 1,
            };
          }
          return p;
        }),
      })),

      reactStandingWithYou: (id) => set((state) => ({
        communityPrayers: state.communityPrayers.map((p) => {
          if (p.id === id) {
            const already = !!p.userStandingWithYou;
            const currentStanding = p.standingCount || 0;
            return {
              ...p,
              userStandingWithYou: !already,
              standingCount: already ? Math.max(0, currentStanding - 1) : currentStanding + 1,
            };
          }
          return p;
        }),
      })),

      reactSupport: (id) => set((state) => ({
        communityPrayers: state.communityPrayers.map((p) => {
          if (p.id === id) {
            const already = !!p.userSupported;
            const currentSupport = p.supportCount || 0;
            return {
              ...p,
              userSupported: !already,
              supportCount: already ? Math.max(0, currentSupport - 1) : currentSupport + 1,
            };
          }
          return p;
        }),
      })),

      addCommunityPrayerUpdate: (prayerId, updateText, markAnswered) => set((state) => ({
        communityPrayers: state.communityPrayers.map((p) => {
          if (p.id === prayerId) {
            const newUpdate: CommunityPrayerUpdate = {
              id: `up-${Date.now()}`,
              text: updateText,
              createdAt: Date.now(),
            };
            return {
              ...p,
              updates: [...p.updates, newUpdate],
              isAnswered: markAnswered !== undefined ? markAnswered : p.isAnswered,
            };
          }
          return p;
        }),
      })),

      // Structured Bible Studies
      saveBibleStudy: (studyData) => set((state) => {
        const existingIndex = state.bibleStudies.findIndex((s) => s.verseKey === studyData.verseKey);
        const now = Date.now();
        if (existingIndex >= 0) {
          const updated = [...state.bibleStudies];
          updated[existingIndex] = {
            ...updated[existingIndex],
            ...studyData,
            updatedAt: now,
          };
          return { bibleStudies: updated };
        } else {
          const newStudy: StructuredBibleStudy = {
            ...studyData,
            id: `study-${now}`,
            createdAt: now,
            updatedAt: now,
          };
          return { bibleStudies: [newStudy, ...state.bibleStudies] };
        }
      }),

      deleteBibleStudy: (id) => set((state) => ({
        bibleStudies: state.bibleStudies.filter((s) => s.id !== id),
      })),

      // Stories of Faith
      addStoryOfFaith: (storyData) => set((state) => {
        const newStory: StoryOfFaith = {
          ...storyData,
          id: `story-${Date.now()}`,
          createdAt: Date.now(),
          iPrayedCount: 1,
          userReacted: true,
        };
        return { storiesOfFaith: [newStory, ...state.storiesOfFaith] };
      }),

      reactToStory: (id) => set((state) => ({
        storiesOfFaith: state.storiesOfFaith.map((s) => {
          if (s.id === id) {
            const already = s.userReacted;
            return {
              ...s,
              userReacted: !already,
              iPrayedCount: already ? s.iPrayedCount - 1 : s.iPrayedCount + 1,
            };
          }
          return s;
        }),
      })),

      // Memory Verses
      addMemoryVerse: (verseData) => set((state) => {
        const exists = state.memoryVerses.some((v) => v.verseKey === verseData.verseKey);
        if (exists) return state;
        const newMemory: MemoryVerse = {
          ...verseData,
          id: `mem-${Date.now()}`,
          status: 'learning',
          addedAt: Date.now(),
        };
        return { memoryVerses: [newMemory, ...state.memoryVerses] };
      }),

      updateMemoryStatus: (id, status) => set((state) => ({
        memoryVerses: state.memoryVerses.map((v) => (v.id === id ? { ...v, status, lastReviewedAt: Date.now() } : v)),
      })),

      removeMemoryVerse: (id) => set((state) => ({
        memoryVerses: state.memoryVerses.filter((v) => v.id !== id),
      })),
    }),
    {
      name: 'spiritual-store-data',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
