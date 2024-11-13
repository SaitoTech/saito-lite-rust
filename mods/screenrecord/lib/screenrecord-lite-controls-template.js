module.exports  = (app, mod) => {

    let html = `
      <div class="screenrecord-controls" id="screenrecord-controls">
        <div class="control-panel">
          <div class="timer">
            <div class="counter"> 00:00 </div>
          </div>  
          <div class="control-list">`;
  
      html += `<div class="record-disconnect-control icon_click_area">
               <i class="fa-solid fa-x"></i>
            </div>`;
    
  
    html += `</div>
        </div>
      </div>`;
  
  
      return html;
  };
  