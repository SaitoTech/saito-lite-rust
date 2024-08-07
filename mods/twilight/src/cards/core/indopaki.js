
    ////////////////////////
    // Indo-Pakistani War //
    ////////////////////////
    if (card == "indopaki") {
      let target = 4;
      let opponent = "us";
      let success = 0;

      if (this.game.player == 2) { opponent = "ussr";  }

      this.startClockAndSetActivePlayer(this.roles.indexOf(player));

      if (this.roles[this.game.player] == player) {
        
        var twilight_self = this;
        twilight_self.playerFinishedPlacingInfluence();

        twilight_self.addMove("resolve\tindopaki");
        twilight_self.updateStatusWithOptions('Indo-Pakistani War. Choose Target to invade:',`<ul><li class="option" id="pakistan">Pakistan</li><li class="option" id="india">India</li></ul>`, function(invaded) {

          let modifications = 0;
          let winner = "india";

          for (let c of twilight_self.countries[invaded].neighbours){
            if (twilight_self.isControlled(opponent, c) == 1) { modifications++; }
          }

          let die = twilight_self.rollDice(6);
          twilight_self.addMove("NOTIFY\t"+player.toUpperCase()+` rolls: ${die}, adjusted: ${die-modifications}`);

          if (die >= target + modifications) { //Successful Invasion
            //winner = (invaded == "pakistan")? "India invades Pakistan!": "Pakistan invades India";
            winner = "Invasion Succeeds!";
	    success = 1;

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
            //winner = (invaded == "pakistan")? "Pakistan repels India!": "India repels Pakistan!";
            winner = "Invasion Fails!";
            if (player == "us") {
              twilight_self.addMove("milops\tus\t2");
            } else {
              twilight_self.addMove("milops\tussr\t2");
            }
          }
          twilight_self.addMove(`war\t${card}\t${winner}\t${die}\t${modifications}\t${player}\t${success}`);
          twilight_self.endTurn();
            
        });
      }else{
        let burned = this.rollDice(6);
      }
      return 0;
    }



