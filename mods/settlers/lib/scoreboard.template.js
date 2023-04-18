module.exports = SettlersScoreboardTemplate = (scoreboard) => {


  let html = '';
  html += `
    <div class="scoreboard">
    <div class="VP-track-label" id="VP-track-label">Victory Points</div>
  `;

  for (let j = 8; j >= 0; j--) {
    html += '<div class="vp ' + j + '-points"><div class="player-vp-background">' + j + '</div>';
    html += '<div class="vp-players">'
    for (let i = 0; i < scoreboard.mod.game.state.players.length; i++) {
      if (scoreboard.mod.game.state.players[i].vp == j) {
        html += `  <div class="player-vp" style="background-color:var(--p${scoreboard.mod.game.colors[i]}-color);"><div class="vp-faction-name">${scoreboard.mod.game.playerNames[i]}</div></div>`;
      }
    }
    html += '</div></div>';
  }
  html += '</div>';

  return html;
}


