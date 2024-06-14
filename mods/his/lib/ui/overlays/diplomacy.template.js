module.exports = DiplomacyProposeTemplate = (obj) => {

	let his_self = obj.mod;

	let html = `
	  <div class="diplomacy-overlay">
	    <div class="left">
	      <div class="status">make offer to whom?</div>
	      <div class="controls">
		<ul>
	          <li class="option hapsburg" id="hapsburg">hapsburg</li>
	          <li class="option england" id="england">england</li>
	          <li class="option france" id="france">france</li>
	          <li class="option papacy" id="papacy">papacy</li>
	          <li class="option protestant" id="protestant">protestant</li>
	        </ul>
	      </div>
	    </div>
	    <div class="right">
	      <div class="help">terms for discussion</div>
	      <div class="proposals"></div>
	      <div class="button submit">submit</div>
	    </div>
	  </div>
	`;

	return html;

};

