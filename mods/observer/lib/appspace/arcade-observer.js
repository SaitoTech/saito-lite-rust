const ArcadeObserverTemplate = require('./arcade-observer.template');

class ArcadeObserver{
	constructor(app, observable_game){
		this.app = app;
		this.observer = observable_game;
	}

	render(app, mod, elem_id){
      app.browser.addElementToId(ArcadeObserverTemplate(app,mod,this.observer),elem_id);
      this.attachEvents(app, mod);
	}

	attachEvents(app, mod){
		let ao_self = this;
		let game_id = this.observer.game_id;
		let invite = document.getElementById(`observe-${game_id}`);
		if (invite){
			invite.querySelector(".observe-game-btn").onclick = async function (e) {
				let game_cmd = e.currentTarget.getAttribute("data-cmd");
		        let game_id2 = e.currentTarget.getAttribute("data-sig");
		        //app.crypto.stringToBase64(JSON.stringify(observe))
		        if (game_cmd === "watch" && game_id === game_id2) {
		          let choice = await ao_self.promptObserveMode();
		          if (choice >= 0){
  		          	mod.observeGame(game_id, choice);
		          }
		          return;
		        }		
			}
		}
	}

	async promptObserveMode(){
      return new Promise((resolve, reject) => {
	      var wrapper = document.createElement("div");
	      wrapper.id = "alert-wrapper";
	      var html = `<div id="alert-shim">
	      				<div id="alert-box">
	      					<p class="alert-message">Would you like to watch the game from the beginning or fast-forward to the latest game state?</p>
	      					<div id="alert-buttons">
	      						<button id="alert-cancel">Cancel</button>
	      						<button id="beginning">Beginning</button>
	      						<button id="alert-ok">Latest</button>
	      					</div>
	      				</div>
	      			  </div>`;
	      wrapper.innerHTML = sanitize(html);
	      document.body.appendChild(wrapper);
	      setTimeout(() => {
	        document.getElementById("alert-box").style.top = "0";
	      }, 100);
	      document.getElementById("alert-ok").focus();

	      document.getElementById("alert-shim").onclick = (event) => {
	        if (event.keyCode === 13) {
	          event.preventDefault();
	          document.getElementById("alert-ok").click();
	        }
	      };
	      document.getElementById("alert-ok").onclick = () => {
	        wrapper.remove();
	        resolve(1);
	      };
	      document.getElementById("beginning").onclick = () => {
	        wrapper.remove();
	        resolve(0);
	      };

	      document.getElementById("alert-cancel").onclick = () => {
	        wrapper.remove();
	        resolve(-1);
	      };
      });

	}
}

module.exports = ArcadeObserver;