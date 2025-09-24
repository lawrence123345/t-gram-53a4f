// UI Helpers
function toggleDarkMode(){
    document.body.classList.toggle('dark');
    localStorage.setItem('dark', document.body.classList.contains('dark'));
}
