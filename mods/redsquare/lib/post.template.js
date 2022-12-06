const SaitoUserTemplate = require('./../../../lib/saito/new-ui/templates/saito-user.template');


module.exports = (app, mod, publickey, parent_id = "", thread_id = "") => {

  return `

    ${SaitoUserTemplate(app, publickey, "create a text-tweet or drag-and-drop images...")}

    <textarea rows="7" class="post-tweet-textarea" name="post-tweet-textarea" id="post-tweet-textarea" placeholder="What's happening" cols="60"></textarea>

    <input type="hidden" id="parent_id" name="parent_id" value="${parent_id}" />
    <input type="hidden" id="thread_id" name="thread_id" value="${thread_id}" />

    <div id="post-tweet-img-preview-container"></div>

    <div class="post-tweet-img-icon"><i class="fa-solid fa-image"></i></div>
    <div class="saito-button-primary post-tweet-button" id="post-tweet-button"> Tweet </div>
    <div style="clear:both"></div>

    <section id="post-tweet-loader" class="post-tweet-loader">
      <span class="loading__anim"></span>
    </section>
    
    <style>
      /* Temporary fix for screenshot tweet overlay styling, outside of Redsquare */

      .redsquare-tweet-overlay {
        padding: 2rem;
        padding-bottom: 0.5rem;
        border-radius: 0.5rem;
        background-color: white;
        position: relative;
        width: 50rem;
        max-width: 100vw
        max-height: 95vh;
        overflow-y: auto;
      }

      .post-tweet-img-preview {
        position: relative;
        margin-right: 2rem;
        display: block;
        height: auto;
        display: inline-block;
        float: left;
      }

      .post-tweet-img-preview img {
        top: 0px;
        height: 4rem;
        width: 104%;
        margin-left: auto;
        margin-right: auto;
        width: auto;
        margin-top: 1rem;
        margin-right: rem;
        box-shadow: 1px 1px 1px 2px #ccc;
        object-fit: contain;
      }

      .post-tweet-img-preview i {
        position: absolute;
        z-index: 2;
        width: 0.5rem;
        height: 0.5rem;
        right: 0.5rem;
        font-size: 2rem;
        cursor: pointer;
        top: 0.5rem;
        background: #fff;
      }

      .post-tweet-button {
        margin-left: 0rem;
        margin-right: 0rem;
        margin-top: 1rem;
        width: 20rem;
        text-align: center;
        float: right;
      }

      .post-tweet-img-icon {
        margin-top: 0.5rem;
        float: left;
        font-size: 5rem;
        color: #444A;
      }

      .redsquare-tweet-overlay textarea {
        background-color: white;
        border: 1px solid var(--saito-border);
        display: block;
        padding: 1rem;
        border-radius: 0.5rem;
        width: 100%;
        outline: none;
        font-size: 1.6rem;
        margin-bottom: 0rem;
        margin-top: 0.5rem;
      }
    </style>

  `;

}

