
module.exports = SaitoInputTemplate = (input_self, placeholder) => {

	if (input_self.display == "large") {

          return `
	        <div class="saito-input saito-input-large">
        	        <textarea class="post-tweet-textarea text-input" name="post-tweet-textarea" id="post-tweet-textarea" placeholder="${placeholder}" rows="7" cols="60"></textarea>
        	</div>
          `;

	} else {

	  return `
		<div class="saito-input">
			<div id="text-input" class="text-input hide-scrollbar" type="text" value="" autocomplete="off" placeholder="${placeholder}" contenteditable="true"></div>
			<i class="saito-emoji fa-regular fa-face-smile"></i>
		</div>
	  `;

	}

};

