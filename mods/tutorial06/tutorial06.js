var ModTemplate = require('../../lib/templates/modtemplate');
const CssInjection = require('./lib/css.template');


class Tutorial06 extends ModTemplate {

  constructor(app) {

    super(app);

    this.name            = "Tutorial06";
    this.slug            = "tutorial06";
    this.description     = "CSS Injection";
    this.categories      = 'Dev';

    this.injected_yet    = false;

    return this;
	
  }

  initialize(app) {

    let style = document.createElement('style');
    style.textContent = CssInjection();
    document.head.appendChild(style);

  }

}

module.exports = Tutorial06;


