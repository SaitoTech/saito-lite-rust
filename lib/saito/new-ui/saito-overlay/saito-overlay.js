const SaitoOverlayTemplate = require("./saito-overlay.template");

/**
 * Generic class for creating an overlay (i.e. a popup box for information or interaction)
 * A callback can be associated with closing the overlay
 * By default, a close button is included
 */
class SaitoOverlay {
  /**
   * @constructor
   * @param app - the Saito Application
   * @param withCloseBox - a flag (default = true) to have a close button in the corner of the overlay
   */
  constructor(app, withCloseBox = true) {
    this.app = app;
    this.ordinal = "";
    this.closebox = withCloseBox;
  }

  /**
   * Create the DOM elements if they don't exist. Called by show
   * @param app - the Saito Application
   * @param mod - the calling module
   */
  render(app, mod) {
    if (this.ordinal === "") {
      if (document.querySelector(".saito-overlay-backdrop")) {
	for (let i = 1; i < 100; i++) {
	  let qs = `.saito-overlay-backdrop${i}`;
	  if (!document.querySelector(qs)) {
	    this.ordinal = i;
	    break;
	  }
	}
      }
    }
    let qs = `.saito-overlay-backdrop${this.ordinal}`;
    if (!document.querySelector(qs)) {
      this.app.browser.addElementToDom(SaitoOverlayTemplate(this.ordinal));
    }
  }

  /**
   * Does nothing
   * @param app - the Saito Application
   * @param mod - the calling module
   */
  attachEvents(app, mod) {}

  /**
   * Renders the Overlay with the given html and attaches events to close it
   * @param app - the Saito application
   * @param mod - the calling module
   * @param html - the content for the overlay
   * @param mycallback - a function to run when the user closes the overlay
   *
   */
  show(app, mod, html, mycallback = null) {

    this.render(app, mod);

    let overlay_self = this;

    let elsq = `.saito-overlay${this.ordinal}`;
    let bdelsq = `.saito-overlay-backdrop${this.ordinal}`;

    let overlay_el = document.querySelector(elsq);
    let overlay_backdrop_el = document.querySelector(bdelsq);

    try {
      overlay_el.style.display = "block";
      overlay_backdrop_el.style.display = "block";

      if (this.closebox) {
        overlay_el.innerHTML =
          `<div id="saito-overlay-closebox${this.ordinal}" class="saito-overlay-closebox saito-overlay-closebox${this.ordinal}"><i class="fas fa-times-circle saito-overlay-closebox-btn"></i></div>` +
          html;
        //Close by clicking on closebox
        let closebox_qs = `#saito-overlay-closebox${this.ordinal}`;
        let closebox_el = document.querySelector(closebox_qs);
        closebox_el.onclick = (e) => {
          overlay_self.hide(mycallback);
        };
      } else {
        overlay_el.innerHTML = html;
      }

      overlay_backdrop_el.onclick = (e) => {
        overlay_self.hide(mycallback);
      };
    } catch (err) {
      console.error("OVERLAY ERROR:", err);
    }
  }

  /**
   * Hide all the overlay elements from view
   * @param mycallback - a function to run on completion
   */
  hide(mycallback = null) {

    let elsq = `.saito-overlay${this.ordinal}`;
    let bdelsq = `.saito-overlay-backdrop${this.ordinal}`;

    let overlay_el = document.querySelector(elsq);
    let overlay_backdrop_el = document.querySelector(bdelsq);

    if (overlay_el) {
      overlay_el.style.display = "none";
    }
    if (overlay_backdrop_el) {
      overlay_backdrop_el.style.display = "none";
    }

    if (mycallback != null) {
      mycallback();
    }
  }

  /**
   * Backwards compatible show function
   * @param app - the Saito application
   * @param mod - the calling module
   * @param html - the content for the overlay
   * @param mycallback - a function to run when the user closes the overlay
   *
   */
  showOverlay(app, mod, html, mycallback = null) {
    this.show(app, mod, html, mycallback);
  }

  /**
   * Backwards compatible hide functino
   * @param mycallback - a function to run on completion
   */
  hideOverlay(mycallback = null) {
    this.hide();
  }
}
module.exports = SaitoOverlay;
