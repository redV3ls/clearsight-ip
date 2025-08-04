import { readFileSync } from 'fs';
import { join } from 'path';

// Read the static HTML file
const getHTMLContent = () => {
  try {
    return readFileSync(join(process.cwd(), 'src/client/index.html'), 'utf-8');
  } catch (error) {
    // Fallback for environments where file system access is limited
    return `<!DOCTYPE html>
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
        body { font-family: 'Inter', sans-serif; scroll-behavior: smooth; }
        .auth-button { transition: all 0.3s ease; }
        .auth-button:hover { transform: translateY(-1px); }
        .nav-link { position: relative; }
        .nav-link::after { content: ''; position: absolute; bottom: -5px; left: 0; width: 0; height: 2px; background-color: #14b8a6; transition: width 0.3s ease; }
        .nav-link:hover::after { width: 100%; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-20px); } 100% { transform: translateY(0px); } }
    </style>
</head>
<body class="bg-slate-900 text-gray-200">
    <div id="app">Loading...</div>
    <script>
        // Inline minimal app for Cloudflare Workers
        ${getInlineAppScript()}
    </script>
</body>
</html>`;
  }
};

const getInlineAppScript = () => {
  return `
    // Minimal inline application for Cloudflare Workers
    const AppState = {
        currentUser: null,
        analysisInProgress: false,
        cvFile: null,
        jobFile: null
    };

    const CONFIG = {
        API_BASE_URL: '/api/v1',
        MAX_FILE_SIZE: 5 * 1024 * 1024,
        ALLOWED_FILE_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
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

    let currentMessageIndex = 0;
    let progressInterval, messageInterval;

    // Render the application
    function renderApp() {
        document.getElementById('app').innerHTML = \`
            <nav class="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex justify-between items-center h-16">
                        <div class="flex items-center">
                            <a href="/" class="text-xl font-bold text-primary">Clearsight IP</a>
                            <span class="ml-2 text-sm text-gray-400">Bridge Your Skills Gap with AI-Powered Insights</span>
                        </div>
                        <div class="hidden md:flex items-center space-x-8">
                            <div id="authButtons" class="flex items-center space-x-4">
                                <button onclick="showAuthModal()" class="auth-button text-gray-300 hover:text-primary px-4 py-2 rounded-lg border border-gray-600 hover:border-primary transition-colors">
                                    <i class="fas fa-sign-in-alt mr-2"></i>Login
                                </button>
                                <button onclick="showAuthModal(); switchToRegister()" class="auth-button bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-lg transition-colors">
                                    <i class="fas fa-user-plus mr-2"></i>Sign Up
                                </button>
                            </div>
                            <div id="userMenu" class="hidden flex items-center space-x-4">
                                <div class="flex items-center space-x-2">
                                    <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                        <i class="fas fa-user text-white text-sm"></i>
                                    </div>
                                    <span id="userEmail" class="text-gray-300 text-sm"></span>
                                </div>
                                <button onclick="handleLogout()" class="auth-button text-gray-300 hover:text-red-400 px-3 py-2 rounded-lg border border-gray-600 hover:border-red-400 transition-colors">
                                    <i class="fas fa-sign-out-alt mr-2"></i>Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main class="min-h-screen">
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
                        </div>

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

    // Authentication functions
    async function checkAuthStatus() {
        try {
            const response = await fetch('/api/v1/auth/me', { method: 'GET', credentials: 'include' });
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
        const authButtons = document.getElementById('authButtons');
        const userMenu = document.getElementById('userMenu');
        const userEmail = document.getElementById('userEmail');

        if (authButtons) authButtons.classList.toggle('hidden', isLoggedIn);
        if (userMenu) userMenu.classList.toggle('hidden', !isLoggedIn);
        if (isLoggedIn && userEmail) userEmail.textContent = AppState.currentUser.email;
    }

    function showAuthModal() {
        document.getElementById('authModal').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function hideAuthModal() {
        document.getElementById('authModal').classList.add('hidden');
        document.body.style.overflow = 'auto';
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
            const response = await fetch('/api/v1/auth/login', {
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
            const response = await fetch('/api/v1/auth/register', {
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
            showAuthError('Registration failed. Please try again.');
        }
    }

    async function handleLogout() {
        try {
            await fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'include' });
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

    // Analysis functions
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
        
        if (file.size > CONFIG.MAX_FILE_SIZE) {
            showAnalysisError('File too large. Maximum size is 5MB');
            return;
        }
        
        if (!CONFIG.ALLOWED_FILE_TYPES.includes(file.type)) {
            showAnalysisError('Invalid file type. Please upload PDF, DOC, DOCX, or TXT files only.');
            return;
        }
        
        AppState[type + 'File'] = file;
        document.getElementById(type + 'FileName').textContent = file.name;
        document.getElementById(type + 'FileInfo').classList.remove('hidden');
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

    function startLoadingAnimation() {
        currentMessageIndex = 0;
        let progress = 0;
        
        updateLoadingMessage();
        
        progressInterval = setInterval(() => {
            progress += Math.random() * 15 + 5;
            if (progress > 95) progress = 95;
            document.getElementById('progressBar').style.width = progress + '%';
        }, 800);
        
        messageInterval = setInterval(() => {
            currentMessageIndex = (currentMessageIndex + 1) % LOADING_MESSAGES.length;
            updateLoadingMessage();
        }, 2500);
    }

    function updateLoadingMessage() {
        const message = LOADING_MESSAGES[currentMessageIndex];
        document.getElementById('progressText').textContent = message;
    }

    function stopLoadingAnimation() {
        if (progressInterval) clearInterval(progressInterval);
        if (messageInterval) clearInterval(messageInterval);
    }

    function resetAnalysis() {
        AppState.analysisInProgress = false;
        stopLoadingAnimation();
        document.getElementById('uploadSection').classList.remove('hidden');
        document.getElementById('loadingSection').classList.add('hidden');
        document.getElementById('resultsSection').classList.add('hidden');
        document.getElementById('progressBar').style.width = '0%';
    }

    async function performAnalysis() {
        if (AppState.analysisInProgress) return;
        
        if (!AppState.cvFile) {
            showAnalysisError('Please upload your CV/resume file to start the analysis.');
            return;
        }

        AppState.analysisInProgress = true;
        document.getElementById('uploadSection').classList.add('hidden');
        document.getElementById('loadingSection').classList.remove('hidden');
        startLoadingAnimation();

        try {
            const formData = new FormData();
            formData.append('resume', AppState.cvFile);

            const response = await fetch('/api/v1/analyze/resume', {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                // Complete loading animation
                document.getElementById('progressBar').style.width = '100%';
                document.getElementById('progressText').textContent = '🎉 Analysis complete! Preparing your results...';
                
                setTimeout(() => {
                    document.getElementById('loadingSection').classList.add('hidden');
                    document.getElementById('resultsSection').classList.remove('hidden');
                    document.getElementById('resultsContent').innerHTML = '<div class="text-center"><h3 class="text-2xl font-bold text-green-400 mb-4">Analysis Complete!</h3><p class="text-gray-300">Your personalized career insights are ready.</p></div>';
                }, 1500);
            } else {
                throw new Error(data.error?.message || 'Analysis failed');
            }
        } catch (error) {
            showAnalysisError(error.message || 'Analysis failed. Please try again.');
            resetAnalysis();
        } finally {
            AppState.analysisInProgress = false;
            stopLoadingAnimation();
        }
    }

    // Initialize the app
    document.addEventListener('DOMContentLoaded', () => {
        renderApp();
        checkAuthStatus();
    });
  `;
};

export const HTML_CONTENT = getHTMLContent();