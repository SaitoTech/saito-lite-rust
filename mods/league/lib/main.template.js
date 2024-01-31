module.exports = () => {
	return `
    <div class="league-main-container" id="league-main-container">
    <div class="saito-module">
      <div class="saito-module-details-box">
        <div class="saito-module-title">Community Leagues</div>
        <div class="saito-module-description">Create and join leagues to compete against other players in specific games, chat, and make friends</div>
      </div>
      <div class="saito-module-action" id="create-new-league">New League</div>
    </div>
    <div class="league-component-existing-league" id="leagues-for-admin"></div>
    <div class="league-component-existing-league" id="leagues-for-play"></div>
    <div class="league-component-existing-league" id="leagues-for-join"></div>
    `;
};
