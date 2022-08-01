module.exports = EmailFormTemplate = (address, title, msg) => {

  return `
    <div class="email-compose">

      <div class="email-compose-header">
        <div>From:</div>
        <div><input id="email-from-address" class="email-from-address" type="text" readonly></div>
        <div>To:</div>
        <div><input id="email-to-address" class="email-to-address" type="text" placeholder="recipient address" value="${address}">
      </div>

      <div class="email-compose-body">
        <input class="email-compose-title" type="text" placeholder="Subject" value="${title}">
        <div id="email-compose-text" class="email-text markdown" placeholder="Message">${msg}</div>
      </div>

      <div class="email-compose-controls">
        <div class="saito-button-secondary email-compose-submit">Send</div>
      </div>

    </div>
  `
};
