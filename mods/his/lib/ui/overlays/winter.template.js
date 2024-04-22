module.exports = (f) => {

	let html = `
    <div class="winter winter-${f}">
      <div class="winter-title">A Passage of Winter</div>
      <div class="winter-text">
	<ul>
	  <li class="stage1">resolve new world rolls / bonuses</li>
	  <li class="stage2">troops auto-retreat to fortified space</li>
	  <li class="stage3">ships auto-retreat to friendly ports</li>
	  <li class="stage4">troops manually withdraw to capitals</li>
	  <li class="stage5">new cards dealt to all players</li>
	  <li class="stage6">diplomatic proposals and alliances</li>
	  <li class="stage7">sueing for peace & resolving excommunication</li>
	  <li class="stage8">declarations of war</li>
	</ul>
      </div>
    </div>
  `;
	return html;
};
