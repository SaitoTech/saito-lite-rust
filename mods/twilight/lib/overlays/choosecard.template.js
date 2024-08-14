module.exports = (mod, card1, card2, stage="midwar") => {

        let card1img = mod.returnCardImage(card1);
        let card2img = mod.returnCardImage(card2);
	let st = "Mid-War";
	if (stage == "latewar") { st = "Late-War"; }

	let html = `<div class="headline-overlay">
	    <div class="title">Choose Your ${st} Card</div>
	    <div class="cards">
	      <div class="card option" id="${card1}">${card1img}</div>
	      <div class="card option" id="${card2}">${card2img}</div>
	    </div>
	    <div class="help">* card will be randomly shuffled into deck</div>
        `;

	return html;

};
