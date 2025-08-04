// Clean, optimized HTML content for Cloudflare Workers
// Reduced from 3000+ lines to ~400 lines with better structure and maintainability

export const HTML_CONTENT = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Clearsight IP - Bridge Your Skills Gap with AI-Powered Insights</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.ico">
    <link rel="apple-touch-icon" href="/favicon.ico">
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#14b8a6',
                        accent: '#14b8a6',
                        background: '#0f172a',
                        text: '#e2e8f0'
                    }
                }
            }
        }
    </script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        body {
            font-family: 'Inter', sans-serif;
            scroll-behavior: smooth;
        }
        
        .auth-button {
            transition: all 0.3s ease;
        }
        
        .auth-button:hover {
            transform: translateY(-1px);
        }
        
        .user-avatar {
            transition: all 0.3s ease;
        }
        
        .user-avatar:hover {
            transform: scale(1.1);
        }
        
        .nav-link {
            position: relative;
        }
        
        .nav-link::after {
            content: '';
            position: absolute;
            bottom: -5px;
            left: 0;
            width: 0;
            height: 2px;
            background-color: #14b8a6;
            transition: width 0.3s ease;
        }
        
        .nav-link:hover::after {
            width: 100%;
        }
        
        .animate-float {
            animation: float 6s ease-in-out infinite;
        }
        
        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
            100% { transform: translateY(0px); }
        }
        
        .mobile-menu-item {
            transition: all 0.2s ease;
        }
        
        .mobile-menu-item:hover {
            background-color: rgba(20, 184, 166, 0.1);
            padding-left: 1rem;
        }
    </style>
</head>
<body class="bg-slate-900 text-gray-200">
    <div id="app">
        <!-- Loading placeholder -->
        <div class="flex items-center justify-center min-h-screen">
            <div class="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
    </div>

    <script>
        // ===== APPLICATION CONFIGURATION =====
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

        const CONFIG = {
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

        const LOADING_MESSAGES = [
            "🧠 Waking up our AI brain...",
            "📄 Reading your resume like a caffeinated HR manager...",
            "🔍 Hunting for hidden skills in your experience...",
            "🎯 Matching you with dream jobs...",
            "🚀 Calculating your career trajectory...",
            "💡 Generating brilliant insights...",
            "🎨 Crafting your personalized analysis...",
            "🔮 Predicting your future success...",
            "⚡ Supercharging your job search strategy...",
            "🎪 Putting on the final touches...",
            "🎉 Almost ready to blow your mind..."
        ];

        // ===== UI RENDERING =====
        function renderApp() {
            document.getElementById('app').innerHTML = \`
                <!-- Navigation -->
                <nav class="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
                    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div class="flex justify-between items-center h-16">
                            <div class="flex items-center">
                                <a href="/" class="text-xl font-bold text-primary">Clearsight IP</a>
                                <span class="ml-2 text-sm text-gray-400 hidden sm:inline">Bridge Your Skills Gap with AI-Powered Insights</span>
                            </div>

                            <!-- Desktop Navigation -->
                            <div class="hidden md:flex items-center space-x-8">
                                <a href="#features" class="nav-link text-gray-300 hover:text-primary">Success Stories</a>
                                <a href="#how-it-works" class="nav-link text-gray-300 hover:text-primary">How It Works</a>
                                <a href="#pricing" class="nav-link text-gray-300 hover:text-primary">Pricing</a>
                                <a href="#demo" class="nav-link text-gray-300 hover:text-primary">Try Demo</a>
                                <a href="/docs" class="nav-link text-gray-300 hover:text-primary">API Docs</a>
                                
                                <!-- Auth Buttons (shown when not logged in) -->
                                <div id="authButtons" class="flex items-center space-x-4">
                                    <button onclick="showAuthModal()" class="auth-button text-gray-300 hover:text-primary px-4 py-2 rounded-lg border border-gray-600 hover:border-primary transition-colors">
                                        <i class="fas fa-sign-in-alt mr-2"></i>Login
                                    </button>
                                    <button onclick="showAuthModal(); switchToRegister()" class="auth-button bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-lg transition-colors">
                                        <i class="fas fa-user-plus mr-2"></i>Sign Up
                                    </button>
                                </div>

                                <!-- User Menu (shown when logged in) -->
                                <div id="userMenu" class="hidden flex items-center space-x-4">
                                    <div class="flex items-center space-x-2">
                                        <div class="user-avatar w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                            <i class="fas fa-user text-white text-sm"></i>
                                        </div>
                                        <span id="userEmail" class="text-gray-300 text-sm"></span>
                                    </div>
                                    <button onclick="handleLogout()" class="auth-button text-gray-300 hover:text-red-400 px-3 py-2 rounded-lg border border-gray-600 hover:border-red-400 transition-colors">
                                        <i class="fas fa-sign-out-alt mr-2"></i>Logout
                                    </button>
                                </div>
                            </div>

                            <!-- Mobile menu button -->
                            <div class="md:hidden">
                                <button onclick="toggleMobileMenu()" class="text-gray-300 hover:text-primary">
                                    <i class="fas fa-bars text-xl"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Mobile Navigation -->
                    <div id="mobileMenu" class="hidden md:hidden bg-slate-800 border-t border-slate-700">
                        <div class="px-4 py-4 space-y-4">
                            <a href="#features" class="mobile-menu-item block text-gray-300 hover:text-primary py-2">Success Stories</a>
                            <a href="#how-it-works" class="mobile-menu-item block text-gray-300 hover:text-primary py-2">How It Works</a>
                            <a href="#pricing" class="mobile-menu-item block text-gray-300 hover:text-primary py-2">Pricing</a>
                            <a href="#demo" class="mobile-menu-item block text-gray-300 hover:text-primary py-2">Try Demo</a>
                            <a href="/docs" class="mobile-menu-item block text-gray-300 hover:text-primary py-2">API Docs</a>
                            
                            <!-- Mobile Auth Buttons -->
                            <div id="mobileAuthButtons" class="pt-4 border-t border-slate-700 space-y-2">
                                <button onclick="showAuthModal(); toggleMobileMenu()" class="w-full auth-button text-gray-300 hover:text-primary px-4 py-2 rounded-lg border border-gray-600 hover:border-primary transition-colors">
                                    <i class="fas fa-sign-in-alt mr-2"></i>Login
                                </button>
                                <button onclick="showAuthModal(); switchToRegister(); toggleMobileMenu()" class="w-full auth-button bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-lg transition-colors">
                                    <i class="fas fa-user-plus mr-2"></i>Sign Up
                                </button>
                            </div>

                            <!-- Mobile User Menu -->
                            <div id="mobileUserMenu" class="hidden pt-4 border-t border-slate-700">
                                <div class="flex items-center space-x-2 mb-4">
                                    <div class="user-avatar w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                        <i class="fas fa-user text-white text-sm"></i>
                                    </div>
                                    <span id="mobileUserEmail" class="text-gray-300 text-sm"></span>
                                </div>
                                <button onclick="handleLogout()" class="w-full auth-button text-gray-300 hover:text-red-400 px-4 py-2 rounded-lg border border-gray-600 hover:border-red-400 transition-colors">
                                    <i class="fas fa-sign-out-alt mr-2"></i>Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>

                <!-- Main Content -->
                <main class="min-h-screen">
                    <!-- Hero Section -->
                    <section class="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20">
                        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div class="grid lg:grid-cols-2 gap-12 items-center">
                                <div>
                                    <h1 class="text-4xl lg:text-6xl font-bold mb-6">
                                        Struggling to <span class="text-red-400">stand out</span> in today's competitive job market? 
                                        <span class="text-primary">You're not alone.</span>
                                    </h1>
                                    <p class="text-xl text-gray-300 mb-8">
                                        Most professionals don't know which skills they're missing or how to showcase their expertise effectively. 
                                        Your dream job might be just one skill insight away.
                                    </p>
                                    <div class="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-8">
                                        <div class="flex items-center text-red-400 mb-2">
                                            <i class="fas fa-exclamation-triangle mr-2"></i>
                                            <span class="font-semibold">The Hidden Costs:</span>
                                        </div>
                                        <p class="text-red-300">
                                            • 1 in 3 is average time-to-productivity • 40% promotion failure rate due to skills misalignment • $13,000 average cost per bad hire
                                        </p>
                                    </div>
                                    <div class="flex flex-col sm:flex-row gap-4">
                                        <button onclick="showAnalysisInterface()" class="bg-primary hover:bg-primary/80 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
                                            Analyze My Skills Now
                                        </button>
                                        <a href="/docs" class="border border-gray-600 hover:border-primary text-gray-300 hover:text-primary px-8 py-4 rounded-lg text-lg font-semibold transition-colors text-center">
                                            View API Docs
                                        </a>
                                    </div>
                                </div>
                                <div class="relative">
                                    <div class="bg-slate-800 rounded-lg p-6 border border-slate-700">
                                        <h3 class="text-primary font-semibold mb-4">Your Career Reality</h3>
                                        <div class="space-y-4">
                                            <div class="flex justify-between items-center">
                                                <span class="text-gray-300">Average Job Search</span>
                                                <span class="text-red-400 font-bold">5.2 months</span>
                                            </div>
                                            <div class="flex justify-between items-center">
                                                <span class="text-gray-300">Resume Review Time</span>
                                                <span class="text-red-400 font-bold">6 seconds</span>
                                            </div>
                                            <div class="flex justify-between items-center">
                                                <span class="text-gray-300">Feel Underqualified</span>
                                                <span class="text-red-400 font-bold">67%</span>
                                            </div>
                                        </div>
                                        <div class="mt-6 p-4 bg-red-900/20 rounded-lg border border-red-500/30">
                                            <h4 class="text-red-400 font-semibold mb-2">What You're Missing:</h4>
                                            <ul class="text-red-300 space-y-1">
                                                <li>• Don't know which skills to learn</li>
                                                <li>• Can't showcase expertise effectively</li>
                                                <li>• Missing key requirements for dream jobs</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                <!-- Analysis Interface Modal -->
                <div id="analysisInterface" class="hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div class="bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div class="p-6">
                            <div class="flex justify-between items-center mb-6">
                                <h2 class="text-2xl font-bold text-primary">AI-Powered Skills Analysis</h2>
                                <button onclick="hideAnalysisInterface()" class="text-gray-400 hover:text-white">
                                    <i class="fas fa-times text-xl"></i>
                                </button>
                            </div>

                            <!-- Upload Section -->
                            <div id="uploadSection" class="space-y-6">
                                <div>
                                    <label class="block text-lg font-semibold text-gray-200 mb-3">
                                        <i class="fas fa-file-alt mr-2 text-primary"></i>Upload Your CV/Resume
                                    </label>
                                    <div onclick="document.getElementById('cvFileInput').click()" class="border-2 border-dashed border-gray-600 hover:border-primary rounded-lg p-8 text-center cursor-pointer transition-colors">
                                        <i class="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
                                        <p class="text-gray-300 mb-2">Drop your CV here or click to browse</p>
                                        <p class="text-sm text-gray-500">PDF, DOC, DOCX, or TXT (max 5MB)</p>
                                    </div>
                                    <input type="file" id="cvFileInput" class="hidden" accept=".pdf,.doc,.docx,.txt" onchange="handleFileSelect(this.files[0], 'cv')">
                                    <div id="cvFileInfo" class="hidden mt-3 p-3 bg-slate-700 rounded-lg flex items-center justify-between">
                                        <div class="flex items-center">
                                            <i class="fas fa-file text-primary mr-2"></i>
                                            <span id="cvFileName" class="text-gray-200"></span>
                                        </div>
                                        <button onclick="clearFile('cv')" class="text-red-400 hover:text-red-300">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label class="block text-lg font-semibold text-gray-200 mb-3">
                                        <i class="fas fa-briefcase mr-2 text-blue-400"></i>Job Description (Optional)
                                    </label>
                                    <div onclick="document.getElementById('jobFileInput').click()" class="border-2 border-dashed border-gray-600 hover:border-blue-400 rounded-lg p-8 text-center cursor-pointer transition-colors">
                                        <i class="fas fa-briefcase text-4xl text-gray-400 mb-4"></i>
                                        <p class="text-gray-300 mb-2">Drop job description here or click to browse</p>
                                        <p class="text-sm text-gray-500">PDF, DOC, DOCX, or TXT (max 2MB)</p>
                                    </div>
                                    <input type="file" id="jobFileInput" class="hidden" accept=".pdf,.doc,.docx,.txt" onchange="handleFileSelect(this.files[0], 'job')">
                                    <div id="jobFileInfo" class="hidden mt-3 p-3 bg-slate-700 rounded-lg flex items-center justify-between">
                                        <div class="flex items-center">
                                            <i class="fas fa-briefcase text-blue-400 mr-2"></i>
                                            <span id="jobFileName" class="text-gray-200"></span>
                                        </div>
                                        <button onclick="clearFile('job')" class="text-red-400 hover:text-red-300">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label class="block text-lg font-semibold text-gray-200 mb-3">
                                        <i class="fas fa-cogs mr-2 text-yellow-400"></i>Analysis Options
                                    </label>
                                    <div class="space-y-3">
                                        <label class="flex items-center">
                                            <input type="checkbox" id="skillsIntelligenceAnalysis" class="mr-3" checked>
                                            <span class="text-gray-300">Skills Gap Intelligence Analysis</span>
                                        </label>
                                        <label class="flex items-center">
                                            <input type="checkbox" id="careerSuggestions" class="mr-3" checked>
                                            <span class="text-gray-300">Career Path Suggestions</span>
                                        </label>
                                        <label class="flex items-center">
                                            <input type="checkbox" id="industryTrends" class="mr-3">
                                            <span class="text-gray-300">Industry Trends Analysis</span>
                                        </label>
                                    </div>
                                </div>

                                <div id="analysisError" class="hidden bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                                    <div class="flex items-center text-red-400">
                                        <i class="fas fa-exclamation-triangle mr-2"></i>
                                        <span class="font-semibold">Error</span>
                                    </div>
                                    <p class="text-red-300 mt-1"></p>
                                </div>

                                <div class="flex justify-end space-x-4">
                                    <button onclick="hideAnalysisInterface()" class="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:border-gray-500 transition-colors">
                                        Cancel
                                    </button>
                                    <button onclick="performAnalysis()" class="px-6 py-3 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors">
                                        <i class="fas fa-brain mr-2"></i>Start AI Analysis
                                    </button>
                                </div>
                            </div>

                            <!-- Loading Section -->
                            <div id="loadingSection" class="hidden text-center py-12">
                                <div class="relative mb-8">
                                    <div class="animate-spin w-20 h-20 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                                    <div class="absolute inset-0 flex items-center justify-center">
                                        <i class="fas fa-brain text-primary text-2xl animate-pulse"></i>
                                    </div>
                                </div>
                                <h3 class="text-2xl font-bold text-gray-200 mb-4">
                                    <i class="fas fa-brain mr-2"></i>AI Analysis in Progress...
                                </h3>
                                <div class="bg-slate-700 rounded-lg p-6 mb-6 max-w-md mx-auto">
                                    <p class="text-gray-300 mb-4">Our AI is working its magic on your profile!</p>
                                    <div class="w-full bg-gray-600 rounded-full h-3 mb-4 overflow-hidden">
                                        <div id="progressBar" class="bg-gradient-to-r from-primary to-blue-400 h-3 rounded-full transition-all duration-500 ease-out" style="width: 0%"></div>
                                    </div>
                                    <p id="progressText" class="text-sm text-primary animate-pulse font-medium">🧠 Initializing AI brain...</p>
                                </div>
                                <div class="text-xs text-gray-500 max-w-sm mx-auto">
                                    <p class="mb-2">💡 <strong>Pro Tip:</strong> While you wait, think about your dream job!</p>
                                    <p>⏱️ This usually takes 30-60 seconds</p>
                                </div>
                            </div>

                            <!-- Results Section -->
                            <div id="resultsSection" class="hidden">
                                <div id="resultsContent" class="space-y-6"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Auth Modal -->
                <div id="authModal" class="hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div class="bg-slate-800 rounded-lg max-w-md w-full">
                        <div class="p-6">
                            <div class="flex justify-between items-center mb-6">
                                <h2 class="text-2xl font-bold text-primary">Account Access</h2>
                                <button onclick="hideAuthModal()" class="text-gray-400 hover:text-white">
                                    <i class="fas fa-times text-xl"></i>
                                </button>
                            </div>

                            <div class="flex mb-6 bg-slate-700 rounded-lg p-1">
                                <button id="loginTab" onclick="switchToLogin()" class="flex-1 py-2 px-4 rounded-md text-center transition-colors bg-primary text-white">
                                    Login
                                </button>
                                <button id="registerTab" onclick="switchToRegister()" class="flex-1 py-2 px-4 rounded-md text-center transition-colors text-gray-300 hover:text-white">
                                    Sign Up
                                </button>
                            </div>

                            <div id="authError" class="hidden bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-4">
                                <div class="flex items-center text-red-400">
                                    <i class="fas fa-exclamation-triangle mr-2"></i>
                                    <span class="font-semibold">Error</span>
                                </div>
                                <p class="text-red-300 mt-1"></p>
                            </div>

                            <form id="loginForm" onsubmit="handleLogin(event)" class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-300 mb-2">Email</label>
                                    <input type="email" name="loginEmail" required class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-primary">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-300 mb-2">Password</label>
                                    <input type="password" name="loginPassword" required class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-primary">
                                </div>
                                <button type="submit" class="w-full bg-primary hover:bg-primary/80 text-white py-2 px-4 rounded-lg transition-colors">
                                    Login
                                </button>
                            </form>

                            <form id="registerForm" onsubmit="handleRegister(event)" class="hidden space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-300 mb-2">Email</label>
                                    <input type="email" name="registerEmail" required class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-primary">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-300 mb-2">Password</label>
                                    <input type="password" name="registerPassword" required class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-primary">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                                    <input type="password" name="confirmPassword" required class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-primary">
                                </div>
                                <button type="submit" class="w-full bg-primary hover:bg-primary/80 text-white py-2 px-4 rounded-lg transition-colors">
                                    Sign Up
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            \`;
        }

        // ===== AUTHENTICATION FUNCTIONS =====
        async function checkAuthStatus() {
            try {
                const response = await fetch(CONFIG.API_BASE_URL + '/auth/me', { 
                    method: 'GET', 
                    credentials: 'include' 
                });
                
                if (response.ok) {
                    const data = await response.json();
                    AppState.currentUser = data.data.user;
                } else {
                    AppState.currentUser = null;
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                AppState.currentUser = null;
            }
            updateAuthUI();
        }

        function updateAuthUI() {
            const isLoggedIn = AppState.currentUser && AppState.currentUser.email;
            
            // Desktop UI
            const authButtons = document.getElementById('authButtons');
            const userMenu = document.getElementById('userMenu');
            const userEmail = document.getElementById('userEmail');
            
            if (authButtons) authButtons.classList.toggle('hidden', isLoggedIn);
            if (userMenu) userMenu.classList.toggle('hidden', !isLoggedIn);
            if (isLoggedIn && userEmail) userEmail.textContent = AppState.currentUser.email;

            // Mobile UI
            const mobileAuthButtons = document.getElementById('mobileAuthButtons');
            const mobileUserMenu = document.getElementById('mobileUserMenu');
            const mobileUserEmail = document.getElementById('mobileUserEmail');
            
            if (mobileAuthButtons) mobileAuthButtons.classList.toggle('hidden', isLoggedIn);
            if (mobileUserMenu) mobileUserMenu.classList.toggle('hidden', !isLoggedIn);
            if (isLoggedIn && mobileUserEmail) mobileUserEmail.textContent = AppState.currentUser.email;
        }

        function showAuthModal() {
            document.getElementById('authModal').classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            clearAuthError();
        }

        function hideAuthModal() {
            document.getElementById('authModal').classList.add('hidden');
            document.body.style.overflow = 'auto';
            clearAuthError();
        }

        function switchToLogin() {
            document.getElementById('loginTab').classList.add('bg-primary', 'text-white');
            document.getElementById('loginTab').classList.remove('text-gray-300');
            document.getElementById('registerTab').classList.remove('bg-primary', 'text-white');
            document.getElementById('registerTab').classList.add('text-gray-300');
            document.getElementById('loginForm').classList.remove('hidden');
            document.getElementById('registerForm').classList.add('hidden');
        }

        function switchToRegister() {
            document.getElementById('registerTab').classList.add('bg-primary', 'text-white');
            document.getElementById('registerTab').classList.remove('text-gray-300');
            document.getElementById('loginTab').classList.remove('bg-primary', 'text-white');
            document.getElementById('loginTab').classList.add('text-gray-300');
            document.getElementById('registerForm').classList.remove('hidden');
            document.getElementById('loginForm').classList.add('hidden');
        }

        async function handleLogin(e) {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            try {
                const response = await fetch(CONFIG.API_BASE_URL + '/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        email: formData.get('loginEmail'),
                        password: formData.get('loginPassword')
                    })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    AppState.currentUser = data.data.user;
                    updateAuthUI();
                    hideAuthModal();
                } else {
                    showAuthError(data.error?.message || 'Login failed');
                }
            } catch (error) {
                console.error('Login error:', error);
                showAuthError('Login failed. Please try again.');
            }
        }

        async function handleRegister(e) {
            e.preventDefault();
            const formData = new FormData(e.target);
            const password = formData.get('registerPassword');
            const confirmPassword = formData.get('confirmPassword');
            
            if (password !== confirmPassword) {
                showAuthError('Passwords do not match');
                return;
            }

            try {
                const response = await fetch(CONFIG.API_BASE_URL + '/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        email: formData.get('registerEmail'),
                        password: password
                    })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    AppState.currentUser = data.data.user;
                    updateAuthUI();
                    hideAuthModal();
                } else {
                    showAuthError(data.error?.message || 'Registration failed');
                }
            } catch (error) {
                console.error('Registration error:', error);
                showAuthError('Registration failed. Please try again.');
            }
        }

        async function handleLogout() {
            try {
                await fetch(CONFIG.API_BASE_URL + '/auth/logout', { 
                    method: 'POST', 
                    credentials: 'include' 
                });
            } catch (error) {
                console.error('Logout failed:', error);
            }
            
            AppState.currentUser = null;
            updateAuthUI();
        }

        function showAuthError(message) {
            const errorDiv = document.getElementById('authError');
            if (errorDiv) {
                errorDiv.querySelector('p').textContent = message;
                errorDiv.classList.remove('hidden');
            }
        }

        function clearAuthError() {
            const errorDiv = document.getElementById('authError');
            if (errorDiv) {
                errorDiv.classList.add('hidden');
                errorDiv.querySelector('p').textContent = '';
            }
        }

        // ===== ANALYSIS FUNCTIONS =====
        function showAnalysisInterface() {
            document.getElementById('analysisInterface').classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }

        function hideAnalysisInterface() {
            document.getElementById('analysisInterface').classList.add('hidden');
            document.body.style.overflow = 'auto';
            resetAnalysis();
        }

        function handleFileSelect(file, type) {
            if (!file) return;
            
            const maxSize = type === 'cv' ? CONFIG.MAX_FILE_SIZE : CONFIG.MAX_JOB_FILE_SIZE;
            
            if (file.size > maxSize) {
                showAnalysisError(\`File too large. Maximum size is \${maxSize / (1024 * 1024)}MB\`);
                return;
            }
            
            if (!CONFIG.ALLOWED_FILE_TYPES.includes(file.type)) {
                showAnalysisError('Invalid file type. Please upload PDF, DOC, DOCX, or TXT files only.');
                return;
            }
            
            if (file.name.includes('../') || file.name.includes('..\\\\')) {
                showAnalysisError('Invalid file name.');
                return;
            }
            
            AppState[type + 'File'] = file;
            document.getElementById(type + 'FileName').textContent = file.name;
            document.getElementById(type + 'FileInfo').classList.remove('hidden');
            clearAnalysisError();
        }

        function clearFile(type) {
            AppState[type + 'File'] = null;
            document.getElementById(type + 'FileInput').value = '';
            document.getElementById(type + 'FileInfo').classList.add('hidden');
        }

        function showAnalysisError(message) {
            const errorDiv = document.getElementById('analysisError');
            if (errorDiv) {
                errorDiv.querySelector('p').textContent = message;
                errorDiv.classList.remove('hidden');
            }
        }

        function clearAnalysisError() {
            const errorDiv = document.getElementById('analysisError');
            if (errorDiv) {
                errorDiv.classList.add('hidden');
                errorDiv.querySelector('p').textContent = '';
            }
        }

        function checkRateLimit() {
            const now = Date.now();
            if (now - AppState.lastAnalysisTime < CONFIG.ANALYSIS_COOLDOWN) {
                const remainingTime = Math.ceil((CONFIG.ANALYSIS_COOLDOWN - (now - AppState.lastAnalysisTime)) / 1000);
                showAnalysisError(\`Please wait \${remainingTime} seconds before starting another analysis.\`);
                return false;
            }
            AppState.lastAnalysisTime = now;
            return true;
        }

        function startLoadingAnimation() {
            AppState.currentMessageIndex = 0;
            let progress = 0;
            
            updateLoadingMessage();
            
            AppState.progressInterval = setInterval(() => {
                progress += Math.random() * 15 + 5;
                if (progress > 95) progress = 95;
                
                const progressBar = document.getElementById('progressBar');
                if (progressBar) {
                    progressBar.style.width = progress + '%';
                }
            }, CONFIG.PROGRESS_UPDATE_INTERVAL);
            
            AppState.messageInterval = setInterval(() => {
                AppState.currentMessageIndex = (AppState.currentMessageIndex + 1) % LOADING_MESSAGES.length;
                updateLoadingMessage();
            }, CONFIG.LOADING_MESSAGE_INTERVAL);
        }

        function updateLoadingMessage() {
            const message = LOADING_MESSAGES[AppState.currentMessageIndex];
            const progressText = document.getElementById('progressText');
            
            if (progressText) {
                progressText.textContent = message;
                progressText.className = 'text-sm text-primary animate-pulse font-medium';
            }
        }

        function stopLoadingAnimation() {
            if (AppState.progressInterval) {
                clearInterval(AppState.progressInterval);
                AppState.progressInterval = null;
            }
            if (AppState.messageInterval) {
                clearInterval(AppState.messageInterval);
                AppState.messageInterval = null;
            }
        }

        function resetAnalysis() {
            AppState.analysisInProgress = false;
            stopLoadingAnimation();
            
            document.getElementById('uploadSection').classList.remove('hidden');
            document.getElementById('loadingSection').classList.add('hidden');
            document.getElementById('resultsSection').classList.add('hidden');
            
            const progressBar = document.getElementById('progressBar');
            if (progressBar) {
                progressBar.style.width = '0%';
            }
        }

        async function performAnalysis() {
            if (AppState.analysisInProgress || !checkRateLimit()) return;
            
            clearAnalysisError();
            
            if (!AppState.cvFile) {
                showAnalysisError('Please upload your CV/resume file to start the analysis.');
                return;
            }

            AppState.analysisInProgress = true;
            
            document.getElementById('uploadSection').classList.add('hidden');
            document.getElementById('loadingSection').classList.remove('hidden');
            document.getElementById('resultsSection').classList.add('hidden');
            
            startLoadingAnimation();

            try {
                const formData = new FormData();
                formData.append('resume', AppState.cvFile);
                
                if (AppState.jobFile) {
                    formData.append('jobDescription', AppState.jobFile);
                }
                
                formData.append('includeSkillsGap', document.getElementById('skillsIntelligenceAnalysis')?.checked || false);
                formData.append('includeCareerSuggestions', document.getElementById('careerSuggestions')?.checked || false);
                formData.append('includeIndustryTrends', document.getElementById('industryTrends')?.checked || false);

                const response = await fetch(CONFIG.API_BASE_URL + '/analyze/resume', {
                    method: 'POST',
                    credentials: 'include',
                    body: formData
                });

                const data = await response.json();

                if (response.ok) {
                    // Complete loading animation
                    const progressBar = document.getElementById('progressBar');
                    const progressText = document.getElementById('progressText');
                    
                    if (progressBar) progressBar.style.width = '100%';
                    if (progressText) {
                        progressText.textContent = '🎉 Analysis complete! Preparing your results...';
                        progressText.className = 'text-sm text-green-400 font-semibold';
                    }
                    
                    setTimeout(() => {
                        displayResults(data);
                    }, 1500);
                } else {
                    throw new Error(data.error?.message || 'Analysis failed');
                }
            } catch (error) {
                console.error('Analysis error:', error);
                showAnalysisError(error.message || 'Analysis failed. Please try again.');
                resetAnalysis();
            } finally {
                AppState.analysisInProgress = false;
                stopLoadingAnimation();
            }
        }

        function displayResults(data) {
            window.analysisData = data;
            
            document.getElementById('loadingSection').classList.add('hidden');
            document.getElementById('resultsSection').classList.remove('hidden');
            
            const resultsContent = document.getElementById('resultsContent');
            if (!resultsContent) return;
            
            resultsContent.innerHTML = \`
                <div class="space-y-8">
                    <div class="text-center mb-8">
                        <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-check text-white text-2xl"></i>
                        </div>
                        <h2 class="text-3xl font-bold text-green-400 mb-2">Analysis Complete!</h2>
                        <p class="text-gray-300">Here's your personalized career insights</p>
                    </div>
                    
                    <div class="bg-slate-700 rounded-lg p-6">
                        <h3 class="text-xl font-bold text-primary mb-4">
                            <i class="fas fa-brain mr-2"></i>AI Analysis Results
                        </h3>
                        <div class="bg-slate-600 rounded-lg p-4">
                            <p class="text-gray-300 mb-4">
                                Your analysis has been completed successfully! Our AI has processed your resume and identified key insights about your skills and career potential.
                            </p>
                            <div class="grid md:grid-cols-2 gap-4">
                                <div class="bg-slate-500 rounded-lg p-3">
                                    <h4 class="font-semibold text-gray-200 mb-2">Skills Identified</h4>
                                    <p class="text-sm text-gray-300">Multiple technical and soft skills detected</p>
                                </div>
                                <div class="bg-slate-500 rounded-lg p-3">
                                    <h4 class="font-semibold text-gray-200 mb-2">Career Level</h4>
                                    <p class="text-sm text-gray-300">Professional experience assessed</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                        <button onclick="downloadResults()" class="bg-primary hover:bg-primary/80 text-white px-6 py-3 rounded-lg transition-colors">
                            <i class="fas fa-download mr-2"></i>Download Results
                        </button>
                        <button onclick="resetAnalysis()" class="border border-gray-600 hover:border-primary text-gray-300 hover:text-primary px-6 py-3 rounded-lg transition-colors">
                            <i class="fas fa-redo mr-2"></i>New Analysis
                        </button>
                        <button onclick="hideAnalysisInterface()" class="bg-gray-600 hover:bg-gray-500 text-white px-6 py-3 rounded-lg transition-colors">
                            <i class="fas fa-times mr-2"></i>Close
                        </button>
                    </div>
                </div>
            \`;
        }

        function downloadResults() {
            if (!window.analysisData) return;
            
            const results = {
                timestamp: new Date().toISOString(),
                user: AppState.currentUser?.email || 'Anonymous',
                ...window.analysisData
            };
            
            const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = \`cv-analysis-\${new Date().toISOString().split('T')[0]}.json\`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        // ===== UI UTILITY FUNCTIONS =====
        function toggleMobileMenu() {
            const mobileMenu = document.getElementById('mobileMenu');
            if (mobileMenu) {
                mobileMenu.classList.toggle('hidden');
            }
        }

        // ===== APPLICATION INITIALIZATION =====
        document.addEventListener('DOMContentLoaded', () => {
            renderApp();
            checkAuthStatus();
            console.log('Clearsight IP application initialized - Optimized for Cloudflare Workers');
        });
    </script>
</body>
</html>`;