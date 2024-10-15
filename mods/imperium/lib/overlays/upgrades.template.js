module.exports  = (imperium_self, tech) => {
	let html = `
    <div class="tech-overlay hide-scrollbar">
  `;

	for (let i = 0; i < tech.length; i++) {
		let t = tech[i];
		html += tech[i].returnCardImage();
		/**
    let p = "";

    for (let i = 0; i < t.prereqs.length; i++) {
      if (t.prereqs[i] == "yellow") { p += '<span class="yellow">♦</span>'; }
      if (t.prereqs[i] == "blue") { p += '<span class="blue">♦</span>'; }
      if (t.prereqs[i] == "green") { p += '<span class="green">♦</span>'; }
      if (t.prereqs[i] == "red") { p += '<span class="red">♦</span>'; }
    }


    html += `
        <div class="tech-card">
          <div class="name">${t.name}</div>
          <div class="text">${t.text}</div>
          <div class="prereqs">${p}</div>
        </div>
      `;
**/
	}

	html += `
    </div>
  `;

	return html;
};
