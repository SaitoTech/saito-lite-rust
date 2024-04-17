module.exports = (app, mod) => {
	let html = `<div class="rules-overlay">
              
              <p>Two pairs of 36 tiles (144 total) are randomly arranged into a multi-layered shape. 
                  Tiles can only be selected if they are open on the left or the right.</p>
              <p>Match tiles to remove them from the board and reveal the tiles under them or expose their neighbors for grabbing. 
                    Match all the tiles to clear the board and win the game.</p>
            
              <div class="image_container">
                <img src="/mahjong/img/mahjong_rules.jpg"/>
              </div>
            </div>
            `;
	return html;
};
