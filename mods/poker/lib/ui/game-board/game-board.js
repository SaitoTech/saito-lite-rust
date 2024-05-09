const GameBoardTemplate = require('./game-board.template');

class GameBoard {

	/**
	 * @param app - the Saito application
	 * @param mod - reference to the game module
	 */
	constructor(app, mod) {
		this.app = app;
		this.game_mod = mod;
	}

	render() {

		if (!document.querySelector(".gameboard")) {
		  this.app.browser.addElementToDom(GameBoardTemplate());
		  this.attachEvents();
		}


		this.game_mod.playerbox.render();
		this.game_mod.cardfan.render();
		this.game_mod.stack.render();
		this.game_mod.pot.render();

		this.displayTable();

	}

  	displayTable() {

		let poker_self = this.game_mod;

        	try {   
                        if (document.getElementById('deal')) {
                                let newHTML = '';
                                for (
                                        let i = 0;
                                        i < 5 || i < poker_self.game.pool[0].hand.length;
                                        i++
                                ) {
                                        let card = {};
                
                                        if (i < poker_self.game.pool[0].hand.length) {
                                                card =
                                                        poker_self.game.pool[0].cards[poker_self.game.pool[0].hand[i]];
                                                newHTML += `<div class="flip-card card"><img class="cardFront" src="${poker_self.card_img_dir}/${card.name}"></div>`;
                                        } else {
                                                newHTML += `<div class="flip-card card"><img class="cardBack" src="${poker_self.card_img_dir}/red_back.png"></div>`;
                                        }
                                }
                                document.getElementById('deal').innerHTML = newHTML;
                        }       
                } catch (err) {
                        console.warn('Card error displaying table:', err);
                }       

                poker_self.pot.render();
        }                                       
                


	attachEvents() {
	}

}

module.exports = GameBoard;

