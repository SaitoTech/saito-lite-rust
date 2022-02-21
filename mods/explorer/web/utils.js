HTMLElement.prototype.toggleClass = function toggleClass(className) {
  if (this.classList.contains(className)) {
    this.classList.remove(className);
  } else {
    this.classList.add(className);
  }
};

async function fetchBlock(hash) {
    var url = window.location.origin + "/json-block/" + hash;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        listTransactions(data, hash);
      });


}

async function fetchRawBlock(hash){
  var url = window.location.origin + "/json-blocks/" + hash + "/blk";
    var block = [];
    for await (let line of makeTextFileLineIterator(url)) {
        block.push(JSON.parse(line));
    }
    drawRawBlock(block, hash);
}

function drawRawBlock(blk, hash) {
  var jsonBlk = document.querySelector('.blockJson');
  jsonBlk.innerHTML = "";
  blk.forEach((row, index) => {
    jsonBlk.innerHTML += "<div class='block-row-" + index + "'></div>";
  });
  blk.forEach((row, index) => {
    var tree = jsonTree.create(row, document.querySelector('.block-row-' + index));
  });

}

function listTransactions(blk, hash) {

    var html = '<div class="block-table">';
    html += '<div><h4>id</h4></div><div>' + blk.block.id + '</div>';
    html += '<div><h4>hash</h4></div><div>' + hash + '</div>';
    html += '<div><h4>source</h4></div><div><a href="/explorer/blocksource?hash=' + hash + '">click to view source</a></div>';
    html += '</div>';

    if (blk.transactions.length > 0) {

      html += '<h3>Bundled Transactions:</h3></div>';

      html += '<div class="block-transactions-table">';
      html += '<div class="table-header">id</div>';
      html += '<div class="table-header">sender</div>';
      html += '<div class="table-header">fee</div>';
      html += '<div class="table-header">type</div>';
      html += '<div class="table-header">module</div>';

      for (var mt = 0; mt < blk.transactions.length; mt++) {

        var tmptx = blk.transactions[mt];
        tmptx.transaction.id = mt;

        var tx_fees = 0;
        //if (tmptx.fees_total == "") {

          //
          // sum inputs
          //
          let inputs = 0;
          if (tmptx.transaction.from != null) {
            for (let v = 0; v < tmptx.transaction.from.length; v++) {
              inputs += parseFloat(tmptx.transaction.from[v].amt);
            }
          }

          //
          // sum outputs
          //
          let outputs = 0;
          for (let v = 0; v < tmptx.transaction.to.length; v++) {

            //
            // only count non-gt transaction outputs
            //
            if (tmptx.transaction.to[v].type != 1 && tmptx.transaction.to[v].type != 2) {
              outputs += parseFloat(tmptx.transaction.to[v].amt);
            }
          }

          tx_fees = inputs - outputs;

        //}

        html += `<div><a onclick="showTransaction('tx-` + tmptx.transaction.id + `');">` + mt + `</a></div>`;
        html += `<div><a onclick="showTransaction('tx-` + tmptx.transaction.id + `');">` + tmptx.transaction.from[0].add + `</a></div>`;
        html += '<div>' + tx_fees.toFixed(5) + '</div>';
        html += '<div>' + tmptx.transaction.type + '</div>';
        if (tmptx.transaction.type == 0) {
          if (tmptx.msg.module) {
            html += '<div>' + tmptx.msg.module + '</div>';
          } else {
            html += '<div>Money</div>';
          }
        }
        if (tmptx.transaction.type == 1) {
          html += '<div>' + tmptx.msg.name + '</div>';
        }
        if (tmptx.transaction.type > 1) {
          html += '<div> </div>';
        }
        html += '<div class="hidden txbox tx-' + tmptx.transaction.id + '">' + JSON.stringify(tmptx)+ '</div>';

      }
      html += '</div>';

    }
    //return html;
    document.querySelector('.txlist').innerHTML = html;
  }

  function showTransaction(obj) {

    var txdiv = document.querySelector('.txbox.' + obj);
console.log("A");
    if (!txdiv.classList.contains('treated')){
console.log("B");
      var txjson = JSON.parse(txdiv.innerText);
      txdiv.innerHTML = "";
      var tree = jsonTree.create(txjson, txdiv);
      txdiv.classList.add('treated');
      txdiv.style.display = "block";
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


