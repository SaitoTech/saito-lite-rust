const HistoryTemplate = require('./history.template');
const SaitoOverlay = require('./../../saito-overlay/saito-overlay');
const SaitoLoader = require('./../../saito-loader/saito-loader');

class MixinHistory {
	constructor(app, mod, container = '') {
		this.app = app;
		this.mod = mod;
		this.container = container;
		this.overlay = new SaitoOverlay(this.app, this.mod);
		this.history_data = null;
		this.loader = new SaitoLoader(this.app, this.mod, '#saito-history-loader');

		this.app.connection.on('saito-crypto-history-render-request', () => {
			this.render();
		});
	}
	async render() {
		let this_history = this;

		this.mod = this.app.wallet.returnPreferredCrypto();
		this.overlay.show(HistoryTemplate(this.app, this.mod, this));
		let balance = Number(this.mod.balance);

		this.loader.show();

		document.querySelector(
			'.mixin-txn-his-container .saito-table-body'
		).innerHTML = '';

		const locale = (window.navigator?.language) ? window.navigator?.language : 'en-US';
        const decimals = (typeof this.mod.decimals != 'undefined') ? this.mod.decimals : 8;
        const nf = new Intl.NumberFormat(locale, {
				          minimumFractionDigits: 0,
				          maximumFractionDigits: decimals
				        });

        let tmp_user_data = {};
        let tmp_identicon = {};
        let tmp_identifer = {};

        await this.mod.returnHistory(async (html) => {
			if (html != '') {
				document.querySelector(
	                '.mixin-txn-his-container .saito-table-body'
	            ).innerHTML = html;

        	} else {
	            document.querySelector(
	                '.mixin-txn-his-container .saito-table-body'
	            ).innerHTML =
	                `<p class="mixin-no-history">No account history found for ${this.mod.ticker}</p>`;
	        
	            document.querySelectorAll('.pagination-button').forEach(function(btn, key){
	                btn.classList.add('disabled');
                });
        	}
        });

		this.loader.remove();
		this.attachEvents();
	}

	attachEvents() {
		document.querySelectorAll('.history-copy-address').forEach(function(icon) { 
			icon.onclick = async (e) => {
				let public_key = e.target.getAttribute("data-address");
				await navigator.clipboard.writeText(public_key);
				e.target.classList.toggle('fa-copy');
				e.target.classList.toggle('fa-check');

				setTimeout(() => {
					e.target.classList.toggle('fa-copy');
					e.target.classList.toggle('fa-check');
				}, 800);
			};
		});

		const paginationNumbers = document.getElementById('pagination-numbers');
		const listItems = document.querySelectorAll(
			'.mixin-txn-his-container .saito-table-row'
		);
		const nextButton = document.getElementById('next-button');
		const prevButton = document.getElementById('prev-button');

		const paginationLimit = 10;
		const pageCount = Math.ceil(listItems.length / paginationLimit);
		let currentPage = 1;

		if (listItems.length == 0) {
			document
				.querySelector('.pagination-container')
				.classList.add('disabled');
		}

		const disableButton = (button) => {
			button.classList.add('disabled');
			//button.setAttribute("disabled", true);
		};

		const enableButton = (button) => {
			button.classList.remove('disabled');
			//button.removeAttribute("disabled");
		};

		const handlePageButtonsStatus = () => {
			if (currentPage === 1) {
				disableButton(prevButton);
			} else {
				enableButton(prevButton);
			}

			if (pageCount === currentPage) {
				disableButton(nextButton);
			} else {
				enableButton(nextButton);
			}
		};

		const handleActivePageNumber = () => {
			document
				.querySelectorAll('.pagination-number')
				.forEach((button) => {
					button.classList.remove('active');
					const pageIndex = Number(button.getAttribute('page-index'));
					if (pageIndex == currentPage) {
						button.classList.add('active');
					}
				});
		};

		const appendPageNumber = (index) => {
			const pageNumber = document.createElement('div');
			pageNumber.className = 'pagination-number';
			pageNumber.innerHTML = index;
			pageNumber.setAttribute('page-index', index);
			pageNumber.setAttribute('aria-label', 'Page ' + index);

			paginationNumbers.appendChild(pageNumber);
		};

		const getPaginationNumbers = () => {
			for (let i = 1; i <= pageCount; i++) {
				appendPageNumber(i);
			}
		};

		const setCurrentPage = (pageNum) => {
			currentPage = pageNum;

			handleActivePageNumber();
			handlePageButtonsStatus();

			const prevRange = (pageNum - 1) * paginationLimit;
			const currRange = pageNum * paginationLimit;

			listItems.forEach((item, index) => {
				item.classList.add('hidden');
				if (index >= prevRange && index < currRange) {
					item.classList.remove('hidden');
				}
			});
		};

		getPaginationNumbers();
		setCurrentPage(1);

		prevButton.addEventListener('click', () => {
			if (currentPage > 1) {
				setCurrentPage(currentPage - 1);
			}
		});

		nextButton.addEventListener('click', () => {
			if (currentPage < pageCount) {
				setCurrentPage(currentPage + 1);
			}
		});

		document.querySelectorAll('.pagination-number').forEach((button) => {
			const pageIndex = Number(button.getAttribute('page-index'));

			if (pageIndex) {
				button.addEventListener('click', () => {
					setCurrentPage(pageIndex);
				});
			}
		});

		if (this.mod.ticker == 'SAITO') {
			document.querySelector('.pagination-container').style.display =
				'none';
		}
	}

}

module.exports = MixinHistory;
