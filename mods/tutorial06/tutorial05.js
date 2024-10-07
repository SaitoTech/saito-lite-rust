var ModTemplate = require('../../lib/templates/modtemplate');
const Transaction = require('../../lib/saito/transaction').default;


class Tutorial06 extends ModTemplate {

  constructor(app) {

    super(app);

    this.name            = "Tutorial06";
    this.slug            = "tutorial06";
    this.description     = "CSS Injection";
    this.categories      = 'Dev';
    return this;

  }

  respondTo(type = '', obj) {

    let this_mod = this;


    if (type === 'user-menu') {
      return [{
        text: `Tutorial06 User Menu`,
        icon: 'fa-solid fa-5',
        callback: function (app, publicKey) {
	  if (app.BROWSER) { alert("Clicked!"); }
	}
      }];
    }

    if (type === 'saito-header') {
      return [
	{
          text: 'Tutorial06',
          icon: 'fa-solid fa-5',
          rank: 10,
          callback: function (app, id) { alert("Tutorial06 Header Menu"); },
	}
      ];
    }

    if (type == 'saito-floating-menu') {
      return [
        {
          text: 'Tutorial06',
          icon: 'fa-solid fa-5',
          callback: function (app, id) { alert("Tutorial06 Floating Menu"); }
	}
      ]
    }            

    return null;
  }

}

module.exports = Tutorial06;


