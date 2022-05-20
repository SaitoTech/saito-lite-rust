module.exports = ChirpFeedTemplate = () => {
  return `

      <div class="feed__header">
        <h2>Home</h2>
      </div>
    
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
          
      <!-- posts start ends -->
      <div class="posts" id="posts">
      </div>
      <!-- tweetbox ends -->

  `;
}
