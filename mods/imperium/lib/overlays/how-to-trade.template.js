module.exports = ImperiumHowToProduceOverlayTemplate = (imperium_self, units) => {

  return `
    <div class="how-to-trade-overlay hide-scrollbar">

        <div class="title">Trade Goods</div>

        <ol class="how-to-trade-tutorial">

          <li>
            <div class="title">neighbours can trade</div>
            <div class="desc">you can only trade with neighbours</div>
          </li>

          <li>
            <div class="title">give commodities</div>
            <div class="desc">they receive trade goods</div>
          </li>

          <li>
            <div class="title">receive trade goods</div>
            <div class="desc">you receive trade goods</div>
          </li>

        </ol>


        <div class="how-to-trade-example">

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

        <div class="how-to-trade-example-desc">
          NOTE: use Trade to receive trade goods and give commodities to yourself and your neighbours
        </div>

    </div>

    </div>
  `;

}

