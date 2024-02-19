const saito = require('../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');

const AppSettings = require('./lib/stun-settings');

class Stun extends ModTemplate {
	constructor(app) {
		super(app);
		this.app = app;
		this.name = 'Stun';

		this.description = 'P2P Connection Module';
		this.categories = 'Utilities Communications';

		this.servers = [
			{
				urls: 'turn:stun-sf.saito.io:3478',
				username: 'guest',
				credential: 'somepassword'
			},
			{
				urls: 'turn:stun-sg.saito.io:3478',
				username: 'guest',
				credential: 'somepassword'
			},
			{
				urls: 'turn:stun-de.saito.io:3478',
				username: 'guest',
				credential: 'somepassword'
			}

			// Firefox gives a warning if you provide more than two servers and
			// throws an error if you use 5 or more.
			// is it redundant to have both turn and stun on the same server, since
			//
			// " TURN (Traversal Using Relay NAT) is the more advanced solution that incorporates
			// the STUN protocols and most commercial WebRTC based services use a TURN server
			// for establishing connections between peers. "

			/*{
        urls: "stun:stun-sf.saito.io:3478",
      },
      {
        urls: "stun:stun-sg.saito.io:3478",
      },
      {
        urls: "stun:stun-de.saito.io:3478",
      },*/
		];

		this.peers = new Map();

		app.connection.on('stun-disconnect', () => {
			this.leave();
		});


	}



	respondTo(type, obj) {
		let stun_self = this;

		if (type === 'peer-manager') {
			return {};
		}

		return null;
	}


	onConfirmation(blk, tx, conf) {
		if (tx == null) {
			return;
		}

		let message = tx.returnMessage();

		if (conf === 0) {
			if (message.module === 'Stun') {
					if (this.app.BROWSER === 1) {
						if (this.hasSeenTransaction(tx)) return;

						if (tx.isTo(this.publicKey) && !tx.isFrom(this.publicKey)) {

							if (message.request === 'stun-send-message-to-peers') {
								console.log(
									'OnConfirmation: stun-send-message-to-peers'
								);
								this.peerManager.handleSignalingMessage(
									tx.msg.data
								);
							}
						}
					}
			}
		}
	}

	async handlePeerTransaction(app, tx = null, peer, mycallback) {
		if (tx == null) {
			return;
		}
		let txmsg = tx.returnMessage();

		if (this.app.BROWSER === 1) {
			if (tx.isTo(this.publicKey) && !tx.isFrom(this.publicKey)) {
				//console.log(txmsg);

				if (txmsg.request.substring(0, 10) == 'stun-send-') {
					if (this.hasSeenTransaction(tx)) return;

					if (txmsg.request === 'stun-send-message-to-peers') {
						//console.log("HPT: stun-send-message-to-peers");
						this.peerManager.handleSignalingMessage(tx.msg.data);
						return;
					}

					console.warn('Unprocessed request:');
					console.log(txmsg);
				} else if (txmsg.request.substring(0, 5) == 'stun-') {
					this.dialer.receiveStunCallMessageFromPeers(tx);
				}
			}
		}

		return super.handlePeerTransaction(app, tx, peer, mycallback);
	}


	handleDataChannelMessage(data, peerId) {
		console.log('STUN: Message from data channel:', data);
		switch (data) {
		case 'start-presentation':
			this.trackIsPresentation = true;
			this.mod.screen_share = true;
			break;
		case 'stop-presentation':
			this.mod.screen_share = false;
			this.app.connection.emit('remove-peer-box', 'presentation');
			this.app.connection.emit('stun-switch-view', 'focus');
			break;
		case 'start-recording':
			siteMessage(
				`${this.app.keychain.returnUsername(
					peerId
				)} is recording the call`,
				2500
			);
		default:
			break;
		}
	}

	async handleSignalingMessage(data) {
		const { type, sdp, iceCandidate, targetPeerId, public_key } = data;

		console.log('Stun Signal Message: ' + type, data);

		if (type == 'peer-joined') {
			this.createPeerConnection(public_key, true);
			return;
		}

		if (type == 'peer-left') {
			console.log('STUN: PEER LEFT');
			this.removePeerConnection(public_key);
			return;
		}

		if (type == 'toggle-audio' || type == 'toggle-video') {
			this.app.connection.emit(`peer-${type}-status`, data);
			return;
		}

		let peerConnection = this.peers.get(public_key);

		if (!peerConnection) {
			await this.createPeerConnection(public_key, false);
		}

		if (targetPeerId !== this.mod.publicKey) {
			console.warn('Stun offer sent to wrong public key....');
		}

		if (type === 'offer') {
			this.getPeerConnection(public_key)
				.setRemoteDescription(
					new RTCSessionDescription({ type: 'offer', sdp })
				)
				.then(() => {
					return this.getPeerConnection(public_key).createAnswer();
				})
				.then((answer) => {
					return this.getPeerConnection(
						public_key
					).setLocalDescription(answer);
				})
				.then(() => {
					let data = {
						room_code: this.mod.room_obj.room_code,
						type: 'answer',
						sdp: this.getPeerConnection(public_key).localDescription
							.sdp,
						targetPeerId: public_key,
						public_key: this.mod.publicKey
					};

					console.log('Stun: send answer to offer');
					this.mod.sendStunMessageToPeersTransaction(data, [
						public_key
					]);
				})
				.catch((error) => {
					console.error('Error handling offer:', error);
				});
		} else if (type === 'answer') {
			this.getPeerConnection(public_key)
				.setRemoteDescription(
					new RTCSessionDescription({ type: 'answer', sdp })
				)
				.then((answer) => {})
				.catch((error) => {
					console.error('Error handling answer:', error);
				});
			this.peers.set(data.public_key, this.getPeerConnection(public_key));
		} else if (type === 'candidate') {
			if (this.getPeerConnection(public_key).remoteDescription === null)
				return;
			this.getPeerConnection(public_key)
				.addIceCandidate(iceCandidate)
				.catch((error) => {
					console.error('Error adding remote candidate:', error);
				});
		}
	}



	async sendStunMessageToPeersTransaction(_data, recipients) {
		//console.log("sending to peers ", recipients, " data ", _data);
		let request = 'stun-send-message-to-peers';

		let newtx =
			await this.app.wallet.createUnsignedTransactionWithDefaultFee();

		if (recipients) {
			recipients.forEach((recipient) => {
				if (recipient) {
					newtx.addTo(recipient);
				}
			});
		}
		newtx.msg.module = 'Stun';
		newtx.msg.request = request;
		newtx.msg.data = _data;

		await newtx.sign();

		this.app.connection.emit('relay-transaction', newtx);

		this.app.network.propagateTransaction(newtx);
	}




		async createPeerConnection(peerId, on_connection = null) {
		console.log('STUN: Create Peer Connection with ' + peerId);

		if (peerId === this.mod.publicKey) {
			console.log('STUN: Attempting to create a peer Connection with myself!');
			return;
		}

    if (this.peers.get(peerId)){
      if (this.peers.get(peerId).connection == "connected"){
      	console.log("Already connected to " + peerId);
        return;  
      }
    }

		//this.app.connection.emit('add-remote-stream-request', peerId, null);

		// check if peer connection already exists
		const peerConnection = new RTCPeerConnection({iceServers: this.servers });

		this.peers.set(peerId, peerConnection);


		// Handle ICE candidates
		peerConnection.onicecandidate = async (event) => {
			if (event.candidate) {
				let data = {
					module: "Stun",
					request: 'stun candidate',
					iceCandidate: event.candidate,
					public_key: this.mod.publicKey
				};
				
				let tx = await this.app.wallet.createUnsignedTransactionWithDefaultFee(peerId);
				tx.msg = data;
				await tx.sign();

				this.app.network.propagateTransaction(tx);
				this.app.connection.emit("relay-transaction", tx);
			}
		};

		/* Receive Remote media
		peerConnection.addEventListener('track', (event) => {
			const remoteStream = new MediaStream();

			console.log('STUN: another remote stream added', event.track);

			if (this.trackIsPresentation) {
				remoteStream.addTrack(event.track);
				this.app.connection.emit(
					'add-remote-stream-request',
					'presentation',
					remoteStream
				);
				setTimeout(() => {
					this.trackIsPresentation = false;
				}, 1000);
			} else {
				if (event.streams.length === 0) {
					remoteStream.addTrack(event.track);
				} else {
					event.streams[0].getTracks().forEach((track) => {
						remoteStream.addTrack(track);
					});
				}

				this.remoteStreams.set(peerId, {
					remoteStream,
					peerConnection
				});
				this.app.connection.emit(
					'add-remote-stream-request',
					peerId,
					remoteStream
				);

				if (remoteStream.getAudioTracks()?.length) {
					this.analyzeAudio(remoteStream, peerId);
				}
			}

		});*/

		//
		// This handles the renegotiation for adding/droping media streams
		// However, need to further study "perfect negotiation" with polite/impolite peers
		//
		peerConnection.onnegotiationneeded = () => {
			this.renegotiate(peerId);
		};

		peerConnection.addEventListener('connectionstatechange', () => {
			console.log(
				`STUN: ${peerId} connectionstatechange -- ` +
					peerConnection.connectionState
			);

			if (
				peerConnection.connectionState === 'failed' ||
				peerConnection.connectionState === 'disconnected'
			) {
				setTimeout(() => {
					this.reconnect(peerId);
				}, 3000);
			}
			if (
				this?.firstConnect &&
				peerConnection.connectionState === 'connected'
			) {
				let sound = new Audio('/videocall/audio/enter-call.mp3');
				sound.play();
				this.firstConnect = false;
			}

			this.app.connection.emit(
				'stun-update-connection-message',
				peerId,
				peerConnection.connectionState
			);
		});

		if (on_connection) {
			peerConnection.addEventListener('datachannel', (event) => {
				console.log('STUN: datachannel event');

				const receiveChannel = event.channel;
				peerConnection.dc = receiveChannel;

				receiveChannel.onmessage = (event) => {
					this.handleDataChannelMessage(event.data, peerId);
				};

				receiveChannel.onopen = (event) => {
					console.log('STUN: Data channel is open');
					on_connection(peerConnection);
				};

				receiveChannel.onclose = (event) => {
					console.log('STUN: Data channel is closed');
					this.app.connection.emit("stun-data-channel-close", peerId);
				};
			});
		} else {
			const dc = peerConnection.createDataChannel('data-channel');
			peerConnection.dc = dc;

			dc.onmessage = (event) => {
				this.handleDataChannelMessage(event.data, peerId);
			};

			dc.onopen = (event) => {
				console.log('STUN: Data channel is open');
			};

			dc.onclose = (event) => {
				console.log('STUN: Data channel is closed');
				this.app.connection.emit("stun-data-channel-close", peerId);
			};

			this.renegotiate(peerId);
		}
	}

	reconnect(peerId) {
		const attemptReconnect = async (currentRetry, retryDelay = 5000) => {
			const peerConnection = this.peers.get(peerId);

			if (!peerConnection) {
				console.log(
					`STUN: No peerConnection found for peerId: ${peerId}`
				);
				return;
			}

			if (peerConnection.connectionState === 'connected') {
				console.log('STUN: Reconnection successful');
				return;
			}

			if (peerConnection.connectionState === 'connecting') {
				console.log('STUN: renogotiation/reconnection in progress');
				return;
			}

			console.log('STUN: Attempting Reconnection');
			this.renegotiate(peerId);

			if (currentRetry > 0) {
				setTimeout(() => {
					console.log(`STUN: Reconnection attempt ${currentRetry}`);
					attemptReconnect(currentRetry - 1);
				}, retryDelay);
			} else {
				let c = await sconfirm('Stun connection failed, hang up?');
				if (c) {
					this.removePeerConnection(peerId);
				} else {
					//attemptReconnect(3);
				}
			}
		};

		attemptReconnect(3);
	}

	//This can get double processed by PeerTransaction and onConfirmation
	//So need safety checks
	removePeerConnection(peerId) {
		const peerConnection = this.peers.get(peerId);
		if (peerConnection) {
			peerConnection.close();
			this.peers.delete(peerId);
		}
	}

	//
	// This is to send an offer (or resend it if the mediastream changes)
	//
	async renegotiate(peerId) {
		const peerConnection = this.peers.get(peerId);

		if (!peerConnection) {
			return;
		}

		console.log(`STUN: sending offer to ${peerId} with peer connection`);

		try {
			const offer = await peerConnection.createOffer();
			await peerConnection.setLocalDescription(offer);

			let data = {
				type: 'offer',
				sdp: peerConnection.localDescription.sdp,
				public_key: this.mod.publicKey
			};


		} catch (err) {
			console.error('Error creating offer:', err);
		}
	}

	leave() {
		if (this.presentationStream) {
			this.presentationStream.getTracks().forEach((track) => {
				track.stop();
			});
			this.stopSharing();
		}

		this.localStream.getTracks().forEach((track) => {
			track.stop();
			console.log('STUN: stopping track to leave call');
		});
		this.localStream = null; //My Video Feed

		let keys = [];
		this.peers.forEach((peerConnections, key) => {
			keys.push(key);
			peerConnections.close();
		});

		this.peers = new Map();

		this.app.options.stun.peers = [];
		this.app.storage.saveOptions();

		if (this.audioStreamAnalysis) {
			clearInterval(this.audioStreamAnalysis);
		}

		//
		// Reset parameters
		//
		this.videoEnabled = true;
		this.audioEnabled = true;
		this.recording = false;
		this.remain_in_call = true;

		let data = {
			room_code: this.mod.room_obj.room_code,
			type: 'peer-left',
			public_key: this.mod.publicKey
		};

		this.mod.sendStunMessageToPeersTransaction(data, keys);
	}



}

module.exports = Stun;
