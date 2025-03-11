
  returnPlayers(num = 0) {
    var players = [];
    return players;
  }

  returnPlayerHand() {
    return this.game.deck[this.game.player-1].hand;
  }

  returnFactionName(faction="") { return this.returnPlayerName(faction); }

  returnPlayerName(faction="") {
    if (faction == "central") { return "Central Powers"; }
    return "Allies";
  }

  returnPlayerOfFaction(faction="") {
    if (faction == "central") { return 1; }
    return 2;
  }

  playerPlayAdvance() {

    let html = `<ul>`;
    html    += `<li class="card" id="advance">advance</li>`;
    html    += `<li class="card" id="refuse">do not advance</li>`;
    html    += `</ul>`;

    this.updateStatusWithOptions(`Advance Full-Strength Units?`, html);
    this.attachCardboxEvents((action) => {

      if (action === "advance") {
	this.endTurn();
      }

      if (action === "refuse") {
	this.endTurn();
      }

    });

  }

  playerPlayPostCombatRetreat() {

alert("Player Playing Post Combat Retreat!");
    this.endTurn();

  }


  playerPlayGunsOfAugust() {

    let html = `<ul>`;
    html    += `<li class="card" id="guns">Guns of August</li>`;
    html    += `<li class="card" id="other">other card</li>`;
    html    += `</ul>`;

    this.updateStatusWithOptions(`Choose Your Seventh Card:`, html);
    this.guns_overlay.render();

    this.attachCardboxEvents((action) => {

      this.guns_overlay.remove();
      this.updateStatus("selected");

      if (action === "guns") {
        this.game.deck[0].hand.push("cp01");
	this.endTurn();
      }

      if (action === "other") {
        this.addMove("DEAL\t1\t1\t1"); // player chooses random other card
	this.endTurn();
      }

    });

  }

  playerPlayFlankAttack() {

    //
    // it is possible to launch a flank attack if we want
    //
    let html = `<ul>`;
    html    += `<li class="card" id="yes">flank attack</li>`;
    html    += `<li class="card" id="no">normal attack</li>`;
    html    += `</ul>`;

    this.updateStatusWithOptions(`Flank Attack?`, html);
    this.attachCardboxEvents((action) => {

      if (action === "no") {
	this.endTurn();
      }

      if (action === "yes") {

        //
        // select pinning unit
        //
        let html = `<ul>`;
	let eligible_spaces = [];
	for (let i = 0; i < this.game.state.combat.attacker.length; i++) {
	  let unit_spacekey = this.game.state.combat.attacker[i].unit_spacekey;
	  if (!eligible_spaces.includes(unit_spacekey)) { eligible_spaces.push(unit_spacekey); }
	}
	for (let i = 0; i < eligible_spaces.length; i++) {
          html    += `<li class="card" id="${i}">${eligible_spaces[i]}</li>`;
	}
        html    += `</ul>`;
	
        this.updateStatusWithOptions(`Select Unit to Pin Defender:`, html, true);
        this.attachCardboxEvents((action) => {
	  this.addMove(`flank_attack_attempt\t${action}\t${JSON.stringify(eligible_spaces)}`);
	  this.endTurn();
	});

      }
    });
  }

  playerPlayCard(faction, card) {

    let c = this.deck[card];

    //
    // hide any popup
    //
    this.cardbox.hide();


    let html = `<ul>`;
    html    += `<li class="card" id="ops">ops (movement / combat)</li>`;
    html    += `<li class="card" id="sr">strategic redeployment</li>`;
    html    += `<li class="card" id="rp">replacement points</li>`;
    html    += `<li class="card" id="event">trigger event</li>`;
    html    += `</ul>`;

    this.updateStatusWithOptions(`Playing ${this.popup(card)}`, html, true);
    this.bindBackButtonFunction(() => { this.playerTurn(faction); });
    this.attachCardboxEvents((action) => {

      if (action === "ops") {
	this.playerPlayOps(faction, card, c.ops);
      }

      if (action === "sr") {
	this.playerPlayStrategicRedeployment(faction, card, c.sr);
      }

      if (action === "rp") {
	this.playerPlayReplacementPoints(faction, card);
      }

      if (action === "event") {
	alert("event");
	this.endTurn();
      }

    });

  }

  playerPlayCombat(faction) {

    let paths_self = this;
    let options = this.returnSpacesWithFilter(
      (key) => {
	if (this.game.spaces[key].units.length > 0) {
	  if (this.returnPowerOfUnit(this.game.spaces[key].units[0]) != faction) {
  	    for (let i = 0; i < this.game.spaces[key].neighbours.length; i++) {
	      let n = this.game.spaces[key].neighbours[i];
console.log("key: " + n);
	      if (this.game.spaces[n].activated_for_combat == 1) { return 1; }
	    }
	  }
	}
        return 0;
      }
    );


    let mainInterface = function(options, mainInterface, attackInterface) {

      //
      // sometimes this ends
      //
      if (options.length == 0) {
	paths_self.updateStatus("combat finished...");
	paths_self.addMove("resolve\tplayer_play_combat");
	paths_self.addMove("post_combat_cleanup");
	paths_self.endTurn();
	return;
      }

      //
      // sanity check options still valid
      //
      let units_to_attack = 0;
      for (let i = 0; i < options.length; i++) {
	let s = options[i];
	for (let z = 0; z < paths_self.game.spaces[options[i]].units.length; z++) {
	  if (paths_self.game.spaces[options[i]].units[z].attacked != 1) {
	    units_to_attack++;
	  }
	}
      }

      //
      // exit if nothing is left to attack with
      //
      if (units_to_attack == 0) {
	//
	// nothing left
	//
	paths_self.removeSelectable();
	paths_self.updateStatus("acknowledge...");
	paths_self.addMove("resolve\tplayer_play_combat");
	paths_self.addMove("post_combat_cleanup");
	paths_self.endTurn();
      }

      //
      // select space to attack
      //
      paths_self.playerSelectSpaceWithFilter(
	"Select Target for Attack: ",
	(key) => {
	  if (paths_self.game.spaces[key].units.length > 0) {
	    if (paths_self.returnPowerOfUnit(paths_self.game.spaces[key].units[0]) != faction) {
  	      for (let i = 0; i < paths_self.game.spaces[key].neighbours.length; i++) {
console.log("key: " + key);
	        let n = paths_self.game.spaces[key].neighbours[i];
	        if (paths_self.game.spaces[n].activated_for_combat == 1) { return 1; }
	      }
	    }
            return 0;
	  }
	},
	(key) => {

	  if (key === "skip") {
	    paths_self.addMove("resolve\tplayer_play_combat");
	    paths_self.addMove("post_combat_cleanup");
	    paths_self.removeSelectable();
	    paths_self.endTurn();
	    return;
	  }
	
	  paths_self.removeSelectable();
	  attackInterface(key, options, [], mainInterface, attackInterface);
	},
	null,
	true,
	[{ key : "skip" , value : "finish attack" }],
      )
    }

    let attackInterface = function(key, options, selected, mainInterface, attackInterface) {

      let units = [];
      let original_key = key;

      for (let z = 0; z < paths_self.game.spaces[key].neighbours.length; z++) {
	let n = paths_self.game.spaces[key].neighbours[z];
	if (paths_self.game.spaces[n].activated_for_combat == 1) {
	  for (let k = 0; k < paths_self.game.spaces[n].units.length; k++) {
	    let u = paths_self.game.spaces[n].units[k];
	    if (u.attacked != 1) {
	       units.push({ key : key , unit_sourcekey: n , unit_idx : k });
	    }
	  }
	}
      }
      units.push({ key : "skip" , unit_idx : "skip" });
      paths_self.playerSelectOptionWithFilter(
	"Which Units Participate in Attack?",
	units,
	(idx) => {
	  if (idx.key == "skip") {
	    return `<li class="option" id="skip">finished selecting</li>`;
	  }
	  let unit = paths_self.game.spaces[idx.unit_sourcekey].units[idx.unit_idx];
	  let already_selected = false;
	  for (let z = 0; z < selected.length; z++) {
	     if (paths_self.app.crypto.stringToBase64(JSON.stringify(idx)) === selected[z]) { already_selected = true; }
	  }
	  if (already_selected) {
  	    return `<li class="option" id='${paths_self.app.crypto.stringToBase64(JSON.stringify(idx))}'>${unit.name} / ${idx.unit_sourcekey} ***</li>`;
	  } else {
  	    return `<li class="option" id='${paths_self.app.crypto.stringToBase64(JSON.stringify(idx))}'>${unit.name} / ${idx.unit_sourcekey}</li>`;
	  }
	},
	(idx) => {

	  //
	  // maybe we are done!
	  //
	  if (idx === "skip") {
	    let finished = false;
	    paths_self.updateStatusWithOptions("attacking...", "");
	    if (selected.length > 0) {
	      let s = [];
	      for (let z = 0; z < selected.length; z++) {
  		s.push(JSON.parse(paths_self.app.crypto.base64ToString(selected[z])));
	      }
	      paths_self.addMove("resolve\tplayer_play_combat");
	      paths_self.addMove("post_combat_cleanup");
	      paths_self.addMove(`combat\t${original_key}\t${JSON.stringify(s)}`);
	      paths_self.endTurn();
	    } else {
	      paths_self.addMove("resolve\tplayer_play_combat");
	      paths_self.addMove("post_combat_cleanup");
	      paths_self.endTurn();
	    }
	    return;
	  }

	  //
	  // or our JSON object
	  //
	  let pidx = JSON.parse(paths_self.app.crypto.base64ToString(idx));

	  let key = pidx.key;
	  let unit_sourcekey = pidx.unit_sourcekey;
	  let unit_idx = pidx.unit_idx;

	  if (selected.includes(idx)) {
	    selected.splice(selected.indexOf(idx), 1);
	  } else {
	    selected.push(idx);
	  }

          attackInterface(original_key, options, selected, mainInterface, attackInterface);

	},
        false
      );
    }

    mainInterface(options, mainInterface, attackInterface);

  }


  playerPlayMovement(faction) {

    let paths_self = this;
    let options = this.returnSpacesWithFilter(
      (key) => {
	if (this.game.spaces[key].activated_for_movement == 1) { return 1; }
        return 0;
      }
    );

    let mainInterface = function(options, mainInterface, moveInterface, unitActionInterface) {

      //
      // sometimes this ends
      //
      if (options.length == 0) {
	this.updateStatus("moving units...");
	this.endTurn();
	return;
      }

      //
      // sanity check options still valid
      //
      let units_to_move = 0;
      for (let i = 0; i < options.length; i++) {
	for (let z = 0; z < paths_self.game.spaces[options[i]].units.length; z++) {
	  if (paths_self.game.spaces[options[i]].units[z].moved != 1) {
	    units_to_move++;
	  }
	}
      }
      if (units_to_move == 0) {
	//
	// nothing left
	//
	paths_self.removeSelectable();
	paths_self.updateStatus("acknowledge...");
	paths_self.endTurn();
      }


      paths_self.playerSelectSpaceWithFilter(
	"Units Awaiting Command: ",
	(key) => {
	  if (
	    paths_self.game.spaces[key].activated_for_movement == 1 
	    && options.includes(key)
	  ) {
	    let everything_moved = true;
	    for (let z = 0; z < paths_self.game.spaces[key].units.length; z++) {
	      if (paths_self.game.spaces[key].units[z].moved != 1) { everything_moved = false; }
	    }
	    if (everything_moved == false) { return 1; }
	  }
	  return 0;
	},
	(key) => {
	  for (let z = 0; z < paths_self.game.spaces[key].units.length; z++) {
	    paths_self.game.spaces[key].units[z].moved = 0;
	  }
	  paths_self.removeSelectable();
	  moveInterface(key, options, mainInterface, moveInterface, unitActionInterface);
	},
	null,
	true
      )
    }

    let unitActionInterface = function(key, idx, options, mainInterface, moveInterface, unitActionInterface) {
      let unit = paths_self.game.spaces[key].units[idx];
      let sourcekey = key;
      let html  = `<ul>`;
          html += `<li class="option" id="move">move</li>`;
          html += `<li class="option" id="entrench">entrench</li>`;
          html += `<li class="option" id="skip">stand down</li>`;
          html += `</ul>`;
      paths_self.updateStatusWithOptions(`Select Action for Unit`, html);
      paths_self.attachCardboxEvents((action) => {

        if (action === "move") {
	  let spaces_within_hops = paths_self.returnSpacesWithinHops(key, unit.movement, (spacekey) => {
	    if (paths_self.game.spaces[spacekey].units.length > 0) {
	      if (paths_self.returnPowerOfUnit(paths_self.game.spaces[spacekey].units[0]) != faction) { 
		return 0; 
	      }
	    }
	    return 1;
	  });

	  paths_self.playerSelectSpaceWithFilter(
	    `Select Destination for ${unit.name}`,
	    (destination) => {
	      if (spaces_within_hops.includes(destination)) {
	        return 1;
	      }
	      return 0;
	    },
	    (key) => {
              paths_self.moveUnit(sourcekey, idx, key);
	      paths_self.addMove(`move\t${faction}\t${sourcekey}\t${idx}\t${key}\t${paths_self.game.player}`);
              paths_self.displaySpace(key);
	      let mint = false;
	      for (let z = 0; z < paths_self.game.spaces[sourcekey].units.length; z++) {
	        if (paths_self.game.spaces[sourcekey].units[z].moved != 1) { mint = true; }
	      }
	      if (mint) {
	        moveInterface(sourcekey, options, mainInterface, moveInterface, unitActionInterface);
	      } else {
	        mainInterface(options, mainInterface, moveInterface, unitActionInterface);
	      }
	    },
	    null,
	    true
	  );
        }
        if (action === "entrench") {
	  paths_self.addMove(`player_play_movement\t${faction}`);
	  paths_self.addMove(`entrench\t${faction}\t${sourcekey}\t${idx}`);
	  paths_self.endTurn();
	  return;
        }
        if (action === "skip") {
	  paths_self.game.spaces[key].units[idx].moved = 1;
	  let mint = false;
	  for (let z = 0; z < paths_self.game.spaces[key].units.length; z++) {
	    if (paths_self.game.spaces[key].units[z].moved != 1) { mint = true; }
	  }
	  if (mint) {
	    moveInterface(key, options, mainInterface, moveInterface, unitActionInterface);
	  } else {
	    mainInterface(options, mainInterface, moveInterface, unitActionInterface);
	  }
        }

      });
    }


    let moveInterface = function(key, options, mainInterface, moveInterface, unitActionInterface) {

      let units = [];

      for (let z = 0; z < paths_self.game.spaces[key].units.length; z++) {
	if (paths_self.game.spaces[key].units[z].moved != 1) {
	  units.push(z);
	}
      }

      paths_self.playerSelectOptionWithFilter(
	"Which Unit?",
	units,
	(idx) => {
	  let unit = paths_self.game.spaces[key].units[idx];
	  return `<li class="option" id="${idx}">${unit.name} / ${unit.movement}</li>`;
	},
	(idx) => {
	  let unit = paths_self.game.spaces[key].units[idx];
	  paths_self.game.spaces[key].units[idx].moved = 1;
          unitActionInterface(key, idx, options, mainInterface, moveInterface, unitActionInterface);
	},
        false
      );
    }

    mainInterface(options, mainInterface, moveInterface, unitActionInterface);

  }

  playerPlayOps(faction, card, cost, skipend=0) {

    if (!skipend) {
      this.addMove("player_play_combat\t"+faction);
      this.addMove("player_play_movement\t"+faction);
    }

    let targets = this.returnNumberOfSpacesWithFilter((key) => {
      if (cost < this.returnActivationCost(key)) { return 0; }
      let space = this.game.spaces[key];
      if (space.activated_for_combat == 1) { return 0; }
      if (space.activated_for_movement == 1) { return 0; }
      for (let i = 0; i < space.units.length; i++) {
        return 1;
      }
      return 0;
    });

    //
    // hide any popup
    //
    this.cardbox.hide();

    let html = `<ul>`;
    if (targets > 0) {
      html    += `<li class="card" id="movement">activate for movement</li>`;
    }
    if (targets > 0) {
      html    += `<li class="card" id="combat">activate for combat</li>`;
    }
    html    += `<li class="card" id="end">continue without activation</li>`;
    html    += `</ul>`;

    this.updateStatusWithOptions(`You have ${cost} OPS remaining`, html, true);
    this.bindBackButtonFunction(() => { this.moves = []; this.playerPlayCard(faction, card); });
    this.attachCardboxEvents((action) => {

      if (action === "end") {
	this.updateStatus("ending turn");
	this.endTurn();
      }

      if (action === "movement") {
	//
	// select valid space to activate
	//
	this.playerSelectSpaceWithFilter(
	  "Select Space to Activate:",
	  (key) => {
	    if (cost < this.returnActivationCost(key)) { return 0; }
	    let space = this.game.spaces[key];
	    if (space.activated_for_combat == 1) { return 0; }
	    if (space.activated_for_movement == 1) { return 0; }
	    for (let i = 0; i < space.units.length; i++) {
	      if (this.returnPowerOfUnit(space.units[i]) === faction) {
	        return 1;
	      }
	    }
	    return 0;
	  },
	  (key) => {
	    this.updateStatus("activating...");
	    this.activateSpaceForMovement(key);
            this.displaySpace(key);
	    let cost_paid = this.returnActivationCost(key); 
	    cost -= cost_paid;
	    if (cost < 0) { cost = 0; }
	    if (cost > 0) {
	      this.addMove(`player_play_ops\t${faction}\t${card}\t${cost}\t1}`);
	    }
	    this.addMove(`activate_for_movement\t${faction}\t${key}`);
	    this.endTurn();
	  },
	  null,
	  true,
	);

      }

      if (action === "combat") {

	//
	// select valid space to activate
	//
	this.playerSelectSpaceWithFilter(
	  "Select Space to Activate:",
	  (key) => {
	    let space = this.game.spaces[key];
	    if (space.activated_for_movement == 1) { return 0; }
	    if (space.activated_for_combat == 1) { return 0; }
	    for (let i = 0; i < space.units.length; i++) {
	      if (this.returnPowerOfUnit(space.units[i]) === faction) {
	        return 1;
	      }
	    }
	    return 0;
	  },
	  (key) => {
	    this.updateStatus("activating...");
	    this.activateSpaceForCombat(key);
	    let cost_paid = this.returnActivationCost(key); 
	    cost -= cost_paid;
	    if (cost < 0) { cost = 0; }
	    if (cost > 0) {
	      this.addMove(`player_play_ops\t${faction}\t${card}\t${cost}\t1}`);
	    }
	    this.addMove(`activate_for_combat\t${faction}\t${key}`);
	    this.endTurn();
	  },
	  null,
	  true,
	);

      }

    });

  }

  playerPlayReplacementPoints(faction, card) {

    let c = this.deck[card];

    //
    // hide any popup
    //
    this.cardbox.hide();

    //
    //
    //
    for (let key in c.sr) {
      if (faction == "central") {
        if (!this.game.state.replacement_points["central"][key]) { this.game.state.replacement_points["central"][key] = 0; }
	this.game.state.replacement_points["central"][key] += c.sr[key];
      }
      if (faction == "allies") {
        if (!this.game.state.replacement_points["allies"][key]) { this.game.state.replacement_points["allies"][key] = 0; }
	this.game.state.replacement_points["allies"][key] += c.sr[key];
      }
    }

    this.updateStatus("adding replacement points...");
    this.attachCardboxEvents((action) => {
      this.addMove("rp\tfaction\t${action}\t${c.sr[key]}");
      this.endTurn();
    });

  }

  playerSelectOptionWithFilter(msg, opts, filter_func, mycallback, cancel_func = null, board_blickable = false) {

    let paths_self = this;

    let html = '<ul>';
    for (let i = 0; i < opts.length; i++) { html += filter_func(opts[i]); }
    html += '</ul>';

    this.updateStatusWithOptions(msg, html);
    $('.option').off();
    $('.option').on('click', function () {
      let action = $(this).attr("id");
      $('.option').off();
      paths_self.updateStatus("acknowledge...");
      mycallback(action);
    });

  }




  playerSelectSpaceWithFilter(msg, filter_func, mycallback = null, cancel_func = null, board_clickable = false, extra_options=[]) {

    let paths_self = this;
    let callback_run = false;
    let at_least_one_option = false;
    let html = '';
    html += '<ul class="hide-scrollbar">';

    $('.trench-tile').off();
    $('.army-tile').off();
    $('.space').off();

    this.zoom_overlay.spaces_onclick_callback = mycallback;

    for (let key in this.game.spaces) {
      if (filter_func(key) == 1) {
        at_least_one_option = true;
        html += '<li class="option .'+key+'" id="' + key + '">' + key + '</li>';

        //
        // the spaces that are selectable are clickable on the main board (whatever board shows)
        //
        if (board_clickable) {
          let t = "."+key;
          document.querySelectorAll(t).forEach((el) => {
            paths_self.addSelectable(el);
            el.onclick = (e) => {
              e.stopPropagation();
              e.preventDefault();   // clicking on keys triggers selection -- but clicking on map will still show zoom-in
              el.onclick = () => {};
              $('.space').off();
              $('.army-tile').off();
              $('.trench-tile').off();
              paths_self.zoom_overlay.spaces_onclick_callback = null;
              paths_self.removeSelectable();
              if (callback_run == false) {
                callback_run = true;
                mycallback(key);
              }
            }
          });
        }
      }
    }
    if (cancel_func != null) {
      html += '<li class="option" id="cancel">cancel</li>';
    }
    if (extra_options.length > 0) {
      for (let z = 0; z < extra_options.length; z++) { html += `<li class="option ${extra_options[z].key}" id="${extra_options[z].key}">${extra_options[z].value}</li>`; }
    }
    html += '</ul>';

    this.updateStatusWithOptions(msg, html);

    $('.option').off();
    $('.option').on('click', function () {

      //
      // and remove on-board clickability
      //
      if (board_clickable) {
        for (let key in paths_self.game.spaces) {
          if (filter_func(key) == 1) {
            let t = "."+key;
            document.querySelectorAll(t).forEach((el) => {
              el.onclick = (e) => {};
            });
          }
        }
      }

      paths_self.removeSelectable();

      $('.trench-tile').off();
      $('.army-tile').off();
      $('.space').off();

      let action = $(this).attr("id");
      if (action == "cancel") {
        cancel_func();
        return 0;
      }

      paths_self.zoom_overlay.spaces_onclick_callback = null;
      mycallback(action);

    });

    if (at_least_one_option) { return 1; }
    return 0;
  }



  playerPlayStrategicRedeployment(faction, card, value) {

    let paths_self = this;

    let spaces = this.returnSpacesWithFilter((key) => {
      for (let z = 0; z < paths_self.game.spaces[key].units.length; z++) {
        let unit = paths_self.game.spaces[key].units[z];
	if (faction == paths_self.returnPowerOfUnit(unit)) {
	  if (unit.type == "corps" && value >= 1) { 
	    return 1;
	  }
	  if (unit.type == "army" && value >= 4) {
	    return 1;
	  }
	}
      }
      return 0;
    });

    //
    // hide any popup
    //
    this.cardbox.hide();

    //
    // select box with unit
    //
    this.playerSelectSpaceWithFilter(
      "Select Space with Unit to Strategically Redeploy",
      (key) => {
	if (spaces.includes(key)) { return 1; }
        return 0;
      },
      (key) => {

        let units = [];
        for (let z = 0; z < paths_self.game.spaces[key].units.length; z++) {
  	  if (paths_self.game.spaces[key].units[z].moved != 1) {
	    units.push(z);
	  }
        }

        paths_self.playerSelectOptionWithFilter(
	  "Redeploy Which Unit?",
	  units,
	  (idx) => {
	    let unit = paths_self.game.spaces[key].units[idx];
	    return `<li class="option" id="${idx}">${unit.name}</li>`;
	  },
	  (idx) => {
	    let unit = paths_self.game.spaces[key].units[idx];
	    paths_self.game.spaces[key].units[idx].moved = 1;
	  },
          false
        );
      },
      null,
      true
    );

//    this.addMove(`sr\t${faction}\t${value}`);
//    this.endTurn();
  }

  playerPlayEvent(faction, card) {

  }

  playerTurn(faction) {

    let name = this.returnPlayerName(faction);
    let hand = this.returnPlayerHand();

    this.addMove("resolve\tplay");

    this.updateStatusAndListCards(`${name}: pick a card`, hand);
    this.attachCardboxEvents((card) => {
      this.playerPlayCard(faction, card);
    });

  }


