// these variables should be customized
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
	if (qntype == 'hsk') {
		setup_hsk_menu();
	} else {
		setup_reinforcement_lightbox();
		loadQuestion();
	}
}

function setup_hsk_menu() {
	var html2insert =
		'\
        <div id="lightbox_header" class="lightbox_header" style="margin-top:70px;"> \
          Pick a Level to Study \
        </div> \
        <div id="test_container" class="test_container" style="margin-top:50px"> \
	  <div onclick="source=\'hsk-beginner\';qntype=\'\';setup_reinforcement_lightbox();loadQuestion();" style="float:left;margin-left:85px;width:220px;"> \
	<img src="/img/hsk/hsk1.jpg" style="width:220px"/> \
          </div> \
	  <div onclick="source=\'hsk-intermediate\';qntype=\'\';setup_reinforcement_lightbox();loadQuestion();" style="float:left;margin-left:30px;width:220px;"> \
	<img src="/img/hsk/hsk2.jpg" style="width:220px"/> \
          </div> \
	  <div onclick="source=\'hsk-advanced\';qntype=\'\';setup_reinforcement_lightbox();loadQuestion();" style="float:left;margin-left:30px;width:220px;"> \
	<img src="/img/hsk/hsk3.jpg" style="width:220px"/> \
          </div> \
        </div> \
        ';

	document.getElementById('lightbox_content').innerHTML = html2insert;
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

function check_answer_review(choice) {
	last_question_data = '';

	if (question_type == 'generative_pinyin') {
		return check_pinyin_answer(choice);
	}
	if (question_type == 'generative_english') {
		return check_english_answer(choice);
	}

	$('.option').removeClass('option_hover');

	if (hint != '') {
		$('#question_hint').show();
	}

	if (choice == correct) {
		answered_correctly = 1;
		total_answered++;
		total_correct++;
		show_points(10);
		if (endless_mode != 1) {
			total_remaining--;
		}
	} else {
		answered_correctly = -1;
		total_answered++;
		if (review_until_correct == 0 && endless_mode != 1) {
			total_remaining--;
		}
		total_incorrect++;
	}

	if (correct == 1) {
		$('#option1').addClass('option_correct');
	} else {
		$('#option1').addClass('option_incorrect');
	}
	if (correct == 2) {
		$('#option2').addClass('option_correct');
	} else {
		$('#option2').addClass('option_incorrect');
	}
	if (correct == 3) {
		$('#option3').addClass('option_correct');
	} else {
		$('#option3').addClass('option_incorrect');
	}
	if (correct == 4) {
		$('#option4').addClass('option_correct');
	} else {
		$('#option4').addClass('option_incorrect');
	}

	advance_to_next_question();
}

function updateTotalRemaining(x) {
	$('.total_remaining').html(x);
}


function loadQuestion() {

	retry_load_state++;

alert("in load question!");

	// forced delay so the animation is smooth
	$('#test_container').hide();

	$('#question_text').html('<img src="/img/loader-big-circle.gif" />');
	$('#question_hint').html(' ');

	if (endless_mode == 0) {
		if (total_remaining > 9) {
			updateTotalRemaining(total_remaining);
		}
		if (total_remaining == 9) {
			updateTotalRemaining('nine');
		}
		if (total_remaining == 8) {
			updateTotalRemaining('eight');
		}
		if (total_remaining == 7) {
			updateTotalRemaining('seven');
		}
		if (total_remaining == 6) {
			updateTotalRemaining('six');
		}
		if (total_remaining == 5) {
			updateTotalRemaining('five');
		}
		if (total_remaining == 4) {
			updateTotalRemaining('four');
		}
		if (total_remaining == 3) {
			updateTotalRemaining('three');
		}
		if (total_remaining == 2) {
			updateTotalRemaining('two');
		}
		if (total_remaining == 1) {
			updateTotalRemaining('one');
			$('#questions').html('question');
		}
	}

	requested_wid = return_requested_wid();

alert("source is: " + source);

	// 
	// get JSON text
	//
        let lesson_id = 1;
        let word_id = 1;
        let question_type = "vocab";
        let question = "Question";
        let english = "English";
        let pinyin = "Pinyin";
        let language = "chinese";
        let option1 = "option1";
        let option2 = "option2";
        let option3 = "option3";
        let option4 = "option4";
        let correct = "option1";
        let answer = "option1";
        let hint = "hint";
        let source_audio_url = 'http://popupchinese.com/data/';

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

	resetCss();

	$('#answer_space').fadeIn(5);
	$('#question_space').fadeIn(5);
	$('#test_container').fadeIn(400);
	try { $('#user_answer').focus(); } catch (err) {}

}


function format_as_vertical_question() {
	$('#question_text').css('padding-top', '15px');
	$('#question_space').css('border', 'none');
	$('#question_space').css('width', '100%');
	$('#question_space').css('min-height', '80px');
	$('.option').css('line-height', '30px');
	$('.option').css('width', '700px');
	$('.option').css('margin-left', '75px');
	$('#answer_space').css('width', '700px');
	$('#lightbox_header').css('display', 'none');
}
function format_as_horizontal_question() {
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

	if (last_question_data != '') {
		$('#feedback').html(
			'Testing new feature... please disregard for the moment!'
		);
	}

	if (question_type == 'test') {
		format_as_vertical_question();
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
		format_as_horizontal_question();
	}

	if (
		question_type == 'multiple_choice_english' ||
		question_type == 'multiple_choice_pinyin' ||
		question_type == 'fill_in_the_blank' ||
		question_type == 'test'
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
			check_answer_review(1);
		});
		$('#option2').bind('click', function () {
			check_answer_review(2);
		});
		$('#option3').bind('click', function () {
			check_answer_review(3);
		});
		$('#option4').bind('click', function () {
			check_answer_review(4);
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
			'<form id="user_answer_form" action="" method="POST" onsubmit="check_answer_review();return false;"><input id="user_answer" type="text" onsubmit="check_answer_review();return false;" style="background-color:#F7F7F7;border:0px solid black;border-bottom:1px dashed #333;font-size:1.4em;width:330px;" /></form>';
		document.getElementById('option4').innerHTML = inserthtml;
		$('#option4').unbind('click');
	}
}

function is_english_close_enough(user_answer, english_answer) {
	tmpx = user_answer.replace(/to /g, '');
	tmpx = tmpx.replace(/be /g, '');
	tmpx = tmpx.replace(/not /g, '');
	tmpx = tmpx.replace(/ /g, '');
	tmpx = tmpx.replace(/s$/g, '');
	tmpx = tmpx.replace(/ed$/g, '');
	tmpx = tmpx.replace(/d$/g, '');
	tmpx = tmpx.replace(/ly$/g, '');
	tmpx = tmpx.toLowerCase();

	answered_correctly = -1;

	var potential_answers = english_answer.split(/[,;]/);
	for (i = 0; i < potential_answers.length; i++) {
		tmpyy = potential_answers[i];

		tmpyy = tmpyy.replace(/to /g, '');
		tmpyy = tmpyy.replace(/be /g, '');
		tmpyy = tmpyy.replace(/not /g, '');
		tmpyy = tmpyy.replace(/ /g, '');
		tmpyy = tmpyy.replace(/s$/g, '');
		tmpyy = tmpyy.replace(/ed$/g, '');
		tmpyy = tmpyy.replace(/d$/g, '');
		tmpyy = tmpyy.replace(/ly$/g, '');
		tmpyy = tmpyy.toLowerCase();

		if (tmpx == tmpyy && tmpyy != '') {
			return 1;
		}
		if (tmpx.length > tmpyy.length) {
			if (tmpx.indexOf(tmpyy) > -1 && tmpyy != '') {
				return 1;
			}
		}
		if (tmpx.length < tmpyy.length && tmpx.length > 8) {
			if (tmpyy.indexOf(tmpx) > -1) {
				return 1;
			}
		}
	}

	return -1;
}
function check_english_answer() {
	var user_answer = document.getElementById('user_answer').value;
	var answer_for_prompt = english.split(/[,;]/)[0];

	answered_correctly = is_english_close_enough(user_answer, answer);

	if (answered_correctly == -1) {
		if (is_pinyin_close_enough(user_answer, pinyin) == 1) {
			$('#instructions').css('background-color', 'yellow');
			document.getElementById('user_answer').value = '';
			$('#instructions').focus();
			return;
		}
	}

	if (answered_correctly == 1) {
		answered_correctly = 1;
		total_answered++;
		total_correct++;
		show_points(10);
		total_remaining--;
	} else {
		answered_correctly = -1;
		last_question_data = question + '_M_' + user_answer;
		total_answered++;
		if (review_until_correct == 0) {
			total_remaining--;
		}
		total_incorrect++;
	}

	if (answered_correctly == 1) {
		$('#option4').addClass('option_correct');
		$('#user_answer').css('background-color', '#EBFFD6');
		$('#instructions').css('background-color', '#FFF');
		$('#instructions').html(
			'you entered: <span class="green">' + user_answer + '</span>'
		);
	} else {
		incorrect_delay = generative_review_delay_on_incorrect;
		$('#option4').addClass('option_incorrect');
		$('#user_answer').css('background-color', '#FFD6CC');
		$('#instructions').css('background-color', '#FFF');
		$('#instructions').html(
			'you entered: <span class="red">' + user_answer + '</span>'
		);
	}
	document.getElementById('user_answer').value = answer_for_prompt;
	if (answer.length > 10) {
		$('#user_answer').css('font-size', '1em');
	}
	if (answer.length > 15) {
		$('#user_answer').css('font-size', '0.9em');
	}
	if (answer.length > 19) {
		$('#user_answer').css('font-size', '0.8em');
	}
	$('#user_answer').css('border', '0px');
	$('#user_answer').blur();

	advance_to_next_question();
}

function is_pinyin_close_enough(user_pinyin, pinyin_answer) {
	tmpx = user_pinyin.replace(/ /g, '');
	tmpx = tmpx.replace('\'', '');
	tmpx = tmpx.replace('er5', 'r5');
	tmpx = tmpx.replace(/5/g, '');
	tmpx = tmpx.replace(/[^a-zA-Z1-9]/g, '');
	tmpx = tmpx.toLowerCase();

	answered_correctly = -1;

	var potential_answers = pinyin_answer.split(/[,;]/);
	for (i = 0; i < potential_answers.length; i++) {
		tmpyy = potential_answers[i];

		tmpyy = tmpyy.replace(/ /g, '');
		tmpyy = tmpyy.replace(/_APOS_/g, '');
		tmpyy = tmpyy.replace(/5/g, '');
		tmpyy = tmpyy.replace(/[^a-zA-Z1-9]/g, '');
		tmpyy = tmpyy.toLowerCase();

		if (tmpx.indexOf('1') == -1) {
			tmpyy = tmpyy.replace(/1/g, '');
		}
		if (tmpx.indexOf('2') == -1) {
			tmpyy = tmpyy.replace(/2/g, '');
		}
		if (tmpx.indexOf('3') == -1) {
			tmpyy = tmpyy.replace(/3/g, '');
		}
		if (tmpx.indexOf('4') == -1) {
			tmpyy = tmpyy.replace(/4/g, '');
		}

		if (tmpx == tmpyy && tmpyy != '') {
			return 1;
		}
		if (tmpx.length > tmpyy.length) {
			if (tmpx.indexOf(tmpyy) > -1 && tmpyy != '') {
				return 1;
			}
		}
		if (tmpx.length < tmpyy.length && tmpx.length > 8) {
			if (tmpyy.indexOf(tmpx) > -1) {
				return 1;
			}
		}
	}

	return -1;
}
function check_pinyin_answer() {
	var user_answer = document.getElementById('user_answer').value;
	var answer_for_prompt = pinyin.split(/[,;]/)[0];

	answered_correctly = is_pinyin_close_enough(user_answer, answer);

	if (answered_correctly == -1) {
		if (is_english_close_enough(user_answer, english) == 1) {
			$('#instructions').css('background-color', 'yellow');
			document.getElementById('user_answer').value = '';
			$('#instructions').focus();
			return;
		}
	}

	if (answered_correctly == 1) {
		answered_correctly = 1;
		total_answered++;
		total_correct++;
		show_points(10);
		total_remaining--;
	} else {
		answered_correctly = -1;
		last_question_data = question + '_M_' + user_answer;
		total_answered++;
		if (review_until_correct == 0) {
			total_remaining--;
		}
		total_incorrect++;
	}

	if (answered_correctly == 1) {
		$('#option4').addClass('option_correct');
		$('#user_answer').css('background-color', '#EBFFD6');
		$('#instructions').html(
			'you entered: <span class="green">' + user_answer + '</span>'
		);
	} else {
		incorrect_delay = generative_review_delay_on_incorrect;
		$('#option4').addClass('option_incorrect');
		$('#user_answer').css('background-color', '#FFD6CC');
		$('#instructions').html(
			'you entered: <span class="red">' + user_answer + '</span>'
		);
	}
	document.getElementById('user_answer').value = answer_for_prompt;
	if (answer.length > 10) {
		$('#user_answer').css('font-size', '1em');
	}
	if (answer.length > 15) {
		$('#user_answer').css('font-size', '0.9em');
	}
	if (answer.length > 19) {
		$('#user_answer').css('font-size', '0.8em');
	}
	$('#user_answer').css('border', '0px');
	$('#user_answer').blur();

	advance_to_next_question();
}

function advance_to_next_question() {
	if (total_remaining == 0 && endless_mode == 0) {
		requested_wid = return_requested_wid();

		// report the final question
		$.post(
			'/api/loadWordQuestion',
			{
				wid: wid,
				lid: lid,
				last_question_data: last_question_data,
				requested_wid: requested_wid,
				source: source,
				correct: answered_correctly
			},
			function (txt) {}
		);

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

function return_word_question_html() {
	htmltmp =
		' \
	<div id="question_space" class="question_space"><div id="question_text" class="question_text"></div><div id="question_hint" class="question_hint"></div></div> \
	<div id="answer_space" class="answer_space"> \
	  <div id="instructions" class="instructions"></div> \
	  <div id="option1" class="option"></div> \
	  <div id="option2" class="option"></div> \
	  <div id="option3" class="option"></div> \
	  <div id="option4" class="option"></div> \
	  <div id="feedback" class="feedback"></div> \
	</div> \
	';
	return htmltmp;
}

function setup_reinforcement_lightbox() {

	var html2insert =
		'\
        <div id="lightbox_header" class="lightbox_header"> \
        ';
	if (endless_mode == 0) {
		html2insert +=
			'\
  	  Before we continue, <span class="red total_remaining" id="total_remaining">five</span> <span class="red" id="questions">questions</span> to review.... \
	  ';
	} else {
		html2insert += '\
	  ';
	}
	html2insert +=
		'\
        </div> \
	<div id="test_container" class="test_container"> \
	';
	html2insert += return_word_question_html();
	html2insert += '\
	</div> \
        ';

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

	$('#lightbox_header').html('<img src="/img/loader-big-circle.gif" />');

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
               <img src="/img/misc/facepalm.jpg" style="height:220px"/> \
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
               <img src="/img/misc/congrats.jpg" style="height:220px"/> \
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

