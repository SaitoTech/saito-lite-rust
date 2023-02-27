module.exports = (app, mod, league) => {

  let html = `
      <div class="league-component-existing-league-box" id="${league.id}">
        <div class="league-component-existing-league-details">
          <h2>${league.name}</h2>
          <div>Type: ${league.status}</div>
          <div>Algo: ${league.ranking_algorithm}</div>
          <div>Players: ${league.players.length}</div>
          <div>Admin: ${league.admin.substring(0,10)+"..."}</div>
        </div>
        <div class="league-component-existing-league-controls">`;

    if ((league.myRank == undefined || league.myRank < 0) && (league.max_players == 0 || league.playerCnt < league.max_players)){
     html +=`<button class="league-component-existing-league league-join-button">Join</button>`; 
    }

    html +=`<button class="league-component-existing-league league-view-button">View</button>`;

    if (app.wallet.returnPublicKey() == league.admin) { 
      html += `<button class="league-component-existing-league league-invite-button">Invite</button>`;
      html += `<button class="league-component-existing-league league-delete-button">Delete</button>`;
    }

  html += `</div></div>`;

  return html;
}
