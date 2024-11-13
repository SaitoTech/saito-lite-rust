module.exports = (app, mod) => {
	return `
        <div class="saito-gif-container">
           <div  class="saito-gif-search">
            <input placeholder="Search For Gif" type="text" autofocus/>
            <i class="fas fa-search"> </i>
           </div>
            <div class="saito-gif-content", id="saito-gif-content">

            </div>
        </div>
    `;
};
