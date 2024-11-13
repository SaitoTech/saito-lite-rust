const MenuTemplate = require('./menu.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class MenuOverlay {

	constructor(app, mod, c1, c2, c3) {
		this.app = app;
		this.mod = mod;
		this.visible = false;
		this.overlay = new SaitoOverlay(app, mod, true, false, false);
	}

	hide() {
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

	render(menu, player, faction, ops, attachEventsToOptions = null) {

		let his_self = this.mod;
		let menu_style = "classic"; 	// classic ==> starting menus, then submenus
						// simple  ==> one-click up to 9 options

		this.overlay.show(MenuTemplate());

		//
		// Foul Weather remove Assault
		//
	        if (his_self.game.state.events.foul_weather == 1) {
		  for (let i = 0; i < menu.length; i++) {
		    if (menu[i].name == "Assault") {
		      menu.splice(i, 1);
		      i--;
		    }
		  }
		}



		this.pushHudUnderOverlay();

		let sub_menu = (main_menu, sub_menu, options) => {

			for (let i = 0; i < options.length; i++) {
				let menu_item = options[i];

				let idx = menu_item.idx;
				let cost = menu_item.cost;
				let active_option = menu_item.active;
				let costtext = "- " + cost + " op";
				if (cost > 1) { costtext += "s"; } 

				let html = `
				      <div id="${idx}" class="menu-option-container ${active_option}">
				        <div class="menu-option-image">
				          <img src="${menu[idx].img}" />
				        </div>
				        <div class="menu-option-title">${menu[idx].name} ${costtext}</div>
				      </div>
				`;
				if (cost == 0) {
				  html = `
				      <div id="${idx}" class="menu-option-container ${active_option}">
				        <div class="menu-option-image">
				          <img src="${menu[idx].img}" />
				        </div>
				        <div class="menu-option-title">${menu[idx].name}</div>
				      </div>
				  `;
				}
				this.app.browser.addElementToSelector(html, `.movemenu`);
			}

			document.querySelector('.movemenu').classList.add(`m${options.length}entries`);

			if (attachEventsToOptions != null) {
				attachEventsToOptions();
			}
		};

		let main_menu = (main_menu) => {

			//
			// arrange options into categories
			//
			let move = [];
			let build = [];
			let special = [];
			let and_attack = '';

			//
			// revert to simple menu
			//
			let active_menu_options = 0;

			for (let i = 0; i < menu.length; i++) {
				let id = '';
				let cost = 100;

				if (menu[i].check(this.mod, player, faction, ops)) {
					for (let z = 0; z < menu[i].factions.length; z++) {
						if (menu[i].factions[z] === faction) {
							id = i;
							cost = menu[i].cost[z];
							z = menu[i].factions.length + 1;
						}
					}
				}

				let active_option = 'inactive';

				if (cost <= ops) {
					active_option = 'active card';
				}

				if (
					!menu[i].check(this.mod, this.mod.game.player, faction, ops)
				) {
					active_option = 'inactive';
				}

				if (cost != 100 && active_option != 'inactive') {

					active_menu_options++;

					if (menu[i].category == 'build') {
						build.push({
							idx: i,
							cost: cost,
							active: active_option
						});
					}
					if (menu[i].category == 'move') {
						move.push({
							idx: i,
							cost: cost,
							active: active_option
						});
					}
					if (menu[i].category == 'attack') {
						and_attack = ' and Attack';
						move.push({
							idx: i,
							cost: cost,
							active: active_option
						});
					}
					if (
						menu[i].category != 'move' &&
						menu[i].category != 'attack' &&
						menu[i].category != 'build'
					) {
						special.push({
							idx: i,
							cost: cost,
							active: active_option
						});
					}
				}
			}


			if (active_menu_options <= 20) {
				if (active_menu_options > 9) { active_menu_options = 9; }
				sub_menu(main_menu, sub_menu, move);
				sub_menu(main_menu, sub_menu, build);
				sub_menu(main_menu, sub_menu, special);
				document.querySelector('.movemenu').classList.add(`m${active_menu_options}entries`);
				return;
			}

			if (menu.length > 3) {
				document.querySelector('.movemenu').classList.add('menu-large');

				let build_html = `
				    <div id="build" class="menu-option-container-large build-menu">
				      <div class="menu-option-title-large">Build</div>
				    </div>
				`;
				if (build.length > 0) {
					this.app.browser.addElementToSelector(build_html, `.movemenu`);
					let content = '';
					for (let z = 0; z < build.length; z++) {
						if (z > 0) {
							content += ', ';
						}
						content += menu[build[z].idx].name.toLowerCase();
					}
					if (content != '') {
						this.app.browser.addElementToSelector(
							`<div class="menu-option-content-large">${content}</div>`,
							`.build-menu`
						);
					}
				}

				let move_html = `
				    <div id="move" class="menu-option-container-large move-menu">
				      <div class="menu-option-title-large">Move${and_attack}</div>
				    </div>
				  `;
				if (move.length > 0) {
					this.app.browser.addElementToSelector(move_html, `.movemenu`);
					let content = '';
					for (let z = 0; z < move.length; z++) {
						if (z > 0) {
							content += ', ';
						}
						content += menu[move[z].idx].name.toLowerCase();
					}
					if (content != '') {
						this.app.browser.addElementToSelector(
							`<div class="menu-option-content-large">${content}</div>`,
							`.move-menu`
						);
					}
				}

				let special_html = `
				    <div id="special" class="menu-option-container-large special-menu">
				      <div class="menu-option-title-large">Special</div>
				    </div>
				  `;
				if (special.length > 0) {
					this.app.browser.addElementToSelector(
						special_html,
						`.movemenu`
					);
					let content = '';
					for (let z = 0; z < special.length; z++) {
						if (z > 0) {
							content += ', ';
						}
						content += menu[special[z].idx].name.toLowerCase();
					}
					if (content != '') {
						this.app.browser.addElementToSelector(
							`<div class="menu-option-content-large">${content}</div>`,
							`.special-menu`
						);
					}
				}

				document
					.querySelectorAll('.menu-option-container-large')
					.forEach((obj) => {
						obj.onclick = (e) => {};
						obj.onclick = (e) => {
							let id = e.currentTarget.id;

							document.querySelector('.movemenu').classList.remove('menu-large');
							document.querySelector('.movemenu').innerHTML = '';

							if (id == 'build') {
								sub_menu(main_menu, sub_menu, build);
								return;
							}
							if (id == 'move') {
								sub_menu(main_menu, sub_menu, move);
								return;
							}
							if (id == 'special') {
								sub_menu(main_menu, sub_menu, special);
								return;
							}
						};
					});

				this.attachEvents();

				return;
			}

			//
			// duplicates code below
			//
			for (let i = 0; i < menu.length; i++) {
				let id = '';
				let cost = 100;

				if (menu[i].check(this.mod, player, faction, ops)) {
					for (let z = 0; z < menu[i].factions.length; z++) {
						if (menu[i].factions[z] === faction) {
							id = i;
							cost = menu[i].cost[z];
							z = menu[i].factions.length + 1;
						}
					}
				}

				let active_option = 'inactive';
				if (cost <= ops) {
					active_option = 'active card';
				}

				if (
					!menu[i].check(this.mod, this.mod.game.player, faction, ops)
				) {
					active_option = 'inactive';
				}

				if (cost != 100) {
					if (active_option !== 'inactive') {
						this.app.browser.addElementToSelector(this.returnMenuHTML(menu[i].name, menu[i].img, active_option, menu[i].cost), `.movemenu`);
					}
				}
			}

			this.attachEvents();
		};

		//
		// show and render
		//
		main_menu(main_menu);
	}

	attachEvents() {}

	returnMenuHTML(name="", img="", active_option="active card", cost=0) {
          if (cost == 0) {
	    return `
	      <div id="${id}" class="menu-option-container ${active_option}">
	        <div class="menu-option-image">
	          <img src="${img}" />
	        </div>
	        <div class="menu-option-title">${name}</div>
	      </div>
	    `;
	  } else {
	    let costtext = "- " + cost + " op";
	    if (cost > 1) { costtext += "s"; } 
	    return `
	      <div id="${id}" class="menu-option-container ${active_option}">
	        <div class="menu-option-image">
	          <img src="${img}" />
	        </div>
	        <div class="menu-option-title">${name} ${costtext}</div>
	      </div>
	    `;
	  }
	}

}

module.exports = MenuOverlay;
