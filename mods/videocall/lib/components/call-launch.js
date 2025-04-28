const SaitoOverlay = require('../../../../lib/saito/ui/saito-overlay/saito-overlay.js');
const StunLaunchTemplate = require('./call-launch.template.js');
const CallSetting = require('../components/call-setting.js');
const SaitoLoader = require('../../../../lib/saito/ui/saito-loader/saito-loader.js');
const CallScheduleJoin = require('./call-schedule-join.js');
const CallScheduleWizard = require('../../../../lib/saito/ui/saito-calendar/saito-schedule-wizard.js');


/**
 *
 * This is a splash screen for initiating a Saito Video call
 *
 **/

class CallLaunch {
	constructor(app, mod, container = '') {
		this.app = app;
		this.mod = mod;
		this.container = container;
		this.overlay = new SaitoOverlay(app, mod);
		this.callSetting = new CallSetting(app, mod);
		//
		//this looks a lot better if it is in the dom structure
		//
		// this.loader = new SaitoLoader(app, mod, ".stunx-appspace-splash");

		//
		// close-preview-window *also* shuts down the streams in call-settings
		//
		app.connection.on('close-preview-window', (rerender = false) => {
			this.overlay.remove();
			if (document.querySelector('.stun-appspace')) {
				document.querySelector('.stun-appspace').remove();
			}
			if (rerender) {
				this.render();
			}
		});

		app.connection.on('call-launch-enter-call', () => {
			this.enterCall()
		})
	}

	render() {
		if (document.querySelector('.stun-appspace')) {
			return;
		}

	    this.keys = this.app.keychain.returnKeys({ type: 'event', mod: 'videocall' });

	    let future = Date.now() + 15*60*1000;
	    let past = Date.now() - 15*60*1000;

	    if (this.keys.length) {
	      for (let i = this.keys.length - 1; i >= 0; i--) {
	        if (this.keys[i].startTime > future){
	          this.keys.splice(i,1);
	          continue;
	        }
	        if (this.keys[i].startTime < past ){
	          this.keys.splice(i,1);
	        }

	      }
	    }

	    if (!this.callScheduleJoin){
  			this.callScheduleJoin = new CallScheduleJoin(this.app, this.mod, this.keys);
	    }else{
	    	this.callScheduleJoin.keys = this.keys;
	    }

		if (this.container === '.saito-overlay') {
			this.overlay.show(StunLaunchTemplate(this.app, this.mod, this.keys), () => {
				//Stop the video if we close the overlay
				this.app.connection.emit('close-preview-window');
			});
		} else if (this.container === 'body') {
			this.app.browser.addElementToDom(
				StunLaunchTemplate(this.app, this.mod, this.keys)
			);
		}

		//
		// We should be able to toggle our video/audio controls
		// Do not make it a blocking loader
		//

		this.attachEvents(this.app, this.mod);

	}

	attachEvents(app, mod) {
		if (document.getElementById('createRoom')) {
			document.getElementById('createRoom').onclick = async (e) => {

				if (!this.mod.isRelayConnected) {
					siteMessage('Wait for peer connection');
					return;
				}

				//
				// I am initializing the call
				//
				if (!this.mod.room_obj) {
					await this.mod.createRoom();
				}

				console.log(this.mod.room_obj, "room object joining");
				this.enterCall()
			};
		}

		if (document.getElementById('stunx-call-settings')){
			document.getElementById('stunx-call-settings').onclick = (e) => {
				this.callSetting.render();	
			}
		}


		if (document.getElementById('createScheduleRoom')) {
			
			document.getElementById('createScheduleRoom').onclick = async (e) => {
                const callScheduleWizard = new CallScheduleWizard(this.app, this.mod)
                callScheduleWizard.callbackAfterSubmit = async (utcStartTime, duration, description = "", title = "") => {

                    //Creates public key for clal
                    const call_id = await this.mod.generateRoomId();

                    const room_obj = {
                        call_id,
                        scheduled: true,
                        call_peers: [],
                        startTime: utcStartTime, 
                        duration,
                        profile: {description}
                    };
        
                    let call_link =  this.mod.generateCallLink(room_obj)

                    this.app.keychain.addKey(call_id, { identifier: title || "Video Call", startTime:utcStartTime, duration, description, link: call_link });
        
                    this.app.connection.emit('calendar-refresh-request');
                    this.app.connection.emit('close-preview-window', true); // rerender screen

                    let event_link =  this.app.browser.createEventInviteLink(this.app.keychain.returnKey(call_id));
                    await navigator.clipboard.writeText(event_link);
                    siteMessage('Invitation link copied to clipboard', 3500);

                }

                callScheduleWizard.render()

			};
		}

		if (document.getElementById('joinScheduleRoom')) {
			document.getElementById('joinScheduleRoom').onclick = async (e) => {
				
				let s = this.callScheduleJoin.render()

				if (!s){
					document.getElementById('createRoom').click();	
				}
			};
		}


		if (document.querySelector(".stunx-precall-link")) {
			document.querySelector(".stunx-precall-link").onclick = async (e) => {
				let mode = e.currentTarget.dataset.id;
				console.log(mode);
				let call_link = "";
				if (mode == "join"){
					call_link =  this.mod.generateCallLink(this.mod.room_obj);
				}else if (mode == "create"){
					call_link = this.mod.createRoom();
				}else{
					this.callScheduleJoin.render(false);
					return;
				}

				await navigator.clipboard.writeText(call_link);
				siteMessage("Call link copied");
			}
		}
	}

	enterCall() {
		//
		// Set big screen video as desired call interface
		//

		this.app.connection.emit('stun-init-call-interface', this.callSetting.returnSettings());

		// Copy link here!
		if (this.mod.room_obj.host_public_key == this.mod.publicKey) {
			this.mod.copyInviteLink();
		}

		//
		//Close this component
		//
		this.app.connection.emit('close-preview-window');
		//
		// Start the stun call
		//
		this.app.connection.emit('start-stun-call');
	}
}

module.exports = CallLaunch;
