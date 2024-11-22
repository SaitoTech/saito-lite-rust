module.exports = PlayerboxTemplate = (player, publickey, is_me=0) => {

	let is_me_css = "";
	if (is_me) { is_me_css = "game-playerbox-seat-1"; }

	return `
	  <div class="playerbox-${publickey} ${is_me_css} game-playerbox game-playerbox-${player}" id="game-playerbox-${player}">
      	    <div class="game-playerbox-head game-playerbox-head-${player}" id="game-playerbox-head-${player}">
  	      <div class="saito-user saito-user-${publickey}" data-id="${publickey}" data-disable="false">
		<div class="saito-identicon-box"><img class="saito-identicon" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MjAnIGhlaWdodD0nNDIwJyBzdHlsZT0nYmFja2dyb3VuZC1jb2xvcjpyZ2JhKDI0MCwyNDAsMjQwLDEpOyc+PGcgc3R5bGU9J2ZpbGw6cmdiYSgyMTcsMTc0LDM4LDEpOyBzdHJva2U6cmdiYSgyMTcsMTc0LDM4LDEpOyBzdHJva2Utd2lkdGg6Mi4xOyc+PHJlY3QgIHg9JzE2OCcgeT0nMCcgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9JzE2OCcgeT0nODQnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PScxNjgnIHk9JzI1Micgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9JzE2OCcgeT0nMzM2JyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nODQnIHk9JzAnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PScyNTInIHk9JzAnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PSc4NCcgeT0nODQnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PScyNTInIHk9Jzg0JyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nODQnIHk9JzI1Micgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9JzI1MicgeT0nMjUyJyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nODQnIHk9JzMzNicgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9JzI1MicgeT0nMzM2JyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMCcgeT0nMjUyJyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMzM2JyB5PScyNTInIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjwvZz48L3N2Zz4=" data-id="iJtVvtP3RhKEapXTX9ikxFtCKC7Hb4Md1NrvbpFY5Q6C"></div>
    		<div class="saito-address treated" data-id="${publickey}">${publickey}</div>
    		<div class="saito-userline" style="--key-color:#d9ae26;" data-id="${publickey}">big blind<div class="saito-balance">98 CHIPS</div></div>
  	      </div>
            </div>
      	    <div class="game-playerbox-body game-playerbox-body-${player} hide-scrollbar" id="game-playerbox-body-${player}"></div>
      	    <div class="game-playerbox-graphics game-playerbox-graphics-${player}" id="game-playerbox-graphics-${player}"></div>
    	  </div>
	`;
};
