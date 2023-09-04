module.exports = (app, mod) => {

  let html = `<div class="poker-rules-overlay">
	<div class="h2">Poker Hand Ranking</div>

	<div class="poker-modal-table">
		<div class="poker-column">
			<div class="poker-box-description">1. Royal Flush 
				<div class="poker-modal-cardbox">
					<img class="mcard" src="/poker/img/cards/S1.png">
					<img class="mcard" src="/poker/img/cards/S13.png">
					<img class="mcard" src="/poker/img/cards/S12.png">
					<img class="mcard" src="/poker/img/cards/S11.png">
					<img class="mcard" src="/poker/img/cards/S10.png">
				</div>
			</div>


			<div class="poker-box-description">2. Straight Flush 
				<div class="poker-modal-cardbox">
					<img class="mcard" src="/poker/img/cards/D8.png">
					<img class="mcard" src="/poker/img/cards/D7.png">
					<img class="mcard" src="/poker/img/cards/D6.png">
					<img class="mcard" src="/poker/img/cards/D5.png">
					<img class="mcard" src="/poker/img/cards/D4.png">
				</div>
			</div>


			<div class="poker-box-description">3. Four of a Kind 
				<div class="poker-modal-cardbox">
					<img class="mcard" src="/poker/img/cards/H11.png">
					<img class="mcard" src="/poker/img/cards/D11.png">
					<img class="mcard" src="/poker/img/cards/S11.png">
					<img class="mcard" src="/poker/img/cards/C11.png">
					<img class="mcard not_used" src="/poker/img/cards/D4.png">
				</div>
			</div>


			<div class="poker-box-description">4. Full House 
				<div class="poker-modal-cardbox">
					<img class="mcard" src="/poker/img/cards/H10.png">
					<img class="mcard" src="/poker/img/cards/D10.png">
					<img class="mcard" src="/poker/img/cards/S10.png">
					<img class="mcard" src="/poker/img/cards/C9.png">
					<img class="mcard" src="/poker/img/cards/D9.png">
				</div>
			</div>


			<div class="poker-box-description">5. Flush 
				<div class="poker-modal-cardbox">
					<img class="mcard" src="/poker/img/cards/S4.png">
					<img class="mcard" src="/poker/img/cards/S10.png">
					<img class="mcard" src="/poker/img/cards/S8.png">
					<img class="mcard" src="/poker/img/cards/S2.png">
					<img class="mcard" src="/poker/img/cards/S9.png">
				</div>
			</div>
		</div>


	<div class="poker-column">
			<div class="poker-box-description">6. Straight 
				<div class="poker-modal-cardbox">
					<img class="mcard" src="/poker/img/cards/C9.png">
					<img class="mcard" src="/poker/img/cards/D8.png">
					<img class="mcard" src="/poker/img/cards/S7.png">
					<img class="mcard" src="/poker/img/cards/D6.png">
					<img class="mcard" src="/poker/img/cards/H5.png">
				</div>
			</div>


			<div class="poker-box-description">7. Three of a Kind 
				<div class="poker-modal-cardbox">
					<img class="mcard" src="/poker/img/cards/C7.png">
					<img class="mcard" src="/poker/img/cards/D7.png">
					<img class="mcard" src="/poker/img/cards/S7.png">
					<img class="mcard not_used" src="/poker/img/cards/C13.png">
					<img class="mcard not_used" src="/poker/img/cards/D3.png">
				</div>
			</div>


			<div class="poker-box-description">8. Two Pair 
				<div class="poker-modal-cardbox">
					<img class="mcard" src="/poker/img/cards/C4.png">
					<img class="mcard" src="/poker/img/cards/S4.png">
					<img class="mcard" src="/poker/img/cards/C3.png">
					<img class="mcard" src="/poker/img/cards/D3.png">
					<img class="mcard not_used" src="/poker/img/cards/C12.png">
				</div>
			</div>


			<div class="poker-box-description">9. Pair 
				<div class="poker-modal-cardbox">
					<img class="mcard" src="/poker/img/cards/H1.png">
					<img class="mcard" src="/poker/img/cards/D1.png">
					<img class="mcard not_used" src="/poker/img/cards/C8.png">
					<img class="mcard not_used" src="/poker/img/cards/S4.png">
					<img class="mcard not_used" src="/poker/img/cards/H7.png">
				</div>
			</div>


			<div class="poker-box-description">10. Highest Card
				<div class="poker-modal-cardbox">
					<img class="mcard not_used" src="/poker/img/cards/D3.png">
					<img class="mcard" src="/poker/img/cards/C13.png">
					<img class="mcard not_used" src="/poker/img/cards/S8.png">
					<img class="mcard not_used" src="/poker/img/cards/H4.png">
					<img class="mcard not_used" src="/poker/img/cards/S2.png">
				</div>
			</div>
		</div>
	</div>
</div>`;
    
  return html;

}

