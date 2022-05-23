module.exports = (app) => {
    return `
    <!-- tweetbox starts -->
    <div class="tweetBox">
   
      <form>
        <div class="tweetbox__input">
           <img
          src="https://pbs.twimg.com/profile_images/1509864860338769923/MkZu3Nul_400x400.jpg"
        />
          <input type="text" placeholder="What's happening?" />
        </div>
        <button class="tweetBox__tweetButton">Tweet</button>
      </form>
    </div>
    <!-- tweetbox ends -->
    `;
}