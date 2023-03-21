const LeagueMenuTemplate = require("./menu.template");
const InvitationLink = require("./overlays/league-invitation-link");
const JoinLeagueOverlay = require("./overlays/join");

class LeagueMenu {

  constructor(app, mod, container="", league) {

    this.app = app;
    this.mod = mod;
    this.container = container;
    this.league = league;

  }

  render() {
    let selector = (this.container) ? `${this.container} ` : "";
    selector += `#lg${this.league.id}`;

    console.log("Rendering League on Page: ");
    console.log(JSON.parse(JSON.stringify(this.league)));

    if (document.querySelector(selector)) {
      this.app.browser.replaceElementBySelector(LeagueMenuTemplate(this.app, this.mod, this.league), selector);
    } else {
      this.app.browser.addElementToSelector(LeagueMenuTemplate(this.app, this.mod, this.league), this.container);
    }

    this.attachEvents();

  }

  attachEvents() {

    try {
      document.querySelector(`#lg${this.league.id} .league-join-button`).onclick = (e) => {
        let jlo = new JoinLeagueOverlay(app, league_self, league_id);
        jlo.render();
      }
    } catch (err) {}

    try {
      document.querySelector(`#lg${this.league.id} .league-view-button`).onclick = (e) => {
        console.log("click");
        this.app.connection.emit("league-overlay-render-request", this.league.id);
      }
    } catch (err) {}

    try {
      document.querySelector(`#lg${this.league.id} .league-invite-button`).onclick = (e) => {
        this.invitation_link = new InvitationLink(this.app, this.mod, this.league);
        this.invitation_link.render();
      }
    } catch (err) {}

    try {
      document.querySelector(`#lg${this.league.id} .league-delete-button`).onclick = async (e) => {
        let confirm = await sconfirm("Are you sure you want to delete this league?");
        if (confirm) { 
      	  let newtx = this.mod.createRemoveTransaction(this.league.id); 
      	  this.app.network.propagateTransaction(newtx);
      	  this.mod.removeLeague(this.league.id);
      	  this.app.connection.emit("leagues-render-request");
      	}
      }
    } catch (err) {}

  }
}

module.exports = LeagueMenu;


