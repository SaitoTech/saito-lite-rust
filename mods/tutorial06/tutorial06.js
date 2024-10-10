var ModTemplate = require('../../lib/templates/modtemplate');
const CssInjection = require('./lib/css.template');

const SaitoOverlay = require('./../../lib/saito/ui/saito-overlay/saito-overlay');
const myOverlay = require('./lib/myOverlay.template');

class Tutorial06 extends ModTemplate {

  constructor(app, mod) {

    super(app);

    this.name            = "Tutorial06";
    this.slug            = "tutorial06";
    this.description     = "CSS Injection";
    this.categories      = 'Dev';

    this.injected_yet    = false;

    this.app = app;
    this.mod = mod;
    this.overlay = new SaitoOverlay(app, mod);

    return this;
  }

  initialize(app) {

    // CSS Injection
    let style = document.createElement('style');
    style.textContent = CssInjection();
    document.head.appendChild(style);

    // Application Overlay
    this.overlay.show(MyOverlayTemplate(this.app, this.mod));

  }
}

module.exports = Tutorial06;

