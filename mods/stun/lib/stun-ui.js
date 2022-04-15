
const StunUITemplate = require("./stun-ui-template");
const MyStunTemplate = require("./MyStunTemplate");
const ListenersTemplate = require("./ListenersTemplate");
const PeersTemplate = require("./PeersTemplate");
const Stun = require("../stun");

const StunUI = {

      selectedTab: "my-stun",

      peer_connection: "",


      mapTabToTemplate: {
            "my-stun": MyStunTemplate,
            "listeners": ListenersTemplate,
            "peer-stun": PeersTemplate
      },



      render(app, mod) {
            const Tab = this.mapTabToTemplate[this.selectedTab];
            if (!document.querySelector('.stun-container')) document.querySelector('.email-appspace').innerHTML = sanitize(StunUITemplate(app, mod));
            document.querySelector(".stun-information").innerHTML = sanitize(Tab(app, mod));
            if (StunUI.localStream) {
                  document.querySelector('#localStream').srcObject = Stun.localStream;
            }
            if (StunUI.remoteStream) {
                  document.querySelector('#localStream').srcObject = Stun.remoteStream;
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

            app.connection.on('listeners-update', (app) => {
                  console.log('listeners update');
                  StunUI.render(app, mod);

            });

            app.connection.on('peer_connection', (pc) => {
                  console.log("pc created");
                  StunUI.peer_connection = pc;
                  console.log('ice candidate received', StunUI.peer_connection)
                  StunUI.remoteStream = pc.REMOTE_STREAM;
                  StunUI.localStream = pc.LOCAL_STREAM;
            })

            app.connection.on('answer_received', (peer_a, peer_b, answer) => {

                  const preferred_crypto = app.wallet.returnPreferredCrypto();
                  let my_key = preferred_crypto.returnAddress();
                  if (peer_b === my_key) {
                        console.log('my key', answer, my_key);

                        const data_channel = StunUI.peer_connection.createDataChannel('channel');
                        StunUI.peer_connection.dc = data_channel;
                        StunUI.peer_connection.dc.onmessage = (e) => {

                              console.log('new message from client : ', e.data);
                              StunUI.displayMessage(peer_b, e.data);
                        };
                        StunUI.peer_connection.dc.open = (e) => console.log("connection opened");


                        StunUI.peer_connection.setRemoteDescription(answer).then(e => {
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
                        });


                        console.log(StunUI.peer_connection);


                  } else {
                        console.log('KEY NOT FOUND');
                  }

            })





            $('.stun-container').on('click', '.generate-offer', (e) => {

                  let stun_mod = app.modules.returnModule("Stun");
                  stun_mod.generateStun();
            })

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

            // connect with peer
            // $(".stun-container").on('click', '#connectWith', function (e) {
            //       console.log('connecting with');
            // })

            // add listeners to stun module
            $('.stun-container').on('click', '#add-to-listeners-btn', function (e) {
                  console.log('add to listeners');
                  let input = $('#listeners-input').val().split(',');
                  const listeners = input.map(listener => listener.trim());
                  let stun_mod = app.modules.returnModule("Stun");
                  stun_mod.addListeners(listeners);

            })

            // connect to another stun instance
            $('.stun-container').on('click', '#connectTo', function (e) {

                  let selected_option = $('#connectSelect option:selected');
                  const peer_key = selected_option.text();

                  const preferred_crypto = app.wallet.returnPreferredCrypto();
                  let my_key = preferred_crypto.returnAddress();
                  let my_index = app.keys.keys.findIndex(key => key.publickey === my_key);
                  let peer_key_index = app.keys.keys.findIndex(key => key.publickey === peer_key);


                  const my_stun = app.keys.keys[my_index].data.stun;
                  const peer_stun = app.keys.keys[peer_key_index].data.stun;
                  console.log("results : ", my_index, peer_key_index, my_stun, peer_stun);

                  // create new RTC connection 

                  const createPeerConnection = async () => {
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
                                    };
                                    console.log("ice candidate ", ice.candidate)

                                    pc.addIceCandidate(ice.candidate);
                              }

                              // add data channels 
                              const data_channel = pc.createDataChannel('channel');
                              pc.dc = data_channel;
                              pc.dc.onmessage = (e) => {

                                    console.log('new message from client : ', e.data);
                                    StunUI.displayMessage(peer_key, e.data);
                              };
                              pc.dc.open = (e) => console.log("connection opened");
                              // add tracks
                              const localVideoStream = document.querySelector('#localStream');
                              const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                              localStream.getTracks().forEach(track => {
                                    pc.addTrack(track, localStream);
                                    console.log('got local stream for answerer');
                              });

                              localVideoStream.srcObject = localStream;
                              StunUI.localStream = localStream


                              const remoteStream = new MediaStream()
                              pc.addEventListener('track', (event) => {

                                    const remoteVideoSteam = document.querySelector('#remoteStream');
                                    console.log('got remote stream ', event.streams);
                                    event.streams[0].getTracks().forEach(track => {
                                          remoteStream.addTrack(track);
                                    });

                                    remoteVideoSteam.srcObject = remoteStream;
                                    StunUI.remoteStream = remoteStream
                              });
                              const offer = await pc.createOffer();
                              pc.setLocalDescription(offer);



                              await pc.setRemoteDescription(peer_stun.offer_sdp);
                              console.log('peer a remote description  is set');


                              const answer = await pc.createAnswer();

                              console.log("answer ", answer);


                              pc.setLocalDescription(answer);
                              StunUI.peer_connection = pc;


                              let stun_mod = app.modules.returnModule("Stun");
                              stun_mod.broadcastAnswer(my_key, peer_key, answer);



                        } catch (error) {
                              console.log("error", error);
                        }

                  }

                  createPeerConnection();


            })

            $('.stun-container').on('click', '#send-message-btn', (e) => {

                  if (!StunUI.peer_connection) return console.log("Peer connection instance has not been created");
                  const text = $('#message-text').val();
                  console.log('text message', text);
                  StunUI.peer_connection.dc.send(text);

            })


      },


      displayMessage(sender, message) {
            $('#address-origin').text(`From ${sender} `);
            $('#connection-status').html(` <p style="color: green" class="data">Connected to ${sender}</p>`);
            $('#msg-display').append(`<p style="border-radius: 8px; color: red;" class="data p-2 w-100" >${message}</p>`);
      }
}



module.exports = StunUI;

