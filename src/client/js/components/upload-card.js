// Upload Card Component
window.UploadCard = {
    // Initialize upload cards
    init() {
        this.setupDragAndDrop();
        this.setupFileValidation();
        this.setupPasteHandling();
        this.setupCharacterCounting();
    },

    setupDragAndDrop() {
        const uploadCards = document.querySelectorAll('.upload-card');
        
        uploadCards.forEach(card => {
            const dropZone = card.querySelector('.drop-zone');
            const fileInput = card.querySelector('input[type="file"]');
            
            if (!dropZone || !fileInput) return;

            // Prevent default drag behaviors
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                dropZone.addEventListener(eventName, this.preventDefaults, false);
                document.body.addEventListener(eventName, this.preventDefaults, false);
            });

            // Highlight drop zone when item is dragged over it
            ['dragenter', 'dragover'].forEach(eventName => {
                dropZone.addEventListener(eventName, () => this.highlight(card), false);
            });

            ['dragleave', 'drop'].forEach(eventName => {
                dropZone.addEventListener(eventName, () => this.unhighlight(card), false);
            });

            // Handle dropped files
            dropZone.addEventListener('drop', (e) => this.handleDrop(e, fileInput), false);
            
            // Handle click to browse
            dropZone.addEventListener('click', () => fileInput.click());
        });
    },

    setupFileValidation() {
        const fileInputs = document.querySelectorAll('input[type="file"]');
        
        fileInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.validateAndProcessFile(file, input);
                }
            });
        });
    },

    setupPasteHandling() {
        const textAreas = document.querySelectorAll('textarea');
        
        textAreas.forEach(textarea => {
            textarea.addEventListener('paste', (e) => {
                // Handle file paste
                const items = e.clipboardData?.items;
                if (items) {
                    for (let item of items) {
                        if (item.kind === 'file') {
                            e.preventDefault();
                            const file = item.getAsFile();
                            if (file) {
                                this.handlePastedFile(file, textarea);
                            }
                        }
                    }
                }
                
                // Update character count after paste
                setTimeout(() => {
                    this.updateCharacterCount(textarea);
                    this.updateContinueButton();
                }, 10);
            });

            textarea.addEventListener('input', () => {
                this.updateCharacterCount(textarea);
                this.updateContinueButton();
            });
        });
    },

    setupCharacterCounting() {
        const textAreas = document.querySelectorAll('textarea');
        
        textAreas.forEach(textarea => {
            this.updateCharacterCount(textarea);
        });
    },

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    },

    highlight(card) {
        card.classList.add('drag-over');
    },

    unhighlight(card) {
        card.classList.remove('drag-over');
    },

    handleDrop(e, fileInput) {
        const dt = e.dataTransfer;
        const files = dt.files;

        if (files.length > 0) {
            const file = files[0];
            this.validateAndProcessFile(file, fileInput);
        }
    },

    validateAndProcessFile(file, input) {
        const validation = this.validateFile(file);
        
        if (!validation.valid) {
            this.showError(validation.error, input);
            return;
        }

        this.clearError(input);
        this.showFileInfo(file, input);
        this.parseFile(file, input);
    },

    validateFile(file) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ];

        if (file.size > maxSize) {
            return {
                valid: false,
                error: `File too large. Maximum size is ${this.formatFileSize(maxSize)}.`
            };
        }

        if (!allowedTypes.includes(file.type)) {
            return {
                valid: false,
                error: 'Invalid file type. Please upload PDF, DOC, DOCX, or TXT files only.'
            };
        }

        if (file.name.includes('../') || file.name.includes('..\\')) {
            return {
                valid: false,
                error: 'Invalid file name.'
            };
        }

        return { valid: true };
    },

    showFileInfo(file, input) {
        const card = input.closest('.upload-card');
        const dropZone = card.querySelector('.drop-zone');
        const fileInfo = card.querySelector('.file-info');
        const fileName = card.querySelector('[id$="FileName"]');
        const fileSize = card.querySelector('[id$="FileSize"]');

        if (fileName) fileName.textContent = file.name;
        if (fileSize) fileSize.textContent = this.formatFileSize(file.size);

        dropZone?.classList.add('hidden');
        fileInfo?.classList.remove('hidden');

        // Store file reference
        input.fileData = file;
    },

    async parseFile(file, input) {
        const card = input.closest('.upload-card');
        const parseStatus = card.querySelector('[id$="ParseStatus"]');
        
        if (!parseStatus) return;

        // Show parsing status
        parseStatus.classList.remove('hidden');
        parseStatus.innerHTML = `
            <div class="flex items-center space-x-2">
                <div class="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                <span class="text-sm text-gray-300">Parsing document...</span>
            </div>
        `;

        try {
            const text = await this.extractTextFromFile(file);
            
            // Show success status
            parseStatus.innerHTML = `
                <div class="flex items-center space-x-2">
                    <i class="fas fa-check text-green-400"></i>
                    <span class="text-sm text-green-400">Document parsed successfully</span>
                </div>
                <div class="text-xs text-gray-400 mt-1">${this.formatNumber(text.length)} characters extracted</div>
            `;

            // Store extracted text
            input.extractedText = text;
            
            // Update corresponding textarea
            const type = input.id.includes('resume') ? 'resume' : 'job';
            const textarea = document.getElementById(`${type}TextArea`);
            if (textarea && !textarea.value.trim()) {
                textarea.value = text;
                this.updateCharacterCount(textarea);
            }
            
            this.updateContinueButton();
            
        } catch (error) {
            // Show error status
            parseStatus.innerHTML = `
                <div class="flex items-center space-x-2">
                    <i class="fas fa-exclamation-triangle text-red-400"></i>
                    <span class="text-sm text-red-400">Failed to parse document</span>
                </div>
                <div class="text-xs text-gray-400 mt-1">Please try a different file or paste the content manually</div>
            `;
            
            console.error('File parsing error:', error);
            this.showToast('Failed to parse document. Please paste the content manually.', 'warning');
        }
    },

    async extractTextFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const text = e.target.result;
                
                // Basic text cleaning
                const cleanText = text
                    .replace(/\r\n/g, '\n')
                    .replace(/\r/g, '\n')
                    .replace(/\n{3,}/g, '\n\n')
                    .trim();
                
                resolve(cleanText);
            };
            
            reader.onerror = () => reject(new Error('Failed to read file'));
            
            if (file.type === 'text/plain') {
                reader.readAsText(file);
            } else if (file.type === 'application/pdf') {
                // For PDF files, we would need a PDF parsing library
                // For now, reject with instruction to use text area
                reject(new Error('PDF parsing requires server-side processing. Please copy and paste the text content.'));
            } else if (file.type.includes('word')) {
                // For Word files, we would need a Word parsing library
                reject(new Error('Word document parsing requires server-side processing. Please copy and paste the text content.'));
            } else {
                reject(new Error('Unsupported file type'));
            }
        });
    },

    handlePastedFile(file, textarea) {
        // Handle file pasted into textarea
        this.showToast('File pasted. Processing...', 'info');
        
        this.extractTextFromFile(file)
            .then(text => {
                textarea.value = text;
                this.updateCharacterCount(textarea);
                this.updateContinueButton();
                this.showToast('File content extracted successfully!', 'success');
            })
            .catch(error => {
                console.error('Paste file error:', error);
                this.showToast('Failed to extract text from pasted file.', 'error');
            });
    },

    removeFile(input) {
        const card = input.closest('.upload-card');
        const dropZone = card.querySelector('.drop-zone');
        const fileInfo = card.querySelector('.file-info');
        const parseStatus = card.querySelector('[id$="ParseStatus"]');

        // Reset UI
        dropZone?.classList.remove('hidden');
        fileInfo?.classList.add('hidden');
        parseStatus?.classList.add('hidden');

        // Clear file input
        input.value = '';
        delete input.fileData;
        delete input.extractedText;

        // Clear corresponding textarea
        const type = input.id.includes('resume') ? 'resume' : 'job';
        const textarea = document.getElementById(`${type}TextArea`);
        if (textarea) {
            textarea.value = '';
            this.updateCharacterCount(textarea);
        }

        this.updateContinueButton();
    },

    updateCharacterCount(textarea) {
        const text = textarea.value;
        const type = textarea.id.includes('resume') ? 'resume' : 'job';
        
        const charCount = document.getElementById(`${type}CharCount`);
        const tokenCount = document.getElementById(`${type}TokenCount`);
        
        if (charCount) {
            charCount.textContent = `${this.formatNumber(text.length)} characters`;
        }
        
        if (tokenCount) {
            const estimatedTokens = Math.ceil(text.length / 4);
            tokenCount.textContent = `~${this.formatNumber(estimatedTokens)} tokens`;
        }

        // Update color based on length
        const isLong = text.length > 10000;
        const isVeryLong = text.length > 50000;
        
        if (charCount) {
            charCount.className = `text-xs ${isVeryLong ? 'text-red-400' : isLong ? 'text-yellow-400' : 'text-gray-500'}`;
        }
        
        if (tokenCount) {
            tokenCount.className = `text-xs ${isVeryLong ? 'text-red-400' : isLong ? 'text-yellow-400' : 'text-gray-500'}`;
        }

        // Show warning for very long content
        if (isVeryLong && !textarea.dataset.warningShown) {
            this.showToast('Very long content may affect processing time and accuracy.', 'warning');
            textarea.dataset.warningShown = 'true';
        } else if (!isVeryLong) {
            delete textarea.dataset.warningShown;
        }
    },

    updateContinueButton() {
        const continueBtn = document.getElementById('continueToJob');
        if (!continueBtn) return;

        const resumeTextArea = document.getElementById('resumeTextArea');
        const resumeFileInput = document.getElementById('resumeFileInput');
        
        const hasResumeContent = (resumeTextArea?.value.trim()) || 
                                (resumeFileInput?.extractedText) || 
                                (resumeFileInput?.fileData);

        continueBtn.disabled = !hasResumeContent;
        continueBtn.classList.toggle('opacity-50', !hasResumeContent);
        continueBtn.classList.toggle('cursor-not-allowed', !hasResumeContent);

        // Update button text based on state
        if (hasResumeContent) {
            continueBtn.innerHTML = `
                Continue to Job Description
                <i class="fas fa-arrow-right ml-2"></i>
            `;
        } else {
            continueBtn.innerHTML = `
                Upload or paste resume to continue
                <i class="fas fa-upload ml-2"></i>
            `;
        }
    },

    showError(message, input) {
        const card = input.closest('.upload-card');
        let errorDiv = card.querySelector('.upload-error');
        
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'upload-error mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg';
            card.appendChild(errorDiv);
        }

        errorDiv.innerHTML = `
            <div class="flex items-center space-x-2">
                <i class="fas fa-exclamation-circle text-red-400"></i>
                <span class="text-sm text-red-400">${message}</span>
            </div>
        `;

        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.clearError(input);
        }, 5000);
    },

    clearError(input) {
        const card = input.closest('.upload-card');
        const errorDiv = card.querySelector('.upload-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    },

    showToast(message, type = 'info') {
        if (window.analysisWorkspace) {
            window.analysisWorkspace.showToast(message, type);
        } else {
            console.log(`Toast (${type}): ${message}`);
        }
    },

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    formatNumber(num) {
        return num.toLocaleString();
    },

    // Public API for external use
    getFileData(type) {
        const input = document.getElementById(`${type}FileInput`);
        return input?.fileData || null;
    },

    getExtractedText(type) {
        const input = document.getElementById(`${type}FileInput`);
        const textarea = document.getElementById(`${type}TextArea`);
        
        return input?.extractedText || textarea?.value.trim() || '';
    },

    clearAll() {
        const fileInputs = document.querySelectorAll('input[type="file"]');
        const textAreas = document.querySelectorAll('textarea');
        
        fileInputs.forEach(input => this.removeFile(input));
        textAreas.forEach(textarea => {
            textarea.value = '';
            this.updateCharacterCount(textarea);
        });
        
        this.updateContinueButton();
    },

    // Accessibility helpers
    setupAccessibility() {
        const dropZones = document.querySelectorAll('.drop-zone');
        
        dropZones.forEach(zone => {
            // Add keyboard navigation
            zone.setAttribute('tabindex', '0');
            zone.setAttribute('role', 'button');
            zone.setAttribute('aria-label', 'Upload file area. Press Enter or Space to browse files, or drag and drop files here.');
            
            zone.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const fileInput = zone.parentElement.querySelector('input[type="file"]');
                    fileInput?.click();
                }
            });

            zone.addEventListener('focus', () => {
                zone.classList.add('ring-2', 'ring-primary', 'ring-offset-2', 'ring-offset-slate-900');
            });

            zone.addEventListener('blur', () => {
                zone.classList.remove('ring-2', 'ring-primary', 'ring-offset-2', 'ring-offset-slate-900');
            });
        });

        // Add ARIA live region for status updates
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.id = 'upload-live-region';
        document.body.appendChild(liveRegion);
    },

    announceToScreenReader(message) {
        const liveRegion = document.getElementById('upload-live-region');
        if (liveRegion) {
            liveRegion.textContent = message;
        }
    }
};

// Initialize upload cards when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.UploadCard.init();
    window.UploadCard.setupAccessibility();
});

// Setup remove file buttons
document.addEventListener('DOMContentLoaded', () => {
    const removeButtons = document.querySelectorAll('[id$="RemoveBtn"]');
    
    removeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const type = button.id.includes('resume') ? 'resume' : 'job';
            const input = document.getElementById(`${type}FileInput`);
            if (input) {
                window.UploadCard.removeFile(input);
            }
        });
    });
});