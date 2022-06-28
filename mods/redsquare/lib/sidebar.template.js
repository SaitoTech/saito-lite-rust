
module.exports = RedSquareMenuTemplate = (app, mod) => {

  return `
    <div class="saito-sidebar right redsquare-sidebar">
      <div class="saito-search-bar">
        <i class="fas fa-search"></i> <input type="text" placeholder="Search on Saito" />
      </div>
      <div class="redsquare-calendar">
      </div>
      <div id="redsquare-follow-container">
       <h5> Who to follow </h5>
       <div>
          <div class="saito-list">
          <div>
          <img src="/redsquare/images/david.jpeg" />
          <div>
            <p>David Lancashire </p>
            <span> @trevelyan</span>
          </div>

          <div>
            <button class="small">Follow </button>
          </div>

        </div>
          <div>
          <img src="/redsquare/images/richard.jpeg" />
          <div>
            <p>Richard Parris </p>
            <span> @arpee</span>
          </div>

          <div>
            <button class="small">Follow </button>
          </div>

        </div>
          </div>
      </div>  
    </div>
  `;

}



{/* <div id="redsquare-trends-container">
<h5> Trends for you </h5>
  <div>
      <p> Gaming </p>
      <h6> Settlers </h6>
      <p> 5k chirps </p>
  </div>
  <div>
      <p> Technology </p>
      <h6> Saitozens </h6>
      <p> 16k chirps </p>
  </div>
  <div>
      <p> Business & Finance </p>
      <h6> David Lanchashire </h6>
      <p> 6.7k chirps </p>
  </div>
</div> */}