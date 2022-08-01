
module.exports = EmailHeaderTemplate = (app, mod, boxname) => {

  return `
      <div class="email-boxname">${boxname}</div>
      <div class="email-icons"><i id="email-delete-icon" class="icon-med far fa-trash-alt"></i></div>
  `;
}
