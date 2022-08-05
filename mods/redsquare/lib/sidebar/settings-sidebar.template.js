module.exports = RedSquareGamesSidebarTemplate = (app, mod) => {

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
</div>

  <div class="settings-appspace-versions-container">
    <h6> Version </h6>
    <div class="settings-appspace-versions">
      <p class="saito-black">Code Version:</p>
      <p>${app.wallet.wallet.version}</p>
      <p class="saito-black">Wallet Version:</p>
      <p>${app.options.wallet.version}</p>
    </div>
  </div>

  <div class="settings-appspace-icons-container">
    <h6> Help </h6>
    <div class="settings-appspace-icons"  style="padding-bottom:40px;">
    <div><a target="_blank" href="https://discord.gg/HjTFh9Tfec"><i class="fab fa-discord"></i></a></div>
    <div class="saito-black">Discord</div>

    <div> <a target="_blank" href="https://t.me/SaitoIO"><i class="fab fa-telegram"></i></a></div>
    <div class="saito-black">Telegram</div>

     <div> <a target="_blank" href="https://github.com/SaitoTech"> <i class="fab fa-github"></i></a></div>
    <div class="saito-black">Github</div>    
  </div>


  `;


}

