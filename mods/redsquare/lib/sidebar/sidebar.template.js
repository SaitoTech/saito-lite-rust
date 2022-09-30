const SaitoModuleTemplate = require("./../../../../lib/saito/new-ui/templates/saito-module.template");

module.exports = RedSquareSidebarTemplate = (app, mod) => {

  let playersHtml = `<div class="playerInfo" style="grid-template-columns: repeat(2, 1fr);"><div class="player-slot tip id-22tJZbrnBm7LQVqrMKZHMAEssdkgsLRcKT1HPrttZSsXX"><img class="identicon" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MjAnIGhlaWdodD0nNDIwJyBzdHlsZT0nYmFja2dyb3VuZC1jb2xvcjpyZ2JhKDI0MCwyNDAsMjQwLDEpOyc+PGcgc3R5bGU9J2ZpbGw6cmdiYSgzOCwxNDIsMjE3LDEpOyBzdHJva2U6cmdiYSgzOCwxNDIsMjE3LDEpOyBzdHJva2Utd2lkdGg6Mi4xOyc+PHJlY3QgIHg9JzE2OCcgeT0nMCcgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9JzE2OCcgeT0nMjUyJyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nODQnIHk9JzAnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PScyNTInIHk9JzAnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PSc4NCcgeT0nMTY4JyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMjUyJyB5PScxNjgnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PSc4NCcgeT0nMjUyJyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMjUyJyB5PScyNTInIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PScwJyB5PScxNjgnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PSczMzYnIHk9JzE2OCcgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9JzAnIHk9JzI1Micgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9JzMzNicgeT0nMjUyJyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMCcgeT0nMzM2JyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMzM2JyB5PSczMzYnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjwvZz48L3N2Zz4="><div class="tiptext"><span data-id="22tJZbrnBm7LQVqrMKZHMAEssdkgsLRcKT1HPrttZSsXX" id="saito-address-22tJZbrnBm7LQVqrMKZHMAEssdkgsLRcKT1HPrttZSsXX" class="saito-address saito-address-22tJZbrnBm7LQVqrMKZHMAEssdkgsLRcKT1HPrttZSsXX">22tJZbrnBm7LQVqrMKZHMAEssdkgsLRcKT1HPrttZSsXX</span></div></div>
<div class="player-slot tip id-w7iPv2jqz77MPNCKQHsBXr9ogCcCFPgozScku9LexmpF"><img class="identicon" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MjAnIGhlaWdodD0nNDIwJyBzdHlsZT0nYmFja2dyb3VuZC1jb2xvcjpyZ2JhKDI0MCwyNDAsMjQwLDEpOyc+PGcgc3R5bGU9J2ZpbGw6cmdiYSgyMTcsMzgsODksMSk7IHN0cm9rZTpyZ2JhKDIxNywzOCw4OSwxKTsgc3Ryb2tlLXdpZHRoOjIuMTsnPjxyZWN0ICB4PScxNjgnIHk9JzAnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PScxNjgnIHk9Jzg0JyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMTY4JyB5PSczMzYnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PSc4NCcgeT0nODQnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PScyNTInIHk9Jzg0JyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nODQnIHk9JzE2OCcgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9JzI1MicgeT0nMTY4JyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nODQnIHk9JzI1Micgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9JzI1MicgeT0nMjUyJyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMCcgeT0nMzM2JyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMzM2JyB5PSczMzYnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjwvZz48L3N2Zz4="><div class="tiptext"><span data-id="w7iPv2jqz77MPNCKQHsBXr9ogCcCFPgozScku9LexmpF" id="saito-address-w7iPv2jqz77MPNCKQHsBXr9ogCcCFPgozScku9LexmpF" class="saito-address saito-address-w7iPv2jqz77MPNCKQHsBXr9ogCcCFPgozScku9LexmpF">w7iPv2jqz77MPNCKQHsBXr9ogCcCFPgozScku9LexmpF</span></div></div><div class="player-slot tip id-w7iPv2jqz77MPNCKQHsBXr9ogCcCFPgozScku9LexmpF"><img class="identicon" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MjAnIGhlaWdodD0nNDIwJyBzdHlsZT0nYmFja2dyb3VuZC1jb2xvcjpyZ2JhKDI0MCwyNDAsMjQwLDEpOyc+PGcgc3R5bGU9J2ZpbGw6cmdiYSgyMTcsMzgsODksMSk7IHN0cm9rZTpyZ2JhKDIxNywzOCw4OSwxKTsgc3Ryb2tlLXdpZHRoOjIuMTsnPjxyZWN0ICB4PScxNjgnIHk9JzAnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PScxNjgnIHk9Jzg0JyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMTY4JyB5PSczMzYnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PSc4NCcgeT0nODQnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PScyNTInIHk9Jzg0JyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nODQnIHk9JzE2OCcgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9JzI1MicgeT0nMTY4JyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nODQnIHk9JzI1Micgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9JzI1MicgeT0nMjUyJyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMCcgeT0nMzM2JyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMzM2JyB5PSczMzYnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjwvZz48L3N2Zz4="><div class="tiptext"><span data-id="w7iPv2jqz77MPNCKQHsBXr9ogCcCFPgozScku9LexmpF" id="saito-address-w7iPv2jqz77MPNCKQHsBXr9ogCcCFPgozScku9LexmpF" class="saito-address saito-address-w7iPv2jqz77MPNCKQHsBXr9ogCcCFPgozScku9LexmpF">w7iPv2jqz77MPNCKQHsBXr9ogCcCFPgozScku9LexmpF</span></div></div></div>`;
  let extra_column = `
    <div class="saito-module-custom-box">
      <a href="#" class="saito-module-action">Join</a>
      <div class="saito-module-option">
        Standard Game
      </div>
    </div>
  `;

  return `

  <div class="saito-sidebar right">
    
    <div class="redsquare-sidebar-calendar">
    </div>
    
    <div class="redsquare-sidebar-arcade">
    </div>

    <div class="redsquare-sidebar-observer">
    </div>

    <div class="redsquare-sidebar-box">
        ${SaitoModuleTemplate("Poker", playersHtml, "https://saito.io/poker/img/arcade/arcade.jpg", "", extra_column)}
    </div>

    <div class="redsquare-sidebar-league">
    </div>
  
  </div>

  <style>
    
  </style>

  `;



}

