module.exports = (res) => {
	let p1 = `${res.attacker_faction} will roll ${res.attacker_debater_power} + ${res.attacker_debater_bonus}`;
	let p2 = `${res.defender_faction} will roll ${res.defender_debater_power} + ${res.defender_debater_bonus}`;
	let p3 = `${res.attacker_faction} rolls ${JSON.stringify(res.adice)}`;
	let p4 = `${res.defender_faction} rolls ${JSON.stringify(res.ddice)}`;

	let title = `ROUND ${res.round}<p></p>${p1}<p></p>${p2}<p></p>( hits on 5 and 6 )`;
	if (res.adice.length) {
		title = `ROUND ${res.round}<p></p>${p3}<p></p>${p4}`;
	}

	let html = `
     <div class="theological-debate-overlay" id="theological-debate-overlay">
        <div class="title">${title}</div>
        <div class="attacker_debater"></div>
        <div class="defender_debater"></div>
      </div>
  `;
	return html;
};
