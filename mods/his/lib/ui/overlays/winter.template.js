module.exports = (f) => {

	let html = `
    <div class="winter winter-${f}">
      <div class="winter-title">A Passage of Winter</div>
      <div class="winter-text">
	<ul>
	  <li class="newworld1">resolve new world expeditions / bonuses</li>
	  <li class="stage1">land units retreat to fortified space</li>
	  <li class="stage2">ships retreat to nearest friendly port</li>
	  <li class="stage3">diplomatic proposals and alliances</li>
	  <li class="stage4">sueing for peace & resolving excommunication</li>
	  <li class="stage5">declarations of war</li>
	</ul>
      </div>
    </div>
  `;
	return html;
};
