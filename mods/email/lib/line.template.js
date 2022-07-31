
module.exports = EmailLineTemplate = (app, mod, tx) => {

    let from  	= tx.transaction.from[0].add;
    let to  	= tx.transaction.to[0].add;
    let ts  	= tx.transaction.ts;
    let txmsg   = tx.returnMessage();
    let id      = tx.transaction.sig;
    let message	= txmsg.content;
    let subject = txmsg.title;

    let html = `
      <div class="saito-table-row">
        <div class="email-line-checkbox"><input type="checkbox" name="email-checkbox" data-id="${id}" /></div>
        <div class="email-line-from">${app.keys.returnUsername(from)}</div>
        <div class="email-line-title">${subject}</div>
        <div class="email-line-time">4:53</div>
      </div>
    `;

    return html;

}

