module.exports = ChatMainTemplate = () => {
	return `
    <div id="saito-container" class="saito-container chat-main-container">
      <div id="chat-main-sidebar-left" class="saito-sidebar left">
        <i class="chat-main-resize-icon fa-solid fa-grip-lines-vertical" id="resize-icon"></i>
      </div>
      <div id="chat-main" class="saito-main"></div>
      <div class="saito-sidebar right"></div>
    </div>
  `;
};
