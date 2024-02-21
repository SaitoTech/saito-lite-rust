const saito = require('../../lib/saito/saito');
const Transaction = require("../../lib/saito/transaction").default;
const ModTemplate = require('../../lib/templates/modtemplate');

/***
 *  A generic utility for creating stun connections that other modules can use
 *  API is a combination of respondTo and event space
 * 
 * Will emit (with publicKey of peer):
 * 	'stun-connection-connected' --- when you have created the basic stun connection (for media streaming)
 *  'stun-connection-failed'
 *  'stun-data-channel-open'
 *  'stun-data-channel-close'
 * 
 * 	Your modules can set a listener for these and process accordingly
 */ 


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

		app.connection.on('stun-disconnect', (peerId) => {
			this.leave(peerId);
		});
	}

	respondTo(type, obj) {
		let stun_self = this;

		if (type === 'peer-manager') {
			return {
				hasConnection: (peerId) => {
					return this.hasConnection(peerId);
				},
				sendTransaction: (peerId, tx) => {
					this.sendTransaction(peerId, tx);
				},
				createPeerConnection: async (peerId, passive = true) => {
					this.createPeerConnection(peerId, passive);
				},
				peers: this.peers
			};
		}

		return null;
	}

	hasConnection(peerId) {
		let peerConnection = this.peers.get(peerId);

		if (peerConnection) {
			if (peerConnection?.dc) {
				if (peerConnection.connectionState == 'connected') {
					return true;
				}
			}
		}

		return false;
	}

	sendTransaction(peerId, tx) {
		let peerConnection = this.peers.get(peerId);
		if (!peerConnection?.dc) {
			console.warn('Stun: no data channel with peer');
			return;
		}

		try {
			peerConnection.dc.send(tx.serialize_to_web(this.app));
		} catch (err) {
			console.error(err);
		}
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
						this.handleSignalingMessage(
							tx.from[0].publicKey,
							message.request,
							message
						);
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
				if (this.hasSeenTransaction(tx)) return;

				if (txmsg.module !== this.name) {
					return;
				}

				this.handleSignalingMessage(
					tx.from[0].publicKey,
					txmsg.request,
					txmsg
				);
			}
		}

		return super.handlePeerTransaction(app, tx, peer, mycallback);
	}

	handleSignalingMessage(sender, request, data) {
		//
		// Stun metadata messages
		//
		if (request == 'peer-joined') {
			this.createPeerConnection(sender, false);
			return;
		}

		if (request == 'peer-left') {
			this.removePeerConnection(sender);
			return;
		}

		let peerConnection = this.peers.get(sender);

		if (!peerConnection) {
			console.warn(
				'Receiving stun signalling messages for a non-peer connection'
			);
			return;
		}

		// Stun protocol messages
		if (request == 'peer-offer') {
			peerConnection
				.setRemoteDescription(
					new RTCSessionDescription({ type: 'offer', sdp: data.sdp })
				)
				.then(() => {
					return peerConnection.createAnswer();
				})
				.then((answer) => {
					return peerConnection.setLocalDescription(answer);
				})
				.then(async () => {
					await this.sendPeerAnswerTransaction(
						sender,
						peerConnection.localDescription.sdp
					);
				})
				.catch((error) => {
					console.error('Error handling offer:', error);
				});
			return;
		}

		if (request === 'peer-answer') {
			peerConnection
				.setRemoteDescription(
					new RTCSessionDescription({ type: 'answer', sdp: data.sdp })
				)
				.then((answer) => {})
				.catch((error) => {
					console.error('Error handling answer:', error);
				});
			this.peers.set(sender, peerConnection);
			return;
		}

		if (request === 'peer-candidate') {
			if (peerConnection.remoteDescription === null) return;
			peerConnection.addIceCandidate(data.iceCandidate).catch((error) => {
				console.error('Error adding remote candidate:', error);
			});
			return;
		}

		console.warn('Unknown Stun Peer Transaction!');
		console.log(data);
	}

	//
	// We treat all data channel messages a peer request / peer transaction
	//
	handleDataChannelMessage(data, peerId) {
		let relayed_tx = new Transaction();
		relayed_tx.deserialize_from_web(this.app, data);

		console.log("Data Channel Message: ", relayed_tx, relayed_tx.returnMessage());

		this.app.modules.handlePeerTransaction(relayed_tx);
	}

	async sendJoinTransaction(peer){
		let newtx =
			await this.app.wallet.createUnsignedTransactionWithDefaultFee(peer);

		newtx.msg = {
			module: 'Stun',
			request: 'peer-joined',
		};

		await newtx.sign();

		this.app.connection.emit('relay-transaction', newtx);
		this.app.network.propagateTransaction(newtx);
	}

	async sendPeerAnswerTransaction(peer, sdp) {
		let newtx =
			await this.app.wallet.createUnsignedTransactionWithDefaultFee(peer);

		newtx.msg = {
			module: 'Stun',
			request: 'peer-answer',
			sdp
		};

		await newtx.sign();

		this.app.connection.emit('relay-transaction', newtx);
		this.app.network.propagateTransaction(newtx);
	}

	async createPeerConnection(peerId, wait_for_confirmation = true) {
		console.log('STUN: Create Peer Connection with ' + peerId);

		if (peerId === this.publicKey) {
			console.log(
				'STUN: Attempting to create a peer Connection with myself!'
			);
			return;
		}

		if (this.peers.get(peerId)) {
			if (this.peers.get(peerId).connection == 'connected') {
				console.log('Already connected to ' + peerId);
				return;
			}
		}

		//this.app.connection.emit('add-remote-stream-request', peerId, null);

		// check if peer connection already exists
		const peerConnection = new RTCPeerConnection({
			iceServers: this.servers
		});

		this.peers.set(peerId, peerConnection);

		// Handle ICE candidates
		peerConnection.onicecandidate = async (event) => {
			if (event.candidate) {
				let data = {
					module: 'Stun',
					request: 'peer-candidate',
					iceCandidate: event.candidate
				};

				let tx =
					await this.app.wallet.createUnsignedTransactionWithDefaultFee(
						peerId
					);
				tx.msg = data;
				await tx.sign();

				this.app.network.propagateTransaction(tx);
				this.app.connection.emit('relay-transaction', tx);
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
					if (
						peerConnection.connectionState === 'failed' ||
						peerConnection.connectionState === 'disconnected'
					) {
						this.app.connection.emit(
							'stun-connection-failed',
							peerId
						);
					}
				}, 3000);
			}
			if (
				this?.firstConnect &&
				peerConnection.connectionState === 'connected'
			) {
				//let sound = new Audio('/videocall/audio/enter-call.mp3');
				//sound.play();
				this.app.connection.emit('stun-connection-connected', peerId);
				this.firstConnect = false;
			}

			this.app.connection.emit(
				'stun-update-connection-message',
				peerId,
				peerConnection.connectionState
			);
		});

		if (wait_for_confirmation) {
			peerConnection.addEventListener('datachannel', (event) => {
				console.log('STUN: datachannel event');

				const receiveChannel = event.channel;
				peerConnection.dc = receiveChannel;

				receiveChannel.onmessage = (event) => {
					this.handleDataChannelMessage(event.data, peerId);
				};

				receiveChannel.onopen = (event) => {
					console.log('STUN: Data channel is open');
					this.app.connection.emit('stun-data-channel-open', peerId);
				};

				receiveChannel.onclose = (event) => {
					console.log('STUN: Data channel is closed');
					this.app.connection.emit('stun-data-channel-close', peerId);
				};
			});

			//
			// send ready message to peer, so if they want to create the channel, we are receptive
			//
			this.sendJoinTransaction(peerId);

		} else {
			const dc = peerConnection.createDataChannel('data-channel');
			peerConnection.dc = dc;

			dc.onmessage = (event) => {
				this.handleDataChannelMessage(event.data, peerId);
			};

			dc.onopen = (event) => {
				console.log('STUN: Data channel is open');
				this.app.connection.emit('stun-data-channel-open', peerId);
			};

			dc.onclose = (event) => {
				console.log('STUN: Data channel is closed');
				this.app.connection.emit('stun-data-channel-close', peerId);
			};

			this.renegotiate(peerId);

			//
			// This handles the renegotiation for adding/droping media streams
			// However, need to further study "perfect negotiation" with polite/impolite peers
			//
			peerConnection.onnegotiationneeded = () => {
				this.renegotiate(peerId);
			};
		}
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

			let newtx =
				await this.app.wallet.createUnsignedTransactionWithDefaultFee(
					peerId
				);

			newtx.msg = {
				module: 'Stun',
				request: 'peer-offer',
				sdp: peerConnection.localDescription.sdp
			};

			await newtx.sign();

			this.app.connection.emit('relay-transaction', newtx);
			this.app.network.propagateTransaction(newtx);
		} catch (err) {
			console.error('Error creating offer:', err);
		}
	}

	async leave() {
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

		await this.sendLeaveTransaction();

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
			type: 'peer-left',
		};

		
	}
}

module.exports = Stun;
