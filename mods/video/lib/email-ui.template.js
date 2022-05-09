
module.exports = (app, mod) => {

  return `

     <div class="video-invite-ui">

     <h2>Saito Video Chat</h2>

     <p></p>

     Use Saito to start a peer-to-peer video chat!

     <p></p>

     <div class="button create-video-chat-button">create new</div>
     <div class="button join-video-chat-button">join existing chat</div>

     <p style="clear:both; font-size:0.8em;line-height: 1.2em;">

     Saito uses the blockchain to negotiate peer-to-peer connections. Please note that connections 
     can be more unstable and take longer to negotiate if you are on a mobile network or behind an 
     aggressive firewall.

     </p>


     </div>
     <style>
.video-invite-ui {
  max-width: 600px;
  line-height: 1.6em;
  font-size: 1.2em;
}
.button {
  max-width: 200px;
  text-align: center;
  float: left;
  margin-right: 25px;
  margin-top: 20px;
  margin-bottom: 20px;
}
     </style>
 `;


}

