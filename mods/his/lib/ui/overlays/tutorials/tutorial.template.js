module.exports = (targs={}) => {

  let help = "";
  let content = "";

  if (targs.help) { help = targs.help; }
  if (targs.content) { content = targs.content; }

  return `
      <div class="tutorial-overlay" id="tutorial-overlay">
	<div class="help">${help}</div>
	<div class="content">${content}</div>
      </div>
  `;

};
