module.exports = DiplomacyProposeTemplate = (obj) => {

	let his_self = obj.mod;

	let html = `
	  <div class="diplomacy-propose-overlay">
	    <div class="help"></div>
	    <div class="content">you have made no proposals</div>
	    <div class="menu m4entries hide-scrollbar"></div>
	    <div class="buttons">
	      <div class="mainmenu add" id="add">create new proposal</div>
	      <div class="mainmenu end" id="end">finish diplomacy phase</div>
	      <div class="submenu also" id="also">add another requirement...</div>
	      <div class="submenu finish" id="finish">accept and submit proposal</div>
	      <div class="submenu delete" id="delete">delete (return to main menu)</div>
	    </div>
	  </div>
	`;

	return html;

};

