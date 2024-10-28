module.exports  = (_this) => {
	return `
    <div id="cardstack_${_this.name}" class="cardstack ${_this.orientation}">
      <div id="cardstack_${_this.name}_empty" class="card-slot cs-empty"></div>
    </div>
    `;
};
