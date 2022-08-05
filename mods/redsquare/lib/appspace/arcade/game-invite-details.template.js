module.exports = GameCreatorTemplate = (app, mod) => {

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
