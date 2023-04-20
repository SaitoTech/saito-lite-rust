    /*
      Both players -1 to all Coup Attempts for remainder of turn
      Ignore DEFCON for realignment
    */

    if (card == "inftreaty") {

      // update defcon
      this.game.state.defcon += 2;
      if (this.game.state.defcon > 5) { this.game.state.defcon = 5; }
      this.updateDefcon();

      // affect coups
      this.game.state.events.inftreaty = 1;

      let my_go = 0;
      if (player === "ussr" && this.game.player == 1) { my_go = 1; }
      if (player === "us" && this.game.player == 2) { my_go = 1; }
      if (my_go == 0) {
        this.updateStatus("Opponent playing INF Treaty");
        return 0;
      }

      this.addMove("resolve\tinftreaty");
      this.addMove("unlimit\tcoups");
      this.addMove("ops\t"+player+"\tinftreaty\t3");
      this.addMove("limit\tcoups");
      this.addMove("notify\t"+player+" plays 3 OPS for influence or realignments");
      this.endTurn();

      return 0;
    }


