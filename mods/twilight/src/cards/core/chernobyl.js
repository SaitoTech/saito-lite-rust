
    if (card == "chernobyl") {

      this.startClockAndSetActivePlayer(2);

      if (this.game.player == 1) {
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

      this.updateStatusWithOptions("Chernobyl triggered. Designate region to prohibit USSR placement of influence from OPS:", html, function(action2) {

        twilight_self.addMove("resolve\tchernobyl");
        twilight_self.addMove("chernobyl\t"+action2);
        twilight_self.addMove("NOTIFY\tUS restricts placement in "+action2);
        twilight_self.endTurn();

      });

      return 0;
    }



