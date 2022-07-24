module.exports = (app, mod, game) => {

  let html = `
      <div class="league-component-existing-league-box">
        
        <h2>${game.game}</h2>
        <p>Type: ${game.type}</p>
        <p>Admin: ${game.publickey}</p>
        
    `;

    if (!game.admin) { 
        html +=`<button class="league-component-existing-league-join" data-league-id="${game.id}">Join League</button>`;
    } else {
        html += '<a href="#" class="league-component-existing-league-invite">Invite</a>';
    }

  html += `
      </div>
  `;

  return html;
}
