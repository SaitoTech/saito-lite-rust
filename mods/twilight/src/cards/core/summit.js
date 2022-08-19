

    //
    // Summit
    //
    if (card == "summit") {

      let us_roll = this.rollDice(6);
      let ussr_roll = this.rollDice(6);
      let usbase = us_roll;
      let ussrbase = ussr_roll;

      if (this.doesPlayerDominateRegion("ussr", "europe") == 1)   { ussr_roll++; }
      if (this.doesPlayerDominateRegion("ussr", "mideast") == 1)  { ussr_roll++; }
      if (this.doesPlayerDominateRegion("ussr", "asia") == 1)     { ussr_roll++; }
      if (this.doesPlayerDominateRegion("ussr", "africa") == 1)   { ussr_roll++; }
      if (this.doesPlayerDominateRegion("ussr", "camerica") == 1) { ussr_roll++; }
      if (this.doesPlayerDominateRegion("ussr", "samerica") == 1) { ussr_roll++; }
      if (this.doesPlayerDominateRegion("ussr", "seasia") == 1) { ussr_roll++; }

      if (this.doesPlayerDominateRegion("us", "europe") == 1)   { us_roll++; }
      if (this.doesPlayerDominateRegion("us", "mideast") == 1)  { us_roll++; }
      if (this.doesPlayerDominateRegion("us", "asia") == 1)     { us_roll++; }
      if (this.doesPlayerDominateRegion("us", "africa") == 1)   { us_roll++; }
      if (this.doesPlayerDominateRegion("us", "camerica") == 1) { us_roll++; }
      if (this.doesPlayerDominateRegion("us", "samerica") == 1) { us_roll++; }
      if (this.doesPlayerDominateRegion("us", "seasia") == 1)   { us_roll++; }

      this.updateLog(`${this.cardToText(card)}: US rolls ${usbase} (${(us_roll - usbase)}) and USSR rolls ${ussrbase} (${(ussr_roll-ussrbase)})`);


      if (us_roll === ussr_roll) {
        this.updateLog(`${this.cardToText(card)}: no winner`);
        this.displayModal(`${this.cardToText(card)}: no winner`);
        return 1;
      } else {

        //
        // winner
        //
        let winner = 1;
        if (us_roll > ussr_roll){
          winner = 2;
        }

        if (this.game.player === winner) {

          //If the event card has a UI component, run the clock for the player we are waiting on
          this.startClock();

          let twilight_self = this;

          twilight_self.addMove("resolve\tsummit");

          if (us_roll > ussr_roll) {
            twilight_self.updateLog("US receives 2 VP from Summit");
            twilight_self.addMove("vp\tus\t2");
          } else {
            twilight_self.updateLog("USSR receives 2 VP from Summit");
            twilight_self.addMove("vp\tussr\t2");
          }

          let x = 0;
          let y = 0;

          twilight_self.updateStatusWithOptions(`You win the ${twilight_self.cardToText(card)}:`,'<ul><li class="card" id="raise">raise DEFCON</li><li class="card" id="lower">lower DEFCON</li><li class="card" id="same">do not change</li></ul>',false);

          twilight_self.attachCardboxEvents(function(action2) {

            if (action2 == "raise") {
              twilight_self.addMove("defcon\traise");
              twilight_self.addMove("notify\tDEFCON is raised by 1");
              twilight_self.endTurn();
            }
            if (action2 == "lower") {
              twilight_self.addMove("defcon\tlower");
              twilight_self.addMove("notify\tDEFCON is lowered by 1");
              twilight_self.endTurn();
            }
            if (action2 == "same") {
              twilight_self.addMove("notify\tDEFCON left untouched");
              twilight_self.endTurn();
            }

          });
        }else{
          if (this.game.player == 0){
            this.updateStatus(`${this.playerRoles[winner].toUpperCase()} won the ${this.cardToText(card)}`);
          }else{
            this.updateStatus(`You lost the ${this.cardToText(card)}, waiting for opponent to change DEFCON`);            
          }

        }
        return 0;
      }
    }




