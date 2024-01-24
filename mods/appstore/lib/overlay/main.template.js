module.exports = AppStoreAppspaceTemplate = (app, mod, search_options) => {
	let default_text = 'Install Applications';

	if (search_options?.search) {
		default_text = 'Search: ' + search_options.search;
	}

	return `
    <div class="appstore-overlay">
      <div class="appstore-overlay-header">
        <div class="appstore-overlay-header-title">
          Install New Applications
        </div>
        <div class="appstore-overlay-searchbox">
          <input type="text" placeholder="search for apps..." class="appstore-overlay-searchbox-input" id="appstore-overlay-searchbox-input">
        </div>
      </div>
      <div class="appstore-overlay-apps" id="appstore-overlay-apps">
	<div class="saito-loader" id="saito-loader"></div>
      </div>
    </div>
  `;
};
