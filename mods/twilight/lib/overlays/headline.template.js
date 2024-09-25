const HeadlineTemplate = (uscardimg, ussrcardimg) => {
	let html = `<div class="headline-overlay">
    <div class="title">Soviet / American Headlines</div>
    <div class="cards">
      <div class="card">${ussrcardimg}</div>
      <div class="card">${uscardimg}</div>
    </div>
    <div class="help">* higher value card triggered first, US breaks ties</div>
  `;
	return html;
};

module.exports = HeadlineTemplate;