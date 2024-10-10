module.exports  = (imperium_self, units) => {
	return `
    <div class="how-to-move-overlay hide-scrollbar">

	<div class="title">How Movement Works</div>

	<ol class="how-to-move-tutorial">

	  <li>
	    <div class="title">activate sector</div>
	    <div class="desc">activate the destination sector</div>
	  </li>

	  <li>
	    <div class="title">move ships</div>
	    <div class="desc">select ships within range</div>
	  </li>

	  <li>
	    <div class="title">resolve conflict</div>
	    <div class="desc">space combat begins automatically</div>
	  </li>

	</ol>


	<div class="how-to-move-example">

	  <div class="unit square">
            <div class="unit-description" data-type="carrier" data-name="Carrier" data-amount="0">Carrier</div>
            <div class="unit-ship unit-ship-carrier"></div>
            <div class="unit-details">
              <div class="unit-num">3</div>
              <div class="unit-desc">cost</div>
            </div>
            <div class="unit-details">
              <div class="unit-num">1</div>
              <div class="unit-desc">move</div>
            </div>
            <div class="unit-details">
              <div class="unit-num">9</div>
              <div class="unit-desc">combat</div>
            </div>
            <div class="unit-details">
              <div class="unit-num">4</div>
              <div class="unit-desc">cargo</div>
            </div>
          </div>

        </div>

        <div class="how-to-move-example-desc">
	  NOTE: value is how many hexes ships can move - only units from inactivated sectors may move.
        </div>

    </div>
  `;
};
