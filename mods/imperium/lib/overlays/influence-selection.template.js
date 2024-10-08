module.exports  = (
	influence_needed,
	planet_cards,
	trade_goods
) => {
	return `;
    <div class="influence-selection-overlay">
      <div class="influence-selection-title">SELECT <span class="influence_box">${influence_needed} influence</span>:</div>
      <div class="influence-selection-cards"></div>
      <div class="influence-selection-goods" data-amount="${trade_goods}">${trade_goods} trade goods</div>
    </div>
    `;
};
