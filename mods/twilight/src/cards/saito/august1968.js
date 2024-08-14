

    //
    // Salt Negotiations
    //
    if (card == "august1968") {

      // otherwise sort through discards
      let cardslength = 0;
      for (var i in this.game.deck[0].cards) { cardslength++; }
      if (cardslength == 0) {
        this.updateLog("No cards left in deck");
        return 1;
      }

      this.startClockAndSetActivePlayer(this.roles.indexOf(player));

      if (i_played_the_card) {


        // pick optional card
        var twilight_self = this;

        let corecards = ["asia","europe","mideast","duckandcover","fiveyearplan","socgov","fidel","vietnamrevolts","blockade","koreanwar","romanianab","arabisraeli","comecon","nasser","warsawpact","degualle","naziscientist","truman","olympic","nato","indreds","marshall","indopaki","containment","cia","usjapan","suezcrisis","easteuropean","decolonization","redscare","unintervention","destalinization","nucleartestban","formosan","brushwar","camerica","seasia","armsrace","cubanmissile","nuclearsubs","quagmire","saltnegotiations","beartrap","summit","howilearned","junta","kitchendebates","missileenvy","wwby","brezhnev","portuguese","southafrican","allende","willybrandt","muslimrevolution","abmtreaty","culturalrev","flowerpower","u2","opec","lonegunman","colonial","panamacanal","campdavid","puppet","grainsales","johnpaul","deathsquads","oas","nixon","sadat","shuttle","voiceofamerica","liberation","ussuri","asknot","alliance","africa","onesmallstep","samerica","iranianhostage","ironlady","reagan","starwars","northseaoil","reformer","marine","KAL007","glasnost","ortega","terrorism","irancontra","chernobyl","debtcrisis","evilempire","aldrichames","pershing","wargames","solidarity"];
        let cards = [];

        for (var i in this.game.deck[0].cards) {
	  if (!corecards.includes(i)) {
	    cards.push(i);
	  }
	}

        twilight_self.updateStatusAndListCards("Choose Card to Purge:", cards, true);
        twilight_self.addMove("resolve\taugust1968");

        twilight_self.hud.attachControlCallback(function(action2) {
          twilight_self.addMove("NOTIFY\t"+player.toUpperCase() +" purged "+twilight_self.cardToText(action2));
          twilight_self.addMove("purge\t"+action2); 
          twilight_self.endTurn();
        });
      }

      return 0;
    }
                  





