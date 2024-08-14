const DreamControlTemplate = require("./lite-dream-controls.template");
const SaitoOverlay = require('./../../../lib/saito/ui/saito-overlay/saito-overlay');
const SaitoProfile = require('./../../../lib/saito/ui/saito-profile/saito-profile');
const SaitoUser = require('./../../../lib/saito/ui/saito-user/saito-user');

class DreamControls{
	constructor(app, mod, options = {}) {
		this.app = app;
		this.mod = mod;
		this.options = options;
		this.timer_interval = null;
		this.overlay = new SaitoOverlay(app, mod);
    this.profile = new SaitoProfile(app, mod, '.limbo-floating-overlay');
    this.profile.tab_container = ".limbo-floating-overlay .saito-modal-content";

		this.startTime = new Date().getTime();

		this.callbacks = {};

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

		//
		// This should add the feeds for new speakers joining a streaming videocall...
		//
		app.connection.on('stun-track-event', (peerId, event) => {
			if (this.mod.publicKey === this.mod.dreamer){
			 	console.log("I, the dreamer, get a new stun peer -- " + peerId);
			 					
			 	console.log(event.track);

			 	if (this.mod.dreams[this.mod.dreamer].speakers.includes(peerId)) {
			 		
			 		console.log("The stun peer is a speaker");

			 		if (this.mod.externalMediaControl?.stopStreamingVideoCall){
			 			console.log("Ignore track because screenrecorder should get it");
			 			return;
			 		}

					let muted = this.mod.dreams[this.mod.dreamer].muted;
					
					if (event.track.kind == "audio") {

			 			console.log("Manually add the (audio) tracks to the combined stream, muted: ",muted);
						//let newTrack = event.track.clone();
						//if (muted){
						//		newTrack.enabled = false;
						//}
						//this.mod.processTrack(newTrack);

			 			const incomingStream = new MediaStream();
			 			incomingStream.addTrack(event.track);

						let otherAudio = this.mod.audioContext.createMediaStreamSource(incomingStream);
						otherAudio.connect(this.mod.audioMixer);

					}			
		 		}
			}
		});

		app.connection.on('peer-toggle-audio-status', (obj) => {
			let { public_key, enabled } = obj;
			
			/*console.log("Peer Audio Toggled", public_key, enabled);
			if (this.mod.localStream){
				console.log("Local Tracks: ");
				this.mod.localStream.getTracks().forEach(track => console.log(track));
			}

			if (this.mod.additionalSources){
				console.log("Remote Tracks: ");
				this.mod.additionalSources.forEach((values, keys) => { 
					console.log(keys);
					values.remoteStream.getTracks().forEach(track => console.log(track));
				});

			}

			if (this.mod.combinedStream){
				console.log("Outputted Tracks: ");
				this.mod.combinedStream.getTracks().forEach(track => console.log(track));
			}*/

		});


		this.app.connection.on('saito-limbo-add-yt-icon', (obj = {}) => {
			this.addDreamControls();
		});

	}

	render() {
		if (!document.getElementById("dream-controls")){
			this.app.browser.addElementToDom(DreamControlTemplate(this.app, this.mod, (this.options.mode !== "audio")));
			this.app.browser.makeDraggable("dream-controls");

		}

		this.attachEvents();

		//Tell PeerManager to pause streams for green room
		this.app.connection.emit('limbo-toggle-audio');
		this.app.connection.emit('limbo-toggle-video');

		if (!document.querySelector('.dream-controls-menu-item')) {
			this.app.connection.emit('saito-limbo-add-yt-icon');
		}
	}


	addDreamControls() {
		
		if (document.querySelector('.fa-youtube') != null) {
			return;
		}

		let this_self = this;
		let mods = this.app.modules.respondTo('dream-controls');

		let index = 0;
		let menu_entries = [];
		for (const mod of mods) {
			let item = mod.respondTo('dream-controls');

			console.log('item: ', item);
			console.log('item instanceof Array', item instanceof Array);

			if (item instanceof Array) {
				item.forEach((j) => {
					if (!j.rank) {
						j.rank = 100;
					}
					menu_entries.push(j);
				});
			}
		}
		let menu_sort = function (a, b) {
			if (a.rank < b.rank) {
				return -1;
			}
			if (a.rank > b.rank) {
				return 1;
			}
			return 0;
		};
		menu_entries = menu_entries.sort(menu_sort);

		for (let i = 0; i < menu_entries.length; i++) {
			let j = menu_entries[i];
			let show_me = true;
			let active_mod = this.app.modules.returnActiveModule();
			if (typeof j.disallowed_mods != 'undefined') {
				if (j.disallowed_mods.includes(active_mod.slug)) {
					show_me = false;
				}
			}
			if (typeof j.allowed_mods != 'undefined') {
				show_me = false;
				if (j.allowed_mods.includes(active_mod.slug)) {
					show_me = true;
				}
			}
			if (show_me) {
				let id = `dream_controls_menu_item_${index}`;
				this_self.callbacks[index] = j.callback;
				this_self.addDreamControlsItem(j, id, index);
				index++;
			}
		}

		if (document.querySelectorAll('.dream-controls-menu-item')) {
			document.querySelectorAll('.dream-controls-menu-item').forEach((menu) => {

				let id = menu.getAttribute('id');
				let data_id = menu.getAttribute('data-id');
				let callback = this_self.callbacks[data_id];

				console.log("data_id //////////", data_id);

				menu.onclick = (e) => {
					e.preventDefault();
					callback(this_self.app, data_id, this.mod.combinedStream);
				};
			});
		}

		// this.attachEvents()
	}

	addDreamControlsItem(item, id, index) {

		console.log('inside addDreamControlsItem');
		let html = `
      <div id="${id}" data-id="${index}" class="dream-controls-menu-item icon_click_area">
        <i class="${item.icon}"></i>
      </div>
    `;

    document.querySelector(`#dream-controls .control-panel .control-list`).insertAdjacentHTML('beforeend', html);

    // append as second last child
    // keeping close (X) icon as last
    // let list = document.querySelector('#dream-controls .control-panel .control-list');
    // let c = list.children;

    // c[c.length - 2].after(html);

//    document.querySelector(`#dream-controls .control-panel .control-list:nth-child(${c.length-1})`).after(html);
	}


	remove(){
		this.stopTimer();
		if (document.getElementById("dream-controls")){
			document.getElementById("dream-controls").remove();
		}
	}

	attachEvents(){
		let this_self = this;
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
				this.app.connection.emit('limbo-update-status');

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
				this.overlay.show(`<div class="limbo-floating-overlay"><div class="saito-modal-content hide-scrollbar"></div></div>`);

				let dreamer = this.mod.dreamer;
				let dreamKey = this.mod.dreams[dreamer]?.alt_id || dreamer;

	      this.profile.reset(dreamKey, "attendees", ["attendees"]);

	      if (this.mod.dreams[dreamer]?.alt_id) {
	        this.profile.mask_key = true;
	      }

	      if (this.mod.dreams[dreamer]?.identifier){
	        this.profile.name = this.mod.dreams[dreamer].identifier;
	      }

	      if (this.mod.dreams[dreamer]?.description){
	        this.profile.description = this.mod.dreams[dreamer].description;
	      }

	      console.log(this.mod.dreams[dreamer]?.mode);

		    if (this.mod.dreams[dreamer]?.mode && this.mod[`${this.mod.dreams[dreamer].mode}_icon`]){
		    	this.profile.icon = `<i class="saito-overlaid-icon fa-solid ${this.mod[`${this.mod.dreams[dreamer].mode}_icon`]}"></i>`;	
		    }

	      //
	      // Build audience lists
	      //

	      for (let m of this.mod.dreams[dreamer].members) {

	        let name = m;
	        if (m == this.app.keychain.returnIdentifierByPublicKey(m, true)) {
	          name = '';
	        }

	        let user = new SaitoUser(this.app, this.mod, this.profile.tab_container, m, name);
	        user.extra_classes = "saito-add-user-menu saito-contact";
	        
	        if (m == dreamer) {
	          user.icon = `<i class="saito-overlaid-icon fa-solid fa-hat-wizard"></i>`;
	        } 
	        
	        this.profile.menu.attendees.push(user);  
	        
	      }

	      this.profile.render();
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

