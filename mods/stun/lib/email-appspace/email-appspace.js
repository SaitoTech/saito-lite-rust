//main
const StunMainContainer = require("./email-appspace.template");

// components
const StunComponentMyStun = require("../components/my-stun");
const StunComponentListeners = require("../components/listeners");
const StunComponentPeers = require("../components/peers");

const { vanillaToast } = require("vanilla-toast");
const VideoChat = require('../../../../lib/saito/ui/video-chat/video-chat');


class Container {
    constructor(app, mod) {
        this.app = app;
        this.mod = mod;
        this.selectedTab = "my-stun";
        this.videoChat = "";
        this.peer_connection = "";
        this.localStream = "";
        this.remoteStream = "";

        this.stun = {
            ip_address: "",
            port: "",
            offer_sdp: "",
            pc: "",
            listeners: [],
            iceCandidates: []
        };

        this.myStun = new StunComponentMyStun(app, mod);
        this.listeners = new StunComponentListeners(app, mod);
        this.peers = new StunComponentPeers(app, mod);

        this.mapTabToTemplate = {
            "my-stun": this.myStun,
            "listeners": this.listeners,
            "peer-stun": this.peers
        };

        this.videoChat = new VideoChat(app, mod);
    }


    render(app = this.app, mod = this.mod) {
        if (!document.querySelector('.stun-container'))
            document.querySelector('#email-appspace').innerHTML = sanitize(StunMainContainer(app, mod));

        // render the selected tab
        const Tab = this.mapTabToTemplate[this.selectedTab];
        Tab.render(app, mod);

        if (this.localStream && document.querySelector('#localStream')) {
            document.querySelector('#localStream').srcObject = this.localStream;
        }
        if (this.remoteStream && document.querySelector('#remoteStream1')) {
            document.querySelector('#remoteStream1').srcObject = this.remoteStream;
        }

        this.attachEvents(app, mod);
    }


    attachEvents(app, mod) {

        const generate_button = document.querySelector('#generate');
        const update_button = document.querySelector('#update');
        const input = document.querySelector('#input_address');
        let self = this;

        app.connection.on('stun-update', (app) => {
            console.log('stun update', app);
            let localStream, remoteStream;
            this.render(app, mod);
        });


        app.connection.on('offer_received', (peer_key, my_key, offer) => {
            vanillaToast.show('Connecting ..', {
                duration: 70000,
                fadeDuration: 500
            });
            let my_index = app.keys.keys.findIndex(key => key.publickey === my_key);
            let peer_key_index = app.keys.keys.findIndex(key => key.publickey === peer_key);


            // create new RTC connection 
            const createPeerConnection = async () => {
                const stun_mod = app.modules.returnModule('Stun');
                let reply = {
                    answer: "",
                    iceCandidates: []
                }
                const pc = new RTCPeerConnection({
                    iceServers: stun_mod.servers
                });
                try {

                    pc.onicecandidate = (ice) => {
                        if (!ice || !ice.candidate || !ice.candidate.candidate) {
                            console.log('ice candidate check closed');

                            let stun_mod = app.modules.returnModule("Stun");
                            stun_mod.broadcastAnswer(my_key, peer_key, reply);
                            return

                        };

                        reply.iceCandidates.push(ice.candidate);
                    }

                    pc.onconnectionstatechange = e => {
                        console.log("connection state ", pc.connectionState)
                        switch (pc.connectionState) {


                            case "connected":
                                vanillaToast.cancelAll();
                                vanillaToast.success('Connected', {
                                    duration: 3000,
                                    fadeDuration: 500
                                });
                                break;

                            case "disconnected":
                                this.displayConnectionClosed();
                                vanillaToast.error('Disconnected', {
                                    duration: 3000,
                                    fadeDuration: 500
                                });
                                break;

                            default:
                                ""
                                break;
                        }
                    }

                    // add data channels 
                    const data_channel = pc.createDataChannel('channel');
                    pc.dc = data_channel;
                    pc.dc.onmessage = (e) => {

                        console.log('new message from client : ', e.data);
                        this.displayMessage(peer_key, e.data);
                    };
                    pc.dc.open = (e) => {
                        console.log('connection opened');
                        $('#connection-status').html(` <p style="color: green" class="data">Connected to ${peer_key}</p>`);
                    }

                    // add tracks

                    const localStream = await navigator.mediaDevices.getUserMedia({
                        video: true,
                        audio: true
                    });
                    localStream.getTracks().forEach(track => {
                        pc.addTrack(track, localStream);
                        console.log('got local stream for answerer');
                    });



                    this.videoChat.show(pc);
                    this.videoChat.addLocalStream(localStream);


                    const remoteStream = new MediaStream();
                    pc.addEventListener('track', (event) => {


                        console.log('got remote stream ', event.streams);
                        event.streams[0].getTracks().forEach(track => {
                            remoteStream.addTrack(track);
                        });
                        this.videoChat.addRemoteStream(remoteStream, "remote");


                    });
                    // const offer = await pc.createOffer();
                    // pc.setLocalDescription(offer);



                    await pc.setRemoteDescription(offer.offer_sdp);

                    const peerIceCandidates = offer.iceCandidates;
                    console.log('peer ice candidates', peerIceCandidates);
                    if (peerIceCandidates.length > 0) {
                        console.log('adding offer candidates');
                        for (let i = 0; i < peerIceCandidates.length; i++) {
                            pc.addIceCandidate(peerIceCandidates[i]);
                        }
                    }


                    console.log('peer a remote description  is set');


                    reply.answer = await pc.createAnswer();

                    console.log("answer ", reply.answer);


                    pc.setLocalDescription(reply.answer);
                    this.peer_connection = pc;




                } catch (error) {
                    console.log("error", error);
                }

            }

            createPeerConnection();

        })

        app.connection.on('answer_received', (peer_a, peer_b, reply) => {

            const preferred_crypto = app.wallet.returnPreferredCrypto();
            let my_key = preferred_crypto.returnAddress();
            if (peer_b === my_key) {
                // console.log('my key', reply, my_key);

                this.peer_connection.onconnectionstatechange = e => {
                    console.log("connection state ", this.peer_connection.connectionState)
                    switch (this.peer_connection.connectionState) {


                        case "connected":
                            vanillaToast.cancelAll();
                            vanillaToast.success('Connected', {
                                duration: 5000,
                                fadeDuration: 500
                            });
                            break;

                        case "disconnected":
                            this.displayConnectionClosed()
                            break;

                        default:
                            ""
                            break;
                    }
                }

                const data_channel = this.peer_connection.createDataChannel('channel');
                this.peer_connection.dc = data_channel;
                this.peer_connection.dc.onmessage = (e) => {

                    console.log('new message from client : ', e.data);
                    this.displayMessage(peer_b, e.data);
                };
                this.peer_connection.dc.onopen = (e) => {
                    $('#connection-status').html(` <p style="color: green" class="data">Connected to ${peer_b}</p>`);
                    console.log("connection opened");
                };


                this.peer_connection.setRemoteDescription(reply.answer).then(e => {
                    console.log('answer has been set');
                    this.peer_connection.ondatachannel = e => {
                        this.peer_connection.dc = e.channel;
                        this.peer_connection.dc.onmessage = e => {
                            console.log('new message from client:', e.data);
                            this.displayMessage(peer_a, e.data);
                        };
                        this.peer_connection.dc.onopen = e => console.log('connection open');
                        this.peer_connection.dc.send("Connected", my_key);
                        this.displayMessage(peer_a, "Connected");

                    }
                    if (reply.iceCandidates.length > 0) {
                        console.log("Adding answer candidates");
                        for (let i = 0; i < reply.iceCandidates.length; i++) {
                            this.peer_connection.addIceCandidate(reply.iceCandidates[i]);
                        }
                    }


                });

            } else {
                console.log('KEY NOT FOUND');
            }

        })



        // $('.stun-container').on('click', '.generate-offer', (e) => {

        //       let stun_mod = app.modules.returnModule("Stun");
        //       stun_mod.generateStun();
        // })

        // event listeners

        // change selected tab
        $('.menu').on('click', function (e) {

            if ($(this).attr('data-id') === this.selectedTab) return;
            // add ui class to button
            $('.menu').removeClass('button-active');
            $(this).addClass('button-active');
            self.selectedTab = $(this).attr('data-id');

            self.render(app, mod);
        });

        //connect with peer
        $(".stun-container").on('click', '#connectTo', function (e) {




            let selected_option = $('#connectSelect option:selected');
            const stun_mod = app.modules.returnModule("Stun");

            if (this.peer_connection && this.peer_connection.connectionState === "connected") {
                console.log("Closing connection");
                this.peer_connection.close();
                this.displayConnectionClosed();
                this.localStream = "";
                this.remoteStream = "";
                // this.peer_connection = "";
                vanillaToast.error('Disconnected', {
                    duration: 4000,
                    fadeDuration: 500
                });

                return;
            } else {
                vanillaToast.show('Starting Video Call', {
                    duration: 70000,
                    fadeDuration: 500
                });
            }

            const peer_key = selected_option.text().trim();
            const my_key = app.wallet.returnPublicKey();
            console.log("keys ", my_key, peer_key);
            let stun = {
                ip_address: "",
                port: "",
                offer_sdp: "",
                pc: "",
                listeners: [],
                iceCandidates: []
            };



            const createPeerConnection = new Promise((resolve, reject) => {
                const stun_mod = app.modules.returnModule('Stun');
                const execute = async () => {

                    try {
                        const pc = new RTCPeerConnection({
                            iceServers: stun_mod.servers
                        });



                        pc.onicecandidate = (ice) => {
                            if (!ice || !ice.candidate || !ice.candidate.candidate) {

                                // pc.close();

                                this.stun.offer_sdp = pc.localDescription;


                                this.stun.pc = pc;
                                this.stun = stun;
                                this.peer_connection = this.stun.pc;
                                console.log("ice candidates", this.stun.iceCandidates);

                                resolve({
                                    offer_sdp: this.stun.offer_sdp,
                                    iceCandidates: this.stun.iceCandidates
                                });
                                // stun_mod.broadcastIceCandidates(my_key, peer_key, ['savior']);

                                return;
                            }



                            let split = ice.candidate.candidate.split(" ");
                            if (split[7] === "host") {
                                // console.log(`Local IP : ${split[4]}`);
                                // this.stun.ip_address = split[4];
                                // console.log(split);
                            } else {

                                this.stun.ip_address = split[4];
                                this.stun.port = split[5];
                                this.stun.iceCandidates.push(ice.candidate);
                                // resolve(stun);
                            }
                        };

                        const localStream = await navigator.mediaDevices.getUserMedia({
                            video: true,
                            audio: true
                        });
                        localStream.getTracks().forEach(track => {
                            pc.addTrack(track, localStream);

                        });
                        this.localStream = localStream;

                        this.videoChat.show(pc)
                        this.videoChat.addLocalStream(localStream);


                        pc.LOCAL_STREAM = localStream;
                        const remoteStream = new MediaStream();
                        pc.addEventListener('track', (event) => {


                            console.log('got remote stream ', event.streams);
                            event.streams[0].getTracks().forEach(track => {
                                remoteStream.addTrack(track);
                            });

                            this.remoteStream = remoteStream;

                            this.videoChat.addRemoteStream(remoteStream, "remote");
                        });

                        const data_channel = pc.createDataChannel('channel');
                        pc.dc = data_channel;
                        pc.dc.onmessage = (e) => {

                            console.log('new message from client : ', e.data);
                            this.displayMessage(peer_key, e.data);
                        };
                        pc.dc.open = (e) => console.log("connection opened");

                        const offer = await pc.createOffer();
                        pc.setLocalDescription(offer);

                    } catch (error) {
                        console.log(error);
                    }

                }
                execute();

            })


            createPeerConnection.then(offer => {

                stun_mod.sendOfferTransaction(my_key, peer_key, offer);
            });

        })


    }


    displayMessage(sender, message) {
        $('#connectTo').text(`Disconnect`);
        $('#connectTo').removeClass('btn-primary');
        $('#connectTo').addClass('btn-danger');
        $('#address-origin').text(`Received Messages`);
        $('#connection-status').html(` <p style="color: green" class="data">Connected to ${sender}</p>`);
        $('#msg-display').append(`<p style="border-radius: 8px; color: red; font-size:.9rem" class="data p-2 w-100" >${message}</p>`);
    }

    displayConnectionClosed() {
        console.log('closing connection')

        $('#connectTo').text("Connect")
        $('#connectTo').removeClass('btn-danger');
        $('#connectTo').addClass('btn-primary');
        $('#connection-status').html(` <p style="color: green" class="data">Not connected to any peer</p>`);
        document.querySelector('#localStream').srcObject = new MediaStream();
        document.querySelector('#remoteStream1').srcObject = new MediaStream();
    }


}



module.exports = Container;