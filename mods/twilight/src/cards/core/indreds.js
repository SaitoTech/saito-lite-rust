
    if (card == "indreds") {

      this.startClockAndSetActivePlayer(2);

      if (this.game.player == 2) {
        
        let yugo_ussr = this.countries['yugoslavia'].ussr;
        let romania_ussr = this.countries['romania'].ussr;
        let bulgaria_ussr = this.countries['bulgaria'].ussr;
        let hungary_ussr = this.countries['hungary'].ussr;
        let czechoslovakia_ussr = this.countries['czechoslovakia'].ussr;

        let yugo_us = this.countries['yugoslavia'].us;
        let romania_us = this.countries['romania'].us;
        let bulgaria_us = this.countries['bulgaria'].us;
        let hungary_us = this.countries['hungary'].us;
        let czechoslovakia_us = this.countries['czechoslovakia'].us;

        let yugo_diff = yugo_ussr - yugo_us;
        let romania_diff = romania_ussr - romania_us;
        let bulgaria_diff = bulgaria_ussr - bulgaria_us;
        let hungary_diff = hungary_ussr - hungary_us;
        let czechoslovakia_diff = czechoslovakia_ussr - czechoslovakia_us;


        this.addMove("resolve\tindreds");
        if (hungary_us >= hungary_ussr && yugo_us >= yugo_ussr && romania_us >= romania_ussr && bulgaria_us >= bulgaria_ussr && czechoslovakia_us >= czechoslovakia_ussr) {

          this.endTurn();
          return 0;

        } else {

	  let total_countries = 0;
	  let only_country = "";

          if (hungary_us        < hungary_ussr) 	{ total_countries++; only_country = "hungary"; }
          if (yugo_us           < yugo_ussr)    	{ total_countries++; only_country = "yugoslavia"; }
          if (romania_us        < romania_ussr) 	{ total_countries++; only_country = "romania"; }
          if (bulgaria_us       < bulgaria_ussr) 	{ total_countries++; only_country = "bulgaria"; }
          if (czechoslovakia_us < czechoslovakia_ussr)  { total_countries++; only_country = "czechoslovakia"; }

console.log("total countries: " + total_countries);

	  if (total_countries == 1) {
	    let diff = 0;

	    if (only_country == "hungary") { diff = hungary_diff; }
	    if (only_country == "yugoslavia") { diff = yugo_diff; }
	    if (only_country == "romania") { diff = romania_diff; }
	    if (only_country == "bulgaria") { diff = bulgaria_diff; }
	    if (only_country == "czechoslovakia") { diff = czechoslovakia_diff; }
            this.placeInfluence(only_country, diff, "us");
            this.addMove("place\tus\tus\t"+only_country+"\t"+diff);
            this.endTurn();
	    return 0;
	  }

          let userhtml = "<ul>";

          if (yugo_diff > 0) {
            userhtml += '<li class="option" id="yugoslavia">Yugoslavia</li>';
          }
          if (romania_diff > 0) {
            userhtml += '<li class="option" id="romania">Romania</li>';
          }
          if (bulgaria_diff > 0) {
            userhtml += '<li class="option" id="bulgaria">Bulgaria</li>';
          }
          if (hungary_diff > 0) {
            userhtml += '<li class="option" id="hungary">Hungary</li>';
          }
          if (czechoslovakia_diff > 0) {
            userhtml += '<li class="option" id="czechoslovakia">Czechoslovakia</li>';
          }
          userhtml += '</ul>';

          let twilight_self = this;
          this.updateStatusWithOptions("Match USSR influence in which country?", userhtml, function(myselect) {
            $('.card').off();

            if (myselect == "romania") {
              twilight_self.placeInfluence(myselect, romania_diff, "us");
              twilight_self.addMove("place\tus\tus\tromania\t"+romania_diff);
              twilight_self.endTurn();
            }
            if (myselect == "yugoslavia") {
              twilight_self.placeInfluence(myselect, yugo_diff, "us");
              twilight_self.addMove("place\tus\tus\tyugoslavia\t"+yugo_diff);
              twilight_self.endTurn();
            }
            if (myselect == "bulgaria") {
              twilight_self.placeInfluence(myselect, bulgaria_diff, "us");
              twilight_self.addMove("place\tus\tus\tbulgaria\t"+bulgaria_diff);
              twilight_self.endTurn();
            }
            if (myselect == "hungary") {
              twilight_self.placeInfluence(myselect, hungary_diff, "us");
              twilight_self.addMove("place\tus\tus\thungary\t"+hungary_diff);
              twilight_self.endTurn();
            }
            if (myselect == "czechoslovakia") {
              twilight_self.placeInfluence(myselect, czechoslovakia_diff, "us");
              twilight_self.addMove("place\tus\tus\tczechoslovakia\t"+czechoslovakia_diff);
              twilight_self.endTurn();
            }

            return 0;

          });
        }
      }
      return 0;
    }






