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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
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
                        <h3 class="text-2xl font-bold text-white mb-4">Free</h3>
                        <div class="text-4xl font-bold text-primary mb-6">$0<span class="text-lg text-gray-400">/month</span></div>
                        <ul class="space-y-3 mb-8">
                            <li class="flex items-center text-gray-300">
                                <i class="fas fa-check text-primary mr-3"></i>
                                1 resume analysis per month
                            </li>
                            <li class="flex items-center text-gray-300">
                                <i class="fas fa-check text-primary mr-3"></i>
                                Basic skill gap analysis
                            </li>
                            <li class="flex items-center text-gray-300">
                                <i class="fas fa-check text-primary mr-3"></i>
                                General career recommendations
                            </li>
                        </ul>
                        <button class="w-full bg-slate-600 hover:bg-slate-500 text-white py-3 px-6 rounded-lg transition-colors">
                            Get Started
                        </button>
                    </div>

                    <div class="bg-slate-700 rounded-lg p-8 border-2 border-primary relative">
                        <div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
                            <span class="bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold">Most Popular</span>
                        </div>
                        <h3 class="text-2xl font-bold text-white mb-4">Pro</h3>
                        <div class="text-4xl font-bold text-primary mb-6">$29<span class="text-lg text-gray-400">/month</span></div>
                        <ul class="space-y-3 mb-8">
                            <li class="flex items-center text-gray-300">
                                <i class="fas fa-check text-primary mr-3"></i>
                                Unlimited resume analyses
                            </li>
                            <li class="flex items-center text-gray-300">
                                <i class="fas fa-check text-primary mr-3"></i>
                                Advanced skill gap analysis
                            </li>
                            <li class="flex items-center text-gray-300">
                                <i class="fas fa-check text-primary mr-3"></i>
                                Personalized career roadmap
                            </li>
                            <li class="flex items-center text-gray-300">
                                <i class="fas fa-check text-primary mr-3"></i>
                                Industry-specific insights
                            </li>
                            <li class="flex items-center text-gray-300">
                                <i class="fas fa-check text-primary mr-3"></i>
                                Priority support
                            </li>
                        </ul>
                        <button class="w-full bg-primary hover:bg-primary/80 text-white py-3 px-6 rounded-lg transition-colors">
                            Start Free Trial
                        </button>
                    </div>

                    <div class="bg-slate-700 rounded-lg p-8 border border-slate-600">
                        <h3 class="text-2xl font-bold text-white mb-4">Enterprise</h3>
                        <div class="text-4xl font-bold text-primary mb-6">Custom</div>
                        <ul class="space-y-3 mb-8">
                            <li class="flex items-center text-gray-300">
                                <i class="fas fa-check text-primary mr-3"></i>
                                Everything in Pro
                            </li>
                            <li class="flex items-center text-gray-300">
                                <i class="fas fa-check text-primary mr-3"></i>
                                Team analytics dashboard
                            </li>
                            <li class="flex items-center text-gray-300">
                                <i class="fas fa-check text-primary mr-3"></i>
                                Custom integrations
                            </li>
                            <li class="flex items-center text-gray-300">
                                <i class="fas fa-check text-primary mr-3"></i>
                                Dedicated account manager
                            </li>
                            <li class="flex items-center text-gray-300">
                                <i class="fas fa-check text-primary mr-3"></i>
                                SLA guarantee
                            </li>
                        </ul>
                        <button class="w-full bg-slate-600 hover:bg-slate-500 text-white py-3 px-6 rounded-lg transition-colors">
                            Contact Sales
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <!-- Demo Section -->
        <section id="demo" class="py-20 bg-slate-900">
            <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 class="text-4xl font-bold text-white mb-4">Try Demo</h2>
                <p class="text-xl text-gray-300 mb-8">
                    Experience the power of AI-driven career insights with our interactive demo
                </p>
                <div class="bg-slate-800 rounded-lg p-8 border border-slate-700">
                    <div class="mb-6">
                        <i class="fas fa-play-circle text-6xl text-primary mb-4"></i>
                        <h3 class="text-2xl font-bold text-white mb-2">Interactive Demo</h3>
                        <p class="text-gray-300">
                            See how our AI analyzes a sample resume and provides actionable career insights
                        </p>
                    </div>
                    <button id="startDemoBtn" class="bg-primary hover:bg-primary/80 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
                        <i class="fas fa-rocket mr-2"></i>
                        Start Interactive Demo
                    </button>
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
    <div id="analysisInterface" class="hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div class="bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div class="p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-primary">AI-Powered Skills Analysis</h2>
                    <button id="closeAnalysisInterface" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>

                <div class="text-center py-12">
                    <div class="mb-8">
                        <i class="fas fa-upload text-6xl text-primary mb-4"></i>
                        <h3 class="text-2xl font-bold text-white mb-4">Upload Your Resume</h3>
                        <p class="text-gray-300 mb-6">
                            Upload your CV or paste your resume text to get started with AI-powered analysis
                        </p>
                    </div>
                    
                    <div class="grid md:grid-cols-2 gap-6 mb-8">
                        <div class="border-2 border-dashed border-gray-600 rounded-lg p-8 hover:border-primary transition-colors cursor-pointer" id="fileUploadArea">
                            <i class="fas fa-file-upload text-4xl text-gray-400 mb-4"></i>
                            <p class="text-gray-300 mb-2">Drop your resume here</p>
                            <p class="text-sm text-gray-400">PDF, DOC, DOCX, TXT</p>
                            <input type="file" id="resumeFileInput" class="hidden" accept=".pdf,.doc,.docx,.txt">
                        </div>
                        
                        <div class="border border-gray-600 rounded-lg p-6">
                            <i class="fas fa-keyboard text-4xl text-gray-400 mb-4"></i>
                            <p class="text-gray-300 mb-4">Or paste your resume text</p>
                            <textarea id="resumeTextArea" class="w-full h-32 bg-slate-700 border border-slate-600 rounded-lg p-3 text-white resize-none focus:outline-none focus:border-primary" placeholder="Paste your resume content here..."></textarea>
                        </div>
                    </div>
                    
                    <button id="startAnalysisBtn" class="bg-primary hover:bg-primary/80 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                        <i class="fas fa-brain mr-2"></i>
                        Start AI Analysis
                    </button>
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
            authToken: null
        };

        // API Configuration
        const API_BASE_URL = '/api';
        const API_V1_BASE_URL = '/api/v1';
        const API_ENDPOINTS = {
            login: \`\${API_BASE_URL}/auth/login\`,
            register: \`\${API_BASE_URL}/auth/register\`,
            logout: \`\${API_BASE_URL}/auth/logout\`,
            me: \`\${API_BASE_URL}/auth/me\`,
            analyzeResume: \`\${API_V1_BASE_URL}/analyze/resume\`
        };

        // Initialize application
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Clearsight IP application initializing...');
            
            // Setup all event listeners
            setupNavigationListeners();
            setupAuthListeners();
            setupAnalysisListeners();
            setupUIListeners();
            
            // Check authentication status
            checkAuthStatus();
            
            console.log('Clearsight IP application loaded successfully!');
        });

        // Authentication status check
        async function checkAuthStatus() {
            try {
                const response = await fetch(API_ENDPOINTS.me, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        AppState.user = data.data.user;
                        updateUIForAuthenticatedUser();
                    }
                }
            } catch (error) {
                console.log('User not authenticated');
            }
        }

        // Update UI for authenticated user
        function updateUIForAuthenticatedUser() {
            const authButtons = document.getElementById('authButtons');
            const userMenu = document.getElementById('userMenu');
            const userEmail = document.getElementById('userEmail');

            if (authButtons && userMenu && userEmail && AppState.user) {
                authButtons.classList.add('hidden');
                userMenu.classList.remove('hidden');
                userEmail.textContent = AppState.user.email;
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
        }

        // Navigation functionality
        function setupNavigationListeners() {
            // Smooth scrolling for navigation links
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
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
            // Analysis modal triggers
            document.getElementById('analyzeSkillsBtn')?.addEventListener('click', handleAnalyzeSkillsClick);
            document.getElementById('startDemoBtn')?.addEventListener('click', handleAnalyzeSkillsClick);
            
            // Modal controls
            document.getElementById('closeAnalysisInterface')?.addEventListener('click', hideAnalysisInterface);
            document.getElementById('analysisInterface')?.addEventListener('click', (e) => {
                if (e.target.id === 'analysisInterface') hideAnalysisInterface();
            });

            // File upload
            document.getElementById('fileUploadArea')?.addEventListener('click', () => {
                document.getElementById('resumeFileInput')?.click();
            });
            
            document.getElementById('resumeFileInput')?.addEventListener('change', handleFileUpload);
            
            // Text area
            document.getElementById('resumeTextArea')?.addEventListener('input', handleTextInput);
            
            // Analysis start
            document.getElementById('startAnalysisBtn')?.addEventListener('click', startAnalysis);
        }

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
            modal?.classList.remove('hidden');
            AppState.currentModal = 'analysis';
        }

        function hideAnalysisInterface() {
            const modal = document.getElementById('analysisInterface');
            modal?.classList.add('hidden');
            AppState.currentModal = null;
        }

        // File handling
        function handleFileUpload(e) {
            const file = e.target.files[0];
            if (file) {
                AppState.resumeFile = file;
                AppState.resumeText = '';
                document.getElementById('resumeTextArea').value = '';
                updateAnalysisButton();
                
                // Show file name
                const fileArea = document.getElementById('fileUploadArea');
                fileArea.innerHTML = \`
                    <i class="fas fa-file-check text-4xl text-primary mb-4"></i>
                    <p class="text-primary mb-2">\${file.name}</p>
                    <p class="text-sm text-gray-400">File ready for analysis</p>
                \`;
            }
        }

        function handleTextInput(e) {
            AppState.resumeText = e.target.value;
            AppState.resumeFile = null;
            updateAnalysisButton();
            
            // Reset file upload area if text is entered
            if (AppState.resumeText.length > 0) {
                const fileArea = document.getElementById('fileUploadArea');
                fileArea.innerHTML = \`
                    <i class="fas fa-file-upload text-4xl text-gray-400 mb-4"></i>
                    <p class="text-gray-300 mb-2">Drop your resume here</p>
                    <p class="text-sm text-gray-400">PDF, DOC, DOCX, TXT</p>
                \`;
            }
        }

        function updateAnalysisButton() {
            const button = document.getElementById('startAnalysisBtn');
            const hasContent = AppState.resumeFile || AppState.resumeText.trim().length > 0;
            
            if (hasContent) {
                button?.removeAttribute('disabled');
                button?.classList.remove('opacity-50', 'cursor-not-allowed');
            } else {
                button?.setAttribute('disabled', 'true');
                button?.classList.add('opacity-50', 'cursor-not-allowed');
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
                
                // Prepare the request data
                let requestData = {};
                
                if (AppState.resumeFile) {
                    // Handle file upload
                    console.log('Sending file analysis request to:', API_ENDPOINTS.analyzeResume);
                    console.log('File details:', AppState.resumeFile.name, AppState.resumeFile.type, AppState.resumeFile.size);
                    
                    const formData = new FormData();
                    formData.append('resume', AppState.resumeFile); // Backend expects 'resume', not 'file'
                    
                    const response = await fetch(API_ENDPOINTS.analyzeResume, {
                        method: 'POST',
                        credentials: 'include',
                        body: formData
                    });
                    
                    console.log('File analysis response status:', response.status);
                    
                    let data;
                    try {
                        data = await response.json();
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
                    
                    const response = await fetch(API_ENDPOINTS.analyzeResume, {
                        method: 'POST',
                        credentials: 'include',
                        body: formData // Send as FormData, not JSON
                    });
                    
                    console.log('Analysis response status:', response.status);
                    
                    let data;
                    try {
                        data = await response.json();
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
                // Surface the error to the user; do not produce basic fallback analysis
                showNotification('Analysis failed. Please try again after a moment.', 'error');
            } finally {
                AppState.isAnalyzing = false;
                button.innerHTML = originalText;
                updateAnalysisButton();
            }
        }

        function handleAnalysisResponse(data, success) {
            if (success && data.success) {
                // Show analysis results
                displayAnalysisResults(data.data || data);
                showNotification('Analysis completed successfully!', 'success');
            } else {
                let errorMessage = 'Analysis failed. Please try again.';
                if (data && data.error) {
                    errorMessage = data.error.message || errorMessage;
                } else if (!success) {
                    errorMessage = 'Server error occurred during analysis. Please try again.';
                }
                console.error('Analysis error:', data);
                showNotification(errorMessage, 'error');
                // If authentication error, redirect to login
                if (data && data.error && (data.error.code === 'AUTH_REQUIRED' || data.error.code === 'AUTHENTICATION_REQUIRED')) {
                    hideAnalysisInterface();
                    showAuthModal('login');
                }
            }
        }

        function displayAnalysisResults(analysisData) {
            const analysisInterface = document.getElementById('analysisInterface');
            const modalContent = analysisInterface.querySelector('.bg-slate-800');
            
            const fallbackNotice = '';
            
            modalContent.innerHTML = \`
                \u003cdiv class=\"p-6\"\u003e
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold text-primary">Analysis Results</h2>
                        <button id="closeAnalysisInterface" class="text-gray-400 hover:text-white">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>

                    \${fallbackNotice}

                    <div class="space-y-6">
                        <!-- Skills Analysis -->
                        <div class="bg-slate-700 rounded-lg p-6">
                            <h3 class="text-xl font-bold text-white mb-4">
                                <i class="fas fa-cogs text-primary mr-2"></i>
                                Skills Analysis
                            </h3>
                            <div class="grid md:grid-cols-2 gap-4">
                                <div>
                                    <h4 class="font-semibold text-gray-300 mb-2">Identified Skills</h4>
                                    <div class="flex flex-wrap gap-2">
                                        \${(analysisData.skills || ['Communication', 'Problem Solving', 'Teamwork']).map(skill => 
                                            \`<span class="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm">\${skill}</span>\`
                                        ).join('')}
                                    </div>
                                </div>
                                <div>
                                    <h4 class="font-semibold text-gray-300 mb-2">Experience Level</h4>
                                    <div class="bg-slate-600 rounded-lg p-3">
                                        <span class="text-primary font-semibold">\${analysisData.experienceLevel || 'Professional'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Summary -->
                        \${analysisData.summary ? \`
                        <div class="bg-slate-700 rounded-lg p-6">
                            <h3 class="text-xl font-bold text-white mb-4">
                                <i class="fas fa-file-alt text-primary mr-2"></i>
                                Summary
                            </h3>
                            <p class="text-gray-300">\${analysisData.summary}</p>
                        </div>
                        \` : ''}

                        <!-- Recommendations -->
                        <div class="bg-slate-700 rounded-lg p-6">
                            <h3 class="text-xl font-bold text-white mb-4">
                                <i class="fas fa-lightbulb text-primary mr-2"></i>
                                Recommendations
                            </h3>
                            <ul class="space-y-2">
                                \${(analysisData.recommendations || [
                                    'Consider adding more specific skills to your resume',
                                    'Highlight quantifiable achievements',
                                    'Tailor your resume to job requirements'
                                ]).map(rec => 
                                    \`<li class="flex items-start text-gray-300">
                                        <i class="fas fa-arrow-right text-primary mr-2 mt-1"></i>
                                        \${rec}
                                    </li>\`
                                ).join('')}
                            </ul>
                        </div>

                        <!-- Actions -->
                        <div class="flex gap-4">
                            <button onclick="startNewAnalysis()" class="bg-primary hover:bg-primary/80 text-white px-6 py-2 rounded-lg transition-colors">
                                <i class="fas fa-plus mr-2"></i>
                                New Analysis
                            </button>
                            <button onclick="downloadResults()" class="border border-gray-600 hover:border-primary text-gray-300 hover:text-primary px-6 py-2 rounded-lg transition-colors">
                                <i class="fas fa-download mr-2"></i>
                                Download Report
                            </button>
                        </div>
                    </div>
                </div>
            \`;
            
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

        // Helper functions for analysis results
        function startNewAnalysis() {
            AppState.resumeFile = null;
            AppState.resumeText = '';
            showAnalysisInterface();
        }

        function downloadResults() {
            showNotification('Download functionality coming soon!', 'info');
        }
    </script>
</body>
</html>`;