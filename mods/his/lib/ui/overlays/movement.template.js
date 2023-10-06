module.exports = MovementOverlayTemplate = (obj) => {

//    obj = {
//      faction : faction ,
//      space : space ,
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

    if (obj.to === "") { obj.to = "?"; }

    let html = '';
    html += `
    <div class="movement-overlay">

      <div class="movement-header">
        <div class="movement-from">${obj.from}</div> to <div class="movement-to">${obj.to}</div>
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
     if (obj.ram_idx != -1) {
       html += `
          <div class="option unit-available" id="${obj.ram_idx}">${obj.source_regulars_unmoved}</div>
       `;
     } else {
       html += `
          <div class="unit-available">${obj.source_regulars_unmoved}</div>
       `;
     }
     if (obj.rtm_idx != -1) {
       html += `
          <div class="option unit-moving" id="${obj.rtm_idx}">${obj.source_regulars_moved}</div>
       `;
     } else {
       html += `
          <div class="unit-moving">${obj.source_regulars_moved}</div>
       `;
     }
     html += `</div>`;
   }



   if (obj.has_mercenaries) {
     //
     // mercenaries
     //
     html += `
	<div class="movement-unit mercenary">
  	  <div class="unit-img mercenary"></div>
  	  <div class="unit-desc">Mercenary</div>
    `;
     if (obj.mam_idx != -1) {
       html += `
          <div class="option unit-available" id="${obj.mam_idx}">${obj.source_mercenaries_unmoved}</div>
       `;
     } else {
       html += `
          <div class="unit-available">${obj.source_mercenaries_unmoved}</div>
       `;
     }
     if (obj.mtm_idx != -1) {
       html += `
          <div class="option unit-moving" id="${obj.mtm_idx}">${obj.source_mercenaries_moved}</div>
       `;
     } else {
       html += `
          <div class="unit-moving">${obj.source_mercenaries_moved}</div>
       `;
     }
     html += `</div>`;
   }
   if (obj.has_cavalry) {
     //
     // cavalry
     //
     html += `
	<div class="movement-unit cavalry">
  	  <div class="unit-img cavalry"></div>
  	  <div class="unit-desc">Cavalry</div>
    `;
     if (obj.cam_idx != -1) {
       html += `
          <div class="option unit-available" id="${obj.cam_idx}">${obj.source_cavalry_unmoved}</div>
       `;
     } else {
       html += `
          <div class="unit-available">${obj.source_cavalry_unmoved}</div>
       `;
     }
     if (obj.rtm_idx != -1) {
       html += `
          <div class="option unit-moving" id="${obj.ctm_idx}">${obj.source_cavalry_moved}</div>
       `;
     } else {
       html += `
          <div elass="unit-moving">${obj.source_cavalry_moved}</div>
       `;
     }
     html += `</div>`;
   }

   if (obj.commanders.length > 0) {
     html += `
	<div class="movement-commanders">
     `;
     for (let i = 0; i < obj.commanders.length; i++) {
       let army_leader_img = obj.space.units[obj.faction][obj.commanders[i]].img;
       let css2add = `style="background-image: url('/his/img/tiles/army/${army_leader_img}'); background-size: cover;"`;
       if (obj.units_to_move.includes(obj.commanders[i])) {
         html += `
            <div id="${obj.commanders[i]}" class="option movement-commander dispatched" ${css2add}></div>
         `;
       } else {
         html += `
            <div id="${obj.commanders[i]}" class="option movement-commander" ${css2add}></div>
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
