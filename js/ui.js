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
        modal.style.opacity = '1';
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
                <button onclick="ModalManager.hideModal('alert-modal')" class="btn btn-small">Close</button>
            </div>
        `;
        this.showModal(alertId, content, type);
        // Push to messages
        window.messages.push({ type: type, content: message, timestamp: Date.now() });
    },

    // Show review modal with all answers: correct (green), incorrect/skipped (red), with stats
    showReview: function(allAnswers = [], stats = {}) {
        const correctAnswers = allAnswers.filter(a => a.isCorrect);
        const incorrectAnswers = allAnswers.filter(a => !a.isCorrect);

        const statsHtml = `
            <div class="stats-section" style="margin-bottom: 20px; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h3 style="margin: 0 0 10px 0; font-size: 1.5em;">📊 Game Stats</h3>
                <p style="margin: 5px 0;"><strong>Your Score:</strong> ${stats.userScore} | <strong>Opponent Score:</strong> ${stats.opponentScore}</p>
                <p style="margin: 5px 0;"><strong>Total Questions:</strong> ${stats.totalQuestions} | <strong>Correct:</strong> ${stats.correctAnswers} | <strong>Accuracy:</strong> ${stats.accuracy}%</p>
            </div>
        `;

        const correctHtml = correctAnswers.map((ca, i) => `
            <li style="background: linear-gradient(135deg, #d4edda 0%, #a3d9a5 100%); color: #155724; padding: 15px; margin-bottom: 10px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <strong>Question ${i+1}:</strong> ${ca.question}<br>
                <strong>Correct Answer:</strong> ${ca.correctAnswer}<br>
                <em>Explanation:</em> ${ca.explanation}
            </li>
        `).join('');

        const incorrectHtml = incorrectAnswers.map((ia, i) => `
            <li style="background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%); color: #721c24; padding: 15px; margin-bottom: 10px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <strong>Question ${stats.correctAnswers + i + 1}:</strong> ${ia.question}<br>
                <strong>Your Answer:</strong> ${ia.userAnswer || 'Skipped'}<br>
                <strong>Correct Answer:</strong> ${ia.correctAnswer}<br>
                <em>Explanation:</em> ${ia.explanation}
            </li>
        `).join('');

        const content = `
            <div class="review-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <button onclick="window.ModalManager.hideModal('review-modal')" class="btn btn-small back-btn" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 10px 20px; border-radius: 25px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: transform 0.2s;">
                    <i class="fas fa-arrow-left" style="margin-right: 5px;"></i> Back to Game
                </button>
                <h2 style="margin: 0; color: #333; font-size: 1.8em;">📝 Review Answers</h2>
            </div>
            <div class="review-content" style="max-height: 60vh; overflow-y: auto; padding-right: 10px;">
                ${statsHtml}
                <div class="correct-section" style="margin-bottom: 20px;">
                    <h4 style="color: #28a745; font-size: 1.3em; margin-bottom: 10px;">✅ Correct Answers</h4>
                    <ul style="list-style: none; padding: 0;">${correctHtml}</ul>
                </div>
                <div class="incorrect-section">
                    <h4 style="color: #dc3545; font-size: 1.3em; margin-bottom: 10px;">❌ Incorrect/Skipped Answers</h4>
                    <ul style="list-style: none; padding: 0;">${incorrectHtml}</ul>
                </div>
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