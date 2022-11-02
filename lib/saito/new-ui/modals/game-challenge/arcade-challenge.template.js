module.exports = ArcadeChallengeTemplate = (invite) => {

 return `  
    <div class="saito-modal saito-modal-game-challenge">
      <div class="saito-modal-title">Game Challenge</div>
      <div class="saito-modal-content">
		<p>${invite.originator} challenges you to a game of ${invite.game}!</p>
		<p>Do you accept?</p>
		<button class="saito-button-primary challenge-response" id="reject-btn">No</button>
		<button class="saito-button-primary challenge-response" id="accept-btn">Yes</button>
      </div>
    </div>
  `;

	

}
