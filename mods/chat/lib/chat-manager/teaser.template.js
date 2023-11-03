module.exports = ChatTeaser = (app, mod, group) => {
  let id = group.id;

  let last_msg = "<em>new chat</em>";
  let last_ts = new Date().getTime();
  let time = "";

  if (group.txs.length > 0) {
    let tx = group.txs[group.txs.length - 1];
    last_msg = tx.msg.indexOf("<img") == 0 ? "<em>[image]</em>" : app.browser.sanitize(tx.msg);
    const regex = /<blockquote>.*<\/blockquote>/is;
    last_msg = last_msg.replace(regex, "<em>reply</em>: ").replace("<br>", "");
    const regex2 = /<a[^>]+>/i;
    last_msg = last_msg.replace(regex2, "").replace("</a>", "");
    last_ts = tx.timestamp;
    let x = app.browser.formatDate(last_ts);
    time = x.hours + ":" + x.minutes;
  }

  let identicon_source = id;

  if (group.members.length == 2) {
    for (let mem of group.members) {
      if (mem !== mod.publicKey) {
        identicon_source = mem;
      }
    }
  }

  let imgsrc = app.keychain.returnIdenticon(identicon_source);

  return `
  <div class="saito-user${
    group?.online ? " online" : ""
  }" id="saito-user-${id}" data-id="${id}" data-disable="true">
    <div class="saito-identicon-box">
      <img class="saito-identicon" src="${imgsrc}" data-disable="true"/>
    
    </div>
    <div class="saito-address saito-address-long" data-id="${group.name}" data-disable="true">${
    group.name
  }</div>
    <div class="saito-userline">${last_msg}</div>
    ${time && `<div class="saito-datetime">${time}</div>`}
    ${group.unread > 0 ? `<div class="saito-notification-dot">${group.unread}</div>` : ""}
    <div class="online-status-indicator"></div>
  </div>
  `;
};
