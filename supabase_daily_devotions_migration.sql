-- ========================================================
-- SELA HOLY BIBLE - DAILY DEVOTIONS MIGRATION SCRIPT
-- Run this script directly in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ========================================================

-- 1. Create Daily Devotions Catalog Table
CREATE TABLE IF NOT EXISTS public.daily_devotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE UNIQUE NOT NULL,
  title TEXT NOT NULL,
  verse_reference TEXT NOT NULL,
  verse_text TEXT NOT NULL,
  verse_translation TEXT NOT NULL DEFAULT 'KJV',
  devotion TEXT NOT NULL,
  reflection_question TEXT NOT NULL,
  prayer TEXT NOT NULL,
  daily_action TEXT NOT NULL,
  book_id VARCHAR(10),
  chapter INT,
  verse INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by calendar date
CREATE INDEX IF NOT EXISTS idx_daily_devotions_date ON public.daily_devotions(date);

-- Enable RLS for daily_devotions
ALTER TABLE public.daily_devotions ENABLE ROW LEVEL SECURITY;

-- Allow public read access (Idempotent: drop first if exists)
DROP POLICY IF EXISTS "Allow public read daily_devotions" ON public.daily_devotions;
CREATE POLICY "Allow public read daily_devotions"
  ON public.daily_devotions FOR SELECT
  USING (true);

-- 2. Create User Daily Devotions Table (Completions & Bookmarks)
CREATE TABLE IF NOT EXISTS public.user_daily_devotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  devotion_id UUID NOT NULL REFERENCES public.daily_devotions(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT TRUE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  saved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, devotion_id)
);

-- Indexes for user lookups
CREATE INDEX IF NOT EXISTS idx_user_daily_devotions_user ON public.user_daily_devotions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_daily_devotions_saved ON public.user_daily_devotions(user_id, saved);

-- Enable RLS for user_daily_devotions
ALTER TABLE public.user_daily_devotions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Idempotent: drop first if exists)
DROP POLICY IF EXISTS "Users read own daily devotions" ON public.user_daily_devotions;
CREATE POLICY "Users read own daily devotions"
  ON public.user_daily_devotions FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Users insert own daily devotions" ON public.user_daily_devotions;
CREATE POLICY "Users insert own daily devotions"
  ON public.user_daily_devotions FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Users update own daily devotions" ON public.user_daily_devotions;
CREATE POLICY "Users update own daily devotions"
  ON public.user_daily_devotions FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- 3. Seed Initial Original SELA Devotions (Idempotent UPSERT)
INSERT INTO public.daily_devotions (
  date, title, verse_reference, verse_text, verse_translation, devotion, reflection_question, prayer, daily_action, book_id, chapter, verse
) VALUES
(
  '2026-09-22',
  'Be Still and Know',
  'Psalm 46:10',
  'Be still, and know that I am God: I will be exalted among the heathen, I will be exalted in the earth.',
  'KJV',
  'In a world driven by noise, hurry, and endless striving, God offers a transformative invitation: "Be still." True stillness is not inactivity or passive resignation; it is an active surrender of our anxious control into the sovereign hands of our Creator. When we pause our inner restlessness and quiet our racing thoughts, we remember that God is reigning over every trial, circumstance, and nation. The battle belongs to Him, not to our nervous energy.',
  'What is one heavy worry or exhausting situation in your life today that God is asking you to place completely into His hands?',
  'Heavenly Father, quiet the loud voices and anxious thoughts in my mind. Teach me the holiness of sacred stillness. Help me rest confidently in Your sovereign power, knowing that You are God and You never fail. In Jesus’ name, Amen.',
  'Spend five completely quiet minutes right now with your eyes closed, breathing deeply and meditating on Psalm 46:10 before opening another app or email.',
  'PSA', 46, 10
),
(
  '2026-09-23',
  'Wholehearted Trust',
  'Proverbs 3:5-6',
  'Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.',
  'KJV',
  'Human understanding is naturally finite and often clouded by fear, assumptions, and limited vision. God’s wisdom, however, is eternal and all-knowing. Wholehearted trust means we refuse to let our fragile logic overrule God’s clear Word. When we actively involve Christ in our smallest daily decisions, He straightens the twisted paths and leads us with sovereign peace.',
  'In what area of your life are you currently leaning on your own logic rather than seeking God’s guidance in prayer?',
  'Lord God, forgive me for the times I rely on my own wisdom instead of seeking Your counsel. Today, I surrender my plans and intellect to Your Holy Spirit. Direct my steps and make my path clear. Amen.',
  'Write down your biggest pending decision today on paper, and write underneath: "Lord, I surrender my logic. Lead me in Your way."',
  'PRO', 3, 5
),
(
  '2026-09-24',
  'The Peace That Protects',
  'Philippians 4:6-7',
  'Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God. And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.',
  'KJV',
  'Paul wrote these words while chained in a Roman prison, yet his heart was overflowing with unshakeable peace. The Greek word for "keep" refers to a military garrison standing guard around a city. When we bring our burdens to God with authentic thanksgiving, His divine peace stands as an armed guard at the gates of our vulnerable hearts and restless thoughts.',
  'What specific blessing or past answered prayer can you thank God for right now to dispel today’s anxiety?',
  'Lord Jesus, I exchange my worries for Your supernatural peace. When anxiety knocks at the door of my mind, let Your thanksgiving fill my mouth. Guard my heart and mind today. Amen.',
  'Every time worry tries to enter your mind today, immediately whisper a specific sentence of thanksgiving to God.',
  'PHP', 4, 6
),
(
  '2026-09-25',
  'Rest for the Weary Soul',
  'Matthew 11:28-29',
  'Come unto me, all ye that labour and are heavy laden, and I will give you rest. Take my yoke upon you, and learn of me; for I am meek and lowly in heart: and ye shall find rest unto your souls.',
  'KJV',
  'Weariness is not only physical exhaustion; it often touches the deepest corridors of the soul. The pressures of perfectionism, guilt, and performance can burden our hearts. Jesus does not offer us a rigid religious list; He offers us Himself. Taking His yoke means walking in lockstep with the gentle Savior, where His grace carries the weight and His love sustains our spirit.',
  'What emotional or spiritual weight have you been carrying by yourself that you can hand over to Jesus today?',
  'Dear Jesus, I come to You tired and burdened. Thank You that You do not turn me away. I lay down my heavy burdens and receive Your gentle rest today. Restore my soul with Your loving grace. Amen.',
  'Take a short 10-minute walk outside without headphones today, speaking candidly with Christ like a dear companion.',
  'MAT', 11, 28
),
(
  '2026-09-26',
  'Renewed on Eagles’ Wings',
  'Isaiah 40:31',
  'But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.',
  'KJV',
  'Waiting upon the Lord is never wasted time. An eagle does not soar by frantically flapping its wings; it spreads its wings and catches the rising thermal wind. Similarly, when we wait upon God in prayer and meditation, the breath of the Holy Spirit lifts us above the turbulent storms of life and provides supernatural stamina for the daily marathon.',
  'Are you feeling depleted from trying to accomplish spiritual things in your own natural strength?',
  'Lord, I acknowledge that my human energy is limited. I wait on You today. Breathe Your Spirit into my weary bones and give me the grace to walk faithfully without fainting. In Jesus’ name, Amen.',
  'Commit to taking one 3-minute pause before every major task or meeting today to ask the Holy Spirit for divine stamina.',
  'ISA', 40, 31
),
(
  '2026-09-27',
  'Upholding Hand of God',
  'Isaiah 41:10',
  'Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.',
  'KJV',
  'God gives five divine anchors in this single verse: "I am with thee", "I am thy God", "I will strengthen thee", "I will help thee", and "I will uphold thee". Notice that the security of your life does not depend on your weak grip on God, but on God’s mighty, righteous grip on you. He will not drop you, and He will not let the enemy overwhelm you.',
  'Which of God’s five promises in Isaiah 41:10 speaks most deeply to your heart’s secret fear today?',
  'Father God, thank You that Your righteous right hand is holding me firmly right now. When doubt creeps in, remind me that You are beside me and that I have nothing to dread. Amen.',
  'Send an encouraging text message with Isaiah 41:10 to someone in your circle who may be walking through a season of difficulty.',
  'ISA', 41, 10
),
(
  '2026-09-28',
  'A Lamp to My Feet',
  'Psalm 119:105',
  'Thy word is a lamp unto my feet, and a light unto my path.',
  'KJV',
  'In biblical times, foot lamps were small clay vessels providing just enough light for the very next step in the darkness. God rarely reveals the entire ten-year roadmap at once; instead, He gives us enough daily light to obey Him today. Trusting His Word means taking that single step of faith with obedience, trusting that the next beam of light will appear as we step forward.',
  'What is the next clear step of obedience God has already revealed to you that you need to take today?',
  'Lord, thank You for the truth and illumination of Your Holy Scriptures. Give me courage not to demand tomorrow’s answers, but to walk faithfully in today’s light. Guide my footsteps, Lord. Amen.',
  'Open your Bible app and read the entire Psalm 119:101-112 today to let God’s Word illuminate your mind.',
  'PSA', 119, 105
),
(
  '2026-09-29',
  'The Great Shepherd',
  'Psalm 23:1-3',
  'The LORD is my shepherd; I shall not want. He maketh me to lie down in green pastures: he leadeth me beside the still waters. He restoreth my soul.',
  'KJV',
  'Sheep are entirely dependent on their shepherd for guidance, nourishment, and safety. When we acknowledge that Jesus is our true Shepherd, the desperate spirit of lack vanishes: "I shall not want." Even when life forces us through dry and chaotic terrain, our Shepherd knows the exact coordinates of green pastures and quiet waters where our soul can be restored.',
  'Is there an area in your schedule or mindset where your soul feels depleted and in need of the Good Shepherd’s restoration?',
  'Good Shepherd, thank You for caring for me with infinite gentleness. Lead me today beside Your still waters and restore the joy and vitality of my soul. I choose to follow Your voice. Amen.',
  'Set aside 10 minutes of screen-free quiet time tonight to meditate on Psalm 23 before going to sleep.',
  'PSA', 23, 1
),
(
  '2026-09-30',
  'Rooted and Grounded in Love',
  'Ephesians 3:17-19',
  'That Christ may dwell in your hearts by faith; that ye, being rooted and grounded in love, may be able to comprehend with all saints what is the breadth, and length, and depth, and height; and to know the love of Christ.',
  'KJV',
  'Trees that withstand fierce hurricanes have root systems that dig deep into rich soil and anchor around bedrock. When our identity is rooted and grounded in the boundless love of Christ, human criticism cannot uproot us, failure cannot destroy us, and rejection cannot define us. Christ’s love is wider than our failures and deeper than our deepest regrets.',
  'Are you deriving your sense of worth from temporary performance, or from the unconditional love of Jesus Christ?',
  'Lord Jesus, anchor my identity deeply in Your unfailing love. Let me feel the security of knowing that nothing in all creation can separate me from Your affection. Fill me with Your fullness today. Amen.',
  'Tell someone in your family or community today how deeply Christ loves them, and express your gratitude for their presence.',
  'EPH', 3, 17
),
(
  '2026-10-01',
  'The Unfailing Anchor of Hope',
  'Hebrews 6:19',
  'Which hope we have as an anchor of the soul, both sure and stedfast, and which entereth into that within the veil.',
  'KJV',
  'An anchor is designed not for calm seas, but for violent storms. When cultural chaos, financial stress, or personal hardship threaten to drift your life onto the rocks, Christian hope anchors directly into the eternal throne room of God. Our hope is not wishful thinking; it is a rock-solid person: Jesus Christ our Lord, who has already triumphed over death and the grave.',
  'In what storm or uncertainty in your life do you most need Christ to be your steadfast anchor today?',
  'Lord Jesus, You are the anchor of my soul. In the midst of shaking winds and shifting tides, hold me steady. I anchor my expectations, my future, and my family in Your eternal faithfulness. Amen.',
  'Whenever you feel emotionally unstable or shaken today, place your hand over your heart and whisper: "Jesus is the anchor of my soul."',
  'HEB', 6, 19
),
(
  '2026-10-02',
  'Walking in the Spirit',
  'Galatians 5:22-23',
  'But the fruit of the Spirit is love, joy, peace, longsuffering, gentleness, goodness, faith, meekness, temperance: against such there is no law.',
  'KJV',
  'Notice that Scripture speaks of the "fruit" of the Spirit, not the "work" of the flesh. Fruit cannot be forced or manufactured through human willpower; it naturally grows when a branch remains intimately connected to the Vine. As you yield each moment of your day to the Holy Spirit, His divine character—patience in traffic, joy in trials, gentleness in conflict—will blossom in your life.',
  'Which specific fruit of the Spirit is God calling you to manifest today in a challenging relationship?',
  'Holy Spirit, I yield my tongue, my reactions, and my heart to You. Prune away bitterness and impatience, and produce Your sweet fruit of love, joy, and peace in my conduct today. Amen.',
  'Choose one fruit of the Spirit (e.g. gentleness or patience) and make it your conscious spiritual focus for every interaction today.',
  'GAL', 5, 22
),
(
  '2026-10-03',
  'Strength for the Journey',
  'Joshua 1:9',
  'Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.',
  'KJV',
  'Joshua stood on the banks of the Jordan River with the intimidating task of leading millions of people into uncharted territory after Moses had died. God’s counsel to Joshua was not a military strategy, but a spiritual command: "Be strong and of good courage." Courage is not the absence of fear; it is the holy conviction that God’s presence with you is infinitely greater than the obstacles before you.',
  'What intimidating conversation, project, or transition is God asking you to face with holy boldness this week?',
  'Lord God, deliver me from timidity and paralysis. You have promised to be with me wherever I go. Clothe me with holy courage, and let me move forward in obedience knowing You go before me. Amen.',
  'Identify one task or conversation you have been procrastinating out of fear, and take direct, courageous action on it today.',
  'JOS', 1, 9
)
ON CONFLICT (date) DO UPDATE SET
  title = EXCLUDED.title,
  verse_reference = EXCLUDED.verse_reference,
  verse_text = EXCLUDED.verse_text,
  verse_translation = EXCLUDED.verse_translation,
  devotion = EXCLUDED.devotion,
  reflection_question = EXCLUDED.reflection_question,
  prayer = EXCLUDED.prayer,
  daily_action = EXCLUDED.daily_action,
  book_id = EXCLUDED.book_id,
  chapter = EXCLUDED.chapter,
  verse = EXCLUDED.verse,
  updated_at = NOW();
