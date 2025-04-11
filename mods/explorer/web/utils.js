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

      if (document.querySelector(".block-transactions-table") == null) {
        loadBlockFromDisk(hash);
      }
    })
    .catch((err) => {
      console.error('Error fetching content: ' + err);
      return '';
    });
}

async function loadBlockFromDisk(hash) {
  try {
    var url = window.location.origin + `/lite-block-disk/${hash}`;

    await fetch(url).then((response) => response.json())
    .then((data) => {
      document.querySelector(".txlist").innerHTML = (data.html);
    })
    .catch((err) => {
      console.error('Error fetching content: ' + err);
      return '';
    });

  } catch(err) {
    console.error('Error fetching block from disk: ' + err);
  }
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

      var tx_fees = BigInt(0);
      //if (tmptx.fees_total == "") {

      //
      // sum inputs
      //
      let inputs = BigInt(0);
      if (tmptx.from != null) {
        for (let v = 0; v < tmptx.from.length; v++) {
          inputs += BigInt(tmptx.from[v].amount);
        }
      }

      //
      // sum outputs
      //
      let outputs = BigInt(0);
      for (let v = 0; v < tmptx.to.length; v++) {
        //
        // only count non-gt transaction outputs
        //
        if (tmptx.to[v].type != 1 && tmptx.to[v].type != 2) {
          outputs += BigInt(tmptx.to[v].amount);
        }
      }

      tx_fees = inputs - outputs;

      //}
      let tx_from = "fee tx";
      if (tmptx.from.length > 0) {
        tx_from = tmptx.from[0].publicKey;
      } else if (tmptx.type===6){
        tx_from = "issuance tx";
        tx_fees = 0;
      } else if (tmptx.type===7){
        tx_from = "block stake tx";
      }

      html += `<div><a onclick="showTransaction('tx-` + tmptx.id + `');">` + mt + `</a></div>`;
      html += `<div><a onclick="showTransaction('tx-` + tmptx.id + `');">` + tx_from + `</a></div>`;
      html += "<div>" + (BigInt(tx_fees) * BigInt(nolan_per_saito)) + "</div>";
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

  for (; ;) {
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

async function checkBalance(pubkey = "") {
  if (pubkey) {
    // API
    let balance = await balanceAPI();
    let supply = 0.0
    if (balance.hasOwnProperty(pubkey)) {
      document.querySelector('.balance-search-input').placeholder = pubkey;
      let balance_nolan = balance[pubkey] || 0;
      let nolan_per_saito = 100000000;
      let balance_saito = formatNumberLocale(balance_nolan / nolan_per_saito);
      // draw
      document.querySelector('.balance-saito').innerHTML = balance_saito;
      document.querySelector('.balance-nolan').innerHTML = balance_nolan;
    }
  }
}



async function checkAllBalance() {
  // API
  let balance = await balanceAPI();

  let supply = BigInt(0);

  // draw
  let node = document.querySelector(".explorer-balance-table");
  for (row in balance) {
    supply = supply + BigInt(balance[row]);

    let wallet = document.createElement("div");
    wallet.setAttribute("class", "explorer-balance-data");
    wallet.innerHTML = row;
    node.appendChild(wallet);

    let balance_saito = document.createElement("div");
    balance_saito.setAttribute("class", "explorer-balance-data");
    let nolan_per_saito = parseFloat(balance[row]) / 100000000;
    balance_saito.innerHTML = formatNumberLocale(nolan_per_saito);
    node.appendChild(balance_saito);

    let balance_nolan = document.createElement("div");
    balance_nolan.setAttribute("class", "explorer-balance-data");
    balance_nolan.innerHTML = balance[row];
    node.appendChild(balance_nolan);
  }
  document.querySelector('.balance-saito').innerHTML = formatNumberLocale(parseFloat(supply) / 100000000);
  document.querySelector('.balance-nolan').innerHTML = formatNumberLocale(supply);
}

async function balanceAPI(pubkey = "") {
  // API
  let response = await fetch('/balance/' + pubkey);
  let data = await response.text();

  // format
  data = data.split(/\n/).filter(Boolean); // undefined = 0?
  let balance_list = {};
  for (let i = 1; i < data.length; i++) { /**
   * i = 0 -> first line is file name.
   */
    let row = data[i];
    row = row.split(/\s/);
    if (balance_list.hasOwnProperty(row[0])) {
      balance_list[row[0]] = Number(balance_list[row[0]]) + Number(row[4]);
    } else {
      balance_list[row[0]] = Number(row[4]);
    }
  }
  return balance_list;
}

function formatNumberLocale(number) {
  const locale = (window.navigator?.language) ? window.navigator?.language : 'en-US';
  const numberFormatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    // maximumFractionDigits: 4,
    minimumSignificantDigits: 1,
    // maximumSignificantDigits: 4
  });
  return numberFormatter.format(number);
}