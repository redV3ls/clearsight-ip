export const HTML_CONTENT = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Clearsight IP - Bridge Your Skills Gap with AI-Powered Insights</title>
    <!-- Favicon -->
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
        
        .dark-mode {
            background-color: #0f172a;
            color: #e2e8f0;
        }
        
        .dark-mode .bg-slate-800 {
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
            background-image: radial-gradient(rgba(20, 184, 166, 0.04) 2px, transparent 1px);
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
<body class=\"bg-slate-900 text-gray-200\">
    <!-- Header -->
    <header class="sticky top-0 z-50 bg-slate-800 bg-slate-900 shadow-md py-4 px-6">
        <div class="container mx-auto flex justify-between items-center">
            <div>
                <h1 class="text-2xl font-bold text-accent text-accent">Clearsight IP</h1>
                <p class="text-sm text-gray-400 text-gray-300">Bridge Your Skills Gap with AI-Powered Insights</p>
            </div>
            
            <nav class="hidden md:flex space-x-8">
                <a href="#features" class="nav-link text-gray-300 hover:text-accent">Success Stories</a>
                <a href="#how-it-works" class="nav-link text-gray-300 hover:text-accent">How It Works</a>
                <a href="#pricing" class="nav-link text-gray-300 hover:text-accent">Pricing</a>
                <a href="#demo" class="nav-link text-gray-300 hover:text-accent">Try Demo</a>
            </nav>
            
            <div class="flex items-center space-x-4">
                <a href="/api/v1/docs" class="bg-accent hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300">
                    View API Docs
                </a>
                <button class="md:hidden text-gray-300 text-gray-300">
                    <i class="fas fa-bars text-2xl"></i>
                </button>
            </div>
        </div>
    </header>

    <!-- Hero Section - Problem Statement -->
    <section class="py-20 md:py-32 hero-pattern">
        <div class="container mx-auto px-6 flex flex-col md:flex-row items-center">
            <div class="md:w-1/2 mb-12 md:mb-0">
                <div class="mb-6">
                    <span class="bg-red-100 text-red-800 text-sm font-semibold px-3 py-1 rounded-full">The Problem</span>
                </div>
                <h1 class="text-4xl md:text-5xl font-bold leading-tight mb-6">
                    Struggling to <span class="text-red-600">stand out</span> in today's competitive job market? <span class="gradient-text">You're not alone.</span>
                </h1>
                <p class="text-xl text-gray-300 mb-8">
                    Most professionals don't know which skills they're missing or how to showcase their expertise effectively. Your dream job might be just one skills insight away.
                </p>
                
                <div class="bg-red-50 bg-red-900/20 border-l-4 border-red-500 p-4 mb-8">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <i class="fas fa-exclamation-triangle text-red-500"></i>
                        </div>
                        <div class="ml-3">
                            <p class="text-sm text-red-700 text-red-300">
                                <strong>The Hidden Costs:</strong> 6-month average time-to-productivity • 40% promotion failure rate due to skills misalignment • $15,000 average cost per bad hire
                            </p>
                        </div>
                    </div>
                </div>
                
                <div class="flex flex-wrap gap-4">
                    <button id="analyzeSkillsBtn" class="bg-accent hover:bg-teal-600 text-white font-semibold py-4 px-10 rounded-lg transition duration-300 text-lg shadow-lg">
                        Analyze My Skills Now
                    </button>
                    <a href="/api/v1/docs" class="bg-transparent hover:bg-slate-800 border-2 border-slate-600 text-gray-300 hover:text-white font-medium py-4 px-8 rounded-lg transition duration-300">
                        View API Docs
                    </a>
                </div>
            </div>
            
            <div class="md:w-1/2 flex justify-center">
                <div class="relative">
                    <div class="w-80 h-80 md:w-96 md:h-96 bg-gradient-to-br from-red-500 to-orange-500 rounded-full opacity-10 absolute -top-10 -left-10 animate-float"></div>
                    <div class="w-64 h-64 md:w-80 md:h-80 bg-gradient-to-tr from-orange-500 to-red-500 rounded-full opacity-10 absolute -bottom-10 -right-10 animate-float animation-delay-2000"></div>
                    <div class="relative bg-slate-800 bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700 border-slate-700">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="font-bold text-lg text-red-400">Your Career Reality</h3>
                            <span class="bg-red-600 text-white text-xs font-semibold px-2.5 py-0.5 rounded ml-3">The Struggle</span>
                        </div>
                        
                        <div class="space-y-4">
                            <div class="flex justify-between items-center p-3 bg-red-900/20 rounded">
                                <span class="text-sm font-medium">Average Job Search</span>
                                <span class="text-sm font-bold text-red-400">5.2 months</span>
                            </div>
                            
                            <div class="flex justify-between items-center p-3 bg-orange-900/20 rounded">
                                <span class="text-sm font-medium">Resume Review Time</span>
                                <span class="text-sm font-bold text-orange-400">6 seconds</span>
                            </div>
                            
                            <div class="flex justify-between items-center p-3 bg-yellow-900/20 rounded">
                                <span class="text-sm font-medium">Feel Underqualified</span>
                                <span class="text-sm font-bold text-yellow-400">67%</span>
                            </div>
                            
                            <div class="pt-4 border-t border-slate-700 border-slate-700">
                                <h4 class="font-semibold mb-2 text-red-600">What You're Missing:</h4>
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
    <section class="py-20 md:py-24 bg-gradient-to-r from-green-50 to-blue-50 from-green-900/20 to-blue-900/20">
        <div class="container mx-auto px-6">
            <div class="text-center mb-12">
                <span class="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">The Solution</span>
                <h2 class="text-3xl md:text-4xl font-bold mt-4 mb-6">
                    AI-Powered Career Intelligence That <span class="text-green-400">Accelerates Your Growth</span>
                </h2>
                <p class="text-xl text-gray-300 max-w-3xl mx-auto">
                    Discover exactly which skills you need, get personalized learning paths, and showcase your expertise with confidence. Your next career breakthrough starts here.
                </p>
            </div>

            <div class="flex flex-col md:flex-row items-center">
                <div class="md:w-1/2 mb-8 md:mb-0">
                    <div class="relative bg-slate-800 bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700 border-slate-700">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="font-bold text-lg text-green-600">Smart Analysis Results</h3>
                            <span class="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">92% Match</span>
                        </div>
                        
                        <div class="space-y-4">
                            <div>
                                <div class="flex justify-between mb-1">
                                    <span class="text-sm font-medium">JavaScript</span>
                                    <span class="text-sm font-medium text-green-600">Expert Level</span>
                                </div>
                                <div class="w-full bg-gray-700 rounded-full h-2.5">
                                    <div class="bg-green-600 h-2.5 rounded-full" style="width: 92%"></div>
                                </div>
                            </div>
                            
                            <div>
                                <div class="flex justify-between mb-1">
                                    <span class="text-sm font-medium">Team Leadership</span>
                                    <span class="text-sm font-medium text-blue-600">Hidden Strength</span>
                                </div>
                                <div class="w-full bg-gray-700 rounded-full h-2.5">
                                    <div class="bg-blue-600 h-2.5 rounded-full" style="width: 78%"></div>
                                </div>
                            </div>
                            
                            <div>
                                <div class="flex justify-between mb-1">
                                    <span class="text-sm font-medium">Cloud Architecture</span>
                                    <span class="text-sm font-medium text-purple-600">Growth Opportunity</span>
                                </div>
                                <div class="w-full bg-gray-700 rounded-full h-2.5">
                                    <div class="bg-purple-600 h-2.5 rounded-full" style="width: 45%"></div>
                                </div>
                            </div>
                            
                            <div class="pt-4 border-t border-slate-700 border-slate-700">
                                <h4 class="font-semibold mb-2 text-green-600">Recommended Actions:</h4>
                                <ul class="space-y-1 text-sm">
                                    <li class="flex items-center"><i class="fas fa-arrow-up text-green-500 mr-2"></i>Promote to Senior Developer</li>
                                    <li class="flex items-center"><i class="fas fa-users text-blue-500 mr-2"></i>Consider for Team Lead role</li>
                                    <li class="flex items-center"><i class="fas fa-graduation-cap text-purple-500 mr-2"></i>AWS Certification path (3 months)</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="md:w-1/2 md:pl-12">
                    <div class="space-y-6">
                        <div class="flex items-start">
                            <div class="w-12 h-12 rounded-full bg-green-100 bg-green-900/50 flex items-center justify-center mr-4 flex-shrink-0">
                                <i class="fas fa-search text-green-600 text-xl"></i>
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

    <!-- Proof Section -->
    <section id="features" class="py-20 md:py-24 bg-slate-800 bg-slate-800">
        <div class="container mx-auto px-6">
            <div class="text-center mb-16">
                <span class="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">Success Stories</span>
                <h2 class="text-3xl md:text-4xl font-bold mt-4 mb-6">Real People, Real Career Growth</h2>
                <p class="text-xl text-gray-300 max-w-3xl mx-auto">
                    See how professionals like you are accelerating their careers with AI-powered skills intelligence
                </p>
            </div>

            <!-- Success Metrics -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
                <div class="text-center">
                    <div class="stats-number text-green-600">67%</div>
                    <p class="text-gray-300 font-medium">Faster Job Search</p>
                    <p class="text-sm text-gray-500">Reduced search time from 5+ to 2 months</p>
                </div>
                <div class="text-center">
                    <div class="stats-number text-blue-600">$25,000</div>
                    <p class="text-gray-300 font-medium">Salary Increase</p>
                    <p class="text-sm text-gray-500">Average salary boost after skill upgrade</p>
                </div>
                <div class="text-center">
                    <div class="stats-number text-purple-600">89%</div>
                    <p class="text-gray-300 font-medium">Interview Success</p>
                    <p class="text-sm text-gray-500">Users who get interviews after optimization</p>
                </div>
                <div class="text-center">
                    <div class="stats-number text-orange-600">4.8/5</div>
                    <p class="text-gray-300 font-medium">User Rating</p>
                    <p class="text-sm text-gray-500">Average satisfaction score</p>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <!-- Success Story 1 -->
                <div class="feature-card card p-6 rounded-xl transition-all duration-300 border-l-4 border-green-500">
                    <div class="flex items-center mb-4">
                        <div class="w-12 h-12 rounded-full bg-green-900/50 flex items-center justify-center mr-3">
                            <i class="fas fa-user text-green-400 text-xl"></i>
                        </div>
                        <div>
                            <h3 class="text-lg font-bold">Sarah M.</h3>
                            <p class="text-sm text-gray-500">Frontend Developer</p>
                        </div>
                    </div>
                    <div class="mb-4">
                        <div class="text-2xl font-bold text-green-400 mb-1">$35,000 raise</div>
                        <p class="text-sm text-gray-300">Promoted to Senior Developer in 4 months</p>
                    </div>
                    <blockquote class="text-sm italic text-gray-300 mb-4">
                        "I discovered I had leadership skills I never knew about. The AI found patterns in my project management experience that I completely missed on my resume."
                    </blockquote>
                    <div class="text-xs text-gray-500">
                        <strong>Skills Discovered:</strong> Team Leadership • Project Management • Mentoring
                    </div>
                </div>
                
                <!-- Success Story 2 -->
                <div class="feature-card card p-6 rounded-xl transition-all duration-300 border-l-4 border-blue-500">
                    <div class="flex items-center mb-4">
                        <div class="w-12 h-12 rounded-full bg-blue-900/50 flex items-center justify-center mr-3">
                            <i class="fas fa-user text-blue-400 text-xl"></i>
                        </div>
                        <div>
                            <h3 class="text-lg font-bold">Marcus T.</h3>
                            <p class="text-sm text-gray-500">Career Changer</p>
                        </div>
                    </div>
                    <div class="mb-4">
                        <div class="text-2xl font-bold text-blue-400 mb-1">2 months</div>
                        <p class="text-sm text-gray-300">From marketing to UX design role</p>
                    </div>
                    <blockquote class="text-sm italic text-gray-300 mb-4">
                        "The platform showed me how my marketing background was actually perfect for UX. I got 3 interviews in my first week of applying."
                    </blockquote>
                    <div class="text-xs text-gray-500">
                        <strong>Transferable Skills:</strong> User Research • Data Analysis • Communication
                    </div>
                </div>
                
                <!-- Success Story 3 -->
                <div class="feature-card card p-6 rounded-xl transition-all duration-300 border-l-4 border-purple-500">
                    <div class="flex items-center mb-4">
                        <div class="w-12 h-12 rounded-full bg-purple-900/50 flex items-center justify-center mr-3">
                            <i class="fas fa-user text-purple-400 text-xl"></i>
                        </div>
                        <div>
                            <h3 class="text-lg font-bold">Jennifer L.</h3>
                            <p class="text-sm text-gray-500">Data Analyst</p>
                        </div>
                    </div>
                    <div class="mb-4">
                        <div class="text-2xl font-bold text-purple-400 mb-1">Dream job</div>
                        <p class="text-sm text-gray-300">Landed role at top tech company</p>
                    </div>
                    <blockquote class="text-sm italic text-gray-300 mb-4">
                        "The personalized learning path was spot-on. I focused on exactly the right skills and got my dream job at a major technology company in 6 months."
                    </blockquote>
                    <div class="text-xs text-gray-500">
                        <strong>Skills Developed:</strong> Machine Learning • Python • Statistical Analysis
                    </div>
                </div>
                
                <!-- Platform Features -->
                <div class="feature-card card p-6 rounded-xl transition-all duration-300 border-l-4 border-orange-500">
                    <div class="flex items-center mb-4">
                        <div class="w-12 h-12 rounded-full bg-orange-900/50 flex items-center justify-center mr-3">
                            <i class="fas fa-rocket text-orange-400 text-xl"></i>
                        </div>
                        <div>
                            <h3 class="text-lg font-bold">Platform Features</h3>
                            <p class="text-sm text-gray-500">Everything you need</p>
                        </div>
                    </div>
                    <div class="mb-4">
                        <div class="text-2xl font-bold text-orange-400 mb-1">All-in-One</div>
                        <p class="text-sm text-gray-300">Complete career development suite</p>
                    </div>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span>Resume Analysis</span>
                            <i class="fas fa-check text-green-500"></i>
                        </div>
                        <div class="flex justify-between">
                            <span>Skills Gap Detection</span>
                            <i class="fas fa-check text-green-500"></i>
                        </div>
                        <div class="flex justify-between">
                            <span>Career Path Planning</span>
                            <i class="fas fa-check text-green-500"></i>
                        </div>
                        <div class="flex justify-between">
                            <span>Industry Insights</span>
                            <i class="fas fa-check text-green-500"></i>
                        </div>
                        <div class="flex justify-between">
                            <span>Privacy Protection</span>
                            <i class="fas fa-check text-green-500"></i>
                        </div>
                    </div>
                </div>
                
                <!-- Industry Recognition -->
                <div class="feature-card card p-6 rounded-xl transition-all duration-300 border-l-4 border-yellow-500">
                    <div class="flex items-center mb-4">
                        <div class="w-12 h-12 rounded-full bg-yellow-100 bg-yellow-900/50 flex items-center justify-center mr-3">
                            <i class="fas fa-award text-yellow-600 text-xl"></i>
                        </div>
                        <div>
                            <h3 class="text-lg font-bold">Industry Recognition</h3>
                            <p class="text-sm text-gray-500">Awards & Certifications</p>
                        </div>
                    </div>
                    <div class="space-y-3">
                        <div class="flex items-center">
                            <i class="fas fa-star text-yellow-500 mr-2"></i>
                            <span class="text-sm">HR Tech Innovation Award 2024</span>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-shield-alt text-green-500 mr-2"></i>
                            <span class="text-sm">Enterprise Security Standards</span>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-check-circle text-blue-500 mr-2"></i>
                            <span class="text-sm">Privacy-First Design</span>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-clock text-purple-500 mr-2"></i>
                            <span class="text-sm">High Availability Platform</span>
                        </div>
                    </div>
                </div>
                
                <!-- Customer Satisfaction -->
                <div class="feature-card card p-6 rounded-xl transition-all duration-300 border-l-4 border-pink-500">
                    <div class="flex items-center mb-4">
                        <div class="w-12 h-12 rounded-full bg-pink-100 bg-pink-900/50 flex items-center justify-center mr-3">
                            <i class="fas fa-heart text-pink-600 text-xl"></i>
                        </div>
                        <div>
                            <h3 class="text-lg font-bold">Customer Love</h3>
                            <p class="text-sm text-gray-500">Satisfaction metrics</p>
                        </div>
                    </div>
                    <div class="space-y-3">
                        <div class="flex justify-between items-center">
                            <span class="text-sm">Customer Satisfaction</span>
                            <span class="text-lg font-bold text-pink-600">4.9/5</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-sm">Net Promoter Score</span>
                            <span class="text-lg font-bold text-pink-600">72</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-sm">Customer Retention</span>
                            <span class="text-lg font-bold text-pink-600">94%</span>
                        </div>
                        <div class="text-xs text-gray-500 mt-3">
                            Based on anonymized platform usage metrics and user feedback surveys
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- How It Works -->
    <section id="how-it-works" class="py-20 md:py-24 bg-slate-900">
        <div class="container mx-auto px-6">
            <div class="text-center mb-16">
                <h2 class="text-3xl md:text-4xl font-bold mb-4">Discover Your Career Path in 3 Simple Steps</h2>
                <p class="text-xl text-gray-400 text-gray-300 max-w-3xl mx-auto">
                    Uncover your skills, identify gaps, and plan your growth journey
                </p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div class="text-center">
                    <div class="w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold mb-6 mx-auto">1</div>
                    <h3 class="text-2xl font-bold mb-4">Upload Your Resume</h3>
                    <div class="bg-slate-800 bg-slate-700 p-4 rounded-lg mb-4">
                        <div class="flex items-center justify-center space-x-4 text-sm">
                            <span class="flex items-center"><i class="fas fa-file-pdf text-red-500 mr-1"></i>PDF</span>
                            <span class="flex items-center"><i class="fas fa-file-word text-blue-500 mr-1"></i>Word</span>
                            <span class="flex items-center"><i class="fas fa-file-alt text-green-500 mr-1"></i>Text</span>
                        </div>
                    </div>
                    <p class="text-gray-400 text-gray-300">
                        Simply upload your resume or paste your experience. Our AI extracts your skills and analyzes your career potential.
                    </p>
                </div>
                
                <div class="text-center">
                    <div class="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold mb-6 mx-auto">2</div>
                    <h3 class="text-2xl font-bold mb-4">AI Analyzes Your Skills</h3>
                    <div class="bg-slate-800 bg-slate-700 p-4 rounded-lg mb-4">
                        <div class="flex justify-center items-center">
                            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                            <span class="ml-2 text-sm">Analyzing...</span>
                        </div>
                        <div class="text-xs text-gray-500 mt-2">Average processing time: &lt;30 seconds</div>
                        <div class="text-xs text-gray-400 mt-1">* Processing speed may vary based on file size, content complexity, and network conditions</div>
                    </div>
                    <p class="text-gray-400 text-gray-300">
                        Our AI identifies your current skills, discovers hidden strengths, and reveals opportunities for growth.
                    </p>
                </div>
                
                <div class="text-center">
                    <div class="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold mb-6 mx-auto">3</div>
                    <h3 class="text-2xl font-bold mb-4">Get Your Career Roadmap</h3>
                    <div class="bg-slate-800 bg-slate-700 p-4 rounded-lg mb-4">
                        <div class="space-y-2 text-sm">
                            <div class="flex justify-between">
                                <span>Senior Developer Role</span>
                                <span class="text-green-600 font-bold">92% ready</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Team Lead Position</span>
                                <span class="text-blue-600 font-bold">6 months prep</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Cloud Architect Path</span>
                                <span class="text-purple-600 font-bold">12 months</span>
                            </div>
                        </div>
                    </div>
                    <p class="text-gray-400 text-gray-300">
                        Receive personalized career paths with clear milestones, skills to develop, and timeline estimates.
                    </p>
                </div>
            </div>
        </div>
    </section>

    <!-- Why Choose Clearsight IP -->
    <section class="py-20 md:py-24 bg-slate-800">
        <div class="container mx-auto px-6">
            <div class="text-center mb-16">
                <h2 class="text-3xl md:text-4xl font-bold mb-4">Why Choose Clearsight IP</h2>
                <p class="text-xl text-gray-400 text-gray-300 max-w-3xl mx-auto">
                    The smartest way to understand your skills and accelerate your career
                </p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div class="card p-6 rounded-xl">
                    <div class="w-16 h-16 mb-4 bg-green-100 bg-green-900/50 rounded-full flex items-center justify-center">
                        <i class="fas fa-microscope text-green-600 text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-3">Deep Skills Analysis</h3>
                    <p class="text-gray-400 text-gray-300">Go beyond keywords. Our AI understands context, projects, and real-world application of your skills.</p>
                </div>
                
                <div class="card p-6 rounded-xl">
                    <div class="w-16 h-16 mb-4 bg-blue-100 bg-blue-900/50 rounded-full flex items-center justify-center">
                        <i class="fas fa-gem text-blue-600 text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-3">Hidden Talent Discovery</h3>
                    <p class="text-gray-400 text-gray-300">Uncover skills you didn't know you had. Find transferable abilities that open new career doors.</p>
                </div>
                
                <div class="card p-6 rounded-xl">
                    <div class="w-16 h-16 mb-4 bg-purple-100 bg-purple-900/50 rounded-full flex items-center justify-center">
                        <i class="fas fa-map-marked-alt text-purple-600 text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-3">Personalized Roadmaps</h3>
                    <p class="text-gray-400 text-gray-300">Get custom career paths based on your goals, with clear steps and realistic timelines.</p>
                </div>
                
                <div class="card p-6 rounded-xl">
                    <div class="w-16 h-16 mb-4 bg-orange-100 bg-orange-900/50 rounded-full flex items-center justify-center">
                        <i class="fas fa-chart-line text-orange-600 text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-3">Market Intelligence</h3>
                    <p class="text-gray-400 text-gray-300">Stay ahead with real-time insights on in-demand skills and emerging industry trends.</p>
                </div>
                
                <div class="card p-6 rounded-xl">
                    <div class="w-16 h-16 mb-4 bg-teal-100 bg-teal-900/50 rounded-full flex items-center justify-center">
                        <i class="fas fa-bolt text-teal-600 text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-3">Instant Results</h3>
                    <p class="text-gray-400 text-gray-300">No waiting days for feedback. Get comprehensive analysis in under 30 seconds.*</p>
                    <p class="text-xs text-gray-500 mt-1">* Processing speed may vary based on file size, content complexity, and network conditions</p>
                </div>
                
                <div class="card p-6 rounded-xl">
                    <div class="w-16 h-16 mb-4 bg-pink-100 bg-pink-900/50 rounded-full flex items-center justify-center">
                        <i class="fas fa-shield-alt text-pink-600 text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-3">Privacy First</h3>
                    <p class="text-gray-300">Your personal data is processed securely and never stored permanently. We only retain anonymized usage metrics for service improvement.</p>
                </div>
            </div>
        </div>
    </section>


    <!-- Pricing -->
    <section id="pricing" class="py-20 md:py-24 bg-slate-900">
        <div class="container mx-auto px-6">
            <div class="text-center mb-16">
                <h2 class="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
                <p class="text-xl text-gray-400 text-gray-300 max-w-3xl mx-auto">
                    Choose the plan that fits your needs
                </p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <!-- Developer Plan -->
                <div class="pricing-card card p-8 rounded-xl text-center">
                    <h3 class="text-2xl font-bold mb-2">Developer</h3>
                    <div class="mb-6">
                        <span class="text-4xl font-bold">$0</span>
                        <span class="text-gray-400 text-gray-300">/month</span>
                    </div>
                    <ul class="space-y-3 mb-8">
                        <li class="flex items-center justify-center">
                            <i class="fas fa-check-circle text-accent mr-2"></i>
                            <span>1,000 API calls/month</span>
                        </li>
                        <li class="flex items-center justify-center">
                            <i class="fas fa-check-circle text-accent mr-2"></i>
                            <span>Basic skill analysis</span>
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
                    <button class="w-full bg-slate-700 bg-slate-700 hover:bg-slate-600 hover:bg-slate-600 text-accent text-accent font-semibold py-3 px-4 rounded-lg transition duration-300">
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
                        <span class="text-gray-400 text-gray-300">/month</span>
                    </div>
                    <ul class="space-y-3 mb-8">
                        <li class="flex items-center justify-center">
                            <i class="fas fa-check-circle text-accent mr-2"></i>
                            <span>50,000 API calls/month</span>
                        </li>
                        <li class="flex items-center justify-center">
                            <i class="fas fa-check-circle text-accent mr-2"></i>
                            <span>Full skill analysis features</span>
                        </li>
                        <li class="flex items-center justify-center">
                            <i class="fas fa-check-circle text-accent mr-2"></i>
                            <span>Team analytics (up to 25 members)</span>
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
                            <span>Unlimited API calls</span>
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
                    <button class="w-full bg-slate-700 bg-slate-700 hover:bg-slate-600 hover:bg-slate-600 text-accent text-accent font-semibold py-3 px-4 rounded-lg transition duration-300">
                        Contact Sales
                    </button>
                </div>
            </div>
        </div>
    </section>

    <!-- Trust & Security -->
    <section class="py-20 md:py-24 bg-slate-800">
        <div class="container mx-auto px-6">
            <div class="text-center mb-12">
                <h2 class="text-3xl md:text-4xl font-bold mb-4">Your Privacy Matters</h2>
                <p class="text-xl text-gray-400 text-gray-300 max-w-3xl mx-auto">
                    We protect your data with enterprise-grade security
                </p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div class="text-center">
                    <div class="w-16 h-16 rounded-full bg-green-100 bg-green-900/50 flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-trash-alt text-green-600 text-2xl"></i>
                    </div>
                    <h3 class="font-bold mb-2">Privacy Protected</h3>
                    <p class="text-gray-300 text-sm">Your resume and personal data are never stored permanently. We only retain anonymized usage metrics for service improvement.</p>
                </div>
                
                <div class="text-center">
                    <div class="w-16 h-16 rounded-full bg-blue-100 bg-blue-900/50 flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-lock text-blue-600 text-2xl"></i>
                    </div>
                    <h3 class="font-bold mb-2">Encrypted Processing</h3>
                    <p class="text-gray-400 text-gray-300 text-sm">End-to-end encryption for all data transmission</p>
                </div>
                
                <div class="text-center">
                    <div class="w-16 h-16 rounded-full bg-purple-100 bg-purple-900/50 flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-gavel text-purple-600 text-2xl"></i>
                    </div>
                    <h3 class="font-bold mb-2">GDPR Compliant</h3>
                    <p class="text-gray-400 text-gray-300 text-sm">Designed with privacy regulations in mind</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Live Demo -->
    <section id="demo" class="py-20 md:py-24 bg-slate-900">
        <div class="container mx-auto px-6">
            <div class="text-center mb-16">
                <h2 class="text-3xl md:text-4xl font-bold mb-4">Ready to see it in action?</h2>
                <p class="text-xl text-gray-400 text-gray-300 max-w-3xl mx-auto">
                    Experience skills intelligence analysis in action with our live demo
                </p>
            </div>
            
            <div class="max-w-4xl mx-auto">
                <div class="card demo-box rounded-xl p-6">
                    <div class="mb-6">
                        <label class="block text-gray-300 text-gray-300 font-medium mb-2" for="resume-input">
                            Paste Sample Resume Text
                        </label>
                        <textarea id="resume-input" class="w-full h-40 p-4 border border-slate-600 border-slate-600 rounded-lg bg-slate-800 bg-slate-700 text-gray-100 text-gray-100" placeholder="Paste your resume text here...">Software Engineer with 5 years of experience in web development. Proficient in JavaScript, React, Node.js, and MongoDB. Experienced with AWS cloud services and Docker containerization. Bachelor's degree in Computer Science from MIT. Seeking opportunities to work on challenging projects that leverage cutting-edge technologies.</textarea>
                    </div>
                    
                    <div class="flex justify-center mb-6">
                        <button id="analyze-btn" class="bg-accent hover:bg-teal-600 text-white font-semibold py-3 px-8 rounded-lg transition duration-300">
                            Analyze Skills
                        </button>
                    </div>
                    
                    <div id="demo-results" class="hidden">
                        <h3 class="text-xl font-bold mb-4">Analysis Results</h3>
                        
                        <div class="mb-6">
                            <h4 class="font-semibold mb-2">Extracted Skills:</h4>
                            <div class="flex flex-wrap gap-2">
                                <span class="bg-blue-100 bg-blue-900/50 text-accent text-accent px-3 py-1 rounded-full text-sm">JavaScript</span>
                                <span class="bg-blue-100 bg-blue-900/50 text-accent text-accent px-3 py-1 rounded-full text-sm">React</span>
                                <span class="bg-blue-100 bg-blue-900/50 text-accent text-accent px-3 py-1 rounded-full text-sm">Node.js</span>
                                <span class="bg-blue-100 bg-blue-900/50 text-accent text-accent px-3 py-1 rounded-full text-sm">MongoDB</span>
                                <span class="bg-blue-100 bg-blue-900/50 text-accent text-accent px-3 py-1 rounded-full text-sm">AWS</span>
                                <span class="bg-blue-100 bg-blue-900/50 text-accent text-accent px-3 py-1 rounded-full text-sm">Docker</span>
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
                                    <div class="w-full bg-gray-700 rounded-full h-2.5">
                                        <div class="bg-green-600 h-2.5 rounded-full" style="width: 85%"></div>
                                    </div>
                                </div>
                                
                                <div>
                                    <div class="flex justify-between mb-1">
                                        <span>React</span>
                                        <span>75% Match</span>
                                    </div>
                                    <div class="w-full bg-gray-700 rounded-full h-2.5">
                                        <div class="bg-green-500 h-2.5 rounded-full" style="width: 75%"></div>
                                    </div>
                                </div>
                                
                                <div>
                                    <div class="flex justify-between mb-1">
                                        <span>Node.js</span>
                                        <span>60% Match</span>
                                    </div>
                                    <div class="w-full bg-gray-700 rounded-full h-2.5">
                                        <div class="bg-yellow-500 h-2.5 rounded-full" style="width: 60%"></div>
                                    </div>
                                </div>
                                
                                <div>
                                    <div class="flex justify-between mb-1">
                                        <span>AWS</span>
                                        <span>45% Match</span>
                                    </div>
                                    <div class="w-full bg-gray-700 rounded-full h-2.5">
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
    <footer id="contact" class="bg-accent text-white pt-16 pb-8">
        <div class="container mx-auto px-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
                <div class="lg:col-span-2">
                    <h2 class="text-2xl font-bold mb-4">Clearsight IP</h2>
                    <p class="mb-6 max-w-md">
                        Transform your career with AI-powered skills intelligence. Discover gaps, unlock opportunities, accelerate growth.
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
                    <a href="#" class="hover:text-accent transition">Data Protection</a>
                </div>
                <p>&copy; <span id="currentYear"></span> Clearsight IP. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <script>
        // Set current year
        document.getElementById('currentYear').textContent = new Date().getFullYear();
        
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

    <!-- Authentication Modal -->
    <div id="authModal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50 flex items-center justify-center">
        <div class="bg-slate-800 rounded-lg p-8 max-w-md w-full mx-4 border border-slate-700">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-white">Sign In Required</h2>
                <button id="closeAuthModal" class="text-gray-400 hover:text-white">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            
            <div id="authTabs" class="flex mb-6 border-b border-slate-600">
                <button id="loginTab" class="px-4 py-2 text-accent border-b-2 border-accent">Login</button>
                <button id="registerTab" class="px-4 py-2 text-gray-400 hover:text-white ml-4">Register</button>
            </div>

            <!-- Login Form -->
            <form id="loginForm" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input type="email" id="loginEmail" required 
                           class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">Password</label>
                    <input type="password" id="loginPassword" required 
                           class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent">
                </div>
                <button type="submit" class="w-full bg-accent hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300">
                    Sign In
                </button>
            </form>

            <!-- Register Form -->
            <form id="registerForm" class="space-y-4 hidden">
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                    <input type="text" id="registerName" required 
                           class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input type="email" id="registerEmail" required 
                           class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">Password</label>
                    <input type="password" id="registerPassword" required minlength="8"
                           class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent">
                    <p class="text-xs text-gray-400 mt-1">Minimum 8 characters</p>
                </div>
                <button type="submit" class="w-full bg-accent hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300">
                    Create Account
                </button>
            </form>

            <div id="authError" class="mt-4 p-3 bg-red-900/20 border border-red-500 rounded-md text-red-300 text-sm hidden"></div>
        </div>
    </div>

    <!-- CV Analysis Modal -->
    <div id="analysisModal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50 flex items-center justify-center">
        <div class="bg-slate-800 rounded-lg p-8 max-w-4xl w-full mx-4 border border-slate-700 max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-white">CV Skills Analysis</h2>
                <button id="closeAnalysisModal" class="text-gray-400 hover:text-white">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>

            <!-- Upload Section -->
            <div id="uploadSection" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- CV Upload -->
                    <div class="space-y-4">
                        <h3 class="text-lg font-semibold text-white">Upload Your CV</h3>
                        <div class="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
                            <input type="file" id="cvFileInput" accept=".pdf,.doc,.docx,.txt" class="hidden">
                            <div id="cvDropZone" class="cursor-pointer">
                                <i class="fas fa-cloud-upload-alt text-4xl text-accent mb-4"></i>
                                <p class="text-gray-300 mb-2">Drop your CV here or click to browse</p>
                                <p class="text-sm text-gray-500">Supports PDF, DOC, DOCX, TXT (Max 5MB)</p>
                            </div>
                            <div id="cvFileInfo" class="hidden mt-4 p-3 bg-slate-700 rounded-md">
                                <div class="flex items-center justify-between">
                                    <span id="cvFileName" class="text-sm text-gray-300"></span>
                                    <button id="removeCvFile" class="text-red-400 hover:text-red-300">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Or Text Input -->
                        <div class="text-center text-gray-400">OR</div>
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">Paste CV Text</label>
                            <textarea id="cvTextInput" rows="8" placeholder="Paste your CV content here..."
                                    class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent resize-none"></textarea>
                        </div>
                    </div>

                    <!-- Job Description -->
                    <div class="space-y-4">
                        <h3 class="text-lg font-semibold text-white">Job Description (Optional)</h3>
                        <div class="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
                            <input type="file" id="jobFileInput" accept=".pdf,.doc,.docx,.txt" class="hidden">
                            <div id="jobDropZone" class="cursor-pointer">
                                <i class="fas fa-briefcase text-4xl text-blue-400 mb-4"></i>
                                <p class="text-gray-300 mb-2">Drop job description here or click to browse</p>
                                <p class="text-sm text-gray-500">Supports PDF, DOC, DOCX, TXT (Max 2MB)</p>
                            </div>
                            <div id="jobFileInfo" class="hidden mt-4 p-3 bg-slate-700 rounded-md">
                                <div class="flex items-center justify-between">
                                    <span id="jobFileName" class="text-sm text-gray-300"></span>
                                    <button id="removeJobFile" class="text-red-400 hover:text-red-300">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Or Text Input -->
                        <div class="text-center text-gray-400">OR</div>
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">Paste Job Description</label>
                            <textarea id="jobTextInput" rows="8" placeholder="Paste the job description here..."
                                    class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent resize-none"></textarea>
                        </div>
                    </div>
                </div>

                <!-- Analysis Options -->
                <div class="border-t border-slate-600 pt-6">
                    <h3 class="text-lg font-semibold text-white mb-4">Analysis Options</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <label class="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" id="skillsIntelligenceAnalysis" checked class="text-accent focus:ring-accent">
                            <span class="text-gray-300">Skills Intelligence Analysis</span>
                        </label>
                        <label class="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" id="careerSuggestions" checked class="text-accent focus:ring-accent">
                            <span class="text-gray-300">Career Suggestions</span>
                        </label>
                        <label class="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" id="industryTrends" checked class="text-accent focus:ring-accent">
                            <span class="text-gray-300">Industry Trends</span>
                        </label>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex justify-end space-x-4 pt-6 border-t border-slate-600">
                    <button id="cancelAnalysis" class="px-6 py-2 border border-slate-600 text-gray-300 rounded-md hover:bg-slate-700 transition duration-300">
                        Cancel
                    </button>
                    <button id="startAnalysis" class="px-6 py-2 bg-accent hover:bg-teal-600 text-white rounded-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                        <i class="fas fa-chart-line mr-2"></i>
                        Start Analysis
                    </button>
                </div>
            </div>

            <!-- Loading Section -->
            <div id="loadingSection" class="hidden text-center py-12">
                <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-accent mx-auto mb-4"></div>
                <h3 class="text-xl font-semibold text-white mb-2">Analyzing Your CV...</h3>
                <p class="text-gray-400 mb-4">This may take up to 30 seconds</p>
                <div class="w-full bg-slate-700 rounded-full h-2 mb-4">
                    <div id="progressBar" class="bg-accent h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
                </div>
                <p id="loadingStatus" class="text-sm text-gray-500">Initializing analysis...</p>
            </div>

            <!-- Results Section -->
            <div id="resultsSection" class="hidden space-y-6">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-xl font-semibold text-white">Analysis Results</h3>
                    <div class="flex space-x-2">
                        <button id="downloadResults" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-300">
                            <i class="fas fa-download mr-2"></i>Download Report
                        </button>
                        <button id="newAnalysis" class="px-4 py-2 border border-slate-600 text-gray-300 rounded-md hover:bg-slate-700 transition duration-300">
                            New Analysis
                        </button>
                    </div>
                </div>
                
                <div id="analysisResults" class="space-y-6">
                    <!-- Results will be populated here -->
                </div>
            </div>

            <div id="analysisError" class="mt-4 p-3 bg-red-900/20 border border-red-500 rounded-md text-red-300 text-sm hidden"></div>
        </div>
    </div>

    <!-- CV Analysis JavaScript -->
    <script>
        // Global state
        let authToken = localStorage.getItem('authToken');
        let currentUser = null;
        let analysisInProgress = false;

        // Security configuration
        const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB for CV
        const MAX_JOB_FILE_SIZE = 2 * 1024 * 1024; // 2MB for job description
        const ALLOWED_FILE_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
        const MAX_TEXT_LENGTH = 50000; // 50k characters max

        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            initializeAuth();
            initializeFileHandlers();
            initializeAnalysis();
        });

        // Authentication functions
        function initializeAuth() {
            const analyzeBtn = document.getElementById('analyzeSkillsBtn');
            const authModal = document.getElementById('authModal');
            const closeAuthModal = document.getElementById('closeAuthModal');
            const loginTab = document.getElementById('loginTab');
            const registerTab = document.getElementById('registerTab');
            const loginForm = document.getElementById('loginForm');
            const registerForm = document.getElementById('registerForm');

            // Check if user is already authenticated
            if (authToken) {
                validateToken();
            }

            analyzeBtn.addEventListener('click', function() {
                if (authToken && currentUser) {
                    showAnalysisModal();
                } else {
                    showAuthModal();
                }
            });

            closeAuthModal.addEventListener('click', hideAuthModal);
            
            loginTab.addEventListener('click', function() {
                showLoginForm();
            });
            
            registerTab.addEventListener('click', function() {
                showRegisterForm();
            });

            loginForm.addEventListener('submit', handleLogin);
            registerForm.addEventListener('submit', handleRegister);

            // Close modal on outside click
            authModal.addEventListener('click', function(e) {
                if (e.target === authModal) {
                    hideAuthModal();
                }
            });
        }

        function showAuthModal() {
            document.getElementById('authModal').classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }

        function hideAuthModal() {
            document.getElementById('authModal').classList.add('hidden');
            document.body.style.overflow = 'auto';
            clearAuthError();
        }

        function showLoginForm() {
            document.getElementById('loginTab').classList.add('text-accent', 'border-b-2', 'border-accent');
            document.getElementById('loginTab').classList.remove('text-gray-400');
            document.getElementById('registerTab').classList.remove('text-accent', 'border-b-2', 'border-accent');
            document.getElementById('registerTab').classList.add('text-gray-400');
            document.getElementById('loginForm').classList.remove('hidden');
            document.getElementById('registerForm').classList.add('hidden');
        }

        function showRegisterForm() {
            document.getElementById('registerTab').classList.add('text-accent', 'border-b-2', 'border-accent');
            document.getElementById('registerTab').classList.remove('text-gray-400');
            document.getElementById('loginTab').classList.remove('text-accent', 'border-b-2', 'border-accent');
            document.getElementById('loginTab').classList.add('text-gray-400');
            document.getElementById('registerForm').classList.remove('hidden');
            document.getElementById('loginForm').classList.add('hidden');
        }

        async function handleLogin(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            try {
                const response = await fetch('/api/v1/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    authToken = data.token;
                    currentUser = data.user;
                    localStorage.setItem('authToken', authToken);
                    hideAuthModal();
                    showAnalysisModal();
                } else {
                    showAuthError(data.error?.message || 'Login failed');
                }
            } catch (error) {
                showAuthError('Network error. Please try again.');
            }
        }

        async function handleRegister(e) {
            e.preventDefault();
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;

            // Client-side validation
            if (password.length < 8) {
                showAuthError('Password must be at least 8 characters long');
                return;
            }

            try {
                const response = await fetch('/api/v1/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    authToken = data.token;
                    currentUser = data.user;
                    localStorage.setItem('authToken', authToken);
                    hideAuthModal();
                    showAnalysisModal();
                } else {
                    showAuthError(data.error?.message || 'Registration failed');
                }
            } catch (error) {
                showAuthError('Network error. Please try again.');
            }
        }

        async function validateToken() {
            try {
                const response = await fetch('/api/v1/users/profile', {
                    headers: {
                        'Authorization': \`Bearer \${authToken}\`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    currentUser = data.user;
                } else {
                    // Token invalid, clear it
                    authToken = null;
                    currentUser = null;
                    localStorage.removeItem('authToken');
                }
            } catch (error) {
                console.error('Token validation failed:', error);
                authToken = null;
                currentUser = null;
                localStorage.removeItem('authToken');
            }
        }

        function showAuthError(message) {
            const errorDiv = document.getElementById('authError');
            errorDiv.textContent = message;
            errorDiv.classList.remove('hidden');
        }

        function clearAuthError() {
            const errorDiv = document.getElementById('authError');
            errorDiv.classList.add('hidden');
        }

        // File handling functions
        function initializeFileHandlers() {
            const cvFileInput = document.getElementById('cvFileInput');
            const jobFileInput = document.getElementById('jobFileInput');
            const cvDropZone = document.getElementById('cvDropZone');
            const jobDropZone = document.getElementById('jobDropZone');
            const removeCvFile = document.getElementById('removeCvFile');
            const removeJobFile = document.getElementById('removeJobFile');

            // CV file handling
            cvDropZone.addEventListener('click', () => cvFileInput.click());
            cvFileInput.addEventListener('change', (e) => handleFileSelect(e.target.files[0], 'cv'));
            removeCvFile.addEventListener('click', () => clearFile('cv'));

            // Job file handling
            jobDropZone.addEventListener('click', () => jobFileInput.click());
            jobFileInput.addEventListener('change', (e) => handleFileSelect(e.target.files[0], 'job'));
            removeJobFile.addEventListener('click', () => clearFile('job'));

            // Drag and drop for CV
            cvDropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                cvDropZone.classList.add('border-accent');
            });
            cvDropZone.addEventListener('dragleave', (e) => {
                e.preventDefault();
                cvDropZone.classList.remove('border-accent');
            });
            cvDropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                cvDropZone.classList.remove('border-accent');
                handleFileSelect(e.dataTransfer.files[0], 'cv');
            });

            // Drag and drop for Job
            jobDropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                jobDropZone.classList.add('border-blue-400');
            });
            jobDropZone.addEventListener('dragleave', (e) => {
                e.preventDefault();
                jobDropZone.classList.remove('border-blue-400');
            });
            jobDropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                jobDropZone.classList.remove('border-blue-400');
                handleFileSelect(e.dataTransfer.files[0], 'job');
            });
        }

        function handleFileSelect(file, type) {
            if (!file) return;

            const maxSize = type === 'cv' ? MAX_FILE_SIZE : MAX_JOB_FILE_SIZE;
            
            // Security validations
            if (file.size > maxSize) {
                showAnalysisError(\`File too large. Maximum size is \${maxSize / (1024 * 1024)}MB\`);
                return;
            }

            if (!ALLOWED_FILE_TYPES.includes(file.type)) {
                showAnalysisError('Invalid file type. Please upload PDF, DOC, DOCX, or TXT files only.');
                return;
            }

            // Validate file name (prevent path traversal)
            if (file.name.includes('../') || file.name.includes('..\\\\')) {
                showAnalysisError('Invalid file name.');
                return;
            }

            // Store file and show info
            if (type === 'cv') {
                window.cvFile = file;
                document.getElementById('cvFileName').textContent = file.name;
                document.getElementById('cvFileInfo').classList.remove('hidden');
                document.getElementById('cvDropZone').classList.add('hidden');
                // Clear text input if file is selected
                document.getElementById('cvTextInput').value = '';
            } else {
                window.jobFile = file;
                document.getElementById('jobFileName').textContent = file.name;
                document.getElementById('jobFileInfo').classList.remove('hidden');
                document.getElementById('jobDropZone').classList.add('hidden');
                // Clear text input if file is selected
                document.getElementById('jobTextInput').value = '';
            }

            clearAnalysisError();
        }

        function clearFile(type) {
            if (type === 'cv') {
                window.cvFile = null;
                document.getElementById('cvFileInfo').classList.add('hidden');
                document.getElementById('cvDropZone').classList.remove('hidden');
                document.getElementById('cvFileInput').value = '';
            } else {
                window.jobFile = null;
                document.getElementById('jobFileInfo').classList.add('hidden');
                document.getElementById('jobDropZone').classList.remove('hidden');
                document.getElementById('jobFileInput').value = '';
            }
        }

        // Analysis functions
        function initializeAnalysis() {
            const analysisModal = document.getElementById('analysisModal');
            const closeAnalysisModal = document.getElementById('closeAnalysisModal');
            const cancelAnalysis = document.getElementById('cancelAnalysis');
            const startAnalysis = document.getElementById('startAnalysis');
            const newAnalysis = document.getElementById('newAnalysis');
            const downloadResults = document.getElementById('downloadResults');

            closeAnalysisModal.addEventListener('click', hideAnalysisModal);
            cancelAnalysis.addEventListener('click', hideAnalysisModal);
            startAnalysis.addEventListener('click', performAnalysis);
            newAnalysis.addEventListener('click', resetAnalysis);
            downloadResults.addEventListener('click', downloadAnalysisResults);

            // Close modal on outside click
            analysisModal.addEventListener('click', function(e) {
                if (e.target === analysisModal && !analysisInProgress) {
                    hideAnalysisModal();
                }
            });

            // Text input validation
            const cvTextInput = document.getElementById('cvTextInput');
            const jobTextInput = document.getElementById('jobTextInput');

            cvTextInput.addEventListener('input', function() {
                if (this.value.length > MAX_TEXT_LENGTH) {
                    this.value = this.value.substring(0, MAX_TEXT_LENGTH);
                    showAnalysisError(\`Text too long. Maximum \${MAX_TEXT_LENGTH} characters allowed.\`);
                }
                // Clear file if text is entered
                if (this.value.trim() && window.cvFile) {
                    clearFile('cv');
                }
            });

            jobTextInput.addEventListener('input', function() {
                if (this.value.length > MAX_TEXT_LENGTH) {
                    this.value = this.value.substring(0, MAX_TEXT_LENGTH);
                    showAnalysisError(\`Text too long. Maximum \${MAX_TEXT_LENGTH} characters allowed.\`);
                }
                // Clear file if text is entered
                if (this.value.trim() && window.jobFile) {
                    clearFile('job');
                }
            });
        }

        function showAnalysisModal() {
            document.getElementById('analysisModal').classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            resetAnalysis();
        }

        function hideAnalysisModal() {
            if (analysisInProgress) {
                if (!confirm('Analysis is in progress. Are you sure you want to cancel?')) {
                    return;
                }
            }
            document.getElementById('analysisModal').classList.add('hidden');
            document.body.style.overflow = 'auto';
            resetAnalysis();
        }

        function resetAnalysis() {
            // Show upload section, hide others
            document.getElementById('uploadSection').classList.remove('hidden');
            document.getElementById('loadingSection').classList.add('hidden');
            document.getElementById('resultsSection').classList.add('hidden');
            
            // Clear files and inputs
            clearFile('cv');
            clearFile('job');
            document.getElementById('cvTextInput').value = '';
            document.getElementById('jobTextInput').value = '';
            
            // Reset checkboxes
            document.getElementById('skillsIntelligenceAnalysis').checked = true;
            document.getElementById('careerSuggestions').checked = true;
            document.getElementById('industryTrends').checked = true;
            
            clearAnalysisError();
            analysisInProgress = false;
        }

        async function performAnalysis() {
            // Validate inputs
            const cvText = document.getElementById('cvTextInput').value.trim();
            const jobText = document.getElementById('jobTextInput').value.trim();
            
            if (!window.cvFile && !cvText) {
                showAnalysisError('Please upload a CV file or enter CV text.');
                return;
            }

            // Prepare form data
            const formData = new FormData();
            
            if (window.cvFile) {
                formData.append('resume', window.cvFile);
            } else {
                formData.append('resumeText', cvText);
            }
            
            if (window.jobFile) {
                formData.append('jobDescription', window.jobFile);
            } else if (jobText) {
                formData.append('jobDescriptionText', jobText);
            }

            // Add analysis options
            formData.append('includeSkillsGap', document.getElementById('skillsIntelligenceAnalysis').checked);
            formData.append('includeCareerSuggestions', document.getElementById('careerSuggestions').checked);
            formData.append('includeIndustryTrends', document.getElementById('industryTrends').checked);

            // Show loading
            analysisInProgress = true;
            document.getElementById('uploadSection').classList.add('hidden');
            document.getElementById('loadingSection').classList.remove('hidden');
            
            // Simulate progress
            simulateProgress();

            try {
                const response = await fetch('/api/v1/analyze/resume', {
                    method: 'POST',
                    headers: {
                        'Authorization': \`Bearer \${authToken}\`
                    },
                    body: formData
                });

                const data = await response.json();

                if (response.ok) {
                    displayResults(data);
                } else {
                    throw new Error(data.error?.message || 'Analysis failed');
                }
            } catch (error) {
                showAnalysisError(error.message || 'Analysis failed. Please try again.');
                resetAnalysis();
            } finally {
                analysisInProgress = false;
            }
        }

        function simulateProgress() {
            const progressBar = document.getElementById('progressBar');
            const loadingStatus = document.getElementById('loadingStatus');
            const statuses = [
                'Initializing analysis...',
                'Processing CV content...',
                'Extracting skills...',
                'Analyzing job requirements...',
                'Identifying skills opportunities...',
                'Generating recommendations...',
                'Finalizing results...'
            ];
            
            let progress = 0;
            let statusIndex = 0;
            
            const interval = setInterval(() => {
                if (!analysisInProgress) {
                    clearInterval(interval);
                    return;
                }
                
                progress += Math.random() * 15;
                if (progress > 95) progress = 95;
                
                progressBar.style.width = progress + '%';
                
                if (statusIndex < statuses.length - 1 && progress > (statusIndex + 1) * 14) {
                    statusIndex++;
                    loadingStatus.textContent = statuses[statusIndex];
                }
            }, 1000);
        }

        function displayResults(data) {
            document.getElementById('loadingSection').classList.add('hidden');
            document.getElementById('resultsSection').classList.remove('hidden');
            
            const resultsContainer = document.getElementById('analysisResults');
            
            // Store results for download
            window.analysisData = data;
            
            // Generate results HTML
            let resultsHTML = '';
            
            if (data.skillsAnalysis) {
                resultsHTML += generateSkillsAnalysisHTML(data.skillsAnalysis);
            }
            
            if (data.skillsGap) {
                resultsHTML += generateSkillsGapHTML(data.skillsGap);
            }
            
            if (data.careerSuggestions) {
                resultsHTML += generateCareerSuggestionsHTML(data.careerSuggestions);
            }
            
            if (data.industryTrends) {
                resultsHTML += generateIndustryTrendsHTML(data.industryTrends);
            }
            
            resultsContainer.innerHTML = resultsHTML;
        }

        function generateSkillsAnalysisHTML(skillsAnalysis) {
            return \`
                <div class="bg-slate-700 rounded-lg p-6">
                    <h4 class="text-lg font-semibold text-white mb-4">
                        <i class="fas fa-chart-bar text-accent mr-2"></i>
                        Skills Analysis
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        \${skillsAnalysis.skills.map(skill => \`
                            <div class="bg-slate-800 rounded-md p-4">
                                <div class="flex justify-between items-center mb-2">
                                    <span class="font-medium text-gray-300">\${skill.name}</span>
                                    <span class="text-sm font-semibold \${getSkillLevelColor(skill.level)}">\${skill.level}</span>
                                </div>
                                <div class="w-full bg-slate-600 rounded-full h-2">
                                    <div class="bg-accent h-2 rounded-full transition-all duration-300" style="width: \${skill.confidence}%"></div>
                                </div>
                                <div class="text-xs text-gray-400 mt-1">\${skill.confidence}% confidence</div>
                            </div>
                        \`).join('')}
                    </div>
                </div>
            \`;
        }

        function generateSkillsGapHTML(skillsGap) {
            return \`
                <div class="bg-slate-700 rounded-lg p-6">
                    <h4 class="text-lg font-semibold text-white mb-4">
                        <i class="fas fa-exclamation-triangle text-yellow-500 mr-2"></i>
                        Skills Gap Analysis
                    </h4>
                    <div class="space-y-4">
                        \${skillsGap.missingSkills.map(skill => \`
                            <div class="bg-red-900/20 border border-red-500 rounded-md p-4">
                                <div class="flex justify-between items-start mb-2">
                                    <h5 class="font-medium text-red-300">\${skill.name}</h5>
                                    <span class="text-xs bg-red-600 text-white px-2 py-1 rounded">\${skill.priority}</span>
                                </div>
                                <p class="text-sm text-gray-300 mb-2">\${skill.description}</p>
                                <div class="text-xs text-gray-400">
                                    <strong>Learning Time:</strong> \${skill.learningTime} | 
                                    <strong>Resources:</strong> \${skill.resources.join(', ')}
                                </div>
                            </div>
                        \`).join('')}
                    </div>
                </div>
            \`;
        }

        function generateCareerSuggestionsHTML(careerSuggestions) {
            return \`
                <div class="bg-slate-700 rounded-lg p-6">
                    <h4 class="text-lg font-semibold text-white mb-4">
                        <i class="fas fa-rocket text-blue-400 mr-2"></i>
                        Career Suggestions
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        \${careerSuggestions.suggestions.map(suggestion => \`
                            <div class="bg-slate-800 rounded-md p-4">
                                <h5 class="font-medium text-blue-300 mb-2">\${suggestion.title}</h5>
                                <p class="text-sm text-gray-300 mb-3">\${suggestion.description}</p>
                                <div class="flex justify-between items-center mb-2">
                                    <span class="text-xs text-gray-400">Match Score</span>
                                    <span class="text-sm font-semibold text-blue-400">\${suggestion.matchScore}%</span>
                                </div>
                                <div class="w-full bg-slate-600 rounded-full h-2">
                                    <div class="bg-blue-400 h-2 rounded-full" style="width: \${suggestion.matchScore}%"></div>
                                </div>
                            </div>
                        \`).join('')}
                    </div>
                </div>
            \`;
        }

        function generateIndustryTrendsHTML(industryTrends) {
            return \`
                <div class="bg-slate-700 rounded-lg p-6">
                    <h4 class="text-lg font-semibold text-white mb-4">
                        <i class="fas fa-trending-up text-green-400 mr-2"></i>
                        Industry Trends
                    </h4>
                    <div class="space-y-4">
                        \${industryTrends.trends.map(trend => \`
                            <div class="bg-slate-800 rounded-md p-4">
                                <div class="flex justify-between items-start mb-2">
                                    <h5 class="font-medium text-green-300">\${trend.skill}</h5>
                                    <span class="text-xs \${getTrendColor(trend.trend)} px-2 py-1 rounded">\${trend.trend}</span>
                                </div>
                                <p class="text-sm text-gray-300 mb-2">\${trend.description}</p>
                                <div class="text-xs text-gray-400">
                                    <strong>Demand Growth:</strong> \${trend.demandGrowth} | 
                                    <strong>Salary Impact:</strong> \${trend.salaryImpact}
                                </div>
                            </div>
                        \`).join('')}
                    </div>
                </div>
            \`;
        }

        function getSkillLevelColor(level) {
            switch(level.toLowerCase()) {
                case 'expert': return 'text-green-400';
                case 'advanced': return 'text-blue-400';
                case 'intermediate': return 'text-yellow-400';
                case 'beginner': return 'text-orange-400';
                default: return 'text-gray-400';
            }
        }

        function getTrendColor(trend) {
            switch(trend.toLowerCase()) {
                case 'rising': return 'bg-green-600 text-white';
                case 'stable': return 'bg-blue-600 text-white';
                case 'declining': return 'bg-red-600 text-white';
                default: return 'bg-gray-600 text-white';
            }
        }

        function downloadAnalysisResults() {
            if (!window.analysisData) return;
            
            const results = {
                timestamp: new Date().toISOString(),
                user: currentUser?.name || 'Anonymous',
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

        function showAnalysisError(message) {
            const errorDiv = document.getElementById('analysisError');
            errorDiv.textContent = message;
            errorDiv.classList.remove('hidden');
        }

        function clearAnalysisError() {
            const errorDiv = document.getElementById('analysisError');
            errorDiv.classList.add('hidden');
        }

        // Security: Prevent XSS in dynamic content
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        // Security: Rate limiting for analysis requests
        let lastAnalysisTime = 0;
        const ANALYSIS_COOLDOWN = 30000; // 30 seconds

        function checkAnalysisRateLimit() {
            const now = Date.now();
            if (now - lastAnalysisTime < ANALYSIS_COOLDOWN) {
                const remainingTime = Math.ceil((ANALYSIS_COOLDOWN - (now - lastAnalysisTime)) / 1000);
                showAnalysisError(\`Please wait \${remainingTime} seconds before starting another analysis.\`);
                return false;
            }
            lastAnalysisTime = now;
            return true;
        }

        // Update performAnalysis to include rate limiting
        const originalPerformAnalysis = performAnalysis;
        performAnalysis = function() {
            if (!checkAnalysisRateLimit()) {
                return;
            }
            return originalPerformAnalysis.call(this);
        };
    </script>
</body>
</html>



`;