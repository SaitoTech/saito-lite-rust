module.exports = (obj) => {
	let html = `
    <div class="mandates-overlay mandated-offensives-overlay">
      <div class="help">Mandated Offensives</div>
      <div class="mandates">
      <div class="allies">
	<div class="entry r1">FR</div>
	<div class="entry r2">BR</div>
	<div class="entry r3">IT</div>
	<div class="entry r4">RU</div>
	<div class="entry r5 r6">None</div>
      </div>
      <div class="central">
	<div class="entry r1">AH</div>
	<div class="entry r2">AH (IT)</div>
	<div class="entry r3">TU</div>
	<div class="entry r4">GE</div>
	<div class="entry r5 r6">None</div>
      </div>
      </div>
    </div>
  `;
	return html;
};
