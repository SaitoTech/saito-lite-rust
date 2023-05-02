const AppStoreAppspaceTemplate = require("./main.template");
const AppStorePublishSuccess = require("./success");
const AppStoreOverlay = require("./../overlay/main");

class AppStoreAppspace {
  constructor(app, mod) {
    this.app = app;
  }

  render(app, mod) {
    document.querySelector(".appspace").innerHTML = AppStoreAppspaceTemplate();
    this.attachEvents(app, mod);
  }

  attachEvents(app, mod) {
    mod.data = {};
    mod.data.publish = {};

    let appstore_self = this;

    app.browser.addDragAndDropFileUploadToElement(
      "appstore-publish-inner",
      function (fileres) {
        this.files = [];
        this.files.push(fileres);
        mod.data.publish.zip = fileres;
        mod.data.publish.zip = mod.data.publish.zip.substring(28);
        document.querySelector(".submit-file-btn-box").style.display = "block";
      },
      true
    );

    document.querySelector("#appstore-install-button").onclick = (e) => {
      let search_options = { featured: 1 };
      let overlay = new AppStoreOverlay(app, mod);
      overlay.render(app, mod, search_options);
      try {
        let obj = document.querySelector(".appstore-header-featured");
        obj.style.display = "block";
      } catch (err) {}
    };

    document.getElementById("appstore-publish").onchange = async function (e) {
      let selectedFile = this.files[0];
      if (selectedFile.type !== "application/zip") {
        salert("Incorrect File Type, please submit a zip file");
        return;
      } else {
        var base64_reader = new FileReader();
        base64_reader.readAsDataURL(selectedFile);
      }

      base64_reader.onload = function () {
        mod.data.publish.zip = base64_reader.result;
        // remove "data:application/zip;base64," from head of string
        mod.data.publish.zip = data.publish.zip.substring(28);
        try {
          document.querySelector(".submit-file-btn-box").style.display = "block";
        } catch (err) {
          alert("Error making submit button visible!");
        }
      };
    };

    document.getElementById("appstore-publish-form").onsubmit = async (e) => {
      e.preventDefault();

      if (mod.data.publish.zip) {
        await mod.sendSubmitModuleTransaction(app, mod, mod.data);
        mod.uploading_application_id = app.crypto.hash(newtx.timestamp + "-" + newtx.signature);

        AppStorePublishSuccess.render(app, mod);
        AppStorePublishSuccess.attachEvents(app, mod);
      } else {
        salert("Please attach a zip file of your module");
      }
    };
  }
}

module.exports = AppStoreAppspace;
