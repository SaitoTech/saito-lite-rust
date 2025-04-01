
  hideOverlays() {
    this.zoom_overlay.hide();
  }


  displayCustomOverlay(c="", msg="") {

    //
    // move HUD above winter if winter is showing
    //
    this.welcome_overlay.pullHudOverOverlay();
    this.welcome_overlay.pushHudUnderOverlay();


    let deck = this.returnDeck(true); // include removed
    if (deck[c]) {
      if (deck[c].returnCustomOverlay) {

        let obj = deck[c].returnCustomOverlay();
        let title = obj.title;
        let text = obj.text;
        let img = obj.img;
        let card = this.returnCardImage(c);

        if (msg == "") {
          msg = this.popup(c) + " triggers";
        }
 
        this.welcome_overlay.renderCustom({
          text : text,
          title : title,
          img : img,
          card : card,
        });
      }
    }

  }

  addHighlights(el) {
//    if (!el.classList.contains("allies")) {
//      el.classList.add('allies-highlight');
//    }
//    if (!el.classList.contains("neutral")) {
//      el.classList.add('neutral-highlight');
//    }
//    if (!el.classList.contains("central")) {
//      el.classList.add('central-highlight');
//    }
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
      this.addHighlights();

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

    if (key == "arbox" || key == "crbox") { return; }

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
console.log("space is activated for movement: " + key);  
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

      if (space.besieged == 1) {
        html += `<img src="/paths/img/tiles/fort_besieged.png" class="trench-tile fort-besieged" />`;
      }
      if (space.fort == -1) {
        html += `<img src="/paths/img/tiles/fort_destroyed.png" class="trench-tile fort-destroyed" />`;
      }

      document.querySelectorAll(`.${key}`).forEach((el) => { 
//        if (control == "allies") { el.classList.add("allies-highlight"); }
//        if (control == "central") { el.classList.add("central-highlight"); }
//        if (control == "neutral") { el.classList.add("neutral-highlight"); }
	el.innerHTML = html; 
      });

    } catch (err) {
console.log("err: " + err);
    }
  }

  displaySpaceDetailedView(key) {
    this.space_overlay.render(key);
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
	if (!card.canEvent(this)) {
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

      document.querySelectorAll(".general-records-track").forEach((el) => { el.classList.remove("vp"); el.innerHTML = ""; });

      ////////////////////////
      // Replacement Points //
      ////////////////////////

      // central
      document.querySelector(`.general-records-track-${this.game.state.rp["central"]["ge"]}`).innerHTML += `<img src="/paths/img/rp/rp_ge.png" />`;
      document.querySelector(`.general-records-track-${this.game.state.rp["central"]["ah"]}`).innerHTML += `<img src="/paths/img/rp/rp_ah.png" />`;
      document.querySelector(`.general-records-track-${this.game.state.rp["central"]["tu"]}`).innerHTML += `<img src="/paths/img/rp/rp_tu.png" />`;
      document.querySelector(`.general-records-track-${this.game.state.rp["central"]["bu"]}`).innerHTML += `<img src="/paths/img/rp/rp_bu.png" />`;
      document.querySelector(`.general-records-track-${this.game.state.rp["central"]["cp"]}`).innerHTML += `<img src="/paths/img/rp/rp_cp.png" />`;

      // allies
      document.querySelector(`.general-records-track-${this.game.state.rp["allies"]["a"]}`).innerHTML += `<img src="/paths/img/rp/rp_a.png" />`;
      document.querySelector(`.general-records-track-${this.game.state.rp["allies"]["br"]}`).innerHTML += `<img src="/paths/img/rp/rp_br.png" />`;
      document.querySelector(`.general-records-track-${this.game.state.rp["allies"]["fr"]}`).innerHTML += `<img src="/paths/img/rp/rp_fr.png" />`;
      document.querySelector(`.general-records-track-${this.game.state.rp["allies"]["it"]}`).innerHTML += `<img src="/paths/img/rp/rp_it.png" />`;
      document.querySelector(`.general-records-track-${this.game.state.rp["allies"]["ru"]}`).innerHTML += `<img src="/paths/img/rp/rp_ru.png" />`;
      document.querySelector(`.general-records-track-${this.game.state.rp["allies"]["ap"]}`).innerHTML += `<img src="/paths/img/rp/rp_ap.png" />`;

      let central_rp = 0;
      for (let key in this.game.state.rp["central"]) { central_rp += this.game.state.rp["central"][key]; }

      let allied_rp = 0;
      for (let key in this.game.state.rp["allies"]) { allied_rp += this.game.state.rp["allies"][key]; }

      document.querySelector(`.general-records-track-${central_rp}`).innerHTML += `<img src="/paths/img/rp/rp_cp.png" />`;
      document.querySelector(`.general-records-track-${allied_rp}`).innerHTML += `<img src="/paths/img/rp/rp_allied.png" />`;


      ////////////////////
      // Victory Points //
      ////////////////////
      this.calculateVictoryPoints();
      document.querySelector(`.general-records-track-${this.game.state.general_records_track.vp}`).innerHTML += `<img src="/paths/img/vp_button.png" />`;


      ////////////////
      // War Status //
      ////////////////
      let allies_war_status = `<img src="/paths/img/warstatus_ap.png" />`;
      let central_war_status = `<img src="/paths/img/warstatus_cp.png" />`;
      let combined_war_status = `<img src="/paths/img/warstatus_combined.png" />`;
      let current_cp_russian_vp = `<img src="/paths/img/current_cp_russian_vp.png" />`;

      document.querySelector(`.general-records-track-${this.game.state.general_records_track.allies_war_status}`).innerHTML += allies_war_status;
      document.querySelector(`.general-records-track-${this.game.state.general_records_track.central_war_status}`).innerHTML += central_war_status;
      document.querySelector(`.general-records-track-${this.game.state.general_records_track.combined_war_status}`).innerHTML += combined_war_status;
      document.querySelector(`.general-records-track-${this.game.state.general_records_track.current_cp_russian_vp}`).innerHTML += current_cp_russian_vp;

    } catch (err) {
      console.log(err);
    }

  }

  displayActionRoundTracks() {

  }

  displayMandatedOffensiveTracks() {
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

      for (let z = 0; z < this.game.spaces["arbox"].units.length; z++) {
	if (this.game.spaces["arbox"].units[z].damaged) {
          arb.innerHTML += `<img class="army-tile" src="/paths/img/army/${this.game.spaces["arbox"].units[z].back}" />`;
        } else {
          arb.innerHTML += `<img class="army-tile" src="/paths/img/army/${this.game.spaces["arbox"].units[z].front}" />`;
	}
      }
      for (let z = 0; z < this.game.spaces["crbox"].units.length; z++) {
	if (this.game.spaces["arbox"].units[z].damaged) {
          crb.innerHTML += `<img class="army-tile" src="/paths/img/army/${this.game.spaces["crbox"].units[z].back}" />`;
        } else {
          crb.innerHTML += `<img class="army-tile" src="/paths/img/army/${this.game.spaces["crbox"].units[z].front}" />`;
	}
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


