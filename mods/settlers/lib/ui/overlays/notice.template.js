module.exports = (cardnotice) => {
	let html = `
    <div class="cardnotice">
      <div class="cardnotice-title">${cardnotice.title}</div>
      <div class="cardnotice-text">${cardnotice.cardtext}</div></div>
      <div class="cardnotice-card">
        <img src="${cardnotice.img}"/>
        <div class="settlers-dev-card-title">${cardnotice.card}</div>
      <div>`;
	return html;
};
