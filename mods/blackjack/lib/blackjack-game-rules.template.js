module.exports = (app, mod) => {
	return `<div class="blackjack-rules-overlay">
	<div class="h2">Blackjack Card Values</div>

  <div class="blackjack-modal-table">
	  <div class="blackjack-box-description">Numbered cards - Their worth is equal to their number 
      <div class="blackjack-modal-cardbox">
        <img class="bcard" src="/blackjack/img/cards/S2.png">
        <img class="bcard" src="/blackjack/img/cards/S3.png">
        <img class="bcard" src="/blackjack/img/cards/S4.png">
        <img class="bcard" src="/blackjack/img/cards/S5.png">
        <img class="bcard" src="/blackjack/img/cards/S6.png">
        <img class="bcard" src="/blackjack/img/cards/S7.png">
        <img class="bcard" src="/blackjack/img/cards/S8.png">
        <img class="bcard" src="/blackjack/img/cards/S9.png">
        <img class="bcard" src="/blackjack/img/cards/S10.png">
      </div>

    </div>
		<div class="blackjack-box-description">Face Cards - They are count as a 10 
			<div class="blackjack-modal-cardbox">
				<img class="bcard" src="/blackjack/img/cards/D11.png">
				<img class="bcard" src="/blackjack/img/cards/D12.png">
				<img class="bcard" src="/blackjack/img/cards/D13.png">
			</div>

    </div>
		<div class="blackjack-box-description">Aces - They count as either a 1 or a 10, whichever is better 
			<div class="blackjack-modal-cardbox">
				<img class="bcard" src="/blackjack/img/cards/H1.png">
      </div>
		</div>
    <div class="blackjack-explanation">
  The goal is to get the sum of your cards as close to 21 as possible. If you go over, you lose.<br>
  You can hit to get a new card until you go over and double down to get a single card and double your bets.<br>
  Players take turns to be the dealer. The dealer wins all ties.<br>
    </div>
	</div>
</div>`;
};
