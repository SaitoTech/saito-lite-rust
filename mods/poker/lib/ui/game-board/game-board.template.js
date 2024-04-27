module.exports = GameBoardTemplate = () => {
	return `
<div class="outer">
  <div class="gameboard">
    <div class="deal" id="deal"><div class="flip-card card flipped"><img class="cardBack" src="https://saito.io/saito/img/arcade/cards/red_back.png"><img class="card cardFront" src="https://saito.io/saito/img/arcade/cards/D11.png"></div><div class="flip-card card flipped"><img class="cardBack" src="https://saito.io/saito/img/arcade/cards/red_back.png"><img class="card cardFront" src="https://saito.io/saito/img/arcade/cards/C4.png"></div><div class="flip-card card flipped"><img class="cardBack" src="https://saito.io/saito/img/arcade/cards/red_back.png"><img class="card cardFront" src="https://saito.io/saito/img/arcade/cards/H4.png"></div><div class="flip-card card"><img class="cardBack" src="https://saito.io/saito/img/arcade/cards/red_back.png"></div><div class="flip-card card"><img class="cardBack" src="https://saito.io/saito/img/arcade/cards/red_back.png"></div></div>
  </div>
</div>

<div class="mystuff">
  <div id="cardfan" class="cardfan" style="display: block;"><img class="card" src="https://saito.io/saito/img/arcade/cards/S3.png"><img class="card" src="https://saito.io/saito/img/arcade/cards/C13.png"></div>

  <div class="stack">
      <img class="stackimg" src="https://saito.tech/wp-content/uploads/2024/04/testpokerchips.png"/>
    <div class="stacklabel">
      100
    </div>
  </div>
</div>

<div class="mystuff">
    <div id="cardfan" class="cardfan" style="display: block;"><img class="card" src="https://saito.io/saito/img/arcade/cards/S3.png">
    <img class="card" src="https://saito.io/saito/img/arcade/cards/C13.png"></div>
</div>

<div class="pot">
  <div class="potholder">
   <img class="stackimg" src="https://saito.tech/wp-content/uploads/2024/04/testpokerchips.png"/>
  <div class="potlabel">
    87
  </div>
 </div>
</div>
	`;
};
