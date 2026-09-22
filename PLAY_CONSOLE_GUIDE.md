# 🚀 Google Play Console Launch Guide: SELA Holy Bible

Complete, step-by-step submission handbook for publishing **SELA Holy Bible** on the Google Play Store.

---

## 1. Prerequisites Checklist

| Item | Status | Details |
| :--- | :---: | :--- |
| **Google Play Developer Account** | ⬜ Required | $25 one-time registration fee at [play.google.com/console](https://play.google.com/console) |
| **Android App Bundle (.aab)** | ✅ Ready | `Sela_HolyBible_v1.0.aab` in root directory |
| **Signing Keystore** | ✅ Configured | `android/app/upload-keystore.jks` (Key alias: `holybible`) |
| **Privacy Policy URL** | ✅ Ready | `https://rohithmaka.github.io/bible-app/` (from `docs/index.html`) |
| **Ad-Free Guarantee** | ✅ Verified | No ad SDKs included |

---

## 2. Store Listing Copy (Copy & Paste)

### App Name (Limit: 30 chars)
```text
SELA: Holy Bible & Devotions
```

### Short Description (Limit: 80 chars)
```text
Holy Bible in Telugu & English with Daily Devotions, 365-Day Plan & Prayer Wall.
```

### Full Description (Limit: 4000 chars)
```text
SELA is a sacred, distraction-free Holy Bible and spiritual companion designed to deepen your daily walk with God. Read Scripture in Telugu and English side-by-side, receive inspired Daily Devotions, follow a disciplined 365-Day reading journey, and join a global Community Prayer Wall.

100% Free. No Advertisements. No Distractions. Offline-Ready.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ KEY FEATURES
━━━━━━━━━━━━━━━━━━━━━━━━━━━

📖 DUAL-LANGUAGE SCRIPTURE READER
• Read the Holy Bible in Telugu and English (KJV, BBE, WEB) with seamless bilingual side-by-side or verse-by-verse view.
• Fast book, chapter, and verse navigator supporting both English and Telugu script search.
• Personalize reading with font size adjustment, line spacing, and gentle eye-comfort Sepia and Dark modes.
• Color-coded highlights, bookmarks, and personal reflection notes saved safely on your device.

🌅 DAILY DEVOTION & SCRIPTURE REFLECTION
• Start every morning with an uplifting Scripture verse, reverent devotion message, reflection question, and guided prayer.
• Maintain a holy reading streak with graceful milestone tracking.
• Complete devotions offline; progress syncs seamlessly when connected.

🗓️ 365-DAY BIBLE READING PLAN
• Journey through the entire Bible in one year with 4 balanced daily portions: Old Testament, New Testament, Psalms, and Proverbs.
• Interactive Calendar view: tap any date to reveal its reading portion.
• "Mark Today Done" tracking with clear visual indicators—green for completed days, red for missed days to keep you accountable.

🙏 SACRED PRAYER WALL & COMMUNITY BURDENS
• Maintain your private, encrypted prayer journal with answered prayer celebrations.
• Share prayer burdens anonymously or with your name on the Global Community Wall.
• Tap "🙏 I Prayed" to stand in prayerful solidarity with believers worldwide in real time.

🕊️ BUILT FOR REVERENCE & PRIVACY
• Zero third-party advertisements or commercial interruptions.
• Works 100% offline with local high-speed caching.
• Designed with holy reverence to keep your focus entirely on God's Word.
```

---

## 3. Store Assets & Graphics Specifications

| Asset | Size / Format | Where to Find / Requirements |
| :--- | :--- | :--- |
| **App Icon** | 512 x 512 px, 32-bit PNG (max 1 MB) | Exported from `assets/images/icon.png` |
| **Feature Graphic** | 1024 x 500 px, JPEG or 24-bit PNG (no transparency) | SELA gold & navy branding banner |
| **Phone Screenshots** | Min 2 (Recommended 4–6), 16:9 or 9:16 (e.g. 1080 x 2400) | 1. Dual Reader<br>2. Daily Devotion<br>3. 365-Day Calendar<br>4. Community Prayer |
| **Tablet Screenshots** | 7-inch & 10-inch (Optional but recommended) | Can use scaled phone screenshots |

---

## 4. Policy & Content Rating Declarations (Policy Checklist)

In Google Play Console, go to **Policy and Programs > App Content** and complete each questionnaire with these exact answers:

### 1. Privacy Policy
- **URL**: `https://rohithmaka.github.io/bible-app/`
- *(Tip: Enable GitHub Pages in your repository settings pointing to `/docs`)*

### 2. App Access
- Select: **"All functionality is available without special access restrictions"**
- *(No login or paywall is required to read Scripture or devotions)*

### 3. Ads Declaration
- Select: **"No, my app does not contain ads"**

### 4. Content Rating (IARC Questionnaire)
- Category: **Reference, News, or Educational** (or **Utility / Productivity**)
- Violence / Sexual content / Profanity: **No**
- Controlled substances: **No**
- Does the app allow users to interact or exchange content? **Yes** (Community Prayer Wall)
- Does the app share user physical location? **No**
- Resulting Rating: **PEGI 3 / Everyone (All ages)**

### 5. Target Audience & Content
- Target age group: **13 and older** (Select 13-15, 16-17, 18+)
- Appeal to children: **No**

### 6. News Apps
- Select: **"No, this is not a news app"**

### 7. COVID-19 Tracing / Financial / Health
- Select: **"No"** to all specialized category declarations

### 8. Data Safety Form
- Does your app collect or share user data? **Yes**
- Is data encrypted in transit? **Yes** (HTTPS / TLS)
- Can users request data deletion? **Yes**
- **Data Types Declared**:
  - **Personal Info**: Email address (Optional — only if user signs in for cloud sync).
  - **User Content**: User-generated prayer burdens / reflection notes (App functionality).
- **Is any data shared with third parties or sold?** **No**.
- **Is data used for advertising or marketing?** **No**.

---

## 5. Release Tracks & Publishing Workflow

### Step 1: Upload to Internal Testing (Instant)
1. Go to **Testing > Internal testing**.
2. Click **Create new release**.
3. Upload `Sela_HolyBible_v1.0.aab`.
4. Release name: `1.0.0 (1)`.
5. Release notes:
   ```text
   Initial release of SELA Holy Bible featuring bilingual Telugu-English Scripture, Daily Devotions, 365-Day reading plan, and Community Prayer Wall.
   ```
6. Click **Save** and **Review release**, then **Start rollout to Internal testing**.
   - *Internal testing is available immediately without Google review delays!*

### Step 2: 20-Tester Closed Testing (For Personal Developer Accounts)
> [!IMPORTANT]
> If your Google Play Developer Account was created after November 13, 2023, Google requires a minimum of **20 testers opted-in for at least 14 continuous days** before granting access to Production.

1. Go to **Testing > Closed testing**.
2. Click **Create track** > Name it **Closed Beta**.
3. In the **Testers** tab:
   - Create an email list of your 20 friends/family/church members (or create a Google Group, e.g., `sela-bible-testers@googlegroups.com`).
   - Copy the join link (Web link or Android link) and share it with your testers.
4. Create a new release in Closed testing and promote your internal `.aab`.
5. Ensure your 20 testers install the app and keep it on their phones for 14 days.

### Step 3: Apply for Production Access
- Once the 14-day testing period completes, submit the production application answering Google's short survey about feedback received.
- Roll out to **Production** to make SELA available to the entire world!
