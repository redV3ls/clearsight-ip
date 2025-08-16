// Analysis Module
class AnalysisManager {
    constructor() {
        this.elements = this.cacheElements();
    }

    cacheElements() {
        return {
            analysisInterface: document.getElementById('analysisInterface'),
            uploadSection: document.getElementById('uploadSection'),
            loadingSection: document.getElementById('loadingSection'),
            resultsSection: document.getElementById('resultsSection'),
            resultsContent: document.getElementById('resultsContent'),
            progressBar: document.getElementById('progressBar'),
            progressText: document.getElementById('progressText'),
            analysisError: document.getElementById('analysisError'),
            cvFileInput: document.getElementById('cvFileInput'),
            jobFileInput: document.getElementById('jobFileInput'),
            cvDropZone: document.getElementById('cvDropZone'),
            jobDropZone: document.getElementById('jobDropZone'),
            cvFileInfo: document.getElementById('cvFileInfo'),
            jobFileInfo: document.getElementById('jobFileInfo'),
            cvFileName: document.getElementById('cvFileName'),
            jobFileName: document.getElementById('jobFileName')
        };
    }

    async showAnalysisInterface() {
        const analysisInterface = this.elements.analysisInterface;
        if (!analysisInterface) return;
        
        analysisInterface.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Try to load and initialize the tabbed interface
        const container = document.getElementById('tabbedInterfaceContainer');
        const fallback = document.getElementById('fallbackContent');
        
        if (container) {
            try {
                // Check if TabbedAnalysisInterface is available
                if (typeof window.TabbedAnalysisInterface !== 'undefined') {
                    // Use the tabbed interface
                    new window.TabbedAnalysisInterface('tabbedInterfaceContainer');
                    if (fallback) fallback.classList.add('hidden');
                } else {
                    // Try to load the script dynamically
                    const script = document.createElement('script');
                    script.src = '/js/TabbedAnalysisInterface.js';
                    script.onload = () => {
                        if (window.TabbedAnalysisInterface) {
                            new window.TabbedAnalysisInterface('tabbedInterfaceContainer');
                            if (fallback) fallback.classList.add('hidden');
                        } else {
                            this.showFallbackInterface();
                        }
                    };
                    script.onerror = () => {
                        this.showFallbackInterface();
                    };
                    document.head.appendChild(script);
                }
            } catch (error) {
                console.error('Failed to load tabbed interface:', error);
                this.showFallbackInterface();
            }
        } else {
            this.showFallbackInterface();
        }
    }
    
    showFallbackInterface() {
        const fallback = document.getElementById('fallbackContent');
        if (fallback) {
            fallback.classList.remove('hidden');
            // Re-cache elements for fallback interface
            this.elements = this.cacheElements();
            this.setupFallbackEventListeners();
        }
    }
    
    setupFallbackEventListeners() {
        // Setup event listeners for fallback interface
        const cvDropZone = document.getElementById('cvDropZone');
        const cvFileInput = document.getElementById('cvFileInput');
        const jobDropZone = document.getElementById('jobDropZone');
        const jobFileInput = document.getElementById('jobFileInput');
        const startBtn = document.getElementById('startAnalysisBtn');
        const cancelBtn = document.getElementById('cancelAnalysisBtn');
        const clearCvBtn = document.getElementById('clearCvBtn');
        const clearJobBtn = document.getElementById('clearJobBtn');
        
        if (cvDropZone && cvFileInput) {
            cvDropZone.addEventListener('click', () => cvFileInput.click());
            cvFileInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) {
                    this.handleFileSelect(e.target.files[0], 'cv');
                }
            });
        }
        
        if (jobDropZone && jobFileInput) {
            jobDropZone.addEventListener('click', () => jobFileInput.click());
            jobFileInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) {
                    this.handleFileSelect(e.target.files[0], 'job');
                }
            });
        }
        
        if (startBtn) {
            startBtn.addEventListener('click', () => this.performAnalysis());
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideAnalysisInterface());
        }
        
        if (clearCvBtn) {
            clearCvBtn.addEventListener('click', () => this.clearFile('cv'));
        }
        
        if (clearJobBtn) {
            clearJobBtn.addEventListener('click', () => this.clearFile('job'));
        }
    }

    hideAnalysisInterface() {
        this.elements.analysisInterface?.classList.add('hidden');
        document.body.style.overflow = 'auto';
        this.resetAnalysis();
    }

    showAnalysisError(message) {
        if (this.elements.analysisError) {
            this.elements.analysisError.textContent = message;
            this.elements.analysisError.classList.remove('hidden');
        }
    }

    clearAnalysisError() {
        if (this.elements.analysisError) {
            this.elements.analysisError.classList.add('hidden');
            this.elements.analysisError.textContent = '';
        }
    }

    checkRateLimit() {
        const now = Date.now();
        if (now - AppState.lastAnalysisTime < APP_CONFIG.ANALYSIS_COOLDOWN) {
            const remainingTime = Math.ceil((APP_CONFIG.ANALYSIS_COOLDOWN - (now - AppState.lastAnalysisTime)) / 1000);
            this.showAnalysisError(`Please wait ${remainingTime} seconds before starting another analysis.`);
            return false;
        }
        AppState.lastAnalysisTime = now;
        return true;
    }

    validateFile(file, type) {
        const maxSize = type === 'cv' ? APP_CONFIG.MAX_FILE_SIZE : APP_CONFIG.MAX_JOB_FILE_SIZE;
        
        if (file.size > maxSize) {
            this.showAnalysisError(`File too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
            return false;
        }

        if (!APP_CONFIG.ALLOWED_FILE_TYPES.includes(file.type)) {
            this.showAnalysisError('Invalid file type. Please upload PDF, DOC, DOCX, or TXT files only.');
            return false;
        }

        if (file.name.includes('../') || file.name.includes('..\\')) {
            this.showAnalysisError('Invalid file name.');
            return false;
        }

        return true;
    }

    handleFileSelect(file, type) {
        if (!file || !this.validateFile(file, type)) return;

        AppState[type + 'File'] = file;
        this.updateFileInfo(type);
    }

    updateFileInfo(type) {
        const fileInfo = this.elements[type + 'FileInfo'];
        const fileName = this.elements[type + 'FileName'];
        const dropZone = this.elements[type + 'DropZone'];
        const file = AppState[type + 'File'];

        if (file && fileName) {
            fileName.textContent = file.name;
            fileInfo?.classList.remove('hidden');
            dropZone?.classList.add('hidden');
        } else {
            fileInfo?.classList.add('hidden');
            dropZone?.classList.remove('hidden');
        }
    }

    clearFile(type) {
        AppState[type + 'File'] = null;
        if (this.elements[type + 'FileInput']) {
            this.elements[type + 'FileInput'].value = '';
        }
        this.updateFileInfo(type);
    }

    startLoadingAnimation() {
        AppState.currentMessageIndex = 0;
        let progress = 0;
        
        this.updateLoadingMessage();
        
        // Progress bar animation
        AppState.progressInterval = setInterval(() => {
            progress += Math.random() * 15 + 5;
            if (progress > 95) progress = 95;
            
            if (this.elements.progressBar) {
                this.elements.progressBar.style.width = progress + '%';
            }
        }, APP_CONFIG.PROGRESS_UPDATE_INTERVAL);
        
        // Message cycling
        AppState.messageInterval = setInterval(() => {
            AppState.currentMessageIndex = (AppState.currentMessageIndex + 1) % LOADING_MESSAGES.length;
            this.updateLoadingMessage();
        }, APP_CONFIG.LOADING_MESSAGE_INTERVAL);
    }

    updateLoadingMessage() {
        const message = LOADING_MESSAGES[AppState.currentMessageIndex];
        const progressText = this.elements.progressText;
        const loadingTitle = document.querySelector('#loadingSection h3');
        
        if (progressText) {
            progressText.textContent = message.text;
            progressText.className = 'text-sm text-primary animate-pulse font-medium';
        }
        
        if (loadingTitle) {
            loadingTitle.innerHTML = `<i class="${message.icon} mr-2"></i>AI Analysis in Progress...`;
        }
    }

    async completeLoadingAnimation() {
        return new Promise((resolve) => {
            if (this.elements.progressBar) {
                this.elements.progressBar.style.width = '100%';
            }
            
            if (this.elements.progressText) {
                this.elements.progressText.textContent = '🎉 Analysis complete! Preparing your results...';
                this.elements.progressText.className = 'text-sm text-green-400 font-semibold';
            }
            
            setTimeout(resolve, 1500);
        });
    }

    stopLoadingAnimation() {
        if (AppState.progressInterval) {
            clearInterval(AppState.progressInterval);
            AppState.progressInterval = null;
        }
        if (AppState.messageInterval) {
            clearInterval(AppState.messageInterval);
            AppState.messageInterval = null;
        }
    }

    resetAnalysis() {
        AppState.analysisInProgress = false;
        this.stopLoadingAnimation();
        
        this.elements.uploadSection?.classList.remove('hidden');
        this.elements.loadingSection?.classList.add('hidden');
        this.elements.resultsSection?.classList.add('hidden');
        
        if (this.elements.progressBar) {
            this.elements.progressBar.style.width = '0%';
        }
    }

    async performAnalysis() {
        if (AppState.analysisInProgress || !this.checkRateLimit()) return;

        this.clearAnalysisError();

        if (!AppState.cvFile) {
            this.showAnalysisError('Please upload your CV/resume file to start the analysis.');
            return;
        }

        AppState.analysisInProgress = true;
        
        this.elements.uploadSection?.classList.add('hidden');
        this.elements.loadingSection?.classList.remove('hidden');
        this.elements.resultsSection?.classList.add('hidden');
        
        this.startLoadingAnimation();

        try {
            const formData = new FormData();
            formData.append('resume', AppState.cvFile);
            
            if (AppState.jobFile) {
                formData.append('jobDescription', AppState.jobFile);
            }
            
            formData.append('includeSkillsGap', document.getElementById('skillsIntelligenceAnalysis')?.checked || false);
            formData.append('includeCareerSuggestions', document.getElementById('careerSuggestions')?.checked || false);
            formData.append('includeIndustryTrends', document.getElementById('industryTrends')?.checked || false);

            const response = await fetch(`${APP_CONFIG.API_BASE_URL}/analyze/resume`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                await this.completeLoadingAnimation();
                this.displayResults(data);
            } else {
                throw new Error(data.error?.message || 'Analysis failed');
            }
        } catch (error) {
            console.error('Analysis error:', error);
            this.showAnalysisError(error.message || 'Analysis failed. Please try again.');
            this.resetAnalysis();
        } finally {
            AppState.analysisInProgress = false;
            this.stopLoadingAnimation();
        }
    }

    displayResults(data) {
        window.analysisData = data;
        
        this.elements.loadingSection?.classList.add('hidden');
        this.elements.resultsSection?.classList.remove('hidden');
        
        if (!this.elements.resultsContent) return;
        
        // Use the existing results display logic but in a cleaner way
        const resultsHTML = this.generateResultsHTML(data);
        this.elements.resultsContent.innerHTML = resultsHTML;
    }

    generateResultsHTML(data) {
        // Convert markdown to HTML
        const narrativeHtml = this.convertMarkdownToHtml(data.narrative || data.careerNarrative || '');
        
        return `
            <div class="space-y-8">
                <div class="text-center mb-8">
                    <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-check text-white text-2xl"></i>
                    </div>
                    <h2 class="text-3xl font-bold text-green-400 mb-2">Analysis Complete!</h2>
                    <p class="text-gray-300">Your personalized CV analysis and improvement guide</p>
                </div>
                
                <div class="bg-slate-700 rounded-lg p-6 border border-slate-600">
                    <div class="prose prose-invert max-w-none">
                        ${narrativeHtml}
                    </div>
                </div>
                
                ${data.word_count ? `
                    <div class="text-center text-sm text-gray-400">
                        <i class="fas fa-clock mr-2"></i>
                        ${Math.ceil(data.word_count / 200)} min read • ${data.word_count} words
                    </div>
                ` : ''}
                
                ${this.generateActionButtons()}
            </div>
        `;
    }

    generateSkillsSection(data) {
        // Skills section HTML generation
        return '<div>Skills analysis...</div>';
    }

    generateGapAnalysisSection(data) {
        // Gap analysis HTML generation
        return '<div>Gap analysis...</div>';
    }

    generateCareerPathsSection(data) {
        // Career paths HTML generation
        return '<div>Career paths...</div>';
    }

    generateActionButtons() {
        return `
            <div class="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                <button onclick="analysisManager.downloadResults()" class="bg-primary hover:bg-primary/80 text-white px-6 py-3 rounded-lg transition-colors">
                    <i class="fas fa-download mr-2"></i>Download Results
                </button>
                <button onclick="analysisManager.resetAnalysis()" class="border border-gray-600 hover:border-primary text-gray-300 hover:text-primary px-6 py-3 rounded-lg transition-colors">
                    <i class="fas fa-redo mr-2"></i>New Analysis
                </button>
                <button onclick="analysisManager.hideAnalysisInterface()" class="bg-gray-600 hover:bg-gray-500 text-white px-6 py-3 rounded-lg transition-colors">
                    <i class="fas fa-times mr-2"></i>Close
                </button>
            </div>
        `;
    }

    convertMarkdownToHtml(text) {
        if (!text) return '';
        
        // First, escape any HTML entities to prevent issues
        text = text.replace(/&/g, '&amp;')
                   .replace(/</g, '&lt;')
                   .replace(/>/g, '&gt;');
        
        // Convert markdown headers (must be at start of line)
        text = text.replace(/^###\s+(.*?)$/gm, '<h3 class="text-lg font-bold text-primary mt-6 mb-3">$1</h3>');
        text = text.replace(/^##\s+(.*?)$/gm, '<h2 class="text-xl font-bold text-white mt-6 mb-3 border-b border-slate-600 pb-2">$1</h2>');
        text = text.replace(/^#\s+(.*?)$/gm, '<h1 class="text-2xl font-bold text-white mt-6 mb-4">$1</h1>');
        
        // Convert bold text (must handle **text**)
        text = text.replace(/\*\*([^\*]+)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
        
        // Convert italic text (must handle *text*)
        text = text.replace(/(?<!\*)\*([^\*]+)\*(?!\*)/g, '<em class="italic">$1</em>');
        
        // Convert numbered lists
        text = text.replace(/^(\d+)\.\s+(.*?)$/gm, '<li class="ml-6 mb-2 list-decimal">$2</li>');
        
        // Convert bullet points
        text = text.replace(/^-\s+(.*?)$/gm, '<li class="ml-6 mb-2 list-disc">$1</li>');
        text = text.replace(/^\*\s+(.*?)$/gm, '<li class="ml-6 mb-2 list-disc">$1</li>');
        
        // Wrap consecutive list items in appropriate list tags
        text = text.replace(/(<li class="[^"]*list-disc[^"]*">.*?<\/li>\s*)+/g, function(match) {
            return '<ul class="space-y-2 my-4 list-disc list-inside text-gray-300">' + match + '</ul>';
        });
        
        text = text.replace(/(<li class="[^"]*list-decimal[^"]*">.*?<\/li>\s*)+/g, function(match) {
            return '<ol class="space-y-2 my-4 list-decimal list-inside text-gray-300">' + match + '</ol>';
        });
        
        // Convert line breaks to paragraphs
        const lines = text.split('\n');
        let result = [];
        let currentParagraph = [];
        
        for (let line of lines) {
            line = line.trim();
            if (line === '') {
                if (currentParagraph.length > 0) {
                    const content = currentParagraph.join(' ');
                    if (!content.startsWith('<')) {
                        result.push(`<p class="mb-4 text-gray-300 leading-relaxed">${content}</p>`);
                    } else {
                        result.push(content);
                    }
                    currentParagraph = [];
                }
            } else {
                if (line.startsWith('<')) {
                    if (currentParagraph.length > 0) {
                        const content = currentParagraph.join(' ');
                        result.push(`<p class="mb-4 text-gray-300 leading-relaxed">${content}</p>`);
                        currentParagraph = [];
                    }
                    result.push(line);
                } else {
                    currentParagraph.push(line);
                }
            }
        }
        
        if (currentParagraph.length > 0) {
            const content = currentParagraph.join(' ');
            if (!content.startsWith('<')) {
                result.push(`<p class="mb-4 text-gray-300 leading-relaxed">${content}</p>`);
            } else {
                result.push(content);
            }
        }
        
        return result.join('\n');
    }

    downloadResults() {
        if (!window.analysisData) return;
        
        const results = {
            timestamp: new Date().toISOString(),
            user: AppState.currentUser?.email || 'Anonymous',
            ...window.analysisData
        };
        
        const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cv-analysis-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}