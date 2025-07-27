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
                    <span class="text-red-600">73% of companies</span> struggle to identify skill gaps, costing them <span class="gradient-text">$1.2M annually</span> in missed opportunities
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
                                <strong>The Hidden Costs:</strong> 6 months average time-to-productivity for new hires • 40% of internal promotions fail due to skill misalignment • $15K average cost per bad hire
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
                                <span class="text-sm font-bold text-orange-600">$240K</span>
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
                    <div class="stats-number text-blue-600">$1.2M</div>
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
                        <strong>Key Features Used:</strong> Team Analysis • Skills Matching • Internal Mobility
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
                        <div class="text-2xl font-bold text-blue-600 mb-1">$240K saved</div>
                        <p class="text-sm text-gray-600 dark:text-gray-300">Avoided 3 bad hires in first quarter</p>
                    </div>
                    <blockquote class="text-sm italic text-gray-600 dark:text-gray-300 mb-4">
                        "The gap analysis showed us exactly what skills we needed vs. what candidates actually had. No more expensive hiring mistakes."
                    </blockquote>
                    <div class="text-xs text-gray-500">
                        <strong>Key Features Used:</strong> Resume Parsing • Gap Analysis • Trend Insights
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
                        <p class="text-sm text-gray-600 dark:text-gray-300">$1.2M investment returned $3.6M value</p>
                    </div>
                    <blockquote class="text-sm italic text-gray-600 dark:text-gray-300 mb-4">
                        "Our learning budget became strategic instead of scattered. People are getting promoted faster and staying longer."
                    </blockquote>
                    <div class="text-xs text-gray-500">
                        <strong>Key Features Used:</strong> Learning Paths • Career Planning • Performance Tracking
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
