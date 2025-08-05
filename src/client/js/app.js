// Main Application Entry Point
class App {
    constructor() {
        this.authManager = null;
        this.analysisManager = null;
        this.init();
    }

    async init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeApp());
        } else {
            this.initializeApp();
        }
    }

    initializeApp() {
        // Render UI components
        this.renderUI();
        
        // Initialize managers
        this.authManager = new AuthManager();
        this.analysisManager = new AnalysisManager();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Check authentication status
        this.authManager.checkAuthStatus();
        
        console.log('Clearsight IP application initialized');
    }

    renderUI() {
        // Render navigation
        const navigation = document.getElementById('navigation');
        if (navigation) {
            navigation.innerHTML = UIManager.renderNavigation();
        }

        // Render main content
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.innerHTML = UIManager.renderMainContent();
        }

        // Render modals
        const modals = document.getElementById('modals');
        if (modals) {
            modals.innerHTML = UIManager.renderModals();
        }
    }

    setupEventListeners() {
        // Auth event listeners
        this.setupAuthEventListeners();
        
        // Analysis event listeners
        this.setupAnalysisEventListeners();
        
        // UI event listeners
        this.setupUIEventListeners();
    }

    setupAuthEventListeners() {
        // Login/Register buttons
        document.getElementById('headerLoginBtn')?.addEventListener('click', () => {
            this.authManager.showAuthModal();
        });
        
        document.getElementById('headerRegisterBtn')?.addEventListener('click', () => {
            this.authManager.showAuthModal();
            this.authManager.switchToRegister();
        });
        
        document.getElementById('mobileLoginBtn')?.addEventListener('click', () => {
            this.authManager.showAuthModal();
            this.toggleMobileMenu();
        });
        
        document.getElementById('mobileRegisterBtn')?.addEventListener('click', () => {
            this.authManager.showAuthModal();
            this.authManager.switchToRegister();
            this.toggleMobileMenu();
        });

        // Modal controls
        document.getElementById('closeAuthModal')?.addEventListener('click', () => {
            this.authManager.hideAuthModal();
        });

        // Tab switching
        document.getElementById('loginTab')?.addEventListener('click', () => {
            this.authManager.switchToLogin();
        });
        
        document.getElementById('registerTab')?.addEventListener('click', () => {
            this.authManager.switchToRegister();
        });

        // Form submissions
        document.getElementById('loginForm')?.addEventListener('submit', (e) => {
            this.authManager.handleLogin(e);
        });
        
        document.getElementById('registerForm')?.addEventListener('submit', (e) => {
            this.authManager.handleRegister(e);
        });

        // Logout buttons
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            this.authManager.handleLogout();
        });
        
        document.getElementById('mobileLogoutBtn')?.addEventListener('click', () => {
            this.authManager.handleLogout();
        });
    }

    setupAnalysisEventListeners() {
        // Analysis interface
        document.getElementById('analyzeSkillsBtn')?.addEventListener('click', () => {
            this.analysisManager.showAnalysisInterface();
        });
        
        document.getElementById('closeAnalysisInterface')?.addEventListener('click', () => {
            this.analysisManager.hideAnalysisInterface();
        });
        
        document.getElementById('cancelAnalysisBtn')?.addEventListener('click', () => {
            this.analysisManager.hideAnalysisInterface();
        });
        
        document.getElementById('startAnalysisBtn')?.addEventListener('click', () => {
            this.analysisManager.performAnalysis();
        });

        // File handling
        this.setupFileHandlers();
    }

    setupFileHandlers() {
        const cvFileInput = document.getElementById('cvFileInput');
        const jobFileInput = document.getElementById('jobFileInput');
        const cvDropZone = document.getElementById('cvDropZone');
        const jobDropZone = document.getElementById('jobDropZone');

        // File input changes
        cvFileInput?.addEventListener('change', (e) => {
            this.analysisManager.handleFileSelect(e.target.files[0], 'cv');
        });
        
        jobFileInput?.addEventListener('change', (e) => {
            this.analysisManager.handleFileSelect(e.target.files[0], 'job');
        });

        // Drop zone clicks
        cvDropZone?.addEventListener('click', () => cvFileInput?.click());
        jobDropZone?.addEventListener('click', () => jobFileInput?.click());

        // Drag and drop
        this.setupDragAndDrop(cvDropZone, 'cv');
        this.setupDragAndDrop(jobDropZone, 'job');

        // Remove file buttons
        document.getElementById('removeCvFile')?.addEventListener('click', () => {
            this.analysisManager.clearFile('cv');
        });
        
        document.getElementById('removeJobFile')?.addEventListener('click', () => {
            this.analysisManager.clearFile('job');
        });
    }

    setupDragAndDrop(dropZone, type) {
        if (!dropZone) return;

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('border-primary');
        });

        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropZone.classList.remove('border-primary');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('border-primary');
            this.analysisManager.handleFileSelect(e.dataTransfer.files[0], type);
        });
    }

    setupUIEventListeners() {
        // Mobile menu
        document.getElementById('mobileMenuBtn')?.addEventListener('click', () => {
            this.toggleMobileMenu();
        });

        // Demo button
        document.getElementById('startDemoBtn')?.addEventListener('click', () => {
            this.startDemo();
        });

        // Smooth scrolling for navigation links
        this.setupSmoothScrolling();

        // Modal outside clicks
        document.getElementById('authModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'authModal') {
                this.authManager.hideAuthModal();
            }
        });
        
        document.getElementById('analysisInterface')?.addEventListener('click', (e) => {
            if (e.target.id === 'analysisInterface') {
                this.analysisManager.hideAnalysisInterface();
            }
        });
    }

    setupSmoothScrolling() {
        // Handle navigation link clicks for smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    // Close mobile menu if open
                    const mobileMenu = document.getElementById('mobileMenu');
                    if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                        mobileMenu.classList.add('hidden');
                    }
                }
            });
        });
    }

    startDemo() {
        // Show the analysis interface with demo data
        this.analysisManager.showAnalysisInterface();
        // You could pre-populate with demo data here
        console.log('Starting interactive demo...');
    }

    toggleMobileMenu() {
        const mobileMenu = document.getElementById('mobileMenu');
        mobileMenu?.classList.toggle('hidden');
    }
}

// Global instances for external access
let authManager, analysisManager;

// Initialize the application
const app = new App();

// Make managers globally available for onclick handlers
window.addEventListener('load', () => {
    authManager = app.authManager;
    analysisManager = app.analysisManager;
});