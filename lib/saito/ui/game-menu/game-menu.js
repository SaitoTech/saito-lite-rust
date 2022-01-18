const GameMenuTemplate = require("./game-menu.template");
const GameMenuIconTemplate = require("./game-menu-icon.template");
const GameMenuOptionTemplate = require("./game-menu-option.template");

/**
 * A customizable menu system that sits along top of screen with click to open drop down lists of submenus
 * Menu actions are defined by callbacks passed through options objects and seperately stored in properties: icons, options, sub_options
 * this.options contains the top level menu items which (by default) open to display a list of submenu options
 * this.sub_options contains the details of the submenu options
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

    let html = "<ul>";
    for (let i = 0; i < this.icons.length; i++) {
      html += GameMenuIconTemplate(this.icons[i]);
    }
    for (let i = 0; i < this.options.length; i++) {
      html += GameMenuOptionTemplate(this.options[i], this.sub_options[i]);
    }
    html += "</ul>";

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
      let divname = "#" + this.options[i].id;
      let menu = document.querySelector(divname);

      menu.ontouch = (e) => {
        let id = e.currentTarget.id;
        for (let i = 0; i < this.options.length; i++) {
          if (this.options[i].id === id) {
            if (this.sub_menu_open === id) {
              this.hideSubMenus();
            } else {
              if (this.options[i].callback != undefined) {
                this.options[i].callback(app, game_mod);
              }else{
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
              }else{
                this.showSubMenu(id);
              }
            }

            e.stopPropagation();
            return;
          }
        }
      };
    }

    //
    // sub-menu
    //
    for (let i = 0; i < this.sub_options.length; i++) {
      for (let ii = 0; ii < this.sub_options[i].length; ii++) {
        let divname = "#" + this.sub_options[i][ii].id;
        let menu = document.querySelector(divname);
        menu.ontouch = (e) => {
          let id = e.currentTarget.id;
          for (let iii = 0; iii < this.sub_options.length; iii++) {
            for (let iv = 0; iv < this.sub_options[iii].length; iv++) {
              if (this.sub_options[iii][iv].id === id) {
                if (this.sub_options[iii][iv].callback != undefined) {
                  this.sub_options[iii][iv].callback(app, game_mod);
                  e.stopPropagation();
                  return;
                }
              }
            }
          }
        };
        menu.onclick = (e) => {
          let id = e.currentTarget.id;
          for (let iii = 0; iii < this.sub_options.length; iii++) {
            for (let iv = 0; iv < this.sub_options[iii].length; iv++) {
              if (this.sub_options[iii][iv].id === id) {
                if (this.sub_options[iii][iv].callback != undefined) {
                  this.sub_options[iii][iv].callback(app, game_mod);
                  e.stopPropagation();
                  return;
                }
              }
            }
          }
        };
      }
    }

    //
    // callbacks in game-menu-icon
    //
    for (let i = 0; i < this.icons.length; i++) {
      let divname = "#" + this.icons[i].id;
      let menu = document.querySelector(divname);

      menu.onclick = (e) => {
        let id = e.currentTarget.id;
        for (let i = 0; i < this.icons.length; i++) {
          if (this.icons[i].id === id) {
            if (this.icons[i].callback != undefined) {
              this.icons[i].callback(app, game_mod);
              e.stopPropagation();
              return;
            }
          }
        }
      };

      menu.ontouch = (e) => {
        let id = e.currentTarget.id;
        for (let i = 0; i < this.icons.length; i++) {
          if (this.icons[i].id === id) {
            if (this.icons[i].callback != undefined) {
              this.icons[i].callback(app, game_mod);
              e.stopPropagation();
              return;
            }
          }
        }
      };
    }
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
    for (let i = 0; i < this.options.length; i++) {
      if (this.options[i].id === options.id) {
        return;
      }
    }
    this.options.push(options);
    this.sub_options.push([]);
  }

  /**
   * Adds a sub menu to a top-level menu option
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
    for (let i = 0; i < this.options.length; i++) {
      if (this.options[i].id === parent_id) {
        if (this.sub_options[i]) {
          for (let z = 0; z < this.sub_options[i].length; z++) {
            if (this.sub_options[i][z].id === options.id) {
              return;
            }
          }
          this.sub_options[i].push(options);
        }
      }
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
   * Hides all submenus
   *
   */
  hideSubMenus() {
    this.sub_menu_open = "";
    for (let i = 0; i < this.options.length; i++) {
      let divname = "#" + this.options[i].id + " > ul";
      let el = document.querySelector(divname);
      if (el) {
        el.style.display = "none";
      }
    }
  }
}

module.exports = GameMenu;
