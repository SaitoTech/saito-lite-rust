const AppstoreAppDetailsTemplate = require("./details.template.js");

module.exports = AppstoreAppDetails = {
  render(app, mod, data) {
    document.querySelector(".appstore-overlay").innerHTML = AppstoreAppDetailsTemplate(
      app,
      mod,
      data
    );
    this.attachEvents(app, mod, data);
  },

  attachEvents(app, mod, data) {
    // data is module = dm
    let dm = data;

    document.querySelector(".appstore-install-confirm-button").onclick = () => {
      //remove close event on shim until finished.
      document.querySelector(".saito-overlay-closebox-btn").remove();
      document.querySelector(".saito-overlay-closebox").remove();
      document.querySelector(".saito-overlay-backdrop").onclick = (e) => {};

      let module_list = [];
      module_list.push(dm);

      let dmname = dm.name;

      let mods_to_include = [];
      if (app.options.modules) {
        mods_to_include = app.options.modules;
      } else {
        alert("ERROR: your wallet does not report having modules. Please reset");
        return;
      }

      //
      // currently can't include a bunch of modules
      //
      for (let i = 0; i < mods_to_include.length; i++) {
        let replacing_old = 0;

        for (let z = 0; z < module_list.length; z++) {
          if (dmname != "") {
            if (module_list[z].name == mods_to_include[i].name) {
              replacing_old = 1;
            }
          }
        }

        if (replacing_old == 0) {
          module_list.push({ name: mods_to_include[i].name, version: mods_to_include[i].version });
        }
      }

      //
      //
      //
      let have_specified_appstore = 0;
      if (app.options?.appstore?.default) {
        if (app.options.appstore.default != "") {
          have_specified_appstore = 1;
        }
      }

      //
      // READY TO SUBMIT
      //
      if (have_specified_appstore) {
        if (app.network.hasPeer(app.options.appstore.default)) {
          var newtx = app.wallet.createUnsignedTransactionWithDefaultFee(
            app.options.appstore.default,
            BigInt(0)
          );
          if (newtx == null) {
            return;
          }

          newtx.msg.module = "AppStore";
          newtx.msg.request = "request bundle";
          newtx.msg.list = module_list;
          newtx = app.wallet.signTransaction(newtx);
          app.network.propagateTransaction(newtx);

          document.querySelector(".appstore-overlay").innerHTML = `
            <div class="appstore-bundler-install-notice">
              <center class="appstore-loading-text" style="margin-bottom:20px">Your custom Saito bundle is being compiled. Please do not leave this page -- estimated time to completion 60 seconds.</center>
              <center><div class="saito-loader" id="saito-loader"></div></center>
            </div>
          `;
        } else {
          document.querySelector(".appstore-overlay").innerHTML = `
            <div class="appstore-bundler-install-notice">
              <center style="margin-bottom:20pxpadding:20px;">
		Your wallet is not setup to use this AppStore. Use this AppStore? 
	        <p></p>
	        <div class="saito-button-secondary" id="appstore-compile-btn">yes please</div>
	        <p></p>
	        <div class="saito-button-secondary" id="appstore-end-compile-btn">no thanks</div>
	      </center>
            </div>
          `;

          if (!app.options.appstore) {
            app.options.appstore = {};
          }
          app.options.appstore.default = app.network.peers[0].peer.publickey;

          document.getElementById("appstore-end-compile-btn").onclick = (e) => {
            mod.overlay.hide();
          };

          document.getElementById("appstore-compile-btn").onclick = (e) => {
            document.querySelector(".appstore-bundler-install-notice").innerHTML = "Please wait...";

            app.options.appstore = {};
            app.options.appstore.default = app.network.peers[0].peer.publickey;
            app.storage.saveOptions();

            var newtx = app.wallet.createUnsignedTransactionWithDefaultFee(
              app.options.appstore.default,
              BigInt(0)
            );
            if (newtx == null) {
              return;
            }
            newtx.msg.module = "AppStore";
            newtx.msg.request = "request bundle";
            newtx.msg.list = module_list;
            newtx = app.wallet.signTransaction(newtx);
            app.network.propagateTransaction(newtx);

            document.querySelector(".appstore-overlay").innerHTML = `
               <div class="appstore-bundler-install-notice">
                 <center class="appstore-loading-text" style="margin-bottom:20px">Your custom Saito bundle is being compiled. Please do not leave this page -- estimated time to completion 60 seconds.</center>
                 <center><div class="saito-loader" id="saito-loader"></div></center>
               </div>
             `;
          };
        }
      } else {
        document.querySelector(".appstore-overlay").innerHTML = `
          <div class="appstore-bundler-install-notice">
            <center style="margin-bottom:20px">
	      Your wallet does not have a default AppStore. Use this AppStore? 
	      <p></p>
	      <div class="button" id="appstore-compile-btn">yes, compile</div>
	      <p></p>
	      <div class="button" id="appstore-end-compile-btn">no thanks</div>
	    </center>
          </div>
        `;

        document.getElementById("appstore-end-compile-btn").onclick = (e) => {
          mod.overlay.hide();
        };

        document.getElementById("appstore-compile-btn").onclick = (e) => {
          app.options.appstore = {};
          app.options.appstore.default = app.network.peers[0].peer.publickey;
          app.storage.saveOptions();

          var newtx = app.wallet.createUnsignedTransactionWithDefaultFee(
            app.options.appstore.default,
            BigInt(0)
          );
          if (newtx == null) {
            return;
          }
          newtx.msg.module = "AppStore";
          newtx.msg.request = "request bundle";
          newtx.msg.list = module_list;
          newtx = app.wallet.signTransaction(newtx);
          app.network.propagateTransaction(newtx);

          document.querySelector(".appstore-overlay").innerHTML = `
             <div class="appstore-bundler-install-notice">
               <center class="appstore-loading-text" style="margin-bottom:20px">Your custom Saito bundle is being compiled. Please do not leave this page -- estimated time to completion 60 seconds.</center>
               <center><div class="loader" id="game_spinner"></div></center>
             </div>
           `;
        };
      }
    };
  },
};

