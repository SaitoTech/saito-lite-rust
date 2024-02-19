module.exports = DiplomacyProposeTemplate = (obj, proposals_html="") => {

	let his_self = obj.mod;

	let html = `
	  <div class="diplomacy-proposal-overlay">
	    <div class="help"></div>
	    <div class="content">${proposals_html}</div>
	    <div class="buttons">
	      <div class="add" id="add">add proposal</div>
	      <div class="end" id="end">end diplomacy</div>
	    </div>
	  </div>
	`;

	return html;

};

