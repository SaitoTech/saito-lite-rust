

module.exports = (app, mod) => {

    return `

  <div class="redsquare-games-heading-container">
    <h4 class="">PLAY A GAME</h4>
    <p>Create a game by clicking on the boxes below, or join an game that is waiting for players by clicking on the invite in our right-hand sidebar.</p>
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
    <!--<div class="categories">
      <div class="saito-button-primary small">All</div>
      <div class="saito-button-secondary small">Chess</div>
      <div class="saito-button-secondary small">Settlers</div>
    </div>-->
  </div>

  <div class="rd-league-container">

    <div class="rd-league-box chess">
      <div class="rd-bg-img-cont"><i class="fas fa-solid fa-ellipsis-v"></i></div>
      <h4 class="league-heading">Chess League</h4>
      <div class="league-info-cont">
        <div class="league-info-link">How to play?</div>
        <div class="league-join-btn">Create Game</div>
      </div>
      <div class="league-info-cont right ranking">  
        <div class="heading">Top Players</div>
        <div class="item"><span>1.</span> Khan</div>
        <div class="item"><span>2.</span> David</div>
        <div class="item"><span>3.</span> Richard</div>
      </div>
    </div>

    <div class="rd-league-box settlers">
      <div class="rd-bg-img-cont"><i class="fas fa-solid fa-ellipsis-v"></i></div>
      <h4 class="league-heading">Settlers League</h4>
      <div class="league-info-cont">
        <div class="league-info-link">How to play?</div>
        <div class="league-join-btn">Create Game</div>
      </div>
      <div class="league-info-cont right ranking">  
        <div class="heading">Top Players</div>
        <div class="item"><span>1.</span> Khan</div>
        <div class="item"><span>2.</span> David</div>
        <div class="item"><span>3.</span> Richard</div>
      </div>
    </div>

  </div>
  `;

}

