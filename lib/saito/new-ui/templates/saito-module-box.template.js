module.exports = SaitoModuleTemplate = () => {

  return `
    <div class="saito-module">
      <div class="saito-module-graphic">
         <div class="saito-module-graphic-img"></div>
      </div>
      <div class="saito-module-name-container">
        <div class="saito-module-name">${title}</div>
        <p>${description}</p>
      </div>
    </div>
  `;

}
