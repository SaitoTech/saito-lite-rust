/*
 var saito = require('../../lib/saito/saito');
*/
const ModTemplate = require('../../lib/templates/modtemplate');
const DebugAppspaceMain = require('./lib/appspace/main');
const Transaction = require('../../lib/saito/transaction').default;
const SaitoHeader = require('../../lib/saito/ui/saito-header/saito-header');

class Debug extends ModTemplate {
  constructor(app) {
    super(app);

    this.app = app;
    this.name = 'Debug';
    this.slug = 'debug';
    this.appname = 'Debug';
    this.description =
      'Email plugin that allows visual exploration and debugging of the Saito wallet.';
    this.categories = 'Utilities Core';
    this.icon = 'fas fa-code';

    this.description = 'A debug configuration dump for Saito';
    this.categories = 'Dev Utilities';
    this.backup_json = {};
    this.json_diff = [];
    return this;
  }

  async initialize(app) {
    //console.log('111');

    if (this.app.BROWSER) {
      this.styles = ['/saito/style.css', '/debug/style.css'];
    }

    await super.initialize(app);
  }

  respondTo(type) {
    console.log('debug.respondTo : ' + type);
    if (type === 'appspace') {
      this.styles = ['/saito/lib/jsonTree/jsonTree.css', '/debug/style.css'];
      super.render(this.app, this);
      return new DebugAppspaceMain(this.app, this);
    }

    return null;
  }

  attachEventsEmail(app, mod) {}

  async render() {
    if (!this.app.BROWSER) {
      return;
    }

    this.header = new SaitoHeader(this.app, this);
    await this.header.initialize(this.app);

    this.addComponent(this.header);
    await super.render();
  }

  async attachEvents() {
    try {
      if (this.app.BROWSER) {
        let this_self = this;
        let optjson = JSON.parse(
          JSON.stringify(this.app.options, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
          )
        );

        this_self.backup_json = optjson;

        const { default: JSONEditor } = await import('jsoneditor');
        const container = document.getElementById('debug-options');
        const options = {};
        const editor = new JSONEditor(container, options);
        editor.set(optjson);

        document.querySelector('#debug-save').onclick = async () => {
          let json = editor.get();

          this_self.backup_json = await this_self.orderJSON(this_self.backup_json);
          json = await this_self.orderJSON(json);

          await this_self.getJSONDifference(this_self.backup_json, json);
          //console.log("length diff: ", Object.keys(this_self.json_diff).length);
          if (Object.keys(this_self.json_diff).length > 0) {
            let combined = this_self.deepMerge(this_self.backup_json, this_self.json_diff);
            //console.log('combined: ', combined);
            this_self.app.options = combined;
            this_self.app.wallet.saveWallet();
            siteMessage('Wallet options updated', 1500);
          }
        };
      }
    } catch (err) {
      console.log('Debug error attachEvents:', err);
    }
  }

  deepMerge(obj1, obj2) {
    const clone1 = structuredClone(obj1);
    const clone2 = structuredClone(obj2);

    for (let key in clone2) {
      if (clone2[key] instanceof Object && clone1[key] instanceof Object) {
        clone1[key] = this.deepMerge(clone1[key], clone2[key]);
      } else {
        clone1[key] = clone2[key];
      }
    }

    return clone1;
  }

  async getJSONDifference(a, b) {
    this.json_diff = this.isArray(a) ? [] : {};
    await this.recursiveDiff(a, b, this.json_diff);
    console.log('json_diff: ', this.json_diff);
  }

  recursiveDiff(a, b, node) {
    var checked = [];

    for (var prop in a) {
      if (typeof b[prop] == 'undefined') {
        this.addNode(prop, '[[removed]]', node);
      } else if (JSON.stringify(a[prop]) != JSON.stringify(b[prop])) {
        // if value
        if (typeof b[prop] != 'object' || b[prop] == null) {
          this.addNode(prop, b[prop], node);
        } else {
          // if array
          if (this.isArray(b[prop])) {
            this.addNode(prop, [], node);
            this.recursiveDiff(a[prop], b[prop], node[prop]);
          }
          // if object
          else {
            this.addNode(prop, {}, node);
            this.recursiveDiff(a[prop], b[prop], node[prop]);
          }
        }
      }
    }
  }

  addNode(prop, value, parent) {
    parent[prop] = value;
  }

  isArray(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  }

  isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  toType(a) {
    return {}.toString.call(a).match(/([a-z]+)(:?\])/i)[1];
  }

  isDeepObject(obj) {
    // Choose which types require we look deeper into (object, array, string...)
    return 'Object' === this.toType(obj);
  }

  async orderJSON(unordered) {
    let ordered = Object.keys(unordered)
      .sort()
      .reduce((obj, key) => {
        obj[key] = unordered[key];
        return obj;
      }, {});
    return ordered;
  }
}

module.exports = Debug;
