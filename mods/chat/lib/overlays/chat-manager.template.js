module.exports  = (app, mod) => {
	let mobile = app.browser.isMobileBrowser() || window.innerWidth < 600;

	return `<div id="chat-manager-overlay" class="chat-manager-overlay ${
		mobile ? ' static-mobile-overlay' : ' floating-cm-overlay'
	}"></div>`;
};
