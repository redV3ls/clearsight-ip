// Results Tabs Component
window.ResultsTabs = {
    async renderOverview(data) {
        const container = document.getElementById('overviewTab');
        if (!container) return;

        const overallFit = this.calculateOverallFit(data);
        
        container.innerHTML = `
            <div class="space-y-6 animate-fade-in">
                <!-- Overall Fit Gauge -->
                <div class="text-center mb-8">
                    <div class="fit-gauge mx-auto mb-4">
                        <svg width="128" height="128" viewBox="0 0 128 128">
                            <circle cx="64" cy="64" r="56" class="gauge-bg"></circle>
                            <circle cx="64" cy="64" r="56" class="gauge-fill" 
                                stroke-dasharray="${this.getGaugeStrokeDasharray(overallFit)}"
                                stroke-dashoffset="0" transform="rotate(-90 64 64)"></circle>
                            <text x="64" y="64" text-anchor="middle" dy="0.3em" class="gauge-text">
                                ${overallFit}%
                            </text>
                        </svg>
                    </div>
                    <h3 class="text-2xl font-bold text-white mb-2">Overall Fit Score</h3>
                    <p class="text-gray-400">Based on skills, experience, and job requirements</p>
                </div>

                <!-- Summary Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    ${this.renderSummaryCard('Fit Score', `${overallFit}%`, this.getFitScoreColor(overallFit), 'fas fa-bullseye')}
                    ${this.renderSummaryCard('Skills Match', `${data.skillsMatch || 75}%`, 'text-blue-400', 'fas fa-cogs')}
                    ${this.renderSummaryCard('Experience', `${data.experienceMatch || 80}%`, 'text-green-400', 'fas fa-briefcase')}
                    ${this.renderSummaryCard('Keywords', `${data.keywordCoverage || 65}%`, 'text-purple-400', 'fas fa-tags')}
                </div>

                <!-- Key Insights -->
                <div class="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <h4 class="text-lg font-semibold text-white mb-4 flex items-center">
                        <i class="fas fa-lightbulb text-primary mr-2"></i>
                        Key Insights
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h5 class="font-medium text-green-400 mb-2">Strengths</h5>
                            <ul class="space-y-1 text-sm text-gray-300">
                                ${this.renderInsightsList(data.strengths || [
                                    'Strong technical background',
                                    'Relevant industry experience',
                                    'Leadership skills demonstrated'
                                ])}
                            </ul>
                        </div>
                        <div>
                            <h5 class="font-medium text-red-400 mb-2">Areas for Improvement</h5>
                            <ul class="space-y-1 text-sm text-gray-300">
                                ${this.renderInsightsList(data.improvements || [
                                    'Cloud platform certifications',
                                    'Agile methodology experience',
                                    'Data analysis skills'
                                ])}
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- What to Fix First -->
                <div class="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <h4 class="text-lg font-semibold text-white mb-4 flex items-center">
                        <i class="fas fa-wrench text-primary mr-2"></i>
                        What to Fix First
                    </h4>
                    <div class="space-y-4">
                        ${this.renderPriorityFixes(data.priorityFixes || [
                            { fix: 'Add cloud platform certifications', impact: 'High', effort: 'Medium' },
                            { fix: 'Include quantified achievements', impact: 'High', effort: 'Low' },
                            { fix: 'Optimize for ATS keywords', impact: 'Medium', effort: 'Low' }
                        ])}
                    </div>
                </div>

                <!-- Explain Score -->
                <div class="bg-slate-800 rounded-lg border border-slate-700">
                    <button class="explain-score-toggle w-full flex items-center justify-between p-6 text-left hover:bg-slate-700/50 transition-colors">
                        <div class="flex items-center">
                            <i class="fas fa-question-circle text-primary mr-3"></i>
                            <span class="font-semibold text-white">Explain This Score</span>
                        </div>
                        <i class="fas fa-chevron-down transform transition-transform"></i>
                    </button>
                    <div class="explain-score-content hidden p-6 pt-0 border-t border-slate-700">
                        <div class="space-y-4 text-sm text-gray-300">
                            <div>
                                <h6 class="font-medium text-white mb-2">Scoring Methodology</h6>
                                <ul class="space-y-1 list-disc list-inside">
                                    <li>Skills Match (40%): Technical and soft skills alignment</li>
                                    <li>Experience Level (30%): Years and relevance of experience</li>
                                    <li>Keyword Coverage (20%): Job description keyword matching</li>
                                    <li>Industry Fit (10%): Sector-specific experience</li>
                                </ul>
                            </div>
                            <div>
                                <h6 class="font-medium text-white mb-2">Your Weights Applied</h6>
                                <div class="grid grid-cols-2 gap-4">
                                    <div>Skills Priority: <span class="text-primary font-medium">${this.getWeightLabel(window.analysisWorkspace?.weights?.skills || 4)}</span></div>
                                    <div>Experience: <span class="text-primary font-medium">${this.getWeightLabel(window.analysisWorkspace?.weights?.experience || 3)}</span></div>
                                    <div>Location: <span class="text-primary font-medium">${this.getWeightLabel(window.analysisWorkspace?.weights?.location || 2)}</span></div>
                                    <div>Seniority: <span class="text-primary font-medium">${this.getWeightLabel(window.analysisWorkspace?.weights?.seniority || 3)}</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Export Actions -->
                <div class="flex flex-wrap gap-3 pt-4">
                    <button class="export-btn bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-lg transition-colors" data-format="pdf">
                        <i class="fas fa-file-pdf mr-2"></i>Export PDF
                    </button>
                    <button class="export-btn bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg transition-colors" data-format="csv">
                        <i class="fas fa-file-csv mr-2"></i>Export CSV
                    </button>
                    <button class="export-btn bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg transition-colors" data-format="copy">
                        <i class="fas fa-copy mr-2"></i>Copy Summary
                    </button>
                </div>
            </div>
        `;

        this.setupOverviewInteractions();
    },

    async renderSkillsGap(data) {
        const container = document.getElementById('skillsGapTab');
        if (!container) return;

        container.innerHTML = `
            <div class="space-y-6 animate-fade-in">
                <!-- Skills Overview -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Skill Coverage Chart -->
                    <div class="chart-container">
                        <h4 class="text-lg font-semibold text-white mb-4">Skill Coverage</h4>
                        <div id="skillCoverageChart" class="h-64"></div>
                    </div>
                    
                    <!-- Competency Radar -->
                    <div class="chart-container">
                        <h4 class="text-lg font-semibold text-white mb-4">Competency Areas</h4>
                        <div id="competencyRadar" class="h-64"></div>
                    </div>
                </div>

                <!-- Skills Breakdown -->
                <div class="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <h4 class="text-lg font-semibold text-white mb-4">Skills Analysis</h4>
                    
                    <!-- Filter Chips -->
                    <div class="flex flex-wrap gap-2 mb-6">
                        <button class="skill-filter active" data-filter="all">All Skills</button>
                        <button class="skill-filter" data-filter="matched">Matched</button>
                        <button class="skill-filter" data-filter="partial">Partial</button>
                        <button class="skill-filter" data-filter="missing">Missing</button>
                    </div>

                    <!-- Skills Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${this.renderSkillsGrid(data.skills || this.getMockSkills())}
                    </div>
                </div>

                <!-- Skill Recommendations -->
                <div class="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <h4 class="text-lg font-semibold text-white mb-4 flex items-center">
                        <i class="fas fa-graduation-cap text-primary mr-2"></i>
                        Recommended Skills to Learn
                    </h4>
                    <div class="space-y-4">
                        ${this.renderSkillRecommendations(data.skillRecommendations || [
                            { skill: 'AWS Cloud Architecture', priority: 'High', timeToLearn: '2-3 months', resources: ['AWS Training', 'Coursera'] },
                            { skill: 'Docker & Kubernetes', priority: 'High', timeToLearn: '1-2 months', resources: ['Docker Docs', 'Kubernetes.io'] },
                            { skill: 'Data Analysis with Python', priority: 'Medium', timeToLearn: '2-4 weeks', resources: ['Pandas Tutorial', 'Kaggle Learn'] }
                        ])}
                    </div>
                </div>
            </div>
        `;

        this.setupSkillsInteractions();
        this.renderSkillCharts(data);
    },

    async renderEvidence(data) {
        const container = document.getElementById('evidenceTab');
        if (!container) return;

        container.innerHTML = `
            <div class="space-y-6 animate-fade-in">
                <!-- Coverage Heatmap -->
                <div class="chart-container">
                    <h4 class="text-lg font-semibold text-white mb-4">Coverage Heatmap</h4>
                    <div id="coverageHeatmap" class="h-64"></div>
                </div>

                <!-- Evidence Table -->
                <div class="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                    <div class="p-6 border-b border-slate-700">
                        <h4 class="text-lg font-semibold text-white">Evidence Matching</h4>
                        <p class="text-gray-400 text-sm mt-1">Side-by-side comparison of job requirements and CV evidence</p>
                    </div>
                    
                    <div class="overflow-x-auto">
                        <table class="evidence-table">
                            <thead>
                                <tr>
                                    <th class="w-1/3">Job Requirement</th>
                                    <th class="w-1/3">CV Evidence</th>
                                    <th class="w-1/6">Match</th>
                                    <th class="w-1/6">Confidence</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.renderEvidenceRows(data.evidence || this.getMockEvidence())}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Citation Snippets -->
                <div class="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <h4 class="text-lg font-semibold text-white mb-4 flex items-center">
                        <i class="fas fa-quote-left text-primary mr-2"></i>
                        Supporting Citations
                    </h4>
                    <div class="space-y-4">
                        ${this.renderCitations(data.citations || [
                            { text: "Led a team of 8 developers in implementing microservices architecture", requirement: "Leadership experience", confidence: 95 },
                            { text: "Reduced system latency by 40% through database optimization", requirement: "Performance optimization", confidence: 88 },
                            { text: "Implemented CI/CD pipelines using Jenkins and Docker", requirement: "DevOps experience", confidence: 92 }
                        ])}
                    </div>
                </div>
            </div>
        `;

        this.setupEvidenceInteractions();
        this.renderCoverageHeatmap(data);
    },

    async renderRecommendations(data) {
        const container = document.getElementById('recommendationsTab');
        if (!container) return;

        container.innerHTML = `
            <div class="space-y-6 animate-fade-in">
                <!-- Career Path Recommendations -->
                <div class="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <h4 class="text-lg font-semibold text-white mb-4 flex items-center">
                        <i class="fas fa-route text-primary mr-2"></i>
                        Career Path Recommendations
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${this.renderCareerPaths(data.careerPaths || [
                            { title: 'Senior Software Engineer', match: 85, timeframe: '6-12 months', requirements: ['AWS Certification', 'Team Leadership'] },
                            { title: 'Technical Lead', match: 78, timeframe: '12-18 months', requirements: ['Architecture Design', 'Mentoring'] },
                            { title: 'DevOps Engineer', match: 72, timeframe: '8-14 months', requirements: ['Kubernetes', 'Infrastructure as Code'] }
                        ])}
                    </div>
                </div>

                <!-- Resume Improvements -->
                <div class="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <h4 class="text-lg font-semibold text-white mb-4 flex items-center">
                        <i class="fas fa-edit text-primary mr-2"></i>
                        Resume Improvements
                    </h4>
                    <div class="space-y-4">
                        ${this.renderResumeImprovements(data.resumeImprovements || [
                            { section: 'Professional Summary', suggestion: 'Add quantified achievements and specific technologies', impact: 'High' },
                            { section: 'Skills Section', suggestion: 'Group skills by category and add proficiency levels', impact: 'Medium' },
                            { section: 'Work Experience', suggestion: 'Use action verbs and include measurable results', impact: 'High' }
                        ])}
                    </div>
                </div>

                <!-- Industry Insights -->
                <div class="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <h4 class="text-lg font-semibold text-white mb-4 flex items-center">
                        <i class="fas fa-chart-line text-primary mr-2"></i>
                        Industry Insights
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h5 class="font-medium text-white mb-3">Trending Skills</h5>
                            <div class="space-y-2">
                                ${this.renderTrendingSkills([
                                    { skill: 'AI/Machine Learning', growth: '+45%' },
                                    { skill: 'Cloud Architecture', growth: '+38%' },
                                    { skill: 'Cybersecurity', growth: '+32%' }
                                ])}
                            </div>
                        </div>
                        <div>
                            <h5 class="font-medium text-white mb-3">Salary Insights</h5>
                            <div class="space-y-2 text-sm text-gray-300">
                                <div class="flex justify-between">
                                    <span>Current Role Range:</span>
                                    <span class="text-primary font-medium">$85K - $120K</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Target Role Range:</span>
                                    <span class="text-green-400 font-medium">$110K - $150K</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Potential Increase:</span>
                                    <span class="text-green-400 font-medium">+25-30%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Learning Resources -->
                <div class="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <h4 class="text-lg font-semibold text-white mb-4 flex items-center">
                        <i class="fas fa-book text-primary mr-2"></i>
                        Recommended Learning Resources
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${this.renderLearningResources([
                            { title: 'AWS Solutions Architect', provider: 'AWS Training', type: 'Certification', duration: '40 hours' },
                            { title: 'Kubernetes Fundamentals', provider: 'Linux Foundation', type: 'Course', duration: '20 hours' },
                            { title: 'System Design Interview', provider: 'Educative', type: 'Course', duration: '15 hours' }
                        ])}
                    </div>
                </div>
            </div>
        `;

        this.setupRecommendationsInteractions();
    },

    async renderATSChecks(data) {
        const container = document.getElementById('atsChecksTab');
        if (!container) return;

        const atsScore = data.atsScore || 72;
        
        container.innerHTML = `
            <div class="space-y-6 animate-fade-in">
                <!-- ATS Score Overview -->
                <div class="text-center mb-8">
                    <div class="fit-gauge mx-auto mb-4">
                        <svg width="128" height="128" viewBox="0 0 128 128">
                            <circle cx="64" cy="64" r="56" class="gauge-bg"></circle>
                            <circle cx="64" cy="64" r="56" class="gauge-fill" 
                                stroke-dasharray="${this.getGaugeStrokeDasharray(atsScore)}"
                                stroke-dashoffset="0" transform="rotate(-90 64 64)"></circle>
                            <text x="64" y="64" text-anchor="middle" dy="0.3em" class="gauge-text">
                                ${atsScore}%
                            </text>
                        </svg>
                    </div>
                    <h3 class="text-2xl font-bold text-white mb-2">ATS Compatibility Score</h3>
                    <p class="text-gray-400">How well your resume will perform with Applicant Tracking Systems</p>
                </div>

                <!-- ATS Checklist -->
                <div class="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <h4 class="text-lg font-semibold text-white mb-4 flex items-center">
                        <i class="fas fa-robot text-primary mr-2"></i>
                        ATS Optimization Checklist
                    </h4>
                    <div class="space-y-3">
                        ${this.renderATSChecklist(data.atsChecks || [
                            { check: 'Standard section headings used', status: 'pass', description: 'Uses common headings like "Experience", "Education"' },
                            { check: 'No images or graphics', status: 'pass', description: 'Text-only format for better parsing' },
                            { check: 'Consistent date formatting', status: 'warning', description: 'Some dates use different formats' },
                            { check: 'Keywords from job description', status: 'fail', description: 'Missing 40% of important keywords' },
                            { check: 'Standard file format', status: 'pass', description: 'PDF or Word document format' },
                            { check: 'No tables or columns', status: 'warning', description: 'Complex formatting may cause parsing issues' }
                        ])}
                    </div>
                </div>

                <!-- Keyword Analysis -->
                <div class="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <h4 class="text-lg font-semibold text-white mb-4 flex items-center">
                        <i class="fas fa-search text-primary mr-2"></i>
                        Keyword Analysis
                    </h4>
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h5 class="font-medium text-green-400 mb-3">Found Keywords</h5>
                            <div class="flex flex-wrap gap-2">
                                ${this.renderKeywordChips([
                                    'JavaScript', 'React', 'Node.js', 'AWS', 'Docker', 'Git', 'Agile', 'REST API'
                                ], 'found')}
                            </div>
                        </div>
                        <div>
                            <h5 class="font-medium text-red-400 mb-3">Missing Keywords</h5>
                            <div class="flex flex-wrap gap-2">
                                ${this.renderKeywordChips([
                                    'Kubernetes', 'TypeScript', 'GraphQL', 'Microservices', 'CI/CD', 'Terraform'
                                ], 'missing')}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Formatting Issues -->
                <div class="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <h4 class="text-lg font-semibold text-white mb-4 flex items-center">
                        <i class="fas fa-exclamation-triangle text-yellow-400 mr-2"></i>
                        Formatting Issues
                    </h4>
                    <div class="space-y-4">
                        ${this.renderFormattingIssues(data.formattingIssues || [
                            { issue: 'Inconsistent bullet points', severity: 'medium', fix: 'Use consistent bullet point style throughout' },
                            { issue: 'Mixed date formats', severity: 'low', fix: 'Standardize all dates to MM/YYYY format' },
                            { issue: 'Long paragraphs', severity: 'high', fix: 'Break long paragraphs into bullet points' }
                        ])}
                    </div>
                </div>

                <!-- ATS-Friendly Template -->
                <div class="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <h4 class="text-lg font-semibold text-white mb-4 flex items-center">
                        <i class="fas fa-file-alt text-primary mr-2"></i>
                        ATS-Friendly Resume Tips
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h5 class="font-medium text-green-400 mb-3">Do</h5>
                            <ul class="space-y-2 text-sm text-gray-300">
                                <li class="flex items-start">
                                    <i class="fas fa-check text-green-400 mr-2 mt-1 text-xs"></i>
                                    Use standard section headings
                                </li>
                                <li class="flex items-start">
                                    <i class="fas fa-check text-green-400 mr-2 mt-1 text-xs"></i>
                                    Include relevant keywords naturally
                                </li>
                                <li class="flex items-start">
                                    <i class="fas fa-check text-green-400 mr-2 mt-1 text-xs"></i>
                                    Use simple, clean formatting
                                </li>
                                <li class="flex items-start">
                                    <i class="fas fa-check text-green-400 mr-2 mt-1 text-xs"></i>
                                    Save as PDF or Word document
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h5 class="font-medium text-red-400 mb-3">Don't</h5>
                            <ul class="space-y-2 text-sm text-gray-300">
                                <li class="flex items-start">
                                    <i class="fas fa-times text-red-400 mr-2 mt-1 text-xs"></i>
                                    Use images, graphics, or charts
                                </li>
                                <li class="flex items-start">
                                    <i class="fas fa-times text-red-400 mr-2 mt-1 text-xs"></i>
                                    Include tables or complex layouts
                                </li>
                                <li class="flex items-start">
                                    <i class="fas fa-times text-red-400 mr-2 mt-1 text-xs"></i>
                                    Use unusual fonts or colors
                                </li>
                                <li class="flex items-start">
                                    <i class="fas fa-times text-red-400 mr-2 mt-1 text-xs"></i>
                                    Stuff keywords unnaturally
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupATSInteractions();
    },

    // Helper methods
    calculateOverallFit(data) {
        // Calculate based on various factors and weights
        const weights = window.analysisWorkspace?.weights || { skills: 4, experience: 3, location: 2, seniority: 3 };
        const skillsScore = data.skillsMatch || 75;
        const experienceScore = data.experienceMatch || 80;
        const keywordScore = data.keywordCoverage || 65;
        
        const totalWeight = weights.skills + weights.experience + weights.seniority;
        const weightedScore = (
            (skillsScore * weights.skills) +
            (experienceScore * weights.experience) +
            (keywordScore * weights.seniority)
        ) / totalWeight;
        
        return Math.round(weightedScore);
    },

    getGaugeStrokeDasharray(percentage) {
        const circumference = 2 * Math.PI * 56; // radius = 56
        const strokeLength = (percentage / 100) * circumference;
        return `${strokeLength} ${circumference}`;
    },

    getFitScoreColor(score) {
        if (score >= 80) return 'text-green-400';
        if (score >= 60) return 'text-yellow-400';
        return 'text-red-400';
    },

    getWeightLabel(weight) {
        const labels = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
        return labels[weight - 1] || 'Medium';
    },

    renderSummaryCard(title, value, colorClass, icon) {
        return `
            <div class="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <div class="flex items-center justify-between mb-2">
                    <i class="${icon} ${colorClass}"></i>
                    <span class="text-2xl font-bold ${colorClass}">${value}</span>
                </div>
                <h5 class="text-sm font-medium text-gray-300">${title}</h5>
            </div>
        `;
    },

    renderInsightsList(items) {
        return items.map(item => `<li>• ${item}</li>`).join('');
    },

    renderPriorityFixes(fixes) {
        return fixes.map(fix => `
            <div class="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                <div class="flex-1">
                    <p class="text-white font-medium">${fix.fix}</p>
                    <div class="flex items-center space-x-4 mt-1">
                        <span class="text-xs px-2 py-1 rounded-full ${fix.impact === 'High' ? 'bg-red-500/20 text-red-400' : fix.impact === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}">
                            ${fix.impact} Impact
                        </span>
                        <span class="text-xs px-2 py-1 rounded-full ${fix.effort === 'Low' ? 'bg-green-500/20 text-green-400' : fix.effort === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}">
                            ${fix.effort} Effort
                        </span>
                    </div>
                </div>
                <button class="ml-4 text-primary hover:text-primary/80">
                    <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        `).join('');
    },

    renderSkillsGrid(skills) {
        return skills.map(skill => `
            <div class="skill-item p-3 bg-slate-700 rounded-lg border border-slate-600 hover:border-primary/50 transition-colors cursor-pointer" data-skill="${skill.name}" data-status="${skill.status}">
                <div class="flex items-center justify-between mb-2">
                    <span class="font-medium text-white">${skill.name}</span>
                    <span class="skill-chip ${skill.status}">${skill.status}</span>
                </div>
                <div class="text-xs text-gray-400">
                    ${skill.evidence || 'No evidence found'}
                </div>
            </div>
        `).join('');
    },

    renderSkillRecommendations(recommendations) {
        return recommendations.map(rec => `
            <div class="p-4 bg-slate-700 rounded-lg border border-slate-600">
                <div class="flex items-center justify-between mb-2">
                    <h6 class="font-medium text-white">${rec.skill}</h6>
                    <span class="text-xs px-2 py-1 rounded-full ${rec.priority === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}">
                        ${rec.priority} Priority
                    </span>
                </div>
                <div class="text-sm text-gray-300 mb-3">
                    <div class="flex items-center space-x-4">
                        <span><i class="fas fa-clock mr-1"></i>${rec.timeToLearn}</span>
                    </div>
                </div>
                <div class="flex flex-wrap gap-2">
                    ${rec.resources.map(resource => `
                        <span class="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full">${resource}</span>
                    `).join('')}
                </div>
            </div>
        `).join('');
    },

    renderEvidenceRows(evidence) {
        return evidence.map(item => `
            <tr class="evidence-row hover:bg-slate-700/50 cursor-pointer" data-requirement="${item.requirement}">
                <td class="p-4">
                    <div class="text-white font-medium mb-1">${item.requirement}</div>
                    <div class="text-xs text-gray-400">${item.context || ''}</div>
                </td>
                <td class="p-4">
                    <div class="text-gray-300">${item.evidence}</div>
                </td>
                <td class="p-4">
                    <span class="skill-chip ${item.match.toLowerCase()}">${item.match}</span>
                </td>
                <td class="p-4">
                    <div class="flex items-center">
                        <div class="w-12 h-2 bg-slate-600 rounded-full mr-2">
                            <div class="h-full bg-primary rounded-full" style="width: ${item.confidence}%"></div>
                        </div>
                        <span class="text-sm text-gray-300">${item.confidence}%</span>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    renderCitations(citations) {
        return citations.map(citation => `
            <div class="p-4 bg-slate-700 rounded-lg border border-slate-600">
                <div class="flex items-start space-x-3">
                    <i class="fas fa-quote-left text-primary mt-1"></i>
                    <div class="flex-1">
                        <p class="text-gray-300 italic mb-2">"${citation.text}"</p>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-400">Supports: ${citation.requirement}</span>
                            <span class="text-sm text-primary font-medium">${citation.confidence}% confidence</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    },

    renderCareerPaths(paths) {
        return paths.map(path => `
            <div class="p-4 bg-slate-700 rounded-lg border border-slate-600 hover:border-primary/50 transition-colors cursor-pointer">
                <div class="flex items-center justify-between mb-2">
                    <h6 class="font-medium text-white">${path.title}</h6>
                    <span class="text-primary font-bold">${path.match}%</span>
                </div>
                <div class="text-sm text-gray-400 mb-3">
                    <i class="fas fa-clock mr-1"></i>${path.timeframe}
                </div>
                <div class="space-y-1">
                    <p class="text-xs text-gray-400">Requirements:</p>
                    ${path.requirements.map(req => `
                        <span class="inline-block text-xs px-2 py-1 bg-slate-600 text-gray-300 rounded-full mr-1">${req}</span>
                    `).join('')}
                </div>
            </div>
        `).join('');
    },

    renderResumeImprovements(improvements) {
        return improvements.map(improvement => `
            <div class="p-4 bg-slate-700 rounded-lg border border-slate-600">
                <div class="flex items-center justify-between mb-2">
                    <h6 class="font-medium text-white">${improvement.section}</h6>
                    <span class="text-xs px-2 py-1 rounded-full ${improvement.impact === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}">
                        ${improvement.impact} Impact
                    </span>
                </div>
                <p class="text-sm text-gray-300">${improvement.suggestion}</p>
            </div>
        `).join('');
    },

    renderTrendingSkills(skills) {
        return skills.map(skill => `
            <div class="flex items-center justify-between">
                <span class="text-sm text-gray-300">${skill.skill}</span>
                <span class="text-sm text-green-400 font-medium">${skill.growth}</span>
            </div>
        `).join('');
    },

    renderLearningResources(resources) {
        return resources.map(resource => `
            <div class="p-4 bg-slate-700 rounded-lg border border-slate-600 hover:border-primary/50 transition-colors cursor-pointer">
                <h6 class="font-medium text-white mb-2">${resource.title}</h6>
                <div class="text-sm text-gray-400 space-y-1">
                    <div><i class="fas fa-building mr-2"></i>${resource.provider}</div>
                    <div><i class="fas fa-tag mr-2"></i>${resource.type}</div>
                    <div><i class="fas fa-clock mr-2"></i>${resource.duration}</div>
                </div>
            </div>
        `).join('');
    },

    renderATSChecklist(checks) {
        return checks.map(check => `
            <div class="flex items-start space-x-3 p-3 rounded-lg ${check.status === 'pass' ? 'bg-green-500/10' : check.status === 'warning' ? 'bg-yellow-500/10' : 'bg-red-500/10'}">
                <i class="fas ${check.status === 'pass' ? 'fa-check text-green-400' : check.status === 'warning' ? 'fa-exclamation-triangle text-yellow-400' : 'fa-times text-red-400'} mt-1"></i>
                <div class="flex-1">
                    <p class="text-white font-medium">${check.check}</p>
                    <p class="text-sm text-gray-400 mt-1">${check.description}</p>
                </div>
            </div>
        `).join('');
    },

    renderKeywordChips(keywords, type) {
        const colorClass = type === 'found' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400';
        return keywords.map(keyword => `
            <span class="inline-block px-3 py-1 rounded-full text-sm ${colorClass}">${keyword}</span>
        `).join('');
    },

    renderFormattingIssues(issues) {
        return issues.map(issue => `
            <div class="p-4 bg-slate-700 rounded-lg border border-slate-600">
                <div class="flex items-center justify-between mb-2">
                    <h6 class="font-medium text-white">${issue.issue}</h6>
                    <span class="text-xs px-2 py-1 rounded-full ${issue.severity === 'high' ? 'bg-red-500/20 text-red-400' : issue.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}">
                        ${issue.severity}
                    </span>
                </div>
                <p class="text-sm text-gray-300">${issue.fix}</p>
            </div>
        `).join('');
    },

    // Mock data generators
    getMockSkills() {
        return [
            { name: 'JavaScript', status: 'matched', evidence: 'Mentioned 5 times in experience section' },
            { name: 'React', status: 'matched', evidence: 'Used in 3 projects' },
            { name: 'Node.js', status: 'partial', evidence: 'Limited backend experience' },
            { name: 'AWS', status: 'matched', evidence: 'AWS certification mentioned' },
            { name: 'Kubernetes', status: 'missing', evidence: 'Not found in resume' },
            { name: 'Docker', status: 'matched', evidence: 'Container experience documented' },
            { name: 'TypeScript', status: 'missing', evidence: 'Not mentioned' },
            { name: 'GraphQL', status: 'partial', evidence: 'Basic knowledge implied' }
        ];
    },

    getMockEvidence() {
        return [
            { requirement: 'Frontend Development', evidence: 'Built responsive web applications using React and JavaScript', match: 'Matched', confidence: 95 },
            { requirement: 'Backend Development', evidence: 'Developed REST APIs using Node.js and Express', match: 'Matched', confidence: 88 },
            { requirement: 'Cloud Experience', evidence: 'Deployed applications on AWS EC2 and S3', match: 'Partial', confidence: 72 },
            { requirement: 'Team Leadership', evidence: 'Led a team of 5 developers on multiple projects', match: 'Matched', confidence: 90 },
            { requirement: 'DevOps Skills', evidence: 'No specific DevOps experience mentioned', match: 'Missing', confidence: 15 }
        ];
    },

    // Interaction setup methods
    setupOverviewInteractions() {
        // Explain score toggle
        const explainToggle = document.querySelector('.explain-score-toggle');
        const explainContent = document.querySelector('.explain-score-content');
        
        explainToggle?.addEventListener('click', () => {
            explainContent?.classList.toggle('hidden');
            const icon = explainToggle.querySelector('i:last-child');
            icon?.classList.toggle('rotate-180');
        });

        // Export buttons
        document.querySelectorAll('.export-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const format = btn.dataset.format;
                this.handleExport(format);
            });
        });
    },

    setupSkillsInteractions() {
        // Skill filters
        document.querySelectorAll('.skill-filter').forEach(filter => {
            filter.addEventListener('click', () => {
                document.querySelectorAll('.skill-filter').forEach(f => f.classList.remove('active'));
                filter.classList.add('active');
                
                const filterType = filter.dataset.filter;
                this.filterSkills(filterType);
            });
        });

        // Skill item hover highlighting
        document.querySelectorAll('.skill-item').forEach(item => {
            item.addEventListener('mouseenter', () => {
                const skillName = item.dataset.skill;
                this.highlightSkillEvidence(skillName);
            });
            
            item.addEventListener('mouseleave', () => {
                this.clearSkillHighlights();
            });
        });
    },

    setupEvidenceInteractions() {
        // Evidence row highlighting
        document.querySelectorAll('.evidence-row').forEach(row => {
            row.addEventListener('click', () => {
                const requirement = row.dataset.requirement;
                this.showEvidenceDetails(requirement);
            });
        });
    },

    setupRecommendationsInteractions() {
        // Career path interactions
        document.querySelectorAll('.career-path-card').forEach(card => {
            card?.addEventListener('click', () => {
                // Show detailed career path information
            });
        });
    },

    setupATSInteractions() {
        // ATS checklist interactions
        document.querySelectorAll('.ats-check-item').forEach(item => {
            item?.addEventListener('click', () => {
                // Show detailed ATS check information
            });
        });
    },

    // Chart rendering methods
    renderSkillCharts(data) {
        // These would integrate with Chart.js or similar library
        console.log('Rendering skill charts with data:', data);
    },

    renderCoverageHeatmap(data) {
        // Heatmap implementation
        console.log('Rendering coverage heatmap with data:', data);
    },

    // Utility methods
    filterSkills(filterType) {
        const skillItems = document.querySelectorAll('.skill-item');
        skillItems.forEach(item => {
            const status = item.dataset.status;
            const shouldShow = filterType === 'all' || status === filterType;
            item.style.display = shouldShow ? 'block' : 'none';
        });
    },

    highlightSkillEvidence(skillName) {
        // Highlight supporting evidence for a skill
        console.log('Highlighting evidence for skill:', skillName);
    },

    clearSkillHighlights() {
        // Clear all skill highlights
        console.log('Clearing skill highlights');
    },

    showEvidenceDetails(requirement) {
        // Show detailed evidence modal
        console.log('Showing evidence details for:', requirement);
    },

    handleExport(format) {
        if (!window.analysisWorkspace?.analysisData) return;
        
        const data = window.analysisWorkspace.analysisData;
        
        switch (format) {
            case 'pdf':
                this.exportToPDF(data);
                break;
            case 'csv':
                this.exportToCSV(data);
                break;
            case 'copy':
                this.copyToClipboard(data);
                break;
        }
    },

    exportToPDF(data) {
        // PDF export implementation
        window.analysisWorkspace?.showToast('PDF export feature coming soon!', 'info');
    },

    exportToCSV(data) {
        // CSV export implementation
        const csvContent = this.generateCSV(data);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cv-analysis-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        window.analysisWorkspace?.showToast('CSV exported successfully!', 'success');
    },

    copyToClipboard(data) {
        const summary = this.generateSummary(data);
        navigator.clipboard.writeText(summary).then(() => {
            window.analysisWorkspace?.showToast('Summary copied to clipboard!', 'success');
        }).catch(() => {
            window.analysisWorkspace?.showToast('Failed to copy to clipboard', 'error');
        });
    },

    generateCSV(data) {
        // Generate CSV content from analysis data
        return 'Metric,Value\nOverall Fit,' + this.calculateOverallFit(data) + '%\nSkills Match,' + (data.skillsMatch || 75) + '%';
    },

    generateSummary(data) {
        const overallFit = this.calculateOverallFit(data);
        return `CV Analysis Summary\n\nOverall Fit Score: ${overallFit}%\nSkills Match: ${data.skillsMatch || 75}%\nExperience Match: ${data.experienceMatch || 80}%\nKeyword Coverage: ${data.keywordCoverage || 65}%\n\nGenerated by Clearsight IP`;
    },

    updateWithWeights(data, weights) {
        // Update all tabs with new weights
        this.renderOverview(data);
        // Update other tabs as needed
    }
};

// Add CSS for skill filters
const style = document.createElement('style');
style.textContent = `
    .skill-filter {
        @apply px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-lg transition-colors cursor-pointer;
    }
    .skill-filter.active {
        @apply bg-primary text-white;
    }
`;
document.head.appendChild(style);