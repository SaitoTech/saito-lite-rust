module.exports = GameCardStackTemplate = (_this) => {
  let html = `
    <div id="cardstack_${_this.name}" class="cardstack ${_this.orientation}">`;

  let index = 0;
  let cum_shift = 0;
  let face = "";
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
    } else if (_this.orientation == "up" || _this.orientation == "down") {
      let card_height = _this.card_width * _this.card_height_ratio;
      gap = Math.floor(gap * _this.card_height_ratio);
      if (container.height < (_this.cards.length - 1) * gap + card_height) {
        gap = (container.height - card_height) / (_this.cards.length - 1);
      }
    }
  }

  gap = Math.max(gap, 4);

  for (let card of _this.cards) {
    if (face == "faceup"){
      cum_shift += gap;  
    }else if (face == "facedown") {
      cum_shift += gap/4;  
    } else {
      cum_shift = 0;
    }
    
    

    face = _this.mod.isFaceDown(card) ? "facedown" : "faceup";

    if (_this.orientation == "left") {
      shift = `right:${cum_shift}px;`;
    } else if (_this.orientation == "right") {
      shift = `left:${cum_shift}px;`;
    } else if (_this.orientation == "up") {
      shift = `bottom:${cum_shift}px;`;
    } else if (_this.orientation == "down") {
      shift = `top:${cum_shift}px;`;
    }

    html += `<div id="cardstack_${_this.name}_${index}" 
                  class="card-slot ${face}" 
                  style="z-index:${index};${shift}">${_this.mod.returnCardImageHTML(card)}</div>`;
    index++;
  }

  if (_this.cards.length == 0) {
    html += `<div id="cardstack_${_this.name}_empty" 
                  class="card-slot cs-empty">
            </div>`;
  }

  html += `</div>`;

  return html;
};
