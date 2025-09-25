// UI Helpers
// Make functions global so they can be called from HTML
window.updateToggleText = function() {
    const toggleLink = document.querySelector('#nav-links a[onclick*="toggleDarkMode"]');
    if (toggleLink) {
        toggleLink.textContent = document.body.classList.contains('dark') ? 'Light Mode' : 'Dark Mode';
    }
};

window.toggleDarkMode = function(){
    document.body.classList.toggle('dark');
    localStorage.setItem('dark', document.body.classList.contains('dark'));
    updateToggleText();
}
