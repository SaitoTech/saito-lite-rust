
    ////////////////////////
    // Indo-Pakistani War //
    ////////////////////////
    if (card == "indopaki") {
      let target = 4;
      let opponent = "us";
      if (this.game.player == 2) { opponent = "ussr";  }

      if (this.playerRoles[this.game.player] == player) {
        //If the event card has a UI component, run the clock for the player we are waiting on
        this.startClock();

        var twilight_self = this;
        twilight_self.playerFinishedPlacingInfluence();

        twilight_self.addMove("resolve\tindopaki");
        twilight_self.updateStatusWithOptions('Indo-Pakistani War. Choose Target to invade:',`<ul><li class="card" id="pakistan">Pakistan</li><li class="card" id="india">India</li></ul>`,false);

        let modifications = 0;
        let winner = "india";

        twilight_self.attachCardboxEvents(function(invaded) {

          for (let c of twilight_self.countries[invaded].neighbours){
            if (twilight_self.isControlled(opponent, c) == 1) { modifications++; }
          }

          let die = twilight_self.rollDice(6);
          twilight_self.addMove("NOTIFY\t"+player.toUpperCase()+` rolls: ${die}, adjusted: ${die-modifications}`);

          if (die >= target + modifications) { //Successful Invasion
            winner = (invaded == "pakistan")? "India conquers Pakistan!": "Pakistan conquers India";

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

          } else { //India fails invasion
            winner = (invaded == "pakistan")? "Pakistan repels Indians aggression!": "India repels Pakistani aggression!";
            if (player == "us") {
              twilight_self.addMove("milops\tus\t2");
            } else {
              twilight_self.addMove("milops\tussr\t2");
            }
          }
          twilight_self.addMove(`war\t${card}\t${winner}\t${die}\t${modifications}\t${player}`);
          twilight_self.endTurn();
            
        });
      }else{
        let burned = this.rollDice(6);
      }
      return 0;
    }



