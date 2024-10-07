var ModTemplate = require('../../lib/templates/modtemplate');

class Tutorial01 extends ModTemplate {

  constructor(app) {

    super(app);

    this.name            = "Tutorial01";
    this.slug            = "tutorial01";
    this.description     = "Introductory tutorial for Saito App Development";
    this.categories       = 'Dev educational';
    return this;

  }

  async initialize(app) { 
    super.initialize(app);
    if (app.BROWSER) { alert("Hello World - Initializing Tutorial01!"); }
  }

  async render() { 
    if (document.querySelector('body')) {
       document.querySelector('body').innerHTML = "Hello World";  
    }
  }

}

module.exports = Tutorial01;


