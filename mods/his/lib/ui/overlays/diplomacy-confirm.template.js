module.exports  = (obj, proposal, proposal_idx=0, faction="") => {

	let help = `${obj.mod.returnFactionName(faction)} - ${obj.mod.returnFactionName(proposal.proposer)} offers the following pact:`;

	let terms = obj.mod.convertTermsToText(proposal.terms);
	let proposal_html = '<ul>';
	for (let i = 0; i < terms.length; i++) { proposal_html += `<li>${terms[i]}</li>`; }
	proposal_html += '</ul>';

	let html = `
	  <div class="diplomacy-confirm-overlay">
	    <div class="help">${help}</div>
	    <div class="content">${proposal_html}</div>
	    <div class="buttons">
	      <div class="accept" id="accept">accept</div>
	      <div class="reject" id="reject">reject</div>
	    </div>
	  </div>
	`;

	return html;

};

