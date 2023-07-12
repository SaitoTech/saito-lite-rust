

    //////////////////////
    // Arab Israeli War //
    //////////////////////
    if (card == "arabisraeli") {

      if (this.game.state.events.campdavid == 1) {
        this.updateLog("Arab-Israeli conflict cancelled by Camp David Accords");
        return 1;
      }

      let success = 0;
      let target = 4;
      let modifications = 0;
      if (this.isControlled("us", "israel") == 1) { modifications++; }
      if (this.isControlled("us", "egypt") == 1) { modifications++; }
      if (this.isControlled("us", "jordan") == 1) { modifications++; }
      if (this.isControlled("us", "lebanon") == 1) { modifications++; }
      if (this.isControlled("us", "syria") == 1) { modifications++; }

      let winner = "";
      let roll = this.rollDice(6);
      this.updateLog(`${player.toUpperCase()} rolls: ${roll}, adjusted: ${roll-modifications}`);
      //this.updateLog("<span>" + player.toUpperCase()+"</span> <span>modified:</span> "+(roll-modified));

      if (roll - modifications >= target) {
        success = 1;
        winner = "Pan-Arab Coalition wins"
        this.updateLog("USSR wins the Arab-Israeli War");
        if (this.countries['israel'].us > 0){
          this.placeInfluence("israel", this.countries['israel'].us, "ussr");
          this.removeInfluence("israel", this.countries['israel'].us, "us");  
        }
        this.updateLog("USSR receives 2 VP from Arab-Israeli War");
        this.game.state.vp -= 2;
        this.updateVictoryPoints();
      } else {
        winner = "Israel defends itself";
        this.updateLog("US wins the Arab-Israeli War");
      }
        this.game.state.milops_ussr += 2;
        this.updateMilitaryOperations();

        this.war_overlay.render(card, { winner : winner , die : roll , modifications : modifications , player : player , success : success});

      return 1;
    }




