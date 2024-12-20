const GameBoardTemplate = require('./game-board.template');

class GameBoard {

	/**
	 * @param app - the Saito application
	 * @param mod - reference to the game module
	 */
	constructor(app, mod) {
		this.app = app;
		this.game_mod = mod;
		this.cards_visible = 0;
	}

	render() {

		if (!document.querySelector(".gameboard")) {
		  this.app.browser.addElementToDom(GameBoardTemplate(this.game_mod.theme));
		  this.attachEvents();
		} else {
		  this.app.browser.replaceElementBySelector(GameBoardTemplate(this.game_mod.theme), ".gameboard");
		  this.attachEvents();
		}

		this.game_mod.cardfan.render();
		this.game_mod.pot.render();

		this.displayTable();

	}

	toggleView(){
		let gb = document.querySelector(".gameboard");
		if (!gb) {
			return;
		}
		if (this.game_mod.theme == "threed"){
			gb.classList.remove("flat");
			gb.classList.add("threed");
		}else{
			gb.classList.add("flat");
			gb.classList.remove("threed");
		}
	}

  	displayTable() {

		let poker_self = this.game_mod;

		let animate_flip = false;
		let flip_from_idx = 0;

		if (this.game_mod.game.state.flipped > 0 && this.game_mod.game.state.flipped > this.cards_visible) {
			animate_flip = true;
			if (this.game_mod.game.state.flipped == 3) { flip_from_idx = 0; }
			if (this.game_mod.game.state.flipped == 4) { flip_from_idx = 3; }
			if (this.game_mod.game.state.flipped == 5) { flip_from_idx = 4; }
		}

        	try {   
                        if (document.getElementById('deal')) {

                                let newHTML = '';
                                for (
                                        let i = 0;
                                        i < 5 || i < poker_self.game.pool[0].hand.length;
                                        i++
                                ) {
                                        let card = {};
                
                                        if (i < poker_self.game.pool[0].hand.length && i < flip_from_idx) {
                                                card = poker_self.game.pool[0].cards[poker_self.game.pool[0].hand[i]];
                                                newHTML += `<div class="card slot${i+1}"><img class="cardFront" src="${poker_self.card_img_dir}/${card.name}"></div>`;
                                        } else {
						if (i < poker_self.game.pool[0].hand.length) {
                                                  card = poker_self.game.pool[0].cards[poker_self.game.pool[0].hand[i]];
                                                  newHTML += `<div class="flipped slot${i+1} card"><img class="cardFront" src="${poker_self.card_img_dir}/${card.name}"><img class="cardBack" src="${poker_self.card_img_dir}/red_back.png"></div>`;
						} else {
                                                  newHTML += `<div class="flipped slot${i+1} card"><img class="cardBack" src="${poker_self.card_img_dir}/red_back.png"></div>`;
						}
                                        }
                                }
                                document.getElementById('deal').innerHTML = newHTML;
                        }       

			//
			// animate card flip
			//
			setTimeout(() => {
				if (animate_flip == true && this.cards_visible < poker_self.game.pool[0].hand.length) {
				  for (let i = 0; i < poker_self.game.pool[0].hand.length; i++) {
				    let obj = document.querySelector(`.slot${i+1}`);
				    if (obj) { obj.classList.remove("flipped"); }
				  }
				}
				this.cards_visible = poker_self.game.pool[0].hand.length;
			}, 200);


                } catch (err) {
                        console.warn('Card error displaying table:', err);
                }       
        }                                       
                


	attachEvents() {
	}


	clearTable() {

		this.cards_visible = 0;

		//
		// this animation sweeps the cards off the table
		//
                $($('#deal').children().get().reverse()).each(function (index) {
                        $(this)
                                .delay(50 * index)
                                .queue(function () {
                                        $(this)
                                                .removeClass('flipped')
                                                .delay(20 * index)
                                                .queue(function () {
                                                        $(this)
                                                                .animate(
                                                                        { left: '1000px' },
                                                                        1200,
                                                                        'swing',
                                                                        function () {
                                                                                $(this).remove();
                                                                        }
                                                                )
                                                                .dequeue();
                                                })
                                                .dequeue();
                                });
                });


		//
		// this animation sweeps the hands off the table
		//
                $('.game-playerbox-graphics .hand').animate(
                        { left: '1000px' },
                        1200,
                        'swing',
                        function () {
                                $(this).remove();
                        }
                );



	}

}

module.exports = GameBoard;

