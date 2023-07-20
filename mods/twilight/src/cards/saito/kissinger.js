
    if (card == "kissinger") {

      let twilight_self = this;

      if (this.game.player == 1) {
        this.updateStatus("US playing Kissinger:");
        return 0;
      }

      let user_message = "Designate a region to turn all 1-stability countries into battleground countries:";
      let html = `<ul>";
                  <li class="option" id="asia">Asia</li>
                  <li class="option" id="europe">Europe</li>
                  <li class="option" id="africa">Africa</li>
                  <li class="option" id="camerica">Central America</li>
                  <li class="option" id="samerica">South America</li>
                  <li class="option" id="mideast">Middle-East</li>
                  </ul>`;

      this.updateStatusWithOptions(user_message, html, function(action2) {

	let selreg = "europe";
	if (action2 == "asia") { selreg = "Asia"; }
	if (action2 == "africa") { selreg = "Africa"; }
	if (action2 == "camerica") { selreg = "Central America"; }
	if (action2 == "samerica") { selreg = "South America"; }
	if (action2 == "mideast") { selreg = "Middle East"; }

        twilight_self.addMove("resolve\tkissinger");
        twilight_self.addMove("bgs");
        twilight_self.addMove(`SETVAR\tstate\tevents\tkissinger\t${action2}`);

	for (let i in twilight_self.countries) {
	  if (twilight_self.countries[i].region.indexOf(action2) != -1 && twilight_self.countries[i].control == 1) {
            twilight_self.addMove("SETVAR\tcountries\t"+i+"\tbg\t"+1);
            twilight_self.addMove("notify\t"+twilight_self.countries[i].name + " is now a battleground country");
	  }
	}

        twilight_self.endTurn();

      });

      return 0;
    }



