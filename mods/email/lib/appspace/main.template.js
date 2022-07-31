
module.exports = EmailTemplate = (app, mod) => {

  let html = `

    <div class="email-appspace">

      <div class="saito-page-header">
        <div id="email-compose" class="saito-button-primary small" style="float: right;">compose</div>
        <div id="email-outbox" class="saito-button-secondary small" style="float: right;">outbox</div>
        <div id="email-inbox" class="saito-button-secondary small" style="float: right;">inbox</div>
        <div id="saito-page-header-title" class="saito-page-header-title">SAITO EMAIL</div>
        <div id="saito-page-header-text" class="saito-page-header-text">Saito supports key-to-key email messaging. If you have a shared secret with recipient all communications will be encrypted in-transit.</div>
      </div>

      <div class="email-list saito-table">

      </div>

    </div>

  `;

  return html;

}

