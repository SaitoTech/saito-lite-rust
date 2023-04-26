const AddUsersTemplate = (app, mod, code) => {
  return `
    <div class="add-users-container saito-modal saito-modal-add-contact">
    <div class="saito-modal-title">Copy Invitation Link</div>
    <div class="saito-modal-content">
     <div class="add-users-container">
      <h4 class="add-users-header"> Share this call link with others you want in the call </h4>
      <div class="add-users-code-container"> <span> ${code.slice(0, 30)}... </span> <i class="fas fa-copy"> </i> </div>
      <p class="add-users-footer-text"> Joined as ${app.wallet.getPublicKey()} </p>
      </div>
    </div>
  </div>
     `
}

module.exports = AddUsersTemplate;


// <main>
// <section class="footer">
//   <i class="audio-control fa fa-microphone" aria-hidden="true"></i>
//   <i class="video_control fas fa-video" aria-hidden="true"></i>
//   <button class="disconnect_btn ">Disconnect</div>
// </section>
// </main>
