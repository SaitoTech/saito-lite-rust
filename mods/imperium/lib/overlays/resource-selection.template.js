module.exports  = (
	resources_needed,
	planet_cards,
	trade_goods
) => {
	return `;
    <div class="resource-selection-overlay">
      <div class="resource-selection-title">SELECT <span class="resources_box">${resources_needed} resources</span>:</div>
      <div class="resource-selection-cards"></div>
      <div class="resource-selection-goods" data-amount="${trade_goods}">${trade_goods} trade goods</div>
    </div>
    `;
};
