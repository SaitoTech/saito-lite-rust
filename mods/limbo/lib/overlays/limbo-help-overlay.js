module.exports = LimboHelpOverlayTemplate = (app, mod) => {

	return `
		<div class="dream-wizard">
			<div class="saito-modal-title">Swarmcasting</div>
            <div class="saito-modal-tagline">Where live conversations happen</div>
            <div class="saito-modal-content">
             	<div class="saito-modal-point">
             		<i class="fa-solid fa-sliders"></i>
             		<div>Share just the audio of your conversation or include the video feeds</div> 
             	</div>
             	<div class="saito-modal-point">
             		<i class="fa-solid fa-earth-asia"></i>
             		<div>Open -- anyone can watch or listen</div> 
             	</div>
				<div class="saito-modal-point">
					<i class="fa-solid fa-network-wired"></i>
					<div>Decentralized -- you live stream your content to a handful of peers who rebroadcast it as a swarm</div>
				</div>
				<div class="saito-modal-point">
					<i class="fa-solid fa-shield-halved"></i>
					<div>Private -- your conversation never touches a central server. Make sure you use the record function if you want to keep a copy.</div>
				</div>
            </div>

		</div>

	`;
};