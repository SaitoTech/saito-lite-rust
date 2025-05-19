
  hideOverlays() {
    this.zoom_overlay.hide();
  }

  pulseSpacekey(spacekey) {

    let elements = document.querySelectorAll(`.space.${spacekey}`);

    elements.forEach((el) => {
      el.classList.remove("pulsing");
      el.classList.add("pulsing");
    });

    setTimeout(() => {
      elements.forEach((el) => el.classList.remove("pulsing"));
    }, 2100);

  }


  shakeSpacekey(spacekey) {

    let qs = `.space.${spacekey}`;
    let element = document.querySelectorAll(qs).forEach((element) => {

      if (element.classList.contains("shake")) { return; }
      element.classList.add("shake");

      setTimeout(() => { 
        document.querySelectorAll(qs).forEach((element) => {
          element.classList.remove("shake");
        }); 
      }, 1500);
    });
  }

  shakeUnit(skey, ukey) {

    let qs = `.${ukey}`;
    document.querySelectorAll(qs).forEach((element) => {

      if (element.classList.contains("shake")) { return; }
      element.classList.add("shake");

      setTimeout(() => { 
        document.querySelectorAll(qs).forEach((element) => {
          element.classList.remove("shake");
	}); 
      }, 1500);
    });

  }

  displayCustomOverlay(obj={}) {

    //
    // move HUD above winter if winter is showing
    //
    this.welcome_overlay.pullHudOverOverlay();
    this.welcome_overlay.pushHudUnderOverlay();

    let deck = this.returnDeck(); // include removed

    let title = "";
    let text = "";
    let img = "";
    let card = "";

    if (obj.title) { title = obj.title; }
    if (obj.text) { text = obj.text; }
    if (obj.img) { img = obj.img; }
    if (obj.card) { card = obj.card; }

        this.welcome_overlay.renderCustom({
          text : text,
          title : title,
          img : img,
	  card : card
        });

  }

  addHighlightToSpacekey(spacekey="", htype="") {
    let obj = document.querySelector(`.${spacekey}`);
    if (htype == "central" && obj) { obj.classList.add('central-highlight'); }
    if (htype == "allies" && obj) { obj.classList.add('allies-highlight'); }
  }

  addHighlights(el) {
    if (!el.classList.contains("allies")) {
      el.classList.add('allies-highlight');
    }
    if (!el.classList.contains("neutral")) {
      el.classList.add('neutral-highlight');
    }
    if (!el.classList.contains("central")) {
      el.classList.add('central-highlight');
    }
  }

  removeHighlights() {
    document.querySelectorAll(".allies-highlight").forEach((el) => {
      el.classList.remove("allies-highlight");
    });
    document.querySelectorAll(".neutral-highlight").forEach((el) => {
      el.classList.remove("neutral-highlight");
    });
    document.querySelectorAll(".central-highlight").forEach((el) => {
      el.classList.remove("central-highlight");
    });
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
      //this.addHighlights();

    } catch (err) {
console.log("!");
console.log("!");
console.log("!");
      console.log("error displaying spaces... " + err);
    }

  }


  displaySpace(key) {

    if (key === "arbox" || key === "crbox" || key === "aeubox" || key === "ceubox") { return; }

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
      // add central control
      //
      if (space.country == "germany" || space.country == "austria" || space.country == "bulgaria" || space.country == "turkey") {
	if (space.control == "allies") {
          html += `<img src="/paths/img/tiles/control_ap.png" class="trench-tile control-tile" />`;
	}
      } else {
	if (space.control == "central") {
          html += `<img src="/paths/img/tiles/control_cp.png" class="trench-tile control-tile" />`;
	}
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

      //
      // out of supply
      //
      if (space.oos == 1 && space.units.length > 0) { 
	if (this.returnPowerOfUnit(space.units[0]) == "central") {
          html += `<img src="/paths/img/tiles/oos_central.png" class="trench-tile oos-tile" />`;
	} else {
          html += `<img src="/paths/img/tiles/oos_allies.png" class="trench-tile oos-tile" />`;
	}
      } else {

	//
	// remove any highlights
	//
        document.querySelectorAll(`.${key}`).forEach((el) => { 
	  el.classList.remove("oos-highlight");
	});
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

    //
    // add click event to gameboard for close-up / zoom UI
    //
    if (!paths_self.bound_gameboard_zoom) {

      //$('.main .gameboard').on('mousedown', function (e) {
      //  if (e.currentTarget.classList.contains("space")) { return; }
      //});
      $('.main .gameboard').on('mouseup', function (e) {

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

  	const board = document.querySelector(".main .gameboard");

  	let scale = 1;
  	const computedTransform = window.getComputedStyle(board).transform;
  	if (computedTransform && computedTransform !== "none") {
  	  const match = computedTransform.match(/^matrix\(([^,]+),/);
  	  if (match) {
  	    scale = parseFloat(match[1]);
  	  }
  	}

    	const rect = board.getBoundingClientRect();
  	const localX = (e.clientX - rect.left) / scale;
  	const localY = (e.clientY - rect.top) / scale;

  	paths_self.zoom_overlay.renderAtCoordinates(localY, localX);

      });


document.querySelector(".log").addEventListener("mouseover", (e) => {
  let trigger = e.target.closest(".pulse-trigger");
  if (trigger) {
    let spacekey = trigger.dataset.spacekey;
    this.pulseSpacekey(spacekey);
  }
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
      let can_event_card = false;
      try {
	can_event_card = card.canEvent(this);
      } catch (err) {}
      try {
        if (!can_event_card || (this.game.state.player_turn_card_select == true && card.cc == true)) {
          html += `<img class="${cardclass} cancel_x" src="/paths/img/cancel_x.png" />`;
        }
      } catch (err) {

console.log("$");
console.log("$");
console.log("$");
console.log("$");
console.log("$");
console.log("$");
console.log("$");
console.log("$");
console.log(err);

      }
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

      if (this.game.state.turn == 1) { document.querySelector(".turn-track-1").classList.add("active"); }
      if (this.game.state.turn == 2) { document.querySelector(".turn-track-2").classList.add("active"); }
      if (this.game.state.turn == 3) { document.querySelector(".turn-track-3").classList.add("active"); }
      if (this.game.state.turn == 4) { document.querySelector(".turn-track-4").classList.add("active"); }
      if (this.game.state.turn == 5) { document.querySelector(".turn-track-5").classList.add("active"); }
      if (this.game.state.turn == 6) { document.querySelector(".turn-track-6").classList.add("active"); }
      if (this.game.state.turn == 7) { document.querySelector(".turn-track-7").classList.add("active"); }
      if (this.game.state.turn == 8) { document.querySelector(".turn-track-8").classList.add("active"); }
      if (this.game.state.turn == 9) { document.querySelector(".turn-track-9").classList.add("active"); }
      if (this.game.state.turn == 10) { document.querySelector(".turn-track-10").classList.add("active"); }
      if (this.game.state.turn == 11) { document.querySelector(".turn-track-11").classList.add("active"); }
      if (this.game.state.turn == 12) { document.querySelector(".turn-track-12").classList.add("active"); }
      if (this.game.state.turn == 13) { document.querySelector(".turn-track-13").classList.add("active"); }
      if (this.game.state.turn == 14) { document.querySelector(".turn-track-14").classList.add("active"); }
      if (this.game.state.turn == 15) { document.querySelector(".turn-track-15").classList.add("active"); }
      if (this.game.state.turn == 16) { document.querySelector(".turn-track-16").classList.add("active"); }
      if (this.game.state.turn == 17) { document.querySelector(".turn-track-17").classList.add("active"); }
      if (this.game.state.turn == 18) { document.querySelector(".turn-track-18").classList.add("active"); }
      if (this.game.state.turn == 19) { document.querySelector(".turn-track-19").classList.add("active"); }
      if (this.game.state.turn == 20) { document.querySelector(".turn-track-20").classList.add("active"); }

    } catch (err) {

console.log("*");
console.log("*");
console.log("*");
console.log("*");
console.log("*");
console.log(JSON.stringify(err));

    }

  }

  displayGeneralRecordsTrack() {

    try {

      document.querySelectorAll(".general-records-track").forEach((el) => { el.classList.remove("vp"); el.innerHTML = ""; });

      ////////////////////////
      // Replacement Points //
      ////////////////////////

      // central
      document.querySelector(`.general-records-track-${this.game.state.rp["central"]["GE"]}`).innerHTML += `<img src="/paths/img/rp/rp_ge.png" />`;
      document.querySelector(`.general-records-track-${this.game.state.rp["central"]["AH"]}`).innerHTML += `<img src="/paths/img/rp/rp_ah.png" />`;
      document.querySelector(`.general-records-track-${this.game.state.rp["central"]["TU"]}`).innerHTML += `<img src="/paths/img/rp/rp_tu.png" />`;
      document.querySelector(`.general-records-track-${this.game.state.rp["central"]["BU"]}`).innerHTML += `<img src="/paths/img/rp/rp_bu.png" />`;
      document.querySelector(`.general-records-track-${this.game.state.rp["central"]["CP"]}`).innerHTML += `<img src="/paths/img/rp/rp_cp.png" />`;

      // allies
      document.querySelector(`.general-records-track-${this.game.state.rp["allies"]["A"]}`).innerHTML += `<img src="/paths/img/rp/rp_a.png" />`;
      document.querySelector(`.general-records-track-${this.game.state.rp["allies"]["BR"]}`).innerHTML += `<img src="/paths/img/rp/rp_br.png" />`;
      document.querySelector(`.general-records-track-${this.game.state.rp["allies"]["FR"]}`).innerHTML += `<img src="/paths/img/rp/rp_fr.png" />`;
      document.querySelector(`.general-records-track-${this.game.state.rp["allies"]["IT"]}`).innerHTML += `<img src="/paths/img/rp/rp_it.png" />`;
      document.querySelector(`.general-records-track-${this.game.state.rp["allies"]["RU"]}`).innerHTML += `<img src="/paths/img/rp/rp_ru.png" />`;
      document.querySelector(`.general-records-track-${this.game.state.rp["allies"]["AP"]}`).innerHTML += `<img src="/paths/img/rp/rp_ap.png" />`;

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
      document.querySelector(`.general-records-track-${this.game.state.general_records_track.vp}`).innerHTML += `<img src="/paths/img/vp.png" />`;


      ////////////////
      // War Status //
      ////////////////
      let allies_war_status = `<img src="/paths/img/warstatus_ap.png" />`;
      let central_war_status = `<img src="/paths/img/warstatus_cp.png" />`;
      let combined_war_status = `<img src="/paths/img/warstatus_combined.png" />`;
      let current_cp_russian_vp = `<img src="/paths/img/current_cp_russian_vp.png" />`;

console.log("CHECKING WAR STATUS: ");
console.log("Allies: " + this.game.state.general_records_track.allies_war_status);
console.log("Central: " + this.game.state.general_records_track.central_war_status);

      document.querySelector(`.general-records-track-${this.game.state.general_records_track.allies_war_status}`).innerHTML += allies_war_status;
      document.querySelector(`.general-records-track-${this.game.state.general_records_track.central_war_status}`).innerHTML += central_war_status;
      document.querySelector(`.general-records-track-${this.game.state.general_records_track.combined_war_status}`).innerHTML += combined_war_status;
      document.querySelector(`.general-records-track-${this.game.state.general_records_track.current_cp_russian_vp}`).innerHTML += current_cp_russian_vp;

    } catch (err) {
console.log("X");
console.log("X");
console.log("X");
console.log("X");
console.log("X");
console.log("X");
console.log("X");
console.log("X");
console.log("X");
console.log("X");
      console.log(err);
    }

  }

  displayActionRoundTracks() {

    let central_token = `<img src="/paths/img/control_cp.png" />`;
    let allies_token = `<img src="/paths/img/allies_cp.png" />`;
    let current_round = this.game.state.round;
    let current_turn = this.game.state.turn;

    document.querySelectorAll(`.central-action-round-track`).forEach((el) => { el.innerHTML = ""; });
    document.querySelectorAll(`.allies-action-round-track`).forEach((el) => { el.innerHTML = ""; });

    for (let z = 0; z < this.game.state.allies_rounds.length; z++) {
      let allies_move = this.game.state.allies_rounds[z];
      if (allies_move == "sr") {
	document.querySelector(".allies-action-round-track-5").innerHTML = `<ing src="/paths/img/action_ap${(z+1)}.png" />`;
      }
      if (allies_move == "rp") {
	document.querySelector(".allies-action-round-track-6").innerHTML = `<ing src="/paths/img/action_ap${(z+1)}.png" />`;
      }
    }
    for (let z = 0; z < this.game.state.central_rounds.length; z++) {
      let central_move = this.game.state.central_rounds[z];
      if (central_move == "sr") {
	document.querySelector(".central-action-round-track-7").innerHTML = `<ing src="/paths/img/action_cp${(z+1)}.png" />`;
      }
      if (central_move == "rp") {
	document.querySelector(".central-action-round-track-8").innerHTML = `<ing src="/paths/img/action_cp${(z+1)}.png" />`;
      }
    }

    if (parseInt(this.game.state.central_reinforcements_ge) > 0) {
      document.querySelector(`.central-action-round-track-2`).innerHTML = `<img src="/paths/img/action_cp${this.game.state.central_reinforcements_ge}.png" />`;
    }
    if (parseInt(this.game.state.central_reinforcements_ah) > 0) {
      document.querySelector(`.central-action-round-track-3`).innerHTML = `<img src="/paths/img/action_cp${this.game.state.central_reinforcements_ah}.png" />`;
    }
    if (parseInt(this.game.state.central_reinforcements_tu) > 0) {
      document.querySelector(`.central-action-round-track-4`).innerHTML = `<img src="/paths/img/action_cp${this.game.state.central_reinforcements_tu}.png" />`;
    }

    if (parseInt(this.game.state.allies_reinforcements_fr) > 0) {
      document.querySelector(`.allies-action-round-track-2`).innerHTML = `<img src="/paths/img/action_ap${this.game.state.allies_reinforcements_fr}.png" />`;
    }
    if (parseInt(this.game.state.allies_reinforcements_br) > 0) {
      document.querySelector(`.allies-action-round-track-3`).innerHTML = `<img src="/paths/img/action_ap${this.game.state.allies_reinforcements_br}.png" />`;
    }
    if (parseInt(this.game.state.allies_reinforcements_ru) > 0) {
      document.querySelector(`.allies-action-round-track-4`).innerHTML = `<img src="/paths/img/action_ap${this.game.state.allies_reinforcements_ru}.png" />`;
    }
    if (parseInt(this.game.state.allies_reinforcements_it) > 0) {
      document.querySelector(`.allies-action-round-track-5`).innerHTML = `<img src="/paths/img/action_ap${this.game.state.allies_reinforcements_it}.png" />`;
    }
    if (parseInt(this.game.state.allies_reinforcements_us) > 0) {
      document.querySelector(`.allies-action-round-track-6`).innerHTML = `<img src="/paths/img/action_ap${this.game.state.allies_reinforcements_us}.png" />`;
    }

    if (this.game.state.neutral_entry != 0) {
      document.querySelector(`.central-action-round-track-1`).innerHTML = central_token;;
      document.querySelector(`.allies-action-round-track-1`).innerHTML = allies_token;;
    }

  }

  displayMandatedOffensiveTracks() {

    document.querySelectorAll(".central-mandated-offensive-track").forEach((el) => { el.classList.remove("active"); });
    document.querySelectorAll(".allies-mandated-offensive-track").forEach((el) => { el.classList.remove("active"); });

    if (this.game.state.mandated_offensives.central === "AH") {
      document.querySelector(".central-mandated-offensive-track-1").classList.add("active");
    }
    if (this.game.state.mandated_offensives.central === "AH IT") {
      document.querySelector(".central-mandated-offensive-track-1").classList.add("active");
    }
    if (this.game.state.mandated_offensives.central === "TU") {
      document.querySelector(".central-mandated-offensive-track-1").classList.add("active");
    }
    if (this.game.state.mandated_offensives.central === "GE") {
      document.querySelector(".central-mandated-offensive-track-1").classList.add("active");
    }

    if (this.game.state.mandated_offensives.allies === "FR") {
      document.querySelector(".allies-mandated-offensive-track-1").classList.add("active");
    }
    if (this.game.state.mandated_offensives.allies === "FR") {
      document.querySelector(".allies-mandated-offensive-track-2").classList.add("active");
    }
    if (this.game.state.mandated_offensives.allies === "BR") {
      document.querySelector(".allies-mandated-offensive-track-3").classList.add("active");
    }
    if (this.game.state.mandated_offensives.allies === "IT") {
      document.querySelector(".allies-mandated-offensive-track-4").classList.add("active");
    }
    if (this.game.state.mandated_offensives.allies === "IT") {
      document.querySelector(".allies-mandated-offensive-track-5").classList.add("active");
    }
    if (this.game.state.mandated_offensives.allies === "RU") {
      document.querySelector(".allies-mandated-offensive-track-5").classList.add("active");
    }

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
          arb.innerHTML += `<img class="army-tile ${this.game.spaces["arbox"].units[z].key}" src="/paths/img/army/${this.game.spaces["arbox"].units[z].back}" />`;
        } else {
          arb.innerHTML += `<img class="army-tile ${this.game.spaces["arbox"].units[z].key}" src="/paths/img/army/${this.game.spaces["arbox"].units[z].front}" />`;
	}
      }
      for (let z = 0; z < this.game.spaces["crbox"].units.length; z++) {
	if (this.game.spaces["crbox"].units[z].damaged) {
          crb.innerHTML += `<img class="army-tile ${this.game.spaces["crbox"].units[z].key}" src="/paths/img/army/${this.game.spaces["crbox"].units[z].back}" />`;
        } else {
          crb.innerHTML += `<img class="army-tile ${this.game.spaces["crbox"].units[z].key}" src="/paths/img/army/${this.game.spaces["crbox"].units[z].front}" />`;
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
        arb.innerHTML += `<img class="army-tile ${this.game.state.eliminated["allies"][z].key}" src="/paths/img/army/${this.game.state.eliminated['allies'][z]}.png" />`;
      }
      for (let z = 0; z < this.game.state.eliminated['central'].length; z++) {
        crb.innerHTML += `<img class="army-tile ${this.game.state.eliminated["central"][z].key}" src="/paths/img/army/${this.game.state.eliminated['central'][z]}.png" />`;
      }

    } catch (err) {

    }

  }


