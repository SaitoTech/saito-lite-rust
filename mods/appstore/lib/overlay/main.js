const AppStoreOverlayTemplate = require('./main.template.js');
const SaitoOverlay = require('./../../../../lib/saito/new-ui/saito-overlay/saito-overlay');
const AppstoreAppDetails = require('./details.js');
const AppBoxTemplate = require('./appbox.template.js');
const JSON = require('json-bigint');

class AppStoreOverlay {

  constructor(app, mod) {
    this.app = app;
    this.overlay = new SaitoOverlay(app);
  }

  render(app, mod, search_options={}) {

    this.overlay.show(app, mod, AppStoreOverlayTemplate(app, mod, search_options));

    mod.searchForApps(search_options, function(rows) {

      let installed_apps = [];
      if (app.options.modules) {
        for (let i = 0; i < app.options.modules.length; i++) {
          installed_apps.push(app.options.modules[i].name);
        }
      }

      for (let z = 0; z < rows.length; z++) {
        if (installed_apps.includes(rows[z].name) || rows[z].name == "name" || rows[z].name == "Unknown") {
          rows.splice(z, 1);
          z--;
        }
      }

console.log("WHAT APPS ARE LEFT? ");
console.log(JSON.stringify(rows));

      //
      //
      //
      document.querySelector(".appstore-overlay-apps").innerHTML = "";
      for (let i = 0; i < rows.length; i++) {
        app.browser.addElementToSelector(AppBoxTemplate(app, mod, rows[i]), ".appstore-overlay-apps");
      }

      //
      // install module (button)
      //
      Array.from(document.getElementsByClassName("saito-module-install-button")).forEach(installbtn => {
        installbtn.onclick = (e) => {
alert("clicked install");

console.log("current target: " + e.currentTarget.id);

          // appbox is 3 above us
          let module_obj = JSON.parse(app.crypto.base64ToString(e.currentTarget.parentElement.parentElement.parentElement.id));
	  module_obj.image = e.currentTarget.parentElement.parentElement.style.background;

alert("clicked install 2");

console.log("about to render app details... 1");
          AppstoreAppDetails.render(app, mod, module_obj);
console.log("about to render app details... 2");
          AppstoreAppDetails.attachEvents(app, mod, module_obj);
console.log("about to render app details... 3");

	};
      });
    })
  };


  attachEvents(app, mod) {

    search_self = this;


/****
    //
    // install module (button)
    //
    Array.from(document.getElementsByClassName("appstore-app-install-btn")).forEach(installbtn => {
      installbtn.onclick = (e) => {
        let module_obj = JSON.parse(app.crypto.base64ToString(e.currentTarget.id));
        data.module = module_obj;
        AppStoreAppDetails.render(app, data);
        AppStoreAppDetails.attachEvents(app, data);
      };
    });

    //
    // search box
    //
    document.getElementById('appstore-search-box').addEventListener('focus', (e) => {
      e.currentTarget.placeholder = "";
      e.currentTarget.value = "";
    });

    //
    // developers overlay
    //
//    document.querySelector('.appstore-overlay-developers').onclick = (e) => {
//      window.location = "https://org.saito.tech/developers";
//      return false;
//    };

    //
    // search
    //
    document.getElementById('appstore-search-box').addEventListener('keypress', (e) => {
      let key = e.which || e.keyCode;
      if (key === 13) {
	try {
          document.querySelector(".appstore-overlay-grid").innerHTML = '<div class="game-loader-spinner loader" id="game-loader-spinner"></div>';
	} catch (err) {}
	let options = { search : e.currentTarget.value , category : "" , featured : 0 };
	search_self.render(app, mod, options);	
	search_self.attachEvents(app, mod);	
      }
    });
******/

  }

}

module.exports = AppStoreOverlay;

