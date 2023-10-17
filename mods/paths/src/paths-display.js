
  hideOverlays() {
    this.zoom_overlay.hide();
  }

  displayBoard() {
    try {
      this.displaySpaces();
    } catch (err) {
      console.log("error displaying spaces... " + err);
    }
  }


  displaySpace(key) {
console.log("display: " + key);
  }

  displaySpaces() {

    let paths_self = this;

    if (!this.game.state.board) {
      this.game.state.board["protestant"] = this.returnOnBoardUnits("protestant");
      this.game.state.board["papacy"] = this.returnOnBoardUnits("papacy");
      this.game.state.board["england"] = this.returnOnBoardUnits("england");
      this.game.state.board["france"] = this.returnOnBoardUnits("france");
      this.game.state.board["ottoman"] = this.returnOnBoardUnits("ottoman");
      this.game.state.board["hapsburg"] = this.returnOnBoardUnits("hapsburg");
    }

    //
    // add tiles
    //
    for (let key in this.spaces) {
      if (this.spaces.hasOwnProperty(key)) {
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
          paths_self.theses_overlay.renderAtCoordinates(xpos, ypos);
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
    let deckidx = -1;
    let card;
    let cdeck = this.returnDeck();
    let ddeck = this.returnDiplomaticDeck();

    if (cardname === "pass") {
      return `<img class="${cardclass}" src="/his/img/cards/PASS.png" /><div class="cardtext">pass</div>`;
    }

    if (this.debaters[cardname]) { return this.debaters[cardname].returnCardImage(); }

    for (let i = 0; i < this.game.deck.length; i++) {
      var c = this.game.deck[i].cards[cardname];
      if (c == undefined) { c = this.game.deck[i].discards[cardname]; }
      if (c == undefined) { c = this.game.deck[i].removed[cardname]; }
      if (c !== undefined) { 
	deckidx = i;
        card = c;
      }
    }
    if (c == undefined) { c = cdeck[cardname]; card = cdeck[cardname]; }
    if (c == undefined) { c = ddeck[cardname]; card = ddeck[cardname]; }

    //
    // triggered before card deal
    //
    if (cardname === "008") { return `<img class="${cardclass}" src="/his/img/cards/HIS-008.svg" />`; }

    if (deckidx === -1 && !cdeck[cardname] && !ddeck[cardname]) {
      //
      // this is not a card, it is something like "skip turn" or cancel
      //
      return `<div class="noncard" id="${cardname.replaceAll(" ","")}">${cardname}</div>`;
    }

    var html = `<img class="${cardclass}" src="/his/img/${card.img}" />`;

    //
    // add cancel button to uneventable cards
    //
    if (deckidx == 0) { 
      if (!this.deck[cardname]) {
        if (!this.deck[cardname].canEvent(this, "")) {
          html += `<img class="${cardclass} cancel_x" src="/his/img/cancel_x.png" />`;
        }
      }
    }
    if (deckidx == 1) { 
      if (!this.diplomatic_deck[cardname].canEvent(this, "")) {
        html += `<img class="${cardclass} cancel_x" src="/his/img/cancel_x.png" />`;
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
      pre_images[idx].src = "/his/" + imageArray[idx];
    }

  }



