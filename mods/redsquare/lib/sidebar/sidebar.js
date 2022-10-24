const RedSquareSidebarTemplate = require("./sidebar.template");
//const SaitoCalendar = require("./../../../../lib/saito/new-ui/saito-calendar/saito-calendar");
const RedSquareLeague = require("./league/league");
const RedSquareObserver = require("./observer/observer");
const RedSquareGames = require("./games/games");


class RedSquareSidebar {

  constructor(app, mod, selector="") {
    this.name = "RedSquareSidebar";
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
      app.browser.addElementToSelector(RedSquareSidebarTemplate(app, mod), selector);
    } else {
      app.browser.addElementToSelector(RedSquareSidebarTemplate(app, mod), this.selector);
    }

    //
    // disable calendar -- html still in template for now
    //
    //let sidebar_calendar = new SaitoCalendar(app, mod);
    //sidebar_calendar.render(app, mod, ".redsquare-sidebar-calendar");

    let game_sidebar = new RedSquareGames(app, mod);
    game_sidebar.render(app, mod, ".redsquare-sidebar-arcade");

    let league_sidebar = new RedSquareLeague(app, mod);
    league_sidebar.render(app, mod, ".redsquare-sidebar-league");

    let observer_sidebar = new RedSquareObserver(app, mod, []);
    observer_sidebar.render(app, mod, ".redsquare-sidebar-observer");


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

module.exports = RedSquareSidebar;


