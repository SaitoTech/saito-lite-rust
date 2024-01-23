module.exports = (app, mod) => {
	return `
    <div class="manager">
      <div class="menu">
        <ul>
          <li class="manager-menu absolute-beginners">Absolute Beginners</li>
          <li class="manager-menu elementary">Elementary</li>
          <li class="manager-menu intermediate">Intermediate</li>
          <li class="manager-menu advanced">Advanced</li>
          <li class="manager-menu film-friday">Film Friday</li>
          <li class="manager-menu quiz-night">Quiz Night</li>
          <li class="manager-menu short-stories">Short Stories</li>
          <li class="manager-menu ktv-wednesday">KTV Wednesday</li>
        </ul>
      </div>
      <div class="lessons">
        <div class="popup-intersection" id="popup-intersection"></div>
      </div>
    </div>
  `;
};
