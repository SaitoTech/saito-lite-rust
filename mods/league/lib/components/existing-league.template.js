module.exports = (app, mod, league) => {
  console.log(JSON.parse(JSON.stringify(league)));
  let html = `
      <div class="league-component-existing-league-box">
        
        <h2>${league.league_name}</h2>
        <div>Type: ${league.type}</div>
        <div>Admin: ${league.admin}</div>
        
    `;

    if (app.wallet.returnPublicKey() !== league.admin) { 
        html +=`<button class="league-component-existing-league league-join" data-league-id="${league.id}">Join League</button>`;
    } else {
        html += '<button class="league-component-existing-league league-invite" data-league-id="${league.id}">Invite</button>';
    }

  html += `</div>`;

  return html;
}
