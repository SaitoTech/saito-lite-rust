const LeagueWizardTemplate = require('./league-wizard.template');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');


class LeagueWizard {

  constructor(app, mod, game_mod) {

    this.app = app;
    this.mod = mod;
    this.game_mod = game_mod;
    this.overlay = new SaitoOverlay(app);

    this.app.connection.on("league-launch-wizard", (game_mod = {}) => {
      if (!game_mod){ console.log("No game module to launch league wizard"); return;}
      this.game_mod = game_mod;
      this.render();
    });

  }

  render() {
    this.overlay.show(LeagueWizardTemplate(this.app, this.mod, this.game_mod));
    this.attachEvents();
  }

  attachEvents(){

    Array.from(document.querySelectorAll(".game-invite-btn")).forEach((gameButton) => {
      gameButton.addEventListener("click", async (e) => {

        e.stopPropagation();

        let title = document.getElementById("league-name").innerHTML;
        let desc = document.getElementById("league-desc").innerHTML;
	let status = document.querySelector(".league-wizard-status-select").value;

        //
        // id TEXT PRIMARY KEY <--- TX SIG
        // game TEXT,
        // name TEXT,
        // admin TEXT,
        // status TEXT,
        // description TEXT,
        // ranking_algorithm TEXT,
        // default_score INTEGER,
        //
        let obj = {
          game: this.game_mod.name ,
          name: title ,
          admin: this.app.wallet.returnPublicKey() ,
	  status: status ,
          description: desc ,
          ranking_algorithm: "ELO" ,
          default_score: 1500 ,
        };

        let newtx = this.mod.createCreateTransaction(obj);
	this.app.network.propagateTransaction(newtx);

	//
	// and add the league
	//
	let txmsg = newtx.returnMessage();
	txmsg.id = newtx.transaction.sig;
	this.mod.addLeague(txmsg);
	this.app.connection.emit("leagues-render-request");

        this.overlay.remove();

        return false;
      });
    });
  
  }


  validateLeague(){

    let title = document.getElementById("league-name").innerHTML;
    let desc = document.getElementById("league-desc").innerHTML;

    if (!title || !title.innerHTML || title.innerHTML == title.getAttribute("data-placeholder")){
      alert("Your league must have a name");
      return false;
    }

    if (!desc || !desc.innerHTML || desc.innerHTML == desc.getAttribute("data-placeholder")){
      alert("Your league must have a description");
      return false;
    }

    return true;
  }

}

module.exports = LeagueWizard;


