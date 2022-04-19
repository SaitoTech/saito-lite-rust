
const StunUITemplate = require("./stun-ui-template");
const MyStunTemplate = require("./MyStunTemplate");
const ListenersTemplate = require("./ListenersTemplate");
const PeersTemplate = require("./PeersTemplate");
const Stun = require("../stun");


const StunUI = {

      selectedTab: "my-stun",

      peer_connection: "",

      localStream: "",
      remoteStream: "",

      stun: {
            ip_address: "",
            port: "",
            offer_sdp: "",
            pc: "",
            listeners: [],
            iceCandidates: []
      },


      mapTabToTemplate: {
            "my-stun": MyStunTemplate,
            "listeners": ListenersTemplate,
            "peer-stun": PeersTemplate
      },



      render(app, mod) {
            const Tab = this.mapTabToTemplate[this.selectedTab];
            if (!document.querySelector('.stun-container')) document.querySelector('.email-appspace').innerHTML = sanitize(StunUITemplate(app, mod));
            document.querySelector(".stun-information").innerHTML = sanitize(Tab(app, mod));
            if (StunUI.localStream && document.querySelector('#localStream')) {
                  document.querySelector('#localStream').srcObject = StunUI.localStream;
            }
            if (StunUI.remoteStream && document.querySelector('#remoteStream')) {
                  document.querySelector('#remoteStream').srcObject = StunUI.remoteStream;
            }

      },


      attachEvents(app, mod) {

            const generate_button = document.querySelector('#generate');
            const update_button = document.querySelector('#update');
            const input = document.querySelector('#input_address');

            app.connection.on('stun-update', (app) => {
                  console.log('stun update', app);
                  let localStream, remoteStream;
                  // localStream = document.querySelector('#localStream');
                  // remoteStream = document.querySelector('#remoteStream');
                  StunUI.render(app, mod);
                  // document.querySelector('#localStream') = localStream;
                  // document.querySelector('#remoteStream') = remoteStream;
                  // StunUI.attachEvents(app, mod);
            });

            app.connection.on('listeners-update', (app, listeners) => {
                  console.log('listeners update');
                  let listenersHtml;
                  if (listeners) {
                        listenersHtml = listeners.map(listener => ` <li class="list-group-item">${listener}</li>`).join('');
                        console.log(listeners, listenersHtml);
                  } else {
                        listenersHtml = "<p> There are no listeners";
                  }

                  if (document.querySelector("#stun-listeners")) {
                        document.querySelector("#stun-listeners").innerHTML = listenersHtml;
                  }

                  if (document.querySelector('#connectSelect')) {
                        document.querySelector('#connectSelect').innerHTML = listenersHtml;
                  }


            });





            app.connection.on('offer_received', (peer_key, my_key, offer) => {



                  let my_index = app.keys.keys.findIndex(key => key.publickey === my_key);
                  let peer_key_index = app.keys.keys.findIndex(key => key.publickey === peer_key);




                  // create new RTC connection 

                  const createPeerConnection = async () => {
                        let reply = {
                              answer: "",
                              iceCandidates: []
                        }
                        const pc = new RTCPeerConnection({
                              iceServers: [
                                    {
                                          urls: "stun:openrelay.metered.ca:80",
                                    },
                                    {
                                          urls: "turn:openrelay.metered.ca:80",
                                          username: "openrelayproject",
                                          credential: "openrelayproject",
                                    },
                                    {
                                          urls: "turn:openrelay.metered.ca:443",
                                          username: "openrelayproject",
                                          credential: "openrelayproject",
                                    },
                                    {
                                          urls: "turn:openrelay.metered.ca:443?transport=tcp",
                                          username: "openrelayproject",
                                          credential: "openrelayproject",
                                    },
                              ],
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

                              // add data channels 
                              const data_channel = pc.createDataChannel('channel');
                              pc.dc = data_channel;
                              pc.dc.onmessage = (e) => {

                                    console.log('new message from client : ', e.data);
                                    StunUI.displayMessage(peer_key, e.data);
                              };
                              pc.dc.open = (e) => {
                                    console.log('connection openend');
                                    $('#connection-status').html(` <p style="color: green" class="data">Connected to ${peer_key}</p>`);
                              }

                              // add tracks
                              const localVideoStream = document.querySelector('#localStream');
                              const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                              localStream.getTracks().forEach(track => {
                                    pc.addTrack(track, localStream);
                                    console.log('got local stream for answerer');
                              });

                              if (localVideoStream) {
                                    localVideoStream.srcObject = localStream;
                              }


                              StunUI.localStream = localStream;


                              const remoteStream = new MediaStream();
                              pc.addEventListener('track', (event) => {

                                    const remoteVideoSteam = document.querySelector('#remoteStream');
                                    console.log('got remote stream ', event.streams);
                                    event.streams[0].getTracks().forEach(track => {
                                          remoteStream.addTrack(track);
                                    });
                                    if (remoteVideoSteam) {
                                          remoteVideoSteam.srcObject = remoteStream;
                                    }

                                    StunUI.remoteStream = remoteStream;
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
                              StunUI.peer_connection = pc;




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
                        console.log('my key', reply, my_key);

                        const data_channel = StunUI.peer_connection.createDataChannel('channel');
                        StunUI.peer_connection.dc = data_channel;
                        StunUI.peer_connection.dc.onmessage = (e) => {

                              console.log('new message from client : ', e.data);
                              StunUI.displayMessage(peer_b, e.data);
                        };
                        StunUI.peer_connection.dc.open = (e) => {
                              $('#connection-status').html(` <p style="color: green" class="data">Connected to ${peer_b}</p>`);
                              console.log("connection opened");
                        };


                        StunUI.peer_connection.setRemoteDescription(reply.answer).then(e => {
                              console.log('answer has been set');
                              StunUI.peer_connection.ondatachannel = e => {
                                    StunUI.peer_connection.dc = e.channel;
                                    StunUI.peer_connection.dc.onmessage = e => {
                                          console.log('new message from client:', e.data);
                                          StunUI.displayMessage(peer_a, e.data);
                                    };
                                    StunUI.peer_connection.dc.onopen = e => console.log('connection open');
                                    StunUI.peer_connection.dc.send("Connected", my_key);
                                    StunUI.displayMessage(peer_a, "Connected");

                              }
                              if (reply.iceCandidates.length > 0) {
                                    console.log("Adding answer candidates");
                                    for (let i = 0; i < reply.iceCandidates.length; i++) {
                                          StunUI.peer_connection.addIceCandidate(reply.iceCandidates[i]);
                                    }
                              }


                        });




                        console.log(StunUI.peer_connection);


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

                  if ($(this).attr('data-id') === StunUI.selectedTab) return;
                  // add ui class to button
                  $('.menu').removeClass('button-active');
                  $(this).addClass('button-active');
                  StunUI.selectedTab = $(this).attr('data-id');

                  StunUI.render(app, mod);


            });

            //connect with peer
            $(".stun-container").on('click', '#connectTo', function (e) {
                  let selected_option = $('#connectSelect option:selected');
                  const stun_mod = app.modules.returnModule("Stun");
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
                        const execute = async () => {

                              try {
                                    const pc = new RTCPeerConnection({
                                          iceServers: [
                                                // {
                                                //   urls: "stun:openrelay.metered.ca:80",
                                                // },
                                                {
                                                      urls: "turn:openrelay.metered.ca:80",
                                                      username: "openrelayproject",
                                                      credential: "openrelayproject",
                                                },
                                                {
                                                      urls: "turn:openrelay.metered.ca:443",
                                                      username: "openrelayproject",
                                                      credential: "openrelayproject",
                                                },
                                                {
                                                      urls: "turn:openrelay.metered.ca:443?transport=tcp",
                                                      username: "openrelayproject",
                                                      credential: "openrelayproject",
                                                },
                                          ],
                                    });

                                    pc.onicecandidate = (ice) => {
                                          if (!ice || !ice.candidate || !ice.candidate.candidate) {

                                                // pc.close();

                                                stun.offer_sdp = pc.localDescription;


                                                stun.pc = pc;
                                                StunUI.stun = stun;
                                                StunUI.peer_connection = stun.pc;
                                                console.log("ice candidates", stun.iceCandidates);

                                                resolve({ offer_sdp: stun.offer_sdp, iceCandidates: stun.iceCandidates });
                                                // stun_mod.broadcastIceCandidates(my_key, peer_key, ['savior']);

                                                return;
                                          }



                                          let split = ice.candidate.candidate.split(" ");
                                          if (split[7] === "host") {
                                                // console.log(`Local IP : ${split[4]}`);
                                                // stun.ip_address = split[4];
                                                // console.log(split);
                                          } else {

                                                stun.ip_address = split[4];
                                                stun.port = split[5];
                                                stun.iceCandidates.push(ice.candidate);
                                                // resolve(stun);
                                          }
                                    };
                                    const localVideoSteam = document.querySelector('#localStream');
                                    const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                                    localStream.getTracks().forEach(track => {
                                          pc.addTrack(track, localStream);

                                    });
                                    StunUI.localStream = localStream
                                    if (localVideoSteam) {
                                          localVideoSteam.srcObject = localStream;
                                    }



                                    pc.LOCAL_STREAM = localStream;
                                    const remoteStream = new MediaStream()
                                    pc.addEventListener('track', (event) => {

                                          const remoteVideoSteam = document.querySelector('#remoteStream');
                                          console.log('got remote stream ', event.streams);
                                          event.streams[0].getTracks().forEach(track => {
                                                remoteStream.addTrack(track);
                                          });

                                          StunUI.remoteStream = remoteStream;

                                          if (remoteVideoSteam) {
                                                remoteVideoSteam.srcObject = remoteStream;
                                          }

                                    });

                                    const data_channel = pc.createDataChannel('channel');
                                    pc.dc = data_channel;
                                    pc.dc.onmessage = (e) => {

                                          console.log('new message from client : ', e.data);
                                          StunUI.displayMessage(peer_key, e.data);
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
                        console.log(offer);
                        stun_mod.broadcastOffer(my_key, peer_key, offer);
                  });

            })

            // add listeners to stun module
            $('.stun-container').on('click', '#add-to-listeners-btn', function (e) {
                  console.log('add to listeners');
                  let input = $('#listeners-input').val().split(',');
                  const listeners = input.map(listener => listener.trim());
                  let stun_mod = app.modules.returnModule("Stun");
                  stun_mod.addListeners(listeners);

            })

            $('.stun-container').on('click', '#send-message-btn', (e) => {

                  if (!StunUI.peer_connection) return console.log("Peer connection instance has not been created");
                  const text = $('#message-text').val();
                  console.log('text message', text);
                  StunUI.peer_connection.dc.send(text);

            })


      },


      displayMessage(sender, message) {
            $('#address-origin').text(`Received Messages`);
            $('#connection-status').html(` <p style="color: green" class="data">Connected to ${sender}</p>`);
            $('#msg-display').append(`<p style="border-radius: 8px; color: red; font-size:.9rem" class="data p-2 w-100" >${message}</p>`);
      }
}



module.exports = StunUI;

