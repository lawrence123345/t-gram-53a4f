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

// Global messages array for interconnected feedback
window.messages = [];

// ModalManager for unified message box system
const ModalManager = {
    // Show or update a modal with content and type (info, success, error)
    showModal: function(id, content, type = 'info') {
        let modal = document.getElementById(id);
        if (!modal) {
            // Create modal if it doesn't exist
            modal = this.createModal(id);
            document.body.appendChild(modal);
        }
        const contentDiv = modal.querySelector('.modal-content');
        contentDiv.innerHTML = content;
        modal.style.display = 'flex';
        modal.classList.add('show', type);
        this.addCloseListeners(modal);
        // Push to messages if it's feedback
        if (type !== 'info') {
            window.messages.push({ type: type, content: content, timestamp: Date.now() });
        }
    },

    // Hide a modal
    hideModal: function(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.remove('show');
            modal.style.display = 'none';
        }
    },

    // Show a temporary alert
    showAlert: function(message, type = 'success') {
        const alertId = 'alert-modal';
        const content = `
            <div class="alert-content">
                <p>${message}</p>
                <button onclick="ModalManager.hideModal('alert-modal')" class="btn">Close</button>
            </div>
        `;
        this.showModal(alertId, content, type);
        // Auto-hide after 3 seconds
        setTimeout(() => this.hideModal(alertId), 3000);
        // Push to messages
        window.messages.push({ type: type, content: message, timestamp: Date.now() });
    },

    // Show review modal with only wrong answers for learning
    showReview: function(wrongAnswers = [], stats = {}) {
        const wrongHtml = wrongAnswers.map((wa, i) => `<li>${i+1}. ${wa.question} <br> Your Answer: ${wa.userAnswer} <br> Correct: ${wa.answer} <br> Explanation: ${wa.explanation}</li>`).join('');
        const content = `
            <div class="review-content">
                <h3>Review Your Mistakes</h3>
                <h4>Incorrect Answers</h4>
                <ul class="wrong-list">${wrongHtml}</ul>
                <button onclick="window.ModalManager.hideModal('review-modal')" class="btn">Close</button>
            </div>
        `;
        this.showModal('review-modal', content, 'info');
    },

    // Create a standard modal structure
    createModal: function(id) {
        const modal = document.createElement('div');
        modal.id = id;
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content"></div>
        `;
        return modal;
    },

    // Add close listeners to modal (overlay click, ESC key)
    addCloseListeners: function(modal) {
        const overlay = modal.querySelector('.modal-overlay');
        overlay.onclick = () => this.hideModal(modal.id);
        // ESC key
        document.addEventListener('keydown', escListener);
        function escListener(e) {
            if (e.key === 'Escape') {
                this.hideModal(modal.id);
                document.removeEventListener('keydown', escListener);
            }
        }
    }
};

// Make ModalManager global
window.ModalManager = ModalManager;
