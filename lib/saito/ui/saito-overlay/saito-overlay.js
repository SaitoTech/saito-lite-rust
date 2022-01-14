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
    this.closebox = withCloseBox;
  }

  /**
   * Create the DOM elements if they don't exist. Called by show
   * @param app - the Saito Application
   * @param mod - the calling module
   */
  render(app, mod) {
    if (!document.querySelector(".saito-overlay-backdrop")) {
      app.browser.addElementToDom(SaitoOverlayTemplate(this.closebox));
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

    let overlay_el = document.querySelector(".saito-overlay");
    let overlay_backdrop_el = document.querySelector(".saito-overlay-backdrop");
    let closebox_el = document.querySelector(".saito-overlay-closebox");

    try {
      if (closebox_el) {
        overlay_el.innerHTML = closebox_el.outerHTML + html;
        closebox_el.style.display = "block";
        closebox_el.onclick = (e) => {
          overlay_self.hide(mycallback);
        };
      } else {
        overlay_el.innerHTML = html;
      }

      overlay_el.style.display = "block";
      overlay_backdrop_el.style.display = "block";

      overlay_backdrop_el.onclick = (e) => {
        overlay_self.hide(mycallback);
      };
    } catch (err) {
      console.error(err);
    }
  }


  /**
   * Hide all the overlay elements from view
   * @param mycallback - a function to run on completion
   */
  hide(mycallback = null) {
    let overlay_el = document.querySelector(".saito-overlay");
    let overlay_backdrop_el = document.querySelector(".saito-overlay-backdrop");
    let closebox_el = document.querySelector(".saito-overlay-closebox");
    if (overlay_el) {
      overlay_el.style.display = "none";
    }
    if (overlay_backdrop_el) {
      overlay_backdrop_el.style.display = "none";
    }
    if (closebox_el) {
      closebox_el.style.display = "none";
    }

    if (mycallback != null) {
      mycallback();
    }
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
  
module.exports = SaitoOverlay;
