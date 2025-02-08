/* Server Manipulates These */
var firstdefinition = '';
var lastdefinition = '';
var thiselement = '';
var object_under_editing = '';
var object_under_updating = '';
var object_under_editing_permitted_to_update = 1;
var object_under_editing_id = -1;
var row_under_editing = 0;
var is_resegmenting = 0;

var saito_app = null;
var saito_mod = null;

var tt1 = '';
var tt2 = '';
var tt3 = '';
var tt4 = '';
var tt5 = '';

var update_server_with_edits = 1;

var pre_field_lookup = '';
var match_field_lookup = '';
var post_field_lookup = '';
var pre_field_lookup_id = '';
var match_field_lookup_id = '';
var post_field_lookup_id = '';

/* Cross-Browser Variables */
var ie = document.all;
var ff = document.getElementById && !document.all;

try {
	if (content_id == undefined) {
		content_id = -1;
	}
} catch (err) {
	var content_id = -1;
}

/* Popup Variables */
var pointer_x_offset = 12;
var pointer_y_offset = 10;
var tooltip_x_offset = 10;
var tooltip_y_offset = 14;
var rawx = 0;
var rawy = 0;
var current_x = 0;
var current_y = 0;
var parent_x_offset = 0;
var parent_y_offset = 0;
var tooltip_editing_width = '350px';
var tooltip_editing_height = 'auto';
var tooltip_display_width = 'auto';
var tooltip_display_height = 'auto';
var is_tooltip_visible = 0;
var is_tooltip_locked = 0;
var is_editing_enabled = 1;
var is_copying_enabled = 0;
var is_annotated = 0;
var is_annotating_enabled = 0;
var tooltip;
var pointer;

try {
	tooltip = document.getElementById('adso_tooltip');
	$('adso_tooltip').bind('mouseout', hide_tooltip);
	pointer = document.getElementById('adso_pointer');
} catch (err) {}

/* callback to override */
function adso_callback() {}

/* Showing, Hiding and Positioning the Tooltip */
function show_tooltip() {
	tooltip.style.visibility = 'visible';
	is_tooltip_visible = 1;
}
function save_tooltip() {
	var entries = new Array();
	var row_1 = '';
	var row_2 = '';
	var row_3 = '';
	var row_4 = '';
	var row_5 = '';
	var row_6 = '';
	var text = object_under_editing.innerHTML;

	var replacement_html = '';

	entries = tooltip.innerHTML.split('>');
	for (m = 3; m < entries.length; m += 2) {
		row1 = '';
		row2 = '';
		row3 = '';
		row4 = '';
		row5 = '';
		row6 = '';

		entries2 = entries[m].split('<');
		if (m == 3) {
			row_1 = entries2[0];
		}
		if (m == 5) {
			row_2 = entries2[0];
		}
		if (m == 7) {
			row_3 = entries2[0];
		}
		if (m == 9) {
			row_4 = entries2[0];
		}
		if (m == 11) {
			row_5 = entries2[0];
		}
		if (m == 13) {
			row_6 = entries2[0];
		}
	}

	var inset2 = row_1;
	inset2 = inset2.replace(/\'/g, "'");

	row_1 = p(q(row_1));
	row_2 = p(q(row_2));
	row_3 = p(q(row_3));
	row_4 = p(q(row_4));
	row_5 = p(q(row_5));
	row_6 = p(q(row_6));

	replacement_html =
		'<span id="adso_' +
		row_6 +
		'" onclick="onWordClick()" onmousedown="adso_mousedown(\'' +
		row_6 +
		'\')" onmouseup="adso_mouseup(\'' +
		row_6 +
		'\')" onmouseover="tip(event,\'' +
		row_4 +
		"','" +
		row_3 +
		"','" +
		row_1 +
		"','" +
		row_2 +
		"','" +
		row_5 +
		"','" +
		row_6 +
		'\')" onmouseout="htip()">' +
		inset2 +
		'</span>';
	var output = '';
	array_of_entries = text.split('</span>');
	for (var i = 0; i < array_of_entries.length; i++) {
		var field1 = extract_field1(array_of_entries[i]);
		var field2 = extract_field2(array_of_entries[i]);
		var field3 = extract_field3(array_of_entries[i]);
		var field4 = extract_field4(array_of_entries[i]);
		var field5 = extract_field5(array_of_entries[i]);
		var field6 = extract_field6(array_of_entries[i]);
		var pre = extract_pre(array_of_entries[i]);

		if (
			field1 == '' &&
			field2 == '' &&
			field3 == '' &&
			field4 == '' &&
			field5 == '' &&
			array_of_entries[i] != ''
		) {
			output += array_of_entries[i];
		} else {
			if (field6 != '') {
				if (field6 == row_6) {
					// Inform Ourselves of Edited Content
					if (update_server_with_edits == 1) {
						$.post(
							'/updates/editAnnotator',
							{
								field1: row_4,
								field2: row_3,
								field3: row_1,
								field4: row_2,
								field5: row_5
							},
							function (txt) {
								//alert(txt);
							}
						);
					}
					output += pre + replacement_html;
				} else {
					output +=
						pre +
						'<span id="adso_' +
						field6 +
						'" onclick="onWordClick()" onmousedown="adso_mousedown(\'' +
						field6 +
						'\')" onmouseup="adso_mouseup(\'' +
						field6 +
						'\')" onmouseover="tip(event,\'' +
						p(q(field1)) +
						"','" +
						p(q(field2)) +
						"','" +
						p(q(field3)) +
						"','" +
						p(q(field4)) +
						"','" +
						p(q(field5)) +
						"','" +
						field6 +
						'\')" onmouseout="htip()">' +
						field3.replace(/\\\'/g, "'") +
						'</span>';
				}
			}
		} // catching final post text
	}

	object_under_editing.innerHTML = output;

	is_tooltip_locked = 0;

	hide_tooltip();

	adso_callback();
}
function hide_tooltip() {
	if (is_tooltip_locked == 1) {
		return;
	}
	tooltip.innerHTML = '';
	is_tooltip_visible = 0;
	is_resegmenting = 0;
	tooltip.style.visibility = 'hidden';
	row_under_editing = 0;
}
document.onmousemove = update_tooltip;
function update_tooltip(e) {
	if (is_tooltip_locked == 1 || is_resegmenting == 1) {
		return;
	}

	try {
		rawx = current_x = ff
			? e.pageX
			: event.clientX + ie_backward_compatibility().scrollLeft;
		rawy = current_y = ff
			? e.pageY
			: event.clientY + ie_backward_compatibility().scrollTop;
	} catch (err) {
		//alert("Error generating current position: "+err.message);
	}

	availW = 0;
	availH = 0;
	scrollX = 0;
	scrollY = 0;

	if (document.all) {
		availW = document.body.clientWidth;
		availH = document.body.clientHeight;
		scrollX = document.body.scrollLeft;
		scrollY = document.body.scrollTop;
	} else {
		availW = innerWidth;
		availH = innerHeight;
		scrollX = window.pageXOffset;
		scrollY = window.pageYOffset;
	}

	tooltip_height = tooltip.offsetHeight;

	stop_position = tooltip_height + current_y;

	// Scroll Offset
	if (current_y - scrollY + tooltip_height > availH) {
		current_y = current_y - tooltip_height - 30;
	}

	tooltip.style.left = current_x + 10 + 'px';
	tooltip.style.top = current_y + 10 + 'px';
}
function ie_backward_compatibility() {
	return document.compatMode && document.compatMode != 'BackCompat'
		? document.documentElement
		: document.body;
}

/* Tracking Mouse Events */

function tip(event, event1, event2, event3, event4, event5, divdef) {
	tt1 = event1;
	tt2 = event2;
	tt3 = event3;
	tt4 = event4;
	tt5 = event5;

	if (is_tooltip_locked == 1 || is_resegmenting == 1) {
		return;
	}
	try {
		if (event1 == '') {
			event1 = 'unknown';
		}
		if (event2 == '') {
			event2 = 'unknown';
		} // english
		if (event3 == '') {
			event3 = 'unknown';
		} // english
		if (event4 == '') {
			event4 = 'unknown';
		} // english
		if (event5 == '') {
			event5 = 'unknown';
		} // part of speech
		if (content_id == -1) {
			// non-editing pages
			if (event1 == 'unknown') {
				event1 = '';
			}
			if (event3 == 'unknown') {
				event3 = '';
			} // english
			if (event2 == 'unknown') {
				event2 = '';
			} // english
			if (event4 == 'unknown') {
				event4 = '';
			} // english
			if (event5 == 'unknown') {
				event5 = '';
			} // part of speech
			if (event5.search('color:') != -1) {
				event5 = '';
			}
			if (event5.search('http:') != -1) {
				event5 = '';
			}
			event2 = convert_pinyin(event2);
		}
	} catch (err) {}

	/* NonChinese Entries (english text) have identical events and are easy to recognize, skip showing popup, it's obvious */
	if (event1 == event2 && event2 == event3 && event3 == event4) {
		return;
	}

	event1 = rp(event1.replace(/`/g, "'"));
	event2 = rp(event2.replace(/`/g, "'"));
	event3 = rp(event3.replace(/`/g, "'"));
	event4 = rp(event4.replace(/`/g, "'"));
	try {
		event5 = rp(event5.replace(/`/g, "'"));
	} catch (err) {} // backwards compatible with older markup script

	try {
		tooltip.innerHTML =
			'<div style="overflow:hidden"><div id="row_1" class=" row_1 " onclick="edit_row_num(1)" align="center">' +
			event3 +
			'</div>' +
			'<div id="row_2" class="row_2" onclick="edit_row_num(2)" align="center">' +
			event4 +
			'</div>' +
			'<div id="row_3" class="row_3" onclick="edit_row_num(3)" align="center">' +
			event2 +
			'</div>' +
			'<div id="row_4" class="row_4" onclick="edit_row_num(4)" align="center">' +
			event1 +
			'</div><div id="row_5" class="row_5" onclick="edit_row_num(5)" align="center">' +
			event5 +
			'</div><div id="divdef" class="row_6">' +
			divdef +
			'</div></div>';
		show_tooltip();
		update_tooltip(event);
	} catch (err) {
		alert('Error: ' + err.message);
	}
}
function htip() {
	if (is_tooltip_locked == 0) {
		hide_tooltip();
	}
}
function adso_mousedown(divdef) {
	firstdefinition = divdef;
	return;
}
function adso_mouseup(divdef) {
	lastdefinition = divdef;
	if (parseInt(firstdefinition) > parseInt(lastdefinition)) {
		var a = firstdefinition;
		var b = lastdefinition;
		firstdefinition = b;
		lastdefinition = a;
	}
	return;
}

function onWordClick() {
	// Freeze Tooltip
	if (is_tooltip_locked == 1) {
		return;
	}
	is_tooltip_locked = 1;
	tooltip.innerHTML =
		'<img src="/popup/img/icons/close.gif" onmouseup="try {save_tooltip();}catch (err) {is_tooltip_locked=0;hide_tooltip();}" style="float:right;margin-bottom:0px;margin: 0px 0px 0px"/>' +
		tooltip.innerHTML;
}

// Needed so that Mouseover Can Update Sentence Source
function update_sentence_source_id(new_id) {
	sentence_source_id = new_id;
	return;
}

function adso_clicked(evt) {
	try {
		// Netscape/Mozilla are Better
		if (ff) {
			highlighted_selection = window.getSelection();
		}
		if (ie) {
			highlighted_selection = document.selection.createRange().text;
		}
	} catch (err) {
		//alert("Error Here: "+err.message);
	}

	if (highlighted_selection != '') {
		var html_insert =
			'<center><div style="width=:15px;height:15px;float:right;">';
		html_insert +=
			'<img src="/popup/img/icons/close.gif" onmouseup="is_tooltip_locked = 0; hide_tooltip();" style="margin-bottom:0px;margin: 0px 0px 0px"/>';
		html_insert += '</div>';
		html_insert +=
			'<form name="contribute" onsubmit="adso_resegment_submission(); hide_tooltip(); return false;">';
		html_insert +=
			'<div class="adso_add_source">' + highlighted_selection + '</div>';
		html_insert +=
			'<input type="hidden" name="source" value="' +
			highlighted_selection +
			'"/>';
		html_insert +=
			'<input type="hidden" name="firstdef" value="' +
			firstdefinition +
			'"/>';
		html_insert +=
			'<input type="hidden" name="lastdef" value="' +
			lastdefinition +
			'"/>';
		html_insert +=
			'<input type="text" id="add_translation" class="adso_add_translation" name="translation" />';
		html_insert +=
			'<br /><input type="submit" value="edit" onsubmit="adso_resegment_submission(); is_tooltip_locked = 0; hide_tooltip(); return false;" /> ';
		html_insert += '</form></center>';
		tooltip.innerHTML = html_insert;
		show_tooltip();
		update_tooltip(evt);
		try {
			document.getElementById('add_translation').focus();
		} catch (err) {}
		is_resegmenting = 1;
		is_tooltip_locked = 1;
	}

	return;
}

function adso_resegment_submission() {
	var source = document.contribute.source.value;
	var translation = document.contribute.translation.value;
	var divdef1 = document.contribute.firstdef.value;
	var divdef2 = document.contribute.lastdef.value;

	adso_resegment_ajax(source, translation, divdef1, divdef2);

	if (update_server_with_edits == 1) {
		$.post(
			'/updates/editAnnotator',
			{
				field1: translation,
				field3: source
			},
			function (txt) {
				//alert(txt);
			}
		);
	}

	adso_callback();
	return false;
}

function adso_resegment_ajax(source, translation, divdef1, divdef2) {
	object_under_updating = object_under_editing;

	// Internet Explorer Truly Sucks - Needed to Prevent it Truncating Stuff
	if (ie) {
		source += '_IESUCKS';
	}

	// Either our opening (divdef1) or closing (divdef2) marker could be
	// off. It is possible for the mouse to stray to the next popup without
	// crossing enough of the first character to make the highlight cross
	// over as well. We know that our two divdefs will border the region
	// in question, but need to be sure we are only going to manipulate
	// the minimal span tags needed.
	//
	var alltext = '';
	var stoploop = -1;

	// if we stopped early, take our stop point as the final div
	for (i = parseInt(divdef1); stoploop == -1 && i <= parseInt(divdef2); i++) {
		// if span tag exists, grab its content
		try {
			alltext += document.getElementById('adso_' + i).innerHTML;
		} catch (err) {}

		if (alltext.search(source) != -1) {
			stoploop = i;
		}
	}
	if (stoploop <= parseInt(divdef2) && stoploop != -1) {
		divdef2 = stoploop;
	}

	// Now do the same thing to adjust the starting position
	alltext = '';
	stoploop = -1;
	for (z = parseInt(divdef2); stoploop < 0 && z >= parseInt(divdef1); z--) {
		// if span tag exists, grab its content
		try {
			if (document.getElementById('adso_' + z).innerHTML != 'undefined') {
				alltext =
					document.getElementById('adso_' + z).innerHTML + alltext;
			}
		} catch (err) {}

		if (alltext.search(source) != -1) {
			stoploop = z;
		}
	}
	// if we stopped early, take our stop point as the first div
	if (stoploop != parseInt(divdef1) && stoploop != -1) {
		divdef1 = stoploop;
	}

	var temp = adso_resegment_engine(
		source,
		translation,
		object_under_editing.innerHTML,
		divdef1,
		divdef2
	);

	// Attempting to Resegment Non-Markup Text Returns Nothing
	if (temp == '') {
		is_tooltip_locked = 0;
		return false;
	}

	object_under_updating.innerHTML = temp;

	// Update Missing Fields Through Ajax
	if (pre_field_lookup_id != '') {
		// Update Missing Entries in Pre Field with Ajax
		$.post(
			'/updates/annotator',
			{
				text: pre_field_lookup
			},
			function (txt) {
				new_field1 = '';
				new_field2 = '';
				new_field3 = '';
				new_field4 = '';
				new_field5 = '';

				ofield1 = '';
				ofield2 = '';
				ofield3 = '';
				ofield4 = '';
				ofield5 = '';
				ofield6 = '';
				opre = '';

				array_of_entries = txt.split('</span>');

				for (var i = 0; i < array_of_entries.length; i++) {
					ofield1 = extract_field1(array_of_entries[i]);
					ofield2 = extract_field2(array_of_entries[i]);
					ofield3 = extract_field3(array_of_entries[i]);
					ofield4 = extract_field4(array_of_entries[i]);
					ofield5 = extract_field5(array_of_entries[i]);
					ofield6 = extract_field6(array_of_entries[i]);
					opre = extract_pre(array_of_entries[i]);

					new_field1 += opre + ofield1;
					new_field2 += opre + ofield2;
					new_field3 += opre + ofield3;
					new_field4 += opre + ofield4;
					new_field5 += ofield5;
				}

				// DOM manipulation is inconsistent across Firefox, so fall back on innerHTML manipulation
				original_string = "'','','" + new_field3 + "','',''";
				replace_string =
					"'" +
					new_field1 +
					"','" +
					new_field2 +
					"','" +
					new_field3 +
					"','" +
					new_field4 +
					"','" +
					new_field5 +
					"'";
				re = new RegExp(original_string, 'g');
				temp = temp.replace(re, replace_string);
				object_under_updating.innerHTML = temp;
			}
		);

		pre_field_done = 1;
	}

	// Update Missing Fields Through Ajax
	if (match_field_lookup_id != '') {
		// Update Missing Entries in Pre Field with Ajax
		$.post(
			'/updates/annotator',
			{
				text: match_field_lookup
			},
			function (txt2) {
				mnew_field1 = '';
				mnew_field2 = '';
				mnew_field3 = '';
				mnew_field4 = '';
				mnew_field5 = '';

				mofield1 = '';
				mofield2 = '';
				mofield3 = '';
				mofield4 = '';
				mofield5 = '';
				mofield6 = '';
				mopre = '';

				marray_of_entries = txt2.split('</span>');

				for (var i = 0; i < marray_of_entries.length; i++) {
					mofield1 = extract_field1(marray_of_entries[i]);
					mofield2 = extract_field2(marray_of_entries[i]);
					mofield3 = extract_field3(marray_of_entries[i]);
					mofield4 = extract_field4(marray_of_entries[i]);
					mofield5 = extract_field5(marray_of_entries[i]);
					mofield6 = extract_field6(marray_of_entries[i]);
					mopre = extract_pre(marray_of_entries[i]);

					mnew_field1 += mopre + mofield1;
					mnew_field2 += mopre + mofield2;
					mnew_field3 += mopre + mofield3;
					mnew_field4 += mopre + mofield4;
					mnew_field5 += mofield5;
				}

				// Update Opened Popup if Necessary
				try {
					// popup may not be open/exist
					if (
						mnew_field6 ==
						document.getElementById('row_6').innerHTML
					) {
						row_1 = mnew_field3;
						document.getElementById('row_1').innerHTML =
							mnew_field3;
						row_2 = mnew_field4;
						document.getElementById('row_2').innerHTML =
							mnew_field4;
						row_3 = mnew_field2;
						document.getElementById('row_3').innerHTML =
							mnew_field2;
					}
				} catch (err) {}

				// DOM manipulation is inconsistent across Firefox, so fall back on innerHTML manipulation
				original_string = "'','" + mnew_field3 + "','',''";
				replace_string =
					"'" +
					mnew_field2 +
					"','" +
					mnew_field3 +
					"','" +
					mnew_field4 +
					"','" +
					mnew_field5 +
					"'";
				re = new RegExp(original_string, 'g');
				temp = temp.replace(re, replace_string);
				object_under_updating.innerHTML = temp;
			}
		);
	}

	// Update Missing Fields Through Ajax
	if (post_field_lookup_id != '') {
		// Update Missing Entries in Pre Field with Ajax
		$.post(
			'/updates/annotator',
			{
				text: post_field_lookup
			},
			function (btxt) {
				bnew_field1 = '';
				bnew_field2 = '';
				bnew_field3 = '';
				bnew_field4 = '';
				bnew_field5 = '';

				bofield1 = '';
				bofield2 = '';
				bofield3 = '';
				bofield4 = '';
				bofield5 = '';
				bofield6 = '';
				bopre = '';

				barray_of_entries = btxt.split('</span>');

				for (var i = 0; i < barray_of_entries.length; i++) {
					bofield1 = extract_field1(barray_of_entries[i]);
					bofield2 = extract_field2(barray_of_entries[i]);
					bofield3 = extract_field3(barray_of_entries[i]);
					bofield4 = extract_field4(barray_of_entries[i]);
					bofield5 = extract_field5(barray_of_entries[i]);
					bofield6 = extract_field6(barray_of_entries[i]);
					bopre = extract_pre(barray_of_entries[i]);

					bnew_field1 += bopre + bofield1;
					bnew_field2 += bopre + bofield2;
					bnew_field3 += bopre + bofield3;
					bnew_field4 += bopre + bofield4;
					bnew_field5 += bofield5;
				}

				// DOM manipulation is inconsistent across Firefox, so fall back on innerHTML manipulation
				original_string = "'','','" + bnew_field3 + "','',''";
				replace_string =
					"'" +
					bnew_field1 +
					"','" +
					bnew_field2 +
					"','" +
					bnew_field3 +
					"','" +
					bnew_field4 +
					"','" +
					bnew_field5 +
					"'";
				re = new RegExp(original_string, 'g');
				temp = temp.replace(re, replace_string);
				object_under_updating.innerHTML = temp;
			}
		);
	}

	is_tooltip_locked = 0;

	return false;
}

function annotate_page(z) {
	if (z >= translation.length) {
		alert('Error: that page does not exist.');
	} else {
		paragraph = z;
		annotate(translation[paragraph]);
	}
}

// Javascript Manipulation Libraries for Adsotrans Markup
function extract_pre(text) {
	bodyarray = text.split('<span ');
	return bodyarray[0];
}
function extract_field(text, field) {
	text = text.replace(/event, /g, 'event,');
	if (text.indexOf("event,'") != -1) {
		bodyarray = text.split("event,'");
		bodyarray2 = bodyarray[1].split("')");
		temp = bodyarray2[0].split("','");
		// might be closing parens
		if (temp == ")',") {
			return ')';
		}
		return temp[field - 1];
	}
	return '';
}
function extract_field1(text) {
	return rp(extract_field(text, 1));
}
function extract_field2(text) {
	return rp(extract_field(text, 2));
}
function extract_field3(text) {
	return rp(extract_field(text, 3));
}
function extract_field4(text) {
	return rp(extract_field(text, 4));
}
function extract_field5(text) {
	return rp(extract_field(text, 5));
}
function extract_field6(text) {
	return rp(extract_field(text, 6));
}

function adso_redefine_word(source, pinyin, translation, text, divdef) {
	var alternate_segmentation = '';
	var alternate_segmentation2 = '';
	array_of_entries = text.split('</span>');

	for (var i = 0; i < array_of_entries.length; i++) {
		var field1 = extract_field1(array_of_entries[i]);
		var field2 = extract_field2(array_of_entries[i]);
		var field3 = extract_field3(array_of_entries[i]);
		var field4 = extract_field4(array_of_entries[i]);
		var field5 = extract_field5(array_of_entries[i]);
		var field6 = extract_field6(array_of_entries[i]);
		var pre = extract_pre(array_of_entries[i]);

		var this_inset = field3;
		this_inset = this_inset.replace(/\'/g, '&apos;');
		this_inset = this_inset.replace(/\\&apos;/g, '&apos;');

		alternate_segmentation = pre;
		if (field3 == source) {
			if (field6 == divdef) {
				alternate_segmentation +=
					'<span id="adso_' +
					divdef +
					'" onmousedown="adso_mousedown(\'' +
					divdef +
					'\');" onmouseup="adso_mouseup(\'' +
					divdef +
					'\');" onclick="onWordClick()" onmouseover="tip(event,\'' +
					p(pinyin) +
					"','" +
					p(translation) +
					"','" +
					p(field3) +
					"','" +
					p(field4) +
					"','" +
					p(field5) +
					"','" +
					divdef +
					'\')" onmouseout="htip()">' +
					this_inset +
					'</span>';
			} else {
				alternate_segmentation +=
					'<span id="adso_' +
					field6 +
					'" onmousedown="adso_mousedown(\'' +
					divdef +
					'\');" onmouseup="adso_mouseup(\'' +
					divdef +
					'\');" onclick="onWordClick()" onmouseover="tip(event,\'' +
					p(field1) +
					"','" +
					p(field2) +
					"','" +
					p(field3) +
					"','" +
					p(field4) +
					"','" +
					p(field5) +
					"','" +
					field6 +
					'\')" onmouseout="htip()">' +
					this_inset +
					'</span>';
			}
		} else {
			alternate_segmentation +=
				'<span id="adso_' +
				field6 +
				'" onmousedown="adso_mousedown(\'' +
				divdef +
				'\');" onmouseup="adso_mouseup(\'' +
				divdef +
				'\');" onclick="onWordClick()" onmouseover="tip(event,\'' +
				p(field1) +
				"','" +
				p(field2) +
				"','" +
				p(field3) +
				"','" +
				p(field4) +
				"','" +
				p(field5) +
				"','" +
				field6 +
				'\')" onmouseout="htip()">' +
				this_inset +
				'</span>';
		}
		alternate_segmentation2 += alternate_segmentation;
	}
	return alternate_segmentation2;
}
function adso_resegment_engine(
	source,
	translation,
	text,
	divdef_first,
	divdef_last
) {
	try {
		var alternate_segmentation = '';
		var alternate_segmentation2 = '';

		array_of_entries = text.split('</span>');

		pre_field_lookup = '';
		match_field_lookup = '';
		post_field_lookup = '';
		pre_field_lookup_id = '';
		match_field_lookup_id = '';
		post_field_lookup_id = '';

		for (
			var i = 0, continue_loop = 1;
			i < array_of_entries.length && array_of_entries[i] != '';
			i++
		) {
			var field1 = extract_field1(array_of_entries[i]);
			var field2 = extract_field2(array_of_entries[i]);
			var field3 = extract_field3(array_of_entries[i]);
			var field4 = extract_field4(array_of_entries[i]);
			var field5 = extract_field5(array_of_entries[i]);
			var field6 = extract_field6(array_of_entries[i]);
			var pre = extract_pre(array_of_entries[i]);
			var temp = '';
			var temp2 = '';

			// Legacy Adso Markup - Text Not Marked Up Word-by-Word
			if (
				field1 == '' &&
				field2 == '' &&
				field3 == '' &&
				field4 == '' &&
				field5 == '' &&
				field6 == ''
			) {
				// strip out our tags
				field3 = array_of_entries[i].replace(/(<([^>]+)>)/gi, '');
				field1 = '';
				field2 = '';
				field4 = '';
				field5 = '';
				field6 = divdef_first;
				continue_loop = 0;
			}

			var pre_field1 = '';
			var pre_field2 = '';
			var pre_field3 = '';
			var pre_field4 = '';
			var pre_field5 = '';
			var pre_field6 = '';

			var match_field1 = '';
			var match_field2 = '';
			var match_field3 = '';
			var match_field4 = '';
			var match_field5 = '';
			var match_field6 = '';

			var post_field1 = '';
			var post_field2 = '';
			var post_field3 = '';
			var post_field4 = '';
			var post_field5 = '';
			var post_field6 = '';

			var match = 0;
			var first_char = source[0];

			if (field3.indexOf(first_char) >= 0) {
				var j = i;
				temp = field3;

				var potential_pre_field3 = '';
				var continue_next = 1;

				if (field3.indexOf(first_char) >= 0) {
					temp2 = field3.substr(field3.indexOf(first_char));
					potential_pre_field3 = field3.substr(
						0,
						field3.indexOf(first_char)
					);
					potential_post_field3 = temp2.substr(source.length);

					if (
						field3.length >
						potential_pre_field3.length + source.length
					) {
						continue_next = 0;
						if (field3.indexOf(source) >= 0) {
							/* Avoid Matching the First Character Only - Confirm our Full Match */
							potential_match_position =
								field3.indexOf(first_char);
							for (
								zk = 0, match_success = 0;
								zk < field3.length && match_success == 0;
								zk++
							) {
								potential_match = field3.substr(
									potential_match_position,
									source.length
								);
								if (potential_match != source) {
									potential_match_position = field3.indexOf(
										first_char,
										potential_match_position + 1
									);
								} else {
									match_success = 1;
									potential_pre_field3 = field3.substr(
										0,
										potential_match_position
									);
									potential_post_field3 = field3.substr(
										potential_match_position + source.length
									);
								}
							}

							match = 1;
							pre_field1 = '';
							pre_field2 = '';
							pre_field3 = potential_pre_field3;
							pre_field4 = '';
							match_field1 = translation;
							match_field2 = '';
							match_field3 = source;
							match_field4 = '';
							post_field1 = '';
							post_field2 = '';
							post_field3 = potential_post_field3;
							post_field4 = '';
						}
					} else {
						// match only the substring in field3
						x = field3.indexOf(first_char);
						lengthx = field3.length - x;
						tempy = source.substr(0, lengthx);
						field3x = field3;

						if (field3.indexOf(tempy) >= 0) {
							temp = temp2;
							continue_next = 1;
							pre_field1 = '';
							pre_field2 = '';
							pre_field3 = potential_pre_field3;
							pre_field4 = '';
						} else {
							continue_next = 0;
						}
					}
				}

				if (continue_next == 1) {
					while (
						source.length > temp.length &&
						j < array_of_entries.length
					) {
						j++;
						temp +=
							extract_pre(array_of_entries[j]) +
							extract_field3(array_of_entries[j]);
					}

					temp = temp.replace(/\\\'/g, "'");
					var matched = temp.substr(0, source.length);

					if (matched == source) {
						if (matched.length == temp.length) {
							match_field1 = translation;
							match_field2 = '';
							match_field3 = source;
							match_field4 = '';
							match_field5 = '';
						} else {
							match_field1 = translation;
							match_field2 = '';
							match_field3 = source;
							match_field4 = '';
							match_field5 = '';
							post_field1 = '';
							post_field2 = '';
							temp67 = 0;
							for (zzp = 0; zzp < source.length; zzp++) {
								if (source[zzp] == "'") {
									temp67++;
								}
							}
							post_field3 = temp.substr(source.length);
							post_field4 = '';
							post_field5 = '';
						}

						match = 1;
						i = j;
					}
				} // continue next
			} // char found

			length_of_pre = pre_field3.length;
			length_of_match = match_field3.length;
			length_of_post = post_field3.length;

			var myinset = '';
			myinset = field3;
			myinset = myinset.replace(/\'/g, '&apos;');
			myinset = myinset.replace(/\\&apos;/g, '&apos;');

			if (match == 1) {
				var post_position = divdef_last;
				var match_position = divdef_last - length_of_post;
				var pre_position =
					divdef_last - length_of_post - length_of_match;

				var pre_field3_inset = pre_field3;
				pre_field3_inset = pre_field3_inset.replace(/\'/g, '&apos;');
				pre_field3_inset = pre_field3_inset.replace(
					/\\&apos;/g,
					'&apos;'
				);
				var match_field3_inset = match_field3;
				match_field3_inset = match_field3_inset.replace(
					/\'/g,
					'&apos;'
				);
				match_field3_inset = match_field3_inset.replace(
					/\\&apos;/g,
					'&apos;'
				);
				var post_field3_inset = post_field3;

				post_field3_inset = post_field3_inset.replace(/\'/, '&apos;');
				post_field3_inset = post_field3_inset.replace(
					/\\&apos;/,
					'&apos;'
				);
				pre_field1 = pre_field1.replace(/\'/g, "\\'");
				pre_field2 = pre_field2.replace(/\'/g, "\\'");
				pre_field3 = pre_field3.replace(/\'/g, "\\'");
				pre_field4 = pre_field4.replace(/\'/g, "\\'");
				match_field1 = match_field1.replace(/\'/g, "\\'");
				match_field2 = match_field2.replace(/\'/g, "\\'");
				match_field3 = match_field3.replace(/\'/g, "\\'");
				match_field4 = match_field4.replace(/\'/g, "\\'");
				post_field1 = post_field1.replace(/\'/g, "\\'");
				post_field2 = post_field2.replace(/\'/g, "\\'");
				post_field3 = post_field3.replace(/\'/g, "\\'");
				post_field4 = post_field4.replace(/\'/g, "\\'");

				// Apostrophe Support Paranoia (bug-fix)
				pre_field1 = pre_field1.replace(/\\\'/g, "'");
				pre_field2 = pre_field2.replace(/\\\'/g, "'");
				pre_field3 = pre_field3.replace(/\\\'/g, "'");
				pre_field4 = pre_field4.replace(/\\\'/g, "'");

				// Match Field Not Required Check For
				post_field1 = post_field1.replace(/\\\'/g, "'");
				post_field2 = post_field2.replace(/\\\'/g, "'");
				post_field3 = post_field3.replace(/\\\'/g, "'");
				post_field4 = post_field4.replace(/\\\'/g, "'");

				// Calculate Locate Positioning
				location_adjustment = 0;
				if (match_position != field6) {
					location_adjustment = field6 - match_position;
				}

				alternate_segmentation = pre;
				if (pre_field3 != '') {
					alternate_segmentation +=
						'<span id="adso_' +
						(location_adjustment + pre_position) +
						'" onmousedown="adso_mousedown(\'' +
						(pre_position + location_adjustment) +
						'\');" onmouseup="adso_mouseup(\'' +
						(location_adjustment + pre_position) +
						'\');" onclick="onWordClick()" onmouseover="tip(event,\'' +
						p(pre_field1) +
						"','" +
						p(pre_field2) +
						"','" +
						p(pre_field3) +
						"','" +
						p(pre_field4) +
						"','" +
						p(pre_field5) +
						"','" +
						(pre_position + location_adjustment) +
						'\')" onmouseout="htip()">' +
						pre_field3_inset +
						'</span>';
					pre_field_lookup = pre_field3;
					pre_field_lookup_id = pre_position + location_adjustment;
				}
				if (match_field3 != '') {
					alternate_segmentation +=
						'<span id="adso_' +
						(location_adjustment + match_position) +
						'" onmousedown="adso_mousedown(\'' +
						(location_adjustment + match_position) +
						'\');" onmouseup="adso_mouseup(\'' +
						(location_adjustment + match_position) +
						'\');" onclick="onWordClick()" onmouseover="tip(event,\'' +
						p(match_field1) +
						"','" +
						p(match_field2) +
						"','" +
						p(match_field3) +
						"','" +
						p(match_field4) +
						"','" +
						p(match_field5) +
						"','" +
						(location_adjustment + match_position) +
						'\')" onmouseout="htip()">' +
						match_field3_inset +
						'</span>';
					match_field_lookup = match_field3;
					match_field_lookup_id =
						match_position + location_adjustment;
				}
				if (post_field3 != '') {
					alternate_segmentation +=
						'<span id="adso_' +
						(location_adjustment + post_position) +
						'" onmousedown="adso_mousedown(\'' +
						(location_adjustment + post_position) +
						'\');" onmouseup="adso_mouseup(\'' +
						(location_adjustment + post_position) +
						'\');" onclick="onWordClick()" onmouseover="tip(event,\'' +
						p(post_field1) +
						"','" +
						p(post_field2) +
						"','" +
						p(post_field3) +
						"','" +
						p(post_field4) +
						"','" +
						p(post_field5) +
						"','" +
						(location_adjustment + post_position) +
						'\')" onmouseout="htip()">' +
						post_field3_inset +
						'</span>';
					post_field_lookup = post_field3;
					post_field_lookup_id = post_position + location_adjustment;
				}
				alternate_segmentation2 += alternate_segmentation;
			} else {
				alternate_segmentation = pre;
				if (field3 != '') {
					// if array_of_entries[i] has no span tags, don't insert any, just copy in original
					if (array_of_entries[i].indexOf('span ') > 0) {
						alternate_segmentation +=
							'<span id="adso_' +
							field6 +
							'" onmousedown="adso_mousedown(\'' +
							field6 +
							'\');" onmouseup="adso_mouseup(\'' +
							field6 +
							'\');" onclick="onWordClick()" onmouseover="tip(event,\'' +
							p(field1) +
							"','" +
							p(field2) +
							"','" +
							p(field3) +
							"','" +
							p(field4) +
							"','" +
							p(field5) +
							"','" +
							p(field6) +
							'\')" onmouseout="htip()">' +
							myinset +
							'</span>';
					} else {
						// no need to add anything, data already in pre/post-segmentation and will be added automatically
						alternate_segmentation += ''; //
					}
				}
				alternate_segmentation2 += alternate_segmentation;
			}
		}

		return alternate_segmentation2;
	} catch (err) {}

	return text;
}
function q(t) {
	t = t.replace(/&apos;/g, '_APOS_');
	t = t.replace(/&APOS;/g, '_APOS_');
	return t;
}
function p(t) {
	return t.replace(/\'/g, '_APOS_');
}
function rp(t) {
	try {
		return t.replace(/_APOS_/g, '&apos;');
	} catch (err) {
		return '';
	}
}

function convert_pinyin(pv) {
	pv = pv.replace(/5/g, '');
	pv = pv.replace(/0/g, '');

	pv = pv.replace(/1a/g, '1&apos;a');
	pv = pv.replace(/2a/g, '2&apos;a');
	pv = pv.replace(/3a/g, '3&apos;a');
	pv = pv.replace(/4a/g, '4&apos;a');
	pv = pv.replace(/5a/g, '5&apos;a');
	pv = pv.replace(/1e/g, '1&apos;e');
	pv = pv.replace(/2e/g, '2&apos;e');
	pv = pv.replace(/3e/g, '3&apos;e');
	pv = pv.replace(/4e/g, '4%apos;e');
	pv = pv.replace(/5e/g, '5&apos;e');
	pv = pv.replace(/1o/g, '1&apos;o');
	pv = pv.replace(/2o/g, '2&apos;o');
	pv = pv.replace(/3o/g, '3&apos;o');
	pv = pv.replace(/4o/g, '4&apos;o');
	pv = pv.replace(/5o/g, '5&apos;o');

	pv = pv.replace(/or1/g, 'o1r');
	pv = pv.replace(/or2/g, 'o2r');
	pv = pv.replace(/or3/g, 'o3r');
	pv = pv.replace(/or4/g, 'o4r');

	pv = pv.replace(/nr1/g, 'n1r');
	pv = pv.replace(/nr2/g, 'n2r');
	pv = pv.replace(/nr3/g, 'n3r');
	pv = pv.replace(/nr4/g, 'n4r');

	pv = pv.replace(/v1/g, 'ǖ');
	pv = pv.replace(/v2/g, 'ǘ');
	pv = pv.replace(/v3/g, 'ǚ');
	pv = pv.replace(/v4/g, 'ǜ');
	pv = pv.replace(/v5/g, 'ü');
	pv = pv.replace(/ve1/g, 'ǖe');
	pv = pv.replace(/ve2/g, 'ǘe');
	pv = pv.replace(/ve3/g, 'ǚe');
	pv = pv.replace(/ve4/g, 'ǜe');
	pv = pv.replace(/ve5/g, 'üe');
	pv = pv.replace(/vn1/g, 'ǖn');
	pv = pv.replace(/vn2/g, 'ǘn');
	pv = pv.replace(/vn3/g, 'ǚn');
	pv = pv.replace(/vn4/g, 'ǜn');
	pv = pv.replace(/vn5/g, 'ün');

	pv = pv.replace(/a1/g, 'ā');
	pv = pv.replace(/a2/g, 'á');
	pv = pv.replace(/a3/g, 'ǎ');
	pv = pv.replace(/a4/g, 'à');
	pv = pv.replace(/a5/g, 'a');
	pv = pv.replace(/ai1/g, 'āi');
	pv = pv.replace(/ai2/g, 'ái');
	pv = pv.replace(/ai3/g, 'ǎi');
	pv = pv.replace(/ai4/g, 'ài');
	pv = pv.replace(/ai5/g, 'ai');
	pv = pv.replace(/an1/g, 'ān');
	pv = pv.replace(/an2/g, 'án');
	pv = pv.replace(/an3/g, 'ǎn');
	pv = pv.replace(/an4/g, 'àn');
	pv = pv.replace(/an5/g, 'an');
	pv = pv.replace(/ao1/g, 'āo');
	pv = pv.replace(/ao2/g, 'áo');
	pv = pv.replace(/ao3/g, 'ǎo');
	pv = pv.replace(/ao4/g, 'ào');
	pv = pv.replace(/ao5/g, 'ao');
	pv = pv.replace(/ang1/g, 'āng');
	pv = pv.replace(/ang2/g, 'áng');
	pv = pv.replace(/ang3/g, 'ǎng');
	pv = pv.replace(/ang4/g, 'àng');
	pv = pv.replace(/ang5/g, 'ang');
	pv = pv.replace(/e1/g, 'ē');
	pv = pv.replace(/e2/g, 'é');
	pv = pv.replace(/e3/g, 'ě');
	pv = pv.replace(/e4/g, 'è');
	pv = pv.replace(/e5/g, 'e');

	pv = pv.replace(/en1/g, 'ēn');
	pv = pv.replace(/en2/g, 'én');
	pv = pv.replace(/en3/g, 'ěn');
	pv = pv.replace(/en4/g, 'èn');
	pv = pv.replace(/en5/g, 'en');
	pv = pv.replace(/er1/g, 'ēr');
	pv = pv.replace(/er2/g, 'ér');
	pv = pv.replace(/er3/g, 'ěr');
	pv = pv.replace(/er4/g, 'èr');
	pv = pv.replace(/er5/g, 'er');
	pv = pv.replace(/eng1/g, 'ēng');
	pv = pv.replace(/eng2/g, 'éng');
	pv = pv.replace(/eng3/g, 'ěng');
	pv = pv.replace(/eng4/g, 'èng');
	pv = pv.replace(/eng5/g, 'eng');
	pv = pv.replace(/ei1/g, 'ēi');
	pv = pv.replace(/ei2/g, 'éi');
	pv = pv.replace(/ei3/g, 'ěi');
	pv = pv.replace(/ei4/g, 'èi');
	pv = pv.replace(/ei5/g, 'ei');

	pv = pv.replace(/i1/g, 'ī');
	pv = pv.replace(/i2/g, 'í');
	pv = pv.replace(/i3/g, 'ǐ');
	pv = pv.replace(/i4/g, 'ì');
	pv = pv.replace(/i5/g, 'i');
	pv = pv.replace(/in1/g, 'īn');
	pv = pv.replace(/in2/g, 'ín');
	pv = pv.replace(/in3/g, 'ǐn');
	pv = pv.replace(/in4/g, 'ìn');
	pv = pv.replace(/in5/g, 'in');
	pv = pv.replace(/ing1/g, 'īng');
	pv = pv.replace(/ing2/g, 'íng');
	pv = pv.replace(/ing3/g, 'ǐng');
	pv = pv.replace(/ing4/g, 'ìng');
	pv = pv.replace(/ing5/g, 'ing');

	pv = pv.replace(/o1/g, 'ō');
	pv = pv.replace(/o2/g, 'ó');
	pv = pv.replace(/o3/g, 'ǒ');
	pv = pv.replace(/o4/g, 'ò');
	pv = pv.replace(/o5/g, 'o');
	pv = pv.replace(/ou1/g, 'ōu');
	pv = pv.replace(/ou2/g, 'óu');
	pv = pv.replace(/ou3/g, 'ǒu');
	pv = pv.replace(/ou4/g, 'òu');
	pv = pv.replace(/ou5/g, 'ou');
	pv = pv.replace(/ong1/g, 'ōng');
	pv = pv.replace(/ong2/g, 'óng');
	pv = pv.replace(/ong3/g, 'ǒng');
	pv = pv.replace(/ong4/g, 'òng');
	pv = pv.replace(/ong5/g, 'ong');

	pv = pv.replace(/u1/g, 'ū');
	pv = pv.replace(/u2/g, 'ú');
	pv = pv.replace(/u3/g, 'ǔ');
	pv = pv.replace(/u4/g, 'ù');
	pv = pv.replace(/u5/g, 'u');
	pv = pv.replace(/ue1/g, 'ūe');
	pv = pv.replace(/ue2/g, 'úe');
	pv = pv.replace(/ue3/g, 'ǔe');
	pv = pv.replace(/ue4/g, 'ùe');
	pv = pv.replace(/ue5/g, 'ue');
	pv = pv.replace(/ui1/g, 'ūi');
	pv = pv.replace(/ui2/g, 'úi');
	pv = pv.replace(/ui3/g, 'ǔi');
	pv = pv.replace(/ui4/g, 'ùi');
	pv = pv.replace(/ui5/g, 'uie');
	pv = pv.replace(/un1/g, 'ūn');
	pv = pv.replace(/un2/g, 'ún');
	pv = pv.replace(/un3/g, 'ǔn');
	pv = pv.replace(/un4/g, 'ùn');
	pv = pv.replace(/un5/g, 'un');

	return pv;
}

function update_row_edit(myrow) {
	var newvalue = document.edit_form.row_edit.value;
	var thisrow = document.getElementById(myrow);
	thisrow.innerHTML = newvalue.replace(/\'/, '&apos;');
	row_under_editing = 0;
	return false;
}
function edit_row_num(num) {
	if (row_under_editing != 0) {
		update_row_edit('row_' + row_under_editing);
	}
	var numrow = 'row_' + num;
	row_under_editing = num;
	var thisrow = document.getElementById(numrow);
	var newtextvalue = thisrow.innerHTML;
	var thisrowform =
		'<form name="edit_form" action="" method="POST" onsubmit="update_row_edit(\'' +
		numrow +
		'\');return false;"><input type="text" name="row_edit" class="' +
		numrow +
		'" value="' +
		newtextvalue +
		'" /></form>';
	if (thisrow.innerHTML.indexOf('update_row_edit') > 0) {
	} else {
		thisrow.innerHTML = thisrowform;
		document.edit_form.row_edit.select();
	}
	return true;
}
function remember_sentence(thisobj, sentence_id) {
	if (object_under_editing_permitted_to_update == 1) {
		object_under_editing = thisobj;
		object_under_editing_id = sentence_id;
	}
}

// Comment Editing and Deletion Can Be Stuffed in Here Too
var editing_comment = 0;
function edit_comment(comment_id) {
	if (editing_comment == 1) {
		return;
	}
	editing_comment = 1;
	existing_obj = $('#comment_text_' + comment_id);
	existing_value = document.getElementById(
		'comment_text_' + comment_id
	).innerHTML;
	var ourReplacementHTML =
		'<div id="comment_text_' +
		comment_id +
		'" class="comment_text"><textarea id="adso_new_editing_textarea" rows="10" cols="60">' +
		convertforediting(existing_value) +
		'</textarea><div><input type="button" value="SAVE" class="saveButton" /><input type="hidden" value="CANCEL" class="cancelButton" /></div></div>';
	$('#comment_text_' + comment_id)
		.after(ourReplacementHTML)
		.remove();
	$('.saveButton').click(function () {
		var txx = $(this).parent().siblings(0).val();
		editing_comment = 0;
		document.getElementById('comment_text_' + comment_id).innerHTML =
			convertfromediting(txx);
		$.post(
			'/updates/editComment',
			{
				comment_id: comment_id,
				value: txx
			},
			function (txt) {}
		);
	});
}
function delete_comment(comment_id) {
	var answer = confirm('Delete this Comment?');
	if (answer) {
		$('#comment_' + comment_id).hide();
		$.post(
			'/updates/deleteComment',
			{
				comment_id: comment_id
			},
			function (txt) {}
		);
	}
}
function convertforediting(tx) {
	tx = tx.replace(/<p><\/p>/g, '\n\n');
	return tx;
}

function convertfromediting(tx) {
	tx = tx.replace(/\n\n/g, '<p></p>');
	return tx;
}

function enable_display_mode(toggle_which_field) {
	view_field1 = 0;
	view_field2 = 0;
	view_field3 = 0;
	view_field4 = 0;
	view_field5 = 0;

	if (document.getElementById('checkbox_field1').checked == true) {
		view_field1 = 1;
	}
	if (document.getElementById('checkbox_field2').checked == true) {
		view_field2 = 1;
	}
	if (document.getElementById('checkbox_field3').checked == true) {
		view_field3 = 1;
	}
	if (document.getElementById('checkbox_field4').checked == true) {
		view_field4 = 1;
	}
	if (document.getElementById('checkbox_field5').checked == true) {
		view_field5 = 1;
	}

	if (view_field1 == 1) {
		$('.lesson_word_field1').css('display', 'table-cell');
	} else {
		$('.lesson_word_field1').css('display', 'none');
	}
	if (view_field2 == 1) {
		$('.lesson_word_field2').css('display', 'table-cell');
	} else {
		$('.lesson_word_field2').css('display', 'none');
	}
	if (view_field3 == 1) {
		$('.lesson_word_field3').css('display', 'table-cell');
	} else {
		$('.lesson_word_field3').css('display', 'none');
	}
	if (view_field4 == 1) {
		$('.lesson_word_field4').css('display', 'table-cell');
	} else {
		$('.lesson_word_field4').css('display', 'none');
	}
	if (view_field5 == 1) {
		$('.lesson_word_field5').css('display', 'table-cell');
	} else {
		$('.lesson_word_field5').css('display', 'none');
	}

	// ping server to save user Preferences
	$.post(
		'/account/updateVocabPreferences',
		{
			view_field1: view_field1,
			view_field2: view_field2,
			view_field3: view_field3,
			view_field4: view_field4,
			view_field5: view_field5
		},
		function (txt) {
			//setTimeout(() => {
			// window.location.reload();
			// }, 300);;
		}
	);

	//document.getElementById("lesson_vocabulary").innerHTML = '<img src="/popup/img/loader-big-circle.gif" alt="re-loading vocabulary" />';
}

function toggle_english() {
	var edmode = 'off';

	if (document.getElementById('display_english').checked == true) {
		edmode = 'on';
	}

	// ping server to save user Preference
	$.post(
		'/account/updateEnglishPreferences',
		{
			display_english: edmode
		},
		function (txt) {}
	);

	$('.lesson_sentence_trans').toggle();
}
function toggle_pinyin() {
	var pdmode = 'off';

	if (document.getElementById('display_pinyin').checked == true) {
		pdmode = 'on';
	}

	// ping server to save user Preference
	$.post(
		'/account/updatePinyinPreferences',
		{
			display_pinyin: pdmode
		},
		function (txt) {}
	);

	$('.lesson_sentence_pinyin').toggle();
}

function contains_tonal_pinyin(p) {
	if (p.indexOf('ǖ') != -1) {
		return 1;
	}
	if (p.indexOf('ǘ') != -1) {
		return 1;
	}
	if (p.indexOf('ǚ') != -1) {
		return 1;
	}
	if (p.indexOf('ǜ') != -1) {
		return 1;
	}
	if (p.indexOf('ü') != -1) {
		return 1;
	}
	if (p.indexOf('ā') != -1) {
		return 1;
	}
	if (p.indexOf('á') != -1) {
		return 1;
	}
	if (p.indexOf('ǎ') != -1) {
		return 1;
	}
	if (p.indexOf('à') != -1) {
		return 1;
	}
	if (p.indexOf('ē') != -1) {
		return 1;
	}
	if (p.indexOf('é') != -1) {
		return 1;
	}
	if (p.indexOf('ě') != -1) {
		return 1;
	}
	if (p.indexOf('è') != -1) {
		return 1;
	}
	if (p.indexOf('ī') != -1) {
		return 1;
	}
	if (p.indexOf('í') != -1) {
		return 1;
	}
	if (p.indexOf('ǐ') != -1) {
		return 1;
	}
	if (p.indexOf('ì') != -1) {
		return 1;
	}
	if (p.indexOf('ō') != -1) {
		return 1;
	}
	if (p.indexOf('ó') != -1) {
		return 1;
	}
	if (p.indexOf('ǒ') != -1) {
		return 1;
	}
	if (p.indexOf('ò') != -1) {
		return 1;
	}
	if (p.indexOf('ū') != -1) {
		return 1;
	}
	if (p.indexOf('ú') != -1) {
		return 1;
	}
	if (p.indexOf('ǔ') != -1) {
		return 1;
	}
	if (p.indexOf('ù') != -1) {
		return 1;
	}

	return 0;
}
