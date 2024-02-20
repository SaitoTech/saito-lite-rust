module.exports = DiplomacyProposeTemplate = (obj, proposals_html="") => {

	let his_self = obj.mod;

	let html = `
	  <div class="diplomacy-proposal-overlay">
	    <div class="help"></div>
	    <div class="content">${proposals_html}</div>
	    <div class="menu"></div>
	    <div class="buttons">
	      <div class="mainmenu add" id="add">add proposal</div>
	      <div class="mainmenu end" id="end">end diplomacy</div>
	      <div class="submenu also" id="also">also require...</div>
	      <div class="submenu finish" id="finish">finish proposal</div>
	    </div>
	  </div>
	`;

	return html;

};

