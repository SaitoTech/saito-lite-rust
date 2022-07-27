module.exports = (app, mod, listeners) => {
  //
  // METHOD NOT USED ANYWHERE???
  //
  const canConnectTo = () => {
    let html = "";
    for (let i = 0; i < listeners.length; i++) {
      html += `<option  data-id="${listeners[i]}"> ${listeners[i]}</option>`;
    }

    return html;
  }

  return `<card class="appear my-stun-container">

                <h2> Saito Video <span class="saito-badge">α</span></h2>
                <p>  Use Saito to start a peer-to-peer video chat!</p>
                <div class="my-stun-container-actions">
                <div class="my-stun-container-create">
                <button id="createInvite" class="saito-button-secondary"> Create Invite</button>
                </div>
                <div class="my-stun-container-join">
                  <div>
                  <button id="joinInvite" class="saito-button-secondary">Join</button>
                  <input type="text" placeholder="Insert Room Code" id="inviteCode" />
                  </div>
            
                </div>
                </div>
                <div class="my-stun-cointainer-info">
                  <i class="fas fa-info-circle"></i>
                  <span class="saito-info-text">Saito uses the blockchain to negotiate peer-to-peer connections. Please note that connections can be more unstable and take longer to negotiate if you are on a mobile network or behind an aggressive firewall. </span>
                </div>
    
          </card>`;
}
