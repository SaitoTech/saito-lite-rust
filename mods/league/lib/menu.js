const LeagueMenuTemplate = require("./menu.template");
const InvitationLink = require("./overlays/league-invitation-link");

class LeagueMenu {

  constructor(app, mod, container="", league) {

    this.app = app;
    this.mod = mod;
    this.container = container;
    this.league = league;

  }

  render() {

    if (!document.getElementById(this.league.id)) {
      this.app.browser.addElementToId(LeagueMenuTemplate(this.app, this.mod, this.league));
    } else {
      this.app.browser.replaceElementById(LeagueMenuTemplate(this.app, this.mod, this.league));
    }

    this.attachEvents();

  }

  attachEvents() {

    try {
      document.querySelector(".league-join-button").onclick = (e) => {
        this.mod.sendJoinTransaction(this.league.id);
      }
    } catch (err) {}

    try {
      document.querySelector(".league-view-button").onclick = (e) => {
        this.app.connection.emit("view-league-details", this.league.id);
      }
    } catch (err) {}

    try {
      document.querySelector(".league-invite-button").onclick = (e) => {
        this.invitation_link = new InvitationLink(this.app, this.mod, this.league);
        this.invitation_link.render();
      }
    } catch (err) {}

    try {
      document.querySelector(".league-delete-button").onclick = async (e) => {
        let confirm = await sconfirm("Are you sure you want to delete this league?");
        if (confirm) { 
	  let newtx = this.mod.createRemoveTransaction(this.league.id); 
	  this.app.network.propagateTransaction(newtx);
	  this.removeLeague(this.league.id);
	  this.app.connection.emit("leagues-render-request");
	}
      }
    } catch (err) {}

  }
}

module.exports = LeagueMenu;


