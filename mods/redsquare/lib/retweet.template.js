const SaitoUserTemplate = require('./../../../lib/saito/new-ui/templates/saito-user.template');

module.exports = (app, mod, publickey, tweet = "") => {

  return `

    ${SaitoUserTemplate(app, mod, publickey, "add a comment to your retweet or just click submit...")}

    <textarea rows="7" class="post-tweet-textarea" name="post-tweet-textarea" id="post-tweet-textarea" placeholder="Optional Comment?" cols="60"></textarea>

    <div class="saito-button-primary post-tweet-button" id="post-tweet-button"> Retweet / Share </div>
    <div style="clear:both"></div>

  `;

}

