const DeckTemplate = require('./deck.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class DeckOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.visible = false;
		this.overlay = new SaitoOverlay(app, mod, false, true, true);
	}

	hide() {
		this.overlay.hide();
	}

	pullHudOverOverlay() {
		//
		// pull GAME HUD over overlay
		//
		let overlay_zindex = parseInt(this.overlay.zIndex);
		if (document.querySelector('.hud')) {
			document.querySelector('.hud').style.zIndex = overlay_zindex + 1;
			this.mod.hud.zIndex = overlay_zindex + 1;
		}
	}
	pushHudUnderOverlay() {
		//
		// push GAME HUD under overlay
		//
		let overlay_zindex = parseInt(this.overlay.zIndex);
		if (document.querySelector('.hud')) {
			document.querySelector('.hud').style.zIndex = overlay_zindex - 2;
			this.mod.hud.zIndex = overlay_zindex - 2;
		}
	}

	render(deck = '', cards = []) {
		let his_self = this.mod;
		this.overlay.show(DeckTemplate());

		if (cards) {
			if (cards.length > 0) {
				for (let i = 0; i < cards.length; i++) {
					his_self.app.browser.addElementToSelector(
						`<div id="${cards[i]}" class="card ${cards[i]}"><img src="/his/img/cards/HIS-${cards[i]}.svg" /></div>`,
						'.deck-overlay'
					);
				}
				return;
			}
		}

		if (deck == 'papacy') {
			let added = 0;
			if (!his_self.game.deck[0].discards['005']) {
				added++;
				his_self.app.browser.addElementToSelector(
					`<div id="005" class="card 005"><img src="/his/img/cards/HIS-005.svg" /></div>`,
					'.deck-overlay'
				);
			}
			if (!his_self.game.deck[0].discards['006']) {
				added++;
				his_self.app.browser.addElementToSelector(
					`<div id="006" class="card 006"><img src="/his/img/cards/HIS-006.svg" /></div>`,
					'.deck-overlay'
				);
			}
			for (
				let i = 0;
				i < his_self.game.state.cards_left['papacy'] - added;
				i++
			) {
				his_self.app.browser.addElementToSelector(
					`<div id="cardback" class="card cardback"><img src="/his/img/cards/cardback.svg" /></div>`,
					'.deck-overlay'
				);
			}
		}

		if (deck == 'protestant') {
			let added = 0;
			if (!his_self.game.deck[0].discards['007']) {
				added++;
				his_self.app.browser.addElementToSelector(
					`<div id="007" class="card 007"><img src="/his/img/cards/HIS-007.svg" /></div>`,
					'.deck-overlay'
				);
			}
			for (
				let i = 0;
				i < his_self.game.state.cards_left['protestant'] - added;
				i++
			) {
				his_self.app.browser.addElementToSelector(
					`<div id="cardback" class="card cardback"><img src="/his/img/cards/cardback.svg" /></div>`,
					'.deck-overlay'
				);
			}
		}

		if (deck == 'england') {
			let added = 0;
			if (!his_self.game.deck[0].discards['003']) {
				added++;
				his_self.app.browser.addElementToSelector(
					`<div id="003" class="card 003"><img src="/his/img/cards/HIS-003.svg" /></div>`,
					'.deck-overlay'
				);
			}
			for (
				let i = 0;
				i < his_self.game.state.cards_left['england'] - added;
				i++
			) {
				his_self.app.browser.addElementToSelector(
					`<div id="cardback" class="card cardback"><img src="/his/img/cards/cardback.svg" /></div>`,
					'.deck-overlay'
				);
			}
		}

		if (deck == 'france') {
			let added = 0;
			if (!his_self.game.deck[0].discards['004']) {
				added++;
				his_self.app.browser.addElementToSelector(
					`<div id="004" class="card 004"><img src="/his/img/cards/HIS-004.svg" /></div>`,
					'.deck-overlay'
				);
			}
			for (
				let i = 0;
				i < his_self.game.state.cards_left['france'] - added;
				i++
			) {
				his_self.app.browser.addElementToSelector(
					`<div id="cardback" class="card cardback"><img src="/his/img/cards/cardback.svg" /></div>`,
					'.deck-overlay'
				);
			}
		}

		if (deck == 'hapsburg') {
			let added = 0;
			if (!his_self.game.deck[0].discards['002']) {
				added++;
				his_self.app.browser.addElementToSelector(
					`<div id="002" class="card 002"><img src="/his/img/cards/HIS-002.svg" /></div>`,
					'.deck-overlay'
				);
			}
			for (
				let i = 0;
				i < his_self.game.state.cards_left['hapsburg'] - added;
				i++
			) {
				his_self.app.browser.addElementToSelector(
					`<div id="cardback" class="card cardback"><img src="/his/img/cards/cardback.svg" /></div>`,
					'.deck-overlay'
				);
			}
		}

		if (deck == 'ottoman') {
			let added = 0;
			if (!his_self.game.deck[0].discards['001']) {
				added++;
				his_self.app.browser.addElementToSelector(
					`<div id="001" class="card 001"><img src="/his/img/cards/HIS-001.svg" /></div>`,
					'.deck-overlay'
				);
			}
			for (
				let i = 0;
				i < his_self.game.state.cards_left['ottoman'] - added;
				i++
			) {
				his_self.app.browser.addElementToSelector(
					`<div id="cardback" class="card cardback"><img src="/his/img/cards/cardback.svg" /></div>`,
					'.deck-overlay'
				);
			}
		}

		if (deck == 'hand') {
			for (let i = 0; i < his_self.game.deck[0].fhand[0].length; i++) {
				let cidx = his_self.game.deck[0].fhand[0][i];
				let cimg = his_self.returnCardImage(cidx);
				let html = `<div id="${cidx}" class="card ${cidx}">${cimg}</div>`;
				his_self.app.browser.addElementToSelector(
					html,
					'.deck-overlay'
				);
			}
		}

		if (deck == 'dhand') {
			if (his_self.game.deck[1]) {
				for (let i = 0; i < his_self.game.deck[1].hand[0].length; i++) {
					let cidx = his_self.game.deck[1].hand[0][i];
					let cimg = his_self.returnCardImage(cidx);
					let html = `<div id="${cidx}" class="card ${cidx}">${cimg}</div>`;
					his_self.app.browser.addElementToSelector(
						html,
						'.deck-overlay'
					);
				}
			}
		}

		if (deck == 'all') {
			for (let key in his_self.game.deck[0].cards) {
				let cidx = key;
				let cimg = his_self.returnCardImage(cidx);
				let html = `<div id="${cidx}" class="card ${cidx}">${cimg}</div>`;
				his_self.app.browser.addElementToSelector(
					html,
					'.deck-overlay'
				);
			}
		}

		if (deck == 'diplomatic') {
			if (his_self.game.deck[1]) {
				for (let key in his_self.game.deck[1].cards) {
					let cidx = key;
					let cimg = his_self.returnCardImage(cidx);
					let html = `<div id="${cidx}" class="card ${cidx}">${cimg}</div>`;
					his_self.app.browser.addElementToSelector(
						html,
						'.deck-overlay'
					);
				}
			}
		}

		if (deck == 'discards') {
			for (let key in his_self.game.deck[0].discards) {
				let cidx = key;
				let cimg = his_self.returnCardImage(cidx);
				let html = `<div id="${cidx}" class="card ${cidx}">${cimg}</div>`;
				his_self.app.browser.addElementToSelector(
					html,
					'.deck-overlay'
				);
			}
		}

		if (deck == 'removed') {
			for (let i = 0; i < his_self.game.state.removed.length; i++) {
				let cidx = his_self.game.state.removed[i];
				let cimg = his_self.returnCardImage(cidx);
				let html = `<div id="${cidx}" class="card ${cidx}">${cimg}</div>`;
				his_self.app.browser.addElementToSelector(
					html,
					'.deck-overlay'
				);
			}
		}

		if (deck == 'unplayed') {
			for (let key in his_self.game.deck[0].cards) {
				if (!his_self.game.state.removed.includes(key)) {
					if (!his_self.game.deck[0].discards[key]) {
						if (!his_self.game.deck[0].removed[key]) {
							let cimg = his_self.returnCardImage(key);
							let html = `<div id="${key}" class="card ${key}">${cimg}</div>`;
							his_self.app.browser.addElementToSelector(
								html,
								'.deck-overlay'
							);
						}
					}
				}
			}
		}

		this.pushHudUnderOverlay();

		this.attachEvents();
	}

	attachEvents() {
		let his_self = this.mod;

		$('.deck-overlay .card').off();
		$('.deck-overlay .card').on('mouseover', function () {
			let action2 = $(this).attr('id');
			his_self.cardbox.show(action2);
		});
		$('.deck-overlay .card').on('mouseout', function () {
			let action2 = $(this).attr('id');
			his_self.cardbox.hide(action2);
		});
	}
}

module.exports = DeckOverlay;
