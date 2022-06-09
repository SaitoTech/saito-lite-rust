
module.exports = ChatSidebarContactTemplate = (app, group) => {

  let datetime = app.browser.formatDate(new Date().getTime());
  let description = "";

  if (group.txs.length == 0) {
    description = "New Chat Room";
  }

  return `
    <div id="${group.id}" class="chat-row">
      <img class="chat-row-image" src="${app.keys.returnIdenticon(group.members[0])}">
      <div class="chat-content">
          <div class="chat-group-name">${group.name}</div>
          <div id="chat-last-message-${group.id}" class="chat-last-message">${sanitize(description)}</div>
      </div>
      <div style="display; grid;">
        <div class="chat-last-message-timestamp">${datetime.hours}:${datetime.minutes}</div>
      </div>
    </div>
  `;
}
