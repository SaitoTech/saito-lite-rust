
  hideOverlays() {
    this.zoom_overlay.hide();
  }


  addSelectable(el) {
    if (!el.classList.contains("selectable")) {
      el.classList.add('selectable');
    }
  } 
    
  removeSelectable() {
    document.querySelectorAll(".selectable").forEach((el) => {
      el.onclick = (e) => {};
      el.classList.remove('selectable');
    });
    $('.trench-tile').off();
    $('.army-tile').off();
    $('.space').off();
  }


  displayBoard() {

    let paths_self = this;

    paths_self.displayTurnTrack();
    paths_self.displayGeneralRecordsTrack();
    paths_self.displayActionRoundTracks();
    paths_self.displayMandatedOffensiveTracks();
    paths_self.displayUSCommitmentTrack();
    paths_self.displayRussianCapitulationTrack();
    paths_self.displayReserveBoxes();
    paths_self.displayEliminatedUnitsBoxes();


    //
    // display the spaces on the board
    //
    try {
      this.displaySpaces();
    } catch (err) {
console.log("!");
console.log("!");
console.log("!");
      console.log("error displaying spaces... " + err);
    }


    //
    // add click event to gameboard for close-up / zoom UI
    //
    let xpos = 0;
    let ypos = 0;

    if (!paths_self.bound_gameboard_zoom) {

      $('.gameboard').on('mousedown', function (e) {
        if (e.currentTarget.classList.contains("space")) { return; }
        xpos = e.clientX;
        ypos = e.clientY;
      });
      $('.gameboard').on('mouseup', function (e) {
        if (Math.abs(xpos-e.clientX) > 4) { return; }
        if (Math.abs(ypos-e.clientY) > 4) { return; }
        //
        // if this is a selectable space, let people select directly
        //
        // this is a total hack by the way, but it captures the embedding that happens when
        // we are clicking and the click action is technically on the item that is INSIDE
        // the selectable DIV, like a click on a unit in a key, etc.
        //
        if (e.target.classList.contains("selectable")) {
          return;
        } else {
          let el = e.target;
          if (el.parentNode) {
            if (el.parentNode.classList.contains("selectable")) {
              return;
            } else {
              if (el.parentNode.parentNode) {
                if (el.parentNode.parentNode.classList.contains("selectable")) {
                  return;
                }
              }
            }
          }
        }
	//
        // nothing is selectable here, so show zoom
        paths_self.zoom_overlay.renderAtCoordinates(xpos, ypos);
      });

      //
      // we only attach this event to the gameboard once, so once we have done
      // that remember that we have already bound the gameboard zoom event so that
      // we will not do it again. If necessary we can reset this variable to 0
      // and call this function again.
      //
      paths_self.bound_gameboard_zoom = 1;
    }

  }


  displaySpace(key) {

    try {

      let space = this.game.spaces[key];
      let html = "";
      let control = this.returnControlOfSpace(key);

      //
      // units / armies
      //
      for (let i = 0; i < space.units.length; i++) {
        html += this.returnUnitImageInSpaceWithIndex(key, i);
      }

      //
      // activated for movement
      //
      if (space.activated_for_movement) {
        html += `<img src="/paths/img/tiles/activate_move.png" class="activation-tile" />`;
      }
      if (space.activated_for_combat) {
        html += `<img src="/paths/img/tiles/activate_attack.png" class="activation-tile" />`;
      }

      //
      // trenches
      //
      if (space.trench == 1) {
	if (control == "allies") {
          html += `<img src="/paths/img/tiles/ap_trench1.png" class="trench-tile" />`;
	}
	if (control == "central") {
          html += `<img src="/paths/img/tiles/cp_trench1.png" class="trench-tile" />`;
	}
      }
      if (space.trench == 2) {
	if (control == "allies") {
          html += `<img src="/paths/img/tiles/ap_trench2.png" class="trench-tile" />`;
	}
	if (control == "central") {
          html += `<img src="/paths/img/tiles/cp_trench2.png" class="trench-tile" />`;
	}
      }

      document.querySelectorAll(`.${key}`).forEach((el) => { el.innerHTML = html; });

    } catch (err) {
    }
  }

  displaySpaceDetailedView(key) {
alert("display detailed space!");
  }

  displaySpaces() {

    let paths_self = this;

    //
    // add tiles
    //
    for (let key in this.game.spaces) {
      if (this.game.spaces.hasOwnProperty(key)) {
	this.displaySpace(key);
      }
    }

    let xpos = 0;
    let ypos = 0;

    if (!paths_self.bound_gameboard_zoom) {

      $('.gameboard').on('mousedown', function (e) {
        if (e.currentTarget.classList.contains("space")) { return; }
        xpos = e.clientX;
        ypos = e.clientY;
      });
      $('.gameboard').on('mouseup', function (e) { 
        if (Math.abs(xpos-e.clientX) > 4) { return; }
        if (Math.abs(ypos-e.clientY) > 4) { return; }
	//
	// if this is a selectable space, let people select directly
	//
	// this is a total hack by the way, but it captures the embedding that happens when
	// we are clicking and the click actino is technically on the item that is INSIDE
	// the selectable DIV, like a click on a unit in a key, etc.
	//
	if (e.target.classList.contains("selectable")) {
	  // something else is handling this
	  return;
	} else {
	  let el = e.target;
	  if (el.parentNode) {
	    if (el.parentNode.classList.contains("selectable")) {
	      // something else is handling this
	      return;
	    } else {
	      if (el.parentNode.parentNode) {
	        if (el.parentNode.parentNode.classList.contains("selectable")) {
	          return;
	        }
	      }
	    }
	  }
	}
	// otherwise show zoom
        //if (e.target.classList.contains("space")) {
          paths_self.zoom_overlay.renderAtCoordinates(xpos, ypos);
	  //e.stopPropagation();
	  //e.preventDefault();	
	  //return;
	//}
      });

      paths_self.bound_gameboard_zoom = 1;

    }


  }



  returnCardImage(cardname) {

    let cardclass = "cardimg";
    let deck = this.returnDeck();
    let card = "";
    let html = "";

    if (cardname === "pass") {
      return `<img class="${cardclass}" src="/paths/img/cards/PASS.png" /><div class="cardtext">pass</div>`;
    }

    if (deck[cardname]) {
      card = deck[cardname];
      html = `<img class="${cardclass}" src="/paths/img/${card.img}" />`;
      try {
	if (card.canEvent(this)) {
          html += `<img class="${cardclass} cancel_x" src="/paths/img/cancel_x.png" />`;
        }
      } catch (err) {}
    }

    return html

  }


  async preloadImages() {
    var allImages = [
    //  "img/factions/england.png",
    ];

    this.preloadImageArray(allImages);
  }

  preloadImageArray(imageArray=[], idx=0) {

    let pre_images = [imageArray.length];

    if (imageArray && imageArray.length > idx) {
      pre_images[idx] = new Image();
      pre_images[idx].onload = () => {
        this.preloadImageArray(imageArray, idx+1);
      }
      pre_images[idx].src = "/paths/" + imageArray[idx];
    }

  }



  displayTurnTrack() {

    try {

      document.querySelectorAll(".turn-track").forEach((el) => { el.classList.remove("active"); });

      if (this.game.state.turn_track == 1) { document.querySelector(".turn-track-1").classList.add("active"); }
      if (this.game.state.turn_track == 2) { document.querySelector(".turn-track-2").classList.add("active"); }
      if (this.game.state.turn_track == 3) { document.querySelector(".turn-track-3").classList.add("active"); }
      if (this.game.state.turn_track == 4) { document.querySelector(".turn-track-4").classList.add("active"); }
      if (this.game.state.turn_track == 5) { document.querySelector(".turn-track-5").classList.add("active"); }
      if (this.game.state.turn_track == 6) { document.querySelector(".turn-track-6").classList.add("active"); }
      if (this.game.state.turn_track == 7) { document.querySelector(".turn-track-7").classList.add("active"); }
      if (this.game.state.turn_track == 8) { document.querySelector(".turn-track-8").classList.add("active"); }
      if (this.game.state.turn_track == 9) { document.querySelector(".turn-track-9").classList.add("active"); }
      if (this.game.state.turn_track == 10) { document.querySelector(".turn-track-10").classList.add("active"); }
      if (this.game.state.turn_track == 11) { document.querySelector(".turn-track-11").classList.add("active"); }
      if (this.game.state.turn_track == 12) { document.querySelector(".turn-track-12").classList.add("active"); }
      if (this.game.state.turn_track == 13) { document.querySelector(".turn-track-13").classList.add("active"); }
      if (this.game.state.turn_track == 14) { document.querySelector(".turn-track-14").classList.add("active"); }
      if (this.game.state.turn_track == 15) { document.querySelector(".turn-track-15").classList.add("active"); }
      if (this.game.state.turn_track == 16) { document.querySelector(".turn-track-16").classList.add("active"); }
      if (this.game.state.turn_track == 17) { document.querySelector(".turn-track-17").classList.add("active"); }
      if (this.game.state.turn_track == 18) { document.querySelector(".turn-track-18").classList.add("active"); }
      if (this.game.state.turn_track == 19) { document.querySelector(".turn-track-19").classList.add("active"); }
      if (this.game.state.turn_track == 20) { document.querySelector(".turn-track-20").classList.add("active"); }

    } catch (err) {

    }

  }

  displayGeneralRecordsTrack() {

    try {

      let rp_ge     = `<img src="/paths/img/rp_allied.png" />`;
      let rp_ah     = `<img src="/paths/img/rp_allied.png" />`;
      let rp_allied = `<img src="/paths/img/rp_allied.png" />`;
      let rp_br     = `<img src="/paths/img/rp_br.png" />`;
      let rp_fr     = `<img src="/paths/img/rp_fr.png" />`;
      let rp_ru     = `<img src="/paths/img/rp_ru.png" />`;
      let vp_button = `<img src="/paths/img/vp_button.png" />`;
      let allies_war_status = `<img src="/paths/img/warstatus_ap.png" />`;
      let central_war_status = `<img src="/paths/img/warstatus_cp.png" />`;
      let combined_war_status = `<img src="/paths/img/warstatus_combined.png" />`;
      let current_cp_russian_vp = `<img src="/paths/img/current_cp_russian_vp.png" />`;

      document.querySelectorAll(".general-records-track").forEach((el) => { el.classList.remove("vp"); el.innerHTML = ""; });

      document.querySelector(`.general-records-track-${this.game.state.general_records_track.vp}`).innerHTML += vp_button;
      document.querySelector(`.general-records-track-${this.game.state.general_records_track.allies_war_status}`).innerHTML += allies_war_status;
      document.querySelector(`.general-records-track-${this.game.state.general_records_track.central_war_status}`).innerHTML += central_war_status;
      document.querySelector(`.general-records-track-${this.game.state.general_records_track.combined_war_status}`).innerHTML += combined_war_status;

      document.querySelector(`.general-records-track-${this.game.state.general_records_track.ge_replacements}`).innerHTML += rp_ge;
      document.querySelector(`.general-records-track-${this.game.state.general_records_track.ah_replacements}`).innerHTML += rp_ah;
      document.querySelector(`.general-records-track-${this.game.state.general_records_track.allied_replacements}`).innerHTML += rp_allied;
      document.querySelector(`.general-records-track-${this.game.state.general_records_track.br_replacements}`).innerHTML += rp_br;
      document.querySelector(`.general-records-track-${this.game.state.general_records_track.fr_replacements}`).innerHTML += rp_fr;
      document.querySelector(`.general-records-track-${this.game.state.general_records_track.ru_replacements}`).innerHTML += rp_ru;

      document.querySelector(`.general-records-track-${this.game.state.general_records_track.current_cp_russian_vp}`).innerHTML += current_cp_russian_vp;

    } catch (err) {
      console.log(err);
    }

  }

  displayActionRoundTracks() {

  }

  displayMandatedOffensiveTracks() {
/***
    if (this.game.state.mandated_offensives.central == "AH") {

    }
          if (central == 2) { this.game.state.mandated_offensives.central = "AH IT"; }
          if (central == 3) { this.game.state.mandated_offensives.central = "TU"; }
          if (central == 4) { this.game.state.mandated_offensives.central = "GE"; }
          if (central == 5) { this.game.state.mandated_offensives.central = ""; }
          if (central == 6) { this.game.state.mandated_offensives.central = ""; }
          if (allies == 1)  { this.game.state.mandated_offensives.allies = "FR"; }
          if (allies == 2)  { this.game.state.mandated_offensives.allies = "FR"; }
          if (allies == 3)  { this.game.state.mandated_offensives.allies = "BR"; }
          if (allies == 4)  { this.game.state.mandated_offensives.allies = "IT"; }
          if (allies == 5)  { this.game.state.mandated_offensives.allies = "IT"; }
          if (allies == 6)  { this.game.state.mandated_offensives.allies = "RU"; }
***/
  }

  displayUSCommitmentTrack() {

    try {

      document.querySelectorAll(".us-commitment-track").forEach((el) => { el.classList.remove("active"); });

      if (this.game.state.us_commitment_track == 1) { 
        document.querySelector(".us-commitment-track-1").classList.add("active");
      }
      if (this.game.state.us_commitment_track == 2) { 
        document.querySelector(".us-commitment-track-2").classList.add("active");
      }
      if (this.game.state.us_commitment_track == 3) { 
        document.querySelector(".us-commitment-track-3").classList.add("active");
      }
      if (this.game.state.us_commitment_track == 4) { 
        document.querySelector(".us-commitment-track-4").classList.add("active");
      }

    } catch (err) {

    }

  }

  displayRussianCapitulationTrack() {

    try {

      document.querySelectorAll(".russian-capitulation-track").forEach((el) => { el.classList.remove("active"); });

      if (this.game.state.russian_capitulation_track == 1) { 
        document.querySelector(".russian-capitulation-track-1").classList.add("active");
      }
      if (this.game.state.russian_capitulation_track == 2) { 
        document.querySelector(".russian-capitulation-track-2").classList.add("active");
      }
      if (this.game.state.russian_capitulation_track == 3) { 
        document.querySelector(".russian-capitulation-track-3").classList.add("active");
      }
      if (this.game.state.russian_capitulation_track == 4) { 
        document.querySelector(".russian-capitulation-track-4").classList.add("active");
      }
      if (this.game.state.russian_capitulation_track == 5) { 
        document.querySelector(".russian-capitulation-track-5").classList.add("active");
      }
      if (this.game.state.russian_capitulation_track == 6) { 
        document.querySelector(".russian-capitulation-track-6").classList.add("active");
      }
      if (this.game.state.russian_capitulation_track == 7) { 
        document.querySelector(".russian-capitulation-track-7").classList.add("active");
      }
      if (this.game.state.russian_capitulation_track == 8) { 
        document.querySelector(".russian-capitulation-track-8").classList.add("active");
      }

    } catch (err) {

    }


  }

  displayReserveBoxes() {

    try {

      let arb = document.querySelector(".allies-reserve-box");
      let crb = document.querySelector(".central-reserve-box");

      arb.innerHTML = "";
      crb.innerHTML = "";

      for (let z = 0; z < this.game.state.reserves['allies'].length; z++) {
        arb.innerHTML += `<img class="army-tile" src="/paths/img/army/${this.game.state.reserves['allies'][z]}.png" />`;
      }
      for (let z = 0; z < this.game.state.reserves['central'].length; z++) {
        crb.innerHTML += `<img class="army-tile" src="/paths/img/army/${this.game.state.reserves['central'][z]}.png" />`;
      }

    } catch (err) {

    }

  }

  displayEliminatedUnitsBoxes() {

    try {

      let arb = document.querySelector(".allies-eliminated-units-box");
      let crb = document.querySelector(".central-eliminated-units-box");

      arb.innerHTML = "";
      crb.innerHTML = "";

      for (let z = 0; z < this.game.state.eliminated['allies'].length; z++) {
        arb.innerHTML += `<img class="army-tile" src="/paths/img/army/${this.game.state.eliminated['allies'][z]}.png" />`;
      }
      for (let z = 0; z < this.game.state.eliminated['central'].length; z++) {
        crb.innerHTML += `<img class="army-tile" src="/paths/img/army/${this.game.state.eliminated['central'][z]}.png" />`;
      }

    } catch (err) {

    }

  }


