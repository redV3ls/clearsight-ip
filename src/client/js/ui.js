// UI Components Module
class UIManager {
    static renderNavigation() {
        return `
            <nav class="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex justify-between items-center h-16">
                        <div class="flex items-center">
                            <a href="/" class="text-xl font-bold text-primary">Clearsight IP</a>
                            <span class="ml-2 text-sm text-gray-400">Bridge Your Skills Gap with AI-Powered Insights</span>
                        </div>

                        <div class="hidden md:flex items-center space-x-8">
                            <a href="#features" class="nav-link text-gray-300 hover:text-primary">Success Stories</a>
                            <a href="#how-it-works" class="nav-link text-gray-300 hover:text-primary">How It Works</a>
                            <a href="#pricing" class="nav-link text-gray-300 hover:text-primary">Pricing</a>
                            <a href="#demo" class="nav-link text-gray-300 hover:text-primary">Try Demo</a>
                            <a href="/docs" class="nav-link text-gray-300 hover:text-primary">API Docs</a>
                            
                            <div id="authButtons" class="flex items-center space-x-4">
                                <button id="headerLoginBtn" class="auth-button text-gray-300 hover:text-primary px-4 py-2 rounded-lg border border-gray-600 hover:border-primary transition-colors">
                                    <i class="fas fa-sign-in-alt mr-2"></i>Login
                                </button>
                                <button id="headerRegisterBtn" class="auth-button bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-lg transition-colors">
                                    <i class="fas fa-user-plus mr-2"></i>Sign Up
                                </button>
                            </div>

                            <div id="userMenu" class="hidden flex items-center space-x-4">
                                <div class="flex items-center space-x-2">
                                    <div class="user-avatar w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                        <i class="fas fa-user text-white text-sm"></i>
                                    </div>
                                    <span id="userEmail" class="text-gray-300 text-sm"></span>
                                </div>
                                <button id="logoutBtn" class="auth-button text-gray-300 hover:text-red-400 px-3 py-2 rounded-lg border border-gray-600 hover:border-red-400 transition-colors">
                                    <i class="fas fa-sign-out-alt mr-2"></i>Logout
                                </button>
                            </div>
                        </div>

                        <div class="md:hidden">
                            <button id="mobileMenuBtn" class="text-gray-300 hover:text-primary">
                                <i class="fas fa-bars text-xl"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <div id="mobileMenu" class="hidden md:hidden bg-slate-800 border-t border-slate-700">
                    <div class="px-4 py-4 space-y-4">
                        <a href="#features" class="mobile-menu-item block text-gray-300 hover:text-primary py-2">Success Stories</a>
                        <a href="#how-it-works" class="mobile-menu-item block text-gray-300 hover:text-primary py-2">How It Works</a>
                        <a href="#pricing" class="mobile-menu-item block text-gray-300 hover:text-primary py-2">Pricing</a>
                        <a href="#demo" class="mobile-menu-item block text-gray-300 hover:text-primary py-2">Try Demo</a>
                        <a href="/docs" class="mobile-menu-item block text-gray-300 hover:text-primary py-2">API Docs</a>
                        
                        <div id="mobileAuthButtons" class="pt-4 border-t border-slate-700 space-y-2">
                            <button id="mobileLoginBtn" class="w-full auth-button text-gray-300 hover:text-primary px-4 py-2 rounded-lg border border-gray-600 hover:border-primary transition-colors">
                                <i class="fas fa-sign-in-alt mr-2"></i>Login
                            </button>
                            <button id="mobileRegisterBtn" class="w-full auth-button bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-lg transition-colors">
                                <i class="fas fa-user-plus mr-2"></i>Sign Up
                            </button>
                        </div>

                        <div id="mobileUserMenu" class="hidden pt-4 border-t border-slate-700">
                            <div class="flex items-center space-x-2 mb-4">
                                <div class="user-avatar w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                    <i class="fas fa-user text-white text-sm"></i>
                                </div>
                                <span id="mobileUserEmail" class="text-gray-300 text-sm"></span>
                            </div>
                            <button id="mobileLogoutBtn" class="w-full auth-button text-gray-300 hover:text-red-400 px-4 py-2 rounded-lg border border-gray-600 hover:border-red-400 transition-colors">
                                <i class="fas fa-sign-out-alt mr-2"></i>Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
        `;
    }

    static renderMainContent() {
        return `
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
                                <button id="analyzeSkillsBtn" class="bg-primary hover:bg-primary/80 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
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
        `;
    }

    static renderModals() {
        return `
            ${this.renderAnalysisInterface()}
            ${this.renderAuthModal()}
        `;
    }

    static renderAnalysisInterface() {
        return `
            <div id="analysisInterface" class="hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div class="bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-2xl font-bold text-primary">AI-Powered Skills Analysis</h2>
                            <button id="closeAnalysisInterface" class="text-gray-400 hover:text-white">
                                <i class="fas fa-times text-xl"></i>
                            </button>
                        </div>

                        <div id="uploadSection" class="space-y-6">
                            <!-- Upload forms would go here -->
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
        `;
    }

    static renderAuthModal() {
        return `
            <div id="authModal" class="hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div class="bg-slate-800 rounded-lg max-w-md w-full">
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-2xl font-bold text-primary">Account Access</h2>
                            <button id="closeAuthModal" class="text-gray-400 hover:text-white">
                                <i class="fas fa-times text-xl"></i>
                            </button>
                        </div>

                        <div class="flex mb-6 bg-slate-700 rounded-lg p-1">
                            <button id="loginTab" class="flex-1 py-2 px-4 rounded-md text-center transition-colors bg-primary text-white">
                                Login
                            </button>
                            <button id="registerTab" class="flex-1 py-2 px-4 rounded-md text-center transition-colors text-gray-300 hover:text-white">
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

                        <form id="loginForm" class="space-y-4">
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

                        <form id="registerForm" class="hidden space-y-4">
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
        `;
    }
}