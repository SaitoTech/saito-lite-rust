module.exports = (f) => {

  let html = `
    <div class="winter winter-${f}">
      <div class="winter-title">A Passage of Winter</div>
      <div class="winter-text">

	With the coming of winter:

	<ul>
	  <li>land units retreat to nearest fortified space</li>
	  <li>naval units retreat to nearest friendly port</li>
	  <li>all trapped units removed from game board</li>
	  <li>great power alliances dissolved until spring</li>
	  <li>debaters restored to uncommitted state</li>
	</ul>

      </div>
    </div>
  `;
  return html;

}
