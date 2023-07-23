
    if (card == "samerica") {
      let vp_adjustment = this.calculateScoring("samerica");
      this.showScoreOverlay(card, vp_adjustment);
      let total_vp = vp_adjustment.us.vp - vp_adjustment.ussr.vp;
      this.game.state.vp += total_vp;
      this.updateLog("<span>South America:</span> " + total_vp + " <span>VP</span>");

      // disable kissinger if in play - SAITO COMMUNITY
      if (this.game.state.events.kissinger === "samerica") { this.game.state.events.kissinger = ""; }

      // stats
      if (player == "us") { this.game.state.stats.us_scorings++; }
      if (player == "ussr") { this.game.state.stats.ussr_scorings++; }


      this.updateVictoryPoints();
      return 1;
    }


