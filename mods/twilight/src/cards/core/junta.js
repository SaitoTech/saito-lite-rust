
    //
    // Junta
    //
    if (card == "junta") {

      this.game.state.events.junta = 1;

      this.startClockAndSetActivePlayer(this.roles.indexOf(player));
      
      if (i_played_the_card) {
        
        let className = (player == "us")? "westerneurope" : "easterneurope";
        var twilight_self = this;
        twilight_self.playerFinishedPlacingInfluence();

        twilight_self.updateStatus('<div class="status-message" id="status-message">' + player.toUpperCase() + ' to place 2 Influence in Central or South America</div>');

        for (var i in this.countries) {
          if (this.countries[i].region === "samerica" || this.countries[i].region === "camerica") {
            $("#"+i).addClass(className);
          }
        }

        let divname = '.'+className;

        $(divname).off();
        $(divname).on('click', function() {

          let c = $(this).attr('id');
          twilight_self.placeInfluence(c, 2, player);
          twilight_self.playerFinishedPlacingInfluence();
              
          let confirmoptional = '<ul><li class="option" id="conduct">coup or realign</li><li class="option" id="skip">skip</li></ul>';
          twilight_self.updateStatusWithOptions("Do you wish to use 2 free OPS for a coup or realignment rolls in Central or South America?",confirmoptional, function(action2) {

            if (action2 == "conduct") {
              twilight_self.addMove("resolve\tjunta");
              twilight_self.addMove("unlimit\tplacement");
              twilight_self.addMove("unlimit\tmilops");
              twilight_self.addMove("unlimit\tregion");
              twilight_self.addMove("ops\t"+player+"\tjunta\t2");
              twilight_self.addMove("limit\tregion\teurope");
              twilight_self.addMove("limit\tregion\tafrica");
              twilight_self.addMove("limit\tregion\tmideast");
              twilight_self.addMove("limit\tregion\tasia");
              twilight_self.addMove("limit\tregion\tseasia");
              twilight_self.addMove("limit\tmilops");
              twilight_self.addMove("limit\tplacement");
              twilight_self.addMove("place\t"+player+"\t"+player+"\t"+c+"\t2");
              twilight_self.addMove("setvar\tgame\tstate\tback_button_cancelled\t1");
              twilight_self.playerFinishedPlacingInfluence();
              twilight_self.endTurn();
            }

            if (action2 == "skip") {
              twilight_self.addMove("resolve\tjunta");
              twilight_self.addMove("place\t"+player+"\t"+player+"\t"+c+"\t2");
              twilight_self.playerFinishedPlacingInfluence();
              twilight_self.endTurn();
            }

          });
        
      });
      }
      return 0;
    }


