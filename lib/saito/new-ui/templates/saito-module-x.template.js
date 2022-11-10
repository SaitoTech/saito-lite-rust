const SaitoModuleTemplate = require("./saito-module.template");

module.exports = SaitoModuleXTemplate = (title = "title", description = "description", image = "/saito/img/dreamscape.png", options = "options", action = "action", id = "") => {

  let extra_column = `
    <div class="saito-module-custom-box">
      <div class="saito-module-action ${(action).toLowerCase()}" id="saito-module-action-${id}" data-cmd="${(action).toLowerCase()}" data-id="${id}">${action}</div>
      <div class="saito-module-option">
        ${options}
      </div>
    </div>
  `;

  let html = `<div class="saito-module-x" id="saito-module-x-${id}" data-id="${id}">`
  html += `${SaitoModuleTemplate(title, description, image, "", "small", extra_column)}`;
  html += `</div>`

  return html;
}

