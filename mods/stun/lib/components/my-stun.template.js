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
            <div class="row mb-4">
              <div class="col-sm-4"><p class="name">Create Invite</p></div>
              <div class="col-sm-8">
                <div class="data d-flex">
                <button id="createInvite" class="btn btn-primary ml-4"> Create Invite</button>
                </div>
              </div>
            </div>
              <div class="row mb-4">
              <div class="col-sm-4"><p class="name">Join Call</p></div>
              <div class="col-sm-8">
                <div class="data d-flex">
                <input placeholder="Insert Room Code" id="inviteCode" />
                <button id="joinInvite" class="btn btn-primary ml-4">Join</button>
                </div>
              </div>
            </div>
          </card>`;
}
