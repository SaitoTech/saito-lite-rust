module.exports = BankOverlayTemplate = (app, mod, bank) => {

 
  if (Object.keys(bank.my_resources).length > 0) {
    let html = "<div class='tbd'>Select Resource to Trade: <ul class='bank'>";
    for (let i in bank.my_resources) {
      html += `<li id="${i}" class="option">`;
      for (let j = 0; j<bank.minForTrade[i]; j++){
        html += `<img class="icon" src="${mod.returnCardImage(i)}"/>`;
      }   
      //`${i} (${minForTrade[i]}/${bank.my_resources[i]})</li>`;
    }
  }

  let html = `
        <div class="saitoa settlers-info-overlay bank-overlay">
          <div class="settlers-items-container settlers-items-container-2">
            <div class="settlers-item-row">
              <div class="settlers-item-info-text">Select resource to give bank:</div>
            </div>
  `;



      if (Object.keys(bank.my_resources).length > 0) {
        for (let i in bank.my_resources) {
          html += `<div class="settlers-item-row settlers-cards-container settlers-trade-resources" id="${i}" data-selected="0" >`;
          for (let j = 0; j<bank.minForTrade[i]; j++){
            html += `<img src="${mod.returnCardImage(i)}">`;
          }   
          html += `</div>`;
        }
      }

   

  html += `
          </div>
          <div class="settlers-items-container settlers-items-container-desired-resources hide">
            <div class="settlers-item-row">
              <div class="settlers-item-info-text">Select resource to buy:</div>
            </div>
            <div class="settlers-item-row settlers-cards-container settlers-desired-resources">
              
  `;         

              for (let i of mod.returnResources()) {
                html += `<img id="${i}" src="${mod.returnCardImage(i)}">`;
              }

  html += `
            </div>
          </div>
        </div>
  `;

  return html;

}
