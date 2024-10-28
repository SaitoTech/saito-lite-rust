var ModTemplate = require('../../lib/templates/modtemplate');
const Transaction = require('../../lib/saito/transaction').default;


class Tutorial05 extends ModTemplate {

  constructor(app) {

    super(app);

    this.name            = "Tutorial05";
    this.slug            = "tutorial05";
    this.description     = "CSS Injection";
    this.categories       = 'Dev educational';
    return this;

  }

  respondTo(type = '', obj) {

    let this_mod = this;


    if (type === 'user-menu') {
      return [{
        text: `Tutorial05 User Menu`,
        icon: 'fa-solid fa-5',
        callback: function (app, publicKey) {
	  if (app.BROWSER) { alert("Clicked!"); }
	}
      }];
    }

    if (type === 'saito-header') {
      return [
	{
          text: 'Tutorial05',
          icon: 'fa-solid fa-5',
          rank: 10,
          callback: function (app, id) { alert("Tutorial05 Header Menu"); },
	}
      ];
    }

    if (type == 'saito-floating-menu') {
      return [
        {
          text: 'Tutorial05',
          icon: 'fa-solid fa-5',
          callback: function (app, id) { alert("Tutorial05 Floating Menu"); }
	}
      ]
    }            

    return null;
  }

}

module.exports = Tutorial05;


