const ReplacementsTemplate = require('./replacements.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class ReplacementsOverlay {

	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.visible = false;
		this.overlay = new SaitoOverlay(app, mod);
	}

	hide() {
		this.visible = false;
		this.overlay.hide();
	}

        pullHudOverOverlay() {
                //
                // pull GAME HUD over overlay
                //
                let overlay_zindex = parseInt(this.overlay.zIndex);
                if (document.querySelector('.hud')) {
                        document.querySelector('.hud').style.zIndex = overlay_zindex + 1;
                        this.mod.hud.zIndex = overlay_zindex + 1;
                }
        }
        pushHudUnderOverlay() {
                //
                // push GAME HUD under overlay
                //
                let overlay_zindex = parseInt(this.overlay.zIndex);
                if (document.querySelector('.hud')) {
                        document.querySelector('.hud').style.zIndex = overlay_zindex - 2;
                        this.mod.hud.zIndex = overlay_zindex - 2;
                }
        }

	render() {

		let paths_self = this.mod;
		let faction = paths_self.returnFactionOfPlayer();

		this.visible = true;
		this.overlay.show(ReplacementsTemplate());

		let pts = document.querySelector('.replacements-overlay .points');
		pts.innerHTML = "";
		for (let key in paths_self.game.state.rp[faction]) {
		  pts.innerHTML += `
		    <div class="box">
		      <div class="num">${paths_self.game.state.rp[faction][key]}</div>
		      <div class="ckey">${key}</div>
		    </div>
		  `;
		}



		let obj = document.querySelector('.replacements-overlay .mainmenu .status');
		obj.innerHTML = "Select Option:";

		let obk = document.querySelector('.replacements-overlay .mainmenu .controls');	
		let html = '<ul>';
		for (let z = 0; z < paths_self.game.state.replacements.options.length; z++) {
		  html += paths_self.game.state.replacements.options[z];
		}
		html += "</ul>";
		obk.innerHTML = html;

		document.querySelectorAll(".replacements-overlay .mainmenu .controls ul li").forEach((el) => {

			el.onclick = (e) => {
			
				let id = e.currentTarget.id;
				
				if (id == "finish") {
					paths_self.endTurn();
					this.hide();
					return 1;
				}

				this.showSubMenu(id);

			}

		});

	}


	hideSubMenu() {
		try {
			document.querySelector('.replacements-overlay .submenu').style.visibility = "hidden";
		} catch (err) {}
	}

	showSubMenu(id="uneliminate") {

		let paths_self = this.mod;
		let eu = paths_self.game.state.replacements.can_uneliminate_unit_array;
		if (id == "repair_board") {
		  eu = paths_self.game.state.replacements.can_repair_unit_on_board_array;
		}
		if (id == "repair_reserves") {
		  eu = paths_self.game.state.replacements.can_repair_unit_in_reserves_array;
		}
		if (id == "deploy") {
		  eu = paths_self.game.state.replacements.can_deploy_unit_in_reserves_array;
		}

		let obk = document.querySelector('.replacements-overlay .submenu .controls');	
		let html = '<ul>';
		for (let z = 0; z < eu.length; z++) {
		  html += `<li class="option" id="${z}">${eu[z].name} - ${paths_self.game.spaces[eu[z].key].name}</li>`;
		}
		html += "</ul>";
		obk.innerHTML = html;

		document.querySelectorAll(".replacements-overlay .submenu .controls ul li").forEach((el) => {

			el.onclick = (e) => {

				let z = parseInt(e.currentTarget.id);
				let unit = paths_self.game.spaces[eu[z].key].units[eu[z].idx];
				let faction = paths_self.returnFactionOfPlayer();

				//
				// deduct RP
				//
				if (paths_self.game.state.rp[faction][unit.ckey] > 0) {
					paths_self.game.state.rp[faction][unit.ckey]--;
				} else {
					if (paths_self.game.state.rp[faction]["CP"] > 0) {
						paths_self.game.state.rp[faction]["CP"]--;
					} else {
						if (paths_self.game.state.rp[faction]["AP"] > 0) {
							paths_self.game.state.rp[faction]["AP"]--;
						} else {
							alert("You do not seem to have enough RPs to treat that unit...");
						}
					}
				}

				if (id == "uneliminate") {
        				paths_self.game.spaces[eu[z].key].units[eu[z].idx].destroyed = 0;
        				paths_self.game.spaces[eu[z].key].units[eu[z].idx].damaged = 1;
        				if (paths_self.returnFactionOfPlayer() == "central") {
						paths_self.moveUnit(eu[z].key, eu[z].idx, "crbox");
        				} else {
						paths_self.moveUnit(eu[z].key, eu[z].idx, "arbox");
        				}
					paths_self.prependMove(`repair\t${faction}\t${eu[z].key}\t${eu[z].idx}\t${paths_self.game.player}`);
        				paths_self.prependMove(`move\t${faction}\t${eu[z].key}\t${eu[z].idx}\tarbox\t${paths_self.game.player}`);
        				paths_self.displaySpace(eu[z].key);
        				paths_self.displaySpace("arbox");
        				paths_self.displaySpace("crbox");
					paths_self.playerSpendReplacementPoints(paths_self.returnFactionOfPlayer());
				}
				if (id == "repair_reserves") {
          				paths_self.game.spaces[eu[z].key].units[eu[z].idx].damaged = 0;
				        paths_self.prependMove(`repair\t${faction}\t${eu[z].key}\t${eu[z].idx}\t${paths_self.game.player}`);
          				paths_self.displaySpace(eu[z].key);
					paths_self.playerSpendReplacementPoints(paths_self.returnFactionOfPlayer());
				}
				if (id == "repair_board") {
          				paths_self.game.spaces[eu[z].key].units[eu[z].idx].damaged = 0;
				        paths_self.prependMove(`repair\t${faction}\t${eu[z].key}\t${eu[z].idx}\t${paths_self.game.player}`);
          				paths_self.displaySpace(eu[z].key);
					paths_self.playerSpendReplacementPoints(paths_self.returnFactionOfPlayer());
				}
				if (id == "deploy") {

					this.hideSubMenu();
			
					paths_self.playerSelectSpaceWithFilter(
              					`Destination for ${unit.name}` ,
              					(spacekey) => { 
							if (paths_self.game.spaces[spacekey].control == faction) {
								if (paths_self.checkSupplyStatus(unit.ckey.toLowerCase(), spacekey) == 1) {
									return 1;
								}
 							} return 0;
						} ,
              					(spacekey) => {

							if (spacekey == "mainmenu") {
								this.render();
								return 1;
							}

					              	paths_self.updateStatus("moving...");
              						paths_self.moveUnit(eu[z].key, eu[z].idx, spacekey);
              						paths_self.prependMove(`move\t${faction}\t${eu[z].key}\t${eu[z].idx}\t${spacekey}\t${paths_self.game.player}`);
              						paths_self.displaySpace(eu[z].key);
              						paths_self.displaySpace(spacekey);
							paths_self.playerSpendReplacementPoints(paths_self.returnFactionOfPlayer());
						},
              					null ,
             					true ,
						[{ key : "mainmenu" , value : "back to menu" }] ,
            				);
				}
			}

		});

		try {
			document.querySelector('.replacements-overlay .submenu').style.visibility = "visible";
		} catch (err) {
		}
	}

}

module.exports = ReplacementsOverlay;
