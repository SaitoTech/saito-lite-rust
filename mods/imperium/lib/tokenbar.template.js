module.exports  = (
	command_tokens,
	strategy_tokens,
	fleet_supply
) => {
	return `
    <div class="tokenbar">
      <div>${command_tokens} / ${strategy_tokens} / ${fleet_supply}</div>
    </div>
  `;
};
