module.exports = (title) => {

  let html = `
      <div class="reformation-overlay" id="reformation-overlay">
        <div class="title">reformation in ${title}</div>
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

}
