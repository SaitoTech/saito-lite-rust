module.exports = (app, mod) => {

	let html = `
	    <div class="container send-nft-container">
         <div class="utxo-slips">
            <div class="instructions">
               Select NFT from your wallet to send
            </div>
            <div id="nft-list">
               
            </div>
         </div>
         <div class="right-section">
            <div class="slip-info">
               <div class="metrics">
                  <div class="metric balance">
                     <h3><span class='metric-amount'>0.00</span> <span class='metric-amount'>SAITO</span></h3>
                     <p class="positive">Balance</p>
                  </div>
               </div>
               <div class="options">
                  <div class="data-nft-toggle">image editor</div>
               </div>
            </div>
            <div class="nft-creator nft-inactive">
               <div class="inputs">
                  <div>
                     <label for="nfts-deposit">Deposit</label>
                     <input type="number" id="nfts-deposit" value="0">
                  </div>
                  <div>
                     <label for="nfts-fee">Tx Fee</label>
                     <input type="number" id="nfts-fee" value="1">
                  </div>
                  <div>
                     <label for="nfts-change">Change</label>
                     <input type="number" id="nfts-change">
                  </div>
               </div>
               <div>
                  <label for="nfts-receiver">Receiver</label>
                  <input type="text" placeholder='Receiver public key' id="nfts-receiver" value="">
               </div>
               <div class="textarea-container">
                  <div class="saito-app-upload active-tab paste_event" id="nft-image-upload">
                     NFT image
                  </div>
               </div>
            </div>
            <div class="create-button nft-inactive">
               <button id="send_nft">Send NFT</button>
            </div>
         </div>
      </div>
	`;

	return html;


//  `<div class="container" style="background-color: var(--background-color-overlay-menu);">
//    <div class="utxo-slips">
//       <div class="instructions">
//          Select NFT from your wallet to send
//       </div>
//       <div id="nft-list" style="
//          min-width: 80rem;
//          ">
//          <div class="utxo-div send-nft" style="
//             display: flex;
//             flex-direction: column;
//             gap: 2rem;
//             ">
//             <div style="
//                display: none;
//                ">
//                <input type="radio" value="0" class="utxo-selection-button" name="utxo-input">
//             </div>
//             <div style="
//                display: flex;
//                flex-direction: row;
//                /* justify-content: space-between; */
//                /* width: 115rem; */
//                text-align: le;
//                gap: 2rem;
//                ">
//                <div style="
//                   width: 20rem;
//                   /* border: 1px solid red; */
//                   ">#</div>
//                <div style="
//                   width: 20rem;
//                   /* border: 1px solid red; */
//                   ">collection</div>
//                <div style="
//                   width: 20rem;
//                   /* border: 1px solid red; */
//                   ">value</div>
//                <div style="
//                   width: 20rem;
//                   /* border: 1px solid red; */
//                   ">minted by</div>
//                <div style="
//                   width: 20rem;
//                   /* border: 1px solid red; */
//                   ">minted at</div>
//             </div>
//             <div style="
//                display: flex;
//                flex-direction: row;
//                /* justify-content: space-between; */
//                /* width: 115rem; */
//                gap: 2rem;
//                ">
//                <div style="
//                   width: 20rem;
//                   /* border: 1px solid red; */
//                   ">1</div>
//                <div style="
//                   width: 20rem;
//                   /* border: 1px solid red; */
//                   ">
//                   <img src="http://127.0.0.1:12101/saito/img/logo.svg" style="
//                      height: 3rem;
//                      ">
//                </div>
//                <div style="
//                   width: 20rem;
//                   /* border: 1px solid red; */
//                   ">99 SAITO</div>
//                <div style="
//                   width: 20rem;
//                   /* border: 1px solid red; */
//                   ">
//                   <div class="saito-user saito-user-wWvjqbuP4b7eqKvV3ZW5Y7tueSKRxEXqB37cpU4QY8yr" data-id="wWvjqbuP4b7eqKvV3ZW5Y7tueSKRxEXqB37cpU4QY8yr" data-disable="false">
//                      <div class="saito-identicon-box">
//                         <img class="saito-identicon" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MjAnIGhlaWdodD0nNDIwJyBzdHlsZT0nYmFja2dyb3VuZC1jb2xvcjpyZ2JhKDI0MCwyNDAsMjQwLDEpOyc+PGcgc3R5bGU9J2ZpbGw6cmdiYSg3NywxNjMsNDEsMSk7IHN0cm9rZTpyZ2JhKDc3LDE2Myw0MSwxKTsgc3Ryb2tlLXdpZHRoOjIuMTsnPjxyZWN0ICB4PScxNjgnIHk9JzAnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PScxNjgnIHk9JzE2OCcgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9JzE2OCcgeT0nMzM2JyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nODQnIHk9JzAnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PScyNTInIHk9JzAnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PSc4NCcgeT0nODQnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PScyNTInIHk9Jzg0JyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMCcgeT0nODQnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PSczMzYnIHk9Jzg0JyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48L2c+PC9zdmc+" data-id="wWvjqbuP4b7eqKvV3ZW5Y7tueSKRxEXqB37cpU4QY8yr">
//                      </div>
//                      <div class="saito-address treated" data-id="wWvjqbuP4b7eqKvV3ZW5Y7tueSKRxEXqB37cpU4QY8yr">Anon-wWvjqb</div>
//                      <div class="saito-userline " style="--key-color:#4da329;" data-id="wWvjqbuP4b7eqKvV3ZW5Y7tueSKRxEXqB37cpU4QY8yr">wWvjqbuP4b7eqKvV3...</div>
//                   </div>
//                </div>
//                <div style="
//                   width: 20rem;
//                   /* border: 1px solid red; */
//                   ">May 14, 2025 at 11:22</div>
//             </div>
//             <div style="
//                display: flex;
//                flex-direction: row;
//                /* justify-content: space-between; */
//                /* width: 115rem; */
//                gap: 2rem;
//                ">
//                <div style="
//                   width: 20rem;
//                   /* border: 1px solid red; */
//                   ">2</div>
//                <div style="
//                   width: 20rem;
//                   /* border: 1px solid red; */
//                   ">
//                   <img src="http://127.0.0.1:12101/saito/img/logo.svg" style="
//                      height: 3rem;
//                      ">
//                </div>
//                <div style="
//                   width: 20rem;
//                   /* border: 1px solid red; */
//                   ">10 SAITO</div>
//                <div style="
//                   width: 20rem;
//                   /* border: 1px solid red; */
//                   ">
//                   <div class="saito-user saito-user-wWvjqbuP4b7eqKvV3ZW5Y7tueSKRxEXqB37cpU4QY8yr" data-id="wWvjqbuP4b7eqKvV3ZW5Y7tueSKRxEXqB37cpU4QY8yr" data-disable="false">
//                      <div class="saito-identicon-box">
//                         <img class="saito-identicon" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MjAnIGhlaWdodD0nNDIwJyBzdHlsZT0nYmFja2dyb3VuZC1jb2xvcjpyZ2JhKDI0MCwyNDAsMjQwLDEpOyc+PGcgc3R5bGU9J2ZpbGw6cmdiYSg3NywxNjMsNDEsMSk7IHN0cm9rZTpyZ2JhKDc3LDE2Myw0MSwxKTsgc3Ryb2tlLXdpZHRoOjIuMTsnPjxyZWN0ICB4PScxNjgnIHk9JzAnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PScxNjgnIHk9JzE2OCcgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9JzE2OCcgeT0nMzM2JyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nODQnIHk9JzAnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PScyNTInIHk9JzAnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PSc4NCcgeT0nODQnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PScyNTInIHk9Jzg0JyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMCcgeT0nODQnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PSczMzYnIHk9Jzg0JyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48L2c+PC9zdmc+" data-id="wWvjqbuP4b7eqKvV3ZW5Y7tueSKRxEXqB37cpU4QY8yr">
//                      </div>
//                      <div class="saito-address treated" data-id="wWvjqbuP4b7eqKvV3ZW5Y7tueSKRxEXqB37cpU4QY8yr">Anon-wWvjqb</div>
//                      <div class="saito-userline " style="--key-color:#4da329;" data-id="wWvjqbuP4b7eqKvV3ZW5Y7tueSKRxEXqB37cpU4QY8yr">wWvjqbuP4b7eqKvV3ZW5....</div>
//                   </div>
//                </div>
//                <div style="
//                   width: 20rem;
//                   /* border: 1px solid red; */
//                   ">May 14, 2025 at 13:22</div>
//             </div>
//          </div>
//       </div>
//    </div>
//    <div class="right-section">
//       <div class="slip-info">
//          <div class="metrics">
//             <div class="metric balance">
//                <h3><span class="metric-amount">0.00</span> <span class="metric-amount">SAITO</span></h3>
//                <p class="positive">Balance</p>
//             </div>
//          </div>
//          <div class="options">
//             <div class="data-nft-toggle">image editor</div>
//          </div>
//       </div>
//       <div class="nft-creator nft-inactive">
//          <div class="inputs">
//             <div>
//                <label for="nfts-deposit">Deposit</label>
//                <input type="number" id="nfts-deposit" value="0">
//             </div>
//             <div>
//                <label for="nfts-fee">Tx Fee</label>
//                <input type="number" id="nfts-fee" value="1">
//             </div>
//             <div>
//                <label for="nfts-change">Change</label>
//                <input type="number" id="nfts-change">
//             </div>
//          </div>
//          <div>
//             <label for="nfts-receiver">Receiver</label>
//             <input type="text" placeholder="Receiver public key" id="nfts-receiver" value="">
//          </div>
//          <div class="textarea-container">
//             <div class="saito-app-upload active-tab paste_event" id="nft-image-upload">
//                NFT image
//             </div>
//          </div>
//       </div>
//       <div class="create-button nft-inactive">
//          <button id="send_nft">Send NFT</button>
//       </div>
//    </div>
// </div>`
}
