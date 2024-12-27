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

		this.app.connection.on('popup-lessons-render-request', (level = 'all') => {
				document.querySelector('.saito-main').innerHTML = '';
				document.querySelector('.saito-sidebar.right').innerHTML = '';
				this.mod.manager.render(level);
			}
		);

		try {
		this.app.connection.on('popup-lesson-render-request', (lesson_id) => {
			document.querySelector('.saito-main').innerHTML = '';
			document.querySelector('.saito-sidebar.right').innerHTML = '';
			this.mod.lessonui.render(lesson_id);
		});
		} catch (err) {}

		try {
		this.app.connection.on('popup-vocab-render-request', (review_id=0, offset=0) => {
			document.querySelector('.saito-main').innerHTML = '';
			document.querySelector('.saito-sidebar.right').innerHTML = '';
			this.mod.vocab.render(review_id, offset);
		});
		} catch (err) {}

	}

	render() {

		if (!document.querySelector('.saito-container')) {
			this.app.browser.addElementToDom(PopupMainTemplate(this.mod));
			this.app.browser.addElementToSelector(TestimonialsTemplate(), '.saito-main');
		} else {
			this.app.browser.replaceElementBySelector(PopupMainTemplate(this.mod), '.saito-container');
			document.querySelector(".saito-main").innerHTML = "";
			this.app.browser.addElementToSelector(TestimonialsTemplate(), '.saito-main');
		}

		this.attachEvents();
	}

	attachEvents() {

		try {
                document.querySelector('.popup-home').onclick = (e) => {
                        window.history.pushState({}, document.title, '/popup/lessons');
                        history.replaceState(null, null, ' ');
                        this.app.connection.emit('popup-home-render-request', 'all');
                };
		} catch (err) {}

		try {
                document.querySelector('.popup-lessons').onclick = (e) => {
                        window.history.pushState({}, document.title, '/popup/lessons');
                        history.replaceState(null, null, ' ');
                        this.app.connection.emit('popup-lessons-render-request', 'all');
                };
		} catch (err) {}

		try {
                document.querySelector('.popup-vocab').onclick = (e) => {
                        window.history.pushState({}, document.title, '/popup/review');
                        history.replaceState(null, null, ' ');
                        //this.app.connection.emit('popup-vocabulary-render-request', 'all');
                        this.app.connection.emit('popup-vocab-render-request', ("", 0));
                };
		} catch (err) {}

	}
}

module.exports = PopupMain;
