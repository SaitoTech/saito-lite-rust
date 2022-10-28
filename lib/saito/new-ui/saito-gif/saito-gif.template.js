module.exports = (app, mod) => {
    return `
        <div class="saito-gif-container">
           <div  class="saito-gif-search">
            <input placeholder="Search for cool gifs" type="text" />
            <i class="fas fa-search"> </i>
           </div>
            <div class="saito-gif-content", id="saito-gif-content">

            </div>
        </div>
    `
}