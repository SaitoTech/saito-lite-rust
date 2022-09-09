const RedSquareSidebarTemplate = require("./sidebar.template");
const SaitoCalendar = require("./../../../../lib/saito/new-ui/saito-calendar/saito-calendar");
const RedSquareLeagueSidebar = require("./league/league-sidebar");
const RedSquareObserverSidebar = require("./observer/observer-sidebar");

class RedSquareSidebar {

  constructor(app, mod, selector="") {
    this.name = "RedSquareSidebar";
    this.mod = mod;
    this.selector = selector;

    app.connection.on("observer-list-update-request", (games)=>{   
      let observer_sidebar = new RedSquareObserverSidebar(app, mod);
      observer_sidebar.games = games;
      observer_sidebar.render(app, mod, ".redsquare-sidebar-observer");
    });
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

    let sidebar_calendar = new SaitoCalendar(app, mod);
    sidebar_calendar.render(app, mod, ".redsquare-sidebar-calendar");

    let league_sidebar = new RedSquareLeagueSidebar(app, mod);
    league_sidebar.render(app, mod, ".redsquare-sidebar-league");

    let observer_sidebar = new RedSquareObserverSidebar(app, mod, []);
    observer_sidebar.render(app, mod, ".redsquare-sidebar-observer");


    this.attachEvents(app, mod);

  }

  attachEvents(app, mod) {
    

  } 

}

module.exports = RedSquareSidebar;


