const GameTemplate = require('./../../lib/templates/gametemplate');

class Nwasm extends GameTemplate {

  constructor(app) {
    super(app);

    this.app = app;
    this.name = "Nwasm";

    this.gamename = "Nintendo";
    this.description = "The Saito N64 module provides a user-friendly digital-rights management system that allows you to manage and play your N64 games directly in your browser on any device that you own, complete with all of the social media features that come with every Saito module. And if you don't own any games, why not make friends on Saito RedSquare and borrow theirs to play when they are not being used.";
    this.categories = "Games Entertainment";

    this.maxPlayers      = 1;
    this.minPlayers      = 1;

    return this;
  }

}

module.exports = Nwasm;


