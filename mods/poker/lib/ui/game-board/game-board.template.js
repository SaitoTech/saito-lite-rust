module.exports = GameBoardTemplate = (theme) => {

	return `
<div class="gameboard ${theme}">
  <div class="deal" id="deal">
    <div class="card"><img class="cardBack" src="https://saito.io/saito/img/arcade/cards/red_back.png"><img class="card cardFront" src="https://saito.io/saito/img/arcade/cards/D11.png"></div>
    <div class="card"><img class="cardBack" src="https://saito.io/saito/img/arcade/cards/red_back.png"><img class="card cardFront" src="https://saito.io/saito/img/arcade/cards/C4.png"></div>
    <div class="card"><img class="cardBack" src="https://saito.io/saito/img/arcade/cards/red_back.png"><img class="card cardFront" src="https://saito.io/saito/img/arcade/cards/H4.png"></div>
    <div class="card"><img class="cardBack" src="https://saito.io/saito/img/arcade/cards/red_back.png"></div>
    <div class="card"><img class="cardBack" src="https://saito.io/saito/img/arcade/cards/red_back.png"></div>
  </div>
</div>
<div class="mystuff"></div>
	`;
};
