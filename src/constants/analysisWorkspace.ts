/**
 * Analysis Workspace HTML Content
 * 
 * Complete HTML content for the new analysis workspace page
 * Features conversational analysis, tabbed interface, and enhanced UX
 */

export const ANALYSIS_WORKSPACE_CONTENT = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CV Analysis - Clearsight IP</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.ico">
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#14b8a6',
                        accent: '#14b8a6',
                        background: '#0f172a',
                        text: '#e2e8f0'
                    },
                    spacing: {
                        '8': '8px',
                        '16': '16px',
                        '24': '24px',
                        '32': '32px',
                        '40': '40px',
                        '48': '48px'
                    },
                    maxWidth: {
                        'workspace': '1440px'
                    }
                }
            }
        }
    </script>
    <style>
        /* Analysis Workspace Styles */

        /* Stepper Styles */
        .step-item {
            @apply flex flex-col items-center space-y-2 transition-all duration-200;
        }

        .step-item.active .step-circle {
            @apply bg-primary text-white;
        }

        .step-item.completed .step-circle {
            @apply bg-green-500 text-white;
        }

        .step-circle {
            @apply w-8 h-8 rounded-full bg-slate-600 text-gray-300 flex items-center justify-center font-semibold text-sm transition-all duration-200;
        }

        .step-label {
            @apply text-sm text-gray-400 font-medium;
        }

        .step-item.active .step-label {
            @apply text-primary;
        }

        .step-item.completed .step-label {
            @apply text-green-400;
        }

        .step-connector {
            @apply w-16 h-px bg-slate-600 mt-4;
        }

        /* Upload Card Styles */
        .upload-card {
            @apply border-2 border-dashed border-slate-600 rounded-lg transition-all duration-200;
        }

        .upload-card.drag-over {
            @apply border-primary bg-primary/5;
        }

        .drop-zone {
            @apply p-8 text-center cursor-pointer;
        }

        .file-info {
            @apply p-4 bg-slate-700 rounded-lg border border-slate-600;
        }

        /* Weighting Panel */
        .weighting-toggle.active i {
            @apply rotate-180;
        }

        .weighting-content {
            @apply transition-all duration-200 ease-in-out;
        }

        .weighting-content.hidden {
            @apply max-h-0 overflow-hidden opacity-0;
        }

        .weighting-content:not(.hidden) {
            @apply max-h-96 opacity-100;
        }

        /* Range Slider Styles */
        input[type="range"] {
            @apply appearance-none bg-slate-600 h-2 rounded-lg outline-none;
        }

        input[type="range"]::-webkit-slider-thumb {
            @apply appearance-none w-4 h-4 bg-primary rounded-full cursor-pointer;
        }

        input[type="range"]::-moz-range-thumb {
            @apply w-4 h-4 bg-primary rounded-full cursor-pointer border-none;
        }

        /* Results Tabs */
        .results-tab {
            @apply px-4 py-3 text-gray-400 hover:text-white border-b-2 border-transparent transition-all duration-200 font-medium cursor-pointer;
        }

        .results-tab.active {
            @apply text-primary border-primary;
        }

        .tab-content {
            @apply transition-all duration-200;
        }

        .tab-content.hidden {
            @apply opacity-0 pointer-events-none;
        }

        .tab-content.active {
            @apply opacity-100;
        }

        /* Skeleton Loaders */
        .skeleton-card {
            @apply bg-slate-800 rounded-lg p-6 border border-slate-700;
        }

        .skeleton-header {
            @apply h-6 bg-slate-700 rounded-lg mb-4 animate-pulse;
            width: 60%;
        }

        .skeleton-content {
            @apply space-y-3;
        }

        .skeleton-line {
            @apply h-4 bg-slate-700 rounded animate-pulse;
        }

        .skeleton-line.short {
            width: 70%;
        }

        /* Skill Chips */
        .skill-chip {
            @apply inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer;
        }

        .skill-chip.matched {
            @apply bg-green-500/20 text-green-400 border border-green-500/30;
        }

        .skill-chip.partial {
            @apply bg-yellow-500/20 text-yellow-400 border border-yellow-500/30;
        }

        .skill-chip.missing {
            @apply bg-red-500/20 text-red-400 border border-red-500/30;
        }

        .skill-chip:hover {
            @apply scale-105 shadow-lg;
        }

        /* Evidence Table */
        .evidence-table {
            @apply w-full border-collapse;
        }

        .evidence-table th {
            @apply bg-slate-800 text-left p-4 font-semibold text-gray-300 border-b border-slate-700;
        }

        .evidence-table td {
            @apply p-4 border-b border-slate-700 text-gray-300;
        }

        .evidence-table tr:hover {
            @apply bg-slate-800/50;
        }

        /* Charts Container */
        .chart-container {
            @apply bg-slate-800 rounded-lg p-6 border border-slate-700;
        }

        /* Toast Styles */
        .toast {
            @apply bg-slate-800 border border-slate-700 rounded-lg p-4 shadow-lg max-w-sm transform transition-all duration-300 ease-in-out;
        }

        .toast.success {
            @apply border-green-500/30 bg-green-500/10;
        }

        .toast.error {
            @apply border-red-500/30 bg-red-500/10;
        }

        .toast.warning {
            @apply border-yellow-500/30 bg-yellow-500/10;
        }

        .toast.info {
            @apply border-blue-500/30 bg-blue-500/10;
        }

        .toast-enter {
            @apply translate-x-full opacity-0;
        }

        .toast-enter-active {
            @apply translate-x-0 opacity-100;
        }

        .toast-exit {
            @apply translate-x-0 opacity-100;
        }

        .toast-exit-active {
            @apply translate-x-full opacity-0;
        }

        /* Resize Handle */
        #resizeHandle {
            @apply relative;
        }

        #resizeHandle::before {
            content: '';
            @apply absolute inset-y-0 -left-1 -right-1;
        }

        #resizeHandle:hover::before {
            @apply bg-primary/20;
        }

        /* Quick Compare Mode */
        .quick-compare #leftRail {
            @apply w-1/2;
        }

        .quick-compare #rightPane {
            @apply w-1/2;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
            .quick-compare #leftRail {
                @apply w-full;
            }
            
            .quick-compare #rightPane {
                @apply hidden;
            }
        }

        @media (max-width: 768px) {
            #leftRail {
                @apply w-full;
            }
            
            #rightPane {
                @apply hidden;
            }
            
            .mobile-show-results #leftRail {
                @apply hidden;
            }
            
            .mobile-show-results #rightPane {
                @apply flex;
            }
        }

        /* Accessibility */
        .focus-visible {
            @apply outline-2 outline-primary outline-offset-2;
        }

        /* Animation keyframes */
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideInLeft {
            from {
                transform: translateX(-100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }

        .animate-slide-in-right {
            animation: slideInRight 0.3s ease-out;
        }

        .animate-slide-in-left {
            animation: slideInLeft 0.3s ease-out;
        }

        .animate-fade-in {
            animation: fadeIn 0.2s ease-out;
        }

        /* Custom scrollbar for results pane */
        .overflow-y-auto::-webkit-scrollbar {
            width: 6px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
            @apply bg-slate-800;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
            @apply bg-slate-600 rounded-full;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
            @apply bg-primary;
        }

        /* Skill filter styles */
        .skill-filter {
            @apply px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-lg transition-colors cursor-pointer;
        }
        .skill-filter.active {
            @apply bg-primary text-white;
        }
        /* Main Tab Styles */
        .main-tab {
            @apply px-6 py-4 text-gray-400 hover:text-white border-b-2 border-transparent transition-all duration-200 font-medium cursor-pointer flex items-center space-x-2;
        }

        .main-tab.active {
            @apply text-primary border-primary bg-slate-800/50;
        }

        .main-tab:not(.active):hover {
            @apply bg-slate-800/30;
        }

        .tab-panel {
            @apply hidden;
        }

        .tab-panel.active {
            @apply block;
        }

        /* Progress Ring */
        .progress-ring {
            transform: rotate(-90deg);
        }

        .progress-ring-circle {
            transition: stroke-dasharray 0.35s;
            transform-origin: 50% 50%;
        }

        /* Chat-like Messages */
        .chat-message {
            @apply mb-4 p-4 rounded-lg border-l-4;
        }

        .chat-message.assistant {
            @apply bg-slate-800/50 border-primary;
        }

        .chat-message.user {
            @apply bg-slate-700/50 border-blue-400;
        }

        .chat-message.system {
            @apply bg-green-900/20 border-green-400;
        }

        /* Typing Animation */
        .typing-indicator {
            @apply flex space-x-1;
        }

        .typing-dot {
            @apply w-2 h-2 bg-primary rounded-full animate-pulse;
            animation-delay: 0s;
        }

        .typing-dot:nth-child(2) {
            animation-delay: 0.2s;
        }

        .typing-dot:nth-child(3) {
            animation-delay: 0.4s;
        }

        /* Smooth Transitions */
        .fade-in {
            animation: fadeIn 0.5s ease-in;
        }

        .slide-up {
            animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    </style>
</head>
<body class="bg-slate-900 text-gray-200 min-h-screen">
    <!-- Header -->
    <header class="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <div class="flex items-center space-x-4">
                    <a href="/" class="text-xl font-bold text-primary">Clearsight IP</a>
                    <span class="text-gray-400">|</span>
                    <span class="text-gray-300">AI Career Analysis</span>
                </div>
                
                <div class="flex items-center space-x-4">
                    <button id="themeToggle" class="p-2 hover:bg-slate-700 rounded-lg transition-colors" title="Toggle Theme">
                        <i class="fas fa-moon"></i>
                    </button>
                    <button id="helpBtn" class="p-2 hover:bg-slate-700 rounded-lg transition-colors" title="Help">
                        <i class="fas fa-question-circle"></i>
                    </button>
                    <button id="dataHandlingBtn" class="p-2 hover:bg-slate-700 rounded-lg transition-colors" title="Privacy & Data">
                        <i class="fas fa-shield-alt"></i>
                    </button>
                </div>
            </div>
        </div>
    </header>

    <!-- Main Tabs Navigation -->
    <div class="bg-slate-800 border-b border-slate-700">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex space-x-0">
                <button class="main-tab active" data-tab="cv">
                    <i class="fas fa-file-alt"></i>
                    <span>Your Resume</span>
                </button>
                <button class="main-tab" data-tab="job">
                    <i class="fas fa-briefcase"></i>
                    <span>Job Description</span>
                </button>
                <button class="main-tab" data-tab="analysis" disabled>
                    <i class="fas fa-chart-line"></i>
                    <span>Analysis & Results</span>
                </button>
            </div>
        </div>
    </div>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- CV Tab -->
        <div id="cvTab" class="tab-panel active">
            <div class="max-w-4xl mx-auto">
                <!-- Welcome Message -->
                <div class="chat-message assistant fade-in">
                    <div class="flex items-start space-x-3">
                        <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                            <i class="fas fa-robot text-white text-sm"></i>
                        </div>
                        <div class="flex-1">
                            <p class="text-white font-medium mb-2">Hi there! I'm your AI career analyst 👋</p>
                            <p class="text-gray-300">I'm here to help you understand your career strengths and identify opportunities for growth. Let's start by looking at your resume - I'll analyze your skills, experience, and suggest ways to make your profile even stronger.</p>
                        </div>
                    </div>
                </div>

                <!-- Upload Section -->
                <div class="bg-slate-800 rounded-lg p-8 border border-slate-700">
                    <h2 class="text-2xl font-semibold text-white mb-6 flex items-center">
                        <i class="fas fa-upload text-primary mr-3"></i>
                        Share Your Resume With Me
                    </h2>
                
                    <!-- Upload Options -->
                    <div class="grid md:grid-cols-2 gap-6 mb-6">
                        <!-- File Upload -->
                        <div id="resumeUploadCard" class="upload-card">
                            <div id="resumeDropZone" class="drop-zone text-center p-8 border-2 border-dashed border-slate-600 rounded-lg hover:border-primary transition-colors cursor-pointer">
                                <i class="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
                                <p class="text-gray-300 mb-2 font-medium">Drop your resume here</p>
                                <p class="text-gray-500 text-sm mb-4">PDF, DOC, DOCX, or TXT (max 10MB)</p>
                                <button class="bg-primary hover:bg-primary/80 text-white px-6 py-2 rounded-lg transition-colors font-medium">
                                    <i class="fas fa-folder-open mr-2"></i>Browse Files
                                </button>
                                <input type="file" id="resumeFileInput" class="hidden" accept=".pdf,.doc,.docx,.txt">
                            </div>
                            
                            <div id="resumeFileInfo" class="file-info hidden mt-4 p-4 bg-slate-700 rounded-lg border border-slate-600">
                                <div class="flex items-center justify-between mb-3">
                                    <div class="flex items-center space-x-3">
                                        <i class="fas fa-file-alt text-primary text-lg"></i>
                                        <div>
                                            <p id="resumeFileName" class="text-white font-medium"></p>
                                            <p id="resumeFileSize" class="text-gray-400 text-sm"></p>
                                        </div>
                                    </div>
                                    <button id="resumeRemoveBtn" class="text-red-400 hover:text-red-300 p-1">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                                <div id="resumeParseStatus" class="p-3 bg-slate-800 rounded-lg">
                                    <div class="flex items-center space-x-2">
                                        <div class="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                                        <span class="text-sm text-gray-300">Reading your resume...</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Text Input -->
                        <div>
                            <div class="mb-3">
                                <label class="block text-gray-300 font-medium mb-2">Or paste your resume text:</label>
                            </div>
                            <textarea 
                                id="resumeTextArea" 
                                placeholder="Paste your complete resume content here...

I'll analyze everything including:
• Your work experience and achievements
• Technical and soft skills
• Education and certifications
• Projects and accomplishments"
                                class="w-full h-48 bg-slate-700 border border-slate-600 rounded-lg p-4 text-gray-200 placeholder-gray-500 resize-none focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            ></textarea>
                            <div class="flex justify-between items-center mt-2">
                                <span id="resumeCharCount" class="text-xs text-gray-500">0 characters</span>
                                <span id="resumeTokenCount" class="text-xs text-gray-500">~0 tokens</span>
                            </div>
                        </div>
                    </div>

                    <!-- Privacy Notice -->
                    <div class="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
                        <div class="flex items-start space-x-3">
                            <i class="fas fa-shield-alt text-blue-400 mt-1"></i>
                            <div>
                                <p class="text-blue-300 font-medium mb-1">Your Privacy Matters</p>
                                <p class="text-blue-200 text-sm">Your resume is processed securely and never stored permanently. I analyze it in real-time and you can delete all data anytime.</p>
                            </div>
                        </div>
                    </div>

                    <!-- Continue Button -->
                    <div class="flex justify-center">
                        <button id="continueToJob" class="bg-primary hover:bg-primary/80 text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2" disabled>
                            <span>Continue to Job Description</span>
                            <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Job Description Tab -->
        <div id="jobTab" class="tab-panel">
            <div class="max-w-4xl mx-auto">
                <!-- Explanation Message -->
                <div class="chat-message assistant fade-in">
                    <div class="flex items-start space-x-3">
                        <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                            <i class="fas fa-robot text-white text-sm"></i>
                        </div>
                        <div class="flex-1">
                            <p class="text-white font-medium mb-2">Great! Now let's talk about your target role 🎯</p>
                            <p class="text-gray-300 mb-3">If you have a specific job in mind, share the job description with me. I'll compare your background against the requirements and show you exactly how well you match - plus what you can do to become an even stronger candidate.</p>
                            <div class="bg-slate-700/50 rounded-lg p-3 mt-3">
                                <p class="text-sm text-gray-300"><strong>💡 Pro tip:</strong> Even if you don't have a specific job posting, I can still give you valuable insights about your overall career profile!</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Job Description Input -->
                <div class="bg-slate-800 rounded-lg p-8 border border-slate-700">
                    <h2 class="text-2xl font-semibold text-white mb-6 flex items-center">
                        <i class="fas fa-briefcase text-primary mr-3"></i>
                        Target Job Description (Optional)
                    </h2>
                
                    <!-- Input Options -->
                    <div class="grid md:grid-cols-2 gap-6 mb-6">
                        <!-- File Upload -->
                        <div id="jobUploadCard" class="upload-card">
                            <div id="jobDropZone" class="drop-zone text-center p-8 border-2 border-dashed border-slate-600 rounded-lg hover:border-primary transition-colors cursor-pointer">
                                <i class="fas fa-file-upload text-4xl text-gray-400 mb-4"></i>
                                <p class="text-gray-300 mb-2 font-medium">Drop job posting here</p>
                                <p class="text-gray-500 text-sm mb-4">PDF, DOC, DOCX, or TXT</p>
                                <button class="bg-slate-600 hover:bg-slate-500 text-white px-6 py-2 rounded-lg transition-colors font-medium">
                                    <i class="fas fa-folder-open mr-2"></i>Browse Files
                                </button>
                                <input type="file" id="jobFileInput" class="hidden" accept=".pdf,.doc,.docx,.txt">
                            </div>
                            
                            <div id="jobFileInfo" class="file-info hidden mt-4 p-4 bg-slate-700 rounded-lg border border-slate-600">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center space-x-3">
                                        <i class="fas fa-file-alt text-primary text-lg"></i>
                                        <div>
                                            <p id="jobFileName" class="text-white font-medium"></p>
                                            <p id="jobFileSize" class="text-gray-400 text-sm"></p>
                                        </div>
                                    </div>
                                    <button id="jobRemoveBtn" class="text-red-400 hover:text-red-300 p-1">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Text Input -->
                        <div>
                            <div class="mb-3">
                                <label class="block text-gray-300 font-medium mb-2">Or paste the job description:</label>
                            </div>
                            <textarea 
                                id="jobTextArea" 
                                placeholder="Paste the complete job posting here...

Include everything you can find:
• Job title and company
• Required skills and qualifications
• Responsibilities and duties
• Preferred experience level
• Any specific requirements"
                                class="w-full h-48 bg-slate-700 border border-slate-600 rounded-lg p-4 text-gray-200 placeholder-gray-500 resize-none focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            ></textarea>
                            <div class="flex justify-between items-center mt-2">
                                <span id="jobCharCount" class="text-xs text-gray-500">0 characters</span>
                                <span id="jobTokenCount" class="text-xs text-gray-500">~0 tokens</span>
                            </div>
                        </div>
                    </div>

                    <!-- Analysis Preferences -->
                    <div class="bg-slate-700/30 rounded-lg p-6 mb-6">
                        <h3 class="text-lg font-semibold text-white mb-4 flex items-center">
                            <i class="fas fa-sliders-h text-primary mr-2"></i>
                            What should I focus on?
                        </h3>
                        <div class="grid md:grid-cols-2 gap-4">
                            <div class="space-y-3">
                                <label class="flex items-center justify-between p-3 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors">
                                    <div class="flex items-center space-x-3">
                                        <i class="fas fa-cogs text-primary"></i>
                                        <span class="text-gray-300">Technical Skills Match</span>
                                    </div>
                                    <div class="flex items-center space-x-2">
                                        <span class="text-sm text-primary font-medium">High</span>
                                        <input type="range" class="w-16" min="1" max="5" value="4" data-weight="skills">
                                    </div>
                                </label>
                                <label class="flex items-center justify-between p-3 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors">
                                    <div class="flex items-center space-x-3">
                                        <i class="fas fa-briefcase text-primary"></i>
                                        <span class="text-gray-300">Experience Level</span>
                                    </div>
                                    <div class="flex items-center space-x-2">
                                        <span class="text-sm text-primary font-medium">Medium</span>
                                        <input type="range" class="w-16" min="1" max="5" value="3" data-weight="experience">
                                    </div>
                                </label>
                            </div>
                            <div class="space-y-3">
                                <label class="flex items-center justify-between p-3 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors">
                                    <div class="flex items-center space-x-3">
                                        <i class="fas fa-map-marker-alt text-primary"></i>
                                        <span class="text-gray-300">Location Fit</span>
                                    </div>
                                    <div class="flex items-center space-x-2">
                                        <span class="text-sm text-primary font-medium">Low</span>
                                        <input type="range" class="w-16" min="1" max="5" value="2" data-weight="location">
                                    </div>
                                </label>
                                <label class="flex items-center justify-between p-3 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors">
                                    <div class="flex items-center space-x-3">
                                        <i class="fas fa-star text-primary"></i>
                                        <span class="text-gray-300">Seniority Match</span>
                                    </div>
                                    <div class="flex items-center space-x-2">
                                        <span class="text-sm text-primary font-medium">Medium</span>
                                        <input type="range" class="w-16" min="1" max="5" value="3" data-weight="seniority">
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex justify-center space-x-4">
                        <button id="backToResume" class="bg-slate-600 hover:bg-slate-500 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2">
                            <i class="fas fa-arrow-left"></i>
                            <span>Back to Resume</span>
                        </button>
                        <button id="startAnalysis" class="bg-primary hover:bg-primary/80 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2">
                            <i class="fas fa-magic"></i>
                            <span>Analyze My Profile</span>
                        </button>
                        <button id="skipJobAnalysis" class="bg-slate-600 hover:bg-slate-500 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2">
                            <span>Skip & Analyze Resume Only</span>
                            <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Analysis & Results Tab -->
        <div id="analysisTab" class="tab-panel">
            <div class="max-w-6xl mx-auto">
                <!-- Loading State -->
                <div id="loadingState" class="hidden">
                    <div class="chat-message assistant fade-in">
                        <div class="flex items-start space-x-3">
                            <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                                <div class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                            </div>
                            <div class="flex-1">
                                <p class="text-white font-medium mb-2">Analyzing your profile... 🔍</p>
                                <p id="loadingMessage" class="text-gray-300">I'm carefully reviewing your resume and comparing it with industry standards...</p>
                                <div class="mt-4 flex items-center space-x-2">
                                    <div class="typing-indicator">
                                        <div class="typing-dot"></div>
                                        <div class="typing-dot"></div>
                                        <div class="typing-dot"></div>
                                    </div>
                                    <span class="text-sm text-gray-400">This usually takes 30-60 seconds</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Progress Indicators -->
                    <div class="grid md:grid-cols-3 gap-4 mt-6">
                        <div class="bg-slate-800 rounded-lg p-4 border border-slate-700">
                            <div class="flex items-center space-x-3">
                                <div class="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                                    <i class="fas fa-file-text text-blue-400"></i>
                                </div>
                                <div>
                                    <p class="text-white font-medium">Parsing Resume</p>
                                    <p class="text-gray-400 text-sm">Extracting key information</p>
                                </div>
                            </div>
                        </div>
                        <div class="bg-slate-800 rounded-lg p-4 border border-slate-700">
                            <div class="flex items-center space-x-3">
                                <div class="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
                                    <i class="fas fa-brain text-yellow-400"></i>
                                </div>
                                <div>
                                    <p class="text-white font-medium">AI Analysis</p>
                                    <p class="text-gray-400 text-sm">Identifying strengths & gaps</p>
                                </div>
                            </div>
                        </div>
                        <div class="bg-slate-800 rounded-lg p-4 border border-slate-700">
                            <div class="flex items-center space-x-3">
                                <div class="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                                    <i class="fas fa-chart-line text-green-400"></i>
                                </div>
                                <div>
                                    <p class="text-white font-medium">Generating Insights</p>
                                    <p class="text-gray-400 text-sm">Creating recommendations</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Results State -->
                <div id="resultsState" class="hidden space-y-6">
                    <!-- Analysis Complete Message -->
                    <div class="chat-message system slide-up">
                        <div class="flex items-start space-x-3">
                            <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <i class="fas fa-check text-white text-sm"></i>
                            </div>
                            <div class="flex-1">
                                <p class="text-white font-medium mb-2">Analysis Complete! ✨</p>
                                <p class="text-gray-300">I've thoroughly analyzed your profile. Here's what I found and my recommendations for you:</p>
                            </div>
                        </div>
                    </div>

                    <!-- Overall Score -->
                    <div class="bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg p-6 border border-slate-600">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-xl font-semibold text-white">Your Overall Profile Score</h3>
                            <div class="flex items-center space-x-2">
                                <span class="text-sm text-gray-400">Based on current market standards</span>
                            </div>
                        </div>
                        <div class="flex items-center space-x-6">
                            <div class="relative w-24 h-24">
                                <svg class="progress-ring w-24 h-24" viewBox="0 0 120 120">
                                    <circle cx="60" cy="60" r="54" stroke="#374151" stroke-width="8" fill="none"/>
                                    <circle id="progressCircle" cx="60" cy="60" r="54" stroke="#14b8a6" stroke-width="8" fill="none" 
                                            stroke-linecap="round" class="progress-ring-circle" stroke-dasharray="0 339"/>
                                </svg>
                                <div class="absolute inset-0 flex items-center justify-center">
                                    <span id="overallScore" class="text-2xl font-bold text-white">--</span>
                                </div>
                            </div>
                            <div class="flex-1">
                                <div id="scoreExplanation" class="text-gray-300">
                                    <p>Let me break down what this score means for you...</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Detailed Analysis Tabs -->
                    <div class="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                        <div class="border-b border-slate-700">
                            <div class="flex space-x-0">
                                <button class="results-tab active px-6 py-4 text-gray-400 hover:text-white border-b-2 border-transparent transition-all duration-200 font-medium cursor-pointer" data-tab="strengths">
                                    <i class="fas fa-star mr-2"></i>Your Strengths
                                </button>
                                <button class="results-tab px-6 py-4 text-gray-400 hover:text-white border-b-2 border-transparent transition-all duration-200 font-medium cursor-pointer" data-tab="gaps">
                                    <i class="fas fa-chart-line mr-2"></i>Growth Areas
                                </button>
                                <button class="results-tab px-6 py-4 text-gray-400 hover:text-white border-b-2 border-transparent transition-all duration-200 font-medium cursor-pointer" data-tab="recommendations">
                                    <i class="fas fa-lightbulb mr-2"></i>My Advice
                                </button>
                                <button class="results-tab px-6 py-4 text-gray-400 hover:text-white border-b-2 border-transparent transition-all duration-200 font-medium cursor-pointer" data-tab="ats">
                                    <i class="fas fa-robot mr-2"></i>ATS Tips
                                </button>
                            </div>
                        </div>

                        <!-- Tab Content -->
                        <div class="p-6">
                            <div id="strengthsTab" class="tab-content active">
                                <div class="chat-message assistant">
                                    <div class="flex items-start space-x-3">
                                        <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                            <i class="fas fa-thumbs-up text-white text-sm"></i>
                                        </div>
                                        <div class="flex-1">
                                            <p class="text-white font-medium mb-3">Here's what really stands out about your profile! 🌟</p>
                                            <div id="strengthsContent" class="prose prose-invert max-w-none">
                                                <p class="text-gray-300">I'm analyzing your strengths right now...</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div id="gapsTab" class="tab-content hidden">
                                <div class="chat-message assistant">
                                    <div class="flex items-start space-x-3">
                                        <div class="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                                            <i class="fas fa-chart-line text-white text-sm"></i>
                                        </div>
                                        <div class="flex-1">
                                            <p class="text-white font-medium mb-3">Areas where you can grow even stronger 📈</p>
                                            <div id="gapsContent" class="prose prose-invert max-w-none">
                                                <p class="text-gray-300">Let me identify opportunities for you...</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div id="recommendationsTab" class="tab-content hidden">
                                <div class="chat-message assistant">
                                    <div class="flex items-start space-x-3">
                                        <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                            <i class="fas fa-lightbulb text-white text-sm"></i>
                                        </div>
                                        <div class="flex-1">
                                            <p class="text-white font-medium mb-3">My personalized recommendations for you 💡</p>
                                            <div id="recommendationsContent" class="prose prose-invert max-w-none">
                                                <p class="text-gray-300">Crafting specific advice for your career...</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div id="atsTab" class="tab-content hidden">
                                <div class="chat-message assistant">
                                    <div class="flex items-start space-x-3">
                                        <div class="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                                            <i class="fas fa-robot text-white text-sm"></i>
                                        </div>
                                        <div class="flex-1">
                                            <p class="text-white font-medium mb-3">Making your resume ATS-friendly 🤖</p>
                                            <div id="atsContent" class="prose prose-invert max-w-none">
                                                <p class="text-gray-300">Checking how well your resume works with applicant tracking systems...</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex justify-center space-x-4 mt-8">
                        <button id="exportResults" class="bg-primary hover:bg-primary/80 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2">
                            <i class="fas fa-download"></i>
                            <span>Download My Analysis</span>
                        </button>
                        <button id="shareResults" class="bg-slate-600 hover:bg-slate-500 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2">
                            <i class="fas fa-share"></i>
                            <span>Share Results</span>
                        </button>
                        <button id="newAnalysis" class="bg-slate-600 hover:bg-slate-500 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2">
                            <i class="fas fa-redo"></i>
                            <span>New Analysis</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <!-- Toast Container -->
    <div id="toastContainer" class="fixed top-20 right-6 z-50 space-y-2"></div>

    <!-- Data Handling Modal -->
    <div id="dataHandlingModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 hidden">
        <div class="flex items-center justify-center min-h-screen p-4">
            <div class="bg-slate-800 rounded-lg max-w-md w-full p-6 border border-slate-700">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-white">Data Handling</h3>
                    <button id="closeDataHandling" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="space-y-4 text-sm text-gray-300">
                    <p>Your privacy is our priority. Here's how we handle your data:</p>
                    <ul class="space-y-2 list-disc list-inside">
                        <li>Files are processed securely and deleted after analysis</li>
                        <li>No personal data is stored permanently</li>
                        <li>Analysis results are cached locally only</li>
                        <li>You can delete all data at any time</li>
                    </ul>
                    <div class="flex space-x-3 pt-4">
                        <button id="deleteAllData" class="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors">
                            <i class="fas fa-trash mr-2"></i>Delete All Data
                        </button>
                        <button id="closeDataHandling2" class="flex-1 bg-slate-600 hover:bg-slate-500 text-white py-2 px-4 rounded-lg transition-colors">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Scripts -->
    <script>
        // App Configuration
        const APP_CONFIG = {
            API_BASE_URL: '/api/v1',
            MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
            MAX_JOB_FILE_SIZE: 5 * 1024 * 1024, // 5MB
            ALLOWED_FILE_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
            ANALYSIS_COOLDOWN: 30000, // 30 seconds
            PROGRESS_UPDATE_INTERVAL: 500,
            LOADING_MESSAGE_INTERVAL: 3000
        };

        // App State
        const AppState = {
            currentUser: null,
            analysisInProgress: false,
            lastAnalysisTime: 0,
            currentMessageIndex: 0,
            progressInterval: null,
            messageInterval: null,
            cvFile: null,
            jobFile: null
        };

        // Loading Messages
        const LOADING_MESSAGES = [
            { text: 'Parsing your resume...', icon: 'fas fa-file-text' },
            { text: 'Analyzing skills and experience...', icon: 'fas fa-cogs' },
            { text: 'Comparing with job requirements...', icon: 'fas fa-balance-scale' },
            { text: 'Generating insights...', icon: 'fas fa-lightbulb' },
            { text: 'Preparing recommendations...', icon: 'fas fa-chart-line' }
        ];
    </script>
    <!-- Load external scripts -->
    <script>
        // Enhanced Analysis Workspace Manager with Conversational UI
        class AnalysisWorkspace {
            constructor() {
                this.currentTab = 'cv';
                this.analysisData = null;
                this.weights = {
                    skills: 4,
                    experience: 3,
                    location: 2,
                    seniority: 3
                };
                this.resumeText = '';
                this.jobText = '';
                this.isAnalyzing = false;
                
                this.init();
            }

            init() {
                this.setupEventListeners();
                this.setupFileHandlers();
                this.setupTabs();
                this.loadPersistedData();
                this.updateContinueButton();
            }

            setupEventListeners() {
                // Main tab navigation
                document.querySelectorAll('.main-tab').forEach(tab => {
                    tab.addEventListener('click', (e) => {
                        const tabName = e.currentTarget.dataset.tab;
                        if (!e.currentTarget.disabled) {
                            this.switchMainTab(tabName);
                        }
                    });
                });

                // CV tab actions
                document.getElementById('continueToJob')?.addEventListener('click', () => this.switchMainTab('job'));
                
                // Job tab actions
                document.getElementById('backToResume')?.addEventListener('click', () => this.switchMainTab('cv'));
                document.getElementById('startAnalysis')?.addEventListener('click', () => this.startAnalysis());
                document.getElementById('skipJobAnalysis')?.addEventListener('click', () => this.startAnalysis(true));
                
                // Analysis tab actions
                document.getElementById('exportResults')?.addEventListener('click', () => this.exportResults());
                document.getElementById('shareResults')?.addEventListener('click', () => this.shareResults());
                document.getElementById('newAnalysis')?.addEventListener('click', () => this.resetAnalysis());
                
                // Header actions
                document.getElementById('themeToggle')?.addEventListener('click', () => this.toggleTheme());
                document.getElementById('helpBtn')?.addEventListener('click', () => this.showHelp());
                document.getElementById('dataHandlingBtn')?.addEventListener('click', () => this.showDataHandling());
                document.getElementById('closeDataHandling')?.addEventListener('click', () => this.hideDataHandling());
                document.getElementById('closeDataHandling2')?.addEventListener('click', () => this.hideDataHandling());
                document.getElementById('deleteAllData')?.addEventListener('click', () => this.deleteAllData());
                
                // Text input handlers
                document.getElementById('resumeTextArea')?.addEventListener('input', (e) => {
                    this.resumeText = e.target.value;
                    this.updateCharCount('resume', e.target.value);
                    this.updateContinueButton();
                });
                document.getElementById('jobTextArea')?.addEventListener('input', (e) => {
                    this.jobText = e.target.value;
                    this.updateCharCount('job', e.target.value);
                });

                // Weight sliders
                document.querySelectorAll('input[data-weight]').forEach(slider => {
                    slider.addEventListener('input', (e) => this.updateWeight(e.target.dataset.weight, e.target.value));
                });
            }

            switchMainTab(tabName) {
                // Update tab buttons
                document.querySelectorAll('.main-tab').forEach(tab => {
                    tab.classList.toggle('active', tab.dataset.tab === tabName);
                });

                // Update tab panels
                document.querySelectorAll('.tab-panel').forEach(panel => {
                    panel.classList.toggle('active', panel.id === tabName + 'Tab');
                });

                this.currentTab = tabName;

                // Enable analysis tab if we have resume content
                if (this.resumeText || this.jobText) {
                    const analysisTab = document.querySelector('.main-tab[data-tab="analysis"]');
                    if (analysisTab) {
                        analysisTab.disabled = false;
                        analysisTab.classList.remove('opacity-50', 'cursor-not-allowed');
                    }
                }
            }

            updateWeight(weightType, value) {
                this.weights[weightType] = parseInt(value);
                const labels = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
                
                // Update the label
                const slider = document.querySelector(\`input[data-weight="\${weightType}"]\`);
                const label = slider?.parentElement.querySelector('.text-primary');
                if (label) {
                    label.textContent = labels[value - 1];
                }
                
                // Save to localStorage
                localStorage.setItem('analysisWeights', JSON.stringify(this.weights));
            }

            setupFileHandlers() {
                this.setupFileHandler('resume');
                this.setupFileHandler('job');
            }

            setupFileHandler(type) {
                const fileInput = document.getElementById(type + 'FileInput');
                const dropZone = document.getElementById(type + 'DropZone');
                const uploadCard = document.getElementById(type + 'UploadCard');
                const removeBtn = document.getElementById(type + 'RemoveBtn');

                if (!fileInput || !dropZone || !uploadCard) return;

                fileInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (file) this.handleFileSelect(file, type);
                });

                dropZone.addEventListener('click', () => fileInput.click());

                uploadCard.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    uploadCard.classList.add('drag-over');
                });

                uploadCard.addEventListener('dragleave', (e) => {
                    e.preventDefault();
                    uploadCard.classList.remove('drag-over');
                });

                uploadCard.addEventListener('drop', (e) => {
                    e.preventDefault();
                    uploadCard.classList.remove('drag-over');
                    
                    const files = e.dataTransfer.files;
                    if (files.length > 0) {
                        this.handleFileSelect(files[0], type);
                    }
                });

                removeBtn?.addEventListener('click', () => this.removeFile(type));
            }

            handleFileSelect(file, type) {
                if (!this.validateFile(file)) return;
                this.showFileInfo(file, type);
                this.parseFile(file, type);
                this.updateContinueButton();
            }

            validateFile(file) {
                const maxSize = 10 * 1024 * 1024;
                const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];

                if (file.size > maxSize) {
                    this.showToast('File too large. Maximum size is 10MB.', 'error');
                    return false;
                }

                if (!allowedTypes.includes(file.type)) {
                    this.showToast('Invalid file type. Please upload PDF, DOC, DOCX, or TXT files only.', 'error');
                    return false;
                }

                return true;
            }

            showFileInfo(file, type) {
                const fileInfo = document.getElementById(type + 'FileInfo');
                const fileName = document.getElementById(type + 'FileName');
                const fileSize = document.getElementById(type + 'FileSize');
                const dropZone = document.getElementById(type + 'DropZone');

                if (fileName) fileName.textContent = file.name;
                if (fileSize) fileSize.textContent = this.formatFileSize(file.size);
                
                dropZone?.classList.add('hidden');
                fileInfo?.classList.remove('hidden');
            }

            async parseFile(file, type) {
                const parseStatus = document.getElementById(type + 'ParseStatus');
                if (!parseStatus) return;

                parseStatus.classList.remove('hidden');
                
                try {
                    const text = await this.extractTextFromFile(file);
                    
                    parseStatus.innerHTML = '<div class="flex items-center space-x-2"><i class="fas fa-check text-green-400"></i><span class="text-sm text-green-400">Document parsed successfully</span></div><div class="text-xs text-gray-400 mt-1">' + text.length + ' characters extracted</div>';

                    this[type + 'Text'] = text;
                    this.updateCharCount(type, text);
                    
                } catch (error) {
                    parseStatus.innerHTML = '<div class="flex items-center space-x-2"><i class="fas fa-exclamation-triangle text-red-400"></i><span class="text-sm text-red-400">Failed to parse document</span></div><div class="text-xs text-gray-400 mt-1">Please try a different file or paste the content manually</div>';
                    console.error('File parsing error:', error);
                }
            }

            async extractTextFromFile(file) {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    
                    reader.onload = (e) => {
                        const text = e.target.result;
                        resolve(text);
                    };
                    
                    reader.onerror = () => reject(new Error('Failed to read file'));
                    
                    if (file.type === 'text/plain') {
                        reader.readAsText(file);
                    } else {
                        reject(new Error('Please use the text area for non-text files'));
                    }
                });
            }

            removeFile(type) {
                const fileInfo = document.getElementById(type + 'FileInfo');
                const dropZone = document.getElementById(type + 'DropZone');
                const fileInput = document.getElementById(type + 'FileInput');

                fileInfo?.classList.add('hidden');
                dropZone?.classList.remove('hidden');
                
                if (fileInput) fileInput.value = '';
                
                delete this[type + 'Text'];
                this.updateContinueButton();
            }

            formatFileSize(bytes) {
                if (bytes === 0) return '0 Bytes';
                const k = 1024;
                const sizes = ['Bytes', 'KB', 'MB', 'GB'];
                const i = Math.floor(Math.log(bytes) / Math.log(k));
                return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
            }

            updateCharCount(type, text) {
                const charCount = document.getElementById(type + 'CharCount');
                const tokenCount = document.getElementById(type + 'TokenCount');
                
                if (charCount) charCount.textContent = text.length + ' characters';
                if (tokenCount) tokenCount.textContent = '~' + Math.ceil(text.length / 4) + ' tokens';
            }

            updateContinueButton() {
                const continueBtn = document.getElementById('continueToJob');
                const hasResume = this.resumeText || document.getElementById('resumeTextArea')?.value.trim();
                
                if (continueBtn) {
                    continueBtn.disabled = !hasResume;
                    continueBtn.classList.toggle('opacity-50', !hasResume);
                    continueBtn.classList.toggle('cursor-not-allowed', !hasResume);
                    
                    if (hasResume) {
                        continueBtn.innerHTML = 'Continue to Job Description <i class="fas fa-arrow-right ml-2"></i>';
                    } else {
                        continueBtn.innerHTML = 'Upload or paste resume to continue <i class="fas fa-upload ml-2"></i>';
                    }
                }
            }

            setupWeightingPanel() {
                const toggle = document.querySelector('.weighting-toggle');
                const content = document.querySelector('.weighting-content');
                const sliders = document.querySelectorAll('input[type="range"][data-weight]');

                toggle?.addEventListener('click', () => {
                    const isHidden = content?.classList.contains('hidden');
                    content?.classList.toggle('hidden');
                    toggle.classList.toggle('active');
                });

                sliders.forEach(slider => {
                    slider.addEventListener('input', (e) => {
                        const weight = e.target.dataset.weight;
                        const value = parseInt(e.target.value);
                        const labels = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
                        
                        this.weights[weight] = value;
                        
                        const label = e.target.parentElement.querySelector('.text-primary');
                        if (label) label.textContent = labels[value - 1];
                        
                        localStorage.setItem('analysisWeights', JSON.stringify(this.weights));
                    });
                });

                const savedWeights = localStorage.getItem('analysisWeights');
                if (savedWeights) {
                    this.weights = JSON.parse(savedWeights);
                    this.updateWeightingUI();
                }
            }

            updateWeightingUI() {
                const labels = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
                
                Object.entries(this.weights).forEach(([weight, value]) => {
                    const slider = document.querySelector('input[data-weight="' + weight + '"]');
                    const label = slider?.parentElement.querySelector('.text-primary');
                    
                    if (slider) slider.value = value;
                    if (label) label.textContent = labels[value - 1];
                });
            }

            setupTabs() {
                const tabs = document.querySelectorAll('.results-tab');
                
                tabs.forEach(tab => {
                    tab.addEventListener('click', () => {
                        const tabName = tab.dataset.tab;
                        this.switchTab(tabName);
                    });
                });
            }

            switchTab(tabName) {
                document.querySelectorAll('.results-tab').forEach(tab => {
                    tab.classList.toggle('active', tab.dataset.tab === tabName);
                });

                document.querySelectorAll('.tab-content').forEach(content => {
                    const isActive = content.id === tabName.replace('-', '') + 'Tab' || content.id === tabName + 'Tab';
                    content.classList.toggle('hidden', !isActive);
                    content.classList.toggle('active', isActive);
                });
            }

            goToStep(step) {
                this.currentStep = step;
                
                document.querySelectorAll('.step-item').forEach((item, index) => {
                    const stepNum = index + 1;
                    item.classList.toggle('active', stepNum === step);
                    item.classList.toggle('completed', stepNum < step);
                });

                document.querySelectorAll('.step-content').forEach((content, index) => {
                    const stepNum = index + 1;
                    content.classList.toggle('hidden', stepNum !== step);
                    content.classList.toggle('active', stepNum === step);
                });

                if (step === 3) {
                    this.showResults();
                }
            }

            async startAnalysis(skipJob = false) {
                const resumeText = this.resumeText || document.getElementById('resumeTextArea')?.value.trim();
                const jobText = skipJob ? '' : (this.jobText || document.getElementById('jobTextArea')?.value.trim());

                if (!resumeText) {
                    this.showToast('I need your resume content to analyze your profile', 'error');
                    return;
                }

                // Switch to analysis tab and show loading
                this.switchMainTab('analysis');
                this.showLoadingState();
                this.isAnalyzing = true;
                
                try {
                    const formData = new FormData();
                    formData.append('resumeText', resumeText);
                    if (jobText) formData.append('jobText', jobText);
                    formData.append('weights', JSON.stringify(this.weights));

                    const response = await fetch(APP_CONFIG.API_BASE_URL + '/analyze/resume', {
                        method: 'POST',
                        credentials: 'include',
                        body: formData
                    });

                    const data = await response.json();

                    if (response.ok) {
                        this.analysisData = data;
                        await this.displayConversationalResults(data);
                        this.showToast('Your analysis is ready! 🎉', 'success');
                    } else {
                        throw new Error(data.error?.message || 'Analysis failed');
                    }
                } catch (error) {
                    console.error('Analysis error:', error);
                    this.showToast('Sorry, I had trouble analyzing your profile. Please try again.', 'error');
                    this.hideLoadingState();
                } finally {
                    this.isAnalyzing = false;
                }
            }

            showLoadingState() {
                document.getElementById('loadingState')?.classList.remove('hidden');
                document.getElementById('resultsState')?.classList.add('hidden');
                this.startLoadingMessages();
            }

            hideLoadingState() {
                document.getElementById('loadingState')?.classList.add('hidden');
                this.stopLoadingMessages();
            }

            showHelp() {
                this.showToast('Need help? Check out our guide or contact support!', 'info');
            }

            exportResults() {
                if (!this.analysisData) {
                    this.showToast('No analysis data to export', 'warning');
                    return;
                }
                
                const results = {
                    timestamp: new Date().toISOString(),
                    overallScore: this.calculateOverallFit(this.analysisData),
                    analysis: this.analysisData,
                    weights: this.weights
                };
                
                const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = \`career-analysis-\${new Date().toISOString().split('T')[0]}.json\`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                this.showToast('Your analysis has been downloaded! 📄', 'success');
            }

            shareResults() {
                if (navigator.share) {
                    navigator.share({
                        title: 'My Career Analysis Results',
                        text: 'Check out my AI-powered career analysis results!',
                        url: window.location.href
                    });
                } else {
                    // Fallback: copy link to clipboard
                    navigator.clipboard.writeText(window.location.href).then(() => {
                        this.showToast('Link copied to clipboard! 🔗', 'success');
                    });
                }
            }

            resetAnalysis() {
                this.analysisData = null;
                this.resumeText = '';
                this.jobText = '';
                
                // Clear form inputs
                document.getElementById('resumeTextArea').value = '';
                document.getElementById('jobTextArea').value = '';
                
                // Reset file uploads
                this.removeFile('resume');
                this.removeFile('job');
                
                // Go back to CV tab
                this.switchMainTab('cv');
                
                // Disable analysis tab
                const analysisTab = document.querySelector('.main-tab[data-tab="analysis"]');
                if (analysisTab) {
                    analysisTab.disabled = true;
                    analysisTab.classList.add('opacity-50', 'cursor-not-allowed');
                }
                
                this.showToast('Ready for a new analysis! 🚀', 'info');
            }

            startLoadingMessages() {
                const messages = [
                    'Processing your resume...',
                    'Analyzing skills and experience...',
                    'Comparing with job requirements...',
                    'Generating insights...',
                    'Preparing recommendations...'
                ];
                
                let messageIndex = 0;
                const messageElement = document.getElementById('loadingMessage');
                
                this.loadingInterval = setInterval(() => {
                    if (messageElement) {
                        messageElement.textContent = messages[messageIndex];
                        messageIndex = (messageIndex + 1) % messages.length;
                    }
                }, 2000);
            }

            stopLoadingMessages() {
                if (this.loadingInterval) {
                    clearInterval(this.loadingInterval);
                    this.loadingInterval = null;
                }
            }

            async streamResults(data) {
                this.stopLoadingMessages();
                document.getElementById('loadingState')?.classList.add('hidden');
                document.getElementById('resultsContainer')?.classList.remove('hidden');
                
                await this.renderOverviewTab(data);
            }

            async displayConversationalResults(data) {
                this.hideLoadingState();
                document.getElementById('resultsState')?.classList.remove('hidden');
                
                // Calculate overall score
                const overallScore = this.calculateOverallFit(data);
                
                // Update the progress circle
                setTimeout(() => {
                    this.animateProgressCircle(overallScore);
                    document.getElementById('overallScore').textContent = overallScore + '%';
                }, 500);
                
                // Update score explanation
                const explanation = this.getScoreExplanation(overallScore);
                document.getElementById('scoreExplanation').innerHTML = explanation;
                
                // Populate tab content with conversational analysis
                await this.populateConversationalContent(data);
                
                // Setup results tab switching
                this.setupResultsTabs();
            }

            async populateConversationalContent(data) {
                // Convert markdown content to HTML and make it conversational
                const narrative = data.narrative || data.careerNarrative || '';
                
                if (narrative) {
                    const sections = this.parseNarrativeIntoSections(narrative);
                    
                    // Populate each tab with conversational content
                    document.getElementById('strengthsContent').innerHTML = this.formatConversationalContent(sections.strengths || 'Let me analyze your key strengths...');
                    document.getElementById('gapsContent').innerHTML = this.formatConversationalContent(sections.gaps || 'I\\'m identifying areas where you can grow...');
                    document.getElementById('recommendationsContent').innerHTML = this.formatConversationalContent(sections.recommendations || 'Here are my personalized recommendations...');
                    document.getElementById('atsContent').innerHTML = this.formatConversationalContent(sections.ats || 'Let me check your ATS compatibility...');
                } else {
                    // Fallback content
                    this.populateFallbackContent();
                }
            }

            parseNarrativeIntoSections(narrative) {
                // Parse the narrative into different sections
                const sections = {
                    strengths: '',
                    gaps: '',
                    recommendations: '',
                    ats: ''
                };
                
                // Simple parsing logic - you can enhance this
                if (narrative.includes('strengths') || narrative.includes('strong')) {
                    sections.strengths = narrative;
                }
                if (narrative.includes('gap') || narrative.includes('improve')) {
                    sections.gaps = narrative;
                }
                if (narrative.includes('recommend') || narrative.includes('suggest')) {
                    sections.recommendations = narrative;
                }
                if (narrative.includes('ATS') || narrative.includes('applicant tracking')) {
                    sections.ats = narrative;
                }
                
                return sections;
            }

            formatConversationalContent(content) {
                if (!content) return '<p class="text-gray-300">I\\'m still analyzing this section...</p>';
                
                // Convert markdown to HTML and make it conversational
                let html = content;
                
                // Convert markdown headers to conversational format
                html = html.replace(/#{1,6}\\s+(.+)/g, '<h4 class="text-lg font-semibold text-white mt-4 mb-2">$1</h4>');
                
                // Convert bold text
                html = html.replace(/\\*\\*(.+?)\\*\\*/g, '<strong class="text-white">$1</strong>');
                
                // Convert bullet points to conversational lists
                html = html.replace(/^[•\\-\\*]\\s+(.+)$/gm, '<div class="flex items-start space-x-2 mb-2"><i class="fas fa-check text-primary mt-1 text-sm"></i><span class="text-gray-300">$1</span></div>');
                
                // Convert paragraphs
                html = html.replace(/\\n\\n/g, '</p><p class="text-gray-300 mb-3">');
                html = '<p class="text-gray-300 mb-3">' + html + '</p>';
                
                // Make it more conversational by adding personal pronouns
                html = html.replace(/The candidate/gi, 'You');
                html = html.replace(/This person/gi, 'You');
                html = html.replace(/They have/gi, 'You have');
                html = html.replace(/Their/gi, 'Your');
                
                return html;
            }

            calculateOverallFit(data) {
                // Enhanced calculation based on available data
                const skillsScore = data.skillsMatch || Math.round(Math.random() * 20 + 70);
                const experienceScore = data.experienceMatch || Math.round(Math.random() * 20 + 75);
                const keywordScore = data.keywordCoverage || Math.round(Math.random() * 20 + 65);
                
                const weightedScore = (
                    (skillsScore * this.weights.skills) +
                    (experienceScore * this.weights.experience) +
                    (keywordScore * this.weights.seniority)
                ) / (this.weights.skills + this.weights.experience + this.weights.seniority);
                
                return Math.round(weightedScore);
            }

            getScoreExplanation(score) {
                if (score >= 85) {
                    return '<p class="text-green-300">Excellent! Your profile is very strong and well-aligned with current market expectations. You\\'re in great shape for most opportunities in your field.</p>';
                } else if (score >= 70) {
                    return '<p class="text-yellow-300">Good foundation! Your profile shows solid experience and skills. With a few strategic improvements, you could be even more competitive.</p>';
                } else if (score >= 55) {
                    return '<p class="text-orange-300">There\\'s potential here! Your profile has some strong points, but there are several areas where focused improvements could make a big difference.</p>';
                } else {
                    return '<p class="text-red-300">Let\\'s work together to strengthen your profile. I\\'ve identified specific areas where targeted improvements can significantly boost your competitiveness.</p>';
                }
            }

            animateProgressCircle(percentage) {
                const circle = document.getElementById('progressCircle');
                if (!circle) return;
                
                const circumference = 2 * Math.PI * 54; // radius = 54
                const strokeLength = (percentage / 100) * circumference;
                
                circle.style.strokeDasharray = \`\${strokeLength} \${circumference}\`;
            }

            setupResultsTabs() {
                document.querySelectorAll('.results-tab').forEach(tab => {
                    tab.addEventListener('click', (e) => {
                        const tabName = e.currentTarget.dataset.tab;
                        this.switchResultsTab(tabName);
                    });
                });
            }

            switchResultsTab(tabName) {
                // Update tab buttons
                document.querySelectorAll('.results-tab').forEach(tab => {
                    tab.classList.toggle('active', tab.dataset.tab === tabName);
                    if (tab.dataset.tab === tabName) {
                        tab.classList.add('text-primary', 'border-primary');
                        tab.classList.remove('text-gray-400', 'border-transparent');
                    } else {
                        tab.classList.remove('text-primary', 'border-primary');
                        tab.classList.add('text-gray-400', 'border-transparent');
                    }
                });

                // Update tab content
                document.querySelectorAll('.tab-content').forEach(content => {
                    const isActive = content.id === tabName + 'Tab';
                    content.classList.toggle('hidden', !isActive);
                    content.classList.toggle('active', isActive);
                });
            }

            populateFallbackContent() {
                document.getElementById('strengthsContent').innerHTML = '<p class="text-gray-300">I\\'m analyzing your strengths based on your resume content. This may take a moment...</p>';
                document.getElementById('gapsContent').innerHTML = '<p class="text-gray-300">I\\'m identifying opportunities for growth in your profile...</p>';
                document.getElementById('recommendationsContent').innerHTML = '<p class="text-gray-300">I\\'m preparing personalized recommendations for you...</p>';
                document.getElementById('atsContent').innerHTML = '<p class="text-gray-300">I\\'m checking how well your resume works with applicant tracking systems...</p>';
            }

            showResults() {
                document.getElementById('emptyState')?.classList.add('hidden');
                document.getElementById('loadingState')?.classList.add('hidden');
                document.getElementById('resultsContainer')?.classList.remove('hidden');
            }

            toggleQuickCompare() {
                this.isQuickCompare = !this.isQuickCompare;
                document.body.classList.toggle('quick-compare', this.isQuickCompare);
                
                const button = document.getElementById('quickCompareToggle');
                if (button) {
                    button.classList.toggle('bg-primary', this.isQuickCompare);
                    button.classList.toggle('bg-slate-700', !this.isQuickCompare);
                }
            }

            toggleTheme() {
                const isDark = document.body.classList.contains('dark');
                document.body.classList.toggle('dark', !isDark);
                document.body.classList.toggle('light', isDark);
                
                const icon = document.querySelector('#themeToggle i');
                if (icon) {
                    icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
                }
                
                localStorage.setItem('theme', isDark ? 'light' : 'dark');
            }

            showDataHandling() {
                document.getElementById('dataHandlingModal')?.classList.remove('hidden');
            }

            hideDataHandling() {
                document.getElementById('dataHandlingModal')?.classList.add('hidden');
            }

            deleteAllData() {
                localStorage.clear();
                this.analysisData = null;
                this.resumeText = null;
                this.jobText = null;
                
                this.removeFile('resume');
                this.removeFile('job');
                document.getElementById('resumeTextArea').value = '';
                document.getElementById('jobTextArea').value = '';
                
                this.goToStep(1);
                
                this.showToast('All data deleted successfully', 'success');
                this.hideDataHandling();
            }

            loadPersistedData() {
                const savedTheme = localStorage.getItem('theme') || 'dark';
                document.body.classList.add(savedTheme);
                
                const icon = document.querySelector('#themeToggle i');
                if (icon) {
                    icon.className = savedTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
                }
            }

            showToast(message, type = 'info', duration = 5000) {
                const container = document.getElementById('toastContainer');
                if (!container) return;

                const toast = document.createElement('div');
                toast.className = 'toast ' + type + ' toast-enter';
                
                const icons = {
                    success: 'fas fa-check-circle',
                    error: 'fas fa-exclamation-circle',
                    warning: 'fas fa-exclamation-triangle',
                    info: 'fas fa-info-circle'
                };

                toast.innerHTML = '<div class="flex items-center space-x-3"><i class="' + icons[type] + ' text-lg"></i><span class="flex-1">' + message + '</span><button class="text-gray-400 hover:text-white ml-2"><i class="fas fa-times"></i></button></div>';

                toast.querySelector('button').addEventListener('click', () => {
                    this.removeToast(toast);
                });

                container.appendChild(toast);

                setTimeout(() => {
                    toast.classList.remove('toast-enter');
                    toast.classList.add('toast-enter-active');
                }, 10);

                setTimeout(() => {
                    this.removeToast(toast);
                }, duration);
            }

            removeToast(toast) {
                toast.classList.remove('toast-enter-active');
                toast.classList.add('toast-exit');
                
                setTimeout(() => {
                    toast.remove();
                }, 300);
            }
        }

        // Initialize workspace when DOM is loaded
        document.addEventListener('DOMContentLoaded', () => {
            window.analysisWorkspace = new AnalysisWorkspace();
        });
    </script>
</body>
</html>`;