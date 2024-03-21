module.exports = (app, mod) => {
	let html = `<div class="poker-rules-overlay">
	<div class="h2">Poker Hand Ranking</div>

	<div class="poker-modal-table">
		<div class="poker-column">
			<div class="poker-box-description">1. Royal Flush 
				<div class="poker-modal-cardbox">
					<img class="mcard" src="/saito/img/arcade/cards/S1.png">
					<img class="mcard" src="/saito/img/arcade/cards/S13.png">
					<img class="mcard" src="/saito/img/arcade/cards/S12.png">
					<img class="mcard" src="/saito/img/arcade/cards/S11.png">
					<img class="mcard" src="/saito/img/arcade/cards/S10.png">
				</div>
			</div>


			<div class="poker-box-description">2. Straight Flush 
				<div class="poker-modal-cardbox">
					<img class="mcard" src="/saito/img/arcade/cards/D8.png">
					<img class="mcard" src="/saito/img/arcade/cards/D7.png">
					<img class="mcard" src="/saito/img/arcade/cards/D6.png">
					<img class="mcard" src="/saito/img/arcade/cards/D5.png">
					<img class="mcard" src="/saito/img/arcade/cards/D4.png">
				</div>
			</div>


			<div class="poker-box-description">3. Four of a Kind 
				<div class="poker-modal-cardbox">
					<img class="mcard" src="/saito/img/arcade/cards/H11.png">
					<img class="mcard" src="/saito/img/arcade/cards/D11.png">
					<img class="mcard" src="/saito/img/arcade/cards/S11.png">
					<img class="mcard" src="/saito/img/arcade/cards/C11.png">
					<img class="mcard not_used" src="/saito/img/arcade/cards/D4.png">
				</div>
			</div>


			<div class="poker-box-description">4. Full House 
				<div class="poker-modal-cardbox">
					<img class="mcard" src="/saito/img/arcade/cards/H10.png">
					<img class="mcard" src="/saito/img/arcade/cards/D10.png">
					<img class="mcard" src="/saito/img/arcade/cards/S10.png">
					<img class="mcard" src="/saito/img/arcade/cards/C9.png">
					<img class="mcard" src="/saito/img/arcade/cards/D9.png">
				</div>
			</div>


			<div class="poker-box-description">5. Flush 
				<div class="poker-modal-cardbox">
					<img class="mcard" src="/saito/img/arcade/cards/S4.png">
					<img class="mcard" src="/saito/img/arcade/cards/S10.png">
					<img class="mcard" src="/saito/img/arcade/cards/S8.png">
					<img class="mcard" src="/saito/img/arcade/cards/S2.png">
					<img class="mcard" src="/saito/img/arcade/cards/S9.png">
				</div>
			</div>
		</div>


	<div class="poker-column">
			<div class="poker-box-description">6. Straight 
				<div class="poker-modal-cardbox">
					<img class="mcard" src="/saito/img/arcade/cards/C9.png">
					<img class="mcard" src="/saito/img/arcade/cards/D8.png">
					<img class="mcard" src="/saito/img/arcade/cards/S7.png">
					<img class="mcard" src="/saito/img/arcade/cards/D6.png">
					<img class="mcard" src="/saito/img/arcade/cards/H5.png">
				</div>
			</div>


			<div class="poker-box-description">7. Three of a Kind 
				<div class="poker-modal-cardbox">
					<img class="mcard" src="/saito/img/arcade/cards/C7.png">
					<img class="mcard" src="/saito/img/arcade/cards/D7.png">
					<img class="mcard" src="/saito/img/arcade/cards/S7.png">
					<img class="mcard not_used" src="/saito/img/arcade/cards/C13.png">
					<img class="mcard not_used" src="/saito/img/arcade/cards/D3.png">
				</div>
			</div>


			<div class="poker-box-description">8. Two Pair 
				<div class="poker-modal-cardbox">
					<img class="mcard" src="/saito/img/arcade/cards/C4.png">
					<img class="mcard" src="/saito/img/arcade/cards/S4.png">
					<img class="mcard" src="/saito/img/arcade/cards/C3.png">
					<img class="mcard" src="/saito/img/arcade/cards/D3.png">
					<img class="mcard not_used" src="/saito/img/arcade/cards/C12.png">
				</div>
			</div>


			<div class="poker-box-description">9. Pair 
				<div class="poker-modal-cardbox">
					<img class="mcard" src="/saito/img/arcade/cards/H1.png">
					<img class="mcard" src="/saito/img/arcade/cards/D1.png">
					<img class="mcard not_used" src="/saito/img/arcade/cards/C8.png">
					<img class="mcard not_used" src="/saito/img/arcade/cards/S4.png">
					<img class="mcard not_used" src="/saito/img/arcade/cards/H7.png">
				</div>
			</div>


			<div class="poker-box-description">10. Highest Card
				<div class="poker-modal-cardbox">
					<img class="mcard not_used" src="/saito/img/arcade/cards/D3.png">
					<img class="mcard" src="/saito/img/arcade/cards/C13.png">
					<img class="mcard not_used" src="/saito/img/arcade/cards/S8.png">
					<img class="mcard not_used" src="/saito/img/arcade/cards/H4.png">
					<img class="mcard not_used" src="/saito/img/arcade/cards/S2.png">
				</div>
			</div>
		</div>
	</div>
</div>`;

	return html;
};
