module.exports = (app, mod, game) => {

  let html = `
      <div class="league-component-existing-league-box">
        
        <h2>${game.game}</h2>
        <p>Type: ${game.type}</p>
        <p>Admin: ${game.publickey}</p>
        
    `;

    if (!game.admin) { 
        html +=`<button type="submit">Join League</button>`;
    } else {
        html += '<a href="#">Invite</a>';
    }

  html += `
      </div>
  `;

  return html;
}
