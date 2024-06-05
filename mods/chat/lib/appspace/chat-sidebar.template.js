const MemberList = require("../overlays/member-list.template");

module.exports = ChatSideTemplate = (app, mod, group) => {
	return `
	<div id="chat-sidebar" class="chat-sidebar">
    	<div class="saito-profile"></div>
      	${MemberList(app, mod, group)}
    </div>`;
};
