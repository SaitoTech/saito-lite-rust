module.exports  = (title = 'Games') => {
	return `
      <div class="league-leaderboard">
        <div class="saito-table">
          <div class="saito-table-header">
            <div class="right-align">Rank</div>
            <div>Player</div>
            <div>Score</div>
            <div class="right-align">${title}</div>
            <div class="right-align">Wins</div>
          </div>
          <div class="saito-table-body"></div>
        </div>
        <div class="leaderboard-updating-msg">Updating...</div>
      </div>

  `;
};
