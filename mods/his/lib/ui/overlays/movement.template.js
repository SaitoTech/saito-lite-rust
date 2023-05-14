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

    obj.source_regulars_unmoved = obj.source_regulars_total - obj.source_regulars_moved;
    obj.source_mercenaries_unmoved = obj.source_mercenaries_total - obj.source_regulars_moved;
    obj.source_cavalry_unmoved = obj.source_cavalry_total - obj.source_regulars_moved;

    let html = '';
    html += `
    <div class="movement-overlay">

      <div class="movement-header">
        move units from <div class="movement-from">${from}</div> to <div class="movement-to">${to}</div>
      </div>

      <div class="movement-table">
    `;
   if (obj.has_regulars) {
     //
     // regulars
     //
     html += `
	<div class="movement-unit regular">
  	  <div class="unit-img regular"></div>
  	  <div class="unit-desc">Regular</div>
    `;
     if (obj.source_regulars_unmoved > 0) {
       if (obj.ram_idx != -1) {
         html += `
            <div class="option unit-available" id="${obj.ram_idx}">${obj.source_regulars_unmoved}</div>
         `;
       } else {
         html += `
            <div class="unit-available">${obj.source_regulars_unmoved}</div>
         `;
       }
     } else {
         html+=  `<div class="unit-available">0</div>`;
     }
     if (obj.source_regulars_moved > 0) {
       if (obj.rtm_idx != -1) {
         html += `
            <div alass="option unit-moving" id="${obj.rtm_idx}">${obj.source_regulars_moved}</div>
         `;
       } else {
         html += `
            <div class="unit-moving">${obj.source_regulars_moved}</div>
         `;
       }
     } else {
         html+=  `<div class="unit-moving">0</div>`;
     }
     html += `</div>`;
   }




   if (obj.has_mercenaries) {
     //
     // mercenaries
     //
     html += `
	<div class="movement-unit regular">
  	  <div class="unit-img regular"></div>
  	  <div class="unit-desc">Regular</div>
    `;
     if (obj.source_mercenaries_unmoved > 0) {
       if (obj.mam_idx != -1) {
         html += `
            <div class="option unit-available" id="${obj.ram_idx}">${obj.source_mercenaries_unmoved}</div>
         `;
       } else {
         html += `
            <div class="unit-available">${obj.source_mercenaries_unmoved}</div>
         `;
       }
     } else {
         html+=  `<div class="unit-available">0</div>`;
     }
     if (obj.source_mercenaries_moved > 0) {
       if (obj.mtm_idx != -1) {
         html += `
            <div alass="option unit-moving" id="${obj.rtm_idx}">${obj.source_mercenaries_moved}</div>
         `;
       } else {
         html += `
            <div class="unit-moving">${obj.source_mercenaries_moved}</div>
         `;
       }
     } else {
         html+=  `<div class="unit-moving">0</div>`;
     }
     html += `</div>`;
   }



   if (obj.has_cavalry) {
     //
     // cavalry
     //
     html += `
	<div class="movement-unit regular">
  	  <div class="unit-img regular"></div>
  	  <div class="unit-desc">Regular</div>
    `;
     if (obj.source_cavalry_unmoved > 0) {
       if (obj.cam_idx != -1) {
         html += `
            <div class="option unit-available" id="${obj.ram_idx}">${obj.source_cavalry_unmoved}</div>
         `;
       } else {
         html += `
            <div class="unit-available">${obj.source_cavalry_unmoved}</div>
         `;
       }
     } else {
         html+=  `<div class="unit-available">0</div>`;
     }
     if (obj.source_cavalry_moved > 0) {
       if (obj.ctm_idx != -1) {
         html += `
            <div alass="option unit-moving" id="${obj.rtm_idx}">${obj.source_cavalry_moved}</div>
         `;
       } else {
         html += `
            <div class="unit-moving">${obj.source_cavalry_moved}</div>
         `;
       }
     } else {
         html+=  `<div class="unit-moving">0</div>`;
     }
     html += `</div>`;
   }



   if (obj.commanders.length > 0) {
     html += `
	<div class="movement-commanders">
     `;
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
     html += `
	</div>
     `;
     }
   html += `
      </div>
   `;
   }
   html += `
    </div>
    <div class="movement-controls">
      <div class="movement-submit-button option" id="end">submit move</div>
    </div>
  </div>
  `;

  return html;
}
