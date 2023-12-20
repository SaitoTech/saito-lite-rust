module.exports = () => {

  let html = `
    <div class="guns-overlay hide-scrollbar">
      <div class="help">Central Powers - start with Guns of August?</div>
      <div class="content">
	<div class="cardbox">
	  <img src="/paths/img/cards/card_cp01.svg" />
	</div>
	<div class="controls">
	  <ul class="options">
	    <div class="guns option" id="guns">Yes</div>
	    <div class="guns option" id="no">No</div>
	  </ul>
	</div>
      </div>
    </div>
  `;
  return html;

}
