module.exports = RedSquareObserverSidebarTemplate = (app, mod) => {

	let obs_mod = app.modules.returnModule("Observer");
	let html = "";

	if (obs_mod){
	  html = `<div>Observer games</div>`;
	}
  return html;
};

