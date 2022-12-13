module.exports = (app, mod, invite) => {

    let html = `
      <div class="saito-game">
          
        <div class="saito-module-imagebox" style="background-image: url('/${invite.game}/img/arcade/arcade.jpg'); background-size: cover;">
          <div class="saito-module-imagebox-titlebar">
             <span class="saito-module-imagebox-title">${invite.name} <span class="saito-tooltip-box"></span> </span>
            <div class="game-type">${invite.type} game</div>

             <div class="saito-module-description-identicon-box">
              <div class="saito-module-identicon-box tip id-tSFrTSkwE7HNFUzbN4wUsPEwog42Q5XwWEP24EgVxcu2">
                <img class="saito-module-identicon small" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MjAnIGhlaWdodD0nNDIwJyBzdHlsZT0nYmFja2dyb3VuZC1jb2xvcjpyZ2JhKDI0MCwyNDAsMjQwLDEpOyc+PGcgc3R5bGU9J2ZpbGw6cmdiYSgyMTcsOTIsMzgsMSk7IHN0cm9rZTpyZ2JhKDIxNyw5MiwzOCwxKTsgc3Ryb2tlLXdpZHRoOjIuMTsnPjxyZWN0ICB4PScxNjgnIHk9JzAnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PScxNjgnIHk9JzE2OCcgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9JzE2OCcgeT0nMjUyJyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMTY4JyB5PSczMzYnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PSc4NCcgeT0nMCcgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9JzI1MicgeT0nMCcgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9Jzg0JyB5PScxNjgnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PScyNTInIHk9JzE2OCcgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9Jzg0JyB5PScyNTInIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PScyNTInIHk9JzI1Micgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9JzAnIHk9JzI1Micgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9JzMzNicgeT0nMjUyJyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48L2c+PC9zdmc+">
                <div class="tiptext">
                  <div class="saito-address saito-address-tSFrTSkwE7HNFUzbN4wUsPEwog42Q5XwWEP24EgVxcu2" data-id="tSFrTSkwE7HNFUzbN4wUsPEwog42Q5XwWEP24EgVxcu2">kris088Chess@saito</div>
                </div>
              </div>
              <div class="saito-module-identicon-box tip id-tSFrTSkwE7HNFUzbN4wUsPEwog42Q5XwWEP24EgVxcu2">
                <img class="saito-module-identicon small" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MjAnIGhlaWdodD0nNDIwJyBzdHlsZT0nYmFja2dyb3VuZC1jb2xvcjpyZ2JhKDI0MCwyNDAsMjQwLDEpOyc+PGcgc3R5bGU9J2ZpbGw6cmdiYSgzOCwyMTcsMTIzLDEpOyBzdHJva2U6cmdiYSgzOCwyMTcsMTIzLDEpOyBzdHJva2Utd2lkdGg6Mi4xOyc+PHJlY3QgIHg9JzE2OCcgeT0nMCcgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9JzE2OCcgeT0nMjUyJyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMTY4JyB5PSczMzYnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PSc4NCcgeT0nODQnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PScyNTInIHk9Jzg0JyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nODQnIHk9JzMzNicgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9JzI1MicgeT0nMzM2JyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMCcgeT0nODQnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PSczMzYnIHk9Jzg0JyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMCcgeT0nMTY4JyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMzM2JyB5PScxNjgnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PScwJyB5PScyNTInIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PSczMzYnIHk9JzI1Micgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PC9nPjwvc3ZnPg==">
                <div class="tiptext">
                  <div class="saito-address saito-address-tSFrTSkwE7HNFUzbN4wUsPEwog42Q5XwWEP24EgVxcu2" data-id="tSFrTSkwE7HNFUzbN4wUsPEwog42Q5XwWEP24EgVxcu2">kris088Chess@saito</div>
                </div>
              </div>
              <div class="saito-module-identicon-box identicon-needed tip">
                <div class="tiptext">You need this player to start the game</div>
              </div>
            </div>
          </div>
        </div>
      
          <div class="saito-game-content">
            <div class="saito-leaderboard">
              <div class="saito-table">
              </div>
             </div>
          </div>
        </div>

        <style>

          .game-type {
            font-size: 1.4rem;
            font-weight: 400;
            color: #e9e9e9;
            font-style: italic;
          }

          .invite-manager {
            display: grid;
            grid-template-columns: 50% 50%;
          }

          .saito-game {
            min-height: 13rem;
            min-width: mn-content;
            display: grid;
            grid-template-rows: 1fr min-content;
            position: relative;
            border-radius: 0.5rem;
            border: none;
            overflow: hidden;
            margin-bottom: 0rem;
            width: 100%;
            padding: 0.3rem;
          }

          .saito-module-imagebox-titlebar {
              color: rgb(255, 255, 255);
              background: rgba(0, 0, 0, 0.6);
              /* margin-top: 1px; */
              font-size: 1.4em;
              font-weight: bold;
              width: 100%;
              overflow: hidden;
              padding: 1rem 1.5rem;
              height: 100%;
          }

          .saito-game.minimize{
              min-height: unset;
          }

          .saito-game-controls {
              display: grid;
              grid-template-columns: 1fr min-content;
              padding: 1rem;
              padding-top: 1.5rem;
              padding-bottom: 1.5rem;
          }

          .saito-game-controls>div:nth-child(1) {
              font-size: 1.1em;
              color: #ea462f;
              font-weight: bold;
              cursor: pointer;
          }

          .saito-game-controls>div:nth-child(2) {
              border-bottom: 1px dashed red;
              white-space: nowrap;
          }


          .saito-box-buttons{
              width: 100%;
          }


          .saito-module-description-identicon-box {
            position: absolute;
            bottom: 1.5rem;
          }

        </style>
  `;

  return html;

}


