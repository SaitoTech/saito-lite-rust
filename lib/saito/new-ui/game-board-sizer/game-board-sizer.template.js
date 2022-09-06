module.exports = GameBoardSizerTemplate = (maxZoom) => {
    var html = `
    <div id="game_board_sizer" class="game_board_sizer">
    <i class="fa fa-arrows-alt"></i>
    <input type="range" min="2" max="${maxZoom}" value="100" />
    </div>
    `;

    return html;
}
