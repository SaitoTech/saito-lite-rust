const GameMenuTemplate = require("./game-menu.template");
const GameMenuIconTemplate = require("./game-menu-icon.template");
const GameMenuOptionTemplate = require("./game-menu-option.template");

/**
 * A customizable menu system that sits along top of screen with click to open drop down lists of submenus
 * Menu actions are defined by callbacks passed through options objects and seperately stored in properties: icons, options, sub_options
 * this.options contains the top level menu items which (by default) open to display a list of submenu options
 * this.sub_options contains the details of the second and third tier submenu options (third tier submenus are contained as a array of objects within the submenu object)
 * this.icons are direct action items in the top-level menu
 *
 * GameMenu is included in GameTemplate and accessible through .menu
 * The menu should be defined (through addMenuOption, addSubMenuOption, and addMenuIcon) in the game module's initializeHTML
 * As usual, render and attachEvents must also be called in the module.
 */
class GameMenu {
  constructor(app) {
    this.app = app;

    this.icons = [];
    this.options = [];
    this.sub_options = [];
    this.sub_menu_open = "";
  }

  /**
   * Creates the Menu in the DOM if it doesn't already exist
   * @param app - the Saito application
   * @param mod - reference to the game module
   */
  render(app, mod) {
    if (!document.querySelector(".game-menu")) {
      app.browser.addElementToDom(GameMenuTemplate());
    }

    mod.mods = app.modules.respondTo("game-menu");
    for (let i = 0; i < mod.mods.length; i++) {
      let module = mod.mods[i];
      let res = mod.mods[i].respondTo("game-menu");
      for (let z = 0; z < res.menus.length; z++) {
        this.addMenuOption(res.menus[z].menu_option);
        this.addSubMenuOption(res.menus[z].menu_option.id, res.menus[z].sub_menu_option);
      }
    }

    let html = "<ul>";
    for (let i = 0; i < this.icons.length; i++) {
      html += GameMenuIconTemplate(this.icons[i]);
    }
    for (let i = 0; i < this.options.length; i++) {
      html += GameMenuOptionTemplate(this.options[i], this.sub_options[i]);
    }

    html += `<li class="game-menu-icon game-menu-mobile-toggle"><i id="game-menu-toggle" class="fas fa-bars">
            </i></li></ul>`;

    const menu = document.querySelector(".game-menu");
    menu.innerHTML = html;
    menu.style.display = "block";
  }

  /**
   * Add functionality to menu so that clicking on menu items evokes their callbacks
   * If callback is undefined for top-level menu options, default behavior is to attempt to open its submenu
   */
  attachEvents(app, game_mod) {
    //
    // callbacks in game-menu-option
    //
    for (let i = 0; i < this.options.length; i++) {
      let menu = document.querySelector("#" + this.options[i].id);

      menu.ontouch = (e) => {
        let id = e.currentTarget.id;
        for (let i = 0; i < this.options.length; i++) {
          if (this.options[i].id === id) {
            if (this.sub_menu_open === id) {
              this.hideSubMenus();
            } else {
              if (this.options[i].callback != undefined) {
                this.options[i].callback(app, game_mod);
              } else {
                this.showSubMenu(id);
              }
            }
            e.stopPropagation();
            return;
          }
        }
      };
      menu.onclick = (e) => {
        let id = e.currentTarget.id;
        for (let i = 0; i < this.options.length; i++) {
          if (this.options[i].id === id) {
            if (this.sub_menu_open === id) {
              //Toggle submenu by clicking it
              this.hideSubMenus();
            } else {
              if (this.options[i].callback != undefined) {
                this.options[i].callback(app, game_mod);
              } else {
                this.showSubMenu(id);
              }
            }
            e.stopPropagation();
            return;
          }
        }
      };
      menu.onmouseleave = (e) => {
        this.hideSubMenus();
      };
    }

    //
    // sub-menu
    //
    for (let i = 0; i < this.sub_options.length; i++) {
      for (let ii = 0; ii < this.sub_options[i].length; ii++) {
        let submenu = document.querySelector("#" + this.sub_options[i][ii].id);
        submenu.ontouch = (e) => {
          let menuObj = this.returnMenuFromID(e.currentTarget.id);
          if (menuObj?.callback) {
            menuObj.callback(app, game_mod);
            e.stopPropagation();
            return;
          }
        };
        submenu.onclick = (e) => {
          let menuObj = this.returnMenuFromID(e.currentTarget.id);
          if (menuObj?.callback) {
            menuObj.callback(app, game_mod);
            e.stopPropagation();
            return;
          }
        };
        submenu.onmouseover = (e) => {
          let id = e.currentTarget.id;
          this.showSubSubMenu(id);
          e.stopPropagation();
          return;
        };
        submenu.onmouseleave = (e) => {
          let id = e.currentTarget.id;
          this.hideSubSubMenu(id);
          e.stopPropagation();
          return;
        };
        //Sub-sub-menus
        if (this.sub_options[i][ii].sub_menu) {
          for (let j = 0; j < this.sub_options[i][ii].sub_menu.length; j++) {
            let ssubmenu = document.querySelector("#" + this.sub_options[i][ii].sub_menu[j].id);
            ssubmenu.onclick = (e) => {
              let menuObj = this.returnMenuFromID(e.currentTarget.id);
              if (menuObj?.callback) {
                menuObj.callback(app, game_mod);
                e.stopPropagation();
                return;
              }
            };
          }
        }
      }
    }

    //
    // callbacks in game-menu-icon
    //
    for (let i = 0; i < this.icons.length; i++) {
      let menu = document.querySelector("#" + this.icons[i].id);

      menu.onclick = (e) => {
        let menuObj = this.returnMenuFromID(e.currentTarget.id);
        if (menuObj?.callback) {
          menuObj.callback(app, game_mod);
          e.stopPropagation();
          return;
        }
      };

      menu.ontouch = (e) => {
        let menuObj = this.returnMenuFromID(e.currentTarget.id);
        if (menuObj?.callback) {
          menuObj.callback(app, game_mod);
          e.stopPropagation();
          return;
        }
      };
    }

    let mobileToggle = document.querySelector("#game-menu-toggle");
    if (mobileToggle) {
      mobileToggle.onclick = (e) => {
        let menu = document.querySelector(".game-menu");
        if (menu) {
          menu.classList.toggle("mobile-visible");
        }
      };
    }
  }

  /**
   * Helper function to seach the class properties for the menu object based on its id
   * Note, all menu id's should be unique!
   */
  returnMenuFromID(id) {
    //Icons
    for (let i = 0; i < this.icons.length; i++) {
      if (this.icons[i].id === id) {
        return this.icons[i];
      }
    }
    //Menu
    for (let i = 0; i < this.options.length; i++) {
      if (this.options[i].id === id) {
        return this.options[i];
      }
    }
    //Submenu
    for (let i = 0; i < this.sub_options.length; i++) {
      for (let j = 0; j < this.sub_options[i].length; j++) {
        if (this.sub_options[i][j].id === id) {
          return this.sub_options[i][j];
        }
        if (this.sub_options[i][j].sub_menu) {
          for (let k = 0; k < this.sub_options[i][j].sub_menu.length; k++) {
            if (this.sub_options[i][j].sub_menu[k].id === id) {
              return this.sub_options[i][j].sub_menu[k];
            }
          }
        }
      }
    }
    return null;
  }

  /**
   * Hide the menu from the DOM
   */
  hide() {
    try {
      document.querySelector(".game-menu").style.display = "none";
    } catch (err) {}
  }

  /**
   * Add a top-level menu option to the menu
   * @param options -- an object containing id, text, class, and callback
   * id is a unique reference to the menu item (will not permit duplicate ids),
   * text is what is displayed in the menu,
   * class (if defined) is passed along to the html template for css styling or query selection
   * callback is the function to run on clicking. Generally, that should be a reference to this.showSubMenu
   *
   *
   */
  addMenuOption(options = {}) {
    if (!options.id) {
      console.error("No menu id specified!");
      return;
    }
    if (this.returnMenuFromID(options.id)) {
      //console.error("Duplicate menu id:",options.id);
      return;
    }
    this.options.push(options);
    this.sub_options.push([]);
  }

  /**
   * Adds a sub menu to a top-level menu option or to a secondary menu option (sub_option)
   * @param parent_id -- the id of the containing top-level menu item
   * @param options -- an object containing id, text, class, and callback
   * id is a unique reference to the menu item (will not permit duplicate ids),
   * text is what is displayed in the menu,
   * class (if defined) is passed along to the html template for css styling or query selection
   * callback is the function to run on clicking. Generally, that should be a function defined in the game module
   *
   *
   */
  addSubMenuOption(parent_id, options = {}) {
    if (!options.id) {
      console.error("No menu id specified!");
      return;
    }
    if (this.returnMenuFromID(options.id)) {
      //console.error("Duplicate menu id:",options.id);
      return;
    }

    for (let i = 0; i < this.options.length; i++) {
      if (this.options[i].id === parent_id) {
        if (this.sub_options[i]) {
          this.sub_options[i].push(options);
          return 1; //success!
        }
      }
    }

    //Sub-sub menu
    let parentMenu = this.returnMenuFromID(parent_id);
    if (!parentMenu) {
      console.error("Invalid menu parent");
      return;
    }

    if (parentMenu.sub_menu) {
      parentMenu.sub_menu.push(options);
    } else {
      parentMenu.sub_menu = [];
      parentMenu.sub_menu.push(options);
    }
  }

  /**
   * Add a top-level menu option to the menu
   * @param options -- an object containing id, text, class, and callback
   * id is a unique reference to the menu item (will not permit duplicate ids),
   * text is what is displayed in the menu,
   * class (if defined) is passed along to the html template for css styling or query selection
   * callback is the function to run on clicking. Generally, that should be a reference to this.showSubMenu
   *
   * menuIcon differs from menuOption in that menuOption assumes there is a subMenu, while menuIcon results in a direct action
   * A typical example of icon text is the html: '<i class="fa fa-window-maximize" aria-hidden="true"></i>'
   */
  addMenuIcon(options = {}) {
    for (let i = 0; i < this.icons.length; i++) {
      if (this.icons[i].id == options.id) {
        return;
      }
    }
    this.icons.push(options);
  }

  /**
   * Opens the specified submenu (closing any currently open one)
   * @param parent_id - the id of the menu option containing the submenu to be openeed
   */
  showSubMenu(parent_id) {
    if (this.sub_menu_open != "") {
      this.hideSubMenus();
    }
    this.sub_menu_open = parent_id;

    let el = document.querySelector("#" + parent_id + " > ul");
    if (el) {
      el.style.display = "block";
    }
  }

  /**
   * Sets the sub menu the specified menu to display
   * Only differs from showSubMenu because we don't want to close all the submenus
   * @param parent_id - the id of the (sub)menu option containing the submenu to be openeed
   */
  showSubSubMenu(parent_id) {
    let el = document.querySelector("#" + parent_id + " > ul");
    if (el) {
      el.style.display = "block";
    }
  }

  /**
   * Hides all submenus
   *
   */
  hideSubMenus() {
    this.sub_menu_open = "";
    for (let i = 0; i < this.options.length; i++) {
      let divname = "#" + this.options[i].id + " ul";
      let subLists = document.querySelectorAll(divname);
      for (let i = 0; i < subLists.length; i++) {
        if (subLists[i]) {
          subLists[i].style.display = "none";
        }
      }
    }
  }

  /**
   * Hide the menu contained within the specified parent id
   * @param parent_id - the id of the <li> containing the submenu
   */
  hideSubSubMenu(parent_id) {
    let div = document.querySelector(`#${parent_id} ul`);
    if (div) {
      div.style.display = "none";
    }
  }

  /**
   * A convienence function for game modules to quickly add chat features to the game menu
   * @param app - the Saito application
   * @param game_mod - the game module
   * @param names - an optional specification of player names, if not provided, defaults to Player 1, Player 2, etc.
   */
  addChatMenu(app, game_mod, shortNames = null, longNames = null) {

    let menu_self = this;
    for (let i = 0; i < app.modules.mods.length; i++) {
      if (app.modules.mods[i].slug === "chat") {
        let chatmod = app.modules.mods[i];

        menu_self.addMenuOption({
          text: "Chat",
          id: "game-chat",
          class: "game-chat",
          callback: function (app, game_mod) {
            menu_self.showSubMenu("game-chat");
          },
        });

        menu_self.addSubMenuOption("game-chat", {
          text: "Community",
          id: "game-chat-community",
          class: "game-chat-community",
          callback: function (app, game_mod) {
            menu_self.hideSubMenus();
            chatmod.sendEvent("chat-render-request", {});
            chatmod.mute_community_chat = 0;
            chatmod.openChatBox(chatmod.returnCommunityChat().id);
          },
        });

        //Create group chat but just for this game, not the whole community
        if (game_mod.game.players.length > 2){
          let members = JSON.parse(JSON.stringify(game_mod.game.players)).sort();
          let gid = app.crypto.hash(members.join("_"));
          menu_self.addSubMenuOption("game-chat", {
          text: "All Players",
          id: "game-chat-group",
          class: "game-chat-group",
          callback: function (app, game_mod) {
            menu_self.hideSubMenus();
            let newgroup = chatmod.createChatGroup(members, "All Players");
            if (newgroup) {
                  chatmod.addNewGroup(newgroup);
                  chatmod.sendEvent("chat-render-request", {});
                  chatmod.openChatBox(newgroup.id);
                  chatmod.saveChat();
                } else {
                  console.log("new group failed, resort to gid");
                  chatmod.sendEvent("chat-render-request", {});
                  chatmod.openChatBox(gid);
                }
          },
          });
        }

        // add peer chat
        for (let ii = 0; ii < game_mod.game.players.length; ii++) {
          if (game_mod.game.players[ii] != app.wallet.returnPublicKey()) {
            let members = [game_mod.game.players[ii], app.wallet.returnPublicKey()].sort();
            let gid = app.crypto.hash(members.join("_"));
            let nickname = shortNames ? shortNames[ii] : "Player " + (ii + 1);
            let name = longNames ? longNames[ii] : nickname;

            menu_self.addSubMenuOption("game-chat", {
              text: nickname,
              id: "game-chat-" + (ii + 1),
              class: "game-chat-" + (ii + 1),
              callback: function (app, game_mod) {
                menu_self.hideSubMenus();
                // load the chat window
                let newgroup = chatmod.createChatGroup(members, name);
                if (newgroup) {
                  chatmod.addNewGroup(newgroup);
                  chatmod.sendEvent("chat-render-request", {});
                  chatmod.openChatBox(newgroup.id);
                  chatmod.saveChat();
                } else {
                  console.log("new group failed, resort to gid");
                  chatmod.sendEvent("chat-render-request", {});
                  chatmod.openChatBox(gid);
                }
              },
            });
          }
        }
      }
    }
  }
}

module.exports = GameMenu;
