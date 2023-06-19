module.exports = () => {
    return `
    <div class="chat-settings-container">
    <div class="chat-settings-wrapper">
    <div class="chat-settings">
    <div class="chat-settings-preview-section">
        <p> Please take a moment to review your video and audio settings.</p>

        <div id="video-preview" class="chat-settings-preview">
            <video id="video" autoplay muted playsinline></video>
            <div class="chat-settings-toggle-icons">
                <i id="toggle-video" class="fas fa-video chat-settings-toggle-icon"></i>
                <i id="toggle-audio" class="fas fa-microphone chat-settings-toggle-icon"></i>
            </div>
        </div>
        <select style="display:none" class="saito-select" id="video-input"></select>
        <select style="display:none"  class="saito-select" id="audio-input"></select>
        <button style="display:none"  id="test-mic" class="chat-settings-test-mic">Test Microphone</button>
        <div style="display:none"  class="chat-settings-audio-controls">
        <i id="toggle-playback" class="fas fa-play chat-settings-toggle-icon"></i>
            <span id="audio-progress">00:00 / 00:00</span>
        </div>
        <div style="display:none"  class="chat-settings-audio-progress-bar">
            <div id="progress" class="chat-settings-progress"></div>
        </div>
    </div>

</div>
</div>
</div>
     `;
}
