
    ////////////////
    // Korean War //
    ////////////////
    if (card == "koreanwar") {

      let target = 4;
      let success = 0;
      
      let modifications = 0;
      if (this.isControlled("us", "japan") == 1) { modifications++; }
      if (this.isControlled("us", "taiwan") == 1) { modifications++; }
      if (this.isControlled("us", "northkorea") == 1) { modifications++; }

      let roll = this.rollDice(6);
      
      this.updateLog(`${player.toUpperCase()} rolls: ${roll}, adjusted: ${roll-modifications}`);
      //this.updateLog("<span>" + player.toUpperCase()+"</span> <span>modified:</span> "+(roll-modified));

      let winner = "";

      if (roll - modifications >= target) {
        success = 1;
        winner = "North Korea wins!";
        this.updateLog("North Korea wins the Korean War");
        if (this.countries['southkorea'].us > 0){
          this.placeInfluence("southkorea", this.countries['southkorea'].us, "ussr");
          this.removeInfluence("southkorea", this.countries['southkorea'].us, "us");  
        }
        this.game.state.vp -= 2;
        this.updateVictoryPoints();
      } else {
        winner = "South Korea wins!";
        this.updateLog("South Korea wins the Korean War");
      }

      this.game.state.milops_ussr += 2;
      this.updateMilitaryOperations();

      this.war_overlay.render(card, { winner : winner , die : roll , modifications : modifications , player : player , success : success});
      return 1;

    }


