
    if (card == "iraniraq") {

      let me = "ussr";
      let opponent = "us";
      if (this.game.player == 2) { opponent = "ussr"; me = "us"; }

      if (me != player) {
        let burned = this.rollDice(6);
        return 0;
      }
      if (me == player) {

        var twilight_self = this;
        twilight_self.playerFinishedPlacingInfluence();

        twilight_self.addMove("resolve\tiraniraq");
        twilight_self.updateStatusWithOptions('Iran-Iraq War. Choose Target:',`<ul><li class="card" id="iraq">Iraq</li><li class="card" id="iran">Iran</li></ul>`,false);

        let target = 4;
        let modifications = 0;
        let winner = "";

        twilight_self.attachCardboxEvents(function(invaded) {

          for (let c in twilight_self.countries[invaded].neighbours){
            if (twilight_self.isControlled(opponent, c) == 1) { modifications++; }
          }

          let die = twilight_self.rollDice(6);
          twilight_self.addMove("NOTIFY\t"+player.toUpperCase()+`rolls: ${die}, adjusted: ${die-modifications}`);

          if (die >= target + modifications) { //Successful Invasion
            winner = (invaded == "iran")? "Iraq conquers Iran!": "Iran conquers Iraq";

            let influence_change = 0;
            if (player == "us") {
              influence_change = twilight_self.countries[invaded].ussr;
            } else {
              influence_change = twilight_self.countries[invaded].us;
            }
            if (influence_change > 0){
              twilight_self.addMove(`place\t${player}\t${player}\t${invaded}\t${influence_change}`);
              twilight_self.addMove(`remove\t${player}\t${opponent}\t${invaded}\t${influence_change}`);
              twilight_self.placeInfluence(invaded, influence_change, player);
              twilight_self.removeInfluence(invaded, influence_change, opponent);
            }
            twilight_self.addMove(`milops\t${player}\t2`);
            twilight_self.addMove(`vp\t${player}\t2`);
            twilight_self.showInfluence(invaded);

          } else { //India fails invasion
            winner = (invaded == "iran")? "Iran repels Iraqi aggression!": "Iraq repels Iranian aggression!";
            if (player == "us") {
              twilight_self.addMove("milops\tus\t2");
            } else {
              twilight_self.addMove("milops\tussr\t2");
            }
          }
          twilight_self.addMove(`war\t${card}\t${winner}\t${die}\t${modifications}\t${player}`);
          twilight_self.endTurn();


        });
      }
      return 0;
    }


