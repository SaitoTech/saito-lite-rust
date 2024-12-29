        function playWordAudio(audioFile, imgElement) {

            const audioPlayer = document.getElementById('audioPlayer');
            const audioSource = document.getElementById('audioSource');

            // Update the audio source with the new file
            audioSource.src = audioFile;
            audioPlayer.load(); // Reload audio source

            // Toggle play/pause when clicking the image
            if (audioPlayer.paused) {
                audioPlayer.play();  // Play the audio
                imgElement.src = "/popup/img/buttons/pause_button.gif";  // Change image to pause button
            } else {
                audioPlayer.pause(); // Pause the audio
                imgElement.src = "/popup/img/buttons/play_button.gif";  // Change image to play button
            }

            // Optional: Set up event to change back to play button when audio ends
            audioPlayer.onended = function() {
                imgElement.src = "/popup/img/buttons/play_button.gif"; // Reset image when audio ends
            };
        }



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
		let replacement_html = "";
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

if (tfld1 === "unknown") { tfld1 = visible_field; }
if (tfld2 === "unknown") { tfld2 = visible_field; }
if (tfld3 === "unknown") { tfld3 = visible_field; }
if (tfld4 === "unknown") { tfld4 = visible_field; }
if (tfld5 === "unknown") { tfld5 = visible_field; }
if (tfld6 === "unknown") { tfld6 = visible_field; }

console.log(tfld1 + " / " + tfld2 + " / " + tfld3 + " / " + tfld4 + " / " + tfld5 + " / " + tfld6);

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

	if (dmode == "pinyin") {
	  document.querySelectorAll('.lesson_sentence_pinyin').forEach((el) => {
	    if (el.style.display == "none") { el.style.display = "block"; } else { el.style.display = "none"; }
	  });
	  save_display_mode(dmode);
	  return true;
	}
	if (dmode == "english") {
	  document.querySelectorAll('.lesson_sentence_translation').forEach((el) => {
	    if (el.style.display == "none") { el.style.display = "block"; } else { el.style.display = "none"; }
	  });
	  save_display_mode(dmode);
	  return true;
	}

	let existing_preference = "simplified";
	if (dmode == "simplified") { existing_preference = "traditional"; }

	document.querySelectorAll(':has(> span)').forEach((el) => {
	  if (el.classList.contains("lesson_sentence_pinyin")) { return; }
	  let x = el.innerHTML.replace(/SPAN/g, 'span');
	  el.innerHTML = switch_display_mode_in_string(x, dmode, existing_preference);
	});

	save_display_mode(dmode);

	return true;

}

function toggle_vocab_mode(dmode="") {
	if (dmode == "field1") {
	  document.querySelectorAll('.field1').forEach((el) => { if (el.style.display == "none") { el.style.display = ""; } else { el.style.display = "none"; } });
	  save_vocab_mode(dmode);
	  return true;
	}
	if (dmode == "field2") {
	  document.querySelectorAll('.field2').forEach((el) => { if (el.style.display == "none") { el.style.display = ""; } else { el.style.display = "none"; } });
	  save_vocab_mode(dmode);
	  return true;
	}
	if (dmode == "field3") {
	  document.querySelectorAll('.field3').forEach((el) => { if (el.style.display == "none") { el.style.display = ""; } else { el.style.display = "none"; } });
	  save_vocab_mode(dmode);
	  return true;
	}
	if (dmode == "field4") {
	  document.querySelectorAll('.field4').forEach((el) => { if (el.style.display == "none") { el.style.display = ""; } else { el.style.display = "none"; } });
	  save_vocab_mode(dmode);
	  return true;
	}
	if (dmode == "field5") {
	  document.querySelectorAll('.field5').forEach((el) => { if (el.style.display == "none") { el.style.display = ""; } else { el.style.display = "none"; } });
	  save_vocab_mode(dmode);
	  return true;
	}
}

// overrideen in popup.js
function save_display_mode(dmode="") {
}


