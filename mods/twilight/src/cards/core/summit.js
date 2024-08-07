

    //
    // Summit
    //
    if (card == "summit") {

      let us_roll = this.rollDice(6);
      let ussr_roll = this.rollDice(6);

      this.updateLog(`${this.cardToText(card)}: US rolls ${us_roll}`);
      this.updateLog(`${this.cardToText(card)}: USSR rolls ${ussr_roll}`); 

      let usbase = us_roll;
      let ussrbase = ussr_roll;

      if (this.doesPlayerDominateRegionForSummit("ussr", "europe") == 1)   { 
	this.updateLog("Europe: USSR +1 bonus");
	ussr_roll++; 
      }
      if (this.doesPlayerDominateRegionForSummit("ussr", "mideast") == 1)  {
	this.updateLog("Middle-East: USSR +1 bonus");
	ussr_roll++; 
      }
      if (this.doesPlayerDominateRegionForSummit("ussr", "asia") == 1)     {
	this.updateLog("Asia: USSR +1 bonus");
	ussr_roll++; 
      }
      if (this.doesPlayerDominateRegionForSummit("ussr", "africa") == 1)   {
	this.updateLog("Africa: USSR +1 bonus");
	ussr_roll++; 
      }
      if (this.doesPlayerDominateRegionForSummit("ussr", "camerica") == 1) {
	this.updateLog("Central America: USSR +1 bonus");
	ussr_roll++; 
      }
      if (this.doesPlayerDominateRegionForSummit("ussr", "samerica") == 1) {
	this.updateLog("South America: USSR +1 bonus");
	ussr_roll++; 
      }

      if (this.doesPlayerDominateRegionForSummit("us", "europe") == 1)   { 
	this.updateLog("Europe: US +1 bonus");
	us_roll++;
      }
      if (this.doesPlayerDominateRegionForSummit("us", "mideast") == 1)  {
	this.updateLog("Middle-East: US +1 bonus");
	us_roll++;
      }
      if (this.doesPlayerDominateRegionForSummit("us", "asia") == 1)     {
	this.updateLog("Asia: US +1 bonus");
	us_roll++;
      }
      if (this.doesPlayerDominateRegionForSummit("us", "africa") == 1)   {
	this.updateLog("Africa: US +1 bonus");
	us_roll++;
      }
      if (this.doesPlayerDominateRegionForSummit("us", "camerica") == 1) {
	this.updateLog("Central America: US +1 bonus");
	us_roll++;
      }
      if (this.doesPlayerDominateRegionForSummit("us", "samerica") == 1) {
	this.updateLog("South America: US +1 bonus");
	us_roll++;
      }

      this.updateLog(`${this.cardToText(card)}: US result ${us_roll} (+${(us_roll - usbase)} bonus)`);
      this.updateLog(`${this.cardToText(card)}: USSR result ${ussr_roll} (+${(ussr_roll - ussrbase)} bonus)`);

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

        this.startClockAndSetActivePlayer(winner);

        if (this.game.player === winner) {

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

          twilight_self.updateStatusWithOptions(`You win the ${twilight_self.cardToText(card)}:`,'<ul><li class="option" id="raise">raise DEFCON</li><li class="option" id="lower">lower DEFCON</li><li class="option" id="same">do not change</li></ul>', function(action2) {

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
            this.updateStatus(`${this.roles[winner].toUpperCase()} won the ${this.cardToText(card)}`);
          }else{
            this.updateStatus(`You lost the ${this.cardToText(card)}, waiting for opponent to change DEFCON`);            
          }

        }
        return 0;
      }
    }




