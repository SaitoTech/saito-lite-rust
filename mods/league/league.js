const ModTemplate = require('../../lib/templates/modtemplate');
const LeagueMain = require('./lib/main/league-main');
const SaitoHeader = require('../../lib/saito/ui/saito-header/saito-header');

class League extends ModTemplate {

  constructor(app) {

    super(app);

    this.name = "League";
    this.slug = "league";
    this.description = "Leaderboards and leagues for Saito Games";
    this.categories = "Games Entertainment";

    this.leagues = {};

    this.header = new SaitoHeader(app);
    this.main = new LeagueMain(app);

  }


  render(app) {
    this.header.render(app, this);
    this.main.render(app, this);
  }

}

module.exports = League;

