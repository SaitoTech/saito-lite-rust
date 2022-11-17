const ArcadeSidebarTemplate = require("./sidebar.template");
const ArcadeLeague = require("./league/league");


class ArcadeSidebar {

  constructor(app, mod, selector="") {
    this.name = "ArcadeSidebar";
    this.mod = mod;
    this.selector = selector;

  }

  render(app, mod, selector="") {

    //
    // remove me if I exist
    //
    if (document.querySelector(".saito-sidebar.right")) {
      document.querySelector(".saito-sidebar.right").remove();
    }

    //
    // and re-render me
    //
    if (selector != "") {
      app.browser.addElementToSelector(ArcadeSidebarTemplate(app, mod), selector);
    } else {
      app.browser.addElementToSelector(ArcadeSidebarTemplate(app, mod), this.selector);
    }

    //
    // disable calendar -- html still in template for now
    //
    let league_sidebar = new ArcadeLeague(app, mod);
    league_sidebar.render(app, mod, ".redsquare-sidebar-league");


    // make right sidebar scrollable if its height is greater than window height
    if (document.querySelector('.saito-sidebar-right') != null) {
      let r_sidebar_height = document.querySelector('.saito-sidebar-right').offsetHeight;
      let win_height = window.innerHeight;

      if (r_sidebar_height > win_height) {
        document.querySelector('.saito-sidebar-right').classList.add("sidebar-scrollable");
      } else {
        document.querySelector('.saito-sidebar-right').classList.remove("sidebar-scrollable");
      }
    }

    this.attachEvents(app, mod);

  }

  attachEvents(app, mod) {
    
  } 

}

module.exports = ArcadeSidebar;


