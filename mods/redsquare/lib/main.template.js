
module.exports = (app, mod) => {

   return `
    <div class="saito-header">
      Saito Header
    </div>

    <div id="saito-container" class="saito-container">
      <div class="saito-sidebar left">
        Left sidebar
      </div>
      
      <div class="saito-main appspace" id="redsquare-appspace">
        Main Container
      </div>
      
      <div class="saito-sidebar right">
        Right sidebar
      </div>
    </div>
  `;
}

