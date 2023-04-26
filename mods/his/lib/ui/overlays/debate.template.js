module.exports = (res) => {

  let attacker = res.attacker;
  let defender = res.defender;
  let adice = res.adice;
  let ddice = res.ddice;
  let round = res.round;

  let html = `
     <div class="theological-debate-overlay" id="theological-debate-overlay">
        <div class="title">ROUND ${round}<p></p>${attacker} rolls ${res.attacker_debater_power}+${res.attacker_debater_bonus} = ${JSON.stringify(adice)}, ${res.defender} rolls ${res.defender_debater_power}+${res.defender_debater_bonus} = ${JSON.stringify(ddice)}, hits on 5 or 6</div>
        <div class="status">${res.status}</div>
        <div class="attacker_debater"></div>
        <div class="defender_debater"></div>
      </div>
  `;
  return html;

}
