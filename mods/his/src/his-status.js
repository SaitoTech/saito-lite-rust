
  /* override default */
/* -- disablingwhen adding back button, deleteif OK
  updateStatus(str, force = 0) {

console.log("override default-- update status");

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

      if (this.useCardbox) {
	this.cardbox.attachCardboxEvents();
      }


    } catch (err) {
      console.warn("Error Updating Status: ignoring: " + err);
    }
  } 
*/


