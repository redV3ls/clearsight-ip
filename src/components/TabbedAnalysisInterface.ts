/**
 * Tabbed Analysis Interface Component
 * A modern tabbed interface for CV analysis replacing the modal approach
 */

export interface TabConfig {
  id: string;
  label: string;
  icon: string;
  enabled: boolean;
}

export class TabbedAnalysisInterface {
  private activeTab: number = 0;
  private tabs: TabConfig[] = [
    { id: 'upload', label: 'Upload Resume', icon: 'fa-upload', enabled: true },
    { id: 'job', label: 'Job Description', icon: 'fa-briefcase', enabled: false },
    { id: 'analysis', label: 'Analysis', icon: 'fa-brain', enabled: false }
  ];
  
  private cvFile: File | null = null;
  private jobFile: File | null = null;
  private cvText: string = '';
  private jobText: string = '';
  private analysisResult: any = null;

  constructor(private containerId: string) {
    this.init();
  }

  private init(): void {
    const container = document.getElementById(this.containerId);
    if (!container) return;
    
    container.innerHTML = this.render();
    this.attachEventListeners();
  }

  private render(): string {
    return `
      <div class="tabbed-analysis-container bg-slate-800 rounded-lg shadow-2xl">
        <!-- Tab Navigation -->
        <div class="tab-navigation border-b border-slate-700">
          <div class="flex">
            ${this.tabs.map((tab, index) => this.renderTab(tab, index)).join('')}
          </div>
        </div>
        
        <!-- Tab Content -->
        <div class="tab-content">
          ${this.renderTabContent()}
        </div>
      </div>
    `;
  }

  private renderTab(tab: TabConfig, index: number): string {
    const isActive = index === this.activeTab;
    const isDisabled = !tab.enabled;
    
    return `
      <button 
        class="tab-button ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}"
        data-tab-index="${index}"
        ${isDisabled ? 'disabled' : ''}
      >
        <i class="fas ${tab.icon} mr-2"></i>
        <span>${tab.label}</span>
        ${index > 0 ? `<span class="tab-step ml-2 text-xs">${index}</span>` : ''}
      </button>
    `;
  }

  private renderTabContent(): string {
    switch (this.activeTab) {
      case 0:
        return this.renderUploadTab();
      case 1:
        return this.renderJobTab();
      case 2:
        return this.renderAnalysisTab();
      default:
        return '';
    }
  }

  private renderUploadTab(): string {
    return `
      <div class="tab-panel p-6" id="upload-tab">
        <div class="max-w-2xl mx-auto">
          <h2 class="text-2xl font-bold text-white mb-6">
            <i class="fas fa-file-alt text-primary mr-3"></i>
            Upload Your Resume
          </h2>
          
          <p class="text-gray-400 mb-6">
            Upload your CV or paste your resume text to get started with AI-powered analysis
          </p>
          
          <!-- File Upload Area -->
          <div class="upload-area mb-6">
            <div id="cv-drop-zone" class="drop-zone border-2 border-dashed border-slate-600 hover:border-primary rounded-lg p-8 text-center cursor-pointer transition-all">
              <i class="fas fa-cloud-upload-alt text-5xl text-slate-500 mb-4"></i>
              <p class="text-gray-300 text-lg mb-2">Drop your resume here</p>
              <p class="text-gray-500 text-sm mb-4">or click to browse</p>
              <button class="bg-primary hover:bg-primary/80 text-white px-6 py-2 rounded-lg transition-colors">
                Choose File
              </button>
              <p class="text-xs text-gray-500 mt-4">PDF, DOC, DOCX, TXT (Max 5MB)</p>
              <input type="file" id="cv-file-input" class="hidden" accept=".pdf,.doc,.docx,.txt">
            </div>
            
            <!-- File Info (hidden by default) -->
            <div id="cv-file-info" class="hidden mt-4 p-4 bg-slate-700 rounded-lg">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <i class="fas fa-file-alt text-primary text-xl mr-3"></i>
                  <div>
                    <p id="cv-file-name" class="text-white font-medium"></p>
                    <p id="cv-file-size" class="text-gray-400 text-sm"></p>
                  </div>
                </div>
                <button id="cv-remove-btn" class="text-red-400 hover:text-red-300 transition-colors">
                  <i class="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>
          </div>
          
          <!-- OR Divider -->
          <div class="flex items-center my-6">
            <div class="flex-1 h-px bg-slate-600"></div>
            <span class="px-4 text-gray-500">OR</span>
            <div class="flex-1 h-px bg-slate-600"></div>
          </div>
          
          <!-- Text Input Area -->
          <div class="text-input-area mb-6">
            <label class="block text-gray-300 mb-2">Paste your resume content</label>
            <textarea 
              id="cv-text-input"
              class="w-full h-40 bg-slate-700 border border-slate-600 rounded-lg p-4 text-gray-200 placeholder-gray-500 resize-none focus:border-primary focus:outline-none transition-colors"
              placeholder="Paste your resume content here..."
            ></textarea>
            <div class="flex justify-between mt-2">
              <span id="cv-char-count" class="text-sm text-gray-500">0 characters</span>
              <span id="cv-token-estimate" class="text-sm text-gray-500">~0 tokens</span>
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div class="flex justify-between">
            <button class="text-gray-400 hover:text-white transition-colors">
              <i class="fas fa-info-circle mr-2"></i>
              How it works
            </button>
            <button 
              id="continue-to-job-btn"
              class="bg-primary hover:bg-primary/80 text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled
            >
              Continue
              <i class="fas fa-arrow-right ml-2"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private renderJobTab(): string {
    return `
      <div class="tab-panel p-6" id="job-tab">
        <div class="max-w-2xl mx-auto">
          <h2 class="text-2xl font-bold text-white mb-6">
            <i class="fas fa-briefcase text-primary mr-3"></i>
            Job Description (Optional)
          </h2>
          
          <p class="text-gray-400 mb-6">
            Add a job description for targeted skills gap analysis and job fit assessment
          </p>
          
          <!-- Skip Notice -->
          <div class="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
            <div class="flex items-center">
              <i class="fas fa-info-circle text-blue-400 mr-3"></i>
              <p class="text-blue-300 text-sm">
                This step is optional. Skip it for a general career analysis or add a job description for specific job fit insights.
              </p>
            </div>
          </div>
          
          <!-- File Upload Area -->
          <div class="upload-area mb-6">
            <div id="job-drop-zone" class="drop-zone border-2 border-dashed border-slate-600 hover:border-primary rounded-lg p-6 text-center cursor-pointer transition-all">
              <i class="fas fa-briefcase text-4xl text-slate-500 mb-3"></i>
              <p class="text-gray-300 mb-2">Drop job description here</p>
              <button class="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                Choose File
              </button>
              <input type="file" id="job-file-input" class="hidden" accept=".pdf,.doc,.docx,.txt">
            </div>
            
            <!-- File Info (hidden by default) -->
            <div id="job-file-info" class="hidden mt-4 p-4 bg-slate-700 rounded-lg">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <i class="fas fa-file-alt text-primary text-xl mr-3"></i>
                  <div>
                    <p id="job-file-name" class="text-white font-medium"></p>
                    <p id="job-file-size" class="text-gray-400 text-sm"></p>
                  </div>
                </div>
                <button id="job-remove-btn" class="text-red-400 hover:text-red-300 transition-colors">
                  <i class="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>
          </div>
          
          <!-- OR Divider -->
          <div class="flex items-center my-6">
            <div class="flex-1 h-px bg-slate-600"></div>
            <span class="px-4 text-gray-500">OR</span>
            <div class="flex-1 h-px bg-slate-600"></div>
          </div>
          
          <!-- Text Input Area -->
          <div class="text-input-area mb-6">
            <label class="block text-gray-300 mb-2">Paste job description</label>
            <textarea 
              id="job-text-input"
              class="w-full h-32 bg-slate-700 border border-slate-600 rounded-lg p-4 text-gray-200 placeholder-gray-500 resize-none focus:border-primary focus:outline-none transition-colors"
              placeholder="Paste the job description here..."
            ></textarea>
            <div class="flex justify-between mt-2">
              <span id="job-char-count" class="text-sm text-gray-500">0 characters</span>
              <span id="job-token-estimate" class="text-sm text-gray-500">~0 tokens</span>
            </div>
          </div>
          
          <!-- Analysis Type Indicator -->
          <div class="bg-slate-700 rounded-lg p-4 mb-6">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-white font-medium mb-1">Analysis Type</h4>
                <p id="analysis-type-text" class="text-gray-400 text-sm">
                  General Career Analysis
                </p>
              </div>
              <i id="analysis-type-icon" class="fas fa-user-tie text-2xl text-primary"></i>
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div class="flex justify-between">
            <button 
              id="back-to-upload-btn"
              class="border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white px-6 py-3 rounded-lg transition-colors"
            >
              <i class="fas fa-arrow-left mr-2"></i>
              Back
            </button>
            <div class="flex gap-3">
              <button 
                id="skip-job-btn"
                class="border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white px-6 py-3 rounded-lg transition-colors"
              >
                Skip
                <i class="fas fa-forward ml-2"></i>
              </button>
              <button 
                id="start-analysis-btn"
                class="bg-primary hover:bg-primary/80 text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Start Analysis
                <i class="fas fa-play ml-2"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private renderAnalysisTab(): string {
    return `
      <div class="tab-panel p-6" id="analysis-tab">
        <!-- Loading State -->
        <div id="analysis-loading" class="text-center py-12">
          <div class="relative mb-8">
            <div class="animate-spin w-20 h-20 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <div class="absolute inset-0 flex items-center justify-center">
              <i class="fas fa-brain text-primary text-2xl animate-pulse"></i>
            </div>
          </div>
          <h3 class="text-2xl font-bold text-gray-200 mb-4">
            AI Analysis in Progress...
          </h3>
          <div class="bg-slate-700 rounded-lg p-6 max-w-md mx-auto">
            <p class="text-gray-300">Our AI is analyzing your profile</p>
            <p id="progress-message" class="mt-3 text-sm text-primary animate-pulse font-medium">Initializing AI...</p>
          </div>
        </div
        
        <!-- Results (hidden initially) -->
        <div id="analysis-results" class="hidden">
          <div class="max-w-4xl mx-auto">
            <h2 class="text-2xl font-bold text-white mb-6">
              <i class="fas fa-chart-line text-primary mr-3"></i>
              Analysis Results
            </h2>
            
            <div id="results-content" class="space-y-6">
              <!-- Results will be populated here -->
            </div>
            
            <!-- Action Buttons -->
            <div class="flex justify-center gap-4 mt-8">
              <button 
                id="new-analysis-btn"
                class="bg-primary hover:bg-primary/80 text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                <i class="fas fa-plus mr-2"></i>
                New Analysis
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private attachEventListeners(): void {
    // Tab navigation
    document.querySelectorAll('.tab-button').forEach((button) => {
      button.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const tabIndex = parseInt(target.dataset.tabIndex || '0');
        if (!target.classList.contains('disabled')) {
          this.switchTab(tabIndex);
        }
      });
    });

    // File upload handlers
    this.setupFileUpload('cv');
    this.setupFileUpload('job');

    // Text input handlers
    this.setupTextInput('cv');
    this.setupTextInput('job');

    // Button handlers
    this.setupButtonHandlers();
  }

  private setupFileUpload(type: 'cv' | 'job'): void {
    const dropZone = document.getElementById(`${type}-drop-zone`);
    const fileInput = document.getElementById(`${type}-file-input`) as HTMLInputElement;
    const removeBtn = document.getElementById(`${type}-remove-btn`);

    if (dropZone && fileInput) {
      // Click to upload
      dropZone.addEventListener('click', () => fileInput.click());

      // File selection
      fileInput.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files[0]) {
          this.handleFileSelect(target.files[0], type);
        }
      });

      // Drag and drop
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('border-primary', 'bg-primary/5');
      });

      dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('border-primary', 'bg-primary/5');
      });

      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-primary', 'bg-primary/5');
        
        if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
          this.handleFileSelect(e.dataTransfer.files[0], type);
        }
      });
    }

    // Remove file
    if (removeBtn) {
      removeBtn.addEventListener('click', () => this.clearFile(type));
    }
  }

  private setupTextInput(type: 'cv' | 'job'): void {
    const textInput = document.getElementById(`${type}-text-input`) as HTMLTextAreaElement;
    const charCount = document.getElementById(`${type}-char-count`);
    const tokenEstimate = document.getElementById(`${type}-token-estimate`);

    if (textInput) {
      textInput.addEventListener('input', () => {
        const text = textInput.value;
        if (type === 'cv') {
          this.cvText = text;
        } else {
          this.jobText = text;
          this.updateAnalysisType();
        }

        // Update counts
        if (charCount) {
          charCount.textContent = `${text.length} characters`;
        }
        if (tokenEstimate) {
          const tokens = Math.ceil(text.length / 4); // Rough estimate
          tokenEstimate.textContent = `~${tokens} tokens`;
        }

        // Update continue button state
        this.updateButtonStates();
      });
    }
  }

  private setupButtonHandlers(): void {
    // Continue to job button
    const continueBtn = document.getElementById('continue-to-job-btn');
    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        this.tabs[1].enabled = true;
        this.switchTab(1);
      });
    }

    // Back to upload button
    const backBtn = document.getElementById('back-to-upload-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => this.switchTab(0));
    }

    // Skip job button
    const skipBtn = document.getElementById('skip-job-btn');
    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        this.jobFile = null;
        this.jobText = '';
        this.startAnalysis();
      });
    }

    // Start analysis button
    const startBtn = document.getElementById('start-analysis-btn');
    if (startBtn) {
      startBtn.addEventListener('click', () => this.startAnalysis());
    }

    // New analysis button
    const newBtn = document.getElementById('new-analysis-btn');
    if (newBtn) {
      newBtn.addEventListener('click', () => this.resetAnalysis());
    }
  }

  private handleFileSelect(file: File, type: 'cv' | 'job'): void {
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ['application/pdf', 'application/msword', 
                           'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                           'text/plain'];

    if (file.size > MAX_SIZE) {
      this.showError(`File too large. Maximum size is 5MB.`);
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      this.showError(`Invalid file type. Please upload PDF, DOC, DOCX, or TXT files.`);
      return;
    }

    // Store file
    if (type === 'cv') {
      this.cvFile = file;
    } else {
      this.jobFile = file;
    }

    // Update UI
    const fileInfo = document.getElementById(`${type}-file-info`);
    const fileName = document.getElementById(`${type}-file-name`);
    const fileSize = document.getElementById(`${type}-file-size`);

    if (fileInfo && fileName && fileSize) {
      fileName.textContent = file.name;
      fileSize.textContent = this.formatFileSize(file.size);
      fileInfo.classList.remove('hidden');
    }

    this.updateButtonStates();
    
    if (type === 'job') {
      this.updateAnalysisType();
    }
  }

  private clearFile(type: 'cv' | 'job'): void {
    if (type === 'cv') {
      this.cvFile = null;
    } else {
      this.jobFile = null;
    }

    const fileInfo = document.getElementById(`${type}-file-info`);
    const fileInput = document.getElementById(`${type}-file-input`) as HTMLInputElement;

    if (fileInfo) {
      fileInfo.classList.add('hidden');
    }
    if (fileInput) {
      fileInput.value = '';
    }

    this.updateButtonStates();
    
    if (type === 'job') {
      this.updateAnalysisType();
    }
  }

  private updateAnalysisType(): void {
    const typeText = document.getElementById('analysis-type-text');
    const typeIcon = document.getElementById('analysis-type-icon');

    if (typeText && typeIcon) {
      if (this.jobFile || this.jobText) {
        typeText.textContent = 'Job Fit Analysis';
        typeIcon.className = 'fas fa-bullseye text-2xl text-green-400';
      } else {
        typeText.textContent = 'General Career Analysis';
        typeIcon.className = 'fas fa-user-tie text-2xl text-primary';
      }
    }
  }

  private updateButtonStates(): void {
    const continueBtn = document.getElementById('continue-to-job-btn') as HTMLButtonElement;
    
    if (continueBtn) {
      const hasCV = this.cvFile !== null || this.cvText.trim().length > 0;
      continueBtn.disabled = !hasCV;
    }
  }

  private switchTab(index: number): void {
    if (index < 0 || index >= this.tabs.length) return;
    
    this.activeTab = index;
    const container = document.getElementById(this.containerId);
    if (container) {
      container.innerHTML = this.render();
      this.attachEventListeners();
      
      // Restore form state
      this.restoreFormState();
    }
  }

  private restoreFormState(): void {
    // Restore CV text
    const cvTextInput = document.getElementById('cv-text-input') as HTMLTextAreaElement;
    if (cvTextInput && this.cvText) {
      cvTextInput.value = this.cvText;
      cvTextInput.dispatchEvent(new Event('input'));
    }

    // Restore job text
    const jobTextInput = document.getElementById('job-text-input') as HTMLTextAreaElement;
    if (jobTextInput && this.jobText) {
      jobTextInput.value = this.jobText;
      jobTextInput.dispatchEvent(new Event('input'));
    }

    // Restore file info displays
    if (this.cvFile) {
      this.handleFileSelect(this.cvFile, 'cv');
    }
    if (this.jobFile) {
      this.handleFileSelect(this.jobFile, 'job');
    }
  }

  private async startAnalysis(): Promise<void> {
    this.tabs[2].enabled = true;
    this.switchTab(2);

    // Start loading animation
    this.animateProgress();

    try {
      const formData = new FormData();
      
      if (this.cvFile) {
        formData.append('resume', this.cvFile);
      } else if (this.cvText) {
        formData.append('resumeText', this.cvText);
      }

      if (this.jobFile) {
        formData.append('jobDescription', this.jobFile);
      } else if (this.jobText) {
        formData.append('jobDescriptionText', this.jobText);
      }

      const response = await fetch('/api/v1/analyze/resume', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        this.analysisResult = data;
        this.showResults();
      } else {
        throw new Error(data.error?.message || 'Analysis failed');
      }
    } catch (error) {
      this.showError('Analysis failed. Please try again.');
      console.error('Analysis error:', error);
    }
  }

  private animateProgress(): void {
    const messages = [
      'Analyzing your resume...',
      'Extracting skills and experience...',
      'Identifying career patterns...',
      'Generating insights...',
      'Preparing recommendations...'
    ];

    let progress = 0;
    let messageIndex = 0;

    const progressBar = document.getElementById('progress-bar') as HTMLElement;
    const progressMessage = document.getElementById('progress-message');

    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      
      if (progress > 95) {
        progress = 95;
      }

      if (progressBar) {
        progressBar.style.width = `${progress}%`;
      }

      if (progressMessage && messageIndex < messages.length) {
        progressMessage.textContent = messages[messageIndex];
        messageIndex++;
      }

      if (this.analysisResult) {
        clearInterval(interval);
        if (progressBar) {
          progressBar.style.width = '100%';
        }
        if (progressMessage) {
          progressMessage.textContent = 'Analysis complete!';
        }
      }
    }, 1000);
  }

  private showResults(): void {
    const loadingDiv = document.getElementById('analysis-loading');
    const resultsDiv = document.getElementById('analysis-results');

    if (loadingDiv && resultsDiv) {
      loadingDiv.classList.add('hidden');
      resultsDiv.classList.remove('hidden');

      // Populate results
      const resultsContent = document.getElementById('results-content');
      if (resultsContent && this.analysisResult) {
        resultsContent.innerHTML = this.formatResults(this.analysisResult);
      }
    }
  }

  private formatResults(data: any): string {
    // Format and display the analysis results
    return `
      <div class="bg-green-900/20 border border-green-500/30 rounded-lg p-6">
        <div class="flex items-center text-green-400 mb-4">
          <i class="fas fa-check-circle text-2xl mr-3"></i>
          <h3 class="text-xl font-bold">Analysis Complete</h3>
        </div>
        <p class="text-gray-300">
          Your personalized career insights are ready. The AI has analyzed your profile
          and identified key opportunities for growth.
        </p>
      </div>
      
      <!-- Add more result sections here based on the actual data -->
    `;
  }

  private resetAnalysis(): void {
    this.cvFile = null;
    this.jobFile = null;
    this.cvText = '';
    this.jobText = '';
    this.analysisResult = null;
    this.activeTab = 0;
    this.tabs[1].enabled = false;
    this.tabs[2].enabled = false;
    
    this.init();
  }


  private showError(message: string): void {
    // Show error notification
    console.error(message);
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

// Export for use in other modules
export default TabbedAnalysisInterface;
