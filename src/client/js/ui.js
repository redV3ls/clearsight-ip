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
        console.log('Rendering main content sections...');

        try {
            const hero = this.renderHeroSection();
            const features = this.renderFeaturesSection();
            const howItWorks = this.renderHowItWorksSection();
            const pricing = this.renderPricingSection();
            const demo = this.renderDemoSection();
            const footer = this.renderFooter();

            console.log('All sections rendered successfully');

            return `
                ${hero}
                ${features}
                ${howItWorks}
                ${pricing}
                ${demo}
                ${footer}
            `;
        } catch (error) {
            console.error('Error rendering main content:', error);
            return this.renderHeroSection(); // Fallback to just hero section
        }
    }

    static renderHeroSection() {
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

    static renderFeaturesSection() {
        return `
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
        `;
    }

    static renderHowItWorksSection() {
        return `
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
        `;
    }

    static renderPricingSection() {
        return `
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
        `;
    }

    static renderDemoSection() {
        // Updated demo section with examples instead of demo button
        return `
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
        `;
    }

    static renderFooter() {
        return `
            <footer class="bg-slate-800 border-t border-slate-700 py-12">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="grid md:grid-cols-4 gap-8">
                        <div>
                            <h3 class="text-xl font-bold text-primary mb-4">Clearsight IP</h3>
                            <p class="text-gray-300 mb-4">
                                Bridge your skills gap with AI-powered insights and accelerate your career growth.
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
            <!-- Include tabbed interface CSS -->
            <link rel="stylesheet" href="/css/tabbed-interface.css">
            
            <div id="analysisInterface" class="hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div id="analysisContent" class="bg-slate-800 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
                    <!-- Tabbed interface will be injected here by JavaScript -->
                    <div id="tabbedInterfaceContainer"></div>
                    
                    <!-- Fallback content for when tabbed interface fails to load -->
                    <div id="fallbackContent" class="p-6 hidden">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-2xl font-bold text-primary">AI-Powered Skills Analysis</h2>
                            <button id="closeAnalysisInterface" class="text-gray-400 hover:text-white">
                                <i class="fas fa-times text-xl"></i>
                            </button>
                        </div>

                        <div id="uploadSection" class="space-y-6">
                            <div>
                                <label class="block text-lg font-semibold text-gray-200 mb-3">
                                    <i class="fas fa-file-alt mr-2 text-primary"></i>Upload Your CV/Resume
                                </label>
                                <div id="cvDropZone" class="border-2 border-dashed border-gray-600 hover:border-primary rounded-lg p-8 text-center cursor-pointer transition-colors">
                                    <i class="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
                                    <p class="text-gray-300 mb-2">Drop your CV here or click to browse</p>
                                    <p class="text-sm text-gray-500">PDF, DOC, DOCX, or TXT (max 5MB)</p>
                                </div>
                                <input type="file" id="cvFileInput" class="hidden" accept=".pdf,.doc,.docx,.txt">
                                <div id="cvFileInfo" class="hidden mt-3 p-3 bg-slate-700 rounded-lg flex items-center justify-between">
                                    <div class="flex items-center">
                                        <i class="fas fa-file text-primary mr-2"></i>
                                        <span id="cvFileName" class="text-gray-200"></span>
                                    </div>
                                    <button id="clearCvBtn" class="text-red-400 hover:text-red-300">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label class="block text-lg font-semibold text-gray-200 mb-3">
                                    <i class="fas fa-briefcase mr-2 text-primary"></i>Job Description (Optional)
                                </label>
                                <div id="jobDropZone" class="border-2 border-dashed border-gray-600 hover:border-primary rounded-lg p-6 text-center cursor-pointer transition-colors">
                                    <i class="fas fa-briefcase text-3xl text-gray-400 mb-3"></i>
                                    <p class="text-gray-300 mb-2">Drop job description or click to browse</p>
                                    <p class="text-sm text-gray-500">Optional - for targeted analysis</p>
                                </div>
                                <input type="file" id="jobFileInput" class="hidden" accept=".pdf,.doc,.docx,.txt">
                                <div id="jobFileInfo" class="hidden mt-3 p-3 bg-slate-700 rounded-lg flex items-center justify-between">
                                    <div class="flex items-center">
                                        <i class="fas fa-file text-primary mr-2"></i>
                                        <span id="jobFileName" class="text-gray-200"></span>
                                    </div>
                                    <button id="clearJobBtn" class="text-red-400 hover:text-red-300">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>

                            <div id="analysisError" class="hidden bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                                <p class="text-red-300"></p>
                            </div>

                            <div class="flex justify-end space-x-4">
                                <button id="cancelAnalysisBtn" class="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:border-gray-500 transition-colors">
                                    Cancel
                                </button>
                                <button id="startAnalysisBtn" class="px-6 py-3 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors">
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