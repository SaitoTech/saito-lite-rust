module.exports = (players=2) => {
 
  let help = 'Protestants and Papacy both select card. Protestants add +4 while Papacy draws card adds its value (2 if Mandatory Event). Both sides roll requisite number of dice. Hits on 5 or 6. Winner converts spaces equal to difference in hits.';
  if (players > 2) {
    help = 'Protestants select card and add +4. Papacy selects card and adds randomly-drawn card (2 OPs if Mandatory Event). Hits on 5 or 6. Winner converts difference in hits.';
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




