export const HTML_CONTENT = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Clearsight IP - Bridge Your Skills Gap with AI-Powered Insights</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#1a365d',
                        accent: '#14b8a6',
                        background: '#f8fafc',
                        text: '#1f2937'
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
        
        .dark-mode {
            background-color: #0f172a;
            color: #e2e8f0;
        }
        
        .dark-mode .bg-light {
            background-color: #1e293b;
        }
        
        .dark-mode .text-dark {
            color: #e2e8f0;
        }
        
        .dark-mode .card {
            background-color: #1e293b;
            border: 1px solid #334155;
        }
        
        .feature-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        .hero-pattern {
            background-image: radial-gradient(#14b8a6 1px, transparent 1px);
            background-size: 20px 20px;
        }
        
        .code-block {
            background-color: #1e293b;
            border-radius: 0.5rem;
            padding: 1.5rem;
            font-family: monospace;
            overflow-x: auto;
        }
        
        .pricing-card {
            transition: all 0.3s ease;
        }
        
        .pricing-card:hover {
            transform: scale(1.03);
        }
        
        .demo-box {
            min-height: 300px;
        }
        
        .stats-number {
            font-size: 2.5rem;
            font-weight: 700;
        }
        
        .dark-mode .stats-number {
            color: #14b8a6;
        }
        
        .gradient-text {
            background: linear-gradient(90deg, #1a365d, #14b8a6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .toggle-switch {
            position: relative;
            display: inline-block;
            width: 60px;
            height: 30px;
        }
        
        .toggle-switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        
        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: .4s;
            border-radius: 34px;
        }
        
        .slider:before {
            position: absolute;
            content: "";
            height: 22px;
            width: 22px;
            left: 4px;
            bottom: 4px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
        }
        
        input:checked + .slider {
            background-color: #14b8a6;
        }
        
        input:checked + .slider:before {
            transform: translateX(30px);
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
    </style>
</head>
<body class="bg-background text-text dark:text-gray-200">
    <!-- Header -->
    <header class="sticky top-0 z-50 bg-white dark:bg-slate-900 shadow-md py-4 px-6">
        <div class="container mx-auto flex justify-between items-center">
            <div>
                <h1 class="text-2xl font-bold text-primary dark:text-accent">Clearsight IP</h1>
                <p class="text-sm text-gray-600 dark:text-gray-300">Bridge Your Skills Gap with AI-Powered Insights</p>
            </div>
            
            <nav class="hidden md:flex space-x-8">
                <a href="#features" class="nav-link text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-accent">Features</a>
                <a href="#how-it-works" class="nav-link text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-accent">How It Works</a>
                <a href="#api" class="nav-link text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-accent">API Endpoints</a>
                <a href="#pricing" class="nav-link text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-accent">Pricing</a>
                <a href="#documentation" class="nav-link text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-accent">Documentation</a>
                <a href="#contact" class="nav-link text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-accent">Contact</a>
            </nav>
            
            <div class="flex items-center space-x-4">
                <button id="theme-toggle" class="focus:outline-none">
                    <i class="fas fa-moon text-gray-700 dark:text-yellow-300 text-xl"></i>
                </button>
                <a href="#api" class="bg-accent hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300">
                    Get API Access
                </a>
                <button class="md:hidden text-gray-700 dark:text-gray-300">
                    <i class="fas fa-bars text-2xl"></i>
                </button>
            </div>
        </div>
    </header>

    <!-- Hero Section - Problem Statement -->
    <section class="py-16 md:py-24 hero-pattern">
        <div class="container mx-auto px-6 flex flex-col md:flex-row items-center">
            <div class="md:w-1/2 mb-12 md:mb-0">
                <div class="mb-6">
                    <span class="bg-red-100 text-red-800 text-sm font-semibold px-3 py-1 rounded-full">Career Challenge</span>
                </div>
                <h1 class="text-4xl md:text-5xl font-bold leading-tight mb-6">
                    Struggling to <span class="text-red-600">stand out</span> in today's competitive job market? <span class="gradient-text">You're not alone.</span>
                </h1>
                <p class="text-xl text-gray-300 mb-8">
                    Most professionals don't know which skills they're missing or how to showcase their expertise effectively. Your dream job might be just one skill gap away.
                </p>
                
                <div class="bg-red-900/20 border-l-4 border-red-500 p-4 mb-8">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <i class="fas fa-exclamation-triangle text-red-500"></i>
                        </div>
                        <div class="ml-3">
                            <p class="text-sm text-red-300">
                                <strong>The Reality:</strong> 67% of professionals feel underqualified for their dream jobs • Average job search takes 5+ months • Most resumes get only 6 seconds of attention
                            </p>
                        </div>
                    </div>
                </div>
                
                <div class="flex flex-wrap gap-4">
                    <button class="bg-primary hover:bg-blue-800 text-white font-semibold py-3 px-8 rounded-lg transition duration-300">
                        Discover Your Gaps
                    </button>
                </div>
            </div>
            
            <div class="md:w-1/2 flex justify-center">
                <div class="relative">
                    <div class="w-80 h-80 md:w-96 md:h-96 bg-gradient-to-br from-red-500 to-orange-500 rounded-full opacity-10 absolute -top-10 -left-10 animate-float"></div>
                    <div class="w-64 h-64 md:w-80 md:h-80 bg-gradient-to-tr from-orange-500 to-red-500 rounded-full opacity-10 absolute -bottom-10 -right-10 animate-float animation-delay-2000"></div>
                    <div class="relative bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="font-bold text-lg text-red-400">Your Career Reality</h3>
                            <span class="bg-red-600 text-white text-xs font-semibold px-2.5 py-0.5 rounded ml-3">The Struggle</span>
                        </div>
                        
                        <div class="space-y-4">
                            <div class="flex justify-between items-center p-3 bg-red-900/20 rounded">
                                <span class="text-sm font-medium">Job Search Duration</span>
                                <span class="text-sm font-bold text-red-400">5+ months</span>
                            </div>
                            
                            <div class="flex justify-between items-center p-3 bg-orange-900/20 rounded">
                                <span class="text-sm font-medium">Resume Review Time</span>
                                <span class="text-sm font-bold text-orange-400">6 seconds</span>
                            </div>
                            
                            <div class="flex justify-between items-center p-3 bg-yellow-900/20 rounded">
                                <span class="text-sm font-medium">Feel Underqualified</span>
                                <span class="text-sm font-bold text-yellow-400">67% of pros</span>
                            </div>
                            
                            <div class="pt-4 border-t border-slate-700">
                                <h4 class="font-semibold mb-2 text-red-400">What's Holding You Back:</h4>
                                <ul class="space-y-1 text-sm">
                                    <li class="flex items-center"><i class="fas fa-times text-red-500 mr-2"></i>Don't know which skills to learn</li>
                                    <li class="flex items-center"><i class="fas fa-times text-red-500 mr-2"></i>Can't showcase expertise effectively</li>
                                    <li class="flex items-center"><i class="fas fa-times text-red-500 mr-2"></i>Missing key requirements for dream jobs</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Solution Section -->
    <section class="py-16 bg-gradient-to-r from-green-900/20 to-blue-900/20">
        <div class="container mx-auto px-6">
            <div class="text-center mb-12">
                <span class="bg-green-600 text-white text-sm font-semibold px-3 py-1 rounded-full">Your Solution</span>
                <h2 class="text-3xl md:text-4xl font-bold mt-4 mb-6">
                    AI-Powered Career Intelligence That <span class="text-green-400">Accelerates Your Growth</span>
                </h2>
                <p class="text-xl text-gray-300 max-w-3xl mx-auto">
                    Discover exactly which skills you need, get personalized learning paths, and showcase your expertise with confidence. Your next career breakthrough starts here.
                </p>
            </div>

            <div class="flex flex-col md:flex-row items-center">
                <div class="md:w-1/2 mb-8 md:mb-0">
                    <div class="relative bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="font-bold text-lg text-green-400">Your Skills Analysis</h3>
                            <span class="bg-green-600 text-white text-xs font-semibold px-2.5 py-0.5 rounded">Ready to Apply</span>
                        </div>
                        
                        <div class="space-y-4">
                            <div>
                                <div class="flex justify-between mb-1">
                                    <span class="text-sm font-medium">JavaScript</span>
                                    <span class="text-sm font-medium text-green-400">Strong Match</span>
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-2.5">
                                    <div class="bg-green-600 h-2.5 rounded-full" style="width: 92%"></div>
                                </div>
                            </div>
                            
                            <div>
                                <div class="flex justify-between mb-1">
                                    <span class="text-sm font-medium">React</span>
                                    <span class="text-sm font-medium text-blue-400">Good Foundation</span>
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-2.5">
                                    <div class="bg-blue-600 h-2.5 rounded-full" style="width: 78%"></div>
                                </div>
                            </div>
                            
                            <div>
                                <div class="flex justify-between mb-1">
                                    <span class="text-sm font-medium">TypeScript</span>
                                    <span class="text-sm font-medium text-purple-400">Learn This</span>
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-2.5">
                                    <div class="bg-purple-600 h-2.5 rounded-full" style="width: 25%"></div>
                                </div>
                            </div>
                            
                            <div class="pt-4 border-t border-slate-700">
                                <h4 class="font-semibold mb-2 text-green-400">Your Next Steps:</h4>
                                <ul class="space-y-1 text-sm">
                                    <li class="flex items-center"><i class="fas fa-check text-green-500 mr-2"></i>Apply for Senior Frontend roles</li>
                                    <li class="flex items-center"><i class="fas fa-book text-blue-500 mr-2"></i>Complete TypeScript course (2 weeks)</li>
                                    <li class="flex items-center"><i class="fas fa-star text-purple-500 mr-2"></i>Add portfolio projects</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="md:w-1/2 md:pl-12">
                    <div class="space-y-6">
                        <div class="flex items-start">
                            <div class="w-12 h-12 rounded-full bg-green-900/50 flex items-center justify-center mr-4 flex-shrink-0">
                                <i class="fas fa-search text-green-400 text-xl"></i>
                            </div>
                            <div>
                                <h3 class="text-xl font-bold mb-2">Discover Your Strengths</h3>
                                <p class="text-gray-300">Uncover hidden skills in your experience that you might not even realize you have. Our AI finds what recruiters are looking for.</p>
                            </div>
                        </div>

                        <div class="flex items-start">
                            <div class="w-12 h-12 rounded-full bg-blue-900/50 flex items-center justify-center mr-4 flex-shrink-0">
                                <i class="fas fa-chart-line text-blue-400 text-xl"></i>
                            </div>
                            <div>
                                <h3 class="text-xl font-bold mb-2">Know What's Trending</h3>
                                <p class="text-gray-300">Stay ahead of the curve with real-time industry insights. Learn the skills that will matter most in your next role.</p>
                            </div>
                        </div>

                        <div class="flex items-start">
                            <div class="w-12 h-12 rounded-full bg-purple-900/50 flex items-center justify-center mr-4 flex-shrink-0">
                                <i class="fas fa-route text-purple-400 text-xl"></i>
                            </div>
                            <div>
                                <h3 class="text-xl font-bold mb-2">Get Your Roadmap</h3>
                                <p class="text-gray-300">Receive a personalized learning plan with exact courses, timeframes, and priorities to land your dream job.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Core Features -->
    <section id="features" class="py-16 bg-slate-800">
        <div class="container mx-auto px-6">
            <div class="text-center mb-16">
                <h2 class="text-3xl md:text-4xl font-bold mb-4">Transform Your Career</h2>
                <p class="text-xl text-gray-300 max-w-3xl mx-auto">
                    Everything you need to identify skill gaps, showcase your expertise, and accelerate your professional growth
                </p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <!-- Feature 1 - Team Management -->
                <div class="feature-card card p-6 rounded-xl transition-all duration-300">
                    <div class="w-14 h-14 rounded-full bg-blue-900/50 flex items-center justify-center mb-4">
                        <i class="fas fa-users text-accent text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-2">Team Skills Overview</h3>
                    <ul class="space-y-2 mb-4">
                        <li class="flex items-start">
                            <i class="fas fa-check-circle text-accent mt-1 mr-2"></i>
                            <span>Centralized team skill profiles</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check-circle text-accent mt-1 mr-2"></i>
                            <span>Easy onboarding for new members</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check-circle text-accent mt-1 mr-2"></i>
                            <span>Secure access controls</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check-circle text-accent mt-1 mr-2"></i>
                            <span>Role-based permissions</span>
                        </li>
                    </ul>
                </div>
                
                <!-- Feature 2 - Skills Management -->
                <div class="feature-card card p-6 rounded-xl transition-all duration-300">
                    <div class="w-14 h-14 rounded-full bg-blue-900/50 flex items-center justify-center mb-4">
                        <i class="fas fa-trophy text-accent text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-2">Skills Development Tracking</h3>
                    <ul class="space-y-2 mb-4">
                        <li class="flex items-start">
                            <i class="fas fa-check-circle text-accent mt-1 mr-2"></i>
                            <span>Visual skill progression mapping</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check-circle text-accent mt-1 mr-2"></i>
                            <span>Expertise level assessments</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check-circle text-accent mt-1 mr-2"></i>
                            <span>Experience timeline tracking</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check-circle text-accent mt-1 mr-2"></i>
                            <span>Certification and achievement records</span>
                        </li>
                    </ul>
                </div>
                
                <!-- Feature 3 - Opportunity Matching -->
                <div class="feature-card card p-6 rounded-xl transition-all duration-300">
                    <div class="w-14 h-14 rounded-full bg-blue-900/50 flex items-center justify-center mb-4">
                        <i class="fas fa-bullseye text-accent text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-2">Smart Opportunity Matching</h3>
                    <ul class="space-y-2 mb-4">
                        <li class="flex items-start">
                            <i class="fas fa-check-circle text-accent mt-1 mr-2"></i>
                            <span>Perfect role-to-skill matching</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check-circle text-accent mt-1 mr-2"></i>
                            <span>Priority-based requirement analysis</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check-circle text-accent mt-1 mr-2"></i>
                            <span>Discover hidden career paths</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check-circle text-accent mt-1 mr-2"></i>
                            <span>Experience gap identification</span>
                        </li>
                    </ul>
                </div>
                
                <!-- Feature 4 - Analytics & Insights -->
                <div class="feature-card card p-6 rounded-xl transition-all duration-300">
                    <div class="w-14 h-14 rounded-full bg-blue-900/50 flex items-center justify-center mb-4">
                        <i class="fas fa-chart-bar text-accent text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-2">Actionable Insights</h3>
                    <ul class="space-y-2 mb-4">
                        <li class="flex items-start">
                            <i class="fas fa-check-circle text-accent mt-1 mr-2"></i>
                            <span>Real-time skill gap analysis</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check-circle text-accent mt-1 mr-2"></i>
                            <span>Team performance dashboards</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check-circle text-accent mt-1 mr-2"></i>
                            <span>Progress tracking reports</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check-circle text-accent mt-1 mr-2"></i>
                            <span>ROI measurement tools</span>
                        </li>
                    </ul>
                </div>
                
                <!-- Feature 5 - Growth Planning -->
                <div class="feature-card card p-6 rounded-xl transition-all duration-300">
                    <div class="w-14 h-14 rounded-full bg-blue-900/50 flex items-center justify-center mb-4">
                        <i class="fas fa-seedling text-accent text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-2">Career Growth Planning</h3>
                    <ul class="space-y-2 mb-4">
                        <li class="flex items-start">
                            <i class="fas fa-check-circle text-accent mt-1 mr-2"></i>
                            <span>Personalized development roadmaps</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check-circle text-accent mt-1 mr-2"></i>
                            <span>Learning resource recommendations</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check-circle text-accent mt-1 mr-2"></i>
                            <span>Milestone tracking and celebrations</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check-circle text-accent mt-1 mr-2"></i>
                            <span>Success metrics monitoring</span>
                        </li>
                    </ul>
                </div>
                
                <!-- Feature 6 - Coming Soon -->
                <div class="feature-card card p-6 rounded-xl transition-all duration-300 opacity-60">
                    <div class="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                        <i class="fas fa-rocket text-gray-500 dark:text-gray-400 text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-2 text-gray-600 dark:text-gray-400">Coming Soon: AI Analysis</h3>
                    <ul class="space-y-2 mb-4">
                        <li class="flex items-start">
                            <i class="fas fa-clock text-gray-400 mt-1 mr-2"></i>
                            <span class="text-gray-500 dark:text-gray-400">Resume parsing and skill extraction</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-clock text-gray-400 mt-1 mr-2"></i>
                            <span class="text-gray-500 dark:text-gray-400">Skill gap analysis algorithms</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-clock text-gray-400 mt-1 mr-2"></i>
                            <span class="text-gray-500 dark:text-gray-400">Learning path recommendations</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-clock text-gray-400 mt-1 mr-2"></i>
                            <span class="text-gray-500 dark:text-gray-400">Industry trend analysis</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </section>

    <!-- How It Works -->
    <section id="how-it-works" class="py-16">
        <div class="container mx-auto px-6">
            <div class="text-center mb-16">
                <h2 class="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
                <p class="text-xl text-gray-300 max-w-3xl mx-auto">
                    Three simple steps to transform your team's career development
                </p>
            </div>
            
            <div class="flex flex-col md:flex-row justify-between items-center">
                <div class="mb-10 md:mb-0 text-center md:text-left md:w-2/5">
                    <div class="w-16 h-16 rounded-full bg-accent flex items-center justify-center text-white text-2xl font-bold mb-4 mx-auto md:mx-0">1</div>
                    <h3 class="text-2xl font-bold mb-3">Get Started</h3>
                    <p class="text-gray-300">
                        Sign up your team in minutes. Our intuitive onboarding gets everyone set up with their skill profiles quickly and easily.
                    </p>
                </div>
                
                <div class="mb-10 md:mb-0 text-center md:text-left md:w-2/5">
                    <div class="w-16 h-16 rounded-full bg-accent flex items-center justify-center text-white text-2xl font-bold mb-4 mx-auto md:mx-0">2</div>
                    <h3 class="text-2xl font-bold mb-3">Track & Discover</h3>
                    <p class="text-gray-300">
                        Build comprehensive skill profiles and explore career opportunities. Discover hidden talents and identify growth opportunities across your organization.
                    </p>
                </div>
                
                <div class="text-center md:text-left md:w-2/5">
                    <div class="w-16 h-16 rounded-full bg-accent flex items-center justify-center text-white text-2xl font-bold mb-4 mx-auto md:mx-0">3</div>
                    <h3 class="text-2xl font-bold mb-3">Grow & Succeed</h3>
                    <p class="text-gray-300">
                        Get personalized development plans and watch your team flourish. Track progress, celebrate achievements, and measure real business impact.
                    </p>
                </div>
            </div>
        </div>
    </section>

    <!-- Developer Integration -->
    <section id="api" class="py-16 bg-slate-800">
        <div class="container mx-auto px-6">
            <div class="text-center mb-16">
                <h2 class="text-3xl md:text-4xl font-bold mb-4">Built for Developers</h2>
                <p class="text-xl text-gray-300 max-w-3xl mx-auto">
                    Enterprise-grade API designed for seamless integration with your existing systems
                </p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                <div class="card p-6 rounded-xl text-center">
                    <div class="w-16 h-16 mx-auto mb-4 bg-blue-900/50 rounded-full flex items-center justify-center">
                        <i class="fas fa-shield-alt text-accent text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-2">Secure Authentication</h3>
                    <p class="text-gray-300">JWT-based auth with API keys for service-to-service communication</p>
                </div>
                
                <div class="card p-6 rounded-xl text-center">
                    <div class="w-16 h-16 mx-auto mb-4 bg-blue-900/50 rounded-full flex items-center justify-center">
                        <i class="fas fa-users text-accent text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-2">User Management</h3>
                    <p class="text-gray-300">Complete user profiles, skills tracking, and team management</p>
                </div>
                
                <div class="card p-6 rounded-xl text-center">
                    <div class="w-16 h-16 mx-auto mb-4 bg-blue-900/50 rounded-full flex items-center justify-center">
                        <i class="fas fa-chart-bar text-accent text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-2">Analytics & Insights</h3>
                    <p class="text-gray-300">Skills analysis, gap detection, and performance monitoring</p>
                </div>
                
                <div class="card p-6 rounded-xl text-center">
                    <div class="w-16 h-16 mx-auto mb-4 bg-blue-900/50 rounded-full flex items-center justify-center">
                        <i class="fas fa-briefcase text-accent text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-2">Job Matching</h3>
                    <p class="text-gray-300">Smart job search and candidate matching algorithms</p>
                </div>
                
                <div class="card p-6 rounded-xl text-center">
                    <div class="w-16 h-16 mx-auto mb-4 bg-blue-900/50 rounded-full flex items-center justify-center">
                        <i class="fas fa-database text-accent text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-2">GDPR Compliant</h3>
                    <p class="text-gray-300">Data export, audit logs, and privacy controls built-in</p>
                </div>
                
                <div class="card p-6 rounded-xl text-center">
                    <div class="w-16 h-16 mx-auto mb-4 bg-blue-900/50 rounded-full flex items-center justify-center">
                        <i class="fas fa-tachometer-alt text-accent text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-2">High Performance</h3>
                    <p class="text-gray-300">Sub-100ms response times with global edge deployment</p>
                </div>
            </div>
            
            <div class="max-w-4xl mx-auto">
                <div class="bg-slate-700 p-8 rounded-xl text-center">
                    <h3 class="text-2xl font-bold mb-4">Ready to Integrate?</h3>
                    <p class="text-gray-300 mb-6">
                        Get started with our comprehensive API documentation and SDKs for popular programming languages.
                    </p>
                    <div class="flex flex-wrap justify-center gap-4">
                        <button class="bg-accent hover:bg-teal-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-300">
                            View API Documentation
                        </button>
                        <button class="bg-transparent border-2 border-accent text-accent hover:bg-accent hover:text-white font-semibold py-3 px-6 rounded-lg transition duration-300">
                            Download SDKs
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Technology Stack -->
    <section class="py-16">
        <div class="container mx-auto px-6">
            <div class="text-center mb-16">
                <h2 class="text-3xl md:text-4xl font-bold mb-4">Why Choose Clearsight IP</h2>
                <p class="text-xl text-gray-300 max-w-3xl mx-auto">
                    Built for scale, security, and success with enterprise-grade reliability
                </p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div class="card p-6 rounded-xl text-center">
                    <div class="w-16 h-16 mx-auto mb-4 bg-blue-900/50 rounded-full flex items-center justify-center">
                        <i class="fab fa-cloudflare text-accent text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-2">Lightning Fast</h3>
                    <p class="text-gray-300">Instant results worldwide with blazing-fast performance</p>
                </div>
                
                <div class="card p-6 rounded-xl text-center">
                    <div class="w-16 h-16 mx-auto mb-4 bg-blue-900/50 rounded-full flex items-center justify-center">
                        <i class="fas fa-brain text-accent text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-2">Smart Matching</h3>
                    <p class="text-gray-300">AI-powered insights that understand your unique needs</p>
                </div>
                
                <div class="card p-6 rounded-xl text-center">
                    <div class="w-16 h-16 mx-auto mb-4 bg-blue-900/50 rounded-full flex items-center justify-center">
                        <i class="fas fa-bolt text-accent text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-2">Always On</h3>
                    <p class="text-gray-300">Real-time updates keep your team informed and engaged</p>
                </div>
                
                <div class="card p-6 rounded-xl text-center">
                    <div class="w-16 h-16 mx-auto mb-4 bg-blue-900/50 rounded-full flex items-center justify-center">
                        <i class="fas fa-shield-alt text-accent text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-2">Enterprise Ready</h3>
                    <p class="text-gray-300">99.9% uptime guarantee with enterprise-grade security</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Integration -->
    <section class="py-16 bg-slate-800">
        <div class="container mx-auto px-6">
            <div class="text-center mb-16">
                <h2 class="text-3xl md:text-4xl font-bold mb-4">Seamless Integration</h2>
                <p class="text-xl text-gray-300 max-w-3xl mx-auto">
                    Connect with your existing tools and platforms
                </p>
            </div>
            
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                <div class="flex flex-col items-center justify-center p-6 card rounded-xl">
                    <div class="w-16 h-16 mb-4 bg-slate-700 rounded-lg flex items-center justify-center">
                        <span class="font-bold text-accent">ATS</span>
                    </div>
                    <p class="text-center">Applicant Tracking Systems</p>
                </div>
                
                <div class="flex flex-col items-center justify-center p-6 card rounded-xl">
                    <div class="w-16 h-16 mb-4 bg-white dark:bg-slate-700 rounded-lg flex items-center justify-center">
                        <span class="font-bold text-primary">HRIS</span>
                    </div>
                    <p class="text-center">HR Platforms</p>
                </div>
                
                <div class="flex flex-col items-center justify-center p-6 card rounded-xl">
                    <div class="w-16 h-16 mb-4 bg-white dark:bg-slate-700 rounded-lg flex items-center justify-center">
                        <span class="font-bold text-primary">LMS</span>
                    </div>
                    <p class="text-center">Learning Management Systems</p>
                </div>
                
                <div class="flex flex-col items-center justify-center p-6 card rounded-xl">
                    <div class="w-16 h-16 mb-4 bg-white dark:bg-slate-700 rounded-lg flex items-center justify-center">
                        <span class="font-bold text-primary">JOB</span>
                    </div>
                    <p class="text-center">Job Boards</p>
                </div>
                
                <div class="flex flex-col items-center justify-center p-6 card rounded-xl">
                    <div class="w-16 h-16 mb-4 bg-white dark:bg-slate-700 rounded-lg flex items-center justify-center">
                        <span class="font-bold text-primary">CDT</span>
                    </div>
                    <p class="text-center">Career Development Tools</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Pricing -->
    <section id="pricing" class="py-16">
        <div class="container mx-auto px-6">
            <div class="text-center mb-16">
                <h2 class="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
                <p class="text-xl text-gray-300 max-w-3xl mx-auto">
                    Start free, scale as you grow - pricing that works for teams of any size
                </p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <!-- Developer Plan -->
                <div class="pricing-card card p-8 rounded-xl text-center">
                    <h3 class="text-2xl font-bold mb-2">Starter</h3>
                    <div class="mb-6">
                        <span class="text-4xl font-bold">$0</span>
                        <span class="text-gray-600 dark:text-gray-300">/month</span>
                    </div>
                    <ul class="space-y-3 mb-8">
                        <li class="flex items-center justify-center">
                            <i class="fas fa-check-circle text-accent mr-2"></i>
                            <span>Up to 5 team members</span>
                        </li>
                        <li class="flex items-center justify-center">
                            <i class="fas fa-check-circle text-accent mr-2"></i>
                            <span>Core skills tracking</span>
                        </li>
                        <li class="flex items-center justify-center">
                            <i class="fas fa-check-circle text-accent mr-2"></i>
                            <span>Email support</span>
                        </li>
                        <li class="flex items-center justify-center text-gray-400">
                            <i class="fas fa-times-circle mr-2"></i>
                            <span>Team analytics</span>
                        </li>
                        <li class="flex items-center justify-center text-gray-400">
                            <i class="fas fa-times-circle mr-2"></i>
                            <span>Trend analysis</span>
                        </li>
                    </ul>
                    <button class="w-full bg-slate-700 hover:bg-slate-600 text-accent font-semibold py-3 px-4 rounded-lg transition duration-300">
                        Get Started
                    </button>
                </div>
                
                <!-- Professional Plan -->
                <div class="pricing-card card p-8 rounded-xl text-center border-2 border-accent relative">
                    <div class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-accent text-white text-sm font-bold px-4 py-1 rounded-full">
                        MOST POPULAR
                    </div>
                    <h3 class="text-2xl font-bold mb-2">Professional</h3>
                    <div class="mb-6">
                        <span class="text-4xl font-bold">$99</span>
                        <span class="text-gray-300">/month</span>
                    </div>
                    <ul class="space-y-3 mb-8">
                        <li class="flex items-center justify-center">
                            <i class="fas fa-check-circle text-accent mr-2"></i>
                            <span>Up to 50 team members</span>
                        </li>
                        <li class="flex items-center justify-center">
                            <i class="fas fa-check-circle text-accent mr-2"></i>
                            <span>Advanced analytics and insights</span>
                        </li>
                        <li class="flex items-center justify-center">
                            <i class="fas fa-check-circle text-accent mr-2"></i>
                            <span>Custom development roadmaps</span>
                        </li>
                        <li class="flex items-center justify-center">
                            <i class="fas fa-check-circle text-accent mr-2"></i>
                            <span>Industry trend reports</span>
                        </li>
                        <li class="flex items-center justify-center">
                            <i class="fas fa-check-circle text-accent mr-2"></i>
                            <span>Priority email support</span>
                        </li>
                    </ul>
                    <button class="w-full bg-accent hover:bg-teal-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-300">
                        Start Free Trial
                    </button>
                </div>
                
                <!-- Enterprise Plan -->
                <div class="pricing-card card p-8 rounded-xl text-center">
                    <h3 class="text-2xl font-bold mb-2">Enterprise</h3>
                    <div class="mb-6">
                        <span class="text-4xl font-bold">Custom</span>
                    </div>
                    <ul class="space-y-3 mb-8">
                        <li class="flex items-center justify-center">
                            <i class="fas fa-check-circle text-accent mr-2"></i>
                            <span>Unlimited team members</span>
                        </li>
                        <li class="flex items-center justify-center">
                            <i class="fas fa-check-circle text-accent mr-2"></i>
                            <span>All features included</span>
                        </li>
                        <li class="flex items-center justify-center">
                            <i class="fas fa-check-circle text-accent mr-2"></i>
                            <span>Dedicated account manager</span>
                        </li>
                        <li class="flex items-center justify-center">
                            <i class="fas fa-check-circle text-accent mr-2"></i>
                            <span>Custom integrations</span>
                        </li>
                        <li class="flex items-center justify-center">
                            <i class="fas fa-check-circle text-accent mr-2"></i>
                            <span>SLA guarantee</span>
                        </li>
                    </ul>
                    <button class="w-full bg-slate-700 hover:bg-slate-600 text-accent font-semibold py-3 px-4 rounded-lg transition duration-300">
                        Contact Sales
                    </button>
                </div>
            </div>
        </div>
    </section>

    <!-- Security & Compliance -->
    <section class="py-16 bg-slate-800">
        <div class="container mx-auto px-6">
            <div class="text-center mb-16">
                <h2 class="text-3xl md:text-4xl font-bold mb-4">Trust & Security</h2>
                <p class="text-xl text-gray-300 max-w-3xl mx-auto">
                    Your data is safe with enterprise-grade security and compliance
                </p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 max-w-5xl mx-auto">
                <div class="flex flex-col items-center text-center">
                    <div class="w-16 h-16 rounded-full bg-blue-900/50 flex items-center justify-center mb-4">
                        <i class="fas fa-key text-accent text-2xl"></i>
                    </div>
                    <h3 class="font-bold mb-2">Secure Access</h3>
                    <p class="text-gray-300 text-sm">Multi-layered authentication keeps your data safe</p>
                </div>
                
                <div class="flex flex-col items-center text-center">
                    <div class="w-16 h-16 rounded-full bg-blue-900/50 flex items-center justify-center mb-4">
                        <i class="fas fa-lock text-accent text-2xl"></i>
                    </div>
                    <h3 class="font-bold mb-2">Data Protection</h3>
                    <p class="text-gray-300 text-sm">Bank-level encryption protects all your information</p>
                </div>
                
                <div class="flex flex-col items-center text-center">
                    <div class="w-16 h-16 rounded-full bg-blue-900/50 flex items-center justify-center mb-4">
                        <i class="fas fa-gavel text-accent text-2xl"></i>
                    </div>
                    <h3 class="font-bold mb-2">Privacy First</h3>
                    <p class="text-gray-300 text-sm">Full GDPR and CCPA compliance built-in</p>
                </div>
                
                <div class="flex flex-col items-center text-center">
                    <div class="w-16 h-16 rounded-full bg-blue-900/50 flex items-center justify-center mb-4">
                        <i class="fas fa-user-shield text-accent text-2xl"></i>
                    </div>
                    <h3 class="font-bold mb-2">Your Control</h3>
                    <p class="text-gray-300 text-sm">Complete data ownership and deletion rights</p>
                </div>
                
                <div class="flex flex-col items-center text-center">
                    <div class="w-16 h-16 rounded-full bg-blue-900/50 flex items-center justify-center mb-4">
                        <i class="fas fa-certificate text-accent text-2xl"></i>
                    </div>
                    <h3 class="font-bold mb-2">Certified Secure</h3>
                    <p class="text-gray-300 text-sm">ISO 27001 certified security management</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Live Demo -->
    <section class="py-16">
        <div class="container mx-auto px-6">
            <div class="text-center mb-16">
                <h2 class="text-3xl md:text-4xl font-bold mb-4">Try It Now</h2>
                <p class="text-xl text-gray-300 max-w-3xl mx-auto">
                    See how Clearsight IP identifies skill gaps and creates development plans
                </p>
            </div>
            
            <div class="max-w-4xl mx-auto">
                <div class="card demo-box rounded-xl p-6">
                    <div class="mb-6">
                        <label class="block text-gray-300 font-medium mb-2" for="resume-input">
                            Try our skill analysis with sample text
                        </label>
                        <textarea id="resume-input" class="w-full h-40 p-4 border border-slate-600 rounded-lg bg-slate-700 text-gray-100" placeholder="Paste your resume text here...">
                    </div>
                    
                    <div class="flex justify-center mb-6">
                        <button id="analyze-btn" class="bg-primary hover:bg-blue-800 text-white font-semibold py-3 px-8 rounded-lg transition duration-300">
                            Analyze Skills
                        </button>
                    </div>
                    
                    <div id="demo-results" class="hidden">
                        <h3 class="text-xl font-bold mb-4">Analysis Results</h3>
                        
                        <div class="mb-6">
                            <h4 class="font-semibold mb-2">Extracted Skills:</h4>
                            <div class="flex flex-wrap gap-2">
                                <span class="bg-blue-100 dark:bg-blue-900/50 text-primary dark:text-accent px-3 py-1 rounded-full text-sm">JavaScript</span>
                                <span class="bg-blue-100 dark:bg-blue-900/50 text-primary dark:text-accent px-3 py-1 rounded-full text-sm">React</span>
                                <span class="bg-blue-100 dark:bg-blue-900/50 text-primary dark:text-accent px-3 py-1 rounded-full text-sm">Node.js</span>
                                <span class="bg-blue-100 dark:bg-blue-900/50 text-primary dark:text-accent px-3 py-1 rounded-full text-sm">MongoDB</span>
                                <span class="bg-blue-100 dark:bg-blue-900/50 text-primary dark:text-accent px-3 py-1 rounded-full text-sm">AWS</span>
                                <span class="bg-blue-100 dark:bg-blue-900/50 text-primary dark:text-accent px-3 py-1 rounded-full text-sm">Docker</span>
                            </div>
                        </div>
                        
                        <div class="mb-6">
                            <h4 class="font-semibold mb-2">Skill Match Analysis:</h4>
                            <div class="space-y-3">
                                <div>
                                    <div class="flex justify-between mb-1">
                                        <span>JavaScript</span>
                                        <span>85% Match</span>
                                    </div>
                                    <div class="w-full bg-gray-200 rounded-full h-2.5">
                                        <div class="bg-green-600 h-2.5 rounded-full" style="width: 85%"></div>
                                    </div>
                                </div>
                                
                                <div>
                                    <div class="flex justify-between mb-1">
                                        <span>React</span>
                                        <span>75% Match</span>
                                    </div>
                                    <div class="w-full bg-gray-200 rounded-full h-2.5">
                                        <div class="bg-green-500 h-2.5 rounded-full" style="width: 75%"></div>
                                    </div>
                                </div>
                                
                                <div>
                                    <div class="flex justify-between mb-1">
                                        <span>Node.js</span>
                                        <span>60% Match</span>
                                    </div>
                                    <div class="w-full bg-gray-200 rounded-full h-2.5">
                                        <div class="bg-yellow-500 h-2.5 rounded-full" style="width: 60%"></div>
                                    </div>
                                </div>
                                
                                <div>
                                    <div class="flex justify-between mb-1">
                                        <span>AWS</span>
                                        <span>45% Match</span>
                                    </div>
                                    <div class="w-full bg-gray-200 rounded-full h-2.5">
                                        <div class="bg-red-500 h-2.5 rounded-full" style="width: 45%"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <h4 class="font-semibold mb-2">Recommended Learning Paths:</h4>
                            <ul class="list-disc pl-5 space-y-2">
                                <li><strong>Advanced Node.js:</strong> Master server-side JavaScript with Express and database integration</li>
                                <li><strong>AWS Certification:</strong> Complete AWS Solutions Architect certification path</li>
                                <li><strong>Full-Stack Development:</strong> Combine frontend and backend skills for complete project ownership</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer id="contact" class="bg-primary text-white pt-16 pb-8">
        <div class="container mx-auto px-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
                <div class="lg:col-span-2">
                    <h2 class="text-2xl font-bold mb-4">Clearsight IP</h2>
                    <p class="mb-6 max-w-md">
                        Bridge Your Skills Gap with AI-Powered Insights. Transform career development with intelligent skill gap analysis.
                    </p>
                    <div class="flex space-x-4">
                        <a href="#" class="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                            <i class="fab fa-twitter"></i>
                        </a>
                        <a href="#" class="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                            <i class="fab fa-linkedin-in"></i>
                        </a>
                        <a href="#" class="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                            <i class="fab fa-github"></i>
                        </a>
                    </div>
                </div>
                
                <div>
                    <h3 class="text-lg font-semibold mb-4">Product</h3>
                    <ul class="space-y-2">
                        <li><a href="#" class="hover:text-accent transition">Features</a></li>
                        <li><a href="#" class="hover:text-accent transition">Solutions</a></li>
                        <li><a href="#" class="hover:text-accent transition">Pricing</a></li>
                        <li><a href="#" class="hover:text-accent transition">Demo</a></li>
                    </ul>
                </div>
                
                <div>
                    <h3 class="text-lg font-semibold mb-4">Resources</h3>
                    <ul class="space-y-2">
                        <li><a href="#" class="hover:text-accent transition">Documentation</a></li>
                        <li><a href="#" class="hover:text-accent transition">API Reference</a></li>
                        <li><a href="#" class="hover:text-accent transition">Guides</a></li>
                        <li><a href="#" class="hover:text-accent transition">Blog</a></li>
                    </ul>
                </div>
                
                <div>
                    <h3 class="text-lg font-semibold mb-4">Company</h3>
                    <ul class="space-y-2">
                        <li><a href="#" class="hover:text-accent transition">About Us</a></li>
                        <li><a href="#" class="hover:text-accent transition">Careers</a></li>
                        <li><a href="#" class="hover:text-accent transition">Contact</a></li>
                        <li><a href="#" class="hover:text-accent transition">Status</a></li>
                    </ul>
                </div>
            </div>
            
            <div class="pt-8 border-t border-blue-800 text-center text-sm">
                <div class="flex flex-col md:flex-row justify-center space-y-2 md:space-y-0 md:space-x-6 mb-4">
                    <a href="#" class="hover:text-accent transition">Terms of Service</a>
                    <a href="#" class="hover:text-accent transition">Privacy Policy</a>
                    <a href="#" class="hover:text-accent transition">Cookie Policy</a>
                    <a href="#" class="hover:text-accent transition">GDPR Compliance</a>
                </div>
                <p>&copy; 2023 Clearsight IP. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <script>
        
        // Demo functionality
        const analyzeBtn = document.getElementById('analyze-btn');
        const demoResults = document.getElementById('demo-results');
        const resumeInput = document.getElementById('resume-input');
        
        analyzeBtn.addEventListener('click', function() {
            if (resumeInput.value.trim() !== '') {
                demoResults.classList.remove('hidden');
                demoResults.scrollIntoView({ behavior: 'smooth' });
            }
        });
        
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            });
        });
    </script>
</body>
</html>`;
