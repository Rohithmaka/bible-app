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
const INITIAL_DAILY_SCRIPTURE: DailyScriptureItem = {
  id: 'ds-001',
  dateStr: new Date().toISOString().split('T')[0],
  verseText: 'Trust in the LORD with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths.',
  reference: 'Proverbs 3:5-6',
  bookId: 'PRO',
  chapter: 3,
  verse: 5,
  translation: 'KJV',
  understand: 'Solomon invites us to surrender our intellectual pride and place absolute confidence in God’s character and covenant promises, even when the path ahead seems uncertain.',
  reflectQuestion: 'What burden or situation are you trying to control today that God is asking you to surrender to Him?',
  guidedPrayer: 'Father, I choose to release my anxiety and my limited vision into Your hands today. Help me trust Your guidance above my own logic and grant me peace in Your sovereign direction. Amen.',
  practicalApplication: 'Take five quiet minutes today to write down your biggest concern, then actively pray a prayer of surrender over it.',
};

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
