const DebugAppspaceMainTemplate = require('./main.template');
const jsonTree = require('json-tree-viewer');

class DebugAppspaceMain {

  constructor(app) {
    this.name = "DebugAppspaceMain";
  }

  render(app, mod) {

    console.log("testing A");

    document.querySelector(".appspace").innerHTML = DebugAppspaceMainTemplate();

    let el = document.getElementById("appspace-debug");

    try { 
      var tree = jsonTree.create(JSON.parse(JSON.stringify(app.options)), el); 
    } catch (err) {
      console.log("error creating jsonTree: " + err);
    }
  }


  attachEvents(app, mod) { }

}


module.exports = DebugAppspaceMain;

