import { BIBLE_BOOKS, SCRIPTURE_DATA, getChapterVerses, BibleBook, Verse } from '../data/bibleData';
import { getTranslationInfo } from './translationCatalog';

export const TELUGU_BOOK_NAMES: Record<string, string> = {
  GEN: 'ఆదికాండము',
  EXO: 'నిర్గమకాండము',
  LEV: 'లేవీయకాండము',
  NUM: 'సంఖ్యాకాండము',
  DEU: 'ద్వితీయోపదేశకాండము',
  JOS: 'యెహోషువ',
  JDG: 'న్యాయాధిపతులు',
  RUT: 'రూతు',
  '1SA': '1 సమూయేలు',
  '2SA': '2 సమూయేలు',
  '1KI': '1 రాజులు',
  '2KI': '2 రాజులు',
  '1CH': '1 దినవృత్తాంతములు',
  '2CH': '2 దినవృత్తాంతములు',
  EZR: 'ఎజ్రా',
  NEH: 'నెహెమ్యా',
  EST: 'ఎస్తెరు',
  JOB: 'యోబు',
  PSA: 'కీర్తనల గ్రంథము',
  PRO: 'సామెతలు',
  ECC: 'ప్రసంగి',
  SNG: 'పరమగీతము',
  ISA: 'యెషయా',
  JER: 'యిర్మియా',
  LAM: 'విలాపవాక్యములు',
  EZK: 'యెహెజ్కేలు',
  DAN: 'దానియేలు',
  HOS: 'హోషేయ',
  JOL: 'యోవేలు',
  AMO: 'ఆమోసు',
  OBD: 'ఓబద్యా',
  JNH: 'యోనా',
  MIC: 'మీకా',
  NAM: 'నహూము',
  HAB: 'హబక్కూకు',
  ZEP: 'జెఫన్యా',
  HAG: 'హగ్గయి',
  ZEC: 'జెకర్యా',
  MAL: 'మలాకీ',
  MAT: 'మత్తయి',
  MRK: 'మార్కు',
  LUK: 'లూకా',
  JHN: 'యోహాను',
  ACT: 'అపొస్తలుల కార్యములు',
  ROM: 'రోమీయులకు',
  '1CO': '1 కొరింథీయులకు',
  '2CO': '2 కొరింథీయులకు',
  GAL: 'గలతీయులకు',
  EPH: 'ఎఫెసీయులకు',
  PHP: 'ఫిలిప్పీయులకు',
  COL: 'కొలస్సీయులకు',
  '1TH': '1 థెస్సలొనీకీయులకు',
  '2TH': '2 థెస్సలొనీకీయులకు',
  '1TI': '1 తిమోతికి',
  '2TI': '2 తిమోతికి',
  TIT: 'తీతుకు',
  PHM: 'ఫిలేమోనుకు',
  HEB: 'హెబ్రీయులకు',
  JAS: 'యాకోబు',
  '1PE': '1 పేతురు',
  '2PE': '2 పేతురు',
  '1JN': '1 యోహాను',
  '2JN': '2 యోహాను',
  '3JN': '3 యోహాను',
  JUD: 'యూదా',
  REV: 'ప్రకటన గ్రంథము',
};

export const HINDI_BOOK_NAMES: Record<string, string> = {
  GEN: 'उत्पत्ति',
  EXO: 'निर्गमन',
  LEV: 'लैव्यव्यवस्था',
  NUM: 'गिनती',
  DEU: 'व्यवस्थाविवरण',
  JOS: 'यहोशू',
  JDG: 'न्यायियों',
  RUT: 'रूत',
  '1SA': '1 शमूएल',
  '2SA': '2 शमूएल',
  '1KI': '1 राजा',
  '2KI': '2 राजा',
  '1CH': '1 इतिहास',
  '2CH': '2 इतिहास',
  EZR: 'एज्रा',
  NEH: 'नहेमायाह',
  EST: 'एस्तेर',
  JOB: 'अय्यूब',
  PSA: 'भजन संहिता',
  PRO: 'नीतिवचन',
  ECC: 'सभाउपदेशक',
  SNG: 'श्रेष्ठगीत',
  ISA: 'यशायाह',
  JER: 'यिर्मयाह',
  LAM: 'विलापगीत',
  EZK: 'यहेजकेल',
  DAN: 'दानिय्येल',
  HOS: 'होशे',
  JOL: 'योएल',
  AMO: 'आमोस',
  OBD: 'ओबद्याह',
  JNH: 'योना',
  MIC: 'मीका',
  NAM: 'नहूम्',
  HAB: 'हबक्कूक',
  ZEP: 'सपन्याह',
  HAG: 'हाग्गै',
  ZEC: 'जकर्याह',
  MAL: 'मलाकी',
  MAT: 'मत्ती',
  MRK: 'मरकुस',
  LUK: 'लूका',
  JHN: 'यूहन्ना',
  ACT: 'प्रेरितों के काम',
  ROM: 'रोमियों',
  '1CO': '1 कुरिन्थियों',
  '2CO': '2 कुरिन्थियों',
  GAL: 'गलतियों',
  EPH: 'इफिसियों',
  PHP: 'फिलिप्पियों',
  COL: 'कुलुस्सियों',
  '1TH': '1 थिस्सलुनीकियों',
  '2TH': '2 थिस्सलुनीकियों',
  '1TI': '1 तीमुथियुस',
  '2TI': '2 तीमुथियुस',
  TIT: 'तीतुस',
  PHM: 'फिलेमोन',
  HEB: 'इब्रानियों',
  JAS: 'याकूब',
  '1PE': '1 पतरस',
  '2PE': '2 पतरस',
  '1JN': '1 यूहन्ना',
  '2JN': '2 यूहन्ना',
  '3JN': '3 यूहन्ना',
  JUD: 'यहूदा',
  REV: 'प्रकाशितवाक्य',
};

export const TAMIL_BOOK_NAMES: Record<string, string> = {
  GEN: 'ஆதியாகமம்',
  EXO: 'யாத்திராகமம்',
  LEV: 'லேவியராகமம்',
  NUM: 'எண்ணாகமம்',
  DEU: 'உபாகமம்',
  JOS: 'யோசுவா',
  JDG: 'நியாயாதிபதிகள்',
  RUT: 'ரூத்',
  '1SA': '1 சாமுவேல்',
  '2SA': '2 சாமுவேல்',
  '1KI': '1 இராஜாக்கள்',
  '2KI': '2 இராஜாக்கள்',
  '1CH': '1 நாளாகமம்',
  '2CH': '2 நாளாகமம்',
  EZR: 'எஸ்ரா',
  NEH: 'நெகேமியா',
  EST: 'எஸ்தர்',
  JOB: 'யோபு',
  PSA: 'சங்கீதம்',
  PRO: 'நீதிமொழிகள்',
  ECC: 'பிரசங்கி',
  SNG: 'உன்னதப்பாட்டு',
  ISA: 'ஏசாயா',
  JER: 'எரேமியா',
  LAM: 'புலம்பல்',
  EZK: 'எசேக்கியேல்',
  DAN: 'தானியேல்',
  HOS: 'ஓசியா',
  JOL: 'யோவேல்',
  AMO: 'ஆமோஸ்',
  OBD: 'ஒபதியா',
  JNH: 'யோனா',
  MIC: 'மீகா',
  NAM: 'நகூம்',
  HAB: 'ஆபகூக்',
  ZEP: 'செப்பனியா',
  HAG: 'ஆகாய்',
  ZEC: 'சகரியா',
  MAL: 'மல்கியா',
  MAT: 'மத்தேயு',
  MRK: 'மாற்கு',
  LUK: 'லூக்கா',
  JHN: 'யோவான்',
  ACT: 'அப்போஸ்தலருடைய நடபடிகள்',
  ROM: 'ரோமர்',
  '1CO': '1 கொரிந்தியர்',
  '2CO': '2 கொரிந்தியர்',
  GAL: 'கலாத்தியர்',
  EPH: 'எபேசியர்',
  PHP: 'பிலிப்பியர்',
  COL: 'கொலோசெயர்',
  '1TH': '1 தெசலோனிக்கேயர்',
  '2TH': '2 தெசலோனிக்கேயர்',
  '1TI': '1 தீமோத்தேயு',
  '2TI': '2 தீமோத்தேயு',
  TIT: 'தீத்து',
  PHM: 'பிலேமோன்',
  HEB: 'எபிரெயர்',
  JAS: 'யாக்கோபு',
  '1PE': '1 பேதுரு',
  '2PE': '2 பேதுரு',
  '1JN': '1 யோவான்',
  '2JN': '2 யோவான்',
  '3JN': '3 யோவான்',
  JUD: 'யூதா',
  REV: 'வெளிப்படுத்தின விசேஷம்',
};

export const SPANISH_BOOK_NAMES: Record<string, string> = {
  GEN: 'Génesis', EXO: 'Éxodo', LEV: 'Levítico', NUM: 'Números', DEU: 'Deuteronomio',
  JOS: 'Josué', JDG: 'Jueces', RUT: 'Rut', '1SA': '1 Samuel', '2SA': '2 Samuel',
  '1KI': '1 Reyes', '2KI': '2 Reyes', '1CH': '1 Crónicas', '2CH': '2 Crónicas',
  EZR: 'Esdras', NEH: 'Nehemías', EST: 'Ester', JOB: 'Job', PSA: 'Salmos',
  PRO: 'Proverbios', ECC: 'Eclesiastés', SNG: 'Cantares', ISA: 'Isaías', JER: 'Jeremías',
  LAM: 'Lamentaciones', EZK: 'Ezequiel', DAN: 'Daniel', HOS: 'Oseas', JOL: 'Joel',
  AMO: 'Amós', OBD: 'Abdías', JNH: 'Jonás', MIC: 'Miqueas', NAM: 'Nahúm',
  HAB: 'Habacuc', ZEP: 'Sofonías', HAG: 'Hageo', ZEC: 'Zacarías', MAL: 'Malaquías',
  MAT: 'Mateo', MRK: 'Marcos', LUK: 'Lucas', JHN: 'Juan', ACT: 'Hechos',
  ROM: 'Romanos', '1CO': '1 Corintios', '2CO': '2 Corintios', GAL: 'Gálatas', EPH: 'Efesios',
  PHP: 'Filipenses', COL: 'Colosenses', '1TH': '1 Tesalonicenses', '2TH': '2 Tesalonicenses',
  '1TI': '1 Timoteo', '2TI': '2 Timoteo', TIT: 'Tito', PHM: 'Filemón', HEB: 'Hebreos',
  JAS: 'Santiago', '1PE': '1 Pedro', '2PE': '2 Pedro', '1JN': '1 Juan', '2JN': '2 Juan',
  '3JN': '3 Juan', JUD: 'Judas', REV: 'Apocalipsis'
};

export const FRENCH_BOOK_NAMES: Record<string, string> = {
  GEN: 'Genèse', EXO: 'Exode', LEV: 'Lévitique', NUM: 'Nombres', DEU: 'Deutéronome',
  JOS: 'Josué', JDG: 'Juges', RUT: 'Ruth', '1SA': '1 Samuel', '2SA': '2 Samuel',
  '1KI': '1 Rois', '2KI': '2 Rois', '1CH': '1 Chroniques', '2CH': '2 Chroniques',
  EZR: 'Esdras', NEH: 'Néhémie', EST: 'Esther', JOB: 'Job', PSA: 'Psaumes',
  PRO: 'Proverbes', ECC: 'Ecclésiaste', SNG: 'Cantique des Cantiques', ISA: 'Ésaïe', JER: 'Jérémie',
  LAM: 'Lamentations', EZK: 'Ézéchiel', DAN: 'Daniel', HOS: 'Osée', JOL: 'Joël',
  AMO: 'Amos', OBD: 'Abdias', JNH: 'Jonas', MIC: 'Michée', NAM: 'Nahum',
  HAB: 'Habacuc', ZEP: 'Sophonie', HAG: 'Aggée', ZEC: 'Zacharie', MAL: 'Malachie',
  MAT: 'Matthieu', MRK: 'Marc', LUK: 'Luc', JHN: 'Jean', ACT: 'Actes',
  ROM: 'Romains', '1CO': '1 Corinthiens', '2CO': '2 Corinthiens', GAL: 'Galates', EPH: 'Éphésiens',
  PHP: 'Philippiens', COL: 'Colossiens', '1TH': '1 Thessaloniciens', '2TH': '2 Thessaloniciens',
  '1TI': '1 Timothée', '2TI': '2 Timothée', TIT: 'Tite', PHM: 'Philémon', HEB: 'Hébreux',
  JAS: 'Jacques', '1PE': '1 Pierre', '2PE': '2 Pierre', '1JN': '1 Jean', '2JN': '2 Jean',
  '3JN': '3 Jean', JUD: 'Jude', REV: 'Apocalypse'
};

export const GERMAN_BOOK_NAMES: Record<string, string> = {
  GEN: '1. Mose', EXO: '2. Mose', LEV: '3. Mose', NUM: '4. Mose', DEU: '5. Mose',
  JOS: 'Josua', JDG: 'Richter', RUT: 'Rut', '1SA': '1. Samuel', '2SA': '2. Samuel',
  '1KI': '1. Könige', '2KI': '2. Könige', '1CH': '1. Chronik', '2CH': '2. Chronik',
  EZR: 'Esra', NEH: 'Nehemia', EST: 'Ester', JOB: 'Hiob', PSA: 'Psalmen',
  PRO: 'Sprüche', ECC: 'Prediger', SNG: 'Hohelied', ISA: 'Jesaja', JER: 'Jeremia',
  LAM: 'Klagelieder', EZK: 'Hesekiel', DAN: 'Daniel', HOS: 'Hosea', JOL: 'Joel',
  AMO: 'Amos', OBD: 'Obadja', JNH: 'Jona', MIC: 'Micha', NAM: 'Nahum',
  HAB: 'Habakuk', ZEP: 'Zefanja', HAG: 'Haggai', ZEC: 'Sacharja', MAL: 'Maleachi',
  MAT: 'Matthäus', MRK: 'Markus', LUK: 'Lukas', JHN: 'Johannes', ACT: 'Apostelgeschichte',
  ROM: 'Römer', '1CO': '1. Korinther', '2CO': '2. Korinther', GAL: 'Galater', EPH: 'Epheser',
  PHP: 'Philipper', COL: 'Kolosser', '1TH': '1. Thessalonicher', '2TH': '2. Thessalonicher',
  '1TI': '1. Timotheus', '2TI': '2. Timotheus', TIT: 'Titus', PHM: 'Philemon', HEB: 'Hebräer',
  JAS: 'Jakobus', '1PE': '1. Petrus', '2PE': '2. Petrus', '1JN': '1. Johannes', '2JN': '2. Johannes',
  '3JN': '3. Johannes', JUD: 'Judas', REV: 'Offenbarung'
};

export const MALAYALAM_BOOK_NAMES: Record<string, string> = {
  GEN: 'ഉല്പത്തി', EXO: 'പുറപ്പാട്', LEV: 'ലേവ്യപുസ്തകം', NUM: 'സംഖ്യാപുസ്തകം', DEU: 'ആവർത്തനം',
  JOS: 'യോശുവ', JDG: 'ന്യായാധിപന്മാർ', RUT: 'രൂത്ത്', '1SA': '1 ശമൂവേൽ', '2SA': '2 ശമൂവേൽ',
  '1KI': '1 രാജാക്കന്മാർ', '2KI': '2 രാജാക്കന്മാർ', '1CH': '1 ദിനവൃത്താന്തം', '2CH': '2 ദിനവൃത്താന്തം',
  EZR: 'എസ്രാ', NEH: 'നെഹെമ്യാവു', EST: 'എസ്ഥേർ', JOB: 'ഈയ്യോബ്', PSA: 'സങ്കീർത്തനങ്ങൾ',
  PRO: 'സദൃശവാക്യങ്ങൾ', ECC: 'സഭാപ്രസംഗി', SNG: 'ഉത്തമഗീതം', ISA: 'യെശയ്യാവു', JER: 'യിരെമ്യാവു',
  LAM: 'വിലാപങ്ങൾ', EZK: 'യെഹെസ്കേൽ', DAN: 'ദാനീയേൽ', HOS: 'ഹോശേയ', JOL: 'യോവേൽ',
  AMO: 'ആമോസ്', OBD: 'ഓബദ്യാവു', JNH: 'യോനാ', MIC: 'മീഖാ', NAM: 'നഹൂം',
  HAB: 'ഹബക്കൂക്', ZEP: 'സെഫന്യാവു', HAG: 'ഹഗ്ഗായി', ZEC: 'സെഖര്യാവു', MAL: 'മലാഖി',
  MAT: 'മത്തായി', MRK: 'മർക്കൊസ്', LUK: 'ലൂക്കൊസ്', JHN: 'യോഹന്നാൻ', ACT: 'പ്രവൃത്തികൾ',
  ROM: 'റോമർ', '1CO': '1 കൊരിന്ത്യർ', '2CO': '2 കൊരിന്ത്യർ', GAL: 'ഗലാത്യർ', EPH: 'എഫെസ്യർ',
  PHP: 'ഫിലിപ്പിയർ', COL: 'കൊലൊസ്സ്യർ', '1TH': '1 തെസ്സലോനിക്യർ', '2TH': '2 തെസ്സലോനിക്യർ',
  '1TI': '1 തിമൊഥെയൊസ്', '2TI': '2 തിമൊഥെയൊസ്', TIT: 'തീത്തൊസ്', PHM: 'ഫിലേമോൻ', HEB: 'എബ്രായർ',
  JAS: 'യാക്കോബ്', '1PE': '1 പത്രൊസ്', '2PE': '2 പത്രൊസ്', '1JN': '1 യോഹന്നാൻ', '2JN': '2 യോഹന്നാൻ',
  '3JN': '3 യോഹന്നാൻ', JUD: 'യൂദാ', REV: 'വെളിപ്പാടു'
};

export const KANNADA_BOOK_NAMES: Record<string, string> = {
  GEN: 'ಆದಿಕಾಂಡ', EXO: 'ವಿಮೋಚನಾಕಾಂಡ', LEV: 'ಲೇವಿಹಾಕಾಂಡ', NUM: 'ಅರಣ್ಯಕಾಂಡ', DEU: 'ದ್ವಿತೀಯೋಪದೇಶಕಾಂಡ',
  JOS: 'ಯೆಹೋಶುವ', JDG: 'ನ್ಯಾಯಾಧಿಪತಿಗಳು', RUT: 'ರೂತಳು', '1SA': '1 ಸಮುವೇಲನು', '2SA': '2 ಸಮುವೇಲನು',
  '1KI': '1 ಅರಸುಗಳು', '2KI': '2 ಅರಸುಗಳು', '1CH': '1 ಪೂರ್ವಕಾಲದ ವೃತ್ತಾಂತ', '2CH': '2 ಪೂರ್ವಕಾಲದ ವೃತ್ತಾಂತ',
  EZR: 'ಎಜ್ರನು', NEH: 'ನೆಹೆಮ್ಯ', EST: 'ಎಸ್ತೇರಳು', JOB: 'ಯೋಬನು', PSA: 'ಕೀರ್ತನೆಗಳು',
  PRO: 'ಜ್ಞಾನೋಕ್ತಿಗಳು', ECC: 'ಪ್ರಸಂಗಿ', SNG: 'ಪರಮ ಗೀತ', ISA: 'ಯೆಶಾಯನು', JER: 'ಯೆರೆಮPlatform',
  LAM: 'ಪ್ರಲಾಪಗಳು', EZK: 'ಯೆಹೆಜ್ಕೇಲನು', DAN: 'ದಾನಿಯೇಲನು', HOS: 'ಹೋಶೇಯ', JOL: 'ಯೋವೇಲ',
  AMO: 'ಆಮೋಸ', OBD: 'ಓಬದ್ಯ', JNH: 'ಯೋನ', MIC: 'ಮೀಖಾ', NAM: 'ನಹೂಮ',
  HAB: 'ಹಬಕ್ಕೂಕ', ZEP: 'ಚೆಫನ್ಯ', HAG: 'ಹಗ್ಗಾಯ', ZEC: 'ಚಕರ್ಯ', MAL: 'ಮಲಾಕಿ',
  MAT: 'ಮತ್ತಾಯನು', MRK: 'ಮಾರ್ಕನು', LUK: 'ಲೂಕನು', JHN: 'ಯೋಹಾನನು', ACT: 'ಅಪ್ಪೊಸ್ತಲರ ಕೃತ್ಯಗಳು',
  ROM: 'ರೋಮಾಪುರದವರಿಗೆ', '1CO': '1 ಕೊರಿಂಥದವರಿಗೆ', '2CO': '2 ಕೊരിಂಥದವರಿಗೆ', GAL: 'ಗಲಾತ್ಯರಿಗೆ', EPH: 'ಎಫೆಸದವರಿಗೆ',
  PHP: 'ಫಿಲಿಪ್ಪಿಯವರಿಗೆ', COL: 'ಕೊಲೊಸ್ಸೆಯವರಿಗೆ', '1TH': '1 തെസ്സലോനിക്യർಗೆ', '2TH': '2 തെസ്സലോനിക്യർಗೆ',
  '1TI': '1 തിമൊഥെയൊസന്', '2TI': '2 തിമൊഥെയൊസന്', TIT: 'തീത്തനಿಗೆ', PHM: 'ഫിലേമോനനಿಗೆ', HEB: 'ಹಿബ്രിയರಿಗೆ',
  JAS: 'യാക്കോബനു', '1PE': '1 പത്രൊസനു', '2PE': '2 പത്രൊസനു', '1JN': '1 യോഹന്നാനു', '2JN': '2 യോഹന്നാനു',
  '3JN': '3 യോഹന്നാനു', JUD: 'യൂദനു', REV: 'ಪ್ರಕಟಣೆ'
};

/**
 * Returns localized book name matching active translation language
 */
export function getLocalizedBookName(bookId: string, languageOrTranslationId: string = 'en'): string {
  const normId = bookId.toUpperCase();
  const langKey = languageOrTranslationId.toLowerCase();

  const info = getTranslationInfo(languageOrTranslationId);
  const langCode = info ? info.languageCode.toLowerCase() : langKey;

  if (langCode === 'te' || langKey.includes('tel')) {
    if (TELUGU_BOOK_NAMES[normId]) return TELUGU_BOOK_NAMES[normId];
  }

  if (langCode === 'hi' || langKey.includes('hin')) {
    if (HINDI_BOOK_NAMES[normId]) return HINDI_BOOK_NAMES[normId];
  }

  if (langCode === 'ta' || langKey.includes('tam')) {
    if (TAMIL_BOOK_NAMES[normId]) return TAMIL_BOOK_NAMES[normId];
  }

  if (langCode === 'es' || langKey.includes('rvr') || langKey.includes('spa')) {
    if (SPANISH_BOOK_NAMES[normId]) return SPANISH_BOOK_NAMES[normId];
  }

  if (langCode === 'fr' || langKey.includes('lsg') || langKey.includes('fra')) {
    if (FRENCH_BOOK_NAMES[normId]) return FRENCH_BOOK_NAMES[normId];
  }

  if (langCode === 'de' || langKey.includes('lut') || langKey.includes('ger')) {
    if (GERMAN_BOOK_NAMES[normId]) return GERMAN_BOOK_NAMES[normId];
  }

  if (langCode === 'ml' || langKey.includes('mov') || langKey.includes('mal')) {
    if (MALAYALAM_BOOK_NAMES[normId]) return MALAYALAM_BOOK_NAMES[normId];
  }

  if (langCode === 'kn' || langKey.includes('kncl') || langKey.includes('kan')) {
    if (KANNADA_BOOK_NAMES[normId]) return KANNADA_BOOK_NAMES[normId];
  }

  const defaultBook = BIBLE_BOOKS.find((b) => b.id.toUpperCase() === normId);
  return defaultBook ? defaultBook.name : bookId;
}

export interface SearchResult {
  bookId: string;
  bookName: string;
  testament: 'OT' | 'NT';
  chapter: number;
  verse: number;
  text: string;
  matchedTerm: string;
  translationId?: string;
}

/**
 * Searches scripture verses across Old and New Testaments
 */
export function searchBible(query: string, testamentFilter?: 'ALL' | 'OT' | 'NT', translationId: string = 'KJV'): SearchResult[] {
  if (!query || query.trim().length < 2) return [];

  const cleanQuery = query.trim().toLowerCase();
  const results: SearchResult[] = [];

  const targetBooks = BIBLE_BOOKS.filter((b) => {
    if (testamentFilter === 'OT') return b.testament === 'OT';
    if (testamentFilter === 'NT') return b.testament === 'NT';
    return true;
  });

  for (const book of targetBooks) {
    const bookChapters = SCRIPTURE_DATA[book.id];
    if (bookChapters) {
      for (const [chapStr, verses] of Object.entries(bookChapters)) {
        const chapter = parseInt(chapStr, 10);
        for (const v of verses) {
          if (v.text.toLowerCase().includes(cleanQuery)) {
            results.push({
              bookId: book.id,
              bookName: book.name,
              testament: book.testament,
              chapter,
              verse: v.verse,
              text: v.text,
              matchedTerm: cleanQuery,
              translationId,
            });

            if (results.length >= 100) return results; // Max limit
          }
        }
      }
    }
  }

  return results;
}

/**
 * Parses passage reference strings like "John 3:16", "Ps 23:1", "1 Cor 13"
 */
export function parseVerseReference(refString: string): { bookId: string; bookName: string; chapter: number; verse?: number } | null {
  if (!refString) return null;
  const clean = refString.trim();

  // Pattern matching: e.g. "John 3:16" or "1 John 4:8"
  const match = clean.match(/^(\d?\s*[A-Za-z\u0C00-\u0C7F]+)\s+(\d+)(?::(\d+))?$/);
  if (!match) return null;

  const rawBook = match[1].trim().toLowerCase();
  const chapter = parseInt(match[2], 10);
  const verse = match[3] ? parseInt(match[3], 10) : undefined;

  const foundBook = BIBLE_BOOKS.find(
    (b) => b.name.toLowerCase() === rawBook || b.id.toLowerCase() === rawBook
  );

  if (!foundBook) return null;

  return {
    bookId: foundBook.id,
    bookName: foundBook.name,
    chapter: Math.min(Math.max(1, chapter), foundBook.chaptersCount),
    verse,
  };
}

/**
 * Navigation helpers to get next and previous chapter locations
 */
export function getNextChapterLocation(bookId: string, chapter: number): { bookId: string; chapter: number } | null {
  const currentBookIndex = BIBLE_BOOKS.findIndex((b) => b.id === bookId);
  if (currentBookIndex === -1) return null;

  const currentBook = BIBLE_BOOKS[currentBookIndex];
  if (chapter < currentBook.chaptersCount) {
    return { bookId, chapter: chapter + 1 };
  } else if (currentBookIndex < BIBLE_BOOKS.length - 1) {
    const nextBook = BIBLE_BOOKS[currentBookIndex + 1];
    return { bookId: nextBook.id, chapter: 1 };
  }

  return null; // End of Bible
}

export function getPrevChapterLocation(bookId: string, chapter: number): { bookId: string; chapter: number } | null {
  const currentBookIndex = BIBLE_BOOKS.findIndex((b) => b.id === bookId);
  if (currentBookIndex === -1) return null;

  if (chapter > 1) {
    return { bookId, chapter: chapter - 1 };
  } else if (currentBookIndex > 0) {
    const prevBook = BIBLE_BOOKS[currentBookIndex - 1];
    return { bookId: prevBook.id, chapter: prevBook.chaptersCount };
  }

  return null; // Start of Bible
}

/**
 * Format selected verses into copyable text, preserving required copyright & attribution notices
 */
export function formatVerseShareText(
  bookName: string,
  chapter: number,
  selectedVerses: Verse[],
  translation: string = 'KJV'
): string {
  if (selectedVerses.length === 0) return '';

  const sorted = [...selectedVerses].sort((a, b) => a.verse - b.verse);
  const verseNumbersStr = sorted.length === 1 ? `${sorted[0].verse}` : `${sorted[0].verse}-${sorted[sorted.length - 1].verse}`;

  const bodyText = sorted.map((v) => `"${v.text}"`).join('\n\n');

  // Surface required copyright attribution if applicable
  const licenseInfo = getTranslationInfo(translation);
  let legalNotice = '';
  if (licenseInfo?.attributionRequired && licenseInfo.copyrightNotice) {
    legalNotice = `\n\nAttribution: ${licenseInfo.copyrightNotice}`;
  }

  return `${bookName} ${chapter}:${verseNumbersStr} (${translation})\n\n${bodyText}${legalNotice}\n\nShared via ALTER Prayer Community`;
}
