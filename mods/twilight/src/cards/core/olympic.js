

    ///////////////////
    // Olympic Games //
    ///////////////////
    if (card == "olympic") {

      let me = "ussr";
      let opponent = "us";
      if (this.game.player == 2) { opponent = "ussr"; me = "us"; }

      this.startClockAndSetActivePlayer(this.roles.indexOf(opponent));

      if (player == opponent) {

        let twilight_self = this;

        this.addMove("resolve\tolympic");

        twilight_self.updateStatusWithOptions(`${opponent.toUpperCase()} hosts the ${this.cardToText(card)}:`,'<ul><li class="option" id="boycott">boycott</li><li class="option" id="participate">participate</li></ul>', function(action) {

          if (action == "boycott") {
            twilight_self.addMove("ops\t"+opponent+"\tolympic\t4");
            twilight_self.addMove("setvar\tgame\tstate\tback_button_cancelled\t1");
            twilight_self.addMove("defcon\tlower");
            twilight_self.addMove("modal\t"+me.toUpperCase()+" boycotts the Olympics");
            twilight_self.addMove("NOTIFY\t"+me.toUpperCase()+" boycotts the Olympics, "+opponent.toUpperCase()+" gets 4 OPS");
            twilight_self.endTurn();
            return;
          }
          if (action == "participate") {

            let winner = 0;

            while (winner == 0) {

              let usroll   = twilight_self.rollDice(6);
              let ussrroll = twilight_self.rollDice(6);

              twilight_self.addMove("dice\tburn\t"+player);
              twilight_self.addMove("dice\tburn\t"+player);

              if (opponent == "us") {
                twilight_self.addMove(`NOTIFY\tOlympic Games: USSR rolls ${ussrroll} / US rolls ${usroll} (+2 hosting bonus)`);
                usroll += 2;
              } else {
                twilight_self.addMove(`NOTIFY\tOlympic Games: USSR rolls ${ussrroll} (+2 hosting bonus) / US rolls ${usroll}`);
                ussrroll += 2;
              }

              if (ussrroll > usroll) {
                twilight_self.addMove("vp\tussr\t2");
                twilight_self.addMove("modal\t USSR wins the Olympics");
                twilight_self.endTurn();
                winner = 1;
              }
              if (usroll > ussrroll) {
                twilight_self.addMove("vp\tus\t2");
                twilight_self.addMove("modal\t US wins the Olympics");
                twilight_self.endTurn();
                winner = 2;
              }
            }
          }
        });
      }else{
        this.updateStatus(`<div class='status-message' id='status-message'>${opponent.toUpperCase()} is deciding whether to boycott the ${this.cardToText(card)}</div>`);
      }

      return 0;
    }





