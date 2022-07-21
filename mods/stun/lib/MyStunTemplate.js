

const StunUI = require("./stun-ui");
module.exports = (app, mod) => {

  console.log(app, mod);


  let publicKey = app.wallet.returnPublicKey();
  const keyss = app.keys.keys;
  console.log("key ", keyss);
  let stun = "";
  // for (let i = 0; i < app.keys.keys.length; i++) {
  //   let tk = app.keys.keys[i];
  //   if (tk.publickey === publicKey) {
  //     console.log("public key ", tk.publickey, publicKey);
  //     stun = app.keys.keys[i].data.stun;

  //   }
  // }

  // const canConnectTo = () => {
  //   const key_index = app.keys.keys.findIndex(tk => tk.publickey === publicKey)

  //   let html = "";
  //   for (let i = 0; i < app.keys.keys.length; i++) {
  //     if (app.keys.keys[key_index]?.data?.stun?.listeners?.includes(app.keys.keys[i].publickey) && app.keys.keys[i].data?.stun?.listeners?.includes(app.keys.keys[key_index].publickey)) {

  //       html += `<option  data-id="${app.keys.keys[i].publickey}" value="1">${app.keys.keys[i].publickey}</option>`;
  //     }
  //   }

  //   return html;


  // }
  const canConnectTo = () => {
    const key_index = app.keys.keys.findIndex(tk => tk.publickey === publicKey)

    let html = "";
    for (let i = 0; i < app.keys.keys[key_index].data.stun.listeners.length; i++) {


      html += `<option  data-id="${app.keys.keys[key_index].data.stun.listeners[i]}"> ${app.keys.keys[key_index].data.stun.listeners[i]}</option>`;

    }

    return html;


  }


  return `<card class="appear my-stun-container">

  <h2> Stun Video </h2>
  <p>  Use Saito to start a peer-to-peer video chat!</p>
  <div class="my-stun-container-actions">
  <div class="my-stun-container-create">
  <p> Create </p>
  <button id="createInvite" class="saito-button-secondary"> Create Invite</button>
  </div>
  <div class="my-stun-container-join">
     <p> Join an invite </p>
    <div>
    <input placeholder="Insert Room Code" id="inviteCode" />
    <button id="joinInvite" class="saito-button-secondary">Join</button>
    </div>

  </div>
  </div>


</card`;
}



{/* <div class="row mb-4">
<div class="col-sm-4"><p class="name">IP Address:</p></div>
<div class="col-sm-8"><p class="data">${stun?.ip_address || ""}</p></div>
</div>
<div class="row mb-4">
<div class="col-sm-4"><p class="name">PORT:</p></div>
<div class="col-sm-8"><p class="data">${stun?.port || ""}</p></div>
</div>
<div class="row mb-4">
<div class="col-sm-4"><p class="name">SDP Offer:</p></div>
<div style="position: relative" class="col-sm-8">
  <p class="data offer p-2">
    ${JSON.stringify(stun?.offer_sdp) || ""}
  </p>
  <button class="generate-offer btn btn-danger">
    Generate Offer
  </button>
</div>
</div> */}

{/* <div class="row mb-4">
<div class="col-sm-4"><p class="name">Status</p></div>
<div  id="connection-status" class="col-sm-8">
  <p style="color: red" class="data">Not connected to any pair</p>
</div>
</div> */}


{/* <video  class="stun-video" muted="true" id="localStream" width="100%" height="100%" autoplay></video>
<video class="stun-video"  id="remoteStream1" width="100%" height="100%" autoplay></video> 
</div>

<div class="stun-video-container" style="display: flex">
<video class="stun-video"  id="remoteStream2" width="100%" height="100%" autoplay></video> 
<video class="stun-video"  id="remoteStream3" width="100%" height="100%" autoplay></video> 
</div>

<div class="stun-video-container" style="display: flex">
<video class="stun-video"  id="remoteStream4" width="100%" height="100%" autoplay></video>  */}

{/* <div class="row mb-4">
<div class="col-sm-4"><p class="name">Status</p></div>
<div  id="connection-status" class="col-sm-8">
  <p style="color: red" class="data">Not connected to any pair</p>
</div>
</div>
  
    <div class="row mb-4">
      <div class="col-sm-4"><p class="name">Send Message to peer</p></div>
      <div class="col-sm-8">
        <div class="d-flex  align-items-end" style="">
          <textarea
            id="message-text"
            style="border-radius: 8px"
            cols="40"
            class="data p-2 w-100"
          ></textarea>
    
          <button id="send-message-btn" style="margin-left: 0.5rem" class="btn btn-primary">
            Send
          </button>
        </div>
      </div>
    </div> */}

  //   <div class="row mb-4">
  //   <div class="col-sm-4"><p class="name">Connect With</p></div>
  //   <div class="col-sm-8">
  //     <div class="data d-flex">
  //       <select id="connectSelect" class="form-select" aria-label="Default select example">
  //         ${canConnectTo()}
  //       </select>
  //       <button id="connectTo" class="btn btn-primary ml-4">
  //         Connect 
  //       </button>
        
  //     </div>
  //   </div>
  // </div>


  // <div class="row mb-4">
  //   <div class="col-sm-4"><p style="font-size: 12px;" id="address-origin" class="name"></p></div>
  //   <div class="col-sm-8">
  //     <div id="msg-display" class="">
        
  //     </div>
  //   </div>
  // </div>