module.exports  = (unit) => {
	return `
    <div class="unit-element">
      <div class="unit-box-ship unit-box-ship-${unit.type}"></div>
      <div class="unit-box">
        <div class="unit-box-num">${unit.cost}</div>
        <div class="unit-box-desc">cost</div>
	</div>
        <div class="unit-box">
	  <div class="unit-box-num">${unit.move}</div>
	  <div class="unit-box-desc">move</div>
	</div>
        <div class="unit-box">
	  <div class="unit-box-num">${unit.combat}</div>
	  <div class="unit-box-desc">combat</div>
	</div>
        <div class="unit-box">
	  <div class="unit-box-num">${unit.capacity}</div>
	  <div class="unit-box-desc">holds</div>
	</div>
        <div class="unit-description">${unit.description}</div>
      </div>
  `;
};
