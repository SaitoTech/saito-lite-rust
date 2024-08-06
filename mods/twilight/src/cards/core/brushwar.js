
    if (card == "brushwar") {

      let success = 0;
      let me = "ussr";
      let opponent = "us";
      if (this.game.player == 2) { opponent = "ussr"; me = "us"; }

      this.startClockAndSetActivePlayer(this.roles.indexOf(player));

      if (me != player) {
        let burned = this.rollDice(6);
        return 0;
      }
      if (me == player) {

        var twilight_self = this;
        twilight_self.playerFinishedPlacingInfluence();

        twilight_self.addMove("resolve\tbrushwar");
        twilight_self.updateStatus('<div class="status-message" id="status-message">Pick target for Brush War</div>');


        for (var i in twilight_self.countries) {

          if (twilight_self.countries[i].control <= 2) {

            let divname = "#" + i;

            $(divname).off();
            $(divname).on('click', function() {

              let c = $(this).attr('id');

              if (c === "italy" || c === "greece" || c === "spain" || c === "turkey") {
                if (twilight_self.game.state.events.nato == 1) {
                  if (twilight_self.isControlled("us", c) == 1) {
                    twilight_self.displayModal("NATO prevents Brush War in Europe");
                    return;
                  }
                }
              }

      
              let die = twilight_self.rollDice(6);
              let modifications = 0;

              for (let v = 0; v < twilight_self.countries[c].neighbours.length; v++) {
                if (twilight_self.isControlled(opponent, twilight_self.countries[c].neighbours[v]) == 1) {
                  modifications++;
                }
              }
              //Only check for legit (stability = 1 or 2) countries neighboring superpower
              if (twilight_self.game.player == 1 && c === "mexico") {
                 modifications++; 
              }
              if (twilight_self.game.player == 2 && c === "afghanistan") {
                modifications++; 
              }

              let winner = ""
              if (die >= 3 + modifications) {
       		success = 1;
                winner = twilight_self.countries[c].name + " is conquered!";
                let influence_change = 0;
                if (player == "us") {
                  influence_change = twilight_self.countries[c].ussr;
                } else {
                  influence_change = twilight_self.countries[c].us;
                }

                if (influence_change > 0){
                  twilight_self.addMove(`place\t${player}\t${player}\t${c}\t${influence_change}`);
                  twilight_self.addMove(`remove\t${player}\t${opponent}\t${c}\t${influence_change}`);
                  twilight_self.placeInfluence(c, influence_change, player);
                  twilight_self.removeInfluence(c, influence_change, opponent);
                }
                
                twilight_self.addMove(`milops\t${me}\t3`);
                if (twilight_self.game.state.events.flowerpower == 1) {
                  twilight_self.addMove(`vp\t${me}\t1\t1`);
                } else {
                  twilight_self.addMove(`vp\t${me}\t1`);
                }
                twilight_self.addMove("NOTIFY\tBrush War in "+twilight_self.countries[c].name+" succeeded.");
              } else {
                winner = twilight_self.countries[c].name + " repels an invasion!";
                if (me == "us") {
                  twilight_self.addMove("milops\tus\t3");
                } else {
                  twilight_self.addMove("milops\tussr\t3");
                }
                twilight_self.addMove("NOTIFY\tBrush War in "+twilight_self.countries[c].name+" failed.");
              }

              twilight_self.addMove("NOTIFY\t"+player.toUpperCase()+` rolls for Brush War: ${die}, adjusted: ${die-modifications}`);  
              twilight_self.addMove(`war\t${card}\t${winner}\t${die}\t${modifications}\t${player}\t${success}`);
              twilight_self.endTurn();


            });
          }
        }
      }
      return 0;
    }


