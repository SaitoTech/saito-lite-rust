const saito = require("./../../../../lib/saito/saito");
const ArcadeAppspaceTemplate = require('./main.template.js');
const ArcadeAppspaceGameTemplate = require('./game.template.js');
const HARDCODED_GAME_INVITE_TEMPLATE = require('./game.hardcoded.template.js');
const JSON = require("json-bigint");

class ArcadeAppspace {

  constructor(app) {
  }

  render(app, mod, container = "") {

    if (!document.querySelector(".arcade-appspace")) {
      app.browser.addElementToClass(ArcadeAppspaceTemplate(app, mod), "appspace");
    }

    app.browser.addElementToElement(HARDCODED_GAME_INVITE_TEMPLATE(app, mod, {}, 0), document.querySelector(".arcade-hero"));
    return;

    //
    // add games
    //
    if (document.querySelector(".arcade-hero")) {
      mod.games.forEach((invite, i) => {
        if (!mod.viewing_game_homepage || invite.msg.game.toLowerCase() === mod.viewing_game_homepage) {
          console.log("GAME INVITE: " + JSON.stringify(invite) + " -- " + mod.name);
          app.browser.addElementToElement(
            ArcadeAppspaceGameTemplate(app, mod, invite, i),
            document.querySelector(".arcade-hero")
          );
        }
      });
    }


    //
    // add open games from server
    //
    let existing_games = mod.games.length;
    let cutoff = new Date().getTime() - 90000000;
//    let cutoff = new Date().getTime() - 2000000;
    let sql = `SELECT * FROM games WHERE status = "open" AND created_at > ${cutoff}`;
console.log("sql: " + sql);
    mod.sendPeerDatabaseRequestWithFilter("Arcade", sql,
      (res) => {
console.log("res: " + JSON.stringify(res.rows));
        if (res.rows) {
          mod.addGamesToOpenList(
            res.rows.map((row) => {
console.log("adding open game invite!");
              return new saito.default.transaction(JSON.parse(row.tx));
            })
          );
        }
console.log("mod.games.length: " + mod.games.length);
console.log("existing_games: " + existing_games);
        if (mod.games.length > existing_games) {
	  console.log("RE-RENDERING");
	  this.render(app, mod, container);
	}
      }
    );

    this.attachEvents(app, mod);
  }



  attachEvents(app, mod) {

  }

}

module.exports = ArcadeAppspace;

