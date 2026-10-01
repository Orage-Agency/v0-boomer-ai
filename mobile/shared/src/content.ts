/**
 * Static content datasets for Lessons, Tips, and Quick Questions.
 *
 * These mirror the web app's hard-coded content (see
 * components/boomer-ai/{lessons-tab,tips-tab,quick-questions}.tsx). The web app
 * ships this content in the bundle rather than fetching it, so the native app
 * does the same for parity, offline support, and zero extra backend work.
 *
 * TODO(owner): If you later add a CMS / backend endpoint for lessons & tips
 * (e.g. /api/lessons, /api/tips), swap these constants for a typed fetch in the
 * relevant screens. The screen components already read from typed shapes, so
 * only the data source needs to change.
 */

// ---- Lessons (video) ----

export type Lesson = {
  id: string;
  title: string;
  duration: string;
  /** Remote MP4 URL (Google Cloud Storage, same assets as the web app). */
  url: string;
  /** Suggested follow-up prompt the user can "try in chat". */
  prompt: string;
};

export const LESSONS: Lesson[] = [
  {
    id: 'ask-ai-diy',
    title: 'Ask AI and Do It Yourself',
    duration: '2 min',
    url: 'https://storage.googleapis.com/msgsndr/651kIrlKk834C2FEl66i/media/4b3e23ac-d014-420c-9189-f91877c98e5d.mp4',
    prompt:
      'How can I use AI to help me do things myself? Give me 3 practical examples I can try today!',
  },
  {
    id: 'interact-family',
    title: 'Interact with Your Family',
    duration: '3 min',
    url: 'https://storage.googleapis.com/msgsndr/651kIrlKk834C2FEl66i/media/b397f50d-34b5-461e-bc14-a19abc3b66db.mp4',
    prompt:
      'Help me find fun activities to do with my granddaughter, like playing volleyball or other games we can enjoy together!',
  },
  {
    id: 'easy-push-button',
    title: 'Easy to Use - Push a Button and Make Things Happen',
    duration: '2 min',
    url: 'https://storage.googleapis.com/msgsndr/651kIrlKk834C2FEl66i/media/bf06e1a1-37a6-46f5-9ba6-ec12a739e098.mp4',
    prompt:
      'Show me how easy it is to use AI - what are some simple things I can ask you to do right now?',
  },
  {
    id: 'sports-stats',
    title: 'Sports and Stats - Ask AI',
    duration: '4 min',
    url: 'https://storage.googleapis.com/msgsndr/651kIrlKk834C2FEl66i/media/33a0a5dc-ee0b-4eff-a9e7-a3e8bed599be.mp4',
    prompt:
      "Tell me about my favorite sports team's latest stats and what makes them special this season!",
  },
  {
    id: 'ai-new-boomers',
    title: 'AI is New to Boomers',
    duration: '3 min',
    url: 'https://storage.googleapis.com/msgsndr/651kIrlKk834C2FEl66i/media/dace82a2-eb45-4c97-8337-4e2ceb2c211f.mp4',
    prompt:
      'Explain AI to me in a way that\'s easy to understand - what is it and how can it help me in my daily life?',
  },
  {
    id: 'learn-ai-how-to',
    title: 'Learn AI and How to Use It',
    duration: '2 min',
    url: 'https://storage.googleapis.com/msgsndr/651kIrlKk834C2FEl66i/media/424fdb71-3868-4075-8785-45d414ebf5ad.mp4',
    prompt:
      'Teach me the basics of using AI effectively - what are the best ways to ask questions and get helpful answers?',
  },
];

// ---- Tips (categorized) ----

export type Tip = {
  /** Emoji icon (keeps the data dependency-free; no vector icon import). */
  emoji: string;
  title: string;
  description: string;
  /** Prompt sent to chat when the user taps "Try it". */
  prompt: string;
};

export type TipCategory = {
  id: string;
  title: string;
  tips: Tip[];
};

export const TIP_CATEGORIES: TipCategory[] = [
  {
    id: 'cyber-security',
    title: '🔒 Cyber Security',
    tips: [
      {
        emoji: '🔑',
        title: 'Strong Passwords',
        description: "Learn how to create passwords that hackers can't guess",
        prompt: 'Teach me how to create a strong password that I can actually remember.',
      },
      {
        emoji: '⚠️',
        title: 'Spot Scam Emails',
        description: 'Identify fake emails before they trick you',
        prompt: 'How can I tell if an email is a scam? What are the warning signs?',
      },
      {
        emoji: '👁️',
        title: 'Protect Your Privacy',
        description: 'Keep your personal information safe online',
        prompt: 'What information should I never share online and why?',
      },
      {
        emoji: '📶',
        title: 'Safe Wi-Fi Use',
        description: 'Stay secure when using public networks',
        prompt: 'Is it safe to use public Wi-Fi? What precautions should I take?',
      },
      {
        emoji: '🔐',
        title: 'Two-Factor Security',
        description: 'Add an extra layer of protection to your accounts',
        prompt: 'Explain two-factor authentication in simple terms. How do I set it up?',
      },
      {
        emoji: '📞',
        title: 'Recognize Phone Scams',
        description: "Don't fall for fake callers pretending to be someone else",
        prompt: "Someone called claiming to be from my bank. How do I know if it's real?",
      },
      {
        emoji: '💳',
        title: 'Safe Online Shopping',
        description: 'Shop online without worrying about fraud',
        prompt:
          'How can I shop online safely and protect my credit card information?',
      },
      {
        emoji: '📱',
        title: 'Secure Your Phone',
        description: 'Keep your smartphone protected from hackers',
        prompt:
          'What settings should I change on my phone to make it more secure?',
      },
    ],
  },
  {
    id: 'email-tips',
    title: '📧 Email Tips',
    tips: [
      {
        emoji: '✉️',
        title: 'Write Clear Emails',
        description: 'Craft messages that get responses',
        prompt:
          'Help me write a professional email to request information about a topic.',
      },
      {
        emoji: '🗂️',
        title: 'Organize Your Inbox',
        description: 'Keep your email tidy and find things fast',
        prompt: "What's the best way to organize my emails so I don't lose important ones?",
      },
      {
        emoji: '🔍',
        title: 'Find Old Emails',
        description: 'Search for messages you need quickly',
        prompt: 'How do I search for old emails in Gmail or my email app?',
      },
      {
        emoji: '📅',
        title: 'Schedule Emails',
        description: 'Send emails at the perfect time',
        prompt: 'Can I write an email now but send it later? How do I do that?',
      },
      {
        emoji: '📎',
        title: 'Handle Attachments',
        description: 'Send and receive files easily',
        prompt: 'How do I attach a photo or document to an email?',
      },
    ],
  },
  {
    id: 'voice-commands',
    title: '🎤 Voice Commands',
    tips: [
      {
        emoji: '🎙️',
        title: 'Talk to Your Phone',
        description: 'Use voice instead of typing',
        prompt: 'What voice commands can I use on my phone? Give me 5 useful examples.',
      },
      {
        emoji: '🔊',
        title: 'Voice Texting',
        description: 'Send messages without typing a word',
        prompt: 'How do I send a text message using just my voice?',
      },
      {
        emoji: '🔎',
        title: 'Voice Search',
        description: 'Find anything by asking out loud',
        prompt: 'How do I search the internet using my voice?',
      },
      {
        emoji: '📲',
        title: 'Make Calls by Voice',
        description: 'Call anyone hands-free',
        prompt: 'How do I call someone using voice commands on my phone?',
      },
      {
        emoji: '⏰',
        title: 'Set Reminders by Voice',
        description: 'Never forget important things',
        prompt: 'How do I set a reminder using just my voice?',
      },
    ],
  },
  {
    id: 'communication',
    title: '💬 Communication & Connection',
    tips: [
      {
        emoji: '💌',
        title: 'Message Writer',
        description: 'Writes texts or emails to family in a warm tone',
        prompt:
          'Write a nice text to my granddaughter to wish her good luck at college.',
      },
      {
        emoji: '📝',
        title: 'Voice-to-Text Notes',
        description: 'Converts spoken words into written reminders',
        prompt: 'Take a note: call the pharmacy tomorrow.',
      },
      {
        emoji: '🌍',
        title: 'Translation Assistant',
        description: 'Translates text or speech when traveling',
        prompt: "How do I say 'Where's the restroom?' in Spanish?",
      },
      {
        emoji: '🗣️',
        title: 'Virtual Friend Chat',
        description: 'Keeps company and chats about hobbies',
        prompt: "Let's talk about gardening today.",
      },
    ],
  },
  {
    id: 'daily-living',
    title: '🏠 Daily Living & Organization',
    tips: [
      {
        emoji: '✅',
        title: 'To-Do List Manager',
        description: 'Keeps track of errands and chores',
        prompt: "Add 'pick up groceries' to my to-do list for tomorrow.",
      },
      {
        emoji: '🛒',
        title: 'Shopping Assistant',
        description: 'Finds deals and helps compare products',
        prompt: 'Find the best deal for hearing aid batteries near me.',
      },
      {
        emoji: '📆',
        title: 'Calendar Organizer',
        description: 'Keeps track of birthdays, appointments, and bills',
        prompt: 'Remind me of my dentist appointment next Thursday at 10.',
      },
      {
        emoji: '🚗',
        title: 'Transportation Planner',
        description: 'Finds easy routes or rides',
        prompt: 'Find me a ride to the senior center at 9 a.m.',
      },
    ],
  },
  {
    id: 'learning',
    title: '💡 Learning & Entertainment',
    tips: [
      {
        emoji: '🎓',
        title: 'Learning Buddy',
        description: 'Teaches new skills or hobbies in plain English',
        prompt: 'Teach me the basics of using an iPhone camera.',
      },
      {
        emoji: '🧩',
        title: 'Trivia & Games',
        description: 'Plays word games or trivia to stay mentally sharp',
        prompt: "Let's play a memory game with famous songs from the 1970s.",
      },
      {
        emoji: '📰',
        title: 'Reading Companion',
        description: 'Reads news or books aloud',
        prompt: "Read me today's top stories about Oklahoma.",
      },
      {
        emoji: '✈️',
        title: 'AI Travel Guide',
        description: 'Plans safe senior-friendly trips',
        prompt: 'Plan a 3-day road trip around Oklahoma City with easy stops.',
      },
    ],
  },
  {
    id: 'finance',
    title: '💵 Finance & Security',
    tips: [
      {
        emoji: '🕒',
        title: 'Bill Reminder',
        description: 'Reminds you when bills are due',
        prompt: 'Remind me to pay my electric bill on the 15th.',
      },
      {
        emoji: '💳',
        title: 'Budget Helper',
        description: 'Tracks spending and suggests savings',
        prompt: "Help me see where I'm spending the most this month.",
      },
      {
        emoji: '🛡️',
        title: 'Scam Alert Coach',
        description: 'Checks suspicious emails or phone calls',
        prompt: 'Someone emailed me about a prize. Is this a scam?',
      },
      {
        emoji: '📄',
        title: 'Document Helper',
        description: 'Summarizes letters and statements in plain terms',
        prompt:
          'Explain what a Medicare summary statement means in simple terms.',
      },
    ],
  },
  {
    id: 'ai-basics',
    title: '✨ AI Basics',
    tips: [
      {
        emoji: '🔍',
        title: 'Research Anything',
        description: 'Get instant answers to your questions in simple terms',
        prompt:
          'Explain a topic to me in simple, easy-to-understand terms with examples.',
      },
      {
        emoji: '📄',
        title: 'Summarize Long Text',
        description: 'Extract key points from articles, emails, or documents',
        prompt:
          'Summarize this text in 3-5 bullet points, highlighting the most important information.',
      },
      {
        emoji: '📅',
        title: 'Plan Your Day',
        description: 'Organize tasks, appointments, and priorities',
        prompt:
          'Help me organize my day. I will list my tasks; prioritize them and suggest a schedule.',
      },
      {
        emoji: '💡',
        title: 'Get Creative Ideas',
        description: 'Brainstorm solutions, gifts, activities, or projects',
        prompt:
          'Give me 5 creative and practical ideas for a topic. Make them easy to understand and do.',
      },
      {
        emoji: '📞',
        title: 'Practice Conversations',
        description: 'Prepare scripts for calls, meetings, or difficult talks',
        prompt:
          'Help me prepare a friendly but clear script to call a company about a billing question.',
      },
    ],
  },
];

// ---- Quick Questions ----

export const QUICK_QUESTIONS: string[] = [
  'What are some easy recipes for beginners?',
  'How can I stay active at home?',
  'What are the best exercises for joint health?',
  'Can you help me find local community events?',
  'What are some tips for safe internet browsing?',
  'How can I manage my medications effectively?',
  'What are some brain games to improve memory?',
  'How do I set up video calls with family?',
  'What are the signs of common health issues?',
  'Can you suggest hobbies that are easy to start?',
  'What are some tips for improving sleep quality?',
  'How can I stay connected with friends and family?',
  'What are some fun activities with grandchildren?',
  'How do I create a budget on a fixed income?',
  'What are the benefits of meditation?',
  'Can you recommend some good books for seniors?',
  'What should I know about healthcare directives?',
  'How can I protect myself from scams?',
  'What are some easy ways to improve my diet?',
  'How can I find volunteer opportunities?',
  'What are some low-impact sports I can try?',
  'How do I access online medical resources?',
  'What are some tips for home safety?',
  'How can I maintain my independence as I age?',
  'Can you suggest local support groups?',
  'What are some ways to stay mentally sharp?',
  'How can I use social media safely?',
  'What are the benefits of joining a club?',
  'How do I navigate Medicare options?',
  'What are some healthy snacks to make at home?',
  'How can I reduce stress in my daily life?',
  'What are some good exercises for balance?',
  'How do I file my taxes as a senior?',
  'What are the best ways to manage chronic pain?',
  'How can I find a reliable handyman?',
  'What should I consider when downsizing?',
  'Tips for organizing important documents?',
  'How can I stay informed about local news?',
  'What are some good walking routes nearby?',
  'How can I improve my posture?',
  'Tips for using smartphones effectively?',
  'How can I find senior discounts?',
  'What are creative ways to stay engaged?',
  'How do I plan for long-term care?',
  'What are some fun crafts to do at home?',
  'How can I learn new technology skills?',
  'What are some tips for staying hydrated?',
  'How can I make new friends in my community?',
  'How can I make my home more accessible?',
];
