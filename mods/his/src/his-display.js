
  displayFactionSheet(faction) {
    let html = this.factions[faction].returnFactionSheet(faction);
    this.overlay.showOverlay(this.app, this, html);
  }

  displayBoard() {

    try {

      this.displayColony();
      this.displayConquest();
      this.displayNewWorld();
      this.displaySpaces();
      this.displayVictoryTrack();

    } catch (err) {

      console.log("error displaying board...");

    }
  }

  displayColony() {
  }

  displayConquest() {
  }

  displayNewWorld() {
  }

  displaySpace(name) {
    let html = this.spaces[name].returnView();    
    this.overlay.showOverlay(this.app, this, html);
  }

  displaySpaces() {

    //
    // add tiles
    //
    for (let key in this.spaces) {
      if (this.spaces.hasOwnProperty(key)) {

        let obj = document.getElementById(key);
	let space = this.spaces[key];

	let owner = space.political;
	if (owner == "") { owner = space.home; }
	let tile = "";
	let stype = "hex";

	if (space.type == "town") { stype = "hex"; }
	if (space.type == "key") { stype = "key"; }

	if (owner != "") {
	  if (owner === "hapsburg") {
	    tile = "/his/img/tiles/hapsburg/";	  
	    if (space.religion === "protestant") {
	      tile += `Hapsburg_${stype}_back.svg`;
	    } else {
	      tile += `Hapsburg_${stype}.svg`;
	    }
	  }
	  if (owner === "england") {
	    tile = "/his/img/tiles/england/";	  
	    if (space.religion === "protestant") {
	      tile += `England_${stype}_back.svg`;
	    } else {
	      tile += `England_${stype}.svg`;
	    }
	  }
	  if (owner === "france") {
	    tile = "/his/img/tiles/france/";	  
	    if (space.religion === "protestant") {
	      tile += `France_${stype}_back.svg`;
	    } else {
	      tile += `France_${stype}.svg`;
	    }
	  }
	  if (owner === "papacy") {
	    tile = "/his/img/tiles/papacy/";	  
	    if (space.religion === "protestant") {
	      tile += `Papacy_${stype}_back.svg`;
	    } else {
	      tile += `Papacy_${stype}.svg`;
	    }
	  }
	  if (owner === "protestant") {
	    tile = "/his/img/tiles/protestant/";	  
	    if (space.religion === "protestant") {
	      tile += `Protestant_${stype}_back.svg`;
	    } else {
	      tile += `Protestant_${stype}.svg`;
	    }
	  }
	  if (owner === "ottoman") {
	    tile = "/his/img/tiles/ottoman/";	  
	    if (space.religion === "protestant") {
	      tile += `Ottoman_${stype}_back.svg`;
	    } else {
	      tile += `Ottoman_${stype}.svg`;
	    }
	  }
	}

	let show_tile = 1;

	//
	// do not show under some conditions
	//
	if (space.political == space.home) { show_tile = 0; }
	if (space.political === "") { show_tile = 0; }

	//
	// and force for keys
	//
	if (space.home === "" && space.political !== "") { show_tile = 1; }
	if (space.type === "key") { show_tile = 1; }


	if (show_tile === 1) {
	  obj.innerHTML = `
	    <img class="${stype}tile" src="${tile}" />
	  `;
	}

      }
    }


    //
    // add click event
    //
    for (let key in this.spaces) {
      if (this.spaces.hasOwnProperty(key)) {
        document.getElementById(key).onclick = (e) => {
	  this.displaySpace(key);
        }
      }
    }

  }

  displayVictoryTrack() {
  }



