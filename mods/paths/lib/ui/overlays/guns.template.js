module.exports = () => {
	let html = `
    <div class="guns-overlay hide-scrollbar">
      <div class="help">Central Powers - start with Guns of August?</div>
      <div class="status">Central Powers - start with Guns of August?</div>
      <div class="controls">
	<ul class="options">
	  <li class="guns option" id="guns">Guns of August</li>
	  <li class="guns option" id="other">Other Card</li>
	</ul>
	<div class="guns-cardbox">
	  <img src="/paths/img/cards/card_cp01.svg" />
	</div>
      </div>
    </div>
  `;
	return html;
};
