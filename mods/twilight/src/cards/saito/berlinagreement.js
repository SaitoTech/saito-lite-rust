
    if (card == "berlinagreement") {

      this.removeCardFromDeckNextDeal("blockade", "Blockade Cancelled");

      this.cancelEvent("blockade");

      this.game.state.events.berlinagreement = 1;

      if (this.countries["westgermany"].us > 0){
        this.countries["westgermany"].us--;
        this.updateLog(`Berlin Agreement: 1 US influence removed in West Germany`);
      } else {
        this.updateLog(`Berlin Agreement: no US influence in West Germany to remove`);
      }

      if (this.countries["eastgermany"].ussr > 0){
        this.countries["eastgermany"].ussr--;
        this.updateLog(`Berlin Agreement: 1 USSR influence removed in East Germany`);
      } else {
        this.updateLog(`Berlin Agreement: no USSR influence in East Germany to remove`);
      }
 
      this.displayBoard();
      
      return 1;
    }





