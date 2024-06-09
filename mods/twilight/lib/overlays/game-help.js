const WelcomeTemplate = require('./welcome.template');
const GameHelpTemplate = require('./game-help.template');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');

/**
 * GameHelp is a small triangle that will show up on the bottom-left of the 
 * screen and toggle an overlay that can be filled with customized advice
 * when the user clicks on it.
 */
class GameHelp {

	/**
	 * @param app - the Saito application
	 * @param mod - reference to the game module
	 */
	constructor(app, mod) {
		this.app = app;
		this.game_mod = mod;
                this.overlay = new SaitoOverlay(this.app, this.game_mod);
		this.enabled = true;
		this.visible = true;
	}


        pullHudOverOverlay() {
                //
                // pull GAME HUD over overlay
                //
                let overlay_zindex = parseInt(this.overlay.zIndex);
                if (document.querySelector('.hud')) {
                        document.querySelector('.hud').style.zIndex = overlay_zindex + 1;
                        this.game_mod.hud.zIndex = overlay_zindex + 1;
                }
        }
        pushHudUnderOverlay() {
                //
                // push GAME HUD under overlay
                //
                let overlay_zindex = parseInt(this.overlay.zIndex);
                if (document.querySelector('.hud')) {
                        document.querySelector('.hud').style.zIndex = overlay_zindex - 2;
                        this.game_mod.hud.zIndex = overlay_zindex - 2;
                }
        }


	hide() {
	  if (this.enabled != true) { return; }
	  if (this.visible != true) { return; }
	  this.visible = false;
	  let gh = document.querySelector(".game-help");
	  if (gh) {
	    gh.classList.remove("game-help-visible");
	    gh.classList.add("game-help-hidden");
	  }
	}

	renderCustomOverlay(obj={}) {

                let twilight_self = this.game_mod;
                this.overlay.show(WelcomeTemplate());
                this.pushHudUnderOverlay();

                if (obj.title) { document.querySelector('.welcome-title').innerHTML = obj.title; }
                if (obj.text)  { document.querySelector('.welcome-text').innerHTML  = obj.text; }
                if (obj.img)   { document.querySelector('.welcome').style.backgroundImage = `url(${obj.img})`; }
                if (obj.card)  { twilight_self.app.browser.addElementToSelector(`<div class="welcome-card">${twilight_self.returnCardImage(obj.card)}<div>`, '.welcome'); }
                if (obj.styles){
                  for (let z = 0; z < obj.styles.length; z++) {
                    let s = obj.styles[z];
                    document.querySelector('.welcome').style[s.key] = s.val;
                  }
                }

                // this will clear any ACKNOWLEDGE
                this.attachEvents();

	}

	render(targs={}) {

	  this.visible = true;

	  if (this.enabled != true) { return; }
		let gh = document.querySelector(".game-help");
		if (gh) {
			gh.classList.remove("game-help-hidden");
			gh.classList.add("game-help-visible");
		} else {
			this.app.browser.addElementToDom(GameHelpTemplate(targs));
			gh = document.querySelector(".game-help");
		}
		if (targs.fontsize) {
		  document.querySelector(".game-help-text").style.fontSize = targs.fontsize;
	        }
		if (targs.color) {
		  document.querySelector(".game-help").style.background = targs.color;
		}
		if (targs.line1) {
		  document.querySelector(".game-help-text .line1").innerHTML = targs.line1;
	        }
		if (targs.line2) {
		  document.querySelector(".game-help-text .line2").innerHTML = targs.line2;
	        }
		this.attachEvents(targs);
	}


	attachEvents(targs={}) {

	  let gh = document.querySelector(".game-help");
	  gh.onclick = (e) => {
	    this.toggle();
	    this.renderCustomOverlay(targs);
	  }
	}

	toggle() {
	  let gh = document.querySelector(".game-help");
	  if (!gh.classList.contains("game-help-hidden")) {
	    this.hide();
	  } else {
	    this.render();
	  }
	}

}

module.exports = GameHelp;

