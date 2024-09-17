


function switch_display_mode_in_string(fulltext="", dmode="simplified", existing_preference="simplified") {

	fulltext = fulltext.replace(/> </g, '><');
	var new_fulltext = '';

	var starting_position = 0;

	var entries = fulltext.split('<span');

	if (fulltext.indexOf('<span') > 0) {
		starting_position = 1;
		new_fulltext += entries[0];
	}

	if (entries.length > starting_position) {
		while (entries[starting_position] === "") {
			starting_position++;
		}
	}

	for (var i = starting_position; i < entries.length; i++) {
		if (entries[i].indexOf('event') != -1) {
			var post = '';
			try {
				post = entries[i].split('</span>')[1];
				if (existing_preference == 'pinyin') {
					post = post.replace(/> </g, '><');
				}
			} catch (err) {}

			var tfld1 = extract_field1(entries[i]);
			var tfld2 = extract_field2(entries[i]);
			var tfld3 = extract_field3(entries[i]);
			var tfld4 = extract_field4(entries[i]);
			var tfld5 = extract_field5(entries[i]);
			var tfld6 = extract_field6(entries[i]);
			var visible_field = tfld3;

			// Update to avoid breaking non-converting entries
			if (tfld3 === null && tfld4 === null && tfld6 === null) {
				new_fulltext += '<span' + entries[i] + post;
			} else {
				if (dmode == 'simplified') {
					if (
						existing_preference == 'traditional' ||
						existing_preference == 'pinyin'
					) {
						replacement_html =
							'<span id="adso_' +
							tfld6 +
							'" onclick="onWordClick()" onmousedown="adso_mousedown(\'' +
							tfld6 +
							'\')" onmouseup="adso_mouseup(\'' +
							tfld6 +
							'\')" onmouseover="tip(event,\'' +
							tfld1 +
							'\',\'' +
							tfld2 +
							'\',\'' +
							tfld4 +
							'\',\'' +
							tfld3 +
							'\',\'' +
							tfld5 +
							'\',\'' +
							tfld6 +
							'\')" onmouseout="htip()">' +
							tfld4 +
							'</span>' +
							post;
					} else {
						replacement_html =
							'<span id="adso_' +
							tfld6 +
							'" onclick="onWordClick()" onmousedown="adso_mousedown(\'' +
							tfld6 +
							'\')" onmouseup="adso_mouseup(\'' +
							tfld6 +
							'\')" onmouseover="tip(event,\'' +
							tfld1 +
							'\',\'' +
							tfld2 +
							'\',\'' +
							tfld3 +
							'\',\'' +
							tfld4 +
							'\',\'' +
							tfld5 +
							'\',\'' +
							tfld6 +
							'\')" onmouseout="htip()">' +
							tfld3 +
							'</span>' +
							post;
					}
				}
				if (dmode == 'traditional') {
					if (existing_preference == 'simplified') {
						replacement_html =
							'<span id="adso_' +
							tfld6 +
							'" onclick="onWordClick()" onmousedown="adso_mousedown(\'' +
							tfld6 +
							'\')" onmouseup="adso_mouseup(\'' +
							tfld6 +
							'\')" onmouseover="tip(event,\'' +
							tfld1 +
							'\',\'' +
							tfld2 +
							'\',\'' +
							tfld4 +
							'\',\'' +
							tfld3 +
							'\',\'' +
							tfld5 +
							'\',\'' +
							tfld6 +
							'\')" onmouseout="htip()">' +
							tfld4 +
							'</span>' +
							post;
					} else {
						replacement_html =
							'<span id="adso_' +
							tfld6 +
							'" onclick="onWordClick()" onmousedown="adso_mousedown(\'' +
							tfld6 +
							'\')" onmouseup="adso_mouseup(\'' +
							tfld6 +
							'\')" onmouseover="tip(event,\'' +
							tfld1 +
							'\',\'' +
							tfld2 +
							'\',\'' +
							tfld3 +
							'\',\'' +
							tfld4 +
							'\',\'' +
							tfld5 +
							'\',\'' +
							tfld6 +
							'\')" onmouseout="htip()">' +
							tfld3 +
							'</span>' +
							post;
					}
				}
				if (dmode == 'pinyin') {
					if (existing_preference == 'traditional') {
						replacement_html =
							'<span id="adso_' +
							tfld6 +
							'" onclick="onWordClick()" onmousedown="adso_mousedown(\'' +
							tfld6 +
							'\')" onmouseup="adso_mouseup(\'' +
							tfld6 +
							'\')" onmouseover="tip(event,\'' +
							tfld1 +
							'\',\'' +
							tfld2 +
							'\',\'' +
							tfld3 +
							'\',\'' +
							tfld4 +
							'\',\'' +
							tfld5 +
							'\',\'' +
							tfld6 +
							'\')" onmouseout="htip()">' +
							convert_pinyin(tfld2) +
							'</span>' +
							' ' +
							post;
					} else {
						replacement_html =
							'<span id="adso_' +
							tfld6 +
							'" onclick="onWordClick()" onmousedown="adso_mousedown(\'' +
							tfld6 +
							'\')" onmouseup="adso_mouseup(\'' +
							tfld6 +
							'\')" onmouseover="tip(event,\'' +
							tfld1 +
							'\',\'' +
							tfld2 +
							'\',\'' +
							tfld4 +
							'\',\'' +
							tfld3 +
							'\',\'' +
							tfld5 +
							'\',\'' +
							tfld6 +
							'\')" onmouseout="htip()">' +
							convert_pinyin(tfld2) +
							'</span>' +
							' ' +
							post;
					}
				}
			} // update to avoid breaking non-converting entries
			new_fulltext += replacement_html;
		} else {
			new_fulltext += '<span' + entries[i];
		}
	}

	return new_fulltext;

}

function switch_display_mode(dmode="simplified") {

	document.querySelectorAll(':has(> span)').forEach((el) => {
	  let x = el.innerHTML.replace(/SPAN/g, 'span');
	  el.innerHTML = switch_display_mode_in_string(x, dmode);
	});

	save_display_mode(dmode);

	return true;

}

// overrideen in popup.js
function save_display_mode(dmode="") {
}

