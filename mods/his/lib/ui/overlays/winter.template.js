module.exports = (f) => {

	let html = `
    <div class="winter winter-${f}">
      <div class="winter-title">A Passage of Winter</div>
      <div class="winter-text">
	<ul>
	  <li class="newworld1">resolve new world rolls / bonuses</li>
	  <li class="stage1">troops withdraw to fortified space</li>
	  <li class="stage2">ships withdraw to friendly ports</li>
	  <li class="stage3">troops withdraw to capitals (optional)</li>
	  <li class="stage4">new cards dealt to all players</li>
	  <li class="stage5">diplomatic proposals and alliances</li>
	  <li class="stage6">sueing for peace & resolving excommunication</li>
	  <li class="stage7">declarations of war</li>
	</ul>
      </div>
    </div>
  `;
	return html;
};
