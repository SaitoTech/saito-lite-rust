module.exports = MovementOverlayTemplate = (obj) => {

//    obj = {
//      faction : faction ,
//      has_regulars : has_regulars,
//      has_mercenaries : has_mercenaries ,
//      has_cavalry : has_cavalry ,
//      source_regulars_total : source_regulars_total ,
//      source_mercenaries_total : source_mercenaries_total ,
//      source_cavalry_total : source_cavalry_total ,
//      source_regulars_moved : source_regulars_moved ,
//      source_mercenaries_moved : source_mercenaries_moved ,
//      source_cavalry_moved : source_cavalry_moved ,
//      rtm_idx : rtm ,	// regulars to move
//      ram_idx : ram , // regulars already moved
//      mtm_idx : mtm ,
//      mam_idx : mam ,
//      ctm_idx : ctm ,
//      cam_idx : cam ,
//    };

    let html = '';
    html += `
    <div class="movement-overlay">

      <div class="movement-header">
        You may move a maximum of <span class="formation_size">4</span> units
      </div>

      <div class="movement-description">
	<div class="movement-from">Ravenna</div>
	<div class="movement-direction"> &gt &gt &gt </div>
	<div class="movement-to">Venice</div>
      </div>

      <div class="movement-table">
	<div class="movement-unit regular">
  	  <div class="unit-img regular"></div>
  	  <div class="unit-desc">Regular</div>
  `;
   if (obj.rtm_idx == -1) {
     html += `
          <div class="option unit-available">0</div>
     `;
   } else {
     html += `
          <div class="option unit-available" id="${obj.rtm_idx}">${obj.source_regulars_total - obj.source_regulars_moved}</div>
     `;
   }
   if (obj.ram_idx == -1) {
     html += `
  	  <div class="unit-moving">0</div>
     `;
   } else {
     html += `
          <div class="option unit-moving" id="${obj.ram_idx}">${obj.source_regulars_moved}</div>
     `;
   }
   html += `
        </div>
	<div class="movement-unit mercenary">
  	  <div class="unit-img mercenary"></div>
  	  <div class="unit-desc">Mercenary</div>
   `;
   if (obj.mtm_idx == -1) {
     html += `
          <div class="option unit-available">0</div>
     `;
   } else {
     html += `
          <div class="option unit-available" id="${obj.mtm_idx}">${obj.source_mercenaries_total - obj.source_mercenaries_moved}</div>
     `;
   }
   if (obj.mam_idx == -1) {
     html += `
  	  <div class="unit-moving">0</div>
     `;
   } else {
     html += `
          <div class="option unit-moving" id="${obj.mam_idx}">${obj.source_mercenaries_moved}</div>
     `;
   }
   html += `
        </div>
	<div class="movement-unit cavalry">
  	  <div class="unit-img cavalry"></div>
  	  <div class="unit-desc">Cavalry</div>
   `;
   if (obj.ctm_idx == -1) {
     html += `
          <div class="option unit-available">0</div>
     `;
   } else {
     html += `
          <div class="option unit-available" id="${obj.ctm_idx}">${obj.source_cavalry_total - obj.source_cavalry_moved}</div>
     `;
   }
   if (obj.cam_idx == -1) {
     html += `
  	  <div class="unit-moving">0</div>
     `;
   } else {
     html += `
          <div class="option unit-moving" id="${obj.cam_idx}">${obj.source_cavalry_moved}</div>
     `;
   }
   html += `
        </div>
   `;
   if (obj.commanders.length > 0) {
   html += `
	<div class="movement-commanders">
   `;
   }
   for (let i = 0; i < obj.commanders.length; i++) {
     if (obj.units_to_move.includes(obj.commanders[i])) {
       html += `
          <div class="movement-commander dispatched"></div>
       `;
     } else {
       html += `
          <div class="movement-commander"></div>
       `;
     }
   }
   if (obj.commanders.length > 0) {
   html += `
	</div>
   `;
   }
   html += `
      </div>

      <div class="movement-controls">
        <div class="movement-submit-button">submit move</div>
      </div>

    </div>
  `;

  return html;
}
