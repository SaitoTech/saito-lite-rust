module.exports = SaitoModuleOverlayTemplate = (app, mod) => {

  let html = `
      
<div class="league-join-overlay-box">

        <div class="saito-module-imagebox" style="background-image: url('/TWILIGHT/img/arcade/arcade.jpg');min-height: 240px;min-width: 35rem;border: 1px solid;/* background: url(/saito/img/dreamscape.png); */background-size: cover;display: flex;flex-direction: column;justify-content: flex-end;">
      <div class="saito-module-imagebox-titlebar">
         <span class="saito-module-imagebox-title">Twilight Struggle</span>
         
      </div>
    </div>
        
        <div class="league-join-controls">
      <form id="league-join-form" data-league-id="POKER">
          
      <div class="saito-leaderboard saito-module-overlay-info-table" style="
    padding: 1.5rem 0rem;
">
        <div class="saito-table">
          <div class="saito-table-row odd" style="
    grid-template-columns: 50% 50%;
">
                <div class="saito-table-gamename">player1</div><div class="saito-table-rank">random</div></div><div class="saito-table-row odd" style="
    grid-template-columns: 50% 50%;
">
                <div class="saito-table-gamename">deck</div><div class="saito-table-rank">optional</div></div><div class="saito-table-row odd" style="
    grid-template-columns: 50% 50%;
">
                <div class="saito-table-gamename">usbonus</div><div class="saito-table-rank">2</div></div>
        </div>
     
      </div>

      <button type="submit" class="saito-button-primary small league-join-btn" id="league-join-btn" data-cmd="join">JOIN</button> 
      </form>
    
      
      </div>
        </div>

      <style>
        .league-join-overlay-box {
          background: #fff;
          padding: 1.5rem;
          border-radius: 1rem;
        }

        .league-join-btn {
          color: #fff;
          margin-left: 0rem;
          width: 100%;
          margin-bottom: 0rem;
          margin-top: 0rem;
          display: inline-block;
          width: 20rem;
          padding: 1.2rem !important;
        }

        .league-join-table {
          color: #222;
          width: 30rem;
        }

        .league-join-table .saito-table-body {
          height: auto;
        }

        .league-join-table .saito-table-row {
          grid-template-columns: 45% 55%;
          margin-bottom: 1rem;
          text-align: left;
          font-size: 1.5rem;
          font-weight: normal;
        }

        .league-join-table .saito-table-row div:nth-child(1) {
          font-weight: bold;
        }


        .league-join-overlay-box img {
          width: 50rem;
          margin-bottom: 1rem;
        }

        .league-join-overlay-box .title-box {
            color: #222;
            text-align: center;
            margin: 1rem 0rem;
        }

        .league-join-overlay-box .title-box .title {
          display: inline-block;
          font-size: 3rem;
        }

        .league-join-controls {
          text-align: center;
        }

        .league-join-email-note {
          font-size: 2rem;
          font-style: italic;
          color: #444;
          margin-bottom: 1.5rem;
        }

        .league-join-email-note a {
          color: var(--saito-primary);
        }

        .league-join-controls input {
          text-align: center;
          width: 80%;
          margin-bottom: 1.5rem;
          height: 4.5rem;
          font-size: 1.8rem;
        }

      </style>

  `;


  return html;
}