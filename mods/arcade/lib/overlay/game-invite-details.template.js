module.exports = GameInviteDetailsTemplate = (app, mod, invite = null) => {
  if (!invite){
    return dummyHTML();  
  }

  let gameModule = app.modules.returnModule(invite.msg.game);
  if (!gameModule){
    return dummyHTML();
  }

  let game_name = gameModule.gamename || gameModule.name;
  let gamemod_url = gameModule.respondTo("arcade-games")?.img || `/${gameModule.returnSlug()}/img/arcade.jpg`;


  let html = `
    <div class="game-invite-detail-container" style="
        width: 71rem;
        background-color: #fff;
        min-height: 38rem;
        display: flex;
        justify-content: initial;
    ">
      <div class="game-invite-details-item game-invite-img" style="
          width: 30%;
          background-color: #f7d3d9;
          background: url(${gamemod_url});
          background-size: cover;
      "></div>
      <div class="game-invite-details-item game-invite-info" style="
           padding: 2.5rem;
        width: 69%;
      ">
         <h5>${game_name}</h5>

      <div class="saito-leaderboard game-invite-info-table" style="
          margin-top: 2rem;
      ">
        <div class="saito-table">
          ${formatOptions(gameModule.returnShortGameOptionsArray(invite.msg.options))}
        </div>
      </div>`;

    if (invite.msg.originator !== app.wallet.returnPublicKey()){
      html += `<div class="saito-button-primary game-invite-join-btn" style="margin-top: 2rem;">Join Game</div>`;
    }

    html += `</div></div>`;

    return html;
}

const formatOptions = (sgoa)=> {
  let html = '';
  let cnt = 1;

  for (let i in sgoa) {
    html += `<div class="saito-table-row ${(cnt%2 == 1)? "odd":""}">
                <div class="saito-table-gamename">${i.replace(/_/g, ' ')}</div>`;
    if (sgoa[i] !== null){
      html += `<div class="saito-table-rank">${sgoa[i]}</div>`;
    }
    html += "</div>";
  }

  return html;
}

const dummyHTML = () =>{
    return `
<div class="game-invite-detail-container" style="
    width: 71rem;
    background-color: #fff;
    min-height: 38rem;
    /* border-radius: 1.2rem; */
    /* padding: 2.5rem; */
    /* border: 1px solid red; */
    display: flex;
    justify-content: initial;
">
          <div class="game-invite-details-item game-invite-img" style="
    /* border: 1px solid red; */
    width: 30%;
    background-color: #f7d3d9;
    background: url('https://saito.io/twilight/img/arcade/arcade.jpg');
    background-size: cover;
"></div>
          <div class="game-invite-details-item game-invite-info" style="
    /* border: 1px solid red; */
    padding: 2.5rem;
    width: 69%;
">
            <h5>Twilight Struggle</h5>

<div class="saito-leaderboard game-invite-info-table" style="
    margin-top: 2rem;
">
    <div class="saito-table">
      <div class="saito-table-row odd">
          <div class="saito-table-gamename">Player 1</div>
          <div class="saito-table-rank">US</div>
      </div>
      <div class="saito-table-row">
          <div class="saito-table-gamename">Player 2</div>
          <div class="saito-table-rank">USSR</div>
      </div>
      
      
      <div class="saito-table-row odd">
          <div class="saito-table-gamename">Time Limit</div>
          <div class="saito-table-rank">None</div>
      </div>
      <div class="saito-table-row">
          <div class="saito-table-gamename">Observer Mode</div>
          <div class="saito-table-rank">Disable</div>
      </div>
      
    <div class="saito-table-row odd">
          <div class="saito-table-gamename">US Bonus</div>
          <div class="saito-table-rank">2</div>
      </div>
            
      
      
      
  </div>

  
</div>

<div class="saito-button-primary game-invite-join-btn" style="
    margin-top: 2rem;
">Join Game</div>

          </div>
    </div>
  `;

}