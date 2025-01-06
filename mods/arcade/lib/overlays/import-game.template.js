module.exports  = (app, mod, game_mod, gamename="", img="") => {
	let html = `
        	<div class="league-overlay">
            		<div class="league-overlay-header">
                		<div class="league-overlay-header-image" style="background-image: url('${img}')"></div>
                		<div class="league-overlay-header-title-box">
                    		<div class="league-overlay-header-title-box-title">${gamename}</div>
                    		<div class="league-overlay-header-title-box-desc">import existing game</div>
                		<div class="league-overlay-controls"></div>
			</div>
		</div>
            	<div class="league-overlay-body" id="league-overlay-body" style="grid-template-columns: 1fr">
                	<div class="league-overlay-body-content" style="
				border: 2px dashed #efefef;
				text-align: center;
				width: 100%;
    				height: 100%;
    				display: flex;
    				justify-content: center;
    				align-items: center;
			">
                    		<div class="">

drag-and-drop game file

				</div>
			</div>
		</div>
	`;

	return html;
};
