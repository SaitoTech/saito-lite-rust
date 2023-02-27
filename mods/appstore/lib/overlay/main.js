const AppStoreOverlayTemplate = require('./main.template.js');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');
const AppstoreAppDetails = require('./details.js');
const SaitoModuleImageBoxTemplate = require('./../../../../lib/saito/new-ui/templates/saito-module-imagebox.template.js');
const JSON = require('json-bigint');

class AppStoreOverlay {

  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.overlay = new SaitoOverlay(app);
    mod.overlay = this.overlay;
  }

  render(search_options={}) {

    let app = this.app;
    let mod = this.mod;

    this.overlay.show(AppStoreOverlayTemplate(app, mod, search_options));

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

      //
      //
      //
      document.querySelector(".appstore-overlay-apps").innerHTML = "";
      for (let i = 0; i < rows.length; i++){
	let approw = rows[i];
        let base64msg = app.crypto.stringToBase64(JSON.stringify({ name : approw.name , description : approw.description , unixtime : approw.unixtime , publickey : approw.publickey , version : approw.version , bsh : approw.bsh , bid : approw.bid }));
        app.browser.addElementToSelector(SaitoModuleImageBoxTemplate(rows[i].name, "/saito/img/dreamscape.png", base64msg, "install"), ".appstore-overlay-apps");
      }

      //
      // install module (button)
      //
      Array.from(document.getElementsByClassName("saito-module-imagebox-button")).forEach(installbtn => {
        installbtn.onclick = (e) => {

          // appbox is 3 above us
          let module_obj = JSON.parse(app.crypto.base64ToString(e.currentTarget.getAttribute("data-id")));
          let img = e.currentTarget.parentElement.parentElement.style.background;
	      img = img.substring(5);
              img = img.substring(0, img.indexOf('")')-1);
          module_obj.image = img;

          AppstoreAppDetails.render(app, mod, module_obj);
          AppstoreAppDetails.attachEvents(app, mod, module_obj);

	};
      });
    })
  };


  attachEvents() {

    search_self = this;

/****
    //
    // install module (button)
    //
    Array.from(document.getElementsByClassName("appstore-app-install-btn")).forEach(installbtn => {
      installbtn.onclick = (e) => {
        let module_obj = JSON.parse(installbtn.getAttribute("data-id"));
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

