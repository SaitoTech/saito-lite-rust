const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");
const LeagueEditorTemplate = require("./editor.template");

class LeagueEditor {
  constructor(app, mod, league_id = "") {
    this.app = app;
    this.mod = mod;
    this.league = this.mod.returnLeague(league_id);
    this.overlay = new SaitoOverlay(app, mod, false, true);
  }

  async render() {
    if (this.league == null) {
      salert(`League not found`);
      return;
    }
    if (this.league.admin) {
      if (this.league.admin !== this.app.wallet.publicKey) {
        salert("Unauthorized access!");
        return;
      }
    } else {
      let pw = await sprompt("Enter Password");
      if (
        this.app.crypto.hash(pw) !==
        "e7f69c3b4e30697e68ac57b83088f41ec47de914ad84def95c4f4b25516c39ef"
      ) {
        salert("Unauthorized access!");
        return;
      }
    }

    this.overlay.show(LeagueEditorTemplate(this.app, this.mod, this.league), () => {
      this.submitChanges();
    });

    this.attachEvents();
  }

  attachEvents() {
    if (document.querySelector(".league-edit-overlay-box .submit_btn")) {
      document.querySelector(".league-edit-overlay-box .submit_btn").onclick = () => {
        this.submitChanges();
        this.overlay.remove();
      };
    }
  }

  submitChanges() {
    let welcome = document.querySelector(".league-edit-overlay-box .welcome");
    if (welcome) {
      if (welcome.textContent !== this.league.welcome) {
        let newtx = this.mod.createUpdateTransaction(
          this.league.id,
          sanitize(welcome.textContent),
          "welcome"
        );
        this.app.network.propagateTransaction(newtx);
        this.league.welcome = sanitize(welcome.textContent);
      }
    }

    let contact = document.querySelector(".league-edit-overlay-box .contact");
    if (contact) {
      if (contact.textContent !== this.league.contact) {
        let newtx = this.mod.createUpdateTransaction(
          this.league.id,
          sanitize(contact.textContent),
          "contact"
        );
        this.app.network.propagateTransaction(newtx);
        this.league.contact = sanitize(contact.textContent);
      }
    }

    let description = document.querySelector(".league-edit-overlay-box .description");
    if (description) {
      if (description.textContent !== this.league.description) {
        let newtx = this.mod.createUpdateTransaction(
          this.league.id,
          sanitize(description.textContent),
          "description"
        );
        this.app.network.propagateTransaction(newtx);
        this.league.description = sanitize(description.textContent);
      }
    }
  }
}

module.exports = LeagueEditor;
