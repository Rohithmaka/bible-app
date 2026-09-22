export interface DailyDevotionItem {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  verseReference: string;
  verseText: string;
  verseTranslation: string;
  devotion: string;
  reflectionQuestion: string;
  prayer: string;
  dailyAction: string;
  bookId?: string;
  chapter?: number;
  verse?: number;
}

/**
 * 100% Original SELA Devotional Library
 * Written specifically for the SELA Bible & Spiritual Growth App.
 * Each entry connects sacred Scripture directly to contemporary Christian life.
 */
export const SELA_ORIGINAL_DEVOTIONS: Omit<DailyDevotionItem, 'id' | 'date'>[] = [
  {
    title: 'Be Still and Know',
    verseReference: 'Psalm 46:10',
    verseText: 'Be still, and know that I am God: I will be exalted among the heathen, I will be exalted in the earth.',
    verseTranslation: 'KJV',
    devotion:
      'In a world driven by noise, hurry, and endless striving, God offers a transformative invitation: "Be still." True stillness is not inactivity or passive resignation; it is an active surrender of our anxious control into the sovereign hands of our Creator. When we pause our inner restlessness and quiet our racing thoughts, we remember that God is reigning over every trial, circumstance, and nation. The battle belongs to Him, not to our nervous energy.',
    reflectionQuestion:
      'What is one heavy worry or exhausting situation in your life today that God is asking you to place completely into His hands?',
    prayer:
      'Heavenly Father, quiet the loud voices and anxious thoughts in my mind. Teach me the holiness of sacred stillness. Help me rest confidently in Your sovereign power, knowing that You are God and You never fail. In Jesus’ name, Amen.',
    dailyAction:
      'Spend five completely quiet minutes right now with your eyes closed, breathing deeply and meditating on Psalm 46:10 before opening another app or email.',
    bookId: 'PSA',
    chapter: 46,
    verse: 10,
  },
  {
    title: 'Wholehearted Trust',
    verseReference: 'Proverbs 3:5-6',
    verseText: 'Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.',
    verseTranslation: 'KJV',
    devotion:
      'Human understanding is naturally finite and often clouded by fear, assumptions, and limited vision. God’s wisdom, however, is eternal and all-knowing. Wholehearted trust means we refuse to let our fragile logic overrule God’s clear Word. When we actively involve Christ in our smallest daily decisions, He straightens the twisted paths and leads us with sovereign peace.',
    reflectionQuestion:
      'In what area of your life are you currently leaning on your own logic rather than seeking God’s guidance in prayer?',
    prayer:
      'Lord God, forgive me for the times I rely on my own wisdom instead of seeking Your counsel. Today, I surrender my plans and intellect to Your Holy Spirit. Direct my steps and make my path clear. Amen.',
    dailyAction:
      'Write down your biggest pending decision today on paper, and write underneath: "Lord, I surrender my logic. Lead me in Your way."',
    bookId: 'PRO',
    chapter: 3,
    verse: 5,
  },
  {
    title: 'The Peace That Protects',
    verseReference: 'Philippians 4:6-7',
    verseText: 'Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God. And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.',
    verseTranslation: 'KJV',
    devotion:
      'Paul wrote these words while chained in a Roman prison, yet his heart was overflowing with unshakeable peace. The Greek word for "keep" refers to a military garrison standing guard around a city. When we bring our burdens to God with authentic thanksgiving, His divine peace stands as an armed guard at the gates of our vulnerable hearts and restless thoughts.',
    reflectionQuestion:
      'What specific blessing or past answered prayer can you thank God for right now to dispel today’s anxiety?',
    prayer:
      'Lord Jesus, I exchange my worries for Your supernatural peace. When anxiety knocks at the door of my mind, let Your thanksgiving fill my mouth. Guard my heart and mind today. Amen.',
    dailyAction:
      'Every time worry tries to enter your mind today, immediately whisper a specific sentence of thanksgiving to God.',
    bookId: 'PHP',
    chapter: 4,
    verse: 6,
  },
  {
    title: 'Rest for the Weary Soul',
    verseReference: 'Matthew 11:28-29',
    verseText: 'Come unto me, all ye that labour and are heavy laden, and I will give you rest. Take my yoke upon you, and learn of me; for I am meek and lowly in heart: and ye shall find rest unto your souls.',
    verseTranslation: 'KJV',
    devotion:
      'Weariness is not only physical exhaustion; it often touches the deepest corridors of the soul. The pressures of perfectionism, guilt, and performance can burden our hearts. Jesus does not offer us a rigid religious list; He offers us Himself. Taking His yoke means walking in lockstep with the gentle Savior, where His grace carries the weight and His love sustains our spirit.',
    reflectionQuestion:
      'What emotional or spiritual weight have you been carrying by yourself that you can hand over to Jesus today?',
    prayer:
      'Dear Jesus, I come to You tired and burdened. Thank You that You do not turn me away. I lay down my heavy burdens and receive Your gentle rest today. Restore my soul with Your loving grace. Amen.',
    dailyAction:
      'Take a short 10-minute walk outside without headphones today, speaking candidly with Christ like a dear companion.',
    bookId: 'MAT',
    chapter: 11,
    verse: 28,
  },
  {
    title: 'Renewed on Eagles’ Wings',
    verseReference: 'Isaiah 40:31',
    verseText: 'But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.',
    verseTranslation: 'KJV',
    devotion:
      'Waiting upon the Lord is never wasted time. An eagle does not soar by frantically flapping its wings; it spreads its wings and catches the rising thermal wind. Similarly, when we wait upon God in prayer and meditation, the breath of the Holy Spirit lifts us above the turbulent storms of life and provides supernatural stamina for the daily marathon.',
    reflectionQuestion:
      'Are you feeling depleted from trying to accomplish spiritual things in your own natural strength?',
    prayer:
      'Lord, I acknowledge that my human energy is limited. I wait on You today. Breathe Your Spirit into my weary bones and give me the grace to walk faithfully without fainting. In Jesus’ name, Amen.',
    dailyAction:
      'Commit to taking one 3-minute pause before every major task or meeting today to ask the Holy Spirit for divine stamina.',
    bookId: 'ISA',
    chapter: 40,
    verse: 31,
  },
  {
    title: 'Upholding Hand of God',
    verseReference: 'Isaiah 41:10',
    verseText: 'Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.',
    verseTranslation: 'KJV',
    devotion:
      'God gives five divine anchors in this single verse: "I am with thee", "I am thy God", "I will strengthen thee", "I will help thee", and "I will uphold thee". Notice that the security of your life does not depend on your weak grip on God, but on God’s mighty, righteous grip on you. He will not drop you, and He will not let the enemy overwhelm you.',
    reflectionQuestion:
      'Which of God’s five promises in Isaiah 41:10 speaks most deeply to your heart’s secret fear today?',
    prayer:
      'Father God, thank You that Your righteous right hand is holding me firmly right now. When doubt creeps in, remind me that You are beside me and that I have nothing to dread. Amen.',
    dailyAction:
      'Send an encouraging text message with Isaiah 41:10 to someone in your circle who may be walking through a season of difficulty.',
    bookId: 'ISA',
    chapter: 41,
    verse: 10,
  },
  {
    title: 'A Lamp to My Feet',
    verseReference: 'Psalm 119:105',
    verseText: 'Thy word is a lamp unto my feet, and a light unto my path.',
    verseTranslation: 'KJV',
    devotion:
      'In biblical times, foot lamps were small clay vessels providing just enough light for the very next step in the darkness. God rarely reveals the entire ten-year roadmap at once; instead, He gives us enough daily light to obey Him today. Trusting His Word means taking that single step of faith with obedience, trusting that the next beam of light will appear as we step forward.',
    reflectionQuestion:
      'What is the next clear step of obedience God has already revealed to you that you need to take today?',
    prayer:
      'Lord, thank You for the truth and illumination of Your Holy Scriptures. Give me courage not to demand tomorrow’s answers, but to walk faithfully in today’s light. Guide my footsteps, Lord. Amen.',
    dailyAction:
      'Open your Bible app and read the entire Psalm 119:101-112 today to let God’s Word illuminate your mind.',
    bookId: 'PSA',
    chapter: 119,
    verse: 105,
  },
  {
    title: 'The Great Shepherd',
    verseReference: 'Psalm 23:1-3',
    verseText: 'The LORD is my shepherd; I shall not want. He maketh me to lie down in green pastures: he leadeth me beside the still waters. He restoreth my soul.',
    verseTranslation: 'KJV',
    devotion:
      'Sheep are entirely dependent on their shepherd for guidance, nourishment, and safety. When we acknowledge that Jesus is our true Shepherd, the desperate spirit of lack vanishes: "I shall not want." Even when life forces us through dry and chaotic terrain, our Shepherd knows the exact coordinates of green pastures and quiet waters where our soul can be restored.',
    reflectionQuestion:
      'Is there an area in your schedule or mindset where your soul feels depleted and in need of the Good Shepherd’s restoration?',
    prayer:
      'Good Shepherd, thank You for caring for me with infinite gentleness. Lead me today beside Your still waters and restore the joy and vitality of my soul. I choose to follow Your voice. Amen.',
    dailyAction:
      'Set aside 10 minutes of screen-free quiet time tonight to meditate on Psalm 23 before going to sleep.',
    bookId: 'PSA',
    chapter: 23,
    verse: 1,
  },
  {
    title: 'Rooted and Grounded in Love',
    verseReference: 'Ephesians 3:17-19',
    verseText: 'That Christ may dwell in your hearts by faith; that ye, being rooted and grounded in love, may be able to comprehend with all saints what is the breadth, and length, and depth, and height; and to know the love of Christ.',
    verseTranslation: 'KJV',
    devotion:
      'Trees that withstand fierce hurricanes have root systems that dig deep into rich soil and anchor around bedrock. When our identity is rooted and grounded in the boundless love of Christ, human criticism cannot uproot us, failure cannot destroy us, and rejection cannot define us. Christ’s love is wider than our failures and deeper than our deepest regrets.',
    reflectionQuestion:
      'Are you deriving your sense of worth from temporary performance, or from the unconditional love of Jesus Christ?',
    prayer:
      'Lord Jesus, anchor my identity deeply in Your unfailing love. Let me feel the security of knowing that nothing in all creation can separate me from Your affection. Fill me with Your fullness today. Amen.',
    dailyAction:
      'Tell someone in your family or community today how deeply Christ loves them, and express your gratitude for their presence.',
    bookId: 'EPH',
    chapter: 3,
    verse: 17,
  },
  {
    title: 'The Unfailing Anchor of Hope',
    verseReference: 'Hebrews 6:19',
    verseText: 'Which hope we have as an anchor of the soul, both sure and stedfast, and which entereth into that within the veil.',
    verseTranslation: 'KJV',
    devotion:
      'An anchor is designed not for calm seas, but for violent storms. When cultural chaos, financial stress, or personal hardship threaten to drift your life onto the rocks, Christian hope anchors directly into the eternal throne room of God. Our hope is not wishful thinking; it is a rock-solid person: Jesus Christ our Lord, who has already triumphed over death and the grave.',
    reflectionQuestion:
      'In what storm or uncertainty in your life do you most need Christ to be your steadfast anchor today?',
    prayer:
      'Lord Jesus, You are the anchor of my soul. In the midst of shaking winds and shifting tides, hold me steady. I anchor my expectations, my future, and my family in Your eternal faithfulness. Amen.',
    dailyAction:
      'Whenever you feel emotionally unstable or shaken today, place your hand over your heart and whisper: "Jesus is the anchor of my soul."',
    bookId: 'HEB',
    chapter: 6,
    verse: 19,
  },
  {
    title: 'Walking in the Spirit',
    verseReference: 'Galatians 5:22-23',
    verseText: 'But the fruit of the Spirit is love, joy, peace, longsuffering, gentleness, goodness, faith, meekness, temperance: against such there is no law.',
    verseTranslation: 'KJV',
    devotion:
      'Notice that Scripture speaks of the "fruit" of the Spirit, not the "work" of the flesh. Fruit cannot be forced or manufactured through human willpower; it naturally grows when a branch remains intimately connected to the Vine. As you yield each moment of your day to the Holy Spirit, His divine character—patience in traffic, joy in trials, gentleness in conflict—will blossom in your life.',
    reflectionQuestion:
      'Which specific fruit of the Spirit is God calling you to manifest today in a challenging relationship?',
    prayer:
      'Holy Spirit, I yield my tongue, my reactions, and my heart to You. Prune away bitterness and impatience, and produce Your sweet fruit of love, joy, and peace in my conduct today. Amen.',
    dailyAction:
      'Choose one fruit of the Spirit (e.g. gentleness or patience) and make it your conscious spiritual focus for every interaction today.',
    bookId: 'GAL',
    chapter: 5,
    verse: 22,
  },
  {
    title: 'Strength for the Journey',
    verseReference: 'Joshua 1:9',
    verseText: 'Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.',
    verseTranslation: 'KJV',
    devotion:
      'Joshua stood on the banks of the Jordan River with the intimidating task of leading millions of people into uncharted territory after Moses had died. God’s counsel to Joshua was not a military strategy, but a spiritual command: "Be strong and of good courage." Courage is not the absence of fear; it is the holy conviction that God’s presence with you is infinitely greater than the obstacles before you.',
    reflectionQuestion:
      'What intimidating conversation, project, or transition is God asking you to face with holy boldness this week?',
    prayer:
      'Lord God, deliver me from timidity and paralysis. You have promised to be with me wherever I go. Clothe me with holy courage, and let me move forward in obedience knowing You go before me. Amen.',
    dailyAction:
      'Identify one task or conversation you have been procrastinating out of fear, and take direct, courageous action on it today.',
    bookId: 'JOS',
    chapter: 1,
    verse: 9,
  },
];

/**
 * Returns a deterministic, consistent Daily Devotion for any given calendar date.
 * Uses local calendar date components so every user across that calendar date receives
 * the exact same devotion throughout the entire day.
 */
export function getFallbackDevotionForDate(date: Date = new Date()): DailyDevotionItem {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;

  const startOfYear = new Date(year, 0, 1);
  const diffTime = date.getTime() - startOfYear.getTime();
  const dayOfYear = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  const base = SELA_ORIGINAL_DEVOTIONS[dayOfYear % SELA_ORIGINAL_DEVOTIONS.length];

  return {
    id: `devotion-${dateStr}`,
    date: dateStr,
    title: base.title,
    verseReference: base.verseReference,
    verseText: base.verseText,
    verseTranslation: base.verseTranslation,
    devotion: base.devotion,
    reflectionQuestion: base.reflectionQuestion,
    prayer: base.prayer,
    dailyAction: base.dailyAction,
    bookId: base.bookId,
    chapter: base.chapter,
    verse: base.verse,
  };
}
