module.exports = () => {
	let help = `Build a Chateaux?`;

	let html = `
      <div class="chateaux-overlay" id="chateaux-overlay">
	<div class="help">${help}</div>
	<div class="bonuses">
	  <div class="header">Modified Roll</div>
	  <div class="header">VP</div>
	  <div class="header">Cards</div>
          <div class="outcome1">+8</div>
          <div class="outcome1">+1</div>
          <div class="outcome1">draw 2, then discard 1</div>
          <div class="outcome2">5-7</div>
          <div class="outcome2">+1</div>
          <div class="outcome2">draw 1</div>
          <div class="outcome3">3-4</div>
          <div class="outcome3">+1</div>
          <div class="outcome3">draw 1, then discard 1</div>
          <div class="outcome4">2 or less</div>
          <div class="outcome4">none</div>
          <div class="outcome4">draw 2, then discard 1</div>
	  <div class="modifier modifier1">+2 if Milan is under French control</div>
	  <div class="modifier modifier2">+1 if Florence is under French control</div>
	  <div class="modifier modifier3">+2 if France controls 3 Italian keys</div>
	  <div class="modifier modifier4">+1 if tournament game</div>
	  <div class="modifier modifier5">-1 if a French home space is controlled by foreign power</div>
	  <div class="modifier modifier6">-2 if foreign units currently occupy a French home space</div>
	</div>
      </div>
  `;
	return html;
};
