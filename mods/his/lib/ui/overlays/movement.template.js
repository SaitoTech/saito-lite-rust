module.exports = MovementOverlayTemplate = (obj) => {

//    let obj = {
//      faction : faction ,
//      moved_units : moved_units ,
//      unmoved_units : unmoved_units ,
//      destination_units : destination_units ,
//      space : space ,
//      from : from ,
//      to : to ,
//      max_formation_size : max_formation_size ,
//    };

  let html = `<div class="movement-overlay"><div class="movement-table"><div class="movement-source">`;
  for (let i = 0; i < obj.unmoved_units.length; i++) {
    html += `<div class="movement-unit ${obj.unmoved_units[i].type}" id="${obj.unmoved_units[i].faction}-${obj.unmoved_units[i].idx}"></div>`;
  }
  html += `</div>`;

  html += `<div class="movement-destination">`;
  for (let i = 0; i < obj.destination_units.length; i++) {
    html += `<div class="movement-unit immobile ${obj.destination_units[i].type}" id="${obj.destination_units[i].faction}-${obj.destination_units[i].idx}"></div>`;
  }
  for (let i = 0; i < obj.moved_units.length; i++) {
    html += `<div class="movement-unit ${obj.moved_units[i].type}" id="${obj.moved_units[i].faction}-${obj.moved_units[i].idx}"></div>`;
  }
  html += `</div></div></div>`;

  return html;
}
