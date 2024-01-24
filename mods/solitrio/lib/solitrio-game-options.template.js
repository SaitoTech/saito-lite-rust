module.exports = (app, mod) => {
	let html = `
        <div class="overlay-input">
            <p>Play Mode:</p>
            <div><input type="radio" id="auto" value="auto" name="play_mode" checked>
            <label for="auto">Cards move to available slots</label></div>
            <div><input type="radio" id="manual" value="manual" name="play_mode">
            <label for="manual">Click empty slot to move card</label></div>
        </div>`;

	return html;
};
