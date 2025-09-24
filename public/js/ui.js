// UI Helpers
// Make functions global so they can be called from HTML
window.toggleDarkMode = function(){
    document.body.classList.toggle('dark');
    localStorage.setItem('dark', document.body.classList.contains('dark'));
}
