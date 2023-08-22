module.exports = (players=2) => {
 
  let help = 'Protestants select card and add +4. Papacy selects card and draws random card, combining values (2 OPs if Mandatory Event drawn). Hits on 5 or 6. Winner converts difference in hits.';
  if (players > 2) {
    help = 'Protestants and Papacy and Hapsburg select cards. Protestants add +4 while Papacy and Hapsburg combine card value. Both sides roll requisite number of dice. Hits on 5 or 6. Winner converts spaces equal to difference in hits.';
  }
  
  let html = `
      <div class="diet-overlay" id="diet-overlay">
	<div class="help">${help}</div>
	<div class="cardfans">
          <div class="protestant">
	  </div>
	  <div class="catholic">
	  </div>
	</div>
      </div>
  `;
  return html;

}




