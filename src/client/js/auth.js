// Authentication Module
class AuthManager {
    constructor() {
        this.elements = this.cacheElements();
    }

    cacheElements() {
        return {
            authButtons: document.getElementById('authButtons'),
            userMenu: document.getElementById('userMenu'),
            userEmail: document.getElementById('userEmail'),
            mobileAuthButtons: document.getElementById('mobileAuthButtons'),
            mobileUserMenu: document.getElementById('mobileUserMenu'),
            mobileUserEmail: document.getElementById('mobileUserEmail'),
            authModal: document.getElementById('authModal'),
            authError: document.getElementById('authError'),
            loginTab: document.getElementById('loginTab'),
            registerTab: document.getElementById('registerTab'),
            loginForm: document.getElementById('loginForm'),
            registerForm: document.getElementById('registerForm')
        };
    }

    async checkAuthStatus() {
        try {
            const response = await fetch(`${APP_CONFIG.API_BASE_URL}/auth/me`, {
                method: 'GET',
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                AppState.currentUser = data.data.user;
            } else {
                AppState.currentUser = null;
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            AppState.currentUser = null;
        }
        
        this.updateAuthUI();
    }

    updateAuthUI() {
        const isLoggedIn = AppState.currentUser && AppState.currentUser.email;
        
        // Desktop UI
        this.elements.authButtons?.classList.toggle('hidden', isLoggedIn);
        this.elements.userMenu?.classList.toggle('hidden', !isLoggedIn);
        if (isLoggedIn && this.elements.userEmail) {
            this.elements.userEmail.textContent = AppState.currentUser.email;
        }

        // Mobile UI
        this.elements.mobileAuthButtons?.classList.toggle('hidden', isLoggedIn);
        this.elements.mobileUserMenu?.classList.toggle('hidden', !isLoggedIn);
        if (isLoggedIn && this.elements.mobileUserEmail) {
            this.elements.mobileUserEmail.textContent = AppState.currentUser.email;
        }
    }

    showAuthModal() {
        this.elements.authModal?.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        this.clearAuthError();
    }

    hideAuthModal() {
        this.elements.authModal?.classList.add('hidden');
        document.body.style.overflow = 'auto';
        this.clearAuthError();
    }

    showAuthError(message) {
        if (this.elements.authError) {
            this.elements.authError.textContent = message;
            this.elements.authError.classList.remove('hidden');
        }
    }

    clearAuthError() {
        if (this.elements.authError) {
            this.elements.authError.classList.add('hidden');
            this.elements.authError.textContent = '';
        }
    }

    switchToLogin() {
        this.elements.loginTab?.classList.add('bg-primary', 'text-white');
        this.elements.loginTab?.classList.remove('text-gray-300');
        this.elements.registerTab?.classList.remove('bg-primary', 'text-white');
        this.elements.registerTab?.classList.add('text-gray-300');
        this.elements.loginForm?.classList.remove('hidden');
        this.elements.registerForm?.classList.add('hidden');
    }

    switchToRegister() {
        this.elements.registerTab?.classList.add('bg-primary', 'text-white');
        this.elements.registerTab?.classList.remove('text-gray-300');
        this.elements.loginTab?.classList.remove('bg-primary', 'text-white');
        this.elements.loginTab?.classList.add('text-gray-300');
        this.elements.registerForm?.classList.remove('hidden');
        this.elements.loginForm?.classList.add('hidden');
    }

    async handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = formData.get('loginEmail');
        const password = formData.get('loginPassword');

        try {
            const response = await fetch(`${APP_CONFIG.API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            
            if (response.ok) {
                AppState.currentUser = data.data.user;
                this.updateAuthUI();
                this.hideAuthModal();
            } else {
                this.showAuthError(data.error?.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showAuthError('Login failed. Please try again.');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = formData.get('registerEmail');
        const password = formData.get('registerPassword');
        const confirmPassword = formData.get('confirmPassword');

        if (password !== confirmPassword) {
            this.showAuthError('Passwords do not match');
            return;
        }

        try {
            const response = await fetch(`${APP_CONFIG.API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            
            if (response.ok) {
                AppState.currentUser = data.data.user;
                this.updateAuthUI();
                this.hideAuthModal();
            } else {
                this.showAuthError(data.error?.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showAuthError('Registration failed. Please try again.');
        }
    }

    async handleLogout() {
        try {
            await fetch(`${APP_CONFIG.API_BASE_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Logout request failed:', error);
        }
        
        AppState.currentUser = null;
        this.updateAuthUI();
    }
}