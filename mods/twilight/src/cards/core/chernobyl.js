
    if (card == "chernobyl") {

      if (this.game.player == 1) {
        return 0;
      }
      this.startClock();

      let html = `<ul>
                  <li class="card" id="asia">Asia</li>
                  <li class="card" id="europe">Europe</li>
                  <li class="card" id="africa">Africa</li>
                  <li class="card" id="camerica">Central America</li>
                  <li class="card" id="samerica">South America</li>
                  <li class="card" id="mideast">Middle-East</li>
                  </ul>`;

      this.updateStatusWithOptions("Chernobyl triggered. Designate region to prohibit USSR placement of influence from OPS:",html,false);

      let twilight_self = this;
      twilight_self.attachCardboxEvents(function(action2) {

        twilight_self.addMove("resolve\tchernobyl");
        twilight_self.addMove("chernobyl\t"+action2);
        twilight_self.addMove("NOTIFY\tUS restricts placement in "+action2);
        twilight_self.endTurn();

      });

      return 0;
    }



