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

		this.app.connection.on('saito-crypto-history-render-request', (obj) => {
			this.render();
		});
	}
	async render() {
		let this_history = this;

		this.mod = await this.app.wallet.returnPreferredCrypto();
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
		
		// await this.mod.returnHistory(this.mod.asset_id, 1000, async (d) => {
		// 	this.history_data = d;

		// 	console.log('history data:', d);

		// 	if (d === false) {
		// 		document.querySelector(
		// 			'.mixin-txn-his-container .saito-table-body'
		// 		).innerHTML = `
	    //   		<a target="_blank" href="/explorer" class="saito-history-msg">
	    //   			View SAITO history on block explorer 
	    //   			<i class="fa-solid fa-arrow-up-right-from-square"></i>
	    //   		</a>`;
		// 	} else {
		// 		let html = '';
		// 		if (d.length > 0) {
		// 			for (let i = (d.length - 1); i >= 0; i--) {
		// 				let row = d[i];
		// 				let created_at = row.created_at
		// 					.slice(0, 19)
		// 					.replace('T', ' ');

		// 				//Parse it as UTC time
		// 				let datetime = new Date(created_at + 'Z');
		// 				let amount = Number(row.amount);
		// 				let type = (amount > 0) ? 'Deposit' : 'Withdraw';

		// 				if (i < d.length-1) {
		// 					if (Number(d[i+1].amount) > 0) {
		// 						balance = balance - Math.abs(Number(d[i+1].amount));
		// 					} else {
		// 						balance = balance + Math.abs(Number(d[i+1].amount));
		// 					}
		// 				}

		// 		        let balance_as_float = parseFloat(balance);
				       	
		// 		       	let opponnent = (typeof d[i].opponent_id != 'undefined')  ? 
		// 		       	d[i].opponent_id : null;
				       
		// 		       	let sender_html = '';
		// 		       	if (opponnent != null && opponnent != '') {
		// 		       		// Showing details for internal mixin transaction details

		// 		       		let user_data = null;
		// 		       		if (opponnent in tmp_user_data) {
		// 		       			user_data = tmp_user_data[opponnent];
		// 		       		} else {
		// 		       			user_data = await this.mod.getAddressByUserId(opponnent, this.mod.asset_id);
		// 		       			tmp_user_data[opponnent] = user_data;
		// 		       		}

		// 		       		if (user_data != null) {
		// 		       			let public_key = user_data.publickey;
		// 		       			let address = user_data.address;

		// 		       			let identicon = null;
		// 			       		if (public_key in tmp_identicon) {
		// 			       			identicon = tmp_identicon[public_key];
		// 			       		} else {
		// 			       			identicon = this_history.app.keychain.returnIdenticon(public_key);
		// 		       				tmp_identicon[public_key] =  identicon;
		// 			       		}

		// 			       		let username = null;
		// 			       		if (public_key in tmp_identifer) {
		// 			       			username = tmp_identifer[public_key];
		// 			       		} else {
		// 			       			username = this_history.app.keychain.returnIdentifierByPublicKey(public_key, true);
		// 					    	tmp_identifer[public_key] = username;
		// 			       		}

		// 		       			sender_html = `<div class="saito-identicon-container">
		// 							        <img class="saito-identicon" src="${identicon}">  
		// 							        <div class="history-address-container">
		// 							          <div class="history-to-publickey">${username}</div>
		// 							          ${(address != '') ? `
		// 							          	 <div class="history-to-address-container">
		// 										  <div class="history-to-address">${address}</div>
		// 										  <i class="history-copy-address fas fa-copy"
		// 										  data-address="${address}">
		// 										  </i>
		// 										</div>
		// 							          ` : ``}
		// 							        </div>
		// 							      </div>`;
		// 		       		} 
		// 		       	} else {
		// 		       		// Mixin sdk throwing error when fetching tx details.
		// 		       		// Temproraily redirecting users to mixin explorer for
		// 		       		// external transaction details
		// 		       		let trans_hash = d[i].transaction_hash;
		// 	       			sender_html = `<a class="history-tx-link" href="https://viewblock.io/mixin/tx/${trans_hash}"
		// 	       							target="_blank">
		// 	       								<div class="history-tx-id">${trans_hash}</div>
		// 	       								<i class="fa-solid fa-arrow-up-right-from-square"></i>
		// 	       							</a>`;
		// 	       		}

		// 				html += `<div class='saito-table-row'>
	    //                     <div class='mixin-his-created-at'>${created_at}</div>
	    //                     <div>${type}</div>
	    //                     <div class='${type.toLowerCase()}'>${amount} ${this_history.mod.ticker}</div>
	    //                     <div>${(nf.format(balance_as_float)).toString()} ${this_history.mod.ticker}</div>
	    //                     <div>${sender_html}</div>
	    //                   </div>`; 
		// 			}

		// 			document.querySelector(
		// 				'.mixin-txn-his-container .saito-table-body'
		// 			).innerHTML += html;
		// 			this.loader.remove();
		// 		} else {
		// 			document.querySelector(
		// 				'.mixin-txn-his-container .saito-table-body'
		// 			).innerHTML =
		// 				`<p class="mixin-no-history">No account history found for ${this.mod.ticker}</p>`;
				
		// 			document.querySelectorAll('.pagination-button').forEach(function(btn, key){
		// 				btn.classList.add('disabled');
		// 			});
		// 		}

		// 	}

		// });
	


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
