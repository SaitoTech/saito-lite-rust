const PandemicOriginalSkin = require("./pandemicOriginal.skin.js");

class PandemicNewSkin extends PandemicOriginalSkin {
	constructor(app, mod){
		super(app, mod);
		this.boardWidth = 2730;
    	this.boardHeight = 1536;
	}

  	render(){

		$("#gameboard").css({
		  'background-image': 'url("/pandemic/img/alt/pandemic_map.jpg")',
		  'background-size': 'cover',
		  width: this.boardWidth+'px',
		  height: this.boardHeight+'px',
		  "border-radius": "500px", 
		});


	}
}


module.exports = PandemicNewSkin;