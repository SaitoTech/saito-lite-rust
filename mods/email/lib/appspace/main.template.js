
module.exports = EmailTemplate = (app, mod) => {

  let html = `

    <div class="email-appspace">

      <div class="saito-page-header">
        <div id="email-compose" class="saito-button-secondary small" style="float: right;">compose</div>
        <div id="email-outbox" class="saito-button-secondary small" style="float: right;">outbox</div>
        <div id="email-inbox" class="saito-button-secondary small" style="float: right;">inbox</div>
        <div id="saito-page-header-title" class="saito-page-header-title">SAITO EMAIL</div>
      </div>

      <div class="email-header">
      </div>
      <div class="email-body">
      </div>

    </div>

  `;

  return html;

}

