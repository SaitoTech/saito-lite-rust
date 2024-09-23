module.exports = (card) => {
	let html = `
    <div class="cardover">
      <div class="cardover-title">${card.title}</div>
      <div class="cardover-text">${card.text}</div>
      <div class="cardover-cardover">
        <img src="${card.img}"/>
        <div class="settlers-dev-card-title">${card.card}</div>
      <div>


    </div>
  `;
	return html;
};
