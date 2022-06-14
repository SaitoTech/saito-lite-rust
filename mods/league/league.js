const saito = require('./../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');
const LeagueMain = require('./lib/main/league-main');

class League extends ModTemplate {

  constructor(app) {
    super(app);

    this.name = "League";
    this.slug = "league";
    this.description = "Create leagues for installed games, both public and private. Players rankings of each league.";
    this.categories = "Games Entertainment";

    this.affix_callbacks_to = [];
    this.leagues = {};
    this.renderMode = null;
  }

  initialize(app) {
    super.initialize(app);

    console.log('inside league initialize');
    this.sendEvent('league-create-btn-render-request', {});
  }

  render(app, renderMode = "") {
    if (renderMode != "") {
      this.renderMode = renderMode;
    }

    console.log('inside league render');
    console.log('renderMode');
    console.log(renderMode);

    LeagueMain.render(app, this);
  }
}

module.exports = League;