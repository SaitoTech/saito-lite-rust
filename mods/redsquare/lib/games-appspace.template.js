
module.exports = (app, mod) => {

    return `

  <div class="redsquare-games-heading-container">
    <h4 class="">SAITO LEAGUES</h4> 
    <a href="#">Create New League</a>
    <p>or join existing ones to compete with other players and climb the ranking</p>
  </div>
  <div class="redsquare-games-toolbar-container">
    <div class="saito-select">
      <select class="saito-slct">
        <option value="new">Newest</option>
        <option value="popular">Popular</option>
        <option value="joined">Joined</option>
        <option value="not-joined">Not Joined</option>
      </select>
    </div>
    <div class="categories">
      <div class="saito-button-primary small">All</div>
      <div class="saito-button-secondary small">Chess</div>
      <div class="saito-button-secondary small">Settlers</div>
    </div>
  </div>

  <div class="rd-league-container">
    
    <div class="rd-league-box chess">
      <div class="rd-bg-img-cont"><i class="fas fa-solid fa-ellipsis-v"></i></div> 
      <h4 class="league-heading">Khan's Chess League</h4>
      <div class="league-info-cont">  
        <div class="league-players">20 Players</div>
        <div class="league-stake">10 TRX at stake</div>
        <div class="league-join-btn">Join League</div>
      </div>
    </div>

    <div class="rd-league-box settlers">
      <div class="rd-bg-img-cont"><i class="fas fa-solid fa-ellipsis-v"></i></div> 
      <h4 class="league-heading">Settlers League</h4>
      <div class="league-info-cont">  
        <div class="league-players">100 Players</div>
        <div class="league-stake">No bets</div>
        <div class="league-join-btn">Joined</div>
      </div>
    </div>

  </div>
  `;

}

