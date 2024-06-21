module.exports = LimboHelpOverlayTemplate = (app, mod) => {

	return `
		<div class="dream-wizard">
			<div class="saito-modal-title">Welcome to Saito Spaces</div>
            <div class="saito-modal-tagline">Where live conversations happen</div>
            <div class="saito-modal-content">
             	<div class="saito-modal-point">
             		<i class="fa-solid fa-sliders"></i>
             		<div>Share just the audio of your conversation or include the video feeds</div> 
             	</div>
             	<div class="saito-modal-point">
             		<i class="fa-solid fa-earth-asia"></i>
             		<div>Spaces are public -- anyone can watch or listen</div> 
             	</div>
				<div class="saito-modal-point">
					<i class="fa-solid fa-network-wired"></i>
					<div>Spaces are decentralized -- your space is streamed through a swarm of peers</div>
				</div>
				<div class="saito-modal-point">
					<i class="fa-solid fa-shield-halved"></i>
					<div>The content of your conversation never touches our server. Make sure you use the record function if you want to keep a copy.</div>
				</div>
            </div>

		</div>

	`;
};