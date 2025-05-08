module.exports = () => {
	return `
        <div class="game-help-overlay">
          <div class="game-help-overlay-title"></div>
          <div class="game-help-overlay-text"></div>
          <div class="game-help-overlay-optout"><input type="checkbox" name="dontshowme" value="true"/> don't show again </div>
        </div>
  `;
};

/* 
    Clean up from css files later on...
    
    .welcome, .welcome-overlay, .welcome-title, .welcome-text, .welcome-optout
    his-hud, his-welcome, paths-welcome, settlers-help, twilight-welcome
*/