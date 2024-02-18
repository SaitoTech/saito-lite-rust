module.exports = DiplomacyProposeTemplate = (obj) => {

	let html = `
	  <div class="diplomacy-confirm-overlay">
	    <div class="help"></div>
	    <div class="content"></div>
	    <div class="buttons">
	      <div class="accept" id="accept">accept</div>
	      <div class="reject" id="reject">reject</div>
	    </div>
	  </div>
	`;

	return html;

};

