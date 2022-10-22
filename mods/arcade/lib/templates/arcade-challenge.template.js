module.exports = ArcadeChallengeTemplate = (invite) => {

	let html = `<div class="invite-overlay">
				<h2>Game Challenge</h2>
				<p>${invite.originator} challenges you to a game of ${invite.game}!</p>
				<p>Do you accept?</p>
				<button class="saito-button-primary challenge-response" id="reject-btn">No</button>
				<button class="saito-button-primary challenge-response" id="accept-btn">Yes</button>
				</div>
	 `; 


	return html;
}
