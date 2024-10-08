module.exports  = (imperium_self, units) => {
	let html = `
    <div class="units-overlay hide-scrollbar">
  `;

	for (let i = 0; i < units.length; i++) {
		let obj = imperium_self.units[units[i]];
		html += obj.returnCardImage(obj);
	}

	html += `
    </div>
  `;

	return html;
};
