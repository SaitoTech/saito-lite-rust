
module.exports = SaitoSidebarTemplate = (app, mod, align) => {

  let html = `
    <div class="saito-sidebar ${align}">
    <div class="saito-mobile-buttons"> 
    <div class="chat">
    <i id="chat-icon" class="fas fa-comments"></i>
    </div>
  </div>
  `;
  if (align === "left") {
    html += `
     <div class="hamburger">
        <i id="icon" class="fas fa-angle-right"></i>
      </div>
    `;
  }
  html += `
    </div>
  `;

  return html;

}

