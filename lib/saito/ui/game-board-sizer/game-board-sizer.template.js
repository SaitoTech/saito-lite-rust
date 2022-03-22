module.exports = GameBoardSizerTemplate = () => {
    var html = `
    <div id="game_board_sizer" class="game_board_sizer">
    <i class="fa fa-arrows-alt"></i>
    <input type="range" min="2" max="200" value="100" />
    </div>
    `;

    return html;
}
