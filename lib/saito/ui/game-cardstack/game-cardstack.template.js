module.exports = GameCardStackTemplate = (_this) => {
  let html = `
    <div id="cardstack_${_this.name}" class="cardstack ${_this.orientation}">`;

  let index = 0;
  let shift = "";
  let direction = "";
  let gap = _this.card_width / _this.overlap;

  //Yes, we are checking if the element already exists...
  if (document.getElementById(`cardstack_${_this.name}`)) {
    let container = document.getElementById(`cardstack_${_this.name}`).getBoundingClientRect();

    if (_this.orientation == "left" || _this.orientation == "right") {
      if (container.width < (_this.cards.length - 1) * gap + _this.card_width) {
        gap = (container.width - _this.card_width) / (_this.cards.length - 1);
      }
    }else if (_this.orientation == "up" || _this.orientation == "down") {

    }
  }



  for (let card of _this.cards) {
      if (_this.orientation == "left") {
        shift = `right:${index * gap}px;`;
      } else if (_this.orientation == "right") {
        shift = `left:${index * gap}px;`;
      } else if (_this.orientation == "up") {
        shift = `bottom:${index * gap}px;`;
      } else if (_this.orientation == "down") {
        shift = `top:${index * gap}px;`;
      }
    

    html += `<div id="cardstack_${_this.name}_${index}" 
                  class="card-slot" 
                  style="z-index:${index};${shift}">
                  ${_this.mod.returnCardImageHTML(card)}
            </div>`;
    index++;
  }

  if (_this.cards.length == 0) {
   html += `<div id="cardstack_${_this.name}_empty" 
                  class="card-slot cs-empty"
                  style="width:${_this.card_width}px">
            </div>`;
  }

  html += `</div>`;

  return html;
};
