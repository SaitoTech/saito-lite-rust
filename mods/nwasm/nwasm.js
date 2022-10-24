const GameTemplate = require('./../../lib/templates/gametemplate');

class Nwasm extends GameTemplate {

  constructor(app) {
    super(app);

    this.app = app;
    this.name = "Nwasm";

    this.gamename = "Nintendo";
    this.description = "The Saito N64 module provides a user-friendly digital-rights management system that allows you to backup and play the N64 games you own directly in your browser. Game files are encrypted so only you can access them and uploaded for storage to the cloud.";
    this.categories = "Games Entertainment";

    this.maxPlayers      = 1;
    this.minPlayers      = 1;

    return this;
  }

}

module.exports = Nwasm;


