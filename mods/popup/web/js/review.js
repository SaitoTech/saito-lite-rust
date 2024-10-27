var total_remaining = 5;
var source = 'wordlist'; // wordlist or lesson
var review_include_pinyin = 1;
var generative_review_delay_on_incorrect = 2000;
var review_until_correct = 1;
var nextQuestionJSON = '';
var enableNumberShortcuts = 0;
// used in dict submission
var tempLastQuestionData = '';

function load_review(qntype) {
	setup_reinforcement_lightbox();
	loadQuestion();
}


var qid = ''; //question id
var wid = ''; //word id
var retry_load_delay = 5000;
var retry_load_state = 0;

try {
	var trx = parseInt(document.getElementById('total_remaining').innerHTML);
	total_remaining = trx;
} catch (err) {}
var total_answered = 0;
var total_correct = 0;
var total_incorrect = 0;
var review_until_correct = 0; // only review page, not lessons pages
var endless_mode = 0;
var requested_wids = '';
var lid = -1; // is this a lesson?

var correct_delay = 800;
var incorrect_delay = 1400;

var question = '';
var question_type = '';
var last_question_data = '';
var hint = '';
var option1 = '';
var option2 = '';
var option3 = '';
var option4 = '';
var answer = '';
var english = '';
var pinyin = '';
var mode = '';
var source_audio = '';
var source_audio_url = '';
var next_audio = '';
var next_audio_url = '';
var next_wid = '';

var correct = 1;
var language = '';

var answered_correctly = 0;

function check_answer(choice) {

	let chosen_option = "option" + choice;
	let chosen_option_id = "#option" + choice;

	last_question_data = '';

	$('.option').removeClass('option_hover');

	if (hint != '') {
		$('#question_hint').show();
	}

	if (chosen_option == correct) {
		answered_correctly = 1;
		total_answered++;
		total_correct++;
		show_points(10);
		if (endless_mode != 1) {
			total_remaining--;
		}

		$(`${chosen_option_id}`).addClass('green');

	} else {
		answered_correctly = -1;
		total_answered++;
		if (review_until_correct == 0 && endless_mode != 1) {
			total_remaining--;
		}
		total_incorrect++;

		$(`${chosen_option_id}`).addClass('red');
	}

	if (correct === "option1") {
		$('#option1').addClass('option_correct');
	} else {
		$('#option1').addClass('option_incorrect');
	}
	if (correct === "option2") {
		$('#option2').addClass('option_correct');
	} else {
		$('#option2').addClass('option_incorrect');
	}
	if (correct === "option3") {
		$('#option3').addClass('option_correct');
	} else {
		$('#option3').addClass('option_incorrect');
	}
	if (correct === "option4") {
		$('#option4').addClass('option_correct');
	} else {
		$('#option4').addClass('option_incorrect');
	}

	advance_to_next_question();
}


async function loadQuestion() {

	retry_load_state++;

	// forced delay so the animation is smooth
	$('#test_container').hide();

	$('#question_text').html('<img src="/popup/img/loader-big-circle.gif" />');
	$('#question_hint').html(' ');

	if (endless_mode == 0) {
		if (total_remaining > 9) {
			$('.total_remaining').html(total_remaining);
		}
		if (total_remaining == 9) {
			$('.total_remaining').html("nine");
		}
		if (total_remaining == 8) {
			$('.total_remaining').html("eight");
		}
		if (total_remaining == 7) {
			$('.total_remaining').html("seven");
		}
		if (total_remaining == 6) {
			$('.total_remaining').html("six");
		}
		if (total_remaining == 5) {
			$('.total_remaining').html("five");
		}
		if (total_remaining == 4) {
			$('.total_remaining').html("four");
		}
		if (total_remaining == 3) {
			$('.total_remaining').html("three");
		}
		if (total_remaining == 2) {
			$('.total_remaining').html("two");
		}
		if (total_remaining == 1) {
			$('.total_remaining').html("one");
			$('#questions').html('question');
		}
	}

	requested_wid = return_requested_wid();

	let qobj = await saito_mod.loadQuestion();

	// 
	// get JSON text
	//
        lid = qobj.lesson_id;
        wid = qobj.word_id;
        lesson_id = qobj.lesson_id;
        word_id = qobj.word_id;
        question_type = qobj.question_type;
        question = qobj.question;
        english = qobj.english;
        pinyin = qobj.pinyin;
        language = qobj.language;
        option1 = qobj.option1;
        option2 = qobj.option2;
        option3 = qobj.option3;
        option4 = qobj.option4;
        correct = qobj.correct;
        answer = qobj.answer;
        hint = qobj.hint;
        source_audio = qobj.source_audio;
        source_audio_url = qobj.source_audio_url;

        try {
                answer = answer.replace(/;;/g, ';');
                english = english.replace(/;;/g, ';');
                pinyin = pinyin.replace(/;;/g, ';');
        } catch (err) {}

	document.getElementById('question_text').innerHTML = question;
	document.getElementById('question_hint').innerHTML = hint;
	document.getElementById('option1').innerHTML = option1;
	document.getElementById('option2').innerHTML = option2;
	document.getElementById('option3').innerHTML = option3;
	document.getElementById('option4').innerHTML = option4;
	document.getElementById('option1').classList.remove("green");
	document.getElementById('option2').classList.remove("green");
	document.getElementById('option3').classList.remove("green");
	document.getElementById('option4').classList.remove("green");
	document.getElementById('option1').classList.remove("red");
	document.getElementById('option2').classList.remove("red");
	document.getElementById('option3').classList.remove("red");
	document.getElementById('option4').classList.remove("red");

	resetCss();

	$('#answer_space').fadeIn(5);
	$('#question_space').fadeIn(5);
	$('#test_container').fadeIn(400);
	try { $('#user_answer').focus(); } catch (err) {}

}


function resetCss() {
	// hovering effect
	$('.option').removeClass('option_hover');

	correct_delay = 800;
	incorrect_delay = 1500;

	// restore sensible defaults
	$('.option').removeClass('option_correct option_incorrect');
	$('#question_text').css('padding-left', '10px');
	$('#question_text').css('padding-right', '10px');
	$('#question_text').css('padding-top', '40px');
	$('#question_text').css('font-size', '10rem');
	$('#question_text').css('line-height', '1em');
	$('#instructions').css('background-color', '#F7F7F7');

	try { $('#option1').classList.remove("green"); } catch (err) {}
	try { $('#option2').classList.remove("green"); } catch (err) {}
	try { $('#option3').classList.remove("green"); } catch (err) {}
	try { $('#option4').classList.remove("green"); } catch (err) {}
	try { $('#option1').classList.remove("red"); } catch (err) {}
	try { $('#option2').classList.remove("red"); } catch (err) {}
	try { $('#option3').classList.remove("red"); } catch (err) {}
	try { $('#option4').classList.remove("red"); } catch (err) {}

	$('#question_text').css('line-height', '1em');
	$('#question_text').css('line-height', '1em');
	$('#question_text').css('line-height', '1em');
	if (question.length == 1) {
		$('#question_text').css('font-size', '14em');
		$('#question_text').css('line-height', '1em');
	}
	if (question.length == 2) {
		$('#question_text').css('font-size', '12em');
		$('#question_text').css('padding-top', '60px');
		$('#question_text').css('line-height', '1em');
	}
	if (question.length == 3) {
		$('#question_text').css('padding-top', '75px');
		$('#question_text').css('line-height', '1em');
	}
	if (question.length > 3) {
		$('#question_text').css('font-size', '6em');
		$('#question_text').css('padding-top', '85px');
	}
	if (question.length > 5) {
		$('#question_text').css('font-size', '4em');
		$('#question_text').css('padding-top', '115px');
	}
	if (question.length > 10) {
		$('#question_text').css('font-size', '2.5em');
		$('#question_text').css('padding-top', '90px');
		$('#question_text').css('line-height', '1.7em');
	}
	if (question_type != 'test') {
		if (question.length > 20) {
			$('#question_text').css('font-size', '2em');
			$('#question_text').css('padding-top', '80px');
			$('#question_text').css('line-height', '1.5em');
		}
	}


	if (question_type == 'test') {

		//
		// format vertical question
		//
		$('#question_text').css('padding-top', '15px');
		$('#question_space').css('border', 'none');
		$('#question_space').css('width', '100%');
		$('#question_space').css('min-height', '80px');
		$('.option').css('line-height', '30px');
		$('.option').css('width', '700px');
		$('.option').css('margin-left', '75px');
		$('#answer_space').css('width', '700px');
		$('#lightbox_header').css('display', 'none');

		if (option1 == '') {
			$('#option1').hide();
		}
		if (option2 == '') {
			$('#option2').hide();
		}
		if (option3 == '') {
			$('#option3').hide();
		}
		if (option4 == '') {
			$('#option4').hide();
		}
	} else {
		//
		// format horizontal question
		//
		$('#question_text').css('padding-top', '120px');
		$('#question_space').css('border-left', '1px dashed #D7D7D7');
		$('#question_space').css('width', '435px');
		$('#question_space').css('min-height', '300px');
		$('.option').css('line-height', '36px');
		$('.option').css('width', '340px');
		$('.option').css('margin-left', '9px');
		$('#answer_space').css('width', '400px');
		$('#lightbox_header').css('display', 'all');
	}

	if (
		question_type == 'multiple_choice_english' ||
		question_type == 'multiple_choice_pinyin' ||
		question_type == 'fill_in_the_blank' ||
		question_type == 'test' ||
		question_type == 'vocab'
	) {
		if (option1 != '') {
			$('#option1').show();
		}
		if (option2 != '') {
			$('#option2').show();
		}
		if (option3 != '') {
			$('#option3').show();
		}
		if (option4 != '') {
			$('#option4').show();
		}
		$('#instructions').hide();
		$('#instructions').html('');

		$('#option1').unbind('click');
		$('#option2').unbind('click');
		$('#option3').unbind('click');
		$('#option4').unbind('click');

		$('#option1').bind('click', function () {
			check_answer(1);
		});
		$('#option2').bind('click', function () {
			check_answer(2);
		});
		$('#option3').bind('click', function () {
			check_answer(3);
		});
		$('#option4').bind('click', function () {
			check_answer(4);
		});

		$('#question_text').unbind('click');
		$('#question_text').bind('click', function () {
			try {
				playWordAudio(source_audio_url, this);
			} catch (err) {}
		});
		if (review_include_pinyin == 1) {
			$('#question_hint').show();
		} else {
			$('#question_hint').hide();
		}
	}

	if (
		question_type == 'generative_english' ||
		question_type == 'generative_pinyin'
	) {
		$('#option1').hide();
		$('#option2').hide();
		$('#option3').hide();
		$('#question_hint').hide();
		$('#instructions').css('margin-top', '70px');
		$('#instructions').show();
		if (question_type == 'generative_english') {
			$('#instructions').html(
				'type the <span class="bold red">english</span> definition:'
			);
		}
		if (question_type == 'generative_pinyin') {
			$('#instructions').html(
				'type the <span class="bold red">pinyin</span> definition:'
			);
		}
		var inserthtml =
			'<form id="user_answer_form" action="" method="POST" onsubmit="check_answer();return false;"><input id="user_answer" type="text" onsubmit="check_answer();return false;" style="background-color:#F7F7F7;border:0px solid black;border-bottom:1px dashed #333;font-size:1.4em;width:330px;" /></form>';
		document.getElementById('option4').innerHTML = inserthtml;
		$('#option4').unbind('click');
	}
}

async function advance_to_next_question() {

	if (total_remaining == 0 && endless_mode == 0) {
		requested_wid = return_requested_wid();

		//
		// report the final question
		//
		await saito_mod.saveAnswer({
				wid: wid,
				lid: lid,
				last_question_data: last_question_data,
				requested_wid: requested_wid,
				source: source,
				correct: answered_correctly
		});

		if (total_correct == total_answered) {
			setTimeout(function () {
				document.getElementById('lightbox_content').innerHTML =
					return_test_finished_html();
			}, correct_delay);
			return;
		} else {
			setTimeout(function () {
				document.getElementById('lightbox_content').innerHTML =
					return_test_finished_html();
			}, incorrect_delay);
			return;
		}
	} else {

		//
		// report the final question
		//
		await saito_mod.saveAnswer({
				wid: wid,
				lid: lid,
				last_question_data: last_question_data,
				requested_wid: requested_wid,
				source: source,
				correct: answered_correctly
		});

	}

	if (answered_correctly == 1) {
		setTimeout(loadQuestion, correct_delay);
	} else {
		setTimeout(loadQuestion, incorrect_delay);
	}
}

function show_points(points) {
	tmpobj = $('#adso_status');

	tmpobj.html('+' + points);
	tmpobj.css('left', rawx - 20);
	tmpobj.css('top', rawy);
	tmpobj.css('opacity', 1);
	tmpobj.css('font-size', '1.4em');
	tmpobj.css('display', 'block');

	tmpobj.animate(
		{
			opacity: 0,
			fontSize: '4em',
			color: '#CCCCCC',
			top: '-=140',
			left: '+=15'
		},
		2000,
		function () {
			try {
				// points in name
				var mypoints = parseInt($('#my_points').html());
				mypoints += points;
				$('#my_points').html(mypoints);
			} catch (err) {}
		}
	);
}


function setup_reinforcement_lightbox() {

	var html2insert = `<div id="lightbox_header" class="lightbox_header">`;
	if (endless_mode == 0) { html2insert += `Before we continue, <span class="red total_remaining" id="total_remaining">five</span> <span class="red" id="questions">questions</span> to review....`; }
	html2insert += `
        	</div>
		<div id="test_container" class="test_container">
        	  <div id="question_space" class="question_space"><div id="question_text" class="question_text"></div><div id="question_hint" class="question_hint"></div></div> \
        	  <div id="answer_space" class="answer_space"> \
        	    <div id="instructions" class="instructions"></div> \
      		    <div id="option1" class="option"></div> \
      		    <div id="option2" class="option"></div> \
      		    <div id="option3" class="option"></div> \
      		    <div id="option4" class="option"></div> \
      		    <div id="feedback" class="feedback"></div> \
      		  </div> 
	        </div>
	`;

	document.getElementById('lightbox_content').innerHTML = html2insert;

	$('.option').bind('mouseover', function () {
		$(this).addClass('option_hover');
	});
	$('.option').bind('mouseout', function () {
		$(this).removeClass('option_hover');
	});
}

function hide_lightbox2() {
	if (total_remaining == 0 && review_until_correct == 1) {
		try {
			$('#review_div_title').html('Congratulations!');
			$('#review_div_text').html(
				'You\'ve finished reviewing everything scheduled. You can manually schedule more for review on your <a href="/vocabulary" class="nonlink red">vocabulary</a> page, or learn more by studying <a href="/lessons" class="nonlink red">a new lesson</a>. Upper-level students can also expand their vocabulary quite significantly by reading our annotated <a href="/chinese/news/" class="nonlink red">Chinese news</a>.'
			);
			hide_lightbox();
		} catch (err) {
			hide_lightbox();
		}
	} else {
		hide_lightbox();
	}
}

function return_error_finished_html() {
	return (
		'\
	   <div id="lightbox_header" class="lightbox_header" style="margin-top:25px;font-size:2em"> \
  	     <span class="red">' +
		question +
		'</span> is missing data.... \
           </div> \
   	   <div style="margin-top:5px"><div style="padding-top:20px;width:100%;float:left;text-align:center;font-size:1.7em;color:#888"> \
	     <div style="font-size:1.2em"> \
	       <span style="font-size:0.8em;padding:15px;">english:</span> <br/><input type="text" id="missing_english" value="' +
		english +
		'" style="text-align:center;background-color:#F7F7F7;border:0px solid black;border-bottom:1px dashed #333;font-size:1.3em;width:600px;" /> \
	       <p style="margin-top:10px" /> \
	       <span style="font-size:0.8em;padding:15px;">pinyin:</span> <br/><input type="text" id="missing_pinyin" value="" style="text-align:center;background-color:#F7F7F7;border:0px solid black;border-bottom:1px dashed #333;font-size:1.3em;width:600px;" /> \
	       <p style="margin-top:10px" /> \
	       <input style="font-size:0.6em;margin-top:10px;" type="button" onclick="updateMissing()" value="Update Vocabulary List" /> \
	   </div> '
	);
}
function updateMissing() {
	tmp3 = document.getElementById('missing_pinyin').value;
	tmp4 = document.getElementById('missing_english').value;

	$('#lightbox_header').html('<img src="/popup/img/loader-big-circle.gif" />');

	$.post(
		'/api/updateMissingWordlistData',
		{
			field1: question,
			field3: tmp3,
			field4: tmp4
		},
		function (txt) {
			loadQuestion();
		}
	);
}
function return_test_finished_html() {
	var html = '';
	if (total_incorrect > 0) {
		html =
			'\
	   <div id="lightbox_header" class="lightbox_header"> \
  	     You answered <span class="red">' +
			total_correct +
			'/' +
			total_answered +
			'</span> questions correctly.... \
           </div> \
   	   <div style="margin-top:50px"><div style="padding-top:20px;width:500px;float:left;text-align:center;font-size:2.3em;color:#888"> \
	     <div style="font-size:0.65em;padding-left:110px;padding-right:100px;text-align:center;color:#333;margin-top:10px;"><b>Tip:</b> review more vocab anytime in our <a href="/progress" class="nonlink red">study center</a></div> \
	     <div style="margin-top:45px;font-size:0.6em;color:#888;"><span class="red" style="cursor:pointer" onclick="hide_lightbox2();">No thanks, let me continue....</span></div> \
	   </div> \
	   <div style="min-height:300px;"> \
             <div style="float:left;height:221px;background:#F7F7F7;padding:2px;border:1px solid #888888;margin-right:20px;"> \
               <img src="/popup/img/misc/facepalm.jpg" style="height:220px"/> \
             </div> \
	   </div></div> ';
	} else {
		html =
			'\
	   <div id="lightbox_header" class="lightbox_header"> \
  	     Congratulations on a Perfect Score.... \
           </div> \
   	   <div style="margin-top:50px"><div style="padding-top:20px;width:500px;float:left;text-align:center;font-size:2.3em;color:#888"> \
	     <div style="font-size:0.65em;padding-left:110px;padding-right:100px;text-align:center;color:#333;margin-top:10px;"><b>Tip:</b> you can change the length and frequency of these popup tests by <a href="/account/review" class="red nonlink">customizing your account</a>. </div> \
	     <div style="margin-top:45px;font-size:0.6em;color:#888;"><span class="red" style="cursor:pointer" onclick="hide_lightbox2();">Good to know, let me continue....</span></div> \
	   </div> \
	   <div style="min-height:300px;"> \
             <div style="float:left;height:221px;background:#F7F7F7;padding:2px;border:1px solid #888888;margin-right:20px;"> \
               <img src="/popup/img/misc/congrats.jpg" style="height:220px"/> \
             </div> \
	   </div></div> ';
	}

	return html;
}

if (typeof audio_loaded == 'undefined') {
	//  $.getScript("/js/audio.js"); audio_loaded = 1;
}

function return_requested_wid() {
	try {
		// string will end with comma
		xy = requested_wids.slice(0, requested_wids.length - 1);
		xc = xy.split(',');
		if (xc.length == 0) {
			return;
		} else {
			return xc[Math.floor(Math.random() * xc.length)];
		}
	} catch (err) {
		return '';
	}
}

function addDefinition() {
	$.post(
		'/api/updateDictionaryWithUserSuggestion',
		{
			last_question_data: tempLastQuestionData
		},
		function (txt) {
			document.getElementById('feedback').innerHTML =
				'Thank You... dictionary updated!';
		}
	);
}

