// Analysis Workspace Manager
class AnalysisWorkspace {
    constructor() {
        this.currentStep = 1;
        this.analysisData = null;
        this.weights = {
            skills: 4,
            experience: 3,
            location: 2,
            seniority: 3
        };
        this.isQuickCompare = false;
        this.leftRailWidth = 384; // 24rem in pixels
        this.isDragging = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupResizeHandle();
        this.setupFileHandlers();
        this.setupWeightingPanel();
        this.setupTabs();
        this.loadPersistedData();
        this.setupAccessibility();
    }

    setupEventListeners() {
        // Step navigation
        document.getElementById('continueToJob')?.addEventListener('click', () => this.goToStep(2));
        document.getElementById('backToResume')?.addEventListener('click', () => this.goToStep(1));
        document.getElementById('startAnalysis')?.addEventListener('click', () => this.startAnalysis());

        // Quick compare toggle
        document.getElementById('quickCompareToggle')?.addEventListener('click', () => this.toggleQuickCompare());

        // Theme toggle
        document.getElementById('themeToggle')?.addEventListener('click', () => this.toggleTheme());

        // Data handling
        document.getElementById('dataHandlingBtn')?.addEventListener('click', () => this.showDataHandling());
        document.getElementById('closeDataHandling')?.addEventListener('click', () => this.hideDataHandling());
        document.getElementById('closeDataHandling2')?.addEventListener('click', () => this.hideDataHandling());
        document.getElementById('deleteAllData')?.addEventListener('click', () => this.deleteAllData());

        // Character counting
        document.getElementById('resumeTextArea')?.addEventListener('input', (e) => this.updateCharCount('resume', e.target.value));
        document.getElementById('jobTextArea')?.addEventListener('input', (e) => this.updateCharCount('job', e.target.value));

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    setupResizeHandle() {
        const resizeHandle = document.getElementById('resizeHandle');
        const leftRail = document.getElementById('leftRail');
        
        if (!resizeHandle || !leftRail) return;

        resizeHandle.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
            
            const startX = e.clientX;
            const startWidth = leftRail.offsetWidth;

            const handleMouseMove = (e) => {
                if (!this.isDragging) return;
                
                const deltaX = e.clientX - startX;
                const newWidth = Math.max(320, Math.min(800, startWidth + deltaX));
                
                leftRail.style.width = `${newWidth}px`;
                this.leftRailWidth = newWidth;
                
                // Persist the width
                localStorage.setItem('leftRailWidth', newWidth.toString());
            };

            const handleMouseUp = () => {
                this.isDragging = false;
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        });

        // Load persisted width
        const savedWidth = localStorage.getItem('leftRailWidth');
        if (savedWidth) {
            leftRail.style.width = `${savedWidth}px`;
            this.leftRailWidth = parseInt(savedWidth);
        }
    }

    setupFileHandlers() {
        // Resume file handling
        this.setupFileHandler('resume');
        this.setupFileHandler('job');
    }

    setupFileHandler(type) {
        const fileInput = document.getElementById(`${type}FileInput`);
        const dropZone = document.getElementById(`${type}DropZone`);
        const uploadCard = document.getElementById(`${type}UploadCard`);
        const removeBtn = document.getElementById(`${type}RemoveBtn`);

        if (!fileInput || !dropZone || !uploadCard) return;

        // File input change
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) this.handleFileSelect(file, type);
        });

        // Click to browse
        dropZone.addEventListener('click', () => fileInput.click());

        // Drag and drop
        uploadCard.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadCard.classList.add('drag-over');
        });

        uploadCard.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadCard.classList.remove('drag-over');
        });

        uploadCard.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadCard.classList.remove('drag-over');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect(files[0], type);
            }
        });

        // Remove file
        removeBtn?.addEventListener('click', () => this.removeFile(type));
    }

    handleFileSelect(file, type) {
        if (!this.validateFile(file)) return;

        // Show file info
        this.showFileInfo(file, type);
        
        // Parse file
        this.parseFile(file, type);
        
        // Update continue button state
        this.updateContinueButton();
        
        // Persist file info
        this.persistFileData(file, type);
    }

    validateFile(file) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];

        if (file.size > maxSize) {
            this.showToast('File too large. Maximum size is 10MB.', 'error');
            return false;
        }

        if (!allowedTypes.includes(file.type)) {
            this.showToast('Invalid file type. Please upload PDF, DOC, DOCX, or TXT files only.', 'error');
            return false;
        }

        return true;
    }

    showFileInfo(file, type) {
        const fileInfo = document.getElementById(`${type}FileInfo`);
        const fileName = document.getElementById(`${type}FileName`);
        const fileSize = document.getElementById(`${type}FileSize`);
        const dropZone = document.getElementById(`${type}DropZone`);

        if (fileName) fileName.textContent = file.name;
        if (fileSize) fileSize.textContent = this.formatFileSize(file.size);
        
        dropZone?.classList.add('hidden');
        fileInfo?.classList.remove('hidden');
    }

    async parseFile(file, type) {
        const parseStatus = document.getElementById(`${type}ParseStatus`);
        if (!parseStatus) return;

        parseStatus.classList.remove('hidden');
        
        try {
            const text = await this.extractTextFromFile(file);
            
            // Update parse status
            parseStatus.innerHTML = `
                <div class="flex items-center space-x-2">
                    <i class="fas fa-check text-green-400"></i>
                    <span class="text-sm text-green-400">Document parsed successfully</span>
                </div>
                <div class="text-xs text-gray-400 mt-1">${text.length} characters extracted</div>
            `;

            // Store the extracted text
            this[`${type}Text`] = text;
            
            // Update character count
            this.updateCharCount(type, text);
            
        } catch (error) {
            parseStatus.innerHTML = `
                <div class="flex items-center space-x-2">
                    <i class="fas fa-exclamation-triangle text-red-400"></i>
                    <span class="text-sm text-red-400">Failed to parse document</span>
                </div>
                <div class="text-xs text-gray-400 mt-1">Please try a different file or paste the content manually</div>
            `;
            console.error('File parsing error:', error);
        }
    }

    async extractTextFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const text = e.target.result;
                resolve(text);
            };
            
            reader.onerror = () => reject(new Error('Failed to read file'));
            
            if (file.type === 'text/plain') {
                reader.readAsText(file);
            } else {
                // For PDF and DOC files, we'll need to send to server for parsing
                // For now, just reject with a message to use text area
                reject(new Error('Please use the text area for non-text files'));
            }
        });
    }

    removeFile(type) {
        const fileInfo = document.getElementById(`${type}FileInfo`);
        const dropZone = document.getElementById(`${type}DropZone`);
        const fileInput = document.getElementById(`${type}FileInput`);

        fileInfo?.classList.add('hidden');
        dropZone?.classList.remove('hidden');
        
        if (fileInput) fileInput.value = '';
        
        delete this[`${type}Text`];
        this.updateContinueButton();
        
        // Clear persisted data
        localStorage.removeItem(`${type}FileData`);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    updateCharCount(type, text) {
        const charCount = document.getElementById(`${type}CharCount`);
        const tokenCount = document.getElementById(`${type}TokenCount`);
        
        if (charCount) charCount.textContent = `${text.length} characters`;
        if (tokenCount) tokenCount.textContent = `~${Math.ceil(text.length / 4)} tokens`;
    }

    updateContinueButton() {
        const continueBtn = document.getElementById('continueToJob');
        const hasResume = this.resumeText || document.getElementById('resumeTextArea')?.value.trim();
        
        if (continueBtn) {
            continueBtn.disabled = !hasResume;
            continueBtn.classList.toggle('opacity-50', !hasResume);
            continueBtn.classList.toggle('cursor-not-allowed', !hasResume);
        }
    }

    setupWeightingPanel() {
        const toggle = document.querySelector('.weighting-toggle');
        const content = document.querySelector('.weighting-content');
        const sliders = document.querySelectorAll('input[type="range"][data-weight]');

        toggle?.addEventListener('click', () => {
            const isHidden = content?.classList.contains('hidden');
            content?.classList.toggle('hidden');
            toggle.classList.toggle('active');
        });

        sliders.forEach(slider => {
            slider.addEventListener('input', (e) => {
                const weight = e.target.dataset.weight;
                const value = parseInt(e.target.value);
                const labels = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
                
                this.weights[weight] = value;
                
                // Update label
                const label = e.target.parentElement.querySelector('.text-primary');
                if (label) label.textContent = labels[value - 1];
                
                // Trigger re-analysis if results are visible
                if (this.analysisData) {
                    this.debounceReAnalysis();
                }
                
                // Persist weights
                localStorage.setItem('analysisWeights', JSON.stringify(this.weights));
            });
        });

        // Load persisted weights
        const savedWeights = localStorage.getItem('analysisWeights');
        if (savedWeights) {
            this.weights = JSON.parse(savedWeights);
            this.updateWeightingUI();
        }
    }

    updateWeightingUI() {
        const labels = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
        
        Object.entries(this.weights).forEach(([weight, value]) => {
            const slider = document.querySelector(`input[data-weight="${weight}"]`);
            const label = slider?.parentElement.querySelector('.text-primary');
            
            if (slider) slider.value = value;
            if (label) label.textContent = labels[value - 1];
        });
    }

    debounceReAnalysis() {
        clearTimeout(this.reAnalysisTimeout);
        this.reAnalysisTimeout = setTimeout(() => {
            this.reAnalyzeWithNewWeights();
        }, 1000);
    }

    async reAnalyzeWithNewWeights() {
        if (!this.analysisData) return;
        
        this.showToast('Re-analyzing with new weights...', 'info');
        
        try {
            // Simulate re-analysis with new weights
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Update results with new weights
            this.updateResultsWithWeights();
            
            this.showToast('Analysis updated!', 'success');
        } catch (error) {
            this.showToast('Failed to update analysis', 'error');
        }
    }

    setupTabs() {
        const tabs = document.querySelectorAll('.results-tab');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                this.switchTab(tabName);
            });
        });
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.results-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            const isActive = content.id === `${tabName.replace('-', '')}Tab` || content.id === `${tabName}Tab`;
            content.classList.toggle('hidden', !isActive);
            content.classList.toggle('active', isActive);
        });
    }

    goToStep(step) {
        this.currentStep = step;
        
        // Update stepper
        document.querySelectorAll('.step-item').forEach((item, index) => {
            const stepNum = index + 1;
            item.classList.toggle('active', stepNum === step);
            item.classList.toggle('completed', stepNum < step);
        });

        // Update step content
        document.querySelectorAll('.step-content').forEach((content, index) => {
            const stepNum = index + 1;
            content.classList.toggle('hidden', stepNum !== step);
            content.classList.toggle('active', stepNum === step);
        });

        // Show results if step 3
        if (step === 3) {
            this.showResults();
        }
    }

    async startAnalysis() {
        const resumeText = this.resumeText || document.getElementById('resumeTextArea')?.value.trim();
        const jobText = this.jobText || document.getElementById('jobTextArea')?.value.trim();

        if (!resumeText) {
            this.showToast('Please provide your resume content', 'error');
            return;
        }

        // Show loading state
        this.showLoadingState();
        
        try {
            const formData = new FormData();
            formData.append('resumeText', resumeText);
            if (jobText) formData.append('jobText', jobText);
            formData.append('weights', JSON.stringify(this.weights));

            const response = await fetch(`${APP_CONFIG.API_BASE_URL}/analyze/resume`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                this.analysisData = data;
                await this.streamResults(data);
                this.goToStep(3);
                this.showToast('Analysis complete!', 'success');
            } else {
                throw new Error(data.error?.message || 'Analysis failed');
            }
        } catch (error) {
            console.error('Analysis error:', error);
            this.showToast(error.message || 'Analysis failed. Please try again.', 'error');
            this.hideLoadingState();
        }
    }

    showLoadingState() {
        document.getElementById('emptyState')?.classList.add('hidden');
        document.getElementById('resultsContainer')?.classList.add('hidden');
        document.getElementById('loadingState')?.classList.remove('hidden');
        
        this.startLoadingMessages();
    }

    hideLoadingState() {
        document.getElementById('loadingState')?.classList.add('hidden');
        document.getElementById('emptyState')?.classList.remove('hidden');
    }

    startLoadingMessages() {
        const messages = [
            'Processing your resume...',
            'Analyzing skills and experience...',
            'Comparing with job requirements...',
            'Generating insights...',
            'Preparing recommendations...'
        ];
        
        let messageIndex = 0;
        const messageElement = document.getElementById('loadingMessage');
        
        this.loadingInterval = setInterval(() => {
            if (messageElement) {
                messageElement.textContent = messages[messageIndex];
                messageIndex = (messageIndex + 1) % messages.length;
            }
        }, 2000);
    }

    stopLoadingMessages() {
        if (this.loadingInterval) {
            clearInterval(this.loadingInterval);
            this.loadingInterval = null;
        }
    }

    async streamResults(data) {
        this.stopLoadingMessages();
        document.getElementById('loadingState')?.classList.add('hidden');
        document.getElementById('resultsContainer')?.classList.remove('hidden');
        
        // Stream results section by section
        await this.renderOverviewTab(data);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        await this.renderSkillsGapTab(data);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        await this.renderEvidenceTab(data);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        await this.renderRecommendationsTab(data);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        await this.renderATSChecksTab(data);
    }

    showResults() {
        document.getElementById('emptyState')?.classList.add('hidden');
        document.getElementById('loadingState')?.classList.add('hidden');
        document.getElementById('resultsContainer')?.classList.remove('hidden');
    }

    toggleQuickCompare() {
        this.isQuickCompare = !this.isQuickCompare;
        document.body.classList.toggle('quick-compare', this.isQuickCompare);
        
        const button = document.getElementById('quickCompareToggle');
        if (button) {
            button.classList.toggle('bg-primary', this.isQuickCompare);
            button.classList.toggle('bg-slate-700', !this.isQuickCompare);
        }
    }

    toggleTheme() {
        const isDark = document.body.classList.contains('dark');
        document.body.classList.toggle('dark', !isDark);
        document.body.classList.toggle('light', isDark);
        
        const icon = document.querySelector('#themeToggle i');
        if (icon) {
            icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        }
        
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
    }

    showDataHandling() {
        document.getElementById('dataHandlingModal')?.classList.remove('hidden');
    }

    hideDataHandling() {
        document.getElementById('dataHandlingModal')?.classList.add('hidden');
    }

    deleteAllData() {
        // Clear localStorage
        localStorage.removeItem('resumeFileData');
        localStorage.removeItem('jobFileData');
        localStorage.removeItem('analysisWeights');
        localStorage.removeItem('leftRailWidth');
        localStorage.removeItem('analysisData');
        
        // Clear current data
        this.analysisData = null;
        this.resumeText = null;
        this.jobText = null;
        
        // Reset UI
        this.removeFile('resume');
        this.removeFile('job');
        document.getElementById('resumeTextArea').value = '';
        document.getElementById('jobTextArea').value = '';
        
        // Go back to step 1
        this.goToStep(1);
        
        this.showToast('All data deleted successfully', 'success');
        this.hideDataHandling();
    }

    loadPersistedData() {
        // Load theme
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.body.classList.add(savedTheme);
        
        const icon = document.querySelector('#themeToggle i');
        if (icon) {
            icon.className = savedTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
        }
        
        // Load analysis data
        const savedAnalysis = localStorage.getItem('analysisData');
        if (savedAnalysis) {
            this.analysisData = JSON.parse(savedAnalysis);
            // Optionally restore results
        }
    }

    persistFileData(file, type) {
        const fileData = {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified
        };
        localStorage.setItem(`${type}FileData`, JSON.stringify(fileData));
    }

    setupAccessibility() {
        // Add ARIA labels and descriptions
        document.querySelectorAll('.drop-zone').forEach(zone => {
            zone.setAttribute('role', 'button');
            zone.setAttribute('tabindex', '0');
            zone.setAttribute('aria-label', 'Upload file area');
        });

        // Add keyboard navigation for tabs
        document.querySelectorAll('.results-tab').forEach((tab, index) => {
            tab.setAttribute('role', 'tab');
            tab.setAttribute('tabindex', index === 0 ? '0' : '-1');
        });

        // Add live regions for dynamic content
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.id = 'liveRegion';
        document.body.appendChild(liveRegion);
    }

    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + Enter to start analysis
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            if (this.currentStep === 2) {
                this.startAnalysis();
            }
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            this.hideDataHandling();
        }
        
        // Tab navigation for results
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            const activeTab = document.querySelector('.results-tab.active');
            if (activeTab && document.activeElement === activeTab) {
                e.preventDefault();
                const tabs = Array.from(document.querySelectorAll('.results-tab'));
                const currentIndex = tabs.indexOf(activeTab);
                const nextIndex = e.key === 'ArrowRight' 
                    ? (currentIndex + 1) % tabs.length 
                    : (currentIndex - 1 + tabs.length) % tabs.length;
                
                tabs[nextIndex].focus();
                tabs[nextIndex].click();
            }
        }
    }

    showToast(message, type = 'info', duration = 5000) {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type} toast-enter`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        toast.innerHTML = `
            <div class="flex items-center space-x-3">
                <i class="${icons[type]} text-lg"></i>
                <span class="flex-1">${message}</span>
                <button class="text-gray-400 hover:text-white ml-2">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Add close functionality
        toast.querySelector('button').addEventListener('click', () => {
            this.removeToast(toast);
        });

        container.appendChild(toast);

        // Trigger enter animation
        setTimeout(() => {
            toast.classList.remove('toast-enter');
            toast.classList.add('toast-enter-active');
        }, 10);

        // Auto remove
        setTimeout(() => {
            this.removeToast(toast);
        }, duration);

        // Update live region for screen readers
        const liveRegion = document.getElementById('liveRegion');
        if (liveRegion) {
            liveRegion.textContent = message;
        }
    }

    removeToast(toast) {
        toast.classList.remove('toast-enter-active');
        toast.classList.add('toast-exit');
        
        setTimeout(() => {
            toast.remove();
        }, 300);
    }

    // Results rendering methods will be implemented in separate files
    async renderOverviewTab(data) {
        // Implementation in components/results-tabs.js
        if (window.ResultsTabs) {
            await window.ResultsTabs.renderOverview(data);
        }
    }

    async renderSkillsGapTab(data) {
        if (window.ResultsTabs) {
            await window.ResultsTabs.renderSkillsGap(data);
        }
    }

    async renderEvidenceTab(data) {
        if (window.ResultsTabs) {
            await window.ResultsTabs.renderEvidence(data);
        }
    }

    async renderRecommendationsTab(data) {
        if (window.ResultsTabs) {
            await window.ResultsTabs.renderRecommendations(data);
        }
    }

    async renderATSChecksTab(data) {
        if (window.ResultsTabs) {
            await window.ResultsTabs.renderATSChecks(data);
        }
    }

    updateResultsWithWeights() {
        if (this.analysisData && window.ResultsTabs) {
            window.ResultsTabs.updateWithWeights(this.analysisData, this.weights);
        }
    }
}

// Initialize workspace when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.analysisWorkspace = new AnalysisWorkspace();
});

// Export for use in other modules
window.AnalysisWorkspace = AnalysisWorkspace;