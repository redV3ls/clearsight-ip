// Complete HTML content with inline JavaScript and CSS for Cloudflare Workers
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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700\u0026display=swap');
        
        body {
            font-family: 'Inter', sans-serif;
            scroll-behavior: smooth;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            min-height: 100vh;
        }
        
        .nav-link {
            position: relative;
            transition: color 0.3s ease;
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
        
        .auth-button {
            transition: all 0.3s ease;
        }
        
        .auth-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
        }
        
        .user-avatar {
            transition: all 0.3s ease;
        }
        
        .user-avatar:hover {
            transform: scale(1.1);
        }
        
        section {
            scroll-margin-top: 4rem;
        }
        
        .bg-slate-700:hover {
            transform: translateY(-2px);
            transition: transform 0.3s ease;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }
        
        button:focus,
        input:focus,
        a:focus {
            outline: 2px solid #14b8a6;
            outline-offset: 2px;
        }
        
        /* Narrative display styles */
        .narrative-content {
            line-height: 1.7;
            font-size: 16px;
        }
        
        .narrative-content p {
            margin-bottom: 1rem;
        }
        
        .narrative-content strong {
            color: #14b8a6;
            font-weight: 600;
        }
        
        .analysis-type-indicator {
            transition: all 0.3s ease;
        }
        
        /* Fix for modal tab height consistency */
        .tab-content {
            min-height: 420px; /* Or a suitable fixed height */
        }
    </style>
</head>
<body class="bg-slate-900 text-gray-200">
    <!-- Navigation -->
    <nav class="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <div class="flex items-center">
                    <a href="/" class="text-xl font-bold text-primary">Clearsight IP</a>
                </div>

                <div class="hidden md:flex items-center space-x-8">
                    <a href="#features" class="nav-link text-gray-300 hover:text-primary">Success Stories</a>
                    <a href="#how-it-works" class="nav-link text-gray-300 hover:text-primary">How It Works</a>
                    <a href="#pricing" class="nav-link text-gray-300 hover:text-primary">Pricing</a>
                    <a href="/docs" class="nav-link text-gray-300 hover:text-primary">API Docs</a>
                    <a href="#history" id="historyLink" class="nav-link text-gray-300 hover:text-primary hidden">My Analyses</a>
                    
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
                            <span id="userCreditsBadge" class="hidden text-xs text-primary bg-primary/10 px-2 py-1 rounded border border-primary/40">0 credits</span>
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
                <a href="/docs" class="mobile-menu-item block text-gray-300 hover:text-primary py-2">API Docs</a>
                <a href="#history" id="mobileHistoryLink" class="mobile-menu-item block text-gray-300 hover:text-primary py-2 hidden">My Analyses</a>
            </div>
        </div>
    </nav>
    
    <!-- Main Content -->
    <main>
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

        <!-- Success Stories Section -->
        <section id="features" class="py-20 bg-slate-800">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center mb-16">
                    <h2 class="text-4xl font-bold text-white mb-4">Success Stories</h2>
                    <p class="text-xl text-gray-300 max-w-3xl mx-auto">
                        See how professionals like you have transformed their careers with AI-powered insights
                    </p>
                </div>
                
                <div class="grid md:grid-cols-3 gap-8">
                    <div class="bg-slate-700 rounded-lg p-6 border border-slate-600">
                        <div class="flex items-center mb-4">
                            <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                                <i class="fas fa-user-tie text-white"></i>
                            </div>
                            <div class="ml-4">
                                <h3 class="font-semibold text-white">Sarah M.</h3>
                                <p class="text-gray-400">Software Engineer</p>
                            </div>
                        </div>
                        <p class="text-gray-300 mb-4">
                            "Discovered I was missing cloud architecture skills. Got certified and landed a senior role with 40% salary increase!"
                        </p>
                        <div class="flex items-center text-primary">
                            <i class="fas fa-arrow-up mr-2"></i>
                            <span class="font-semibold">40% salary increase</span>
                        </div>
                    </div>

                    <div class="bg-slate-700 rounded-lg p-6 border border-slate-600">
                        <div class="flex items-center mb-4">
                            <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                                <i class="fas fa-chart-line text-white"></i>
                            </div>
                            <div class="ml-4">
                                <h3 class="font-semibold text-white">Mike R.</h3>
                                <p class="text-gray-400">Marketing Manager</p>
                            </div>
                        </div>
                        <p class="text-gray-300 mb-4">
                            "Identified data analytics gap in my profile. Upskilled and transitioned to Growth Marketing Director."
                        </p>
                        <div class="flex items-center text-primary">
                            <i class="fas fa-rocket mr-2"></i>
                            <span class="font-semibold">Career transition</span>
                        </div>
                    </div>

                    <div class="bg-slate-700 rounded-lg p-6 border border-slate-600">
                        <div class="flex items-center mb-4">
                            <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                                <i class="fas fa-graduation-cap text-white"></i>
                            </div>
                            <div class="ml-4">
                                <h3 class="font-semibold text-white">Lisa K.</h3>
                                <p class="text-gray-400">Recent Graduate</p>
                            </div>
                        </div>
                        <p class="text-gray-300 mb-4">
                            "Found out which skills employers actually wanted. Focused learning and got hired in 2 weeks!"
                        </p>
                        <div class="flex items-center text-primary">
                            <i class="fas fa-clock mr-2"></i>
                            <span class="font-semibold">2 weeks to hire</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- How It Works Section -->
        <section id="how-it-works" class="py-20 bg-slate-900">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center mb-16">
                    <h2 class="text-4xl font-bold text-white mb-4">How It Works</h2>
                    <p class="text-xl text-gray-300 max-w-3xl mx-auto">
                        Get personalized career insights in minutes with our AI-powered analysis
                    </p>
                </div>
                
                <div class="grid md:grid-cols-3 gap-8">
                    <div class="text-center">
                        <div class="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                            <i class="fas fa-upload text-white text-2xl"></i>
                        </div>
                        <h3 class="text-2xl font-bold text-white mb-4">1. Upload Your Resume</h3>
                        <p class="text-gray-300">
                            Simply upload your CV or paste your resume text. Our AI supports multiple formats including PDF, Word, and plain text.
                        </p>
                    </div>

                    <div class="text-center">
                        <div class="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                            <i class="fas fa-brain text-white text-2xl"></i>
                        </div>
                        <h3 class="text-2xl font-bold text-white mb-4">2. AI Analysis</h3>
                        <p class="text-gray-300">
                            Our advanced AI analyzes your skills, experience, and career trajectory against current market demands and job requirements.
                        </p>
                    </div>

                    <div class="text-center">
                        <div class="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                            <i class="fas fa-chart-bar text-white text-2xl"></i>
                        </div>
                        <h3 class="text-2xl font-bold text-white mb-4">3. Get Insights</h3>
                        <p class="text-gray-300">
                            Receive detailed insights on skill gaps, career recommendations, and actionable steps to advance your professional journey.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Pricing Section -->
        <section id="pricing" class="py-20 bg-slate-800">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center mb-16">
                    <h2 class="text-4xl font-bold text-white mb-4">Pricing</h2>
                    <p class="text-xl text-gray-300 max-w-3xl mx-auto">
                        Choose the plan that fits your career development needs
                    </p>
                </div>
                
                        <div class="grid md:grid-cols-3 gap-8">
                            <div class="bg-slate-700 rounded-lg p-8 border border-slate-600">
                                <h3 class="text-2xl font-bold text-white mb-2">Starter Pack</h3>
                                <div class="text-4xl font-bold text-primary mb-2">$5</div>
                                <div class="text-gray-400 mb-4">4 analyses</div>
                                <ul class="space-y-3 mb-8">
                                    <li class="flex items-center text-gray-300"><i class="fas fa-check text-primary mr-3"></i>Pay-as-you-go</li>
                                    <li class="flex items-center text-gray-300"><i class="fas fa-check text-primary mr-3"></i>No subscription</li>
                                </ul>
                                <button data-plan="pack-4" class="buy-plan w-full bg-primary hover:bg-primary/80 text-white py-3 px-6 rounded-lg transition-colors">
                                    Buy Starter
                                </button>
                            </div>

                            <div class="bg-slate-700 rounded-lg p-8 border-2 border-primary relative">
                                <div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                    <span class="bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold">Most Popular</span>
                                </div>
                                <h3 class="text-2xl font-bold text-white mb-2">Pro Pack</h3>
                                <div class="text-4xl font-bold text-primary mb-2">$10</div>
                                <div class="text-gray-400 mb-4">10 analyses</div>
                                <ul class="space-y-3 mb-8">
                                    <li class="flex items-center text-gray-300"><i class="fas fa-check text-primary mr-3"></i>Best value for active users</li>
                                    <li class="flex items-center text-gray-300"><i class="fas fa-check text-primary mr-3"></i>No subscription</li>
                                </ul>
                                <button data-plan="pack-10" class="buy-plan w-full bg-primary hover:bg-primary/80 text-white py-3 px-6 rounded-lg transition-colors">
                                    Buy Pro Pack
                                </button>
                            </div>

                            <div class="bg-slate-700 rounded-lg p-8 border border-slate-600">
                                <h3 class="text-2xl font-bold text-white mb-2">Power Pack</h3>
                                <div class="text-4xl font-bold text-primary mb-2">$20</div>
                                <div class="text-gray-400 mb-4">30 analyses</div>
                                <ul class="space-y-3 mb-8">
                                    <li class="flex items-center text-gray-300"><i class="fas fa-check text-primary mr-3"></i>Highest value per analysis</li>
                                    <li class="flex items-center text-gray-300"><i class="fas fa-check text-primary mr-3"></i>No subscription</li>
                                </ul>
                                <button data-plan="pack-30" class="buy-plan w-full bg-primary hover:bg-primary/80 text-white py-3 px-6 rounded-lg transition-colors">
                                    Buy Power Pack
                                </button>
                            </div>
                        </div>
            </div>
    </section>

    <!-- My Analyses History Section -->
    <section id="history" class="py-20 bg-slate-900 hidden">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-12">
                <h2 class="text-4xl font-bold text-white mb-4">My Analysis History</h2>
                <p class="text-xl text-gray-300">
                    View and manage all your previous resume analyses
                </p>
            </div>
            
            <!-- Filter and Sort Controls -->
            <div class="bg-slate-800 rounded-lg p-4 mb-6 flex flex-wrap gap-4 items-center justify-between">
                <div class="flex gap-4 items-center">
                    <select id="historyFilter" class="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-primary">
                        <option value="all">All Analyses</option>
                        <option value="completed">Completed</option>
                        <option value="processing">Processing</option>
                        <option value="failed">Failed</option>
                    </select>
                    <select id="historySort" class="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-primary">
                        <option value="recent">Most Recent</option>
                        <option value="oldest">Oldest First</option>
                    </select>
                </div>
                <div class="flex gap-4 items-center">
                    <span id="historyCount" class="text-gray-400">Loading...</span>
                    <button id="refreshHistory" class="bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-lg transition-colors">
                        <i class="fas fa-sync-alt mr-2"></i>Refresh
                    </button>
                </div>
            </div>
            
            <!-- History Content -->
            <div id="historyContent">
                <!-- Loading State -->
                <div id="historyLoading" class="text-center py-12">
                    <div class="inline-flex items-center justify-center w-16 h-16 bg-slate-800 rounded-full mb-4">
                        <i class="fas fa-spinner fa-spin text-primary text-2xl"></i>
                    </div>
                    <p class="text-gray-400">Loading your analysis history...</p>
                </div>
                
                <!-- Empty State -->
                <div id="historyEmpty" class="hidden text-center py-12">
                    <div class="inline-flex items-center justify-center w-16 h-16 bg-slate-800 rounded-full mb-4">
                        <i class="fas fa-folder-open text-gray-500 text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-300 mb-2">No Analyses Yet</h3>
                    <p class="text-gray-400 mb-6">Start by analyzing your resume to see results here</p>
                    <button onclick="showAnalysisInterface()" class="bg-primary hover:bg-primary/80 text-white px-6 py-3 rounded-lg transition-colors">
                        <i class="fas fa-plus mr-2"></i>Analyze Resume Now
                    </button>
                </div>
                
                <!-- History Grid -->
                <div id="historyGrid" class="hidden grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <!-- Analysis cards will be dynamically inserted here -->
                </div>
            </div>
        </div>
    </section>

    <!-- Demo Section -->
        <section id="demo" class="py-20 bg-slate-900">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center mb-12">
                    <h2 class="text-4xl font-bold text-white mb-4">See What to Expect</h2>
                    <p class="text-xl text-gray-300">
                        Here's a sample of how our AI analyzes your resume against job descriptions to provide actionable insights
                    </p>
                </div>
                
                <div class="grid lg:grid-cols-3 gap-6">
                    <!-- Sample Resume -->
                    <div class="bg-slate-800 rounded-lg p-6 border border-slate-700">
                        <div class="flex items-center mb-4">
                            <i class="fas fa-file-alt text-primary mr-2"></i>
                            <h3 class="text-lg font-semibold text-white">Sample Resume</h3>
                        </div>
                        <div class="bg-slate-900 rounded p-4 text-sm text-gray-300 font-mono">
                            <p class="font-bold text-primary mb-2">John Smith</p>
                            <p class="mb-3">Full-Stack Developer | 5 years experience</p>
                            
                            <p class="text-xs text-gray-400 mb-1">SKILLS:</p>
                            <p class="mb-3">• JavaScript, React, Node.js<br/>• Python, Django<br/>• SQL, MongoDB<br/>• Git, Docker</p>
                            
                            <p class="text-xs text-gray-400 mb-1">EXPERIENCE:</p>
                            <p class="mb-2">Senior Developer at TechCorp<br/>
                            • Led team of 4 developers<br/>
                            • Built RESTful APIs<br/>
                            • Improved app performance by 40%</p>
                            
                            <p class="text-xs text-gray-400 mb-1">EDUCATION:</p>
                            <p>BS Computer Science, State University</p>
                        </div>
                    </div>
                    
                    <!-- Sample Job Description -->
                    <div class="bg-slate-800 rounded-lg p-6 border border-slate-700">
                        <div class="flex items-center mb-4">
                            <i class="fas fa-briefcase text-primary mr-2"></i>
                            <h3 class="text-lg font-semibold text-white">Sample Job Description</h3>
                        </div>
                        <div class="bg-slate-900 rounded p-4 text-sm text-gray-300 font-mono">
                            <p class="font-bold text-primary mb-2">Senior Full-Stack Engineer</p>
                            <p class="mb-3">Leading Tech Company | Remote</p>
                            
                            <p class="text-xs text-gray-400 mb-1">REQUIREMENTS:</p>
                            <p class="mb-3">• 5+ years full-stack development<br/>
                            • Expert in React & TypeScript<br/>
                            • Experience with AWS services<br/>
                            • Knowledge of microservices<br/>
                            • GraphQL experience preferred<br/>
                            • CI/CD pipeline expertise</p>
                            
                            <p class="text-xs text-gray-400 mb-1">NICE TO HAVE:</p>
                            <p>• Kubernetes experience<br/>
                            • Machine learning basics<br/>
                            • Agile/Scrum certification</p>
                        </div>
                    </div>
                    
                    <!-- AI Analysis Result -->
                    <div class="bg-gradient-to-br from-slate-800 to-slate-700 rounded-lg p-6 border-2 border-primary">
                        <div class="flex items-center mb-4">
                            <i class="fas fa-magic text-primary mr-2"></i>
                            <h3 class="text-lg font-semibold text-white">AI Analysis Result</h3>
                        </div>
                        <div class="space-y-4">
                            <!-- Match Score -->
                            <div class="bg-slate-900/50 rounded p-3">
                                <div class="flex justify-between items-center mb-2">
                                    <span class="text-sm text-gray-400">Match Score</span>
                                    <span class="text-2xl font-bold text-primary">72%</span>
                                </div>
                                <div class="w-full bg-slate-700 rounded-full h-2">
                                    <div class="bg-primary h-2 rounded-full" style="width: 72%"></div>
                                </div>
                            </div>
                            
                            <!-- Missing Skills -->
                            <div class="bg-red-900/20 rounded p-3 border border-red-500/30">
                                <p class="text-sm font-semibold text-red-400 mb-2">
                                    <i class="fas fa-exclamation-triangle mr-1"></i> Critical Gaps:
                                </p>
                                <ul class="text-xs text-red-300 space-y-1">
                                    <li>• TypeScript (Required)</li>
                                    <li>• AWS Services</li>
                                    <li>• GraphQL</li>
                                    <li>• Kubernetes</li>
                                </ul>
                            </div>
                            
                            <!-- Recommendations -->
                            <div class="bg-green-900/20 rounded p-3 border border-green-500/30">
                                <p class="text-sm font-semibold text-green-400 mb-2">
                                    <i class="fas fa-lightbulb mr-1"></i> Quick Wins:
                                </p>
                                <ul class="text-xs text-green-300 space-y-1">
                                    <li>• Add TypeScript to your stack (2-3 weeks)</li>
                                    <li>• Get AWS Certified (4-6 weeks)</li>
                                    <li>• Build a GraphQL project (1-2 weeks)</li>
                                    <li>• Highlight team leadership experience</li>
                                </ul>
                            </div>
                            
                            <!-- Action Button -->
                            <button id="startAnalysisFromDemo" class="w-full bg-primary hover:bg-primary/80 text-white py-3 px-4 rounded-lg font-semibold transition-colors">
                                <i class="fas fa-rocket mr-2"></i>
                                Analyze Your Resume Now
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Additional Info -->
                <div class="mt-12 text-center">
                    <p class="text-gray-400 mb-4">
                        <i class="fas fa-info-circle mr-2"></i>
                        Our AI analyzes your resume against real job descriptions to identify skill gaps and provide personalized recommendations
                    </p>
                    <div class="flex flex-wrap justify-center gap-4 text-sm">
                        <div class="flex items-center text-gray-300">
                            <i class="fas fa-check-circle text-green-400 mr-2"></i>
                            <span>No credit card required</span>
                        </div>
                        <div class="flex items-center text-gray-300">
                            <i class="fas fa-check-circle text-green-400 mr-2"></i>
                            <span>Results in seconds</span>
                        </div>
                        <div class="flex items-center text-gray-300">
                            <i class="fas fa-check-circle text-green-400 mr-2"></i>
                            <span>100% confidential</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <!-- Footer -->
    <footer class="bg-slate-800 border-t border-slate-700 py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid md:grid-cols-4 gap-8">
                <div>
                    <h3 class="text-xl font-bold text-primary mb-4">Clearsight IP</h3>
                    <p class="text-gray-300 mb-4">
                        AI-powered career insights and skills analysis platform for professional growth.
                    </p>
                    <div class="flex space-x-4">
                        <a href="#" class="text-gray-400 hover:text-primary">
                            <i class="fab fa-twitter text-xl"></i>
                        </a>
                        <a href="#" class="text-gray-400 hover:text-primary">
                            <i class="fab fa-linkedin text-xl"></i>
                        </a>
                        <a href="#" class="text-gray-400 hover:text-primary">
                            <i class="fab fa-github text-xl"></i>
                        </a>
                    </div>
                </div>
                
                <div>
                    <h4 class="font-semibold text-white mb-4">Product</h4>
                    <ul class="space-y-2">
                        <li><a href="#features" class="text-gray-300 hover:text-primary">Features</a></li>
                        <li><a href="#pricing" class="text-gray-300 hover:text-primary">Pricing</a></li>
                        <li><a href="#demo" class="text-gray-300 hover:text-primary">Demo</a></li>
                        <li><a href="/docs" class="text-gray-300 hover:text-primary">API Docs</a></li>
                    </ul>
                </div>
                
                <div>
                    <h4 class="font-semibold text-white mb-4">Company</h4>
                    <ul class="space-y-2">
                        <li><a href="#" class="text-gray-300 hover:text-primary">About</a></li>
                        <li><a href="#" class="text-gray-300 hover:text-primary">Blog</a></li>
                        <li><a href="#" class="text-gray-300 hover:text-primary">Careers</a></li>
                        <li><a href="#" class="text-gray-300 hover:text-primary">Contact</a></li>
                    </ul>
                </div>
                
                <div>
                    <h4 class="font-semibold text-white mb-4">Support</h4>
                    <ul class="space-y-2">
                        <li><a href="#" class="text-gray-300 hover:text-primary">Help Center</a></li>
                        <li><a href="#" class="text-gray-300 hover:text-primary">Privacy Policy</a></li>
                        <li><a href="#" class="text-gray-300 hover:text-primary">Terms of Service</a></li>
                        <li><a href="#" class="text-gray-300 hover:text-primary">Status</a></li>
                    </ul>
                </div>
            </div>
            
            <div class="border-t border-slate-700 mt-8 pt-8 text-center">
                <p class="text-gray-400">
                    © 2024 Clearsight IP. All rights reserved. Built with ❤️ for career growth.
                </p>
            </div>
        </div>
    </footer>

    <!-- Auth Modal -->
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

    <!-- Analysis Interface Modal -->
    <div id="analysisInterface" class="hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div id="analysisModal" class="bg-slate-800 rounded-lg w-full max-w-4xl my-8 flex flex-col transition-all duration-300 max-h-[calc(100vh-4rem)] overflow-hidden">
            <!-- Header -->
            <div class="p-6 border-b border-slate-700 flex-shrink-0">
                <div class="flex justify-between items-center">
                    <h2 class="text-2xl font-bold text-primary">AI-Powered Skills Analysis</h2>
                    <button id="closeAnalysisInterface" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
            </div>

            <!-- Tab Navigation -->
            <div class="border-b border-slate-700">
                <div class="flex px-6">
                    <button id="uploadTabBtn" class="tab-button px-6 py-3 text-white border-b-2 border-primary transition-colors">
                        <i class="fas fa-upload mr-2"></i>
                        <span>Resume (CV)</span>
                    </button>
                    <button id="jobTabBtn" class="tab-button px-6 py-3 text-gray-400 border-b-2 border-transparent hover:text-white transition-colors">
                        <i class="fas fa-briefcase mr-2"></i>
                        <span>Job Description</span>
                        <span class="ml-2 text-xs opacity-60">(Optional)</span>
                    </button>
                    <button id="analysisTabBtn" class="tab-button px-6 py-3 text-gray-400 border-b-2 border-transparent hover:text-white transition-colors" disabled>
                        <i class="fas fa-brain mr-2"></i>
                        <span>Analysis</span>
                    </button>
                </div>
            </div>

            <!-- Main content container -->
            <div class="flex-1 overflow-y-auto">
                    <!-- Tab Content Container -->
                    <div id="tabContentContainer">
                        <!-- Upload Tab Content -->
                        <div id="uploadTabContent" class="tab-content p-6">
                    <div class="mb-6 text-center">
                        <i class="fas fa-upload text-4xl text-primary mb-3"></i>
                        <h3 class="text-xl font-bold text-white mb-2">Upload Your Resume</h3>
                        <p class="text-gray-300 text-sm mb-4">
                            Upload your CV or paste your resume text to get started with AI-powered analysis
                        </p>
                    </div>
                    
                    <div class="grid md:grid-cols-2 gap-4 mb-6">
                        <div class="border-2 border-dashed border-gray-600 rounded-lg p-4 hover:border-primary transition-colors cursor-pointer text-center" id="fileUploadArea">
                            <i class="fas fa-file-upload text-2xl text-gray-400 mb-2"></i>
                            <p class="text-gray-300 text-sm mb-1">Drop your resume here</p>
                            <p class="text-xs text-gray-400">PDF, DOC, DOCX, TXT</p>
                            <input type="file" id="resumeFileInput" class="hidden" accept=".pdf,.doc,.docx,.txt">
                        </div>
                        
                        <div class="border border-gray-600 rounded-lg p-4">
                            <div class="text-center mb-3">
                                <i class="fas fa-keyboard text-2xl text-gray-400 mb-2"></i>
                                <p class="text-gray-300 text-sm">Or paste your resume text</p>
                            </div>
                            <textarea id="resumeTextArea" class="w-full h-24 bg-slate-700 border border-slate-600 rounded-lg p-3 text-white text-sm resize-none focus:outline-none focus:border-primary" placeholder="Paste your resume content here..."></textarea>
                        </div>
                    </div>
                    
                    <div class="flex justify-end">
                        <button id="continueToJobBtn" class="bg-primary hover:bg-primary/80 text-white px-8 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                            Continue to Job Description
                            <i class="fas fa-arrow-right ml-2"></i>
                        </button>
                    </div>
                </div>
                
                <!-- Job Tab Content -->
                <div id="jobTabContent" class="tab-content hidden p-6">
                    <div class="mb-6 text-center">
                        <i class="fas fa-briefcase text-4xl text-primary mb-3"></i>
                        <h3 class="text-xl font-bold text-white mb-2">Job Description (Optional)</h3>
                        <p class="text-gray-300 text-sm mb-4">
                            Add a job description for targeted skills gap analysis and job fit assessment
                        </p>
                    </div>
                    
                    <div class="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
                        <div class="flex items-center">
                            <i class="fas fa-info-circle text-blue-400 mr-3"></i>
                            <p class="text-blue-300 text-sm">
                                This step is optional. Skip it for a general career analysis or add a job description for specific job fit insights.
                            </p>
                        </div>
                    </div>
                    
                    <div class="mb-6">
                        <label class="block text-sm font-medium text-gray-300 mb-2">Paste Job Description</label>
                        <textarea id="jobDescriptionTextArea" class="w-full h-48 bg-slate-700 border border-slate-600 rounded-lg p-3 text-white text-sm resize-none focus:outline-none focus:border-primary" placeholder="Paste the complete job description here for detailed job fit analysis...

Example:
Senior Software Engineer - Frontend Focus
Company: TechCorp Inc.

Requirements:
- 5+ years of React development experience
- Strong TypeScript skills
- Experience with modern CI/CD pipelines
..."></textarea>
                    </div>
                    
                    <div class="flex justify-between items-center">
                        <button id="backToUploadBtn" class="text-gray-400 hover:text-white transition-colors">
                            <i class="fas fa-arrow-left mr-2"></i>
                            Back
                        </button>
                        <div>
                            <button id="skipAnalysisBtn" class="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors mr-3">
                                Skip to Analysis
                            </button>
                            <button id="startAnalysisBtn" class="bg-primary hover:bg-primary/80 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                                <i class="fas fa-brain mr-2"></i>
                                Start AI Analysis
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Analysis Tab Content -->
                <div id="analysisTabContent" class="tab-content hidden">
                
                <!-- Loading Section -->
                <div id="loadingSection" class="hidden">
                    <div class="text-center py-12">
                        <div class="relative mb-8">
                            <!-- Animated AI Brain -->
                            <div class="relative mx-auto w-24 h-24 mb-6">
                                <div class="absolute inset-0 bg-gradient-to-r from-primary to-blue-400 rounded-full animate-pulse"></div>
                                <div class="absolute inset-2 bg-slate-800 rounded-full flex items-center justify-center">
                                    <i class="fas fa-brain text-2xl text-primary animate-bounce"></i>
                                </div>
                                <!-- Orbiting dots -->
                                <div class="absolute inset-0 animate-spin">
                                    <div class="absolute top-0 left-1/2 w-2 h-2 bg-primary rounded-full transform -translate-x-1/2 -translate-y-1"></div>
                                    <div class="absolute bottom-0 left-1/2 w-2 h-2 bg-blue-400 rounded-full transform -translate-x-1/2 translate-y-1"></div>
                                    <div class="absolute left-0 top-1/2 w-2 h-2 bg-green-400 rounded-full transform -translate-y-1/2 -translate-x-1"></div>
                                    <div class="absolute right-0 top-1/2 w-2 h-2 bg-purple-400 rounded-full transform -translate-y-1/2 translate-x-1"></div>
                                </div>
                            </div>
                            
                            <h3 class="text-2xl font-bold text-white mb-4">
                                <i class="fas fa-magic mr-2 text-primary"></i>
                                AI Analysis in Progress
                            </h3>
                            <p class="text-gray-300 mb-6">Our AI is working its magic on your resume!</p>
                            
                            <!-- Dynamic Loading Message -->
                            <p id="progressText" class="text-lg text-primary animate-pulse font-medium mb-4">🧠 Initializing AI brain...</p>
                            
                            <!-- Mini Game Section -->
                            <div class="bg-slate-700/50 rounded-lg p-4 max-w-md mx-auto border border-slate-600">
                                <h4 class="text-sm font-semibold text-primary mb-3">🎮 While You Wait: Reaction Game!</h4>
                                <div id="gameArea" class="mb-3">
                                    <div id="gameInstructions" class="text-xs text-gray-400 mb-2">
                                        Click the button when it turns green! Test your reflexes.
                                    </div>
                                    <button id="gameButton" class="w-full py-3 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors duration-200 cursor-pointer">
                                        🔴 Wait for it...
                                    </button>
                                    <div id="gameScore" class="text-xs text-gray-400 mt-2 min-h-4">
                                        Best reaction time: --
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Results Section -->
                <div id="resultsSection" class="hidden p-6">
                    <div id="resultsContent">
                        <!-- Results will be populated here dynamically -->
                    </div>
                </div>
                    </div>
            </div>
        </div>
    </div>

    <script>
        // Application State
        const AppState = {
            currentModal: null,
            resumeFile: null,
            resumeText: '',
            isAnalyzing: false,
            user: null,
            authToken: null,
            currentAnalysisId: null,
            currentMessageIndex: 0,
            progressInterval: null,
            messageInterval: null,
            pollInterval: null,
            analysisStartTs: 0,
            estimatedTotalMs: 60000,
            loadingActive: false,
            credits: 0
        };

        // Catchy loading messages
        const LOADING_MESSAGES = [
            "🧠 Spinning up the AI engines...",
            "📄 Skimming your resume like a seasoned recruiter...",
            "🔍 Spotting achievements worth bragging about...",
            "🎯 Mapping your strengths to real job requirements...",
            "🧩 Piecing together your standout story...",
            "📈 Estimating your role fit with evidence...",
            "✨ Polishing actionable CV improvements...",
            "🧪 Pressure-testing examples for interviews...",
            "🚀 Drafting your personalized action plan...",
            "🎉 Wrapping up with next steps you can use today...",
            "🤖 Teaching robots to appreciate your awesomeness...",
            "📊 Crunching numbers like a caffeinated accountant...",
            "🎭 Rehearsing your elevator pitch with Shakespeare...",
            "🔬 Analyzing your potential with scientific precision...",
            "🎪 Juggling your skills like a career circus performer...",
            "🧙‍♂️ Casting spells to make recruiters notice you...",
            "🎨 Painting your professional masterpiece...",
            "🏆 Polishing your achievements until they shine...",
            "🎯 Aiming for career bullseyes...",
            "🚀 Launching your career into orbit...",
            "🔮 Predicting your bright professional future...",
            "🎵 Composing your career symphony...",
            "🏗️ Building bridges to your dream job...",
            "🌟 Sprinkling some career magic dust...",
            "🎲 Rolling the dice of opportunity...",
            "🧰 Refactoring your career story for maximum readability...",
            "🛰️ Beaming your highlights to hiring satellites...",
            "🧗‍♀️ Climbing the leaderboard of skills...",
            "🍀 Optimizing for lucky breaks (backed by data)...",
            "🧯 Extinguishing buzzwords, igniting impact...",
            "🧭 Aligning your trajectory with dream-role north...",
            "🍕 Slicing your experience into delicious, bite‑size wins...",
            "💡 Upgrading bullets from 'did things' to 'changed outcomes'...",
            "🛠️ Calibrating keywords to bypass grumpy ATS robots...",
            "📦 Packaging achievements with measurable ribbons...",
            "🎈 Inflating confidence (facts first, fluff never)...",
            "🧩 Matching your puzzle pieces with market demand...",
            "🛰️ Scanning the job galaxy for perfect orbits...",
            "🎮 Unlocking hidden skill combos and power‑ups...",
            "🧴 Polishing the 'wow' until it sparkles...",
            "🧭 Plotting a fast path from here → dream role..."
        ];

        // Rotating fun tips/facts displayed under the progress
        const FUN_FACTS = [
            "💡 Tip: Quantified results (numbers!) are recruiter magnets.",
            "🎯 Pro: Mirror the job's top keywords in your resume summary.",
            "📈 Did you know? Tailored CVs get up to 3x more interviews.",
            "✨ Tip: Replace responsibilities with outcomes to stand out.",
            "⚡ Pro: Keep bullets crisp—1 line wins more attention than 3.",
            "🎪 Tip: Align your skills section with the job's requirements.",
            "🚀 Pro: Lead with impact verbs—built, led, launched, improved.",
            "⏰ Did you know? Most scans happen in under 10 seconds.",
            "🎭 Fun fact: 'Responsible for' is the most overused phrase on resumes.",
            "🧠 Pro tip: Use the STAR method (Situation, Task, Action, Result).",
            "🎨 Did you know? White space makes your resume easier to read.",
            "🔍 Tip: ATS systems love simple, clean formatting.",
            "🎯 Pro: Your resume should tell a story, not list duties.",
            "💎 Fun fact: The average recruiter spends 7.4 seconds on a resume.",
            "🌟 Tip: Include soft skills through examples, not just lists.",
            "🎪 Did you know? 75% of resumes never reach human eyes (ATS filters)."
        ];

        // Combined messages for loading screen
        const COMBINED_MESSAGES = LOADING_MESSAGES.concat(FUN_FACTS);

        // API Configuration
        const API_BASE_URL = '/api';
        const API_V1_BASE_URL = '/api/v1';
        const API_BILLING_BASE_URL = '/api/billing';
        const API_ENDPOINTS = {
            login: API_V1_BASE_URL + '/auth/login',
            register: API_V1_BASE_URL + '/auth/register',
            logout: API_V1_BASE_URL + '/auth/logout',
            me: API_V1_BASE_URL + '/auth/me',
            analyzeResume: API_V1_BASE_URL + '/analyze/resume',
            analysisHistory: API_V1_BASE_URL + '/analyze/history',
            getAnalysis: (id) => API_V1_BASE_URL + '/analyze/history/' + id,
            deleteAnalysis: (id) => API_V1_BASE_URL + '/analyze/history/' + id,
            // Billing endpoints
            billingPlans: API_BILLING_BASE_URL + '/plans',
            billingCredits: API_BILLING_BASE_URL + '/credits',
            billingPurchase: API_BILLING_BASE_URL + '/purchase', // legacy simulation
            billingCheckout: API_BILLING_BASE_URL + '/checkout',
            billingConfirm: API_BILLING_BASE_URL + '/confirm'
        };

        // Initialize application
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Clearsight IP application initializing...');
            
            // Setup all event listeners
            setupNavigationListeners();
            setupAuthListeners();
            setupAnalysisListeners();
            setupHistoryListeners();
            setupUIListeners();
            
            // Check authentication status
            checkAuthStatus();

            // Attach purchase handlers
            attachBuyPlanHandlers();

            // Handle Stripe checkout return (success/cancel)
            handleCheckoutReturn();
            
            console.log('Clearsight IP application loaded successfully!');
        });

        // Authentication status check
        async function checkAuthStatus() {
            try {
                console.log('Checking authentication status...');
                const response = await fetch(API_ENDPOINTS.me, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                console.log('Auth check response status:', response.status);

                if (response.ok) {
                    const data = await response.json();
                    console.log('Auth check data:', data);
                    if (data.success && data.data && data.data.user) {
                        AppState.user = data.data.user;
                        updateUIForAuthenticatedUser();
                        console.log('User authenticated:', AppState.user.email);
                        return true;
                    }
                } else if (response.status === 401) {
                    // Token expired during auth check - silently log out
                    console.log('Auth token expired or invalid');
                    AppState.user = null;
                    updateUIForUnauthenticatedUser();
                    return false;
                }
            } catch (error) {
                console.log('User not authenticated:', error);
                return false;
            }
        }

        // Update UI for authenticated user
        function updateUIForAuthenticatedUser() {
            const authButtons = document.getElementById('authButtons');
            const userMenu = document.getElementById('userMenu');
            const userEmail = document.getElementById('userEmail');
            const historyLink = document.getElementById('historyLink');
            const mobileHistoryLink = document.getElementById('mobileHistoryLink');

            if (authButtons && userMenu && userEmail && AppState.user) {
                authButtons.classList.add('hidden');
                userMenu.classList.remove('hidden');
                userEmail.textContent = AppState.user.email;
                
                // Show My Analyses links
                if (historyLink) historyLink.classList.remove('hidden');
                if (mobileHistoryLink) mobileHistoryLink.classList.remove('hidden');

                // Fetch and display credits
                fetchCredits();
            }
        }

        // Update UI for unauthenticated user
        function updateUIForUnauthenticatedUser() {
            const authButtons = document.getElementById('authButtons');
            const userMenu = document.getElementById('userMenu');

            if (authButtons && userMenu) {
                authButtons.classList.remove('hidden');
                userMenu.classList.add('hidden');
            }
            
            AppState.user = null;
            AppState.credits = 0;
            updateCreditsUI();
        }

        // Navigation functionality
        function setupNavigationListeners() {
            // Smooth scrolling for navigation links
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const targetId = this.getAttribute('href');
                    const target = document.querySelector(targetId);
                    
                    // Handle history section specially
                    if (targetId === '#history') {
                        handleHistoryNavigation();
                    } else if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                        closeMobileMenu();
                    }
                });
            });

            // Mobile menu toggle
            document.getElementById('mobileMenuBtn')?.addEventListener('click', toggleMobileMenu);
        }

        // Billing helpers
        async function fetchCredits() {
            if (!AppState.user) {
                AppState.credits = 0;
                updateCreditsUI();
                return 0;
            }
            try {
                const res = await fetch(API_ENDPOINTS.billingCredits, { method: 'GET', credentials: 'include' });
                if (!res.ok) throw new Error('Failed credits fetch');
                const data = await res.json();
                AppState.credits = typeof data.credits === 'number' ? data.credits : 0;
                updateCreditsUI();
                return AppState.credits;
            } catch (e) {
                AppState.credits = 0;
                updateCreditsUI();
                return 0;
            }
        }

        function updateCreditsUI() {
            const badge = document.getElementById('userCreditsBadge');
            if (!badge) return;
            if (AppState.user) {
                badge.textContent = (AppState.credits || 0) + ' credits';
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
            // Re-evaluate analysis button state
            updateAnalysisButton();
        }

        function attachBuyPlanHandlers() {
            document.querySelectorAll('button.buy-plan')?.forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    if (!AppState.user) {
                        showAuthModal('login');
                        showNotification('Please log in to purchase credits.', 'info');
                        return;
                    }
                    const targetEl = e.currentTarget instanceof HTMLElement ? e.currentTarget : (e.target instanceof HTMLElement ? e.target : null);
                    const planId = targetEl ? targetEl.getAttribute('data-plan') : null;
                    if (!planId) return;
                    try {
                        // Create Stripe Checkout session
                        const res = await fetch(API_ENDPOINTS.billingCheckout, {
                            method: 'POST',
                            credentials: 'include',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ planId })
                        });

                        // Try to parse JSON (may fail if upstream error)
                        let data = null;
                        try { data = await res.json(); } catch (_) { /* ignore */ }

                        if (res.ok && data?.url) {
                            // Redirect to Stripe Checkout
                            window.location.href = data.url;
                            return;
                        }

                        // Graceful fallback: if Stripe isn't configured or checkout failed, simulate purchase
                        const code = data?.error?.code || 'UNKNOWN';
                        const shouldFallback = (
                            code === 'STRIPE_NOT_CONFIGURED' ||
                            code === 'STRIPE_PRICE_MISSING' ||
                            code === 'STRIPE_CHECKOUT_ERROR' ||
                            (!res.ok && res.status >= 500)
                        );

                        if (shouldFallback) {
                            // Attempt simulated purchase to credit the account directly
                            try {
                                const simRes = await fetch(API_ENDPOINTS.billingPurchase, {
                                    method: 'POST',
                                    credentials: 'include',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ planId })
                                });
                                const simData = await simRes.json();
                                if (simRes.ok && simData?.success) {
                                    AppState.credits = typeof simData.credits === 'number' ? simData.credits : AppState.credits;
                                    updateCreditsUI();
                                    showNotification('Checkout unavailable. Credits added directly to your account.', 'success');
                                    return;
                                }
                                showNotification(simData?.error?.message || 'Purchase failed. Please try again later.', 'error');
                                return;
                            } catch (fallbackErr) {
                                showNotification('Unable to process purchase at this time. Please try again later.', 'error');
                                return;
                            }
                        }

                        // Otherwise, show upstream error
                        showNotification(data?.error?.message || 'Unable to start checkout', 'error');
                    } catch (err) {
                        showNotification('Failed to start checkout. Please try again.', 'error');
                    }
                });
            });
        }

        function goToPricing() {
            const el = document.getElementById('pricing');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // Handle Stripe checkout return
        async function handleCheckoutReturn() {
            try {
                const url = new URL(window.location.href);
                const purchase = url.searchParams.get('purchase');
                const sessionId = url.searchParams.get('session_id');
                if (purchase === 'success' && sessionId) {
                    showNotification('Processing your purchase...', 'info');
                    const res = await fetch(API_ENDPOINTS.billingConfirm, {
                        method: 'POST',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ sessionId })
                    });
                    const data = await res.json();
                    if (res.ok) {
                        AppState.credits = data.credits || 0;
                        updateCreditsUI();
                        showNotification('Credits added! Thank you for your purchase.', 'success');
                    } else {
                        showNotification(data?.error?.message || 'Could not verify payment. If you were charged, please contact support.', 'error');
                    }
                    // Clean URL
                    url.searchParams.delete('purchase');
                    url.searchParams.delete('session_id');
                    window.history.replaceState({}, document.title, url.pathname + url.search);
                } else if (purchase === 'cancelled') {
                    showNotification('Purchase cancelled.', 'info');
                    url.searchParams.delete('purchase');
                    window.history.replaceState({}, document.title, url.pathname + url.search);
                }
            } catch {}
        }

        // Authentication functionality
        function setupAuthListeners() {
            // Auth modal triggers
            document.getElementById('headerLoginBtn')?.addEventListener('click', () => showAuthModal('login'));
            document.getElementById('headerRegisterBtn')?.addEventListener('click', () => showAuthModal('register'));
            
            // Logout button
            document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
            
            // Modal controls
            document.getElementById('closeAuthModal')?.addEventListener('click', hideAuthModal);
            document.getElementById('authModal')?.addEventListener('click', (e) => {
                if (e.target.id === 'authModal') hideAuthModal();
            });

            // Tab switching
            document.getElementById('loginTab')?.addEventListener('click', () => switchAuthTab('login'));
            document.getElementById('registerTab')?.addEventListener('click', () => switchAuthTab('register'));

            // Form submissions
            document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
            document.getElementById('registerForm')?.addEventListener('submit', handleRegister);
        }

        // Analysis functionality
        function setupAnalysisListeners() {
            console.log('Setting up analysis listeners...');
            
            // Analysis modal triggers
            const analyzeSkillsBtn = document.getElementById('analyzeSkillsBtn');
            const startDemoBtn = document.getElementById('startDemoBtn');
            console.log('Found analyzeSkillsBtn:', !!analyzeSkillsBtn, 'startDemoBtn:', !!startDemoBtn);
            
            analyzeSkillsBtn?.addEventListener('click', handleAnalyzeSkillsClick);
            startDemoBtn?.addEventListener('click', handleAnalyzeSkillsClick);
            
            // Modal controls
            const closeAnalysisInterface = document.getElementById('closeAnalysisInterface');
            const analysisInterface = document.getElementById('analysisInterface');
            console.log('Found closeAnalysisInterface:', !!closeAnalysisInterface, 'analysisInterface:', !!analysisInterface);
            
            closeAnalysisInterface?.addEventListener('click', hideAnalysisInterface);
            analysisInterface?.addEventListener('click', (e) => {
                if (e.target.id === 'analysisInterface') hideAnalysisInterface();
            });

            // File upload
            const fileUploadArea = document.getElementById('fileUploadArea');
            const resumeFileInput = document.getElementById('resumeFileInput');
            console.log('Found fileUploadArea:', !!fileUploadArea, 'resumeFileInput:', !!resumeFileInput);
            
            fileUploadArea?.addEventListener('click', () => {
                resumeFileInput?.click();
            });
            
            resumeFileInput?.addEventListener('change', handleFileUpload);
            
            // Text area
            const resumeTextArea = document.getElementById('resumeTextArea');
            const startAnalysisBtn = document.getElementById('startAnalysisBtn');
            console.log('Found resumeTextArea:', !!resumeTextArea, 'startAnalysisBtn:', !!startAnalysisBtn);
            
            resumeTextArea?.addEventListener('input', handleTextInput);
            
            // Job description functionality
            const jobDescriptionTextArea = document.getElementById('jobDescriptionTextArea');
            const clearJobDescriptionBtn = document.getElementById('clearJobDescriptionBtn');
            console.log('Found jobDescriptionTextArea:', !!jobDescriptionTextArea, 'clearJobDescriptionBtn:', !!clearJobDescriptionBtn);
            
            jobDescriptionTextArea?.addEventListener('input', updateAnalysisTypeIndicator);
            clearJobDescriptionBtn?.addEventListener('click', clearJobDescription);
            
            // Analysis start
            startAnalysisBtn?.addEventListener('click', startAnalysis);
            
            // Tab navigation listeners
            const uploadTabBtn = document.getElementById('uploadTabBtn');
            const jobTabBtn = document.getElementById('jobTabBtn');
            const analysisTabBtn = document.getElementById('analysisTabBtn');
            const continueToJobBtn = document.getElementById('continueToJobBtn');
            const backToUploadBtn = document.getElementById('backToUploadBtn');
            const skipJobBtn = document.getElementById('skipJobBtn');
            const skipAnalysisBtn = document.getElementById('skipAnalysisBtn');
            
            uploadTabBtn?.addEventListener('click', () => switchAnalysisTab('upload'));
            jobTabBtn?.addEventListener('click', () => switchAnalysisTab('job'));
            analysisTabBtn?.addEventListener('click', () => switchAnalysisTab('analysis'));
            
            continueToJobBtn?.addEventListener('click', () => {
                switchAnalysisTab('job');
            });
            
            backToUploadBtn?.addEventListener('click', () => {
                switchAnalysisTab('upload');
            });
            
            skipJobBtn?.addEventListener('click', () => {
                startAnalysis();
            });
            
            skipAnalysisBtn?.addEventListener('click', () => {
                startAnalysis();
            });
            
            // Initialize analysis type indicator
            updateAnalysisTypeIndicator();
            
            console.log('Analysis listeners setup complete');
        }
        
        // Setup history section listeners
        function setupHistoryListeners() {
            const historyFilter = document.getElementById('historyFilter');
            const historySort = document.getElementById('historySort');
            const refreshHistory = document.getElementById('refreshHistory');
            
            historyFilter?.addEventListener('change', filterHistory);
            historySort?.addEventListener('change', sortHistory);
            refreshHistory?.addEventListener('click', loadAnalysisHistory);
        }
        
        // History navigation handler
        async function handleHistoryNavigation() {
            // First, verify current authentication status
            if (!AppState.user) {
                // Try to re-check auth status before showing login
                await checkAuthStatus();
                
                // If still not authenticated after check, show login
                if (!AppState.user) {
                    showAuthModal('login');
                    showNotification('Please log in to view your analysis history.', 'info');
                    return;
                }
            }
            
            // Show history section
            const historySection = document.getElementById('history');
            if (historySection) {
                // Hide all other sections first
                document.querySelectorAll('section').forEach(section => {
                    if (section.id !== 'history') {
                        section.classList.add('hidden');
                    }
                });
                
                // Show history section
                historySection.classList.remove('hidden');
                
                // Scroll to top of section
                historySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                
                // Load history data
                loadAnalysisHistory();
            }
            
            closeMobileMenu();
        }
        
        // Load analysis history from API
        async function loadAnalysisHistory() {
            const historyLoading = document.getElementById('historyLoading');
            const historyEmpty = document.getElementById('historyEmpty');
            const historyGrid = document.getElementById('historyGrid');
            const historyCount = document.getElementById('historyCount');
            
            // First verify we're authenticated
            if (!AppState.user) {
                console.log('No user in AppState, checking auth status...');
                const isAuthenticated = await checkAuthStatus();
                if (!isAuthenticated) {
                    console.log('User not authenticated, showing login modal');
                    handleTokenExpiration();
                    return;
                }
            }
            
            // Show loading state
            if (historyLoading) historyLoading.classList.remove('hidden');
            if (historyEmpty) historyEmpty.classList.add('hidden');
            if (historyGrid) historyGrid.classList.add('hidden');
            if (historyCount) historyCount.textContent = 'Loading...';
            
            try {
                console.log('Fetching analysis history...');
                const response = await fetch(API_ENDPOINTS.analysisHistory, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log('History response status:', response.status);
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('History data received:', data);
                    displayAnalysisHistory(data.analyses || []);
                } else if (response.status === 401) {
                    console.log('401 received while loading history, token expired');
                    handleTokenExpiration();
                } else {
                    throw new Error('Failed to load history');
                }
            } catch (error) {
                console.error('Error loading analysis history:', error);
                showNotification('Failed to load analysis history. Please try again.', 'error');
                
                // Show empty state on error
                if (historyLoading) historyLoading.classList.add('hidden');
                if (historyEmpty) historyEmpty.classList.remove('hidden');
                if (historyCount) historyCount.textContent = 'Error';
            }
        }
        
        // Display analysis history
        function displayAnalysisHistory(analyses) {
            const historyLoading = document.getElementById('historyLoading');
            const historyEmpty = document.getElementById('historyEmpty');
            const historyGrid = document.getElementById('historyGrid');
            const historyCount = document.getElementById('historyCount');
            
            // Hide loading
            if (historyLoading) historyLoading.classList.add('hidden');
            
            // Update count
            if (historyCount) {
                historyCount.textContent = analyses.length === 0 ? 'No analyses' : 
                    analyses.length === 1 ? '1 analysis' : analyses.length + ' analyses';
            }
            
            if (!analyses || analyses.length === 0) {
                // Show empty state
                if (historyEmpty) historyEmpty.classList.remove('hidden');
                if (historyGrid) historyGrid.classList.add('hidden');
                return;
            }
            
            // Hide empty state and show grid
            if (historyEmpty) historyEmpty.classList.add('hidden');
            if (historyGrid) {
                historyGrid.classList.remove('hidden');
                
                // Store original data for filtering
                AppState.allAnalyses = analyses;
                
                // Apply current filter and sort
                applyFilterAndSort();
            }
        }
        
        // Filter history
        function filterHistory() {
            applyFilterAndSort();
        }
        
        // Sort history
        function sortHistory() {
            applyFilterAndSort();
        }
        
        // Apply filter and sort to history
        function applyFilterAndSort() {
            if (!AppState.allAnalyses) return;
            
            const historyFilter = document.getElementById('historyFilter');
            const historySort = document.getElementById('historySort');
            const historyGrid = document.getElementById('historyGrid');
            
            let filtered = [...AppState.allAnalyses];
            
            // Apply filter
            const filterValue = historyFilter?.value || 'all';
            if (filterValue !== 'all') {
                filtered = filtered.filter(analysis => analysis.status === filterValue);
            }
            
            // Apply sort
            const sortValue = historySort?.value || 'recent';
            filtered.sort((a, b) => {
                const dateA = new Date(a.created_at);
                const dateB = new Date(b.created_at);
                return sortValue === 'recent' ? dateB - dateA : dateA - dateB;
            });
            
            // Render filtered and sorted analyses
            renderAnalysisCards(filtered);
        }
        
        // Render analysis cards
        function renderAnalysisCards(analyses) {
            const historyGrid = document.getElementById('historyGrid');
            if (!historyGrid) return;
            
            historyGrid.innerHTML = '';
            
            analyses.forEach(analysis => {
                const card = createAnalysisCard(analysis);
                historyGrid.appendChild(card);
            });
        }
        
        // Create analysis card element
        function createAnalysisCard(analysis) {
            const card = document.createElement('div');
            card.className = 'bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-primary transition-all';
            
            // Determine status color and icon
            let statusColor = 'text-gray-400';
            let statusIcon = 'fa-circle';
            let statusBg = 'bg-gray-600/20';
            
            if (analysis.status === 'completed') {
                statusColor = 'text-green-400';
                statusIcon = 'fa-check-circle';
                statusBg = 'bg-green-600/20';
            } else if (analysis.status === 'processing') {
                statusColor = 'text-yellow-400';
                statusIcon = 'fa-spinner fa-spin';
                statusBg = 'bg-yellow-600/20';
            } else if (analysis.status === 'failed') {
                statusColor = 'text-red-400';
                statusIcon = 'fa-exclamation-circle';
                statusBg = 'bg-red-600/20';
            }
            
            // Determine analysis type
            const hasJob = analysis.has_job_description || analysis.analysis_type === 'job-comparison';
            const typeText = hasJob ? 'Job Match Analysis' : 'CV Analysis';
            const typeIcon = hasJob ? 'fa-bullseye' : 'fa-user-tie';
            
            // Format date
            const date = new Date(analysis.created_at);
            const formattedDate = date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            card.innerHTML = 
                '<div class="flex justify-between items-start mb-4">' +
                    '<div class="flex items-center space-x-2">' +
                        '<i class="fas ' + typeIcon + ' text-primary"></i>' +
                        '<span class="font-semibold text-white">' + typeText + '</span>' +
                    '</div>' +
                    '<div class="' + statusBg + ' px-2 py-1 rounded-full">' +
                        '<i class="fas ' + statusIcon + ' ' + statusColor + ' text-xs"></i>' +
                        '<span class="' + statusColor + ' text-xs ml-1">' + analysis.status + '</span>' +
                    '</div>' +
                '</div>' +
                
                '<div class="text-gray-400 text-sm mb-4">' +
                    '<i class="fas fa-clock mr-1"></i>' +
                    formattedDate +
                '</div>' +
                
                (analysis.narrative ? 
                    '<div class="text-gray-300 text-sm mb-4 line-clamp-3">' +
                        analysis.narrative.substring(0, 150) + (analysis.narrative.length > 150 ? '...' : '') +
                    '</div>'
                : '') +
                
                '<div class="flex gap-2">' +
                    (analysis.status === 'completed' ? 
                        '<button onclick="viewAnalysis(&quot;' + analysis.id + '&quot;)" class="flex-1 bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-lg text-sm transition-colors">' +
                            '<i class="fas fa-eye mr-1"></i>' +
                            'View' +
                        '</button>'
                    : '') +
                    (analysis.status === 'processing' ? 
                        '<button onclick="checkAnalysisStatus(&quot;' + analysis.id + '&quot;)" class="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">' +
                            '<i class="fas fa-sync-alt mr-1"></i>' +
                            'Check Status' +
                        '</button>'
                    : '') +
                    '<button onclick="deleteAnalysis(&quot;' + analysis.id + '&quot;)" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">' +
                        '<i class="fas fa-trash mr-1"></i>' +
                        'Delete' +
                    '</button>' +
                '</div>';
            
            return card;
        }
        
        // View analysis details
        window.viewAnalysis = async function(analysisId) {
            try {
                const response = await fetch(API_ENDPOINTS.getAnalysis(analysisId), {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    // Display the analysis in the analysis interface
                    displayAnalysisResults(data.analysis || data);
                    showAnalysisInterface();
                } else {
                    throw new Error('Failed to load analysis');
                }
            } catch (error) {
                console.error('Error viewing analysis:', error);
                showNotification('Failed to load analysis details.', 'error');
            }
        };
        
        // Check analysis status
        window.checkAnalysisStatus = async function(analysisId) {
            try {
                const response = await fetch(API_ENDPOINTS.getAnalysis(analysisId), {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.status === 'completed') {
                        showNotification('Analysis completed! Refreshing...', 'success');
                        loadAnalysisHistory();
                    } else if (data.status === 'processing') {
                        showNotification('Analysis is still processing. Please check back later.', 'info');
                    } else {
                        showNotification('Analysis status: ' + data.status, 'info');
                    }
                } else {
                    throw new Error('Failed to check status');
                }
            } catch (error) {
                console.error('Error checking analysis status:', error);
                showNotification('Failed to check analysis status.', 'error');
            }
        };
        
        // Delete analysis
        window.deleteAnalysis = async function(analysisId) {
            if (!confirm('Are you sure you want to delete this analysis? This action cannot be undone.')) {
                return;
            }
            
            try {
                const response = await fetch(API_ENDPOINTS.deleteAnalysis(analysisId), {
                    method: 'DELETE',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    showNotification('Analysis deleted successfully.', 'success');
                    loadAnalysisHistory();
                } else {
                    throw new Error('Failed to delete analysis');
                }
            } catch (error) {
                console.error('Error deleting analysis:', error);
                showNotification('Failed to delete analysis.', 'error');
            }
        };

        // UI utility functions
        function setupUIListeners() {
            // Close modals on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    hideAuthModal();
                    hideAnalysisInterface();
                }
            });
        }

        // Mobile menu functions
        function toggleMobileMenu() {
            const mobileMenu = document.getElementById('mobileMenu');
            mobileMenu?.classList.toggle('hidden');
        }

        function closeMobileMenu() {
            const mobileMenu = document.getElementById('mobileMenu');
            if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
            }
        }

        // Auth modal functions
        function showAuthModal(mode = 'login') {
            const modal = document.getElementById('authModal');
            modal?.classList.remove('hidden');
            AppState.currentModal = 'auth';
            switchAuthTab(mode);
        }

        function hideAuthModal() {
            const modal = document.getElementById('authModal');
            modal?.classList.add('hidden');
            AppState.currentModal = null;
        }

        function switchAuthTab(mode) {
            const loginTab = document.getElementById('loginTab');
            const registerTab = document.getElementById('registerTab');
            const loginForm = document.getElementById('loginForm');
            const registerForm = document.getElementById('registerForm');

            if (mode === 'login') {
                loginTab?.classList.add('bg-primary', 'text-white');
                loginTab?.classList.remove('text-gray-300');
                registerTab?.classList.remove('bg-primary', 'text-white');
                registerTab?.classList.add('text-gray-300');
                loginForm?.classList.remove('hidden');
                registerForm?.classList.add('hidden');
            } else {
                registerTab?.classList.add('bg-primary', 'text-white');
                registerTab?.classList.remove('text-gray-300');
                loginTab?.classList.remove('bg-primary', 'text-white');
                loginTab?.classList.add('text-gray-300');
                registerForm?.classList.remove('hidden');
                loginForm?.classList.add('hidden');
            }
        }

        // Analysis modal functions
        function showAnalysisInterface() {
            const modal = document.getElementById('analysisInterface');
            const analysisModal = document.getElementById('analysisModal');
            const singleColumnLayout = document.getElementById('singleColumnLayout');
            const twoColumnLayout = document.getElementById('twoColumnLayout');
            
            // Reset modal to compact size and single column layout
            if (analysisModal) {
                analysisModal.classList.remove('max-w-6xl');
                analysisModal.classList.add('max-w-4xl');
            }
            
            // Ensure we start with single column layout
            if (singleColumnLayout && twoColumnLayout) {
                singleColumnLayout.classList.remove('hidden');
                twoColumnLayout.classList.add('hidden');
            }
            
            // Reset to upload tab
            switchAnalysisTab('upload');
            
            modal?.classList.remove('hidden');
            AppState.currentModal = 'analysis';
        }
        
        // Tab switching functionality for analysis interface
        function switchAnalysisTab(tabName) {
            const uploadTabBtn = document.getElementById('uploadTabBtn');
            const jobTabBtn = document.getElementById('jobTabBtn');
            const analysisTabBtn = document.getElementById('analysisTabBtn');
            const uploadTabContent = document.getElementById('uploadTabContent');
            const jobTabContent = document.getElementById('jobTabContent');
            const analysisTabContent = document.getElementById('analysisTabContent');
            
            // Reset all tabs and content
            const tabs = [uploadTabBtn, jobTabBtn, analysisTabBtn];
            const contents = [uploadTabContent, jobTabContent, analysisTabContent];
            
            tabs.forEach(tab => {
                if (tab) {
                    tab.classList.remove('text-white', 'border-primary');
                    tab.classList.add('text-gray-400', 'border-transparent');
                }
            });
            
            contents.forEach(content => {
                if (content) content.classList.add('hidden');
            });
            
            // Activate selected tab
            switch(tabName) {
                case 'upload':
                    if (uploadTabBtn) {
                        uploadTabBtn.classList.add('text-white', 'border-primary');
                        uploadTabBtn.classList.remove('text-gray-400', 'border-transparent');
                    }
                    if (uploadTabContent) uploadTabContent.classList.remove('hidden');
                    break;
                    
                case 'job':
                    if (jobTabBtn) {
                        jobTabBtn.classList.add('text-white', 'border-primary');
                        jobTabBtn.classList.remove('text-gray-400', 'border-transparent');
                    }
                    if (jobTabContent) jobTabContent.classList.remove('hidden');
                    break;
                    
                case 'analysis':
                    if (analysisTabBtn) {
                        analysisTabBtn.classList.add('text-white', 'border-primary');
                        analysisTabBtn.classList.remove('text-gray-400', 'border-transparent');
                    }
                    if (analysisTabContent) analysisTabContent.classList.remove('hidden');
                    break;
            }
        }

        function hideAnalysisInterface() {
            const modal = document.getElementById('analysisInterface');
            const analysisModal = document.getElementById('analysisModal');
            const singleColumnLayout = document.getElementById('singleColumnLayout');
            const twoColumnLayout = document.getElementById('twoColumnLayout');
            
            // Reset modal to compact size for next time
            if (analysisModal) {
                analysisModal.classList.remove('max-w-6xl');
                analysisModal.classList.add('max-w-2xl');
            }
            
            // Reset to single column layout
            if (singleColumnLayout && twoColumnLayout) {
                singleColumnLayout.classList.remove('hidden');
                twoColumnLayout.classList.add('hidden');
            }
            
            modal?.classList.add('hidden');
            AppState.currentModal = null;
        }

        // File handling
        function handleFileUpload(e) {
            const file = e.target.files[0];
            if (file) {
                AppState.resumeFile = file;
                AppState.resumeText = '';
                
                const resumeTextArea = document.getElementById('resumeTextArea');
                if (resumeTextArea) resumeTextArea.value = '';
                
                updateAnalysisButton();
                
                // Show file name
                const fileArea = document.getElementById('fileUploadArea');
                if (fileArea) {
                    fileArea.innerHTML = 
                        '<i class="fas fa-file-check text-4xl text-primary mb-4"></i>' +
                        '<p class="text-primary mb-2">' + file.name + '</p>' +
                        '<p class="text-sm text-gray-400">File ready for analysis</p>';
                }
            }
        }

        function handleTextInput(e) {
            AppState.resumeText = e.target.value;
            AppState.resumeFile = null;
            updateAnalysisButton();
            
            // Reset file upload area if text is entered
            if (AppState.resumeText.length > 0) {
                const fileArea = document.getElementById('fileUploadArea');
                if (fileArea) {
                    fileArea.innerHTML = 
                        '<i class="fas fa-file-upload text-4xl text-gray-400 mb-4"></i>' +
                        '<p class="text-gray-300 mb-2">Drop your resume here</p>' +
                        '<p class="text-sm text-gray-400">PDF, DOC, DOCX, TXT</p>';
                }
            }
        }

        function updateAnalysisButton() {
            const startButton = document.getElementById('startAnalysisBtn');
            const continueButton = document.getElementById('continueToJobBtn');
            const skipJobButton = document.getElementById('skipJobBtn');
            const hasContent = AppState.resumeFile || AppState.resumeText.trim().length > 0;
            const hasCredits = (AppState.credits || 0) > 0;

            // Inline CTA element
            let inlineCTA = document.getElementById('buyCreditsInline');
            const jobTab = document.getElementById('jobTabContent');
            if (!inlineCTA && jobTab) {
                inlineCTA = document.createElement('div');
                inlineCTA.id = 'buyCreditsInline';
                inlineCTA.className = 'mt-2 text-sm text-gray-400';
                jobTab.querySelector('div.flex.justify-between')?.appendChild(inlineCTA);
            }
            
            if (hasContent && hasCredits) {
                startButton?.removeAttribute('disabled');
                startButton?.classList.remove('opacity-50', 'cursor-not-allowed');
                continueButton?.removeAttribute('disabled');
                continueButton?.classList.remove('opacity-50', 'cursor-not-allowed');
                skipJobButton?.removeAttribute('disabled');
                skipJobButton?.classList.remove('opacity-50', 'cursor-not-allowed');
                if (inlineCTA) inlineCTA.innerHTML = '';
            } else {
                startButton?.setAttribute('disabled', 'true');
                startButton?.classList.add('opacity-50', 'cursor-not-allowed');
                continueButton?.setAttribute('disabled', 'true');
                continueButton?.classList.add('opacity-50', 'cursor-not-allowed');
                skipJobButton?.setAttribute('disabled', 'true');
                skipJobButton?.classList.add('opacity-50', 'cursor-not-allowed');
                if (hasContent && !hasCredits && inlineCTA) {
                    inlineCTA.innerHTML = '<span class="text-yellow-400">You have no credits.</span> <button class="underline text-primary hover:text-primary/80">Buy credits</button>';
                    const btn = inlineCTA.querySelector('button');
                    btn?.addEventListener('click', (e) => { e.preventDefault(); goToPricing(); });
                } else if (inlineCTA) {
                    inlineCTA.innerHTML = '';
                }
            }
        }

        // Form handlers
        async function handleLogin(e) {
            e.preventDefault();
            const formData = new FormData(e.target);
            const email = formData.get('loginEmail');
            const password = formData.get('loginPassword');
            
            const submitButton = e.target.querySelector('button[type="submit"]');
            const originalText = submitButton.innerHTML;
            
            try {
                // Update button state
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Logging in...';
                submitButton.disabled = true;
                
                // Clear any previous errors
                hideAuthError();
                
                const response = await fetch(API_ENDPOINTS.login, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (data.success) {
                    AppState.user = data.data.user;
                    updateUIForAuthenticatedUser();
                    await fetchCredits();
                    hideAuthModal();
                    
                    // Show success message
                    showNotification('Login successful! Welcome back.', 'success');
                } else {
                    showAuthError(data.error?.message || 'Login failed. Please check your credentials.');
                }
            } catch (error) {
                console.error('Login error:', error);
                showAuthError('Network error. Please try again.');
            } finally {
                // Reset button state
                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
            }
        }

        async function handleRegister(e) {
            e.preventDefault();
            const formData = new FormData(e.target);
            const email = formData.get('registerEmail');
            const password = formData.get('registerPassword');
            const confirmPassword = formData.get('confirmPassword');
            
            if (password !== confirmPassword) {
                showAuthError('Passwords do not match!');
                return;
            }
            
            const submitButton = e.target.querySelector('button[type="submit"]');
            const originalText = submitButton.innerHTML;
            
            try {
                // Update button state
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Creating account...';
                submitButton.disabled = true;
                
                // Clear any previous errors
                hideAuthError();
                
                const response = await fetch(API_ENDPOINTS.register, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        email, 
                        password,
                        name: email.split('@')[0] // Use email prefix as name
                    })
                });

                const data = await response.json();

                if (data.success) {
                    AppState.user = data.data.user;
                    updateUIForAuthenticatedUser();
                    await fetchCredits();
                    hideAuthModal();
                    
                    // Show success message
                    showNotification('Account created successfully! Welcome to Clearsight IP.', 'success');
                } else {
                    showAuthError(data.error?.message || 'Registration failed. Please try again.');
                }
            } catch (error) {
                console.error('Registration error:', error);
                showAuthError('Network error. Please try again.');
            } finally {
                // Reset button state
                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
            }
        }

        // Logout function
        async function handleLogout() {
            try {
                await fetch(API_ENDPOINTS.logout, {
                    method: 'POST',
                    credentials: 'include'
                });
            } catch (error) {
                console.error('Logout error:', error);
            } finally {
                updateUIForUnauthenticatedUser();
                showNotification('Logged out successfully.', 'info');
            }
        }

        // Token expiration handling
        function handleTokenExpiration() {
            console.log('Token expired - logging out user');
            
            // Clear user state immediately
            AppState.user = null;
            
            // Stop any ongoing analysis
            if (AppState.pollInterval) {
                clearInterval(AppState.pollInterval);
                AppState.pollInterval = null;
            }
            
            // Update UI to unauthenticated state
            updateUIForUnauthenticatedUser();
            
            // Hide analysis interface if open
            hideAnalysisInterface();
            
            // Show login modal with expiration message
            showAuthModal('login');
            showNotification('Your session has expired. Please log in again.', 'warning');
            
            // Clear any auth error that might be showing
            hideAuthError();
        }

        // Auth error handling
        function showAuthError(message) {
            const errorDiv = document.getElementById('authError');
            const errorText = errorDiv?.querySelector('p');
            
            if (errorDiv && errorText) {
                errorText.textContent = message;
                errorDiv.classList.remove('hidden');
            }
        }

        function hideAuthError() {
            const errorDiv = document.getElementById('authError');
            errorDiv?.classList.add('hidden');
        }

        // Notification system
        function showNotification(message, type = 'info') {
            const notification = document.createElement('div');
            notification.className = \`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full\`;
            
            const colors = {
                success: 'bg-green-600 text-white',
                error: 'bg-red-600 text-white',
                info: 'bg-blue-600 text-white'
            };
            
            notification.className += \` \${colors[type] || colors.info}\`;
            notification.innerHTML = \`
                <div class="flex items-center">
                    <i class="fas fa-\${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} mr-2"></i>
                    <span>\${message}</span>
                </div>
            \`;
            
            document.body.appendChild(notification);
            
            // Animate in
            setTimeout(() => {
                notification.classList.remove('translate-x-full');
            }, 100);
            
            // Remove after 5 seconds
            setTimeout(() => {
                notification.classList.add('translate-x-full');
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }, 5000);
        }

        function computeEstimatedDurationMs() {
            // Heuristic based on resume size and presence of a job description
            const jobDescriptionTextArea = document.getElementById('jobDescriptionTextArea');
            const hasJob = !!(jobDescriptionTextArea && jobDescriptionTextArea.value.trim().length > 0);

            // Resume size estimation (characters or file bytes)
            let sizeFactor = 0; // 0..1 normalized
            if (AppState.resumeText && AppState.resumeText.length > 0) {
                sizeFactor = Math.min(AppState.resumeText.length / 6000, 1); // cap at ~6k chars
            } else if (AppState.resumeFile && AppState.resumeFile.size) {
                sizeFactor = Math.min(AppState.resumeFile.size / (400 * 1024), 1); // cap at ~400 KB
            }

            const base = 55000; // 55s base
            const lengthPenalty = Math.floor(20000 * sizeFactor); // up to +20s
            const jobPenalty = hasJob ? 20000 : 0; // +20s if job provided
            const estimate = Math.max(45000, Math.min(90000, base + lengthPenalty + jobPenalty));
            return estimate;
        }

        function formatTime(ms) {
            const clamped = Math.max(0, Math.floor(ms / 1000));
            const m = Math.floor(clamped / 60);
            const s = clamped % 60;
            const pad = function(n){ return n < 10 ? '0' + n : '' + n };
            return m + ':' + pad(s);
        }

        async function startAnalysis() {
            // Check authentication first
            if (!AppState.user) {
                hideAnalysisInterface();
                showAuthModal('login');
                showNotification('Please log in to analyze your resume.', 'info');
                return;
            }
            
            if (AppState.isAnalyzing) return;
            
            AppState.isAnalyzing = true;
            const button = document.getElementById('startAnalysisBtn');
            const originalText = button.innerHTML;
            
            try {
                // Update button state
                button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Analyzing...';
                button.disabled = true;
                
                // Show loading immediately while the request is being initiated
                if (!AppState.loadingActive) {
                    showLoadingScreen();
                    startLoadingAnimation();
                }
                
                // Prepare the request data
                let requestData = {};
                
                // Get job description if provided
                const jobDescriptionTextArea = document.getElementById('jobDescriptionTextArea');
                const jobDescription = jobDescriptionTextArea ? jobDescriptionTextArea.value.trim() : '';
                
                console.log('Job description provided:', !!jobDescription, 'Length:', jobDescription.length);
                
                if (AppState.resumeFile) {
                    // Handle file upload
                    console.log('Sending file analysis request to:', API_ENDPOINTS.analyzeResume);
                    console.log('File details:', AppState.resumeFile.name, AppState.resumeFile.type, AppState.resumeFile.size);
                    
                    const formData = new FormData();
                    formData.append('resume', AppState.resumeFile); // Backend expects 'resume', not 'file'
                    
                    // Add job description if provided
                    if (jobDescription) {
                        formData.append('jobDescriptionText', jobDescription);
                        console.log('Added job description to file upload request');
                    }
                    
                    const response = await fetch(API_ENDPOINTS.analyzeResume, {
                        method: 'POST',
                        credentials: 'include',
                        body: formData
                    });
                    
                    console.log('File analysis response status:', response.status);
                    
                    let data;
                    try {
                        data = await response.json();
                        // Refresh credits after server-side consumption
                        fetchCredits();
                    } catch (err) {
                        console.error('Failed to parse response as JSON:', err);
                        console.log('Response status:', response.status, 'Response text preview:', await response.text().catch(() => 'Unable to read'));
                        // Parsing failed – do not fabricate fallback data
                        throw err;
                    }
                    
                    console.log('File analysis response data:', data);
                    handleAnalysisResponse(data, response.ok);
                    
                } else if (AppState.resumeText.trim()) {
                    // Handle text input - backend expects FormData, not JSON
                    console.log('Sending text analysis request to:', API_ENDPOINTS.analyzeResume);
                    
                    const formData = new FormData();
                    formData.append('resumeText', AppState.resumeText.trim()); // Backend expects 'resumeText'
                    
                    // Add job description if provided
                    if (jobDescription) {
                        formData.append('jobDescriptionText', jobDescription);
                        console.log('Added job description to text analysis request');
                    }
                    
                    const response = await fetch(API_ENDPOINTS.analyzeResume, {
                        method: 'POST',
                        credentials: 'include',
                        body: formData // Send as FormData, not JSON
                    });
                    
                    console.log('Analysis response status:', response.status);
                    
                    let data;
                    try {
                        data = await response.json();
                        // Refresh credits after server-side consumption
                        fetchCredits();
                    } catch (err) {
                        console.error('Failed to parse response as JSON:', err);
                        console.log('Response status:', response.status, 'Response text preview:', await response.text().catch(() => 'Unable to read'));
                        throw err;
                    }
                    
                    console.log('Analysis response data:', data);
                    handleAnalysisResponse(data, response.ok);
                }
                
            } catch (error) {
                console.error('Analysis error:', error);
                console.error('Error details:', {
                    message: error.message,
                    stack: error.stack,
                    name: error.name
                });
                
                // Provide more specific error messages
                let errorMessage = 'Analysis failed. Please try again after a moment.';
                if (error.message.includes('Failed to fetch')) {
                    errorMessage = 'Network error: Unable to connect to analysis service. Please check your internet connection.';
                } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                    errorMessage = 'Your session has expired. Please log in again.';
                    // Stop loader and log out the user
                    stopLoadingAnimation();
                    handleTokenExpiration();
                    return; // Don't show notification as handleTokenExpiration will handle it
                } else if (error.message.includes('timeout')) {
                    errorMessage = 'Analysis timed out. Please try again with a shorter resume.';
                }
                
                // Ensure loader is stopped and UI reset on error
                stopLoadingAnimation();
                resetToUploadScreen();
                showNotification(errorMessage, 'error');
            } finally {
                AppState.isAnalyzing = false;
                button.innerHTML = originalText;
                updateAnalysisButton();
            }
        }

        function handleAnalysisResponse(data, success) {
            console.log('Handling analysis response:', { data, success });
            
            if (success && data.status === 'processing') {
                // Handle async processing response
                AppState.currentAnalysisId = data.analysis_id;
                if (!AppState.loadingActive) {
                    showLoadingScreen();
                    startLoadingAnimation();
                }
                startPollingForResults(data.analysis_id);
                console.log('Analysis submitted with ID:', data.analysis_id);
                
            } else if (success && (data.success || data.status === 'completed')) {
                // Show completed analysis results
                stopLoadingAnimation();
                // Extract the actual analysis data from various possible locations
                let analysisData = data;
                if (data.data) {
                    analysisData = data.data;
                }
                if (data.analysis) {
                    analysisData = data.analysis;
                }
                console.log('Extracted analysis data for display:', analysisData);
                displayAnalysisResults(analysisData);
                showNotification('Analysis completed successfully!', 'success');
            } else {
                let errorMessage = 'Analysis failed. Please try again.';
                let shouldShowLogin = false;
                
                if (data && data.error) {
                    errorMessage = data.error.message || errorMessage;
                    console.error('Server error details:', data.error);
                    
                    // Check for specific error codes
                    if (data.error.code === 'AUTH_REQUIRED' || data.error.code === 'AUTHENTICATION_REQUIRED' || 
                        data.error.code === 'TOKEN_EXPIRED' || data.error.code === 'EXPIRED_TOKEN' || data.error.code === 'INVALID_TOKEN') {
                        errorMessage = 'Your session has expired. Please log in again.';
                        // Log out the user and clear their session
                        handleTokenExpiration();
                        return; // Don't continue with normal error handling
                    } else if (data.error.code === 'AI_SERVICE_UNAVAILABLE') {
                        errorMessage = 'AI analysis service is temporarily unavailable. Please try again later.';
                    } else if (data.error.code === 'MISSING_CONTENT') {
                        errorMessage = 'Please provide resume content or upload a file.';
                    }
                } else if (!success) {
                    // If server denied due to no credits, guide the user
                    if (data && data.error && data.error.code === 'PAYMENT_REQUIRED') {
                        errorMessage = data.error.message || 'No analysis credits remaining.';
                        goToPricing();
                    } else {
                        errorMessage = 'Server error occurred during analysis. Please try again.';
                    }
                }
                
                console.error('Analysis failed:', { data, success, errorMessage });
                showNotification(errorMessage, 'error');
                resetToUploadScreen();
                
                // If authentication error, redirect to login
                if (shouldShowLogin) {
                    hideAnalysisInterface();
                    showAuthModal('login');
                }
            }
        }

        // Loading screen functions
        function showLoadingScreen() {
            // Switch to analysis tab and show loading
            switchAnalysisTab('analysis');
            
            const loadingSection = document.getElementById('loadingSection');
            const resultsSection = document.getElementById('resultsSection');
            
            if (loadingSection) loadingSection.classList.remove('hidden');
            if (resultsSection) resultsSection.classList.add('hidden');
            
            // Enable analysis tab
            const analysisTabBtn = document.getElementById('analysisTabBtn');
            if (analysisTabBtn) {
                analysisTabBtn.removeAttribute('disabled');
            }
        }

        window.retryAnalysis = function() {
            // Get the last used form data and retry
            const resumeTextArea = document.getElementById('resume-text');
            const jobTextArea = document.getElementById('job-description');
            
            if (resumeTextArea && resumeTextArea.value.trim()) {
                showNotification('Retrying analysis...', 'info');
                submitAnalysis(); // Reuse the existing submit function
            } else {
                showNotification('Please enter your resume content to retry', 'error');
                resetToUploadScreen();
            }
        };

        window.checkAnalysisHistory = function() {
            // Redirect to history page or show history modal
            showNotification('Checking your analysis history...', 'info');
            // You could implement a history modal here or redirect to a history page
            window.location.href = '/history'; // Assuming you have a history page
        };

        window.resetToUploadScreen = function() {
            stopLoadingAnimation();
            
            // Switch back to upload tab
            switchAnalysisTab('upload');
            
            // Hide loading and results sections within Analysis tab
            const loadingSection = document.getElementById('loadingSection');
            const resultsSection = document.getElementById('resultsSection');
            
            if (loadingSection) loadingSection.classList.add('hidden');
            if (resultsSection) resultsSection.classList.add('hidden');
            
            
            // Reset modal size back to normal
            const analysisModal = document.getElementById('analysisModal');
            if (analysisModal) {
                analysisModal.classList.remove('max-w-6xl');
                analysisModal.classList.add('max-w-4xl');
            }
            
            // Clear any existing game state
            if (gameState.gameTimeout) {
                clearTimeout(gameState.gameTimeout);
                gameState.gameTimeout = null;
            }
            gameState.attempts = 0;
            gameState.bestTime = null;
            
            AppState.isAnalyzing = false;
            updateAnalysisButton();
        }

        function startLoadingAnimation() {
            AppState.loadingActive = true;
            AppState.analysisStartTs = Date.now();
            AppState.estimatedTotalMs = computeEstimatedDurationMs();

            // Initialize ETA UI
            const etaEl = document.getElementById('etaText');
            if (etaEl) {
                const totalText = formatTime(AppState.estimatedTotalMs);
                // Convert mm:ss into Xm Ys text
                etaEl.textContent = 'Approximate total time ~ ' + totalText.replace(':', 'm ') + 's';
            }

            let progress = 0;
            AppState.currentMessageIndex = 0;
            
            updateLoadingMessage();
            initializeReactionGame();
            
            // Progress + timer update
            AppState.progressInterval = setInterval(() => {
                const now = Date.now();
                const elapsed = now - AppState.analysisStartTs;
                const remaining = Math.max(0, AppState.estimatedTotalMs - elapsed);

                // Update progress percent based on elapsed/estimate (cap at 92% while processing)
                const targetPct = Math.min(92, Math.floor((elapsed / AppState.estimatedTotalMs) * 92));
                // ease towards target with a little jitter
                progress += Math.max(0, targetPct - progress) * 0.3 + Math.random() * 1.2;
                if (progress > 92) progress = 92;

                const timerEl = document.getElementById('timerText');
                if (timerEl) timerEl.textContent = '⏱️ ' + formatTime(elapsed) + ' elapsed • ~' + formatTime(remaining) + ' remaining';
            }, 900);
            
            // Message cycling
            const listLen = COMBINED_MESSAGES.length || 1;
            AppState.messageInterval = setInterval(() => {
                AppState.currentMessageIndex = (AppState.currentMessageIndex + 1) % listLen;
                updateLoadingMessage();
            }, 8000); // Change message every 8 seconds
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
            if (AppState.pollInterval) {
                clearInterval(AppState.pollInterval);
                AppState.pollInterval = null;
            }
            
            // Clean up game
            if (gameState.gameTimeout) {
                clearTimeout(gameState.gameTimeout);
                gameState.gameTimeout = null;
            }
            AppState.loadingActive = false;
        }

        function updateLoadingMessage() {
            const list = COMBINED_MESSAGES;
            const message = list[AppState.currentMessageIndex % list.length];
            const progressText = document.getElementById('progressText');
            
            if (progressText) {
                progressText.textContent = message;
                progressText.className = 'text-lg text-primary animate-pulse font-medium mb-4';
            }
        }

        // Reaction Game Logic
        let gameState = {
            isWaiting: false,
            startTime: 0,
            bestTime: null,
            gameTimeout: null,
            attempts: 0
        };

        function initializeReactionGame() {
            const gameButton = document.getElementById('gameButton');
            if (!gameButton) {
                console.log('Game button not found, skipping game initialization');
                return;
            }
            
            // Remove any existing event listeners to prevent duplicates
            const newButton = gameButton.cloneNode(true);
            gameButton.parentNode.replaceChild(newButton, gameButton);
            
            // Add fresh event listener
            newButton.addEventListener('click', handleGameClick);
            
            // Reset game state
            gameState = {
                isWaiting: false,
                startTime: 0,
                bestTime: null,
                gameTimeout: null,
                attempts: 0
            };
            
            resetGame();
        }

        function resetGame() {
            const gameButton = document.getElementById('gameButton');
            if (!gameButton) {
                console.log('Game button not found in resetGame');
                return;
            }
            
            gameState.isWaiting = false;
            gameButton.className = 'w-full py-3 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors duration-200 cursor-pointer';
            gameButton.textContent = '🔴 Wait for green...';
            
            if (gameState.gameTimeout) {
                clearTimeout(gameState.gameTimeout);
                gameState.gameTimeout = null;
            }
            
            // Start next round after a random delay
            const delay = Math.random() * 4000 + 2000; // 2-6 seconds
            gameState.gameTimeout = setTimeout(startReactionTest, delay);
        }

        function startReactionTest() {
            const gameButton = document.getElementById('gameButton');
            if (!gameButton) return;
            
            gameState.isWaiting = true;
            gameState.startTime = Date.now();
            gameButton.className = 'w-full py-3 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors duration-200 cursor-pointer animate-pulse';
            gameButton.textContent = '🟢 CLICK NOW!';
        }

        function handleGameClick(e) {
            // Prevent event bubbling
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            
            const gameButton = document.getElementById('gameButton');
            const gameScore = document.getElementById('gameScore');
            if (!gameButton || !gameScore) {
                console.log('Game elements not found in handleGameClick');
                return;
            }
            
            if (gameState.isWaiting) {
                // Good click!
                const reactionTime = Date.now() - gameState.startTime;
                gameState.attempts++;
                
                if (!gameState.bestTime || reactionTime < gameState.bestTime) {
                    gameState.bestTime = reactionTime;
                }
                
                gameButton.className = 'w-full py-3 px-4 bg-blue-500 text-white rounded-lg font-medium';
                gameButton.textContent = '⚡ ' + reactionTime + 'ms - Nice!';
                gameScore.textContent = 'Best: ' + gameState.bestTime + 'ms | Attempts: ' + gameState.attempts;
                
                setTimeout(resetGame, 1500);
            } else {
                // Too early!
                gameButton.className = 'w-full py-3 px-4 bg-yellow-500 text-white rounded-lg font-medium';
                gameButton.textContent = '⚠️ Too early! Wait for green...';
                
                if (gameState.gameTimeout) {
                    clearTimeout(gameState.gameTimeout);
                }
                
                setTimeout(resetGame, 1500);
            }
        }

        function startPollingForResults(analysisId) {
            let pollCount = 0;
            const maxPolls = 40; // Poll for up to 3.3 minutes (40 * 5 seconds) - gives server 2min timeout buffer
            
            console.log('Starting polling for analysis:', analysisId);
            
            // Increase polling interval to reduce load
            AppState.pollInterval = setInterval(async () => {
                pollCount++;
                console.log('Polling attempt', pollCount, 'for analysis:', analysisId);
                
                try {
                    const response = await fetch((API_ENDPOINTS.analyzeResume + '/' + analysisId) + '?source=db', {
                        method: 'GET',
                        credentials: 'include'
                    });
                    
                    console.log('Poll response status:', response.status);
                    
                    if (response.ok) {
                        const data = await response.json();
                        console.log('Poll response data:', data);
                        
                        if (data.status === 'completed') {
                            // Analysis completed!
                            stopLoadingAnimation();
                            
                            const progressText = document.getElementById('progressText');
                            if (progressText) {
                                progressText.textContent = '🎉 Analysis complete! Preparing your results...';
                                progressText.className = 'text-lg text-green-400 font-semibold mb-4';
                            }
                            
                            // Show results after a brief delay
                            setTimeout(() => {
                                // Extract the analysis data from the response
                                let analysisData = data;
                                if (data.analysis) {
                                    analysisData = data.analysis;
                                } else if (data.data) {
                                    analysisData = data.data;
                                }
                                console.log('Extracted analysis data from polling:', analysisData);
                                displayAnalysisResults(analysisData);
                                showNotification('🎉 Your analysis is ready!', 'success');
                            }, 2000);
                            
                        } else if (data.status === 'failed') {
                            // Analysis failed
                            stopLoadingAnimation();
                            showNotification('Analysis failed. Please try again.', 'error');
                            resetToUploadScreen();
                        }
                        // If still processing, continue polling
                        
                    } else if (response.status === 401) {
                        // Token expired during polling
                        stopLoadingAnimation();
                        handleTokenExpiration();
                        return; // Stop polling
                    } else if (response.status === 404) {
                        // Analysis not found - might have been cleaned up
                        stopLoadingAnimation();
                        showNotification('Analysis not found. Please try submitting again.', 'error');
                        resetToUploadScreen();
                    }
                } catch (error) {
                    console.error('Polling error:', error);
                    // Continue polling on network errors
                }
                
                // Stop polling after max attempts
                if (pollCount >= maxPolls) {
                    stopLoadingAnimation();
                    
                    // Show timeout message with retry option
                    const timeoutMessage = 'Analysis timed out after 3.3 minutes. This may be due to high server load. Your analysis may still complete - check your history in a few minutes.';
                    showNotification(timeoutMessage, 'error');
                    
                    // Add retry and check history buttons
                    const analysisContainer = document.getElementById('analysis-container');
                    if (analysisContainer) {
                        analysisContainer.innerHTML = 
                            '<div class="text-center p-8">' +
                                '<div class="text-red-500 mb-4">' +
                                    '<i class="fas fa-clock text-4xl mb-4"></i>' +
                                    '<h3 class="text-xl font-semibold mb-2">Analysis Timed Out</h3>' +
                                    '<p class="text-gray-600 mb-6">' + timeoutMessage + '</p>' +
                                '</div>' +
                                '<div class="space-x-4">' +
                                    '<button onclick="retryAnalysis()" class="bg-primary hover:bg-primary/80 text-white px-6 py-2 rounded-lg transition-colors">' +
                                        '<i class="fas fa-redo mr-2"></i>Retry Analysis' +
                                    '</button>' +
                                    '<button onclick="checkAnalysisHistory()" class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors">' +
                                        '<i class="fas fa-history mr-2"></i>Check History' +
                                    '</button>' +
                                    '<button onclick="resetToUploadScreen()" class="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg transition-colors">' +
                                        '<i class="fas fa-upload mr-2"></i>New Analysis' +
                                    '</button>' +
                                '</div>' +
                            '</div>';
                    } else {
                        resetToUploadScreen();
                    }
                }
                
            }, 10000); // Poll every 10 seconds to reduce load
        }

        function displayAnalysisResults(analysisData) {
            console.log('🎨 Displaying analysis results:', analysisData);
            stopLoadingAnimation();
            
            // IMPORTANT: Switch to Analysis tab to show results
            switchAnalysisTab('analysis');
            
            // Expand modal to show results
            const analysisModal = document.getElementById('analysisModal');
            if (analysisModal) {
                analysisModal.classList.remove('max-w-2xl');
                analysisModal.classList.add('max-w-6xl');
            }
            
            // Switch to two-column layout
            const singleColumnLayout = document.getElementById('singleColumnLayout');
            const twoColumnLayout = document.getElementById('twoColumnLayout');
            const inputSection = document.getElementById('inputSection');
            const uploadSection = document.getElementById('uploadSection');
            const testResultsPanel = document.getElementById('resultsPanelContent');
            
            if (singleColumnLayout && twoColumnLayout && inputSection && uploadSection) {
                // Move upload section to left column
                inputSection.innerHTML = uploadSection.outerHTML;
                
                // Hide single column and show two column layout
                singleColumnLayout.classList.add('hidden');
                twoColumnLayout.classList.remove('hidden');
                
                console.log('🔄 Switched to two-column layout');
            }
            
            // Simple markdown to HTML converter
            function mdToHtml(text) {
                if (!text) return '';
                
                // Process line by line to handle headers and lists
                var lines = text.split('\\n');
                var processedLines = [];
                var inList = false;
                
                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i];
                    var processedLine = line;
                    
                    // Process headers (#### ### ## #)
                    if (line.indexOf('#### ') === 0) {
                        var headerText = line.substring(5);
                        processedLine = '<h4 class="text-base font-semibold text-gray-200 mt-4 mb-2">' + headerText + '</h4>';
                        inList = false;
                    } else if (line.indexOf('### ') === 0) {
                        var headerText = line.substring(4);
                        processedLine = '<h3 class="text-lg font-bold text-primary mt-5 mb-2">' + headerText + '</h3>';
                        inList = false;
                    } else if (line.indexOf('## ') === 0) {
                        var headerText = line.substring(3);
                        processedLine = '<h2 class="text-xl font-bold text-white mt-6 mb-3 border-b border-slate-600 pb-2">' + headerText + '</h2>';
                        inList = false;
                    } else if (line.indexOf('# ') === 0) {
                        var headerText = line.substring(2);
                        processedLine = '<h1 class="text-2xl font-bold text-white mt-6 mb-4">' + headerText + '</h1>';
                        inList = false;
                    }
                    // Process lists
                    else if (line.indexOf('- ') === 0) {
                        var listText = line.substring(2);
                        if (!inList) {
                            processedLine = '<ul class="list-disc list-inside space-y-1 my-2"><li class="ml-4 text-gray-300">' + listText + '</li>';
                            inList = true;
                        } else {
                            processedLine = '<li class="ml-4 text-gray-300">' + listText + '</li>';
                        }
                    } else if (line.indexOf('* ') === 0) {
                        var listText = line.substring(2);
                        if (!inList) {
                            processedLine = '<ul class="list-disc list-inside space-y-1 my-2"><li class="ml-4 text-gray-300">' + listText + '</li>';
                            inList = true;
                        } else {
                            processedLine = '<li class="ml-4 text-gray-300">' + listText + '</li>';
                        }
                    }
                    // Process numbered lists (1. 2. etc. and double digit)
                    else if (line.match(/^\d+\.\s/)) {
                        var match = line.match(/^\d+\.\s/);
                        var listText = line.substring(match[0].length);
                        processedLine = '<li class="ml-4 mb-1 text-gray-300"><span class="font-medium">' + match[0].trim() + '</span> ' + listText + '</li>';
                    }
                    // Handle empty lines and close lists if needed
                    else if (line.trim() === '') {
                        if (inList) {
                            processedLines[processedLines.length - 1] += '</ul>';
                            inList = false;
                        }
                        processedLine = '<br/>';
                    }
                    // Regular paragraph text
                    else {
                        if (inList) {
                            processedLines[processedLines.length - 1] += '</ul>';
                            inList = false;
                        }
                        if (line.trim()) {
                            processedLine = '<p class="text-gray-300 my-2">' + line + '</p>';
                        }
                    }
                    
                    processedLines.push(processedLine);
                }
                
                // Close any open list at the end
                if (inList && processedLines.length > 0) {
                    processedLines[processedLines.length - 1] += '</ul>';
                }
                
                // Join lines - no extra <br> needed since we're handling spacing with classes
                text = processedLines.join('');
                
                // Process bold formatting **text** -> <strong>text</strong>
                while (text.indexOf('**') !== -1) {
                    var firstPos = text.indexOf('**');
                    var secondPos = text.indexOf('**', firstPos + 2);
                    if (secondPos !== -1) {
                        var beforeBold = text.substring(0, firstPos);
                        var boldText = text.substring(firstPos + 2, secondPos);
                        var afterBold = text.substring(secondPos + 2);
                        text = beforeBold + '<strong class="text-white font-semibold">' + boldText + '</strong>' + afterBold;
                    } else {
                        break;
                    }
                }
                
                // Process italic formatting *text* -> <em>text</em>
                while (text.indexOf('*') !== -1) {
                    var firstPos = text.indexOf('*');
                    var secondPos = text.indexOf('*', firstPos + 1);
                    if (secondPos !== -1 && secondPos - firstPos > 1) {
                        var beforeItalic = text.substring(0, firstPos);
                        var italicText = text.substring(firstPos + 1, secondPos);
                        var afterItalic = text.substring(secondPos + 1);
                        // Only convert if it's not part of a list marker
                        if (beforeItalic.length === 0 || beforeItalic.charAt(beforeItalic.length - 1) !== ' ') {
                            text = beforeItalic + '<em class="text-gray-300">' + italicText + '</em>' + afterItalic;
                        } else {
                            break;
                        }
                    } else {
                        break;
                    }
                }
                
                // Process markdown links [text](url) -> <a href="url">text</a>
                // Simplified markdown link processing without regex to avoid browser parsing issues
                var linkStart = text.indexOf('[');
                while (linkStart !== -1) {
                    var linkEnd = text.indexOf(']', linkStart);
                    if (linkEnd !== -1 && text.charAt(linkEnd + 1) === '(') {
                                                var urlStart = linkEnd + 2;
                        var urlEnd = text.indexOf(')', urlStart);
                        if (urlEnd !== -1) {
                            var linkText = text.substring(linkStart + 1, linkEnd);
                            var url = text.substring(urlStart, urlEnd);
                            var beforeLink = text.substring(0, linkStart);
                            var afterLink = text.substring(urlEnd + 1);
                            text = beforeLink + '<a href="' + url + '" class="text-primary hover:text-primary/80 underline" target="_blank" rel="noopener noreferrer">' + linkText + '</a>' + afterLink;
                            linkStart = text.indexOf('[', linkStart + 1);
                        } else {
                            linkStart = text.indexOf('[', linkStart + 1);
                        }
                    } else {
                        linkStart = text.indexOf('[', linkStart + 1);
                    }
                }
                
                // Process plain URLs (http://, https://, www.)
                // First, replace common course/resource patterns with clickable links (supports normal/curly/single quotes)
                // Matches: "Course Name" (optional: module/course/learning path/lesson/tutorial/video/playlist) on Provider
                text = text.replace(/["'“”]([^"'“”]+)["'“”]\\s+(?:module|course|learning\\s*path|lesson|tutorial|video|playlist)?\\s*on\\s+([A-Za-z][A-Za-z\\s&+\.\-]+?)(?=[\\)\\]\\.,;!]|\\s|$)/gi, function(match, courseName, platform) {
                    function providerSearchUrl(p, name) {
                        var pl = (p || '').trim().toLowerCase();
                        if (pl === 'udemy') return 'https://www.udemy.com/courses/search/?q=' + encodeURIComponent(name);
                        if (pl === 'coursera') return 'https://www.coursera.org/search?query=' + encodeURIComponent(name);
                        if (pl.indexOf('microsoft') !== -1 && pl.indexOf('learn') !== -1) return 'https://learn.microsoft.com/search/?terms=' + encodeURIComponent(name);
                        if (pl.indexOf('youtube') !== -1) return 'https://www.youtube.com/results?search_query=' + encodeURIComponent(name);
                        if (pl.indexOf('edx') !== -1) return 'https://www.edx.org/search?q=' + encodeURIComponent(name);
                        if (pl.indexOf('pluralsight') !== -1) return 'https://www.pluralsight.com/search?q=' + encodeURIComponent(name);
                        if (pl.indexOf('freecodecamp') !== -1) return 'https://www.youtube.com/results?search_query=' + encodeURIComponent(name + ' freeCodeCamp');
                        if (pl.indexOf('khan academy') !== -1) return 'https://www.khanacademy.org/search?query=' + encodeURIComponent(name);
                        if (pl.indexOf('a cloud guru') !== -1 || pl.indexOf('acloudguru') !== -1) return 'https://www.google.com/search?q=' + encodeURIComponent(name + ' site:acloudguru.com');
                        if (pl.indexOf('aws') !== -1 || pl.indexOf('amazon') !== -1) return 'https://www.google.com/search?q=' + encodeURIComponent(name + ' site:skillbuilder.aws OR site:aws.amazon.com/training');
                        // Fallback: generic Google search
                        return 'https://www.google.com/search?q=' + encodeURIComponent(name + ' ' + p);
                    }
                    var searchUrl = providerSearchUrl(platform, courseName);
                    return '<a href="' + searchUrl + '" class="text-primary hover:text-primary/80 underline" target="_blank" rel="noopener noreferrer">"' + courseName + '" on ' + platform + '</a>';
                });
                
                // Process standalone URLs - fixed regex
                // Use non-capturing group; escape backslashes for template literal, but keep pattern simple
                var urlRegex = /(?:https?:\\/\\/|www\\.)[^\\s<>"']+/g;
                text = text.replace(urlRegex, function(url) {
                    // Skip if already part of an anchor tag
                    if (text.indexOf('href="' + url) > -1 || text.indexOf('>' + url + '</a>') > -1) {
                        return url;
                    }
                    var displayUrl = url;
                    var actualUrl = url;
                    // Add protocol if missing for www. URLs
                    if (url.indexOf('www.') === 0) {
                        actualUrl = 'https://' + url;
                    }
                    // Truncate long URLs for display
                    if (displayUrl.length > 50) {
                        displayUrl = displayUrl.substring(0, 47) + '...';
                    }
                    return '<a href="' + actualUrl + '" class="text-primary hover:text-primary/80 underline" target="_blank" rel="noopener noreferrer">' + displayUrl + '</a>';
                });
                
                // No extra wrapper needed since we handle spacing inline
                return text;
            }
            
            // Hide loading and show results within the Analysis tab
            const loadingSection = document.getElementById('loadingSection');
            const resultsSection = document.getElementById('resultsSection');
            
            if (loadingSection) loadingSection.classList.add('hidden');
            if (resultsSection) resultsSection.classList.remove('hidden');
            
            // Display results in the results content area
            const resultsContent = document.getElementById('resultsContent');
            
            console.log('🔍 Debug - resultsContent:', resultsContent);
            console.log('🔍 Debug - resultsSection visible:', !resultsSection?.classList.contains('hidden'));
            
            if (resultsContent && analysisData) {
                // Determine analysis type
                const hasJobDescription = analysisData.hasJobDescription || analysisData.analysisType === 'job-comparison';
                const headerTitle = hasJobDescription ? 'Job Match Analysis' : 'CV Analysis and Recommendations';
                
                let html = '<div class="space-y-6">';
                
                // Success header
                html += '<div class="text-center mb-6">' +
                    '<div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">' +
                        '<i class="fas fa-check text-white text-2xl"></i>' +
                    '</div>' +
                    '<h4 class="text-2xl font-bold text-green-400 mb-2">✅ Analysis Complete!</h4>' +
                    '<p class="text-gray-300">Your personalized insights are ready.</p>' +
                '</div>';
                
                // Main narrative content - safe display without regex
                if (analysisData.narrative) {
                    var safeNarrative = '';
                    try {
                        safeNarrative = mdToHtml(analysisData.narrative);
                        console.log('🔍 Debug - Converted HTML successfully');
                    } catch (error) {
                        console.log('🔍 Debug - Markdown conversion failed, using fallback');
                        // Safe fallback - just convert line breaks to <br>
                        safeNarrative = '<p class="text-gray-300">' + analysisData.narrative.split('\\n').join('<br>') + '</p>';
                    }
                    
                    html += '<div class="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-primary/30 rounded-lg p-6 mb-6">' +
                        '<h5 class="text-xl font-bold text-white mb-4 flex items-center">' +
                            '<i class="fas fa-' + (hasJobDescription ? 'bullseye' : 'user-tie') + ' text-primary mr-3"></i>' +
                            headerTitle +
                        '</h5>' +
                        '<div class="text-gray-300 leading-relaxed">' + safeNarrative + '</div>' +
                    '</div>';
                } else {
                    html += '<div class="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-6">' +
                        '<div class="flex items-center text-yellow-400 mb-2">' +
                            '<i class="fas fa-exclamation-triangle mr-2"></i>' +
                            '<span class="font-semibold">Analysis Completed</span>' +
                        '</div>' +
                        '<p class="text-yellow-300">Your analysis has been processed, but the detailed narrative is not available in this view.</p>' +
                    '</div>';
                }
                
                // Action button
                html += '<div class="flex gap-4 justify-center">' +
                    '<button onclick="resetToUploadScreen()" class="bg-primary hover:bg-primary/80 text-white px-6 py-3 rounded-lg transition-colors flex items-center">' +
                        '<i class="fas fa-plus mr-2"></i>' +
                        'Analyze Another Resume' +
                    '</button>' +
                '</div>';
                
                html += '</div>';
                
                resultsContent.innerHTML = html;
                
                console.log('✅ Results displayed successfully with narrative:', !!analysisData.narrative);
            } else {
                console.error('❌ No results content element or analysis data found');
            }
            
            AppState.isAnalyzing = false;
            updateAnalysisButton();
        }

        function displayAnalysisResultsOld(analysisData) {
            const analysisInterface = document.getElementById('analysisInterface');
            const modalContent = analysisInterface.querySelector('.bg-slate-800');
            
            const fallbackNotice = '';
            
            // Build the skills HTML
            const skillsHtml = (analysisData.skills || ['Communication', 'Problem Solving', 'Teamwork'])
                .map(skill => '<span class="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm">' + skill + '</span>')
                .join('');
            
            // Build the summary HTML
            const summaryHtml = analysisData.summary ? 
                '<div class="bg-slate-700 rounded-lg p-6">' +
                    '<h3 class="text-xl font-bold text-white mb-4">' +
                        '<i class="fas fa-file-alt text-primary mr-2"></i>' +
                        'Summary' +
                    '</h3>' +
                    '<p class="text-gray-300">' + analysisData.summary + '</p>' +
                '</div>' : '';
            
            // Build the recommendations HTML
            const recommendationsHtml = (analysisData.recommendations || [
                'Consider adding more specific skills to your resume',
                'Highlight quantifiable achievements',
                'Tailor your resume to job requirements'
            ]).map(rec => 
                '<li class="flex items-start text-gray-300">' +
                    '<i class="fas fa-arrow-right text-primary mr-2 mt-1"></i>' +
                    rec +
                '</li>'
            ).join('');

            modalContent.innerHTML = 
                '<div class="p-6">' +
                    '<div class="flex justify-between items-center mb-6">' +
                        '<h2 class="text-2xl font-bold text-primary">Analysis Results</h2>' +
                        '<button id="closeAnalysisInterface" class="text-gray-400 hover:text-white">' +
                            '<i class="fas fa-times text-xl"></i>' +
                        '</button>' +
                    '</div>' +

                    fallbackNotice +

                    '<div class="space-y-6">' +
                        '<!-- Skills Analysis -->' +
                        '<div class="bg-slate-700 rounded-lg p-6">' +
                            '<h3 class="text-xl font-bold text-white mb-4">' +
                                '<i class="fas fa-cogs text-primary mr-2"></i>' +
                                'Skills Analysis' +
                            '</h3>' +
                            '<div class="grid md:grid-cols-2 gap-4">' +
                                '<div>' +
                                    '<h4 class="font-semibold text-gray-300 mb-2">Identified Skills</h4>' +
                                    '<div class="flex flex-wrap gap-2">' +
                                        skillsHtml +
                                    '</div>' +
                                '</div>' +
                                '<div>' +
                                    '<h4 class="font-semibold text-gray-300 mb-2">Experience Level</h4>' +
                                    '<div class="bg-slate-600 rounded-lg p-3">' +
                                        '<span class="text-primary font-semibold">' + (analysisData.experienceLevel || 'Professional') + '</span>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +

                        '<!-- Summary -->' +
                        summaryHtml +

                        '<!-- Recommendations -->' +
                        '<div class="bg-slate-700 rounded-lg p-6">' +
                            '<h3 class="text-xl font-bold text-white mb-4">' +
                                '<i class="fas fa-lightbulb text-primary mr-2"></i>' +
                                'Recommendations' +
                            '</h3>' +
                            '<ul class="space-y-2">' +
                                recommendationsHtml +
                            '</ul>' +
                        '</div>' +

                        '<!-- Actions -->' +
                        '<div class="flex gap-4">' +
                            '<button onclick="startNewAnalysis()" class="bg-primary hover:bg-primary/80 text-white px-6 py-2 rounded-lg transition-colors">' +
                                '<i class="fas fa-plus mr-2"></i>' +
                                'New Analysis' +
                            '</button>' +
                        '</div>' +
                    '</div>' +
                '</div>';
            
            // Re-attach close event listener
            document.getElementById('closeAnalysisInterface')?.addEventListener('click', hideAnalysisInterface);
        }

        // Handle analyze skills button click
        function handleAnalyzeSkillsClick() {
            if (!AppState.user) {
                showAuthModal('login');
                showNotification('Please log in to analyze your resume.', 'info');
                return;
            }
            showAnalysisInterface();
        }
        
        // Add startAnalysisFromDemo button handler
        document.getElementById('startAnalysisFromDemo')?.addEventListener('click', handleAnalyzeSkillsClick);

        // Helper functions for analysis results
        function startNewAnalysis() {
            AppState.resumeFile = null;
            AppState.resumeText = '';
            showAnalysisInterface();
        }

        // Job Description Helper Functions
        function updateAnalysisTypeIndicator() {
            const jobDescriptionTextArea = document.getElementById('jobDescriptionTextArea');
            const indicator = document.getElementById('analysisTypeIndicator');
            const typeText = document.getElementById('analysisTypeText');
            
            if (!jobDescriptionTextArea || !indicator || !typeText) return;
            
            const jobDescription = jobDescriptionTextArea.value.trim();
            
            if (jobDescription) {
                typeText.textContent = '🎯 Job Fit Analysis - Your CV will be analyzed against the specific job requirements';
                indicator.className = 'mt-4 p-3 bg-green-600/20 rounded-lg border-l-4 border-green-500';
                indicator.querySelector('i').className = 'fas fa-bullseye text-green-500 mr-2';
            } else {
                typeText.textContent = '📖 Standalone Career Analysis - General career guidance and improvement suggestions';
                indicator.className = 'mt-4 p-3 bg-slate-600 rounded-lg border-l-4 border-yellow-500';
                indicator.querySelector('i').className = 'fas fa-info-circle text-yellow-500 mr-2';
            }
        }
        
        function clearJobDescription() {
            const jobDescriptionTextArea = document.getElementById('jobDescriptionTextArea');
            if (jobDescriptionTextArea) {
                jobDescriptionTextArea.value = '';
                updateAnalysisTypeIndicator();
                showNotification('Job description cleared. Analysis will be standalone.', 'info');
            }
        }
    </script>
</body>
</html>`;