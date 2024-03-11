module.exports = DiplomacyProposeTemplate = (obj) => {

	let his_self = obj.mod;

	let html = `
	  <div class="diplomacy-propose-overlay">
	    <div class="help">do you wish to propose an agreement</div>
	    <div class="content">you have made no proposals</div>
	    <div class="menu m4entries hide-scrollbar"></div>
	    <div class="buttons">
	      <div class="mainmenu add" id="add">create proposal</div>
	      <div class="mainmenu end" id="end">no thanks</div>
	      <div class="submenu also" id="also">add more requirements...</div>
	      <div class="submenu finish" id="finish">accept this proposal...</div>
	      <div class="submenu delete" id="delete">delete this proposal...</div>
	    </div>
	  </div>
	`;

	return html;

};

