
  /* override default */
  updateStatus(str, force = 0) {

    this.updateControls("");

    try {

      this.game.status = str;
      if (!this.browser_active) { return; }

      if (this.useHUD) {
        this.hud.updateStatus(str);
      }

      document.querySelectorAll(".status").forEach((el) => {
        el.innerHTML = str;
      });
      if (document.getElementById("status")) {
        document.getElementById("status").innerHTML = str;
      }

    } catch (err) {
      console.warn("Error Updating Status: ignoring: " + err);
    }
  } 




