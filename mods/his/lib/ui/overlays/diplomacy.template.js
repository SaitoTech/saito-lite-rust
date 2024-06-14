module.exports = DiplomacyProposeTemplate = (obj) => {

	let his_self = obj.mod;

	let html = `
	  <div class="diplomacy-overlay">
	    <div class="left">
	      <div class="">make offer to whom?</div>
	      <div class="">
	        <div class="option">hapsburg</div>
	        <div class="option">england</div>
	        <div class="option">france</div>
	        <div class="option">papacy</div>
	        <div class="option">protestant</div>
	      </div>
	    </div>
	    <div class="right">
	      <div class="termbox">terms for discussion</div>
	      <div class="buttons">
	        <div class="mainmenu add" id="add" style="display: block;">conclude offers</div>
	      </div>
	    </div>
	  </div>
	`;

	return html;

};

