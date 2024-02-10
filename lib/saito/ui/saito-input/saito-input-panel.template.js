module.exports = SaitoInputPanelTemplate = (obj={}) => {
  
  let left = 0;
  let bottom = 0;
  let top = 0;

  if (obj.left) { left = obj.left; }
  if (obj.bottom) { bottom = obj.bottom; }
  if (obj.top) { top = obj.top; }

  return `
		<div id="saito-input-panel" class="saito-input-panel saito-input-selection-box" style="bottom:${bottom}px; left:${left}px; max-height:${top}px;">
		</div>
  `;
};

