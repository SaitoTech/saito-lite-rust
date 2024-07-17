module.exports = YoutubeInitStreamTemplate = (app,mod) => {

	let html = `
    <div id="yt-stream" class="yt-stream">
			<div class="yt-stream-title"><i class="fa-brands fa-youtube"></i> Youtube Live</div> 
			<input type="text" name="yt-stream-identifier" id="yt-stream-identifier" placeholder="Enter youtube stream key">
			<div id="yt-stream-btn" class="button saito-button-primary">Go Live</div>
		</div>
  `;

	return html;
};
