
    if (card == "fischerspassky") {

      this.startClockAndSetActivePlayer(this.roles.indexOf(player));

      if (!i_played_the_card) {
        this.updateStatus("Opponent playing Fischer-Spassky");
        return 0;
      }

      let html = `<ul>
                  <li class="option" id="asia">Asia</li>
                  <li class="option" id="europe">Europe</li>
                  <li class="option" id="africa">Africa</li>
                  <li class="option" id="camerica">Central America</li>
                  <li class="option" id="samerica">South America</li>
                  <li class="option" id="mideast">Middle-East</li>
                  </ul>`;
      let twilight_self = this;

      this.updateStatusWithOptions("Fischer-Spassky triggered. Designate region to downgrade Control and Dominance:", html, function(action2) {
        twilight_self.addMove("resolve\tfischerspassky");
        twilight_self.addMove(`SETVAR\tstate\tevents\tfischerspassky\t${action2}`)
        twilight_self.addMove("NOTIFY\tFischer-Spassky is evented targetting "+action2);
        twilight_self.endTurn();
      });

      return 0;
    }



