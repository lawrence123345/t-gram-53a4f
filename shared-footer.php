</main>
    
    <!-- Notification Toast -->
    <div id="toast" class="fixed top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50 hidden">
        <span id="toast-message">Notification</span>
    </div>
    
    <!-- Loading Spinner -->
    <div id="loading" class="fixed inset-0 bg-white/80 flex items-center justify-center z-50 hidden">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
    
    <!-- Scripts -->
    <script src="/public/js/config.js"></script>
    <script src="/public/js/ui.js"></script>
    <script src="/public/js/auth.js"></script>
    <script src="/public/js/profile.js"></script>
    <script src="/public/js/leaderboard.js"></script>
    <script src="/public/js/game.js"></script>
    <script src="/public/js/app.js"></script>
    
    <script>
        // Mobile menu toggle
        function toggleMobileMenu() {
            const menu = document.getElementById('mobile-menu');
            menu.classList.toggle('hidden');
        }
        
        // Language toggle
        function toggleLanguage() {
            const lang = document.getElementById('lang-text').textContent;
            if (lang === 'EN') {
                document.getElementById('lang-text').textContent = 'HI';
                document.getElementById('lang-text-mobile').textContent = 'HI';
                // Add Hindi translations here
            } else {
                document.getElementById('lang-text').textContent = 'EN';
                document.getElementById('lang-text-mobile').textContent = 'EN';
                // Add English translations here
            }
        }
        
        // Theme toggle
        function toggleTheme() {
            document.body.classList.toggle('dark');
            const icon = document.getElementById('theme-icon');
            const iconMobile = document.getElementById('theme-icon-mobile');
            if (document.body.classList.contains('dark')) {
                icon.className = 'fas fa-sun';
                iconMobile.className = 'fas fa-sun';
            } else {
                icon.className = 'fas fa-moon';
                iconMobile.className = 'fas fa-moon';
            }
        }
        
        // Toast notification
        function showToast(message, type = 'info') {
            const toast = document.getElementById('toast');
            const toastMessage = document.getElementById('toast-message');
            toastMessage.textContent = message;
            toast.className = `fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${type === 'success' ? 'bg-success' : type === 'error' ? 'bg-error' : 'bg-gray-800'} text-white`;
            toast.classList.remove('hidden');
            setTimeout(() => toast.classList.add('hidden'), 3000);
        }
        
        // Loading spinner
        function showLoading() {
            document.getElementById('loading').classList.remove('hidden');
        }
        
        function hideLoading() {
            document.getElementById('loading').classList.add('hidden');
        }
        
        // Dropdown toggle
        function toggleDropdown() {
            const dropdown = document.getElementById('home-dropdown');
            dropdown.classList.toggle('hidden');
        }
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (event) => {
            const dropdown = document.getElementById('home-dropdown');
            const button = event.target.closest('button');
            if (!dropdown.contains(event.target) && !button) {
                dropdown.classList.add('hidden');
            }
        });
        
        // Mobile dropdown toggle
        function toggleMobileDropdown() {
            const mobileDropdown = document.getElementById('mobile-home-dropdown');
            mobileDropdown.classList.toggle('hidden');
        }
        
        // Initialize app
        document.addEventListener('DOMContentLoaded', () => {
            renderHome();
        });
    </script>
</body>
</html>
