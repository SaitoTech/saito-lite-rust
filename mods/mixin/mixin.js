const saito = require('./../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');
const MixinAppspace = require('./lib/email-appspace/mixin-appspace');
const SaitoOverlay = require("../../lib/saito/ui/saito-overlay/saito-overlay");
const fetch = require('node-fetch');

class Mixin extends ModTemplate {

  constructor(app) {

    super(app);

    this.name = "Mixin";
    this.description = "Send and Receive Third-Party Cryptocurrency Tokens Fee-Free on Saito";
    this.categories = "Finance Utilities";
    
  }
  
  respondTo(type = "") {

    if (type == 'email-appspace') {
      let obj = {};
      obj.render = function (app, data) {
        MixinAppspace.render(app, data);
      }
      obj.attachEvents = function (app, data) {
        MixinAppspace.attachEvents(app, data);
      }
      return obj;
    }

    return null;
  }


  initialize(app) {

    let auth_token = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI5YmUyZjIxMy1jYTlkLTQ1NzMtODBjYS0zYjI3MTFiYjIxMDUiLCJzaWQiOiJmMDcyY2QyYS03YzgxLTQ5NWMtODk0NS1kNDViMjNlZTY1MTEiLCJpYXQiOjE2NDYxOTU4NDksImV4cCI6MTY0NjE5OTQ0OSwianRpIjoiNDM5MmVkODUtMjBmZC00MDVmLWJhNzctMTJiZmE2Mjg0YmM5Iiwic2lnIjoiNWU2YjU4ZmZhMTBiM2JjNTE3MjRmZjBiYmQyYWZiOTFjNDc3MWVlMzQwZjVkNjg1MzQwZGZhNGM4NTRiYWZiYSIsInNjcCI6IkZVTEwifQ.5oeRfYEIf_oPsuziukGFTLpyb8O1O29qIe139mOL45_cleyxaRCfWfmiza15sF-oU4NIyfyiiknr-Dq4KqLmAQ";
    let target_url = 'https://api.mixin.one/network/chains';
    let publickey = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzd6LIkHvYhqbrahcVIf6LSkf2sBmoeUwuqDjbW4QteFygzcApmDe0EjORmX6zZbgdOWmrqo7b3ss6TT6JfihEOi64rEErS71xjzjzVcxSOxGu2K2FDymFkaXmU7UoFX3SayGu0jQHh2qwyqDOtC0RbMplVFfx7CdkrOb9ugaJYBcubXUcXmp1M8mYjvVE4mUNP1BG4yZZpOTpRgFf7ZKkcMtBuXMO3H0OInnIhdo4c6neW9btvv73cuETdSqiJDq09UCaNgjE5dSzLqIK/6Cdz4HCp2lhQaRg+f8fGa6NVfTUHe4qFoMEyLYnRAsG8+ECm+R8g0ZEBgfqORrBeVGxwIDAQAB";

    fetch(`${target_url}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth_token}`
      },
      method: "POST",
      //body: `{'full_name': 'Test-Saito-User1','session_secret': 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzd6LIkHvYhqbrahcVIf6LSkf2sBmoeUwuqDjbW4QteFygzcApmDe0EjORmX6zZbgdOWmrqo7b3ss6TT6JfihEOi64rEErS71xjzjzVcxSOxGu2K2FDymFkaXmU7UoFX3SayGu0jQHh2qwyqDOtC0RbMplVFfx7CdkrOb9ugaJYBcubXUcXmp1M8mYjvVE4mUNP1BG4yZZpOTpRgFf7ZKkcMtBuXMO3H0OInnIhdo4c6neW9btvv73cuETdSqiJDq09UCaNgjE5dSzLqIK/6Cdz4HCp2lhQaRg+f8fGa6NVfTUHe4qFoMEyLYnRAsG8+ECm+R8g0ZEBgfqORrBeVGxwIDAQAB'}`
    }).then(response => {
      response.json().then(data => {

console.log("DATA IS: " + JSON.stringify(data));

      });
    });

  }
}

module.exports = Mixin;


