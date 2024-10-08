module.exports  = (
	imperium_self,
	units
) => {
	return `
    <div class="how-to-produce-overlay hide-scrollbar">

        <div class="title">Producing Units</div>

        <ol class="how-to-produce-tutorial">

          <li>
            <div class="title">activate sector</div>
            <div class="desc">use spacedocks to produce units</div>
          </li>

          <li>
            <div class="title">select units</div>
            <div class="desc">decide which units to produce</div>
          </li>

          <li>
            <div class="title">pay the bill</div>
            <div class="desc">spend resources or trade goods</div>
          </li>

        </ol>


        <div class="how-to-produce-example">

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

        <div class="how-to-produce-example-desc">
          NOTE: play Warfare after production to move units same turn
        </div>

    </div>

    </div>
  `;
};
