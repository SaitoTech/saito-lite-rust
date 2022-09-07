const ObserverSidebarDetails = require("./observer-sidebar-details.template");

module.exports = RedSquareObserverSidebarTemplate = (app, mod) => {

	let obs_mod = app.modules.returnModule("Observer");
	let html = "";

	if (obs_mod){
	  html = `<div id="rs_sidebar_observer" class="observer_sidebar">${ObserverSidebarDetails(app, mod, obs_mod.games)}</div>`;
	}
  return html;
};

