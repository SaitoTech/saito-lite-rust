
module.exports = SaitoSidebarTemplate = (app, mod, align) => {

  let html = `
    <div class="saito-sidebar ${align}">
    <div class="saito-mobile-buttons"> 
    <div class="chat">
    <i id="icon" class="fa-solid fa-comment-medical"></i>
    </div>
  </div>
  `;
  if (align === "left") {
    html += `
     <div class="hamburger">
        <i id="icon" class="fas fa-bars"></i>
      </div>
    `;
  }
  html += `
    </div>
  `;

  return html;

}

