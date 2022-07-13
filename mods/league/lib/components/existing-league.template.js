module.exports = (app, mod, league) => {
  console.log(JSON.parse(JSON.stringify(league)));
  let html = `
      <div class="league-component-existing-league-box">
        
        <h2>${league.name}</h2>
        <div>Type: ${league.type}</div>
        <div>Algo: ${league.ranking}</div>
        <div>Players: ${league.playerCnt} / ${league.max_players}</div>
        <div>Admin: ${league.admin.substring(0,10)+"..."}</div>
        
    `;

    if (app.wallet.returnPublicKey() == league.admin) { 
     html += `<button class="league-component-existing-league" data-cmd="invite" data-league-id="${league.id}">Invite</button>`;
    }
    if (league.myRank == undefined || league.myRank < 0){
     html +=`<button class="league-component-existing-league" data-cmd="join" data-league-id="${league.id}">Join</button>`; 
    }
    html +=`<button class="league-component-existing-league" data-cmd="view" data-league-id="${league.id}">View</button>`;

  html += `</div>`;

  return html;
}
