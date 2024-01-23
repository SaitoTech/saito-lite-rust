if (card == 'perestroika') {
	if (this.game.player == 2) {
		this.updateStatus('USSR is playing Perestroika');
		return 0;
	}
	if (this.game.player == 1) {
		var twilight_self = this;
		twilight_self.playerFinishedPlacingInfluence();

		twilight_self.addMove('resolve\tperestroika');

		twilight_self.updateStatusWithOptions(
			'Remove four USSR influence from existing countries. You will receive 1 VP per influence removed from battleground countries, and 1 VP for every 2 influence removed from non-battleground countries controlled by the USSR:',
			'<ul><li class="option" id="skip">or skip...</li></ul>',
			function (action2) {
				twilight_self.playerFinishedPlacingInfluence();
				twilight_self.endTurn();
			}
		);

		let ops_to_purge = 4;
		let bginf = 0;
		let nonbginf = 0;

		for (var i in this.countries) {
			let countryname = i;
			let divname = '#' + i;

			$(divname).off();
			$(divname).on('click', function () {
				let c = $(this).attr('id');

				if (twilight_self.isControlled('ussr', c) != 1) {
					twilight_self.displayModal('Invalid Option');
					return;
				} else {
					if (twilight_self.countries[c].bg == 1) {
						twilight_self.removeInfluence(c, 1, 'ussr');
						twilight_self.addMove('vp\tussr\t1');
						twilight_self.addMove(
							'remove\tussr\tussr\t' + c + '\t1'
						);
					} else {
						twilight_self.removeInfluence(c, 1, 'ussr');
						nonbginf++;
						if (nonbginf == 2) {
							twilight_self.addMove('vp\tussr\t1');
							nonbginf = 0;
						}
						twilight_self.addMove(
							'remove\tussr\tussr\t' + c + '\t1'
						);
					}

					ops_to_purge--;
					if (ops_to_purge == 0) {
						twilight_self.playerFinishedPlacingInfluence();
						twilight_self.endTurn();
					}
				}
			});
		}
	}
	return 0;
}
