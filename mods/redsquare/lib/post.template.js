const SaitoUserTemplate = require('./../../../lib/saito/new-ui/templates/saito-user.template');


module.exports = (app, mod, publickey, parent_id = "", thread_id = "") => {

  return `

    ${SaitoUserTemplate(app, mod, publickey, "create a text-tweet or drag-and-drop images...")}

    <textarea rows="7" class="post-tweet-textarea" name="post-tweet-textarea" id="post-tweet-textarea" placeholder="What's happening" cols="60"></textarea>

    <input type="hidden" id="parent_id" name="parent_id" value="${parent_id}" />
    <input type="hidden" id="thread_id" name="thread_id" value="${thread_id}" />

    <div id="post-tweet-img-preview-container"></div>

    <div class="saito-button-primary post-tweet-button" id="post-tweet-button"> Tweet </div>
    <div style="clear:both"></div>

  `;

}

