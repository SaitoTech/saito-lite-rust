module.exports = EmailComposeTemplate = (app, mod) => {

  return `
    <div class="email-compose">
      <input id="email-to-address" class="email-to-address" type="text" placeholder="To: " value="" placeholder="To: ">
      <input id="email-subject" class="email-subject" type="text" placeholder="Subject: " value="">
      <textarea rows="5" class="email-compose-text" placeholder="" value=""></textarea>
      <div class="email-compose-controls">
        <div class="saito-button-secondary small email-compose-submit">Send</div>
      </div>
    </div>
  `
};
