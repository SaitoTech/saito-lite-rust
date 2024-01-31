module.exports = () => { 

  let help = ``;
  let advice = ``;

  let html = `
      <div class="vp-overlay" id="vp-overlay">
	<div class="help">${help}</div>
	<div class="factions"></div>
	<div class="advice">${advice}</div>
      </div>
  `;
  return html;

}




