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


          .saito-module-description-identicon-box {
              display: flex;
              flex-direction: row;   
          }

          .saito-module-identicon-box {
              height: 2.5rem;
              width: 2.5rem;
              background-size: 100%;
              margin-right: 1rem;
              overflow: hidden;
              box-shadow: 1px 1px #ccc, 1px 1px 10px 3px #333 inset;
          }


          .saito-module-identicon-box i {
              font-size: 2.2rem;
              line-height: 2.5rem;
              width: 2.5rem;
              text-align: center;
          }

          .saito-module-identicon-box i:hover {
              transform: scale(1.1);
          }

          .saito-module-identicon-box img {
              margin-right: 0.7rem;
              border: 0px;
              width: 2.5rem;
              min-width: 2.5rem;
              height: 2.5rem;
          }

          .saito-module-identicon.small {
              width: 2.5rem;
              height: 2.5rem;
          }

          .player-slot-ellipsis{
              position: relative;
          }

          .player-slot-ellipsis i{
              position: absolute;
              bottom: 0;
          }

          .tiptext {
              visibility: hidden;
              position: absolute;
              box-sizing: content-box !important;
              z-index: 10;
              width: 90%;
              min-width: 300px;
              max-width: 750px;
              padding: 0.25em 0.5em;
              background-color: #fefefe;
              border-bottom: 1px solid var(--saito-primary);
              font-style: italic;
          }
          

        </style>
  `;

  return html;

}


