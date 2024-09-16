const PopupMainTemplate = require('./main.template');
const TestimonialsTemplate = require('./testimonials.template');

class PopupMain {

	constructor(app, mod, container = '') {
		this.app = app;
		this.mod = mod;
		this.container = container;
		this.name = 'PopupMain';

		this.app.connection.on('popup-home-render-request', () => {
			this.render();
		});

		this.app.connection.on(
			'popup-lessons-render-request',
			(level = 'all') => {
				document.querySelector('.saito-main').innerHTML = '';
				document.querySelector('.saito-sidebar.right').innerHTML = '';
				this.mod.manager.render(level);
			}
		);

		this.app.connection.on('popup-lesson-render-request', (lesson_id) => {
			document.querySelector('.saito-main').innerHTML = '';
			document.querySelector('.saito-sidebar.right').innerHTML = '';
			this.mod.lesson.render(lesson_id);
		});

		this.app.connection.on('popup-vocab-render-request', (review_id) => {
			document.querySelector('.popup-content').innerHTML = '';
			this.mod.vocab.render(review_id);
		});

		this.app.connection.on('popup-review-render-request', (review_id) => {
			document.querySelector('.popup-content').innerHTML = '';
			this.mod.review.render(review_id);
		});
	}

	render() {

		if (!document.querySelector('.saito-container')) {
			this.app.browser.addElementToDom(PopupMainTemplate());
			this.app.browser.addElementToSelector(TestimonialsTemplate(), '.saito-main');
		} else {
			this.app.browser.replaceElementBySelector(PopupMainTemplate(), '.saito-container');
			document.querySelector(".saito-main").innerHTML = "";
			this.app.browser.addElementToSelector(TestimonialsTemplate(), '.saito-main');
		}

		this.attachEvents();
	}

	attachEvents() {

                document.querySelector('.popup-home').onclick = (e) => {
                        window.history.pushState({}, document.title, '/popup/lessons');
                        history.replaceState(null, null, ' ');
                        this.app.connection.emit('popup-home-render-request', 'all');
                };

                document.querySelector('.popup-lessons').onclick = (e) => {
                        window.history.pushState({}, document.title, '/popup/lessons');
                        history.replaceState(null, null, ' ');
                        this.app.connection.emit('popup-lessons-render-request', 'all');
                };

                document.querySelector('.popup-tools').onclick = (e) => {
                        window.history.pushState({}, document.title, '/popup/lessons');
                        history.replaceState(null, null, ' ');
                        this.app.connection.emit('popup-tools-render-request', 'all');
                };

                document.querySelector('.popup-notifications').onclick = (e) => {
                        window.history.pushState({}, document.title, '/popup/review');
                        history.replaceState(null, null, ' ');
                        this.app.connection.emit('popup-notifications-render-request', 'all');
                };

	}
}

module.exports = PopupMain;
