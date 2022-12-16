module.exports = SaitoModuleOverlayTemplate = (app, mod) => {

  let html = `
      <div class="league-join-overlay-box">

              <div class="saito-game" data-id="abcd1234" data-cmd="join">
                  
                  <div class="saito-game-bg" style="background-image: url('/twilight/img/arcade/arcade.jpg'); background-size: cover;"></div>

                  <div class="saito-module-imagebox-titlebar">
                      <span class="saito-module-imagebox-title" style="
          font-size: 3.8rem;
      ">Twilight</span>
                      
                  </div>
                  
                  
                  
                </div>
              
              <div class="league-join-controls">
            <form id="league-join-form" >
                
            <div class="saito-leaderboard saito-module-overlay-info-table">
              <div class="saito-table">
                <div class="saito-table-row odd">
                      <div class="saito-table-gamename">player1</div><div class="saito-table-rank">random</div></div><div class="saito-table-row odd">
                      <div class="saito-table-gamename">deck</div><div class="saito-table-rank">optional</div></div><div class="saito-table-row odd">
                      <div class="saito-table-gamename">usbonus</div><div class="saito-table-rank">2</div></div>
              </div>
           
            </div>

            <button type="submit" class="saito-button-primary small league-join-btn" id="league-join-btn" data-cmd="join">JOIN</button> 
            </form>
          
            
            </div>
        </div>



      <style>

        .saito-overlay-backdrop {
          z-index: 102;
          display: block;
          background: url(/twilight/img/arcade/arcade.jpg);
          opacity: 1;
          background-size: cover;
          filter: grayscale(0.9);
        }

        .league-join-overlay-box {
          background: #fff;
          padding: 0rem;
          border-radius: 1rem;
          width: 50rem;
          padding-bottom: 1rem; 
        }

        .saito-game-bg {
          z-index: 0;
        }

        .saito-game {
          border-radius: 1rem;
          border-bottom-left-radius: 0px;
          border-bottom-right-radius: 0px;
          margin-bottom: 0px;
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

        .saito-module-overlay-info-table {

        }

        .saito-table-row {
          background-color: #fff;
          grid-template-columns: 50% 50%;
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