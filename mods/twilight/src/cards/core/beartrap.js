//
// Bear Trap
//
if (card == 'beartrap') {
	this.game.state.events.beartrap = 1;
	if (!i_played_the_card) {
		if (player == 'ussr') {
			this.game.queue.push(
				`ACKNOWLEDGE\tUSSR triggers ${this.cardToText(card)}.`
			);
		} else {
			this.game.queue.push(
				`ACKNOWLEDGE\tUS plays ${this.cardToText(card)}.`
			);
		}
	}
	return 1;
}
