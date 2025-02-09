module.exports = () => {

	let html = `
		<ul>
			<li class="option disabled" id="score" title="view game statistics"><i class="fa-solid fa-ranking-star"></i></li>
                	<li class="option disabled" id="trade" title="trade with other players"><i class="fa-solid fa-money-bill-transfer"></i></li>
                	<li class="option disabled" id="bank" title="trade with the bank"><i class="fa-solid fa-building-columns"></i></li>
                	<li class="option disabled" id="playcard" title="play an action card"><i class="fa-solid fa-person-running"></i></li>
                	<li class="option disabled" id="spend" title="build or buy"><i class="fa-solid fa-screwdriver-wrench"></i></li>
                	<li class="option enabled" id="rolldice"><i class="fa-solid fa-forward"></i></li>
		</ul>
	`;

	return html;
};

