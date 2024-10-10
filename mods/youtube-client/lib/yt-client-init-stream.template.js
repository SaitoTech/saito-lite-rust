module.exports  = (app,mod) => {

	if (app.options?.youtube?.stream_key != null) {
		console.log("previous stream key:", app.options.youtube.stream_key);
	}

	let html = `
    <div id="yt-stream" class="yt-stream">
			<div class="yt-stream-title"><i class="fa-brands fa-youtube"></i> Youtube Live</div> 
			<input type="text" name="yt-stream-identifier" id="yt-stream-identifier"
			value="${(app.options?.youtube?.stream_key != null ? app.options.youtube.stream_key : ``)}" 
			placeholder="Enter youtube stream key">

			<!--
			<div class="yt-stream-type">
				<input type="radio" name="stream_type" value="main" checked>
				<div class="yt-stream-type-name">Main stream</div>
				<input type="radio" name="stream_type" value="backup">
				<div class="yt-stream-type-name">Backup stream</div>
			</div>
			-->

			<div id="yt-stream-btn" class="button saito-button-primary">Go Live</div>
		</div>
  `;

	return html;
};
