module.exports = (blocker) => {
	let loader_class = blocker == true ? 'blocker' : 'non-blocker';
	return `<div id="saito-loader-container" class="saito-loader-container ${loader_class}"> 
    <div class="saito-loader">
    </div>
 </div>`;
};
