module.exports = (card) => {
	let html = `
    <div class="cardover">
      <div class="cardover-title">${card.title}</div>
      <div class="cardover-text">${card.cardtext}</div>`;

  if (card.action !== -1){
    html += `<div class="cardover-cardover">
        <img src="${card.img}"/>
        <div class="settlers-dev-card-title">${card.card}</div>
      <div>`;
  }else{
    html += `<div class="cardover-optout"><input type="checkbox" name="dontshowme" value="true"/>Don't show me again</div>`
  }

   html += `</div>`;

	return html;
};
