const ModTemplate = require("../../lib/templates/modtemplate");
const JsStore = require("jsstore");
//const {Worker} = require("jsstore/dist/jsstore.worker");





//const JsStore = require("/saito/lib/jsstore/jsstore.js");

class Mockmod extends ModTemplate {
  constructor(app, mod, parent_callback = null) {
    super(app);
    this.app = app;
    this.mod = mod;
    this.name = "Mockmod";
    this.slug = "mockmod";

    this.styles = ["/saito/saito.css"];

    this.postScripts = ["/saito/lib/jsstore/jsstore.js","/saito/lib/jsstore/jsstore.worker.js", "/saito/lib/jsstore/example.js"];

    this.initialize(app);
    this.connection = null;
  }

  async initialize(app) {

//    this.connection = new JsStore.Connection(new Worker("/saito/lib/jsstore/jsstore.worker.js"));

    // this.connection = new Connection();
    // this.connection.addPlugin(workerInjector);

    // let dbName ='JsStore_Demo';
    // let tblProduct = {
    //     name: 'Product',
    //     columns: {
    //         // Here "Id" is name of column 
    //         id:{ primaryKey: true, autoIncrement: true },
    //         itemName:  { notNull: true, dataType: "string" },
    //         price:  { notNull: true, dataType: "number" },
    //         quantity : { notNull: true, dataType: "number" }
    //     }
    // };
    // let database = {
    //     name: dbName,
    //     tables: [tblProduct]
    // }



    // const isDbCreated = await connection.initDb(database);
    // if(isDbCreated === true){
    //     console.log("db created");
    //     // here you can prefill database with some data
    // }
    // else {
    //     console.log("db opened");
    // }

    super.initialize(app);
  }


  render() {
    let btn = `<button id="trigger">Post</button> <br > fetch your posts: <button id="load">Load</button>
      <br >
      <br >
      <br >
      <br >
      <button id="add">Add data</button>
      <button id="retrieve">Retrieve data</button>
    `

    this.app.browser.addElementToSelector(btn, ".main");

    super.render();
  }

  attachEvents(){
    let mock = this;


    // document.querySelector("#add").addEventListener("click", async function(e){
    //   e.preventDefault();


    //   var value = {
    //       itemName: 'Blue Jeans',
    //       price: 2000,
    //       quantity: 1000
    //   }

    //   var insertCount = await this.connection.insert({
    //       into: 'Product',
    //       values: [value]
    //   });

    //   console.log(`${insertCount} rows inserted`);

    // });


    // document.querySelector("#retrieve").addEventListener("click", async function(e){
    //   e.preventDefault();

    //   var results = await this.connection.select({
    //       from: 'Product',
    //       where: {
    //           id: 5
    //       }
    //   });

    //   alert(results.length + 'record found');

    // });



    document.querySelector("#trigger").addEventListener("click", function(e){
      e.preventDefault();

      let obj = {
        module: mock.name,
        title: "my post",
        request: "archive insert",
        data: {
          text: "my post number: ",
          number: Math.random()*100,
        },
      };

      let newtx = mock.app.wallet.createUnsignedTransaction();
      newtx.msg = obj;

      newtx = mock.app.wallet.signTransaction(newtx);

      mock.app.storage.saveTransaction(newtx, { owner : mock.app.wallet.returnPublicKey() })

      console.log("tx saved");
    });


    document.querySelector("#load").addEventListener("click", function(e){
      e.preventDefault();

      mock.app.storage.loadTransactions({ owner : mock.app.wallet.returnPublicKey() }, (txs) => {

        console.log("tx loaded ////");
        console.log(txs);

        for(let i=0; i<txs.length; i++) {
          console.log(txs[i]);

          let newtx = new saito.default.transaction(txs[i].transaction);
          let txmsg = newtx.returnMessage();
        
          console.log("tx msg ///////");
          console.log(txmsg);
          console.log(newtx);
        }

      });
    });

  }

}

module.exports = Mockmod;
