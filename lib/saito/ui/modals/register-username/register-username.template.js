module.exports = RegisterUsernameTemplate = () => {

  return `  
  <div class="welcome-modal-wrapper saito-modal">
    <div class="welcome-modal-action">
      <div class="welcome-modal-left">
        <div class="welcome-modal-header">Welcome to Saito</h1></div>
        <div class="welcome-modal-main">
          <div class="welcome-modal-text">You currently have an Anonymous Account, which means when you play games, other players will know you by your public key. Do yourself and your friends a favor by picking a human readable username:</div>
          <div class="welcome-modal-input-container">
            <input class="welcome-modal-input" id="registry-input" type="text" placeholder="username">
            <span>@saito</span>
          </div>
        </div>
      <div class="register-modal-controls">
      <button class="welcome-modal-button button" id="registry-modal-button">REGISTER USERNAME</button>  
      <div class="welcome-modal-info">
      </div>
    </div>
  </div>
  `;

}
