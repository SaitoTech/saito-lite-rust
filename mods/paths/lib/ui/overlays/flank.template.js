module.exports = () => {
	let html = `
    <div class="flank-overlay hide-scrollbar">
      <div class="help">Flank Attack?</div>
      <div class="status">Attack as Flank Attank?</div>
      <div class="controls">
	<ul class="options">
	  <li class="flank option" id="yes">flank attack</li>
	  <li class="flank option" id="no">normal attack</li>
	</ul>
      </div>
    </div>
  `;
	return html;
};
