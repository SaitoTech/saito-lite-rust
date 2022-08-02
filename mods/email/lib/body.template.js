
module.exports = EmailDetailTemplate = (app, mod, email) => {

    let from  	= email.transaction.from[0].add;
    let to  	= email.transaction.to[0].add;
    let ts  	= email.transaction.ts;
    let txmsg   = email.returnMessage();
    let title   = txmsg.title;
    let text    = txmsg.text;

    let html = `

      <div class="email-view-header">
        <div class="email-view-from">
          <p>FROM:</p>
          <p class="email-detail-address-id">${from}</p>
        </div>
        <div class="email-view-to">
          <p>TO:</p>
          <p class="email-detail-address-id">${to}</p>
        </div>
      `;

    html += `
          <div>
            <div class="email-detail-timestamp">${datetime.hours}:${datetime.minutes}</div>
            <div class="email-detail-subject">${subject}</div>
          </div>
        </div>
        <div class="email-detail-message">
          <div class="email-detail-text"><div>${message.message}</div></div>
        </div>
      </div>
    `;
    return html;

}

