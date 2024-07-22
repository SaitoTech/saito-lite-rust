const AvailableUnitsTemplate = require('./available-units.template');
class AvailableUnitsOverlay {

	constructor(app, mod, c1, c2, c3) {
		this.app = app;
		this.mod = mod;
		this.visible = false;
		this.max_units = 0;
		this.ops_spend = 0;
		this.units_already_moved_by_idx = [];
		this.is_unit_already_moved_by_idx_a_leader = [];
		this.added = 0; // just idx tracker
		this.faded_out = false;
	}

	hide() {
		let obj = document.querySelector(".available-units-overlay");
		if (obj) { obj.remove(); }
		this.faded_out = false;
	}

	fadeOut(force=false) {
		try {
			if (this.units_already_moved_by_idx.length == 0 || force == true) {
				this.faded_out = true;
				document.querySelector(".movement-overlay .available-units-overlay").style.backgroundColor = "#0009";
				document.querySelector(".movement-overlay .available-units-overlay").style.opacity = 0.2;
			}
		} catch (err) {
		}
	  	document.querySelectorAll(".available-units-overlay .army_tile").forEach((el) => { el.onclick = (e) => {}; });
	}

	renderMove(mobj, faction, spacekey) {

                let max_formation_size = this.mod.returnMaxFormationSize(
                        mobj.units_to_move,
                        faction,
                        spacekey
                );     

                //
                // this manually moves multiple units, skirting the restrictions on moving
                // single units that is imposed on the lowest-level (his-player) and which
                // bites if we are already over-capacity on unit construction...
                //
	        if (mobj.units_to_move.length == 0) {
                  document.querySelectorAll(".available-units-overlay .army_tile").forEach((el) => {
                    if (el.classList.contains("nonopaque")) {
                      el.classList.remove("nonopaque");
                      el.classList.add("opaque");
                    }
		  });
	        }

		let his_self = this.mod;

		let qs = ".movement-overlay .available-units-overlay";

	 	if (!document.querySelector(".available-units-overlay")) {
		  his_self.app.browser.addElementToDom(AvailableUnitsTemplate());
		} else {
		  document.querySelector(".available-units-overlay").innerHTML = ``;
		}

	  	let p = this.mod.returnPlayerCommandingFaction(faction);
	  	let io = this.mod.game.spaces[spacekey].units;
		this.added = 0;

		if (this.faded_out) { this.fadeOut(true); }

		for (let f in io) {
	  	  if (this.mod.isAlliedMinorPower(f, faction) || f === faction) {

	  	    let x = this.mod.returnOnBoardUnits(f);
		    if (x.deployed[spacekey]) {
	  	    let us = x.deployed[spacekey];
	  	    let usm = x.missing[spacekey];

		    let army_leaders = [];
		    //
		    // HACK -- fetch army leaders from separate mobj data structure
		    //
		    for (let i = 0; i < io[f].length; i++) {
		      let u = io[f][i];
		      if (u.army_leader) {
		        document.querySelector(qs).innerHTML += this.returnTile(f, i, u.type, i, true); // true = leader 
		      }
		    }

if (us['regular']) {
	  	    for (let i = 0; i < us['regular']['1']; i++) {
		      document.querySelector(qs).innerHTML += this.returnTile(f, this.added, "regular", 1); 
		    }
	  	    for (let i = 0; i < us['regular']['2']; i++) {
		      document.querySelector(qs).innerHTML += this.returnTile(f, this.added, "regular", 2); 
		    }
	  	    for (let i = 0; i < us['regular']['3']; i++) {
		      document.querySelector(qs).innerHTML += this.returnTile(f, this.added, "regular", 3); 
		    }
	  	    for (let i = 0; i < us['regular']['4']; i++) {
		      document.querySelector(qs).innerHTML += this.returnTile(f, this.added, "regular", 4); 
		    }
	  	    for (let i = 0; i < us['regular']['5']; i++) {
		      document.querySelector(qs).innerHTML += this.returnTile(f, this.added, "regular", 5); 
		    }
	  	    for (let i = 0; i < us['regular']['6']; i++) {
		      document.querySelector(qs).innerHTML += this.returnTile(f, this.added, "regular", 6); 
		    }
	  	    for (let i = 0; i < usm['regular']['1']; i++) {
		      document.querySelector(qs).innerHTML += this.returnTile(f, this.added, "regular", 1); 
		    }
}
if (us['cavalry']) {
	  	    for (let i = 0; i < us['cavalry']['1']; i++) {
		      document.querySelector(qs).innerHTML += this.returnTile(f, this.added, "cavalry", 1); 
		    }
	  	    for (let i = 0; i < us['cavalry']['2']; i++) {
		      document.querySelector(qs).innerHTML += this.returnTile(f, this.added, "cavalry", 2); 
		    }
	  	    for (let i = 0; i < us['cavalry']['3']; i++) {
		      document.querySelector(qs).innerHTML += this.returnTile(f, this.added, "cavalry", 3); 
		    }
	  	    for (let i = 0; i < us['cavalry']['4']; i++) {
		      document.querySelector(qs).innerHTML += this.returnTile(f, this.added, "cavalry", 4); 
		    }
	  	    for (let i = 0; i < us['cavalry']['5']; i++) {
		      document.querySelector(qs).innerHTML += this.returnTile(f, this.added, "cavalry", 5); 
		    }
	  	    for (let i = 0; i < us['cavalry']['6']; i++) {
		      document.querySelector(qs).innerHTML += this.returnTile(f, this.added, "cavalry", 6); 
		    }
	  	    for (let i = 0; i < usm['cavalry']['1']; i++) {
		      document.querySelector(qs).innerHTML += this.returnTile(f, this.added, "cavalry", 1); 
		    }
}
if (us['mercenary']) {
	  	    for (let i = 0; i < us['mercenary']['1']; i++) {
		      document.querySelector(qs).innerHTML += this.returnTile(f, this.added, "mercenary", 1); 
		    }
	  	    for (let i = 0; i < us['mercenary']['2']; i++) {
		      document.querySelector(qs).innerHTML += this.returnTile(f, this.added, "mercenary", 2); 
		    }
	  	    for (let i = 0; i < us['mercenary']['3']; i++) {
		      document.querySelector(qs).innerHTML += this.returnTile(f, this.added, "mercenary", 3); 
		    }
	  	    for (let i = 0; i < us['mercenary']['4']; i++) {
		      document.querySelector(qs).innerHTML += this.returnTile(f, this.added, "mercenary", 4); 
		    }
	  	    for (let i = 0; i < us['mercenary']['5']; i++) {
		      document.querySelector(qs).innerHTML += this.returnTile(f, this.added, "mercenary", 5); 
		    }
	  	    for (let i = 0; i < us['mercenary']['6']; i++) {
		      document.querySelector(qs).innerHTML += this.returnTile(f, this.added, "mercenary", 6); 
}
	  	    for (let i = 0; i < usm['mercenary']['1']; i++) {
		      document.querySelector(qs).innerHTML += this.returnTile(f, this.added, "mercenary", 1); 
}
		    }
		    } // if exists
		  }
		}

	  
		//
		// this manually moves multiple units, skirting the restrictions on moving
		// single units that is imposed on the lowest-level (his-player) and which 
		// bites if we are already over-capacity on unit construction...
		//
	  	document.querySelectorAll(".available-units-overlay .army_tile").forEach((el) => { el.onclick = (e) => {

		  let adding = false;

		  if (e.currentTarget.classList.contains("nonopaque")) {
		    e.currentTarget.classList.remove("nonopaque");
		    e.currentTarget.classList.add("opaque");
		  } else {
		    e.currentTarget.classList.remove("opaque");
		    e.currentTarget.classList.add("nonopaque");
		    adding = true;
		  }

	  	  let id = e.currentTarget.id;
	  	  let x = id.split("-");

	  	  let num = parseInt(x[0]);
	  	  let faction = x[1];
	  	  let type = x[2];
		  let is_army_leader = false


		  let original_type = type;
		  if (type.indexOf("_") > 0) { is_army_leader = true; type = type.replace(/_/g, "-"); }
		  if (type === "renegade" || type === "dudley" || type === "montmorency" || type === "ferdinand" || type === "suleiman") { is_army_leader = true; }

	  	  let idx = parseInt(x[3]);
		  let mobj = this.mod.movement_overlay.mobj;

		  let existing_land_units = 0;
		  for (let z = 0; z < mobj.moved_units.length; z++) {
		    if (mobj.moved_units[z].type == "regular" || 
		        mobj.moved_units[z].type == "mercenary" || 
		        mobj.moved_units[z].type == "cavalry"
		    ) {
		      existing_land_units++;
		    }
		  }

		  if (max_formation_size < (num + existing_land_units) && adding == true) {
		    alert("You cannot move these units without surpassing your max formation capacity of " + max_formation_size);
		    if (e.currentTarget.classList.contains("nonopaque")) {
		      e.currentTarget.classList.remove("nonopaque");
		      e.currentTarget.classList.add("opaque");
		    } else {
		      e.currentTarget.classList.remove("opaque");
		      e.currentTarget.classList.add("nonopaque");
		    }
		    return;
		  }

		  if (adding == true) {

	  	    this.units_already_moved_by_idx.push(idx);
		    if (is_army_leader) { 
		      this.is_unit_already_moved_by_idx_a_leader.push(1); 
		    } else {
		      this.is_unit_already_moved_by_idx_a_leader.push(0);
		    }

	 	    let qs = `.regular:nth-child(-n+` + num + `)`;
	  	    let objs = document.querySelectorAll(qs);

		    for (let i = 0; i < num; i++) {
		      let moved = false;
		      for (let z = 0; z < mobj.unmoved_units.length; z++) {
		        if (mobj.unmoved_units[z].faction == faction && mobj.unmoved_units[z].type == type && moved == false) {
			  mobj.moved_units.push(mobj.unmoved_units[z]);
			  mobj.units_to_move.push(JSON.parse(JSON.stringify(mobj.unmoved_units[z])));
			  mobj.unmoved_units.splice(z, 1);
			  z--;
			  moved = true;
		        }
		      }
		    }

		  } else {

		    for (let z = 0; z < this.units_already_moved_by_idx.length; z++) {
		      if (is_army_leader) {
			if (this.is_unit_already_moved_by_idx_a_leader[z] == 1 && this.units_already_moved_by_idx[z] === idx) {
		          this.units_already_moved_by_idx.splice(z, 1);
		          this.is_unit_already_moved_by_idx_a_leader.splice(z, 1);
			  //
			  // because we are removing an army leader, we remove everything
			  //
			  this.units_already_moved_by_idx = [];
			  this.is_unit_already_moved_by_idx_a_leader = [];
			  z = 10000;
			  for (let ii = mobj.moved_units.length-1; ii >= 0; ii--) { mobj.unmoved_units.push(mobj.moved_units[ii]); }
			  mobj.moved_units = [];
			  mobj.units_to_move = [];
                  	  this.mod.movement_overlay.selectUnitsInterface(this.mod, mobj.units_to_move, this.mod.movement_overlay.selectUnitsInterface, this.mod.movement_overlay.selectDestinationInterface);
			  return;
		        }
		      } else {
			if (this.is_unit_already_moved_by_idx_a_leader[z] == 0 && this.units_already_moved_by_idx[z] === idx) {
		          this.units_already_moved_by_idx.splice(z, 1);
		          this.is_unit_already_moved_by_idx_a_leader.splice(z, 1);
			  z--;
		        }
		      }
		    }

		    for (let i = 0; i < num; i++) {
		      let moved = false;
		      for (let z = 0; z < mobj.moved_units.length && moved == false; z++) {
		        if (mobj.moved_units[z].faction == faction && mobj.moved_units[z].type == type && moved == false) {
			  let mrem = false;
			  for (let yy = 0; yy < mobj.units_to_move.length; yy++) {
		            if (mobj.units_to_move[yy].faction == faction && mobj.units_to_move[yy].type == type && mrem == false) {
			      mobj.units_to_move.splice(yy, 1);
			      mrem = true;
			      yy--;
			      break;
			    }
			  }
			  mobj.unmoved_units.push(mobj.moved_units[z]);
			  mobj.moved_units.splice(z, 1);
			  z--;
			  moved = true;
		        }
		      }
		    }
		  }

                  this.mod.movement_overlay.selectUnitsInterface(this.mod, mobj.units_to_move, this.mod.movement_overlay.selectUnitsInterface, this.mod.movement_overlay.selectDestinationInterface);
		  //
		  // disable manual
		  //
		  document.querySelectorAll(".movement-unit .option").forEach((el) => { el.onclick = (e) => {
		    alert("Once you have started to move units by tokens, please continue doing so. This avoids problems with auto-breaking up units and exceeding faction capacity...");
		  } });


	  	} });

	}

	renderBuild(faction, unit, ops, cost, mycallback) {
		let his_self = this.mod;

	 	if (!document.querySelector(".available-units-overlay")) {
		  his_self.app.browser.addElementToDom(AvailableUnitsTemplate());
		} else {
		  document.querySelector(".available-units-overlay").innerHTML = ``;
		}

		this.max_units = his_self.returnNumberOfUnitsAvailableForConstruction(faction, unit);
		this.addUnitsAvailableToPage(faction, unit, (ops / cost));
		document.querySelectorAll(".available-units-overlay .army_tile").forEach((el) => { el.onclick = (e) => {
		  let num = parseInt(e.currentTarget.id);
		  if ((cost*num) > ops) {
		    alert("You do not have the OPs to purchase that many units");
		    return;
		  }
		  mycallback(num);
		} });
	}


	returnTile(faction, added = 0, utype, num=1, leader=false) {

	  let muc = "opaque";
	  if (leader == false) {
	    if (this.units_already_moved_by_idx.includes(added)) { 
	      for (let z = 0; z < this.units_already_moved_by_idx.length; z++) {
	        if (this.is_unit_already_moved_by_idx_a_leader[z] == 0 && this.units_already_moved_by_idx[z] === added) {
	          muc = "nonopaque"; 
	        }
	      }
	    }
	  } else {
	    if (this.units_already_moved_by_idx.includes(added)) { 
	      for (let z = 0; z < this.units_already_moved_by_idx.length; z++) {
	        if (this.is_unit_already_moved_by_idx_a_leader[z] == 1 && this.units_already_moved_by_idx[z] === added) {
	          muc = "nonopaque"; 
	        }
	      }
	    }
	  }

	  let imgtile = "";

	  if (leader) {
	    imgtile = `<img class="army_tile ${muc}" id="1-${faction}-${utype.replace(/-/g, "_")}-${num}" src="/his/img/tiles/army/${this.mod.army[utype].img}" />`;
	    return imgtile;
	  }

	  if (utype == "regular") {
	    if (faction == "hapsburg") {
              imgtile = `<img id="${num}-hapsburg-regular-${added}" class="army_tile ${muc}" src="/his/img/tiles/hapsburg/HapsburgReg-${num}.svg" />`;
            }
	    if (faction == "papacy") {
              imgtile = `<img id="${num}-papacy-regular-${added}" class="army_tile ${muc}" src="/his/img/tiles/papacy/PapacyReg-${num}.svg" />`;
            }
	    if (faction == "protestant") {
              imgtile = `<img id="${num}-protestant-regular-${added}" class="army_tile ${muc}" src="/his/img/tiles/protestant/ProtestantReg-${num}.svg" />`;
            }
	    if (faction == "ottoman") {
              imgtile = `<img id="${num}-ottoman-regular-${added}" class="army_tile ${muc}" src="/his/img/tiles/ottoman/OttomanReg-${num}.svg" />`;
            }
	    if (faction == "france") {
              imgtile = `<img id="${num}-france-regular-${added}" class="army_tile ${muc}" src="/his/img/tiles/france/FrenchReg-${num}.svg" />`;
            }
	    if (faction == "england") {
              imgtile = `<img id="${num}-england-regular-${added}" class="army_tile ${muc}" src="/his/img/tiles/england/EnglandReg-${num}.svg" />`;
            }
	    if (faction == "independent") {
              imgtile = `<img id="${num}-independent-regular-${added}" class="army_tile ${muc}" src="/his/img/tiles/independent/IndependentReg-${num}.svg" />`;
            }
	    if (faction == "scotland") {
              imgtile = `<img id="${num}-scotland-regular-${added}" class="army_tile ${muc}" src="/his/img/tiles/scotland/ScottishReg-${num}.svg" />`;
            }
	    if (faction == "venice") {
              imgtile = `<img id="${num}-venice-regular-${added}" class="army_tile ${muc}" src="/his/img/tiles/venice/VeniceReg-${num}.svg" />`;
            }
	    if (faction == "hungary") {
              imgtile = `<img id="${num}-hungary-regular-${added}" class="army_tile ${muc}" src="/his/img/tiles/hungary/HungaryReg-${num}.svg" />`;
            }
	    if (faction == "genoa") {
              imgtile = `<img id="${num}-genoa-regular-${added}" class="army_tile ${muc}" src="/his/img/tiles/genoa/GenoaReg-${num}.svg" />`;
            }
          }
	  if (utype == "mercenary") {
	    if (faction == "hapsburg") {
              imgtile = `<img id="${num}-${faction}-mercenary-${added}" class="army_tile ${muc}" src="/his/img/tiles/hapsburg/HapsburgMerc-${num}.svg" />`;
            }
	    if (faction == "papacy") {
              imgtile = `<img id="${num}-${faction}-mercenary-${added}" class="army_tile ${muc}" src="/his/img/tiles/papacy/PapacyMerc-${num}.svg" />`;
            }
	    if (faction == "protestant") {
              imgtile = `<img id="${num}-${faction}-mercenary-${added}" class="army_tile ${muc}" src="/his/img/tiles/protestant/ProtestantMerc-${num}.svg" />`;
            }
	    if (faction == "ottoman") {
              imgtile = `<img id="${num}-${faction}-mercenary-${added}" class="army_tile ${muc}" src="/his/img/tiles/ottoman/OttomanMerc-${num}.svg" />`;
            }
	    if (faction == "france") {
              imgtile = `<img id="${num}-${faction}-mercenary-${added}" class="army_tile ${muc}" src="/his/img/tiles/france/FrenchMerc-${num}.svg" />`;
            }
	    if (faction == "england") {
              imgtile = `<img id="${num}-${faction}-mercenary-${added}" class="army_tile ${muc}" src="/his/img/tiles/england/EnglandMerc-${num}.svg" />`;
            }
	    if (faction == "independent") {
              imgtile = `<img id="${num}-${faction}-mercenary-${added}" class="army_tile ${muc}" src="/his/img/tiles/independent/IndependentMerc-${num}.svg" />`;
            }
	    if (faction == "scotland") {
              imgtile = `<img id="${num}-${faction}-mercenary-${added}" class="army_tile ${muc}" src="/his/img/tiles/scotland/ScottishMerc-${num}.svg" />`;
            }
	    if (faction == "venice") {
              imgtile = `<img id="${num}-${faction}-mercenary-${added}" class="army_tile ${muc}" src="/his/img/tiles/venice/VeniceMerc-${num}.svg" />`;
            }
	    if (faction == "hungary") {
              imgtile = `<img id="${num}-${faction}-mercenary-${added}" class="army_tile ${muc}" src="/his/img/tiles/hungary/HungaryMerc-${num}.svg" />`;
            }
	    if (faction == "genoa") {
              imgtile = `<img id="${num}-${faction}-mercenary-${added}" class="army_tile ${muc}" src="/his/img/tiles/genoa/GenoaMerc-${num}.svg" />`;
            }
          }
	  if (utype == "cavalry") {
	    if (faction == "hapsburg") {
              imgtile = `<img id="${num}-${faction}-cavalry-${added}" class="army_tile ${muc}" src="/his/img/tiles/hapsburg/HapsburgCav-${num}.svg" />`;
            }
	    if (faction == "papacy") {
              imgtile = `<img id="${num}-${faction}-cavalry-${added}" class="army_tile ${muc}" src="/his/img/tiles/papacy/PapacyCav-${num}.svg" />`;
            }
	    if (faction == "protestant") {
              imgtile = `<img id="${num}-${faction}-cavalry-${added}" class="army_tile ${muc}" src="/his/img/tiles/protestant/ProtestantCav-${num}.svg" />`;
            }
	    if (faction == "ottoman") {
              imgtile = `<img id="${num}-${faction}-cavalry-${added}" class="army_tile ${muc}" src="/his/img/tiles/ottoman/OttomanCav-${num}.svg" />`;
            }
	    if (faction == "france") {
              imgtile = `<img id="${num}-${faction}-cavalry-${added}" class="army_tile ${muc}" src="/his/img/tiles/france/FrenchCav-${num}.svg" />`;
            }
	    if (faction == "england") {
              imgtile = `<img id="${num}-${faction}-cavalry-${added}" class="army_tile ${muc}" src="/his/img/tiles/england/EnglandCav-${num}.svg" />`;
            }
	    if (faction == "independent") {
              imgtile = `<img id="${num}-${faction}-cavalry-${added}" class="army_tile ${muc}" src="/his/img/tiles/independent/IndependentCav-${num}.svg" />`;
            }
	    if (faction == "scotland") {
              imgtile = `<img id="${num}-${faction}-cavalry-${added}" class="army_tile ${muc}" src="/his/img/tiles/scotland/ScottishCav-${num}.svg" />`;
            }
	    if (faction == "venice") {
              imgtile = `<img id="${num}-${faction}-cavalry-${added}" class="army_tile ${muc}" src="/his/img/tiles/venice/VeniceCav-${num}.svg" />`;
            }
	    if (faction == "hungary") {
              imgtile = `<img id="${num}-${faction}-cavalry-${added}" class="army_tile ${muc}" src="/his/img/tiles/hungary/HungaryCav-${num}.svg" />`;
            }
	    if (faction == "genoa") {
              imgtile = `<img id="${num}-${faction}-cavalry-${added}" class="army_tile ${muc}" src="/his/img/tiles/genoa/GenoaCav-${num}.svg" />`;
            }
          }

	  this.added++; // prepare for next loop

	  return imgtile;
	}



	addUnitsAvailableToPage(faction="", utype="regular", max_units=6) {

	  let his_self = this.mod;
	  let f = faction;
  	  let muc = "";
          let available = his_self.game.state.board[f].available;

	  if (utype == "regular") {
          		for (let i = 0; i < available['regular']['1']; i++) {
				if (max_units < 1) { muc = " unavailable"; }
                                let imgtile = '';
                                if (f == 'hapsburg') {
                                        imgtile = `<img id="1" class="army_tile ${muc}" src="/his/img/tiles/hapsburg/HapsburgReg-1.svg" />`;
                                }
                                if (f == 'protestant') {
                                        imgtile = `<img id="1" class="army_tile ${muc}" src="/his/img/tiles/protestant/ProtestantReg-1.svg" />`;
                                }
                                if (f == 'papacy') {
                                        imgtile = `<img id="1" class="army_tile ${muc}" src="/his/img/tiles/papacy/PapacyReg-1.svg" />`;
                                }
                                if (f == 'ottoman') {
                                        imgtile = `<img id="1" class="army_tile ${muc}" src="/his/img/tiles/ottoman/OttomanReg-1.svg" />`;
                                }
                                if (f == 'france') {
                                        imgtile = `<img id="1" class="army_tile ${muc}" src="/his/img/tiles/france/FrenchReg-1.svg" />`;
                                }
                                if (f == 'england') {
                                        imgtile = `<img id="1" class="army_tile ${muc}" src="/his/img/tiles/england/EnglandReg-1.svg" />`;
                                }
                                if (f == 'scotland') {
                                        imgtile = `<img id="1" class="army_tile ${muc}" src="/his/img/tiles/scotland/ScottishReg-1.svg" />`;
                                }
                                if (f == 'venice') {
                                        imgtile = `<img id="1" class="army_tile ${muc}" src="/his/img/tiles/venice/VeniceReg-1.svg" />`;
                                }
                                if (f == 'genoa') {
                                        imgtile = `<img id="1" class="army_tile ${muc}" src="/his/img/tiles/genoa/GenoaReg-1.svg" />`;
                                }
                                if (f == 'hungary') {
                                        imgtile = `<img id="1" class="army_tile ${muc}" src="/his/img/tiles/hungary/HungaryReg-1.svg" />`;
                                }
                                if (f == 'independent') {
                                        imgtile = `<img id="1" class="army_tile ${muc}" src="/his/img/tiles/independent/IndependentReg-1.svg" />`;
                                }
                                let qs = `.available-units-overlay`;
                                his_self.app.browser.addElementToSelector(imgtile, qs);
			}
                        for (let i = 0; i < available['regular']['2']; i++) {
				if (max_units < 2) { muc = " unavailable"; }
                                let imgtile = '';
                                if (f == 'hapsburg') {
                                        imgtile = `<img id="2" class="army_tile ${muc}" src="/his/img/tiles/hapsburg/HapsburgReg-2.svg" />`;
                                }
                                if (f == 'protestant') {
                                        imgtile = `<img id="2" class="army_tile ${muc}" src="/his/img/tiles/protestant/ProtestantReg-2.svg" />`;
                                }
                                if (f == 'papacy') {
                                        imgtile = `<img id="2" class="army_tile ${muc}" src="/his/img/tiles/papacy/PapacyReg-2.svg" />`;
                                }
                                if (f == 'ottoman') {
                                        imgtile = `<img id="2" class="army_tile ${muc}" src="/his/img/tiles/ottoman/OttomanReg-2.svg" />`;
                                }
                                if (f == 'france') {
                                        imgtile = `<img id="2" class="army_tile ${muc}" src="/his/img/tiles/france/FrenchReg-2.svg" />`;
                                }
                                if (f == 'england') {
                                        imgtile = `<img id="2" class="army_tile ${muc}" src="/his/img/tiles/england/EnglandReg-2.svg" />`;
                                }
                                if (f == 'scotland') {
                                        imgtile = `<img id="2" class="army_tile ${muc}" src="/his/img/tiles/scotland/ScottishReg-2.svg" />`;
                                }
                                if (f == 'venice') {
                                        imgtile = `<img id="2" class="army_tile ${muc}" src="/his/img/tiles/venice/VeniceReg-2.svg" />`;
                                }
                                if (f == 'genoa') {
                                        imgtile = `<img id="2" class="army_tile ${muc}" src="/his/img/tiles/genoa/GenoaReg-2.svg" />`;
                                }
                                if (f == 'hungary') {
                                        imgtile = `<img id="2" class="army_tile ${muc}" src="/his/img/tiles/hungary/HungaryReg-2.svg" />`;
                                }
                                if (f == 'independent') {
                                        imgtile = `<img id="2" class="army_tile ${muc}" src="/his/img/tiles/independent/IndependentReg-2.svg" />`;
                                }
                                let qs = `.available-units-overlay`;
                                his_self.app.browser.addElementToSelector(imgtile, qs);
                        }
                        for (let i = 0; i < available['regular']['4']; i++) {
				if (max_units < 4) { muc = " unavailable"; }
                                let imgtile = '';
                                if (f == 'hapsburg') {
                                        imgtile = `<img id="4" class="army_tile ${muc}" src="/his/img/tiles/hapsburg/HapsburgReg-4.svg" />`;
                                }
                                if (f == 'protestant') {
                                        imgtile = `<img id="4" class="army_tile ${muc}" src="/his/img/tiles/protestant/ProtestantReg-4.svg" />`;
                                }
                                if (f == 'papacy') {
                                        imgtile = `<img id="4" class="army_tile ${muc}" src="/his/img/tiles/papacy/PapacyReg-4.svg" />`;
                                }
                                if (f == 'ottoman') {
                                        imgtile = `<img id="4" class="army_tile ${muc}" src="/his/img/tiles/ottoman/OttomanReg-4.svg" />`;
                                }
                                if (f == 'france') {
                                        imgtile = `<img id="4" class="army_tile ${muc}" src="/his/img/tiles/france/FrenchReg-4.svg" />`;
                                }
                                if (f == 'england') {
                                        imgtile = `<img id="4" class="army_tile ${muc}" src="/his/img/tiles/england/EnglandReg-4.svg" />`;
                                }
                                if (f == 'scotland') {
                                        imgtile = `<img id="4" class="army_tile ${muc}" src="/his/img/tiles/scotland/ScottishReg-4.svg" />`;
                                }
                                if (f == 'venice') {
                                        imgtile = `<img id="4" class="army_tile ${muc}" src="/his/img/tiles/venice/VeniceReg-4.svg" />`;
                                }
                                if (f == 'genoa') {
                                        imgtile = `<img id="4" class="army_tile ${muc}" src="/his/img/tiles/genoa/GenoaReg-4.svg" />`;
                                }
                                if (f == 'hungary') {
                                        imgtile = `<img id="4" class="army_tile ${muc}" src="/his/img/tiles/hungary/HungaryReg-4.svg" />`;
                                }
                                if (f == 'independent') {
                                        imgtile = `<img id="4" class="army_tile ${muc}" src="/his/img/tiles/independent/IndependentReg-4.svg" />`;
                                }
                                let qs = `.available-units-overlay`;
                                his_self.app.browser.addElementToSelector(imgtile, qs);
                        }
                        for (let i = 0; i < available['regular']['6']; i++) {
				if (max_units < 6) { muc = " unavailable"; }
                                let imgtile = '';
                                if (f == 'hapsburg') {
                                        imgtile = `<img id="6" class="army_tile ${muc}" src="/his/img/tiles/hapsburg/HapsburgReg-6.svg" />`;
                                }
                                if (f == 'protestant') {
                                        imgtile = `<img id="6" class="army_tile ${muc}" src="/his/img/tiles/protestant/ProtestantReg-6.svg" />`;
                                }
                                if (f == 'papacy') {
                                        imgtile = `<img id="6" class="army_tile ${muc}" src="/his/img/tiles/papacy/PapacyReg-6.svg" />`;
                                }
                                if (f == 'ottoman') {
                                        imgtile = `<img id="6" class="army_tile ${muc}" src="/his/img/tiles/ottoman/OttomanReg-6.svg" />`;
                                }
                                if (f == 'france') {
                                        imgtile = `<img id="6" class="army_tile ${muc}" src="/his/img/tiles/france/FrenchReg-6.svg" />`;
                                }
                                if (f == 'england') {
                                        imgtile = `<img id="6" class="army_tile ${muc}" src="/his/img/tiles/england/EnglandReg-6.svg" />`;
                                }
                                if (f == 'scotland') {
                                        imgtile = `<img id="6" class="army_tile ${muc}" src="/his/img/tiles/scotland/ScottishReg-6.svg" />`;
                                }
                                if (f == 'venice') {
                                        imgtile = `<img id="6" class="army_tile ${muc}" src="/his/img/tiles/venice/VeniceReg-6.svg" />`;
                                }
                                if (f == 'genoa') {
                                        imgtile = `<img id="6" class="army_tile ${muc}" src="/his/img/tiles/genoa/GenoaReg-6.svg" />`;
                                }
                                if (f == 'hungary') {
                                        imgtile = `<img id="6" class="army_tile ${muc}" src="/his/img/tiles/hungary/HungaryReg-6.svg" />`;
                                }
                                if (f == 'independent') {
                                        imgtile = `<img id="6" class="army_tile ${muc}" src="/his/img/tiles/independent/IndependentReg-6.svg" />`;
                                }
                                let qs = `.available-units-overlay`;
                                his_self.app.browser.addElementToSelector(imgtile, qs);
                        }
	  }

	  if (utype == "mercenary") {
          		for (let i = 0; i < available['regular']['1']; i++) {
				if (max_units < 1) { muc = " unavailable"; }
                                let imgtile = '';
                                if (f == 'hapsburg') {
                                        imgtile = `<img id="1" class="army_tile ${muc}" src="/his/img/tiles/hapsburg/HapsburgMerc-1.svg" />`;
                                }
                                if (f == 'protestant') {
                                        imgtile = `<img id="1" class="army_tile ${muc}" src="/his/img/tiles/protestant/ProtestantMerc-1.svg" />`;
                                }
                                if (f == 'papacy') {
                                        imgtile = `<img id="1" class="army_tile ${muc}" src="/his/img/tiles/papacy/PapacyMerc-1.svg" />`;
                                }
                                if (f == 'ottoman') {
                                        imgtile = `<img id="1" class="army_tile ${muc}" src="/his/img/tiles/ottoman/OttomanMerc-1.svg" />`;
                                }
                                if (f == 'france') {
                                        imgtile = `<img id="1" class="army_tile ${muc}" src="/his/img/tiles/france/FrenchMerc-1.svg" />`;
                                }
                                if (f == 'england') {
                                        imgtile = `<img id="1" class="army_tile ${muc}" src="/his/img/tiles/england/EnglandMerc-1.svg" />`;
                                }
                                if (f == 'scotland') {
                                        imgtile = `<img id="1" class="army_tile ${muc}" src="/his/img/tiles/scotland/ScottishMerc-1.svg" />`;
                                }
                                if (f == 'venice') {
                                        imgtile = `<img id="1" class="army_tile ${muc}" src="/his/img/tiles/venice/VeniceMerc-1.svg" />`;
                                }
                                if (f == 'genoa') {
                                        imgtile = `<img id="1" class="army_tile ${muc}" src="/his/img/tiles/genoa/GenoaMerc-1.svg" />`;
                                }
                                if (f == 'hungary') {
                                        imgtile = `<img id="1" class="army_tile ${muc}" src="/his/img/tiles/hungary/HungaryMerc-1.svg" />`;
                                }
                                if (f == 'independent') {
                                        imgtile = `<img id="1" class="army_tile ${muc}" src="/his/img/tiles/independent/IndependentMerc-1.svg" />`;
                                }
                                let qs = `.available-units-overlay`;
                                his_self.app.browser.addElementToSelector(imgtile, qs);
			}
                        for (let i = 0; i < available['regular']['2']; i++) {
				if (max_units < 2) { muc = " unavailable"; }
                                let imgtile = '';
                                if (f == 'hapsburg') {
                                        imgtile = `<img id="2" class="army_tile ${muc}" src="/his/img/tiles/hapsburg/HapsburgMerc-2.svg" />`;
                                }
                                if (f == 'protestant') {
                                        imgtile = `<img id="2" class="army_tile ${muc}" src="/his/img/tiles/protestant/ProtestantMerc-2.svg" />`;
                                }
                                if (f == 'papacy') {
                                        imgtile = `<img id="2" class="army_tile ${muc}" src="/his/img/tiles/papacy/PapacyMerc-2.svg" />`;
                                }
                                if (f == 'ottoman') {
                                        imgtile = `<img id="2" class="army_tile ${muc}" src="/his/img/tiles/ottoman/OttomanMerc-2.svg" />`;
                                }
                                if (f == 'france') {
                                        imgtile = `<img id="2" class="army_tile ${muc}" src="/his/img/tiles/france/FrenchMerc-2.svg" />`;
                                }
                                if (f == 'england') {
                                        imgtile = `<img id="2" class="army_tile ${muc}" src="/his/img/tiles/england/EnglandMerc-2.svg" />`;
                                }
                                if (f == 'scotland') {
                                        imgtile = `<img id="2" class="army_tile ${muc}" src="/his/img/tiles/scotland/ScottishMerc-2.svg" />`;
                                }
                                if (f == 'venice') {
                                        imgtile = `<img id="2" class="army_tile ${muc}" src="/his/img/tiles/venice/VeniceMerc-2.svg" />`;
                                }
                                if (f == 'genoa') {
                                        imgtile = `<img id="2" class="army_tile ${muc}" src="/his/img/tiles/genoa/GenoaMerc-2.svg" />`;
                                }
                                if (f == 'hungary') {
                                        imgtile = `<img id="2" class="army_tile ${muc}" src="/his/img/tiles/hungary/HungaryMerc-2.svg" />`;
                                }
                                if (f == 'independent') {
                                        imgtile = `<img id="2" class="army_tile ${muc}" src="/his/img/tiles/independent/IndependentMerc-2.svg" />`;
                                }
                                let qs = `.available-units-overlay`;
                                his_self.app.browser.addElementToSelector(imgtile, qs);
                        }
                        for (let i = 0; i < available['regular']['4']; i++) {
				if (max_units < 4) { muc = " unavailable"; }
                                let imgtile = '';
                                if (f == 'hapsburg') {
                                        imgtile = `<img id="4" class="army_tile ${muc}" src="/his/img/tiles/hapsburg/HapsburgMerc-4.svg" />`;
                                }
                                if (f == 'protestant') {
                                        imgtile = `<img id="4" class="army_tile ${muc}" src="/his/img/tiles/protestant/ProtestantMerc-4.svg" />`;
                                }
                                if (f == 'papacy') {
                                        imgtile = `<img id="4" class="army_tile ${muc}" src="/his/img/tiles/papacy/PapacyMerc-4.svg" />`;
                                }
                                if (f == 'ottoman') {
                                        imgtile = `<img id="4" class="army_tile ${muc}" src="/his/img/tiles/ottoman/OttomanMerc-4.svg" />`;
                                }
                                if (f == 'france') {
                                        imgtile = `<img id="4" class="army_tile ${muc}" src="/his/img/tiles/france/FrenchMerc-4.svg" />`;
                                }
                                if (f == 'england') {
                                        imgtile = `<img id="4" class="army_tile ${muc}" src="/his/img/tiles/england/EnglandMerc-4.svg" />`;
                                }
                                if (f == 'scotland') {
                                        imgtile = `<img id="4" class="army_tile ${muc}" src="/his/img/tiles/scotland/ScottishMerc-4.svg" />`;
                                }
                                if (f == 'venice') {
                                        imgtile = `<img id="4" class="army_tile ${muc}" src="/his/img/tiles/venice/VeniceMerc-4.svg" />`;
                                }
                                if (f == 'genoa') {
                                        imgtile = `<img id="4" class="army_tile ${muc}" src="/his/img/tiles/genoa/GenoaMerc-4.svg" />`;
                                }
                                if (f == 'hungary') {
                                        imgtile = `<img id="4" class="army_tile ${muc}" src="/his/img/tiles/hungary/HungaryMerc-4.svg" />`;
                                }
                                if (f == 'independent') {
                                        imgtile = `<img id="4" class="army_tile ${muc}" src="/his/img/tiles/independent/IndependentMerc-4.svg" />`;
                                }
                                let qs = `.available-units-overlay`;
                                his_self.app.browser.addElementToSelector(imgtile, qs);
                        }
                        for (let i = 0; i < available['regular']['6']; i++) {
				if (max_units < 6) { muc = " unavailable"; }
                                let imgtile = '';
                                if (f == 'hapsburg') {
                                        imgtile = `<img id="6" class="army_tile ${muc}" src="/his/img/tiles/hapsburg/HapsburgMerc-6.svg" />`;
                                }
                                if (f == 'protestant') {
                                        imgtile = `<img id="6" class="army_tile ${muc}" src="/his/img/tiles/protestant/ProtestantMerc-6.svg" />`;
                                }
                                if (f == 'papacy') {
                                        imgtile = `<img id="6" class="army_tile ${muc}" src="/his/img/tiles/papacy/PapacyMerc-6.svg" />`;
                                }
                                if (f == 'ottoman') {
                                        imgtile = `<img id="6" class="army_tile ${muc}" src="/his/img/tiles/ottoman/OttomanMerc-6.svg" />`;
                                }
                                if (f == 'france') {
                                        imgtile = `<img id="6" class="army_tile ${muc}" src="/his/img/tiles/france/FrenchMerc-6.svg" />`;
                                }
                                if (f == 'england') {
                                        imgtile = `<img id="6" class="army_tile ${muc}" src="/his/img/tiles/england/EnglandMerc-6.svg" />`;
                                }
                                if (f == 'scotland') {
                                        imgtile = `<img id="6" class="army_tile ${muc}" src="/his/img/tiles/scotland/ScottishMerc-6.svg" />`;
                                }
                                if (f == 'venice') {
                                        imgtile = `<img id="6" class="army_tile ${muc}" src="/his/img/tiles/venice/VeniceMerc-6.svg" />`;
                                }
                                if (f == 'genoa') {
                                        imgtile = `<img id="6" class="army_tile ${muc}" src="/his/img/tiles/genoa/GenoaMerc-6.svg" />`;
                                }
                                if (f == 'hungary') {
                                        imgtile = `<img id="6" class="army_tile ${muc}" src="/his/img/tiles/hungary/HungaryMerc-6.svg" />`;
                                }
                                if (f == 'independent') {
                                        imgtile = `<img id="6" class="army_tile ${muc}" src="/his/img/tiles/independent/IndependentMerc-6.svg" />`;
                                }
                                let qs = `.available-units-overlay`;
                                his_self.app.browser.addElementToSelector(imgtile, qs);
                        }
	  }

	  if (utype == "cavalry") {
          		for (let i = 0; i < available['regular']['1']; i++) {
				if (max_units < 1) { muc = " unavailable"; }
                                let imgtile = '';
                                if (f == 'ottoman') {
                                        imgtile = `<img id="1" class="army_tile ${muc}" src="/his/img/tiles/ottoman/OttomanCav-1.svg" />`;
                                }
                                let qs = `.available-units-overlay`;
                                his_self.app.browser.addElementToSelector(imgtile, qs);
			}
                        for (let i = 0; i < available['regular']['2']; i++) {
				if (max_units < 2) { muc = " unavailable"; }
                                let imgtile = '';
                                if (f == 'ottoman') {
                                        imgtile = `<img id="2" class="army_tile ${muc}" src="/his/img/tiles/ottoman/OttomanCav-2.svg" />`;
                                }
                                let qs = `.available-units-overlay`;
                                his_self.app.browser.addElementToSelector(imgtile, qs);
                        }
                        for (let i = 0; i < available['regular']['4']; i++) {
				if (max_units < 4) { muc = " unavailable"; }
                                let imgtile = '';
                                if (f == 'ottoman') {
                                        imgtile = `<img id="4" class="army_tile ${muc}" src="/his/img/tiles/ottoman/OttomanCav-4.svg" />`;
                                }
                                let qs = `.available-units-overlay`;
                                his_self.app.browser.addElementToSelector(imgtile, qs);
                        }
                        for (let i = 0; i < available['regular']['6']; i++) {
				if (max_units < 6) { muc = " unavailable"; }
                                let imgtile = '';
                                if (f == 'ottoman') {
                                        imgtile = `<img id="6" class="army_tile ${muc}" src="/his/img/tiles/ottoman/OttomanCav-6.svg" />`;
                                }
                                let qs = `.available-units-overlay`;
                                his_self.app.browser.addElementToSelector(imgtile, qs);
                        }
	  }
	}

}

module.exports = AvailableUnitsOverlay;
