module.exports  = (obj, his_self) => {

	//    let obj = {
	//      spacekey : spacekey ,
	//      moved_units : moved_units ,
	//      unmoved_units : unmoved_units ,
	//    };
	//    { 
	//	faction : ,
	//	idx : available_units[idx] ,
	//    }

	let html = `
	  <div class="fortification-overlay">
            <div class="help">
	      <div class="fortification-from">${his_self.returnSpaceName(obj.spacekey)}</div> into <div class="fortification-to">Fortification</div>
	    </div>
	    <div class="fortification-table">
	      <div class="fortification-source">`;
	for (let i = 0; i < obj.unmoved_units.length; i++) {
		let ucss = '';
		let uclass = '';
		let utype = obj.unmoved_units[i].type;
		if (utype != 'regular' && utype != 'mercenary' && utype != 'cavalry' && obj.unmoved_units[i].reformer != true) {
			uclass = 'army-unit';
			ucss = `background-image:url('/his/img/tiles/army/${his_self.army[utype].img}');background-size:cover;`;
		}
		html += `
	     <div class="fortification-unit option ${uclass} ${obj.unmoved_units[i].type}" id="${obj.unmoved_units[i].faction}-${obj.unmoved_units[i].idx}">
	       <div class="fortification-unit-img" style="${ucss}"></div>
	       <div class="fortification-unit-type">${obj.unmoved_units[i].type}</div>
	       <div class="fortification-type-faction">${obj.unmoved_units[i].faction}</div>
             </div>
	`;
	}
	html += `</div>`;

	html += `<div class="fortification-destination">`;
	for (let i = 0; i < obj.moved_units.length; i++) {
		let ucss = '';
		let uclass = '';
		let utype = obj.moved_units[i].type;
		if (utype != 'regular' && utype != 'mercenary' && utype != 'cavalry') {
			uclass = 'army-unit';
			ucss = `background-image:url('/his/img/tiles/army/${his_self.army[utype].img}');background-size:cover;`;
		}
		html += `<div class="fortification-unit option ${uclass} ${obj.moved_units[i].type}" id="${obj.moved_units[i].faction}-${obj.moved_units[i].idx}">
	       <div class="fortification-unit-img" style="${ucss}"></div>
	       <div class="fortification-unit-type">${obj.moved_units[i].type}</div>
	       <div class="fortification-type-faction">${obj.moved_units[i].faction}</div>
	    </div>`;
	}
	html += `</div></div><div class="fortification-submit-button option" id="end">confirm and fortify</div></div>`;

	return html;
};
