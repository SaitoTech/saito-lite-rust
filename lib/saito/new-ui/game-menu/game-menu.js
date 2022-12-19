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
  /**
   * @param app - the Saito application
   * @param mod - reference to the game module
   */
  constructor(app, mod) {
    this.app = app;
    this.game_mod = mod;

    this.icons = [];
    this.options = [];
    this.sub_options = [];
    this.sub_menu_open = "";
    this.initialized = 0;
  }

  /**
   * Creates the Menu in the DOM if it doesn't already exist
   * Menu must be defined using the other functions prior to rendering!
   */
  render() {

    if (this.initialized == 0) {
      this.app.modules.respondTo("game-menu").forEach((menMod) => {

        let menu = menMod.respondTo("game-menu");
        /* 
        for potential initialization functions, might be used to render a menu and  an array of submenu options
        */
        if (menu.init){
          menu.init(this.app, this.game_mod);
        }

        this.addMenuOption(menu.id, menu.text);

        for (let sub_menu of menu.submenus) {
          this.addSubMenuOption(menu.id, sub_menu);
        }
      });

      this.initialized = 1;

      if (this.app.modules.returnModule("RedSquare")) {
        this.addSubMenuOption("game-game", {
          text : "Screenshot",
          id : "game-post",
          class : "game-post",
          callback : async function(app, game_mod) {
            let m = app.modules.returnModule("RedSquare");
            if (m){
              //Hide Log unless maximize
              let log = document.getElementById("log-wrapper");
              //let log_lock = document.querySelector(".log_lock");
              if (log && !log.classList.contains("log_lock")) { log.style.display = "none"; }
              //Hide Menu
              let menu = document.getElementById("game-menu");
              menu.style.display = "none";
              await app.browser.captureScreenshot(function(image) {
                if (log && !log.classList.contains("log_lock")) { log.style.display = "block"; }
                menu.style.display = "block";
                m.tweetImage(image);
              });
            }
          },
        });
      }


      //Insert Standard functions here

      this.addSubMenuOption("game-game", {
        text : "Exit",
        id : "game-exit",
        class : "game-exit",
        callback : function(app, game_mod) {
          game_mod.exitGame();
          //window.location.href = "/arcade";
        }
      });
      this.addMenuIcon({
        text : '<i class="fa fa-window-maximize" aria-hidden="true"></i>',
        id : "game-menu-fullscreen",
        callback : function(app, game_mod) {
          game_mod.menu.hideSubMenus();
          app.browser.requestFullscreen();
        }
      });


    }

    let html = "<ul>";
    for (let i = 0; i < this.icons.length; i++) {
      html += GameMenuIconTemplate(this.icons[i]);
    }
    for (let i = 0; i < this.options.length; i++) {
      html += GameMenuOptionTemplate(this.options[i], this.sub_options[i]);
    }

    html += `<li id="game-menu-toggle" class="game-menu-icon game-menu-mobile-toggle"><i class="fas fa-bars">
            </i></li></ul>`;


    this.app.browser.replaceElementById(GameMenuTemplate(html), "game-menu");

    this.attachEvents();
  }

  /**
   * Add functionality to menu so that clicking on menu items evokes their callbacks
   * If callback is undefined for top-level menu options, default behavior is to attempt to open its submenu
   */
  attachEvents() {
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
                this.options[i].callback(this.app, this.game_mod);
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
                this.options[i].callback(this.app, this.game_mod);
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
            menuObj.callback(this.app, this.game_mod);
            e.stopPropagation();
            return;
          }
        };
        submenu.onclick = (e) => {
          let menuObj = this.returnMenuFromID(e.currentTarget.id);
          if (menuObj?.callback) {
            menuObj.callback(this.app, this.game_mod);
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
                menuObj.callback(this.app, this.game_mod);
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
          menuObj.callback(this.app, this.game_mod);
          e.stopPropagation();
          return;
        }
      };

      menu.ontouch = (e) => {
        let menuObj = this.returnMenuFromID(e.currentTarget.id);
        if (menuObj?.callback) {
          menuObj.callback(this.app, this.game_mod);
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

  replaceMenuByID(options){
    for (let i = 0; i < this.options.length; i++) {
      if (this.options[i].id === options.id) {
        this.options[i] = options;
        return;
      }
    }
  }

  /**
   * Hide the menu from the DOM
   */
  hide() {
    try {
      document.querySelector(".game-menu").style.display = "none";
    } catch (err) {
      console.log("Cannot hide menu?");
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
   *
   */
  addMenuOption(id, text) {

    if (this.returnMenuFromID(id)) {
      return;
    }

    let options = {
         text,
         id,
         class: id,
         callback: function (app, game_mod) {
            game_mod.menu.showSubMenu(id);
         },
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
   * @param names - an optional specification of player names, if not provided, defaults to Player 1, Player 2, etc.
   */
  addChatMenu(shortNames = null, longNames = null) {
    
    let menu_self = this;

    this.app.connection.on("chat-render-request-notify", (chat_group)=>{
      if (menu_self.initialized){
        try { 
          document.getElementById('game-chat').classList.add("notification");
          if (chat_group.members.length == 1){
            document.getElementById("game-chat-community").classList.add("notification");
          }
        }catch(err){
          console.warn(err);
        }
      } 
    });


    menu_self.addMenuOption("game-chat", "Chat");

    menu_self.addSubMenuOption("game-chat", {
      text: "Community",
      id: "game-chat-community",
      class: "game-chat-community",
      callback: function (app, game_mod) {
        menu_self.hideSubMenus();
        app.connection.emit("open-chat-with-community");
        document.getElementById('game-chat').classList.remove("notification");
        document.getElementById("game-chat-community").classList.remove("notification");
      },
    });

    //Create group chat but just for this game, not the whole community
    if (this.game_mod?.game?.players) {
      if (this.game_mod.game.players.length > 2) {
        menu_self.addSubMenuOption("game-chat", {
          text: "All Players",
          id: "game-chat-group",
          class: "game-chat-group",
          callback: function (app, game_mod) {
            menu_self.hideSubMenus();
            app.connection.emit("open-chat-with", {key: game_mod.game.players, name:"All Players"});
          },
        });
      }

      // add peer chat
      for (let ii = 0; ii < this.game_mod.game.players.length; ii++) {
        if (this.game_mod.game.players[ii] != this.app.wallet.returnPublicKey()) {
          let nickname = shortNames ? shortNames[ii] : "Player " + (ii + 1);
          let name = longNames ? longNames[ii] : nickname;

          menu_self.addSubMenuOption("game-chat", {
            text: nickname,
            id: "game-chat-" + (ii + 1),
            class: "game-chat-" + (ii + 1),
            callback: function (app, game_mod) {
              menu_self.hideSubMenus();
              app.connection.emit("open-chat-with", {key: game_mod.game.players[ii], name});
            },
          });
        }
      }
    }
   
  }
}

module.exports = GameMenu;
