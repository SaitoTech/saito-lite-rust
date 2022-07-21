module.exports = (app, mod, league) => {
  let html = `
      <div class="league-component-existing-league-box" id="${league.id}">
        
        <h2>${league.name}</h2>
        <div>Type: ${league.type}</div>
        <div>Algo: ${league.ranking}</div>
        <div>Players: ${league.playerCnt}${league.max_players > 0 ? ` / ${league.max_players}`:""}</div>
        <div>Admin: ${league.admin.substring(0,10)+"..."}</div>
        
    `;

    if ((league.myRank == undefined || league.myRank < 0) && (league.max_players == 0 || league.playerCnt < league.max_players)){
     html +=`<button class="league-component-existing-league" data-cmd="join" data-league-id="${league.id}">Join</button>`; 
    }
    html +=`<button class="league-component-existing-league" data-cmd="view" data-league-id="${league.id}">View</button>`;
    if (app.wallet.returnPublicKey() == league.admin) { 
     html += `<button class="league-component-existing-league" data-cmd="invite" data-league-id="${league.id}">Invite</button>`;
     html += `<button class="league-component-existing-league" data-cmd="delete" data-league-id="${league.id}">Delete</button>`;
    }

  html += `</div>`;

  return html;
}
