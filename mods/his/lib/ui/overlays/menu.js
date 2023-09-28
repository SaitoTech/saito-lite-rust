const MenuTemplate = require('./menu.template');
const SaitoOverlay = require("./../../../../../lib/saito/ui/saito-overlay/saito-overlay");

class MenuOverlay {

    constructor(app, mod, c1, c2, c3){
        this.app = app;
        this.mod = mod;
	this.visible = false;
        this.overlay = new SaitoOverlay(app, mod, true, false, false);
    }
 
    hide() {
      this.overlay.hide();
    }

    render(menu, player, faction, ops, attachEventsToOptions=null) {

      let his_self = this.mod;
      this.overlay.show(MenuTemplate());

      let sub_menu = (main_menu, sub_menu, options) => {

        //this.overlay.show(MenuTemplate());

	document.querySelector(".menu").classList.remove("menu-large");
	document.querySelector(".menu").innerHTML = "";

        for (let i = 0; i < options.length; i++) {

	  let menu_item = options[i];

	  let idx = menu_item.idx;
	  let cost = menu_item.cost;
	  let active_option = menu_item.active;

	  let html = `
	      <div id="${idx}" class="menu-option-container card ${active_option}">
	        <div class="menu-option-image">
	          <img src="${menu[idx].img}" />
	        </div>
	        <div class="menu-option-title">${menu[idx].name} [${cost}]</div>
	      </div>
	  `;
          this.app.browser.addElementToSelector(html, `.menu`);

	}

	if (attachEventsToOptions != null) {
	  attachEventsToOptions();
	}
      };

      let main_menu = (main_menu) => {

        //this.overlay.show(MenuTemplate());

        //
        // arrange options into categories
        //
        let move = [];
        let build = [];
        let special = [];
	let and_attack = "";

        for (let i = 0; i < menu.length; i++) {

          let id = "";
          let cost = 100;

          if (menu[i].check(this.mod, player, faction, ops)) {
            for (let z = 0; z < menu[i].factions.length; z++) {
              if (menu[i].factions[z] === faction) { 
  	        id = i;
	        cost = menu[i].cost[z];
                z = menu[i].factions.length+1;
              }
            }
	  }

	  let active_option = "inactive";

          if (cost <= ops) { active_option = "active card"; }

	  if (!menu[i].check(this.mod, this.mod.game.player, faction, ops)) { active_option = "inactive"; }

	  if (cost != 100 && active_option != "inactive") {
	    if (menu[i].category == "build") {
	      build.push({ idx : i , cost : cost , active : active_option });
	    }
	    if (menu[i].category == "move") {
	      move.push({ idx : i , cost : cost , active : active_option });
	    }
	    if (menu[i].category == "attack") {
	      and_attack = "and Attack";
	      move.push({ idx : i , cost : cost , active : active_option });
	    }
	    if (menu[i].category != "move" && menu[i].category != "build") {
	      special.push({ idx : i , cost : cost , active : active_option });
	    }
	  }
        }

console.log("BUILD: " + build.length);
console.log("MOVE: " + move.length);
console.log("OTHER: " + special.length);

        if (menu.length > 3) {

	  document.querySelector(".menu").classList.add("menu-large");

          let build_html = `
	    <div id="build" class="menu-option-container-large build-menu">
	      <div class="menu-option-title-large">Build</div>
	    </div>
	  `;
	  if (build.length > 0) {
            this.app.browser.addElementToSelector(build_html, `.menu`);
 	  }

          let move_html = `
	    <div id="move" class="menu-option-container-large move-menu">
	      <div class="menu-option-title-large">Move${and_attack}</div>
	    </div>
	  `;
	  if (move.length > 0) {
            this.app.browser.addElementToSelector(move_html, `.menu`);
	  }

          let special_html = `
	    <div id="special" class="menu-option-container-large special-menu">
	      <div class="menu-option-title-large">Special</div>
	    </div>
	  `;
	  if (special.length > 0) {
            this.app.browser.addElementToSelector(special_html, `.menu`);
	  }


	  document.querySelectorAll('.menu-option-container-large').forEach((obj) => {

            obj.onclick = (e) => {};
            obj.onclick = (e) => {

	      let id = e.currentTarget.id;

  	      if (id == "build") {
	        sub_menu(main_menu, sub_menu, build);
	        return;
	      }
  	      if (id == "move") {
	        sub_menu(main_menu, sub_menu, move);
	        return;
  	      }
  	      if (id == "special") {
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

          let id = "";
          let cost = 100;

          if (menu[i].check(this.mod, player, faction, ops)) {
            for (let z = 0; z < menu[i].factions.length; z++) {
              if (menu[i].factions[z] === faction) { 
	        id = i;
	        cost = menu[i].cost[z];
                z = menu[i].factions.length+1;
              }
            }
          }

	  let active_option = "inactive";
          if (cost <= ops) { active_option = "active card"; }

	  if (!menu[i].check(this.mod, this.mod.game.player, faction, ops)) { active_option = "inactive"; }

	  if (cost != 100) {
	    let html = `
	      <div id="${id}" class="menu-option-container ${active_option}">
	        <div class="menu-option-image">
	          <img src="${menu[i].img}" />
	        </div>
	        <div class="menu-option-title">${menu[i].name} [${cost}]</div>
	      </div>
	    `;

	    if (active_option !== "inactive") {
              this.app.browser.addElementToSelector(html, `.menu`);
	    }

          }
        }

        this.attachEvents();

      }

      //
      // show and render
      //
      main_menu(main_menu);

    }

    attachEvents() {
    }

}

module.exports = MenuOverlay;



