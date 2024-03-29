module.exports = () => {
	return `
    <div class="chat-settings">
        <div class="chat-settings-preview-section">
            <div id="video-preview" class="chat-settings-preview">
                <video id="video" autoplay muted playsinline></video>
                <div class="chat-settings-toggle-icons">
                    <i id="toggle-video" class="fas fa-video chat-settings-toggle-icon"></i>
                    <i id="toggle-audio" class="fas fa-microphone chat-settings-toggle-icon"></i>
                </div>
            </div>
        </div>
    </div>
     `;
};

