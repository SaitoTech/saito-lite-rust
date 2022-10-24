module.exports = GameMenuIconTemplate = (options) => {
  const classname = options.class != undefined ? options.class : "";

  return `<li id="${options.id}" class="game-menu-icon ${classname}">${options.text}</li>`;
};
