module.exports  = (obj) => {

	let his_self = obj.mod;

	let html = `
	  <div class="diplomacy-propose-overlay">
	    <div class="help">do you wish to make a diplomatic proposal?</div>
	    <div class="content">do you wish to make a diplomatic proposal?</div>
	    <div class="menu m4entries hide-scrollbar"></div>
	    <div class="buttons">
	      <div class="mainmenu add" id="add">yes, create</div>
	      <div class="mainmenu end" id="end">no, pass</div>
	      <div class="submenu also" id="also">add more terms...</div>
	      <div class="submenu finish" id="finish">accept this proposal...</div>
	      <div class="submenu delete" id="delete">delete this proposal...</div>
	    </div>
	  </div>
	`;

	return html;

};

