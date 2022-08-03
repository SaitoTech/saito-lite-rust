module.exports = DebugAppspaceMainTemplate = () => {
  return `
  
    <div class="saito-page-header">
      <div id="saito-page-header-title" class="saito-page-header-title">DEBUG WALLET</div>
      <div id="saito-page-header-text" class="saito-page-header-text">This module permits exploring the contents of your Saito Wallet. Please remember to backup your wallet if you wish to keep it over time.</div>
    </div>

  <div style="clear:both;padding-top:10px;padding-bottom:10px;" id="appspace-debug" class="appspace-debug"></div>

  `;
}
