var label = '';
label = 'The Anarchists and the Printing Press';

//
// over-rides version is "adso.js" that kicks into admin mode
//
function onWordClick() {
	if (tt4 == '' && tt3 == '' && tt2 == '') {
		return;
	}

	let field1 = tt1;
	let field2 = tt2;
	let field3 = tt3;
	let field4 = tt4;
	let field5 = tt5;

	tmpobj = $('#adso_status');

	tmpobj.html(tt3);
	tmpobj.css('left', rawx - 20);
	tmpobj.css('top', rawy);
	tmpobj.css('opacity', 1);
	tmpobj.css('display', 'block');

	tmpobj.animate(
		{
			opacity: 0,
			fontSize: '2em',
			color: '#CCCCCC',
			top: '-=100',
			left: '+=15'
		},
		1500,
		function () {}
	);

	var temptt = tt4;
	tt4 = tt3;
	tt3 = temptt;

	// do not submit part of speech (field5)
	add_to_vocab(field1, field2, field3, field4, field5, label);
}

//
// this is a dummy function that will be overriden
//
var add_to_vocab = function (
	field1 = '',
	field2 = '',
	field3 = '',
	field4 = '',
	field5 = '',
	label = ''
) {
};

add_to_vocab();
