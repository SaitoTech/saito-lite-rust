module.exports = (app, mod) => {

    let html = `<div class="rules-overlay">
            <h1>Mahjong Solitaire</h1>
              <ul>
                <li>144 tiles are randomly folded into a multi-layered shape.</li>
                <li>The goal of this game is to remove all tiles of the same pair by matching the pairs and clicking at them in sequence</li>
                <li>There are layers of tiles and tiles stacked on top of other tiles make these tiles underneath invisible.</li>
                <li>The game is finished when all pairs of tiles have been removed from the board.</li>
              </ul>
            </div>
            `;
    return html;

}

