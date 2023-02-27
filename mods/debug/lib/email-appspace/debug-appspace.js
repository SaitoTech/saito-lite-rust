const DebugAppspaceTemplate = require('./debug-appspace.template.js');
const jsonTree = require('json-tree-viewer');

module.exports = DebugAppspace = {

  render(app, mod) {
    document.querySelector(".email-appspace").innerHTML = sanitize(DebugAppspaceTemplate());

    let el = document.getElementById("appspace-debug");

    try {
      var tree = jsonTree.create(app.options, el);
      console.log(tree)
    } catch (err) {
      console.log("error creating jsonTree: " + err);
    }
  },

  attachEvents(app, mod) { }

}
