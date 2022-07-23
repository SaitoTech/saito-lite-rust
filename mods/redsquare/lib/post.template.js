const SaitoUserTemplate = require('./../../../lib/saito/new-ui/templates/saito-user.template');

module.exports = (app, mod, publickey) => {

  return `

    ${SaitoUserTemplate(app, mod, publickey)}

    <textarea rows="7" class="post-tweet-textarea" name="post-tweet-textarea" id="post-tweet-textarea" placeholder="What's happening" cols="60"></textarea>

    <input type="hidden" name="parent_id" value="" />
    <input type="hidden" name="thread_id" value="" />

    <div class="saito-button-primary post-tweet-button" id="post-tweet-button"> Tweet </div>
    <div style="clear:both"></div>

  `;

}

