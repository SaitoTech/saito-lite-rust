module.exports = (app, mod) => {

  let html =  `
        <div class="overlay-input">
            <p>Play Mode:</p>
            <div><input type="radio" id="auto" value="60fps" name="play_mode" checked>
            <label for="auto">60 frames-per-second</label></div>
            <div><input type="radio" id="manual" value="30fps" name="play_mode">
            <label for="manual">30 frames-per-second</label></div>
        </div>`;

    return html;

}
