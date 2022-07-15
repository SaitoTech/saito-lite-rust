module.exports = (app, mod, tweet) => {

  let html = `<div class="redsquare-input-profile">
          <img src="/redsquare/images/david.jpeg" />
      </div>
      <div class="">
          <textarea placeholder="What's happening"></textarea>
      </div>
      <input type="file" id="tweet-img-input">  
      <button> Tweet </button>
      `;

  return html;
}