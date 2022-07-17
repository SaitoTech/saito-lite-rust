const SaitoUserTemplate = require('./../../../lib/saito/new-ui/templates/saito-user.template');

module.exports = (app, mod, publickey) => {

  return `
    ${SaitoUserTemplate(app, mod, publickey)}
    <textarea class="post-tweet-textarea" name="post-tweet-textarea" id="post-tweet-textarea" placeholder="What's happening"></textarea>
    <div class="saito-button-secondary post-tweet-button" id="post-tweet-button"> Tweet </div>
  `;

}

