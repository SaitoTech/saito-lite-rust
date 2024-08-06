
    if (card == "southafrican") {

      this.startClockAndSetActivePlayer(1);

      if (this.game.player == 1) {

        var twilight_self = this;
        twilight_self.playerFinishedPlacingInfluence();

        twilight_self.updateStatusWithOptions(`${twilight_self.cardToText(card)}: `,'<ul><li class="option" id="southafrica">2 Influence in South Africa</li><li class="option" id="adjacent">1 Influence in South Africa and 2 Influence in an adjacent country</li></ul>', function(action2) {
          twilight_self.addMove("resolve\tsouthafrican");

          if (action2 == "southafrica") {

            twilight_self.placeInfluence("southafrica", 2, "ussr", function() {
              twilight_self.addMove("place\tussr\tussr\tsouthafrica\t2");
              twilight_self.endTurn();
            });
            return 0;

          }
          if (action2 == "adjacent") {

            twilight_self.placeInfluence("southafrica", 1, "ussr");
            twilight_self.addMove("place\tussr\tussr\tsouthafrica\t1");

              twilight_self.updateStatus("Place two influence in neighboring country");
              let neighbors = ["angola", "botswana"];
    
              for (var i of neighbors) {
                $("#"+i).addClass("easterneurope");
              }

              $(".easterneurope").off();
              $(".easterneurope").on('click', function() {
                let c = $(this).attr('id');
                twilight_self.placeInfluence(c, 2, "ussr");
                twilight_self.addMove("place\tussr\tussr\t"+c+"\t2");
                twilight_self.playerFinishedPlacingInfluence();
                twilight_self.endTurn();
              });
          }
        });
      }
      return 0;
    }



