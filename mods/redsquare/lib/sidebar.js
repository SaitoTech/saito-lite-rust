const RedSquareSidebarTemplate = require('./sidebar.template');
const SaitoCalendar = require('../../../lib/saito/ui/saito-calendar/saito-calendar');

class RedSquareSidebar {
	constructor(app, mod, container = '') {
		this.app = app;
		this.mod = mod;
		this.container = container;
		this.name = 'RedSquareSidebar';
		this.calendar = new SaitoCalendar(
			app,
			mod,
			'.redsquare-sidebar-calendar'
		);
	}

	render() {
		if (document.querySelector('.redsquare-sidebar')) {
			this.app.browser.replaceElementBySelector(
				RedSquareSidebarTemplate(),
				'.redsquare-sidebar'
			);
		} else {
			this.app.browser.addElementToSelector(
				RedSquareSidebarTemplate(),
				this.container
			);
		}

		//
		// render calendar
		//
		this.calendar.render();

		//
		// appspace modules
		//
		this.app.modules.renderInto('.redsquare-sidebar');

		this.attachEvents();
	}

	attachEvents() {
		var scrollableElement = document.querySelector('.saito-container');
		var sidebar = document.querySelector('.saito-sidebar.right');
		var scrollTop = 0;
		var stop = 0;

		scrollableElement.addEventListener('scroll', (e) => {
			let newScrollTop = scrollableElement.scrollTop;
			let maxScroll = sidebar.clientHeight - window.innerHeight + 70;

			if (maxScroll > 0) {
				if (scrollTop < newScrollTop) {
					if (newScrollTop - stop > maxScroll) {
						stop =
							window.innerHeight -
							70 -
							sidebar.clientHeight +
							newScrollTop;
					}
				} else {
					if (stop > newScrollTop) {
						stop = newScrollTop;
					}
				}
			} else {
				//Keep top of side bar fixed relative to viewPort
				stop = newScrollTop;
			}

			sidebar.style.top = stop + 'px';
			scrollTop = newScrollTop;
		});
	}
}

module.exports = RedSquareSidebar;
