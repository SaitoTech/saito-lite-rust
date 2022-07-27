
module.exports = RedSquareSidebarTemplate = (app, mod) => {

  return `

  <div class="saito-sidebar right">

  <div class="redsquare-sidebar-calendar">
  </div>

  <div class="saito-leaderboard">
    <h6>Your Rankings:</h6>
    <div class="saito-table">
      <div class="saito-table-row odd">
          <div class="saito-table-gamename">Twilight Struggle</div>
          <div class="saito-table-rank">4</div>
      </div>
      <div class="saito-table-row">
          <div class="saito-table-gamename">Red Imperium</div>
          <div class="saito-table-rank">97</div>
      </div>
      <div class="saito-table-row odd">
          <div class="saito-table-gamename">Spider Solitaire</div>
          <div class="saito-table-rank">1435</div>
      </div>
      <div class="saito-table-row">
          <div class="saito-table-gamename">Settlers of Saitoa</div>
          <div class="saito-table-rank">352</div>
      </div>
      <div class="saito-table-row odd">
          <div class="saito-table-gamename">Pandemic</div>
          <div class="saito-table-rank">4242</div>
      </div>
      <div class="saito-table-row">
          <div class="saito-table-gamename">Blackjack</div>
          <div class="saito-table-rank">2222</div>
      </div>
      <div class="saito-table-row odd">
          <div class="saito-table-gamename">Chess</div>
          <div class="saito-table-rank">1283</div>
      </div>
      <div class="saito-table-row">
          <div class="saito-table-gamename">Poker</div>
          <div class="saito-table-rank">924</div>
      </div>
      <div class="saito-table-row odd">
          <div class="saito-table-gamename">Solitrio Solitaire</div>
          <div class="saito-table-rank">63</div>
      </div>
      <div class="saito-table-row">
          <div class="saito-table-gamename">Wordblocks</div>
          <div class="saito-table-rank">1452</div>
      </div>
      <div class="saito-table-row odd">
          <div class="saito-table-gamename">Wuziqi</div>
          <div class="saito-table-rank">843</div>
      </div>
  </div>

  <div id="redsquare-follow-container">
      <h6> Who to follow </h6>
      <div>
          <div class="saito-list">
              <div class="saito-list-user">
                  <div class="saito-list-user-image-box">
                      <img class="saito-idenitcon" src="/redsquare/images/david.jpeg" />
                  </div>
                  <div class="saito-list-user-content-box">
                      <div class="saito-username">David Lancashire
                      </div>
                      <p> @trevelyan </p>
                  </div>
              </div>
              <div class="saito-list-user">
                  <div class="saito-list-user-image-box">
                      <img class="saito-idenitcon" src="/redsquare/images/richard.jpeg" />
                  </div>
                  <div class="saito-list-user-content-box">
                      <div class="saito-username">Richard Parris</div>
                      <p> @arpee</p>
                  </div>
              </div>
          </div>
      </div>
  </div>
</div>


  `;


}

