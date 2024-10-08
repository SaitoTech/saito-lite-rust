module.exports  = (sys, fleet) => {
	let cols = '1fr';
	if (sys.p.length == 2) {
		cols = '1fr 1fr';
	}
	if (sys.p.length == 3) {
		cols = '1fr 1fr 1fr';
	}
	if (sys.p.length == 4) {
		cols = '1fr 1fr 1fr 1fr';
	}

	return `
    <div class="sector-overlay hide-scrollbar">
      <div class="name">${sys.s.name}</div>
      <div class="fleet">${fleet}</div>
      <div class="planet-grid" style="grid-template-columns:${cols}">
        </div>
    </div>
  `;
};
