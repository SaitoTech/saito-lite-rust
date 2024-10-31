module.exports = () => {
	return `
      <div class="review-overlay" id="review-overlay">
        <div id="lightbox_header" class="lightbox_header"></div>
        <div id="test_container" class="test_container">
          <div id="question_space" class="question_space">
	    <div id="question_text" class="question_text"></div>
	    <div id="question_hint" class="question_hint"></div>
	  </div>
          <div id="answer_space" class="answer_space">
            <div id="instructions" class="instructions"></div>
            <div id="option1" class="option"></div>
            <div id="option2" class="option"></div>
            <div id="option3" class="option"></div>
            <div id="option4" class="option"></div>
            <div id="feedback" class="feedback"></div>
          </div>
        </div>
      </div>
  `;
};
