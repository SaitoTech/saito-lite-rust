const DreamControlTemplate = require("./lite-dream-controls.template");
const ContactsList = require('./../../../lib/saito/ui/modals/saito-contacts/saito-contacts');

class DreamControls{
	constructor(app, mod, options = {}) {
		this.app = app;
		this.mod = mod;
		this.options = options;
		this.timer_interval = null;
		this.startTime = new Date().getTime();

		//Oof, I should change the name in video call (this actually refers to the hang up action)
		app.connection.on('stun-disconnect', async ()=> {
			if (this.mod?.dreamer == this.mod.publicKey){
				console.log("Quit Dream by hanging up: ", this.mod.dreams[this.mod.publicKey]);
				this.remove();
				await this.mod.sendKickTransaction(this.mod.dreams[this.mod.publicKey].speakers);
				this.mod.exitSpace();
			}
			this.remove();
		});

		//Fires every time there is limbo activity (dream starting/ending, people joining/leaving)
		app.connection.on("limbo-spaces-update", ()=>{
			let ct = 0;
			if (this.mod.dreamer && this.mod.dreams[this.mod.dreamer]){
				this.mod.dreams[this.mod.dreamer].members.forEach((mem) => {
					if (mem !== this.mod.dreamer){
						ct++;
					}
				});
				this.app.browser.addNotificationToId(ct, "dreamspace-member-count");
			}
		});

		//Videocall connections
		app.connection.on("videocall-add-party", publicKey => {
			if (this.mod.dreamer == this.mod.publicKey){
				this.mod.sendAddSpeakerTransaction(publicKey);
			}
		});

		app.connection.on("videocall-remove-party", publicKey => {
			if (this.mod.dreamer == this.mod.publicKey){
				this.mod.sendRemoveSpeakerTransaction(publicKey);
			}
		});

	}

	render() {
		if (!document.getElementById("dream-controls")){
			this.app.browser.addElementToDom(DreamControlTemplate(this.app, this.mod, (this.options.mode !== "audio")));
		}

		this.attachEvents();

		//Tell PeerManager to pause streams for green room
		this.app.connection.emit('limbo-toggle-audio');
		this.app.connection.emit('limbo-toggle-video');


		this.app.browser.makeDraggable("dream-controls");
	}

	remove(){
		this.stopTimer();
		if (document.getElementById("dream-controls")){
			document.getElementById("dream-controls").remove();
		}
	}

	attachEvents(){

		if (this.mod.dreamer){
			this.insertActions();
		}

		if (document.querySelector(".dream-controls .stream-control")){
			document.querySelector(".dream-controls .stream-control").onclick = (e) => {
				let icon = e.currentTarget.querySelector("i");
				if (icon){
					icon.classList.toggle("fa-play");
					icon.classList.toggle("fa-pause");
				}
				//Tell PeerManager to adjust streams
				this.app.connection.emit('limbo-toggle-audio');
				this.app.connection.emit('limbo-toggle-video');

				//Only necessary for first click but doesn't hurt to have
				this.startTimer(); // Start timer
				e.currentTarget.classList.remove("click-me");
			}
		}

	    if (document.querySelector('.dream-controls .share-control')){
	      document.querySelector('.dream-controls .share-control').onclick = (e) => {
	        this.mod.copyInviteLink();
	      }
	    }


		if (document.querySelector(".dream-controls .disconnect-control")){
			document.querySelector(".dream-controls .disconnect-control").onclick = async () => {
				console.log("Quit Dream: ", this.mod.dreams[this.mod.publicKey]);
				this.remove();
				await this.mod.sendKickTransaction(this.mod.dreams[this.mod.publicKey].speakers);
				this.mod.exitSpace();
			}
		}

		if (document.querySelector(".dream-controls .members-control")){
			document.querySelector(".dream-controls .members-control").onclick = () => {
				const contactList = new ContactsList(this.app, this.mod, false);
				contactList.title = "Attendees";
				contactList.render(this.mod.dreams[this.mod.dreamer].members.filter((key) => key !== this.mod.dreamer));
			}
		}

	}


	startTimer() {

		if (this.timer_interval) {
			return;
		}
		let seconds = new Date().getTime();
		seconds -= this.startTime;
		seconds = seconds / 1000;

		const timer = () => {
			let timerElement = document.querySelector('.dream-controls .counter');
			seconds++;

			// Get hours
			let hours = Math.floor(seconds / 3600);
			// Get minutes
			let minutes = Math.floor((seconds - hours * 3600) / 60);
			// Get seconds
			let secs = Math.floor(seconds % 60);

			if (hours > 0) {
				hours = `0${hours}:`;
			} else {
				hours = '';
			}
			if (minutes < 10) {
				minutes = `0${minutes}`;
			}
			if (secs < 10) {
				secs = `0${secs}`;
			}

			timerElement.innerHTML = `${hours}${minutes}:${secs}`;
		};

		this.timer_interval = setInterval(timer, 1000);
	}

	stopTimer() {
		clearInterval(this.timer_interval);
		this.timer_interval = null;
	}


  insertActions(){

    // add call icons

    let container = document.querySelector("#dream-controls .control-list");

    if (!container) {
      return;
    }

    let index = 0;

    for (const mod of this.app.modules.mods) {
      let item = mod.respondTo('limbo-actions', {
        group_name: this.mod.dreams[this.mod.dreamer].identifier || this.app.keychain.returnUsername(this.mod.dreamer) + "'s Space",
        call_id: this.mod.dreamer + "dream",
      });

      if (item instanceof Array) {
        item.forEach((j) => {
          this.createActionItem(j, container, index++);
        });
      } else if (item != null) {
        this.createActionItem(item, container, index++);
      }
    }
  }


  createActionItem(item, container, index) {

    let id = "limbo_item_" + index;
    let html = `<div id="${id}" class="icon_click_area">
            <i class="${item.icon}"></i>
          </div>`;

    const el = document.createElement('div');

    container.prepend(el);
    
    el.outerHTML = html;

    let div = document.getElementById(id);

    if (div){

      if (item?.callback){
      	
        div.onclick = () => {
          item.callback(this.app);
        };
      }else{
        console.warn("Adding an action item with no callback");
      }

      if (item.event) {
        item.event(id);
      }

    }else{
      console.warn("Item not found");
    }

  } 


}

module.exports = DreamControls;

