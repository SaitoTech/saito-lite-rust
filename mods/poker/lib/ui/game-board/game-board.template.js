module.exports = GameBoardTemplate = (game_mod) => {
  let boardstyle = "";
  if (game_mod.current_board_style == "") {
    boardstyle = "unset !important";
  } else {
    boardstyle = game_mod.current_board_style + " !important";
  }
	return `
<div class="gameboard" style="transform: ${boardstyle}">
  <div class="deal" id="deal">
    <div class="card"><img class="cardBack" src="https://saito.io/saito/img/arcade/cards/red_back.png"><img class="card cardFront" src="https://saito.io/saito/img/arcade/cards/D11.png"></div>
    <div class="card"><img class="cardBack" src="https://saito.io/saito/img/arcade/cards/red_back.png"><img class="card cardFront" src="https://saito.io/saito/img/arcade/cards/C4.png"></div>
    <div class="card"><img class="cardBack" src="https://saito.io/saito/img/arcade/cards/red_back.png"><img class="card cardFront" src="https://saito.io/saito/img/arcade/cards/H4.png"></div>
    <div class="card"><img class="cardBack" src="https://saito.io/saito/img/arcade/cards/red_back.png"></div>
    <div class="card"><img class="cardBack" src="https://saito.io/saito/img/arcade/cards/red_back.png"></div>
  </div>
</div>
	`;
};
