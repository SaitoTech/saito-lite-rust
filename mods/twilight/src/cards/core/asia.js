
    if (card == "asia") {

      let vp_adjustment = this.calculateScoring("asia");
      this.showScoreOverlay(card, vp_adjustment);
      let total_vp = vp_adjustment.us.vp - vp_adjustment.ussr.vp;
      this.game.state.vp += total_vp;
      this.updateLog("<span>Asia:</span> " + total_vp + " <span>VP</span>");
      this.updateVictoryPoints();

      // disable kissinger if in play - SAITO COMMUNITY
      if (this.game.state.events.kissinger === "asia") { this.game.state.events.kissinger = ""; }

      // stats
      if (player == "us") { this.game.state.stats.us_scorings++; }
      if (player == "ussr") { this.game.state.stats.ussr_scorings++; }

      return 1;
    }

