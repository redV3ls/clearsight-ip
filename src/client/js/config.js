// Application Configuration
const APP_CONFIG = {
    API_BASE_URL: '/api/v1',
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    MAX_JOB_FILE_SIZE: 2 * 1024 * 1024, // 2MB
    ALLOWED_FILE_TYPES: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
    ],
    ANALYSIS_COOLDOWN: 30000, // 30 seconds
    LOADING_MESSAGE_INTERVAL: 2500, // 2.5 seconds
    PROGRESS_UPDATE_INTERVAL: 800 // 0.8 seconds
};

// Fun loading messages
const LOADING_MESSAGES = [
    { text: "🧠 Waking up our AI brain...", icon: "fas fa-brain" },
    { text: "📄 Reading your resume like a caffeinated HR manager...", icon: "fas fa-file-alt" },
    { text: "🔍 Hunting for hidden skills in your experience...", icon: "fas fa-search" },
    { text: "🎯 Matching you with dream jobs...", icon: "fas fa-bullseye" },
    { text: "🚀 Calculating your career trajectory...", icon: "fas fa-rocket" },
    { text: "💡 Generating brilliant insights...", icon: "fas fa-lightbulb" },
    { text: "🎨 Crafting your personalized analysis...", icon: "fas fa-palette" },
    { text: "🔮 Predicting your future success...", icon: "fas fa-crystal-ball" },
    { text: "⚡ Supercharging your job search strategy...", icon: "fas fa-bolt" },
    { text: "🎪 Putting on the final touches...", icon: "fas fa-magic" },
    { text: "🎉 Almost ready to blow your mind...", icon: "fas fa-party-horn" }
];

// Global state
const AppState = {
    currentUser: null,
    analysisInProgress: false,
    cvFile: null,
    jobFile: null,
    lastAnalysisTime: 0,
    currentMessageIndex: 0,
    progressInterval: null,
    messageInterval: null
};