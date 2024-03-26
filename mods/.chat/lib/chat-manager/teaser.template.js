module.exports = ChatTeaser = (app, mod, group, chat_open) => {
	let id = group.id;

	let last_msg = '<em>new chat</em>';
	let time = '';

	if (group.txs.length > 0) {
		let tx = group.txs[group.txs.length - 1];

		const regex3 = /<div class="file-name">[^>]*>/i;

		if (tx.msg.indexOf('<img') == 0) {
			last_msg = '<em>[image]</em>';
		} else if (regex3.test(tx.msg)) {
			last_msg = tx.msg.match(regex3)[0];
		} else {
			last_msg = app.browser.sanitize(tx.msg);
		}

		const regex = /<blockquote.*<\/blockquote>/is;
		last_msg = last_msg.replace(regex, '<em>RE:</em> ').replace('<br>', '');
		const regex2 = /<a[^>]+>/i;
		last_msg = last_msg.replace(regex2, '').replace('</a>', '');

		last_msg = last_msg.replace('saito-mention saito-address treated', '');
	}

	let identicon_source = id;

	if (group.members.length == 2 && !group?.member_ids) {
		for (let mem of group.members) {
			if (mem !== mod.publicKey) {
				identicon_source = mem;
			}
		}
	}

	let notification = group?.notification ? ' new-notification' : '';
	group.notification = false;

	let imgsrc = app.keychain.returnIdenticon(identicon_source);

	let classes = "saito-user " + notification;
	if (group?.online) {
		classes += " online";
	}
	if (chat_open){
		classes += " saito-chat-active";
	}

	let html = `
  <div class="${classes}" id="saito-user-${id}" data-id="${id}" data-disable="true">
    <div class="saito-identicon-box">
      <img class="saito-identicon" src="${imgsrc}" data-disable="true"/>
    </div>
    <div class="saito-address saito-address-long">
    	<div class="saito-address" data-id="${group.name}" data-disable="true">${group.name}</div>
    	${group?.muted ? `<i class="fa-solid fa-volume-xmark"></i>` : ""}
    </div>
    <div class="saito-userline">${last_msg}</div>
    <div class="saito-chat-notifications">`;

    if (group.mentioned){
    	html += `<div class="saito-notification-dot">@</div>`;
    }
    if (group.unread > 0){
    	html += `<div class="saito-notification-dot">${group.unread}</div>`;
    }

  html += `</div>
    <div class="online-status-indicator"></div>
  </div>`;

  return html;
};
