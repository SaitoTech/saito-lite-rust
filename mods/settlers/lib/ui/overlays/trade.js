const TradeOverlayTemplate = require('./trade.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class TradeOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(this.app, this.mod, false);

		this.tradeType = -1; // trade with everyone, or playerNum
		this.get = {};
		this.give = {};
		this.offering_player = 0;
		this.accepting_trade = 0;
		this.resources = null;
		this.should_clear_advert = false;
	}

	initialize() {
		this.resources = this.mod.returnResources();

		for (let r of this.resources) {
			console.log(r);
			this.get[r] = 0;
			this.give[r] = 0;
		}

		this.accepting_trade = 0;
		this.should_clear_advert = false;
	}

	render(reset = true) {
		if (reset) {
			this.initialize();
		}

		if (!this.resources) {
			this.resources = this.mod.returnResources();
		}

		// Since this.accepting_trade gets untoggled, if we change the offer
		if (this.accepting_trade) {
			this.should_clear_advert = true;
		}
		this.overlay.show(TradeOverlayTemplate(this));

		this.attachEvents();
	}

	attachEvents() {
		let trade_overlay = this;
		let settlers_self = this.mod;

		document.querySelectorAll('.trade_count_up').forEach((arrow) => {
			arrow.onclick = (e) => {
				trade_overlay.accepting_trade = 0;
				document.querySelector('.trade_overlay_button').innerHTML =
					'Broadcast Offer';

				let item = e.currentTarget.parentElement.getAttribute('id');
				let temp = item.split('_');
				let resname = temp[1];

				if (temp[0] == 'want') {
					this.get[resname]++;
				} else {
					//
					// cannot offer more than you have
					//
					if (
						this.give[resname] <
						settlers_self.countResource(
							settlers_self.game.player,
							resname
						)
					) {
						this.give[resname]++;
					}
				}
				this.render(false);
			};
		});

		document.querySelectorAll('.trade_count_down').forEach((arrow) => {
			arrow.onclick = (e) => {
				trade_overlay.accepting_trade = 0;
				document.querySelector('.trade_overlay_button').innerHTML =
					'Broadcast Offer';

				let item = e.currentTarget.parentElement.getAttribute('id');
				let temp = item.split('_');
				let resname = temp[1];

				if (temp[0] == 'want') {
					if (this.get[resname] > 0) {
						this.get[temp[1]]--;
					}
				} else {
					if (this.give[temp[1]] > 0) {
						this.give[temp[1]]--;
					}
				}
				this.render(false);
			};
		});

		$('#trade_overlay_broadcast_button').off();
		$('#trade_overlay_broadcast_button.valid_trade').on(
			'click',
			function () {
				$('#trade_overlay_broadcast_button').off();

				if (trade_overlay.should_clear_advert) {
					settlers_self.addMove(
						`clear_advert\t${trade_overlay.offering_player}`
					);
				}

				if (trade_overlay.accepting_trade == 0) {
					settlers_self.addMove(
						`offer\t${settlers_self.game.player}\t${
							trade_overlay.tradeType
						}\t${JSON.stringify(
							trade_overlay.give
						)}\t${JSON.stringify(trade_overlay.get)}`
					);
					settlers_self.endTurn();
					trade_overlay.overlay.close();
				} else {
					settlers_self.addMove(
						`accept_offer\t${trade_overlay.offering_player}\t${
							settlers_self.game.player
						}\t${JSON.stringify(
							trade_overlay.give
						)}\t${JSON.stringify(trade_overlay.get)}`
					);
					settlers_self.endTurn();
					trade_overlay.overlay.close();
				}
			}
		);

		$("#trade_overlay_cancel_button").off();
		$("#trade_overlay_cancel_button").on('click', function(){
			$("#trade_overlay_cancel_button").off();
			if (trade_overlay.offering_player == 0){
				trade_overlay.overlay.close();
				return;	
			}
			if (trade_overlay.offering_player == settlers_self.game.player){
				settlers_self.addMove(`clear_advert\t${settlers_self.game.player}`);
			}else{
				settlers_self.addMove(`reject_offer\t${settlers_self.game.player}\t${trade_overlay.offering_player}`);
			}
			settlers_self.endTurn();
			trade_overlay.overlay.close();
		});
	}
}

module.exports = TradeOverlay;
