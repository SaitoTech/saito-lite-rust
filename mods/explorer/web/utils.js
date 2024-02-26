HTMLElement.prototype.toggleClass = function toggleClass(className) {
	if (this.classList.contains(className)) {
		this.classList.remove(className);
	} else {
		this.classList.add(className);
	}
};

async function fetchBlock(hash) {
	var url = window.location.origin + '/explorer/json-block/' + hash;

	fetch(url)
		.then((response) => response.json())
		.then((data) => {
			listTransactions(data, hash);
		})
		.catch((err) => {
			console.error('Error fetching content: ' + err);
			return '';
		});
}

async function fetchRawBlock(hash) {
	var url = window.location.origin + '/explorer/json-block/' + hash;
	var block = [];
	for await (let line of makeTextFileLineIterator(url)) {
		block.push(JSON.parse(line));
	}

	console.log('this block', block);
	drawRawBlock(block, hash);
}

function drawRawBlock(blk, hash) {
	var jsonBlk = document.querySelector('.blockJson');
	jsonBlk.innerHTML = '';
	blk.forEach((row, index) => {
		jsonBlk.innerHTML += "<div class='block-row-" + index + "'></div>";
	});
	blk.forEach((row, index) => {
		var tree = jsonTree.create(
			row,
			document.querySelector('.block-row-' + index)
		);
	});
}

function listTransactions(blk, hash) {
  let nolan_per_saito = 100000000;

  var html = '<div class="block-table">';
  html += "<div><h4>id</h4></div><div>" + blk.id + "</div>";
  html += "<div><h4>hash</h4></div><div>" + hash + "</div>";
  html += "<div><h4>creator</h4></div><div>" + blk.creator + "</div>";
  html +=
    '<div><h4>source</h4></div><div><a href="/explorer/blocksource?hash=' +
    hash +
    '">click to view source</a></div>';
  html += "</div>";

  if (blk.transactions.length > 0) {
    html += "<h3>Bundled Transactions:</h3></div>";

    html += '<div class="block-transactions-table">';
    html += '<div class="table-header">id</div>';
    html += '<div class="table-header">sender</div>';
    html += '<div class="table-header">fee</div>';
    html += '<div class="table-header">type</div>';
    html += '<div class="table-header">module</div>';

    for (var mt = 0; mt < blk.transactions.length; mt++) {
      var tmptx = blk.transactions[mt];
      tmptx.id = mt;

      var tx_fees = 0;
      //if (tmptx.fees_total == "") {

      //
      // sum inputs
      //
      let inputs = 0;
      if (tmptx.from != null) {
        for (let v = 0; v < tmptx.from.length; v++) {
          inputs += parseFloat(tmptx.from[v].amount);
        }
      }

      //
      // sum outputs
      //
      let outputs = 0;
      for (let v = 0; v < tmptx.to.length; v++) {
        //
        // only count non-gt transaction outputs
        //
        if (tmptx.to[v].type != 1 && tmptx.to[v].type != 2) {
          outputs += parseFloat(tmptx.to[v].amount);
        }
      }

      tx_fees = inputs - outputs;

      //}
      let tx_from = "fee tx";
      if (tmptx.from.length > 0) {
        tx_from = tmptx.from[0].publicKey;
      }

      html += `<div><a onclick="showTransaction('tx-` + tmptx.id + `');">` + mt + `</a></div>`;
      html += `<div><a onclick="showTransaction('tx-` + tmptx.id + `');">` + tx_from + `</a></div>`;
      html += "<div>" + BigInt(tx_fees*nolan_per_saito) + "</div>";
      html += "<div>" + tmptx.type + "</div>";
      if (tmptx.type == 0) {
        if (tmptx.msg.module) {
          html += "<div>" + tmptx.msg.module + "</div>";
        } else {
          html += "<div>Money</div>";
        }
      }
      if (tmptx.type == 1) {
        html += "<div>" + tmptx.msg.name + "</div>";
      }
      if (tmptx.type > 1) {
        html += "<div> </div>";
      }
      html += '<div class="hidden txbox tx-' + tmptx.id + '">' + JSON.stringify(tmptx) + "</div>";
    }
    html += "</div>";
  }
  //return html;
  document.querySelector(".txlist").innerHTML = html;
}

function showTransaction(obj) {
	var txdiv = document.querySelector('.txbox.' + obj);
	console.log('A');
	if (!txdiv.classList.contains('treated')) {
		console.log('B');
		var txjson = JSON.parse(txdiv.innerText);
		txdiv.innerHTML = '';
		var tree = jsonTree.create(txjson, txdiv);
		txdiv.classList.add('treated');
		txdiv.style.display = 'block';
	}
	txdiv.toggleClass('hidden');
}

async function* makeTextFileLineIterator(fileURL) {
	const utf8Decoder = new TextDecoder('utf-8');
	const response = await fetch(fileURL);
	const reader = response.body.getReader();
	let { value: chunk, done: readerDone } = await reader.read();
	chunk = chunk ? utf8Decoder.decode(chunk) : '';

	const re = /\n|\r|\r\n/gm;
	let startIndex = 0;
	let result;

	for (;;) {
		let result = re.exec(chunk);
		if (!result) {
			if (readerDone) {
				break;
			}
			let remainder = chunk.substr(startIndex);
			({ value: chunk, done: readerDone } = await reader.read());
			chunk = remainder + (chunk ? utf8Decoder.decode(chunk) : '');
			startIndex = re.lastIndex = 0;
			continue;
		}
		yield chunk.substring(startIndex, result.index);
		startIndex = re.lastIndex;
	}
	if (startIndex < chunk.length) {
		// last line didn't end in a newline char
		yield chunk.substr(startIndex);
	}
}
