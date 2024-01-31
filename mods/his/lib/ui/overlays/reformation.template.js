module.exports = (title, obj) => {
	let t = `Reformation in ${title}`;
	if (obj.counter_reformation) {
		t = `Counter-Reformation in ${title}`;
	}

	let html = `
      <div class="reformation-overlay" id="reformation-overlay">
        <div class="title">${t}</div>
	<div class="reformation-box">
	  <div class="protestant">
	    <div class="title">Protestants</div>
	  </div>
	  <div class="papacy">	    
            <div class="title">Papacy</div>
            </div>
          </div>
        </div>
      </div>
  `;
	return html;
};
