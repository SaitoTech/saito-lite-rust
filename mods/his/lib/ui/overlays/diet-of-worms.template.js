module.exports = (players=2) => {
 
  let help = 'Protestants and Papacy both select card. Protestants add +4 while Papacy draws card adds its value (2 if Mandatory Event). Both sides roll requisite number of dice. Hits on 5 or 6. Winner converts spaces equal to difference in hits.';
  if (players > 2) {
    help = 'Protestants pick a card and +4 its value. Papacy and Hapsburgs each pick cards and combine their values. Both sides roll requisite number of dice. Hits on 5 or 6. Winner converts spaces equal to difference in hits.';
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




