module.exports = (faction="") => {
	let html = `
      <div class="spring-deployment-overlay ${faction}" id="spring-deployment-overlay">
        <div class="status"></div>
        <div class="controls"></div>
        <div class="instructions" id="instructions"></div>
      </div>
  `;
	return html;
};
