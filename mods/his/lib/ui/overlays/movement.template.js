module.exports  = (obj, his_self) => {
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

	if (!obj.to) {
		obj.to = 'Unknown';
	}

	let html = `<div class="movement-overlay">
    <div class="help">
	<div class="movement-from">${obj.from}</div> to <div class="movement-to">${obj.to}</div></div>
    <div class="available-units-overlay"></div>
    <div class="movement-table"><div class="movement-source">`;
	for (let i = 0; i < obj.unmoved_units.length; i++) {
		console.log('UNMOVED: ' + JSON.stringify(obj.unmoved_units[i]));

		let ucss = '';
		let uclass = '';
		let utype = obj.unmoved_units[i].type;
		if (utype != 'regular' && utype != 'mercenary' && utype != 'cavalry' && obj.unmoved_units[i].reformer != true) {
			uclass = 'army-unit';
			ucss = `background-image:url('/his/img/tiles/army/${his_self.army[utype].img}');background-size:cover;`;
		}
		html += `
	     <div class="movement-unit option ${uclass} ${obj.unmoved_units[i].type}" id="${obj.unmoved_units[i].faction}-${obj.unmoved_units[i].idx}">
	       <div class="movement-unit-img" style="${ucss}"></div>
	       <div class="movement-unit-type">${obj.unmoved_units[i].type}</div>
	       <div class="movement-type-faction">${obj.unmoved_units[i].faction}</div>
             </div>
	`;
	}
	html += `</div>`;

	html += `<div class="movement-destination">`;
	for (let i = 0; i < obj.destination_units.length; i++) {
		let ucss = '';
		let uclass = '';
		let utype = obj.destination_units[i].type;
		if (utype != 'regular' && utype != 'mercenary' && utype != 'cavalry') {
			uclass = 'army-unit';
			ucss = `background-image:url('/his/img/tiles/army/${his_self.army[utype].img}');background-size:cover;`;
		}
		html += `<div class="movement-unit immobile ${uclass} ${obj.destination_units[i].type}" id="${obj.destination_units[i].faction}-${obj.destination_units[i].idx}">
	       <div class="movement-unit-img" style="${ucss}"></div>
	       <div class="movement-unit-type">${obj.destination_units[i].type}</div>
	       <div class="movement-type-faction">${obj.destination_units[i].faction}</div>
            </div>`;
	}
	for (let i = 0; i < obj.moved_units.length; i++) {
		let ucss = '';
		let uclass = '';
		let utype = obj.moved_units[i].type;
		if (utype != 'regular' && utype != 'mercenary' && utype != 'cavalry') {
			uclass = 'army-unit';
			ucss = `background-image:url('/his/img/tiles/army/${his_self.army[utype].img}');background-size:cover;`;
		}
		html += `<div class="movement-unit option ${uclass} ${obj.moved_units[i].type}" id="${obj.moved_units[i].faction}-${obj.moved_units[i].idx}">
	       <div class="movement-unit-img" style="${ucss}"></div>
	       <div class="movement-unit-type">${obj.moved_units[i].type}</div>
	       <div class="movement-type-faction">${obj.moved_units[i].faction}</div>
	    </div>`;
	}
	html += `</div></div><div class="movement-submit-button option" id="end">confirm and move</div></div>`;

	return html;
};
