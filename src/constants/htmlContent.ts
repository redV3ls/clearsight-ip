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
                    <span class="bg-red-100 text-red-800 text-sm font-semibold px-3 py-1 rounded-full">The Problem</span>
                </div>
                <h1 class="text-4xl md:text-5xl font-bold leading-tight mb-6">
                    <span class="text-red-600">73% of companies</span> struggle to identify skill gaps, costing them <span class="gradient-text">\\$1.2M annually</span> in missed opportunities
                </h1>
                <p class="text-xl text-gray-600 dark:text-gray-300 mb-8">
                    Traditional hiring and development processes are blind to hidden talents and critical skill gaps. Teams waste months on mismatched hires while existing employees plateau without clear growth paths.
                </p>
                
                <div class="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-8">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <i class="fas fa-exclamation-triangle text-red-500"></i>
                        </div>
                        <div class="ml-3">
                            <p class="text-sm text-red-700 dark:text-red-300">
                                <strong>The Hidden Costs:</strong> 6 months average time-to-productivity for new hires вЂў 40% of internal promotions fail due to skill misalignment вЂў \\$15K average cost per bad hire
                            </p>
                        </div>
                    </div>
                </div>
                
                <div class="flex flex-wrap gap-4">
                    <button class="bg-primary hover:bg-blue-800 text-white font-semibold py-3 px-8 rounded-lg transition duration-300">
                        See The Solution
                    </button>
                </div>
            </div>
            
            <div class="md:w-1/2 flex justify-center">
                <div class="relative">
                    <div class="w-80 h-80 md:w-96 md:h-96 bg-gradient-to-br from-red-500 to-orange-500 rounded-full opacity-10 absolute -top-10 -left-10 animate-float"></div>
                    <div class="w-64 h-64 md:w-80 md:h-80 bg-gradient-to-tr from-orange-500 to-red-500 rounded-full opacity-10 absolute -bottom-10 -right-10 animate-float animation-delay-2000"></div>
                    <div class="relative bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="font-bold text-lg text-red-600">The Reality Check</h3>
                            <span class="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded">Hidden Costs</span>
                        </div>
                        
                        <div class="space-y-4">
                            <div class="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded">
                                <span class="text-sm font-medium">Time to Fill Positions</span>
                                <span class="text-sm font-bold text-red-600">89 days</span>
                            </div>
                            
                            <div class="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded">
                                <span class="text-sm font-medium">Bad Hire Cost</span>
                                <span class="text-sm font-bold text-orange-600">\\$240K</span>
                            </div>
                            
                            <div class="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                                <span class="text-sm font-medium">Skill Gap Impact</span>
                                <span class="text-sm font-bold text-yellow-600">-23% productivity</span>
                            </div>
                            
                            <div class="pt-4 border-t border-gray-200 dark:border-slate-700">
                                <h4 class="font-semibold mb-2 text-red-600">What You're Missing:</h4>
                                <ul class="space-y-1 text-sm">
                                    <li class="flex items-center"><i class="fas fa-times text-red-500 mr-2"></i>Internal talent going unnoticed</li>
                                    <li class="flex items-center"><i class="fas fa-times text-red-500 mr-2"></i>Expensive external hiring</li>
                                    <li class="flex items-center"><i class="fas fa-times text-red-500 mr-2"></i>Team skill imbalances</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Solution Section -->
    <section class="py-16 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
        <div class="container mx-auto px-6">
            <div class="text-center mb-12">
                <span class="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">The Solution</span>
                <h2 class="text-3xl md:text-4xl font-bold mt-4 mb-6">
                    AI-Powered Skills Intelligence That <span class="text-green-600">Actually Works</span>
                </h2>
                <p class="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                    Transform your workforce development with intelligent skills analysis that identifies hidden talents, predicts future needs, and creates personalized growth paths.
                </p>
            </div>

            <div class="flex flex-col md:flex-row items-center">
                <div class="md:w-1/2 mb-8 md:mb-0">
                    <div class="relative bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700">
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
                                <div class="w-full bg-gray-200 rounded-full h-2.5">
                                    <div class="bg-green-600 h-2.5 rounded-full" style="width: 92%"></div>
                                </div>
                            </div>
                            
                            <div>
                                <div class="flex justify-between mb-1">
                                    <span class="text-sm font-medium">Team Leadership</span>
                                    <span class="text-sm font-medium text-blue-600">Hidden Strength</span>
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-2.5">
                                    <div class="bg-blue-600 h-2.5 rounded-full" style="width: 78%"></div>
                                </div>
                            </div>
                            
                            <div>
                                <div class="flex justify-between mb-1">
                                    <span class="text-sm font-medium">Cloud Architecture</span>
                                    <span class="text-sm font-medium text-purple-600">Growth Opportunity</span>
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-2.5">
                                    <div class="bg-purple-600 h-2.5 rounded-full" style="width: 45%"></div>
                                </div>
                            </div>
                            
                            <div class="pt-4 border-t border-gray-200 dark:border-slate-700">
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
                            <div class="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mr-4 flex-shrink-0">
                                <i class="fas fa-search text-green-600 text-xl"></i>
                            </div>
                            <div>
                                <h3 class="text-xl font-bold mb-2">Discover Hidden Talents</h3>
                                <p class="text-gray-600 dark:text-gray-300">Uncover skills and potential that traditional methods miss. Our AI analyzes context, not just keywords.</p>
                            </div>
                        </div>

                        <div class="flex items-start">
                            <div class="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mr-4 flex-shrink-0">
                                <i class="fas fa-chart-line text-blue-600 text-xl"></i>
                            </div>
                            <div>
                                <h3 class="text-xl font-bold mb-2">Predict Future Needs</h3>
                                <p class="text-gray-600 dark:text-gray-300">Stay ahead with industry trend analysis and emerging skills detection. Plan your workforce evolution.</p>
                            </div>
                        </div>

                        <div class="flex items-start">
                            <div class="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center mr-4 flex-shrink-0">
                                <i class="fas fa-route text-purple-600 text-xl"></i>
                            </div>
                            <div>
                                <h3 class="text-xl font-bold mb-2">Create Growth Paths</h3>
                                <p class="text-gray-600 dark:text-gray-300">Generate personalized development roadmaps with time estimates, costs, and success metrics.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Proof Section -->
    <section id="features" class="py-16 bg-light dark:bg-slate-800">
        <div class="container mx-auto px-6">
            <div class="text-center mb-16">
                <span class="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">Proven Results</span>
                <h2 class="text-3xl md:text-4xl font-bold mt-4 mb-6">Real Companies, Real Impact</h2>
                <p class="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                    See how leading organizations are transforming their workforce development with our AI-powered platform
                </p>
            </div>

            <!-- Success Metrics -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
                <div class="text-center">
                    <div class="stats-number text-green-600">40%</div>
                    <p class="text-gray-600 dark:text-gray-300 font-medium">Faster Hiring</p>
                    <p class="text-sm text-gray-500">Average time-to-fill reduced</p>
                </div>
                <div class="text-center">
                    <div class="stats-number text-blue-600">\\$1.2M</div>
                    <p class="text-gray-600 dark:text-gray-300 font-medium">Cost Savings</p>
                    <p class="text-sm text-gray-500">Annual hiring cost reduction</p>
                </div>
                <div class="text-center">
                    <div class="stats-number text-purple-600">85%</div>
                    <p class="text-gray-600 dark:text-gray-300 font-medium">Internal Promotions</p>
                    <p class="text-sm text-gray-500">Increase in successful promotions</p>
                </div>
                <div class="text-center">
                    <div class="stats-number text-orange-600">3x</div>
                    <p class="text-gray-600 dark:text-gray-300 font-medium">ROI</p>
                    <p class="text-sm text-gray-500">Return on investment</p>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <!-- Case Study 1 -->
                <div class="feature-card card p-6 rounded-xl transition-all duration-300 border-l-4 border-green-500">
                    <div class="flex items-center mb-4">
                        <div class="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mr-3">
                            <i class="fas fa-building text-green-600 text-xl"></i>
                        </div>
                        <div>
                            <h3 class="text-lg font-bold">TechCorp Solutions</h3>
                            <p class="text-sm text-gray-500">500+ employees</p>
                        </div>
                    </div>
                    <div class="mb-4">
                        <div class="text-2xl font-bold text-green-600 mb-1">67% faster hiring</div>
                        <p class="text-sm text-gray-600 dark:text-gray-300">Reduced time-to-fill from 89 to 29 days</p>
                    </div>
                    <blockquote class="text-sm italic text-gray-600 dark:text-gray-300 mb-4">
                        "We discovered 15 internal candidates ready for promotion that we never knew existed. The AI found skills in contexts we completely missed."
                    </blockquote>
                    <div class="text-xs text-gray-500">
                        <strong>Key Features Used:</strong> Team Analysis вЂў Skills Matching вЂў Internal Mobility
                    </div>
                </div>
                
                <!-- Case Study 2 -->
                <div class="feature-card card p-6 rounded-xl transition-all duration-300 border-l-4 border-blue-500">
                    <div class="flex items-center mb-4">
                        <div class="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mr-3">
                            <i class="fas fa-rocket text-blue-600 text-xl"></i>
                        </div>
                        <div>
                            <h3 class="text-lg font-bold">StartupX</h3>
                            <p class="text-sm text-gray-500">50+ employees</p>
                        </div>
                    </div>
                    <div class="mb-4">
                        <div class="text-2xl font-bold text-blue-600 mb-1">\\$240K saved</div>
                        <p class="text-sm text-gray-600 dark:text-gray-300">Avoided 3 bad hires in first quarter</p>
                    </div>
                    <blockquote class="text-sm italic text-gray-600 dark:text-gray-300 mb-4">
                        "The gap analysis showed us exactly what skills we needed vs. what candidates actually had. No more expensive hiring mistakes."
                    </blockquote>
                    <div class="text-xs text-gray-500">
                        <strong>Key Features Used:</strong> Resume Parsing вЂў Gap Analysis вЂў Trend Insights
                    </div>
                </div>
                
                <!-- Case Study 3 -->
                <div class="feature-card card p-6 rounded-xl transition-all duration-300 border-l-4 border-purple-500">
                    <div class="flex items-center mb-4">
                        <div class="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center mr-3">
                            <i class="fas fa-university text-purple-600 text-xl"></i>
                        </div>
                        <div>
                            <h3 class="text-lg font-bold">Global Consulting</h3>
                            <p class="text-sm text-gray-500">2000+ employees</p>
                        </div>
                    </div>
                    <div class="mb-4">
                        <div class="text-2xl font-bold text-purple-600 mb-1">3x ROI</div>
                        <p class="text-sm text-gray-600 dark:text-gray-300">\\$1.2M investment returned \\$3.6M value</p>
                    </div>
                    <blockquote class="text-sm italic text-gray-600 dark:text-gray-300 mb-4">
                        "Our learning budget became strategic instead of scattered. People are getting promoted faster and staying longer."
                    </blockquote>
                    <div class="text-xs text-gray-500">
                        <strong>Key Features Used:</strong> Learning Paths вЂў Career Planning вЂў Performance Tracking
                    </div>
                </div>
                
                <!-- API Integration Success -->
                <div class="feature-card card p-6 rounded-xl transition-all duration-300 border-l-4 border-orange-500">
                    <div class="flex items-center mb-4">
                        <div class="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center mr-3">
                            <i class="fas fa-code text-orange-600 text-xl"></i>
                        </div>
                        <div>
                            <h3 class="text-lg font-bold">Developer Integration</h3>
                            <p class="text-sm text-gray-500">Enterprise API</p>
                        </div>
                    </div>
                    <div class="mb-4">
                        <div class="text-2xl font-bold text-orange-600 mb-1">&lt;100ms</div>
                        <p class="text-sm text-gray-600 dark:text-gray-300">Average API response time</p>
                    </div>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span>Authentication & Security</span>
                            <i class="fas fa-check text-green-500"></i>
                        </div>
                        <div class="flex justify-between">
                            <span>Skills Analysis</span>
                            <i class="fas fa-check text-green-500"></i>
                        </div>
                        <div class="flex justify-between">
                            <span>Team Assessment</span>
                            <i class="fas fa-check text-green-500"></i>
                        </div>
                        <div class="flex justify-between">
                            <span>Trend Analysis</span>
                            <i class="fas fa-check text-green-500"></i>
                        </div>
                        <div class="flex justify-between">
                            <span>GDPR Compliance</span>
                            <i class="fas fa-check text-green-500"></i>
                        </div>
                    </div>
                </div>
                
                <!-- Industry Recognition -->
                <div class="feature-card card p-6 rounded-xl transition-all duration-300 border-l-4 border-yellow-500">
                    <div class="flex items-center mb-4">
                        <div class="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center mr-3">
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
                            <span class="text-sm">ISO 27001 Security Certified</span>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-check-circle text-blue-500 mr-2"></i>
                            <span class="text-sm">GDPR Compliant</span>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-clock text-purple-500 mr-2"></i>
                            <span class="text-sm">99.9% Uptime SLA</span>
                        </div>
                    </div>
                </div>
                
                <!-- Customer Satisfaction -->
                <div class="feature-card card p-6 rounded-xl transition-all duration-300 border-l-4 border-pink-500">
                    <div class="flex items-center mb-4">
                        <div class="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/50 flex items-center justify-center mr-3">
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
                            Based on 500+ customer reviews and 2+ years of data
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- How It Works -->
    <section id="how-it-works" class="py-16 bg-light dark:bg-slate-800">
        <div class="container mx-auto px-6">
            <div class="text-center mb-16">
                <h2 class="text-3xl md:text-4xl font-bold mb-4">Discover Your Career Path in 3 Simple Steps</h2>
                <p class="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                    Uncover your skills, identify gaps, and plan your growth journey
                </p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div class="text-center">
                    <div class="w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold mb-6 mx-auto">1</div>
                    <h3 class="text-2xl font-bold mb-4">Upload Your Resume</h3>
                    <div class="bg-white dark:bg-slate-700 p-4 rounded-lg mb-4">
                        <div class="flex items-center justify-center space-x-4 text-sm">
                            <span class="flex items-center"><i class="fas fa-file-pdf text-red-500 mr-1"></i>PDF</span>
                            <span class="flex items-center"><i class="fas fa-file-word text-blue-500 mr-1"></i>Word</span>
                            <span class="flex items-center"><i class="fas fa-file-alt text-green-500 mr-1"></i>Text</span>
                        </div>
                    </div>
                    <p class="text-gray-600 dark:text-gray-300">
                        Simply upload your resume or paste your experience. Our AI extracts your skills and analyzes your career potential.
                    </p>
                </div>
                
                <div class="text-center">
                    <div class="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold mb-6 mx-auto">2</div>
                    <h3 class="text-2xl font-bold mb-4">AI Analyzes Your Skills</h3>
                    <div class="bg-white dark:bg-slate-700 p-4 rounded-lg mb-4">
                        <div class="flex justify-center items-center">
                            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                            <span class="ml-2 text-sm">Analyzing...</span>
                        </div>
                        <div class="text-xs text-gray-500 mt-2">Average processing time: &lt;30 seconds</div>
                    </div>
                    <p class="text-gray-600 dark:text-gray-300">
                        Our AI identifies your current skills, discovers hidden strengths, and reveals opportunities for growth.
                    </p>
                </div>
                
                <div class="text-center">
                    <div class="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold mb-6 mx-auto">3</div>
                    <h3 class="text-2xl font-bold mb-4">Get Your Career Roadmap</h3>
                    <div class="bg-white dark:bg-slate-700 p-4 rounded-lg mb-4">
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
                    <p class="text-gray-600 dark:text-gray-300">
                        Receive personalized career paths with clear milestones, skill gaps to fill, and timeline estimates.
                    </p>
                </div>
            </div>

            <div class="mt-16 text-center">
                <div class="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-8">
                    <h3 class="text-2xl font-bold mb-4">Ready to see it in action?</h3>
                    <p class="text-gray-600 dark:text-gray-300 mb-6">
                        Try our interactive demo with sample data or start your free trial with your own team.
                    </p>
                    <div class="flex flex-wrap justify-center gap-4">
                        <button class="bg-primary hover:bg-blue-800 text-white font-semibold py-3 px-8 rounded-lg transition duration-300">
                            Try Interactive Demo
                        </button>
                        <button class="bg-accent hover:bg-teal-600 text-white font-semibold py-3 px-8 rounded-lg transition duration-300">
                            Start Free Trial
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Call to Action Section -->
    <section id="api" class="py-16 bg-gradient-to-r from-primary to-accent text-white">
        <div class="container mx-auto px-6">
            <div class="text-center mb-12">
                <span class="bg-white/20 text-white text-sm font-semibold px-3 py-1 rounded-full">Take Action</span>
                <h2 class="text-3xl md:text-4xl font-bold mt-4 mb-6">
                    Ready to Transform Your Career?
                </h2>
                <p class="text-xl text-white/90 max-w-3xl mx-auto mb-8">
                    Join thousands of professionals using our AI-powered skills intelligence to accelerate their career growth.
                </p>
            </div>

            <div class="max-w-2xl mx-auto mb-12">
                <div class="bg-white/10 backdrop-blur-sm rounded-xl p-8">
                    <div class="text-center mb-6">
                        <div class="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-rocket text-white text-2xl"></i>
                        </div>
                        <h3 class="text-2xl font-bold mb-4">For Job Seekers & Professionals</h3>
                        <p class="text-white/90 mb-6">
                            Take control of your career growth with AI-powered insights tailored to your unique skills and goals.
                        </p>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <div class="space-y-3">
                            <div class="flex items-center">
                                <i class="fas fa-check text-green-300 mr-2"></i>
                                <span>Comprehensive Skills Analysis</span>
                            </div>
                            <div class="flex items-center">
                                <i class="fas fa-check text-green-300 mr-2"></i>
                                <span>Hidden Strengths Discovery</span>
                            </div>
                            <div class="flex items-center">
                                <i class="fas fa-check text-green-300 mr-2"></i>
                                <span>Career Path Recommendations</span>
                            </div>
                        </div>
                        <div class="space-y-3">
                            <div class="flex items-center">
                                <i class="fas fa-check text-green-300 mr-2"></i>
                                <span>Skill Gap Identification</span>
                            </div>
                            <div class="flex items-center">
                                <i class="fas fa-check text-green-300 mr-2"></i>
                                <span>Learning Path Guidance</span>
                            </div>
                            <div class="flex items-center">
                                <i class="fas fa-check text-green-300 mr-2"></i>
                                <span>Industry Trend Insights</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col sm:flex-row gap-4">
                        <button class="flex-1 bg-white text-primary font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition duration-300">
                            Try It Free Now
                        </button>
                        <a href="#api" class="flex-1 bg-transparent border-2 border-white text-white font-semibold py-3 px-6 rounded-lg hover:bg-white hover:text-primary transition duration-300 text-center">
                            API Access for Developers
                        </a>
                    </div>
                </div>
            </div>

            <div class="text-center">
                <div class="flex flex-wrap justify-center items-center gap-8 mb-8">
                    <div class="flex items-center">
                        <i class="fas fa-clock text-white/70 mr-2"></i>
                        <span class="text-white/90">5-minute setup</span>
                    </div>
                    <div class="flex items-center">
                        <i class="fas fa-shield-alt text-white/70 mr-2"></i>
                        <span class="text-white/90">Enterprise security</span>
                    </div>
                    <div class="flex items-center">
                        <i class="fas fa-headset text-white/70 mr-2"></i>
                        <span class="text-white/90">24/7 support</span>
                    </div>
                    <div class="flex items-center">
                        <i class="fas fa-money-bill-wave text-white/70 mr-2"></i>
                        <span class="text-white/90">No setup fees</span>
                    </div>
                </div>
                
                <p class="text-white/70 text-sm">
                    Trusted by Fortune 500 companies вЂў SOC 2 compliant вЂў 99.9% uptime SLA
                </p>
            </div>
        </div>
    </section>

    <!-- Why Choose Clearsight IP -->
    <section class="py-16">
        <div class="container mx-auto px-6">
            <div class="text-center mb-16">
                <h2 class="text-3xl md:text-4xl font-bold mb-4">Why Choose Clearsight IP</h2>
                <p class="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                    The smartest way to understand your skills and accelerate your career
                </p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div class="card p-6 rounded-xl">
                    <div class="w-16 h-16 mb-4 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                        <i class="fas fa-microscope text-green-600 text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-3">Deep Skills Analysis</h3>
                    <p class="text-gray-600 dark:text-gray-300">Go beyond keywords. Our AI understands context, projects, and real-world application of your skills.</p>
                </div>
                
                <div class="card p-6 rounded-xl">
                    <div class="w-16 h-16 mb-4 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                        <i class="fas fa-gem text-blue-600 text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-3">Hidden Talent Discovery</h3>
                    <p class="text-gray-600 dark:text-gray-300">Uncover skills you didn't know you had. Find transferable abilities that open new career doors.</p>
                </div>
                
                <div class="card p-6 rounded-xl">
                    <div class="w-16 h-16 mb-4 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center">
                        <i class="fas fa-map-marked-alt text-purple-600 text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-3">Personalized Roadmaps</h3>
                    <p class="text-gray-600 dark:text-gray-300">Get custom career paths based on your goals, with clear steps and realistic timelines.</p>
                </div>
                
                <div class="card p-6 rounded-xl">
                    <div class="w-16 h-16 mb-4 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center">
                        <i class="fas fa-chart-line text-orange-600 text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-3">Market Intelligence</h3>
                    <p class="text-gray-600 dark:text-gray-300">Stay ahead with real-time insights on in-demand skills and emerging industry trends.</p>
                </div>
                
                <div class="card p-6 rounded-xl">
                    <div class="w-16 h-16 mb-4 bg-teal-100 dark:bg-teal-900/50 rounded-full flex items-center justify-center">
                        <i class="fas fa-bolt text-teal-600 text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-3">Instant Results</h3>
                    <p class="text-gray-600 dark:text-gray-300">No waiting days for feedback. Get comprehensive analysis in under 30 seconds.</p>
                </div>
                
                <div class="card p-6 rounded-xl">
                    <div class="w-16 h-16 mb-4 bg-pink-100 dark:bg-pink-900/50 rounded-full flex items-center justify-center">
                        <i class="fas fa-shield-alt text-pink-600 text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-3">Privacy First</h3>
                    <p class="text-gray-600 dark:text-gray-300">Your data is never stored permanently. Complete analysis with full privacy protection.</p>
                </div>
            </div>
        </div>
    </section>


    <!-- Pricing -->
    <section id="pricing" class="py-16">
        <div class="container mx-auto px-6">
            <div class="text-center mb-16">
                <h2 class="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
                <p class="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                    Choose the plan that fits your needs
                </p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <!-- Developer Plan -->
                <div class="pricing-card card p-8 rounded-xl text-center">
                    <h3 class="text-2xl font-bold mb-2">Developer</h3>
                    <div class="mb-6">
                        <span class="text-4xl font-bold">\\$0</span>
                        <span class="text-gray-600 dark:text-gray-300">/month</span>
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
                    <button class="w-full bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-primary dark:text-accent font-semibold py-3 px-4 rounded-lg transition duration-300">
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
                        <span class="text-4xl font-bold">\\$99</span>
                        <span class="text-gray-600 dark:text-gray-300">/month</span>
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
                    <button class="w-full bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-primary dark:text-accent font-semibold py-3 px-4 rounded-lg transition duration-300">
                        Contact Sales
                    </button>
                </div>
            </div>
        </div>
    </section>

    <!-- Trust & Security -->
    <section class="py-16 bg-light dark:bg-slate-800">
        <div class="container mx-auto px-6">
            <div class="text-center mb-12">
                <h2 class="text-3xl md:text-4xl font-bold mb-4">Your Privacy Matters</h2>
                <p class="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                    We protect your data with enterprise-grade security
                </p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div class="text-center">
                    <div class="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-trash-alt text-green-600 text-2xl"></i>
                    </div>
                    <h3 class="font-bold mb-2">No Data Storage</h3>
                    <p class="text-gray-600 dark:text-gray-300 text-sm">Your resume and personal data are never permanently stored</p>
                </div>
                
                <div class="text-center">
                    <div class="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-lock text-blue-600 text-2xl"></i>
                    </div>
                    <h3 class="font-bold mb-2">Encrypted Processing</h3>
                    <p class="text-gray-600 dark:text-gray-300 text-sm">End-to-end encryption for all data transmission</p>
                </div>
                
                <div class="text-center">
                    <div class="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-gavel text-purple-600 text-2xl"></i>
                    </div>
                    <h3 class="font-bold mb-2">GDPR Compliant</h3>
                    <p class="text-gray-600 dark:text-gray-300 text-sm">Full compliance with global privacy regulations</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Live Demo -->
    <section class="py-16">
        <div class="container mx-auto px-6">
            <div class="text-center mb-16">
                <h2 class="text-3xl md:text-4xl font-bold mb-4">Live Demo</h2>
                <p class="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                    Experience skill gap analysis in action
                </p>
            </div>
            
            <div class="max-w-4xl mx-auto">
                <div class="card demo-box rounded-xl p-6">
                    <div class="mb-6">
                        <label class="block text-gray-700 dark:text-gray-300 font-medium mb-2" for="resume-input">
                            Paste Sample Resume Text
                        </label>
                        <textarea id="resume-input" class="w-full h-40 p-4 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100" placeholder="Paste your resume text here...">Software Engineer with 5 years of experience in web development. Proficient in JavaScript, React, Node.js, and MongoDB. Experienced with AWS cloud services and Docker containerization. Bachelor's degree in Computer Science from MIT. Seeking opportunities to work on challenging projects that leverage cutting-edge technologies.</textarea>
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
        // Theme toggle functionality
        const themeToggle = document.getElementById('theme-toggle');
        const body = document.body;
        const themeIcon = themeToggle.querySelector('i');
        
        // Check for saved theme preference or respect OS setting
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
        const currentTheme = localStorage.getItem('theme');
        
        if (currentTheme === 'dark' || (!currentTheme && prefersDarkScheme.matches)) {
            body.classList.add('dark-mode');
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
        
        themeToggle.addEventListener('click', function() {
            body.classList.toggle('dark-mode');
            
            if (body.classList.contains('dark-mode')) {
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
                localStorage.setItem('theme', 'dark');
            } else {
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
                localStorage.setItem('theme', 'light');
            }
        });
        
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
</html>

`;