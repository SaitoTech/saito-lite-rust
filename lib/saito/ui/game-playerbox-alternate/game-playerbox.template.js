module.exports = GamePlayerBoxTemplateAlt = (player_num) => {
  return `
  <div class="card1" id="player-box-${player_num}">
  <div class="inner" id="player-box-graphic-${player_num}" ></div>
  <div id="player-box-head-${player_num}">

  </div>
  
  <div id="player-box-info-${player_num}">

  </div>
  
  <div  id="player-box-log-${player_num}">
   
  </div>
  </div>
  `;
}


// head 
{/* <p>2159FwuHycjq2h9hj4...</p>
<img  src="images/nft avatar p1.png" alt="" /> */}


// info
  {/* <h3 style="display: inline; margin-left: 35.8px; color: white">
    Player 1 :
  </h3>
  <div class="player"><h2 class="valueP">15</h2></div> */}

// log
 {/*<div class="score"> <h2 class="text">LOT:</h2>
    <h2 class="value">4</h2> </div> */}



// ` <div class="card1" id="player-box-${player_num}">
// <div class="player-box-graphic" id="player-box-graphic-${player_num}"></div> 
// <div class="player-box-head" id="player-box-head-${player_num}"></div>
// <div class="player-box-info" id="player-box-info-${player_num}"></div>
// <div class="plog" id="player-box-log-${player_num}"></div>
// </div>
// </div>`