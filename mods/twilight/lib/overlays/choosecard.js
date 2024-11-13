const ChoiceTemplate = require('./choosecard.template');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');

class ChoiceOverlay {
	constructor(app, mod) {

		this.app = app;
		this.mod = mod;

		this.cards = null;
		this.title = null;

		this.is_visible = false;

		this.overlay = new SaitoOverlay(app, mod, false, true, false);
		this.overlay.clickBackdropToClose = false;

	}

	hide() {
		this.is_visible = false;
		this.overlay.hide();
	}

	render(card1="", card2="", stage="") {

		this.is_visible = true;
	
		let twilight_self = this.mod;
		let ui_self = this;
		let deck = this.mod.returnAllCards(true);

		let msg = "Choose Card for Mid-War";
		if (stage == "latewar") { msg = "Choose Card for Mid-War"; }

		let html = `
			<ul>
				<li class="card option" id="${card1}">${deck[card1].name}</li>
				<li class="card option" id="${card2}">${deck[card2].name}</li>
			</ul>
		`;

		this.overlay.show(ChoiceTemplate(this.mod, card1, card2, stage));

		this.mod.updateStatusWithOptions(msg, html);

		$('.option').off();
		$('.option').on('click', function() {

			let action = $(this).attr('id');

			if (stage == "latewar") {
			  twilight_self.addMove("add_latewar_card_to_deck\t"+action);
			} else {
			  twilight_self.addMove("add_midwar_card_to_deck\t"+action);
			}
			twilight_self.endTurn();
			twilight_self.updateStatus("waiting for opponent to choose...");
			ui_self.hide();

		});

	}

	attachEvents() {}
}

module.exports = ChoiceOverlay;
