module.exports = (app, mod) => {

    let html = `<div class="rules-overlay">
              <h1>Mahjong Solitaire</h1>
              <ul>
                <li>Two pairs of 36 tiles (144 total) are placed into a multi-layered shape.</li>
                <li>You can only select tiles which are open to the left or the right.</li>
                <li>Match tiles to remove them from the board and reveal more tiles.</li>
                <li>Match all the tiles to win the game.</li>
              </ul>
              <div class="image_container">
                <img src="/mahjong/img/mahjong_rules.jpg"/>
              </div>
            </div>
            `;
    return html;

}

