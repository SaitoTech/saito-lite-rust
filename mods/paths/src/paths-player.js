
  returnPlayers(num = 0) {
    var players = [];
    return players;
  }

  returnPlayerHand() {
    return this.game.deck[this.game.player-1].hand;
  }

  returnPlayerName(faction="") {
    if (faction == "central") { return "Central Powers"; }
    return "Allies";
  }

  returnPlayerOfFaction(faction="") {
    if (faction == "central") { return 1; }
    return 2;
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
      }

    });

  }

  playerPlayCombat(faction) {
    alert("player play combat...");
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
	  paths_self.game.spaces[key].activated_for_movement = 0;
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
	  paths_self.playerSelectSpaceWithFilter(
	    `Select Destination for ${unit.name}`,
	    (key) => {
	      return 1;
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
	  return `<li class="option" id="${idx}">${unit.name}</li>`;
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

  playerPlayOps(faction, card, cost) {

    this.addMove("player_play_combat\t"+faction);
    this.addMove("player_play_movement\t"+faction);

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
	      return 1;
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
	      this.addMove(`player_play_ops\t${faction}\t${card}\t${cost}}`);
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
	      return 1;
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
	      this.addMove(`player_play_ops\t${faction}\t${card}\t${cost}}`);
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

    let html = `<ul>`;
    for (let key in c.sr) {
      html    += `<li class="card" id="${key}">${key} - ${c.sr[key]}</li>`;
    }
    html    += `</ul>`;

    this.updateStatusWithOptions(`Add Strategic Redeployments:`, html, true);
    this.bindBackButtonFunction(() => { this.moves = []; this.playerPlayCard(faction, card); });
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




  playerSelectSpaceWithFilter(msg, filter_func, mycallback = null, cancel_func = null, board_clickable = false) {

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



  playerPlayStrategicRedeployment(faction, value) {

    let paths_self = this;

    let spaces = this.returnSpacesWithFilter((key) => {
      for (let z = 0; z < paths_self.game.spaces[key].units.length; z++) {
        let unit = paths_self.game.spaces[key].units[z];
	if (faction == paths_self.returnPowerOfUnit(unit)) {
	  if (unit.type == "core" && value >= 1) { 
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
alert("redeploying this unit!");
	  },
          false
        );
      }
    );

//    this.addMove(`sr\t${faction}\t${value}`);
//    this.endTurn();
  }

  playerPlayEvent(faction, card) {

  }

  playerTurn(faction) {

    let name = this.returnPlayerName(faction);
    let hand = this.returnPlayerHand();

    this.updateStatusAndListCards(`${name}: pick a card`, hand);
    this.attachCardboxEvents((card) => {
      this.playerPlayCard(faction, card);
    });

  }


