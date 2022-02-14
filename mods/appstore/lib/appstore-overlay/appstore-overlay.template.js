module.exports = AppStoreAppspaceTemplate = (app, mod, search_options) => {

  let default_text = "Install Applications";

  if (search_options?.search) {
    default_text = "Search: " + search_options.search;
  }

  return `
  
<div class="appstore-overlay-container">

  <div class="appstore-header-featured" style="">
    <div class="searchbox appstore-overlay-searchbox">
        <input type="text" class="appstore-search-box" placeholder="search for apps..." id="appstore-search-box">
    </div>
    <div class="appstore-header-title">Install Applications:</div>
  </div>

  <div class="appstore-overlay-grid" id="appstore-overlay-grid">
    <div class="game-loader-spinner loader" id="game-loader-spinner"></div>
  </div>

</div>

  `;
}
