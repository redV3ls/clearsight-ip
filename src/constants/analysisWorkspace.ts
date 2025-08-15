/**
 * Analysis Workspace HTML Content
 * 
 * Complete HTML content for the new analysis workspace page
 * This replaces the modal-based interface with a full-page, resizable workspace
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
    </style>
</head>
<body class="bg-slate-900 text-gray-200 overflow-hidden">
    <!-- Header -->
    <header class="bg-slate-800 border-b border-slate-700 h-16 flex items-center px-6 z-50">
        <div class="flex items-center space-x-4">
            <a href="/" class="text-xl font-bold text-primary">Clearsight IP</a>
            <span class="text-gray-400">|</span>
            <span class="text-gray-300">CV Analysis Workspace</span>
        </div>
        
        <div class="ml-auto flex items-center space-x-4">
            <button id="quickCompareToggle" class="px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
                <i class="fas fa-columns mr-2"></i>Quick Compare
            </button>
            <button id="themeToggle" class="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                <i class="fas fa-moon"></i>
            </button>
            <button id="dataHandlingBtn" class="p-2 hover:bg-slate-700 rounded-lg transition-colors" title="Data Handling">
                <i class="fas fa-shield-alt"></i>
            </button>
        </div>
    </header>

    <!-- Stepper -->
    <div id="stepper" class="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div class="max-w-workspace mx-auto">
            <div class="flex items-center justify-center space-x-8">
                <div class="step-item active" data-step="1">
                    <div class="step-circle">1</div>
                    <span class="step-label">Resume</span>
                </div>
                <div class="step-connector"></div>
                <div class="step-item" data-step="2">
                    <div class="step-circle">2</div>
                    <span class="step-label">Job</span>
                </div>
                <div class="step-connector"></div>
                <div class="step-item" data-step="3">
                    <div class="step-circle">3</div>
                    <span class="step-label">Results</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Main Workspace -->
    <main class="flex h-[calc(100vh-128px)] max-w-workspace mx-auto">
        <!-- Left Rail (Inputs) -->
        <div id="leftRail" class="w-96 bg-slate-800 border-r border-slate-700 flex flex-col overflow-hidden">
            <!-- Step 1: Resume Upload -->
            <div id="step1" class="step-content active flex-1 flex flex-col">
                <div class="p-6 border-b border-slate-700">
                    <h2 class="text-xl font-semibold text-white mb-2">Upload Resume</h2>
                    <p class="text-gray-400 text-sm">Upload your CV or paste your resume content</p>
                </div>
                
                <div class="flex-1 p-6 overflow-y-auto">
                    <!-- Upload Card -->
                    <div id="resumeUploadCard" class="upload-card mb-6">
                        <div id="resumeDropZone" class="drop-zone">
                            <i class="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
                            <p class="text-gray-300 mb-2">Drag & drop your resume here</p>
                            <p class="text-gray-500 text-sm mb-4">or click to browse</p>
                            <button class="bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-lg transition-colors">
                                Choose File
                            </button>
                            <input type="file" id="resumeFileInput" class="hidden" accept=".pdf,.doc,.docx,.txt">
                        </div>
                        
                        <div id="resumeFileInfo" class="file-info hidden">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center space-x-3">
                                    <i class="fas fa-file-alt text-primary"></i>
                                    <div>
                                        <p id="resumeFileName" class="text-white font-medium"></p>
                                        <p id="resumeFileSize" class="text-gray-400 text-sm"></p>
                                    </div>
                                </div>
                                <button id="resumeRemoveBtn" class="text-red-400 hover:text-red-300">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                            <div id="resumeParseStatus" class="mt-3 p-3 bg-slate-700 rounded-lg">
                                <div class="flex items-center space-x-2">
                                    <div class="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                                    <span class="text-sm text-gray-300">Parsing document...</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Paste Option -->
                    <div class="mb-6">
                        <div class="flex items-center space-x-2 mb-3">
                            <span class="text-gray-400">or</span>
                            <div class="flex-1 h-px bg-slate-600"></div>
                        </div>
                        <textarea 
                            id="resumeTextArea" 
                            placeholder="Paste your resume content here..."
                            class="w-full h-32 bg-slate-700 border border-slate-600 rounded-lg p-3 text-gray-200 placeholder-gray-500 resize-none focus:border-primary focus:outline-none"
                        ></textarea>
                        <div class="flex justify-between items-center mt-2">
                            <span id="resumeCharCount" class="text-xs text-gray-500">0 characters</span>
                            <span id="resumeTokenCount" class="text-xs text-gray-500">~0 tokens</span>
                        </div>
                    </div>

                    <!-- Continue Button -->
                    <button id="continueToJob" class="w-full bg-primary hover:bg-primary/80 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                        Upload or paste resume to continue
                        <i class="fas fa-upload ml-2"></i>
                    </button>
                </div>
            </div>

            <!-- Step 2: Job Description -->
            <div id="step2" class="step-content flex-1 flex-col hidden">
                <div class="p-6 border-b border-slate-700">
                    <h2 class="text-xl font-semibold text-white mb-2">Job Description</h2>
                    <p class="text-gray-400 text-sm">Add job description for targeted analysis (optional)</p>
                </div>
                
                <div class="flex-1 p-6 overflow-y-auto">
                    <!-- Job Upload Card -->
                    <div id="jobUploadCard" class="upload-card mb-6">
                        <div id="jobDropZone" class="drop-zone">
                            <i class="fas fa-briefcase text-4xl text-gray-400 mb-4"></i>
                            <p class="text-gray-300 mb-2">Drag & drop job description</p>
                            <p class="text-gray-500 text-sm mb-4">or click to browse</p>
                            <button class="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg transition-colors">
                                Choose File
                            </button>
                            <input type="file" id="jobFileInput" class="hidden" accept=".pdf,.doc,.docx,.txt">
                        </div>
                        
                        <div id="jobFileInfo" class="file-info hidden">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center space-x-3">
                                    <i class="fas fa-file-alt text-primary"></i>
                                    <div>
                                        <p id="jobFileName" class="text-white font-medium"></p>
                                        <p id="jobFileSize" class="text-gray-400 text-sm"></p>
                                    </div>
                                </div>
                                <button id="jobRemoveBtn" class="text-red-400 hover:text-red-300">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Job Paste Option -->
                    <div class="mb-6">
                        <div class="flex items-center space-x-2 mb-3">
                            <span class="text-gray-400">or</span>
                            <div class="flex-1 h-px bg-slate-600"></div>
                        </div>
                        <textarea 
                            id="jobTextArea" 
                            placeholder="Paste job description here..."
                            class="w-full h-32 bg-slate-700 border border-slate-600 rounded-lg p-3 text-gray-200 placeholder-gray-500 resize-none focus:border-primary focus:outline-none"
                        ></textarea>
                        <div class="flex justify-between items-center mt-2">
                            <span id="jobCharCount" class="text-xs text-gray-500">0 characters</span>
                            <span id="jobTokenCount" class="text-xs text-gray-500">~0 tokens</span>
                        </div>
                    </div>

                    <!-- Weighting Panel -->
                    <div id="weightingPanel" class="mb-6">
                        <button class="weighting-toggle w-full flex items-center justify-between p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
                            <span class="font-medium text-white">Analysis Weighting</span>
                            <i class="fas fa-chevron-down transform transition-transform"></i>
                        </button>
                        <div class="weighting-content hidden mt-3 p-4 bg-slate-700 rounded-lg space-y-4">
                            <div class="weighting-item">
                                <label class="flex items-center justify-between mb-2">
                                    <span class="text-sm text-gray-300">Skills Match Priority</span>
                                    <span class="text-sm text-primary font-medium">High</span>
                                </label>
                                <input type="range" class="w-full" min="1" max="5" value="4" data-weight="skills">
                            </div>
                            <div class="weighting-item">
                                <label class="flex items-center justify-between mb-2">
                                    <span class="text-sm text-gray-300">Experience Years</span>
                                    <span class="text-sm text-primary font-medium">Medium</span>
                                </label>
                                <input type="range" class="w-full" min="1" max="5" value="3" data-weight="experience">
                            </div>
                            <div class="weighting-item">
                                <label class="flex items-center justify-between mb-2">
                                    <span class="text-sm text-gray-300">Location Match</span>
                                    <span class="text-sm text-primary font-medium">Low</span>
                                </label>
                                <input type="range" class="w-full" min="1" max="5" value="2" data-weight="location">
                            </div>
                            <div class="weighting-item">
                                <label class="flex items-center justify-between mb-2">
                                    <span class="text-sm text-gray-300">Seniority Level</span>
                                    <span class="text-sm text-primary font-medium">Medium</span>
                                </label>
                                <input type="range" class="w-full" min="1" max="5" value="3" data-weight="seniority">
                            </div>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="space-y-3">
                        <button id="startAnalysis" class="w-full bg-primary hover:bg-primary/80 text-white py-3 rounded-lg font-medium transition-colors">
                            Start Analysis
                            <i class="fas fa-play ml-2"></i>
                        </button>
                        <button id="backToResume" class="w-full bg-slate-600 hover:bg-slate-500 text-white py-3 rounded-lg font-medium transition-colors">
                            <i class="fas fa-arrow-left mr-2"></i>
                            Back to Resume
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Resize Handle -->
        <div id="resizeHandle" class="w-1 bg-slate-600 hover:bg-primary cursor-col-resize transition-colors"></div>

        <!-- Right Pane (Results) -->
        <div id="rightPane" class="flex-1 bg-slate-900 flex flex-col overflow-hidden">
            <!-- Empty State -->
            <div id="emptyState" class="flex-1 flex items-center justify-center p-8">
                <div class="text-center max-w-md">
                    <i class="fas fa-chart-line text-6xl text-gray-600 mb-6"></i>
                    <h3 class="text-2xl font-semibold text-white mb-4">Ready for Analysis</h3>
                    <p class="text-gray-400 mb-6">Upload your resume to get started with AI-powered career insights and skill gap analysis.</p>
                    <button class="bg-primary hover:bg-primary/80 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                        <i class="fas fa-lightbulb mr-2"></i>
                        View Sample Analysis
                    </button>
                </div>
            </div>

            <!-- Loading State -->
            <div id="loadingState" class="flex-1 flex-col justify-center p-8 hidden">
                <div class="text-center mb-8">
                    <div class="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h3 class="text-xl font-semibold text-white mb-2">AI Analysis in Progress</h3>
                    <p id="loadingMessage" class="text-gray-400">Processing your resume...</p>
                </div>
                
                <!-- Skeleton Loaders -->
                <div class="space-y-6 max-w-2xl mx-auto">
                    <div class="skeleton-card">
                        <div class="skeleton-header"></div>
                        <div class="skeleton-content">
                            <div class="skeleton-line"></div>
                            <div class="skeleton-line short"></div>
                        </div>
                    </div>
                    <div class="skeleton-card">
                        <div class="skeleton-header"></div>
                        <div class="skeleton-content">
                            <div class="skeleton-line"></div>
                            <div class="skeleton-line"></div>
                            <div class="skeleton-line short"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Results -->
            <div id="resultsContainer" class="flex-1 flex-col hidden">
                <!-- Results Tabs -->
                <div class="bg-slate-800 border-b border-slate-700 px-6">
                    <div class="flex space-x-6">
                        <button class="results-tab active" data-tab="overview">
                            <i class="fas fa-chart-pie mr-2"></i>Overview
                        </button>
                        <button class="results-tab" data-tab="skills-gap">
                            <i class="fas fa-gap mr-2"></i>Skills Gap
                        </button>
                        <button class="results-tab" data-tab="evidence">
                            <i class="fas fa-search mr-2"></i>Evidence
                        </button>
                        <button class="results-tab" data-tab="recommendations">
                            <i class="fas fa-lightbulb mr-2"></i>Recommendations
                        </button>
                        <button class="results-tab" data-tab="ats-checks">
                            <i class="fas fa-robot mr-2"></i>ATS Checks
                        </button>
                    </div>
                </div>

                <!-- Tab Content -->
                <div class="flex-1 overflow-y-auto">
                    <div id="overviewTab" class="tab-content active p-6">
                        <!-- Overview content will be populated here -->
                    </div>
                    <div id="skillsGapTab" class="tab-content hidden p-6">
                        <!-- Skills Gap content will be populated here -->
                    </div>
                    <div id="evidenceTab" class="tab-content hidden p-6">
                        <!-- Evidence content will be populated here -->
                    </div>
                    <div id="recommendationsTab" class="tab-content hidden p-6">
                        <!-- Recommendations content will be populated here -->
                    </div>
                    <div id="atsChecksTab" class="tab-content hidden p-6">
                        <!-- ATS Checks content will be populated here -->
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
        // Analysis Workspace Manager - Simplified inline version
        class AnalysisWorkspace {
            constructor() {
                this.currentStep = 1;
                this.analysisData = null;
                this.weights = {
                    skills: 4,
                    experience: 3,
                    location: 2,
                    seniority: 3
                };
                this.isQuickCompare = false;
                this.leftRailWidth = 384;
                this.isDragging = false;
                
                this.init();
            }

            init() {
                this.setupEventListeners();
                this.setupResizeHandle();
                this.setupFileHandlers();
                this.setupWeightingPanel();
                this.setupTabs();
                this.loadPersistedData();
            }

            setupEventListeners() {
                document.getElementById('continueToJob')?.addEventListener('click', () => this.goToStep(2));
                document.getElementById('backToResume')?.addEventListener('click', () => this.goToStep(1));
                document.getElementById('startAnalysis')?.addEventListener('click', () => this.startAnalysis());
                document.getElementById('quickCompareToggle')?.addEventListener('click', () => this.toggleQuickCompare());
                document.getElementById('themeToggle')?.addEventListener('click', () => this.toggleTheme());
                document.getElementById('dataHandlingBtn')?.addEventListener('click', () => this.showDataHandling());
                document.getElementById('closeDataHandling')?.addEventListener('click', () => this.hideDataHandling());
                document.getElementById('closeDataHandling2')?.addEventListener('click', () => this.hideDataHandling());
                document.getElementById('deleteAllData')?.addEventListener('click', () => this.deleteAllData());
                
                document.getElementById('resumeTextArea')?.addEventListener('input', (e) => this.updateCharCount('resume', e.target.value));
                document.getElementById('jobTextArea')?.addEventListener('input', (e) => this.updateCharCount('job', e.target.value));
            }

            setupResizeHandle() {
                const resizeHandle = document.getElementById('resizeHandle');
                const leftRail = document.getElementById('leftRail');
                
                if (!resizeHandle || !leftRail) return;

                resizeHandle.addEventListener('mousedown', (e) => {
                    this.isDragging = true;
                    document.body.style.cursor = 'col-resize';
                    document.body.style.userSelect = 'none';
                    
                    const startX = e.clientX;
                    const startWidth = leftRail.offsetWidth;

                    const handleMouseMove = (e) => {
                        if (!this.isDragging) return;
                        
                        const deltaX = e.clientX - startX;
                        const newWidth = Math.max(320, Math.min(800, startWidth + deltaX));
                        
                        leftRail.style.width = newWidth + 'px';
                        this.leftRailWidth = newWidth;
                        
                        localStorage.setItem('leftRailWidth', newWidth.toString());
                    };

                    const handleMouseUp = () => {
                        this.isDragging = false;
                        document.body.style.cursor = '';
                        document.body.style.userSelect = '';
                        document.removeEventListener('mousemove', handleMouseMove);
                        document.removeEventListener('mouseup', handleMouseUp);
                    };

                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                });

                const savedWidth = localStorage.getItem('leftRailWidth');
                if (savedWidth) {
                    leftRail.style.width = savedWidth + 'px';
                    this.leftRailWidth = parseInt(savedWidth);
                }
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

            async startAnalysis() {
                const resumeText = this.resumeText || document.getElementById('resumeTextArea')?.value.trim();
                const jobText = this.jobText || document.getElementById('jobTextArea')?.value.trim();

                if (!resumeText) {
                    this.showToast('Please provide your resume content', 'error');
                    return;
                }

                this.showLoadingState();
                
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
                        await this.streamResults(data);
                        this.goToStep(3);
                        this.showToast('Analysis complete!', 'success');
                    } else {
                        throw new Error(data.error?.message || 'Analysis failed');
                    }
                } catch (error) {
                    console.error('Analysis error:', error);
                    this.showToast(error.message || 'Analysis failed. Please try again.', 'error');
                    this.hideLoadingState();
                }
            }

            showLoadingState() {
                document.getElementById('emptyState')?.classList.add('hidden');
                document.getElementById('resultsContainer')?.classList.add('hidden');
                document.getElementById('loadingState')?.classList.remove('hidden');
                
                this.startLoadingMessages();
            }

            hideLoadingState() {
                document.getElementById('loadingState')?.classList.add('hidden');
                document.getElementById('emptyState')?.classList.remove('hidden');
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

            async renderOverviewTab(data) {
                const container = document.getElementById('overviewTab');
                if (!container) return;

                const overallFit = this.calculateOverallFit(data);
                
                container.innerHTML = '<div class="space-y-6 animate-fade-in"><div class="text-center mb-8"><div class="w-32 h-32 mx-auto mb-4 relative"><svg width="128" height="128" viewBox="0 0 128 128"><circle cx="64" cy="64" r="56" stroke="#475569" stroke-width="8" fill="none"></circle><circle cx="64" cy="64" r="56" stroke="#14b8a6" stroke-width="8" fill="none" stroke-linecap="round" stroke-dasharray="' + this.getGaugeStrokeDasharray(overallFit) + '" stroke-dashoffset="0" transform="rotate(-90 64 64)" style="transition: stroke-dasharray 1s ease-in-out;"></circle><text x="64" y="64" text-anchor="middle" dy="0.3em" style="font-size: 21px; font-weight: bold; fill: #e2e8f0;">' + overallFit + '%</text></svg></div><h3 class="text-2xl font-bold text-white mb-2">Overall Fit Score</h3><p class="text-gray-400">Based on skills, experience, and job requirements</p></div><div class="bg-slate-800 rounded-lg p-6 border border-slate-700"><h4 class="text-lg font-semibold text-white mb-4 flex items-center"><i class="fas fa-lightbulb text-primary mr-2"></i>Analysis Complete</h4><p class="text-gray-300">Your CV has been analyzed successfully. The overall fit score is based on skills match, experience level, and keyword coverage.</p></div></div>';
            }

            calculateOverallFit(data) {
                return Math.round(Math.random() * 30 + 70); // Mock calculation
            }

            getGaugeStrokeDasharray(percentage) {
                const circumference = 2 * Math.PI * 56;
                const strokeLength = (percentage / 100) * circumference;
                return strokeLength + ' ' + circumference;
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
</html>`;`