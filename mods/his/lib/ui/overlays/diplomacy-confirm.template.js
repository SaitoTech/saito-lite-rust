module.exports = DiplomacyConfirmTemplate = (obj, proposal, proposal_idx=0) => {

	let terms = obj.mod.convertTermsToText(proposal);

	let proposal_html = '<ul>';
	for (let i = 0; i < terms.length; i++) {
	  proposal_html += `<li>${terms[i]}</li>`;
	}
	proposal_html += '</ul>';

	let html = `
	  <div class="diplomacy-confirm-overlay">
	    <div class="help"></div>
	    <div class="content">${proposal_html}</div>
	    <div class="buttons">
	      <div class="accept" id="accept">accept</div>
	      <div class="reject" id="reject">reject</div>
	    </div>
	  </div>
	`;

	return html;

};

