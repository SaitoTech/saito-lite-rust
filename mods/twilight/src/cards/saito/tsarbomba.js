
    if (card == "tsarbomba") {

      this.game.state.events.tsarbomba = 1;
      this.game.state.vp -= 1;
      this.updateVictoryPoints();
      this.updateLog(`USSR gains 1 VP from ${this.cardToText("tsarbomba")}`);

      return 1;

    }





