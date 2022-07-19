const SaitoUserTemplate = require('./../../../lib/saito/new-ui/templates/saito-user.template');

module.exports = (app, mod, publickey) => {

  return `
    ${SaitoUserTemplate(app, mod, publickey)}
    <textarea rows="10" class="post-tweet-textarea" name="post-tweet-textarea" id="post-tweet-textarea" placeholder="What's happening" cols="60"></textarea>
    <div class="saito-button-primary post-tweet-button" id="post-tweet-button"> Tweet </div>
  `;

}

