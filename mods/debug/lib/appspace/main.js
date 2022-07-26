const DebugAppspaceMainTemplate = require('./main.js');
const jsonTree = require('json-tree-viewer');

class DebugAppspaceMain {

  constructor(app) {
    this.name = "DebugAppspaceMain";
  }

  render(app, mod) {

      document.querySelector(".appspace").innerHTML = sanitize(DebugAppspaceMainTemplate());
try {  var tree = jsonTree.create(app.options, document.getElementById("appspace-debug")); } catch (err) {
  console.log("error creating jsonTree: " + jsonTree);
}
  }


  attachEvents(app, mod) {}

}


module.exports = DebugAppspaceMain;

