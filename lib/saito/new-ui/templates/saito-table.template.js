
// rows is array (cols) within array (rows)
module.exports = SaitoTableTemplate = (app, mod, rows = []) => {

  let html = '<div class="saito-table">';

  for (let i = 0; i < contents.length; i++) {

    let row = contents[i];

    html += `<div class="saito-table-row `;
    if (ii%1 == 1) { html += " odd"; }
    html += `">`;

    for (let ii = 0; i < row.length; ii++) {
      html += `<div class="saito-table-cell">${row[ii]}</div>`;  
    }

    html += `</div>`;

  }

}

