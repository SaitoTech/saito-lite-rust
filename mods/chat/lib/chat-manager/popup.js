const SaitoInput = require('../../../../lib/saito/ui/saito-input/saito-input');
const ChatPopupTemplate = require('./popup.template');
const ChatUserMenu = require('./../overlays/chat-user-menu');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');
const debounce = require('lodash/debounce');

class ChatPopup {
	constructor(app, mod, container = '') {
		this.app = app;
		this.mod = mod;

		this.container = container;
		this.input = null; //new SaitoInput(this.app, this.mod, `#chat-popup-${this.group.id} .chat-footer`);
		this.manually_closed = false;
		this.is_rendered = false;

		this.group = null;

		this.is_scrolling = null;

		this.overlay = new SaitoOverlay(app, mod);

		this.dimensions = {};

		this.events_attached = false;

		this.callbacks = {};

		this.closeFn = null;

		app.connection.on('chat-remove-fetch-button-request', (group_id) => {
			if (this.group?.id === group_id) {
				this.no_older_messages = true;
				if (
					document.querySelector(
						'#chat-popup-' + this.group.id + ' #load-older-chats'
					)
				) {
					document
						.querySelector(
							'#chat-popup-' +
								this.group.id +
								' #load-older-chats'
						)
						.remove();
				}
			}
		});

		app.connection.on('chat-popup-scroll-top-request', (group_id) => {
			if (this.group?.id === group_id) {
				let popup_qs = '#chat-popup-' + this.group.id;

				if (document.querySelector(popup_qs + ' .chat-body')) {
					document
						.querySelector(popup_qs + ' .chat-body')
						.scroll(0, 0);
				}
			}
		});

		app.connection.on('stun-data-channel-open', (pkey) => {
			let target_id = this.mod.createGroupIdFromMembers([
				pkey,
				this.mod.publicKey
			]);
			if (target_id === this.group?.id) {
				if (this.is_rendered) {
					this.forceRender();
				}
			}
		});

		app.connection.on('stun-data-channel-close', (pkey) => {
			let target_id = this.mod.createGroupIdFromMembers([
				pkey,
				this.mod.publicKey
			]);
			if (target_id === this.group?.id) {
				if (this.is_rendered) {
					this.forceRender();
				}
			}
		});

		app.connection.on('chat-popup-refresh-request', (group) => {
			if (this.group.id == group.id) {
				let title = 'chat-group-' + this.group.id;
				let dm = group.members.length == 2 && !group?.member_ids;
				if (dm) {
					for (let i = 0; i < group.members.length; i++) {
						if (group.members[i] !== mod.publicKey) {
							dm_counterparty = group.members[i];
						}
					}
				}

				this.app.browser.replaceElementById(
					`<div id="chat-group-${group.id}" class="chat-group${
						dm ? ' saito-address' : ''
					}" data-id="${dm ? dm_counterparty : group.name}">${
						group.name
					}</div>`,
					title
				);

				if (this.is_rendered) {
					this.render();
				}
			}
		});
	}

	remove() {
		let popup_qs = '#chat-popup-' + this.group.id;
		if (document.querySelector(popup_qs)) {
			document.querySelector(popup_qs).remove();
		}

		this.is_rendered = false;
		this.is_scrolling = null;
		this.events_attached = false;
		this.app.connection.emit('chat-manager-render-request');
	}

	activate(){

		if (!this.group?.id){
			return;
		}

		let popup_qs = '#chat-popup-' + this.group.id;

		document.querySelectorAll('.chat-container').forEach((el) => {
			el.classList.remove('active');
		});

		document.querySelector(popup_qs).classList.add('active');
	}

	forceRender() {
		let popup_qs = '#chat-popup-' + this.group.id;
		let chatPopup = document.querySelector(popup_qs);

		if (!chatPopup || this.container) {
			this.render();
			return;
		}

		let active = chatPopup.classList.contains('active');
		let sizing = '';
		if (chatPopup.classList.contains('minimized')) {
			sizing = 'minimized';
		}
		if (chatPopup.classList.contains('maximized')) {
			sizing = 'maximized';
		}

		if (!sizing) {
			this.savePopupDimensions(chatPopup);
		}

		this.remove();
		this.render();

		chatPopup = document.querySelector(popup_qs);

		if (active) {
			chatPopup.classList.add('active');
		}

		if (sizing) {
			chatPopup.classList.add(sizing);
		} else {
			this.restorePopup(chatPopup);
		}
	}

	//
	// The chat popup has subcomponents, but only the body gets re-rendered
	//
	render() {
		let this_self = this;
		//
		// exit if group unset
		//
		if (this.group == null) {
			return 0;
		}

		//
		// exit if manually minimized
		//
		if (this.manually_closed) {
			return 0;
		}

		this.app.connection.emit('chat-manager-opens-group', this.group);

		//
		// our query selector
		//
		let popup_id = 'chat-popup-' + this.group.id;
		let popup_qs = '#' + popup_id;

		if (!this.input) {
			this.input = new SaitoInput(
				this.app,
				this.mod,
				`#chat-popup-${this.group.id} .chat-footer`,
				popup_id
			);

			if (
				this.group.name == this.mod.communityGroupName ||
				this.group?.member_ids ||
				this.group.members.length > 2
			) {
				this.input.enable_mentions = false;
			}

			if (this.container) {
				this.input.display = 'medium';
			} else {
				this.input.display = 'small';
			}
		}

		//
		// calculate some values to determine position on screen...
		//
		let x_offset = 0;
		let popups_on_page = 0;

		// Use the chat manager to locate the first popup
		let cm = document.querySelector(".chat-manager");
		if (document.getElementById("chat-manager-overlay")){
			cm = null;
		}
		let l2r = false;
		if (cm) {
			let cm_stats = cm.getBoundingClientRect();
			x_offset = cm_stats.right - 360;
			if (cm_stats.left * 2 < window.innerWidth){
				l2r = true;
			}
		} else {
			x_offset = window.innerWidth - 375;
		}

		// We want to stack multiple chat popups next to each other
		document.querySelectorAll('.chat-container').forEach((el) => {
			popups_on_page++;
			var rect = el.getBoundingClientRect();
			if (l2r){
				if (rect.left > x_offset) {
					x_offset = rect.left;
				}
			}else{
				if (rect.left < x_offset) {
					x_offset = rect.left;
				}
			}
		});

		//
		// insert or replace popup on page
		//
		if (document.querySelector(popup_qs)) {
			let html = `<div class="chat-body">`;

			//Temporarily disable this...
			//if (!this?.no_older_messages) {
			//	html += `<div id="load-older-chats" class="saito-chat-button" data-id="${this.group.id}">fetch earlier messages</div>`;
			//}

			html += this.mod.returnChatBody(this.group.id) + '</div>';
			this.app.browser.replaceElementBySelector(
				html,
				popup_qs + ' .chat-body'
			);
		} else {
			if (this.container && !document.querySelector(this.container)) {
				console.warn('Chat popup has non-existent specified container');
				this.container = '';
			}
			if (this.container && document.querySelector('.chat-static')) {
				this.app.browser.replaceElementBySelector(
					ChatPopupTemplate(
						this.app,
						this.mod,
						this.group,
						this.container
					),
					'.chat-static'
				);
			} else {
				this.app.browser.addElementToSelectorOrDom(
					ChatPopupTemplate(
						this.app,
						this.mod,
						this.group,
						this.container
					),
					this.container
				);
			}


			if (popups_on_page){
				if (l2r) {
					x_offset += 90;						
				} else {
					x_offset -= 90;	
				}
			}
			
			// Keep popup on screen
			x_offset = Math.min(window.innerWidth - 360, x_offset);
			x_offset = Math.max(0, x_offset);
			
			//
			// now set left-position of popup
			//
			if (!this.container /*&& popups_on_page > 0*/) {
				let obj = document.querySelector(popup_qs);
				obj.style.left = x_offset + 'px';
			}

			// add call icon, ignore if community chat
			let mods = this.app.modules.mods;
			if (
				this.group.name != this.mod.communityGroupName &&
				this.group.members.length == 2 &&
				!this.group?.member_ids
			) {
				let dm_counterparty;
				for (let i = 0; i < this.group.members.length; i++){
					if (this.group.members[i] !== this.mod.publicKey) {
						dm_counterparty = this.group.members[i];
					}
				}

				let index = 0;
				for (const mod of mods) {
					let item = mod.respondTo('chat-actions', {
						publicKey: dm_counterparty
					});
					if (item instanceof Array) {
						item.forEach((j) => {
							let id = `chat_action_item_${index}`;
							this_self.callbacks[id] = j.callback;
							this_self.addChatActionItem(j, id);
							index++;
						});
					} else if (item != null) {
						let id = `chat_action_item_${index}`;
						this_self.callbacks[id] = item.callback;
						this_self.addChatActionItem(item, id);
					}
					index++;
				}
			}

			if (document.querySelector(popup_qs + ' .chat-action-menu')) {
				document.querySelector(
					popup_qs + ' .chat-action-menu'
				).onclick = (e) => {
					let chatMenu = new ChatUserMenu(
						this.app,
						this.mod,
						this.group
					);
					chatMenu.render();
				};
			}

			//
			// inputs
			//
			this.input.render(!this.app.browser.isMobileBrowser());
		}

		//
		// fancy scrolling!
		//
		let chatBody = document.querySelector(popup_qs + ' .chat-body');
		if (chatBody) {
			let new_render = !this.is_rendered;
			
			//console.info('*** CHAT render: ',this.group.unread,new_render);
			
			if (this.is_scrolling) {
				//console.info('CHAT render: keep position');
				chatBody.scroll({ top: this.is_scrolling, left: 0 });
				this.updateNotification(this.group.unread);
			} else {
				let anchor = this.group?.last_read_message
					? document.querySelector(
							popup_qs +
								' .message-' +
								this.group.last_read_message
					  )
					: null;
				
				if (anchor && new_render && this.group.unread > 2) {
					//console.info(	'CHAT render: Scroll to anchor -- ' +this.group.last_read_message);
					anchor.scrollIntoView(false);
					this.updateNotification(this.group.unread);
				} else {
					//console.info('CHAT render: scroll to bottom');
					chatBody.scroll(0, 1000000000);
				} 
			}
		}

		//
		// attach events
		//
		this.attachEvents();

		this.is_rendered = true;
		return 1;
	}

	updateNotification(count) {
		let popup_id = 'chat-popup-' + this.group.id;
		let popup_qs = '#' + popup_id;

		if (
			document.querySelector(
				popup_qs + ' .saito-notification-dot .new-message-count'
			)
		) {
			let notification = document.querySelector(
				popup_qs + ' .saito-notification-dot .new-message-count'
			);
			notification.innerText = count;
			if (count == 0) {
				document
					.querySelector(popup_qs + ' .saito-notification-dot')
					.remove();
			}
		} else {
			if (count == 0) {
				return;
			}
			this.app.browser.addElementToSelector(
				`<div class="saito-notification-dot"><div class="new-message-count">${this.group.unread}</div><i class="fa-solid fa-down-long"></i></div>`,
				popup_qs
			);
		}

		//update notification counts in the chat manager
		this.app.connection.emit('chat-manager-render-request');
	}

	attachEvents() {
		let app = this.app;
		let mod = this.mod;
		let group_id = this.group.id;
		let header_id = 'chat-header-' + this.group.id;

		//
		// our query selector
		//
		let popup_id = 'chat-popup-' + this.group.id;
		let popup_qs = '#chat-popup-' + this.group.id;
		let resize_id = 'chat-resize-' + this.group.id;
		let header_qs = '#chat-header-' + this.group.id;
		let this_self = this;

		let chatPopup = document.querySelector(popup_qs);

		if (!chatPopup) {
			console.error('No Chat Popup to attach events to');
			return;
		}

		// add reply functionality
		document
			.querySelectorAll(`${popup_qs} .saito-userline-reply .chat-reply`)
			.forEach((el) => {
				el.addEventListener('click', (e) => {
					let src_obj = el.parentElement.parentElement.parentElement;

					let quote = '';

					for (let child of el.parentElement.parentElement
						.childNodes) {
						if (child.nodeType === 3) {
							quote += child.textContent.replace(
								/^\s+|\s+$/g,
								'<br>'
							);
						}
						//We may want to also pull inner text from element nodes as long as they aren't the hidden buttons
						if (
							child.nodeType === 1 &&
							child.nodeName !== 'BLOCKQUOTE'
						) {
							quote += child.innerText.replace(
								/^\s+|\s+$/g,
								'<br>'
							);
						}
					}

					if (quote.length > 30) {
						quote = '...' + quote.slice(-30);
					}

					let quoteHTML = `<blockquote href="${el.parentElement.dataset.href}">${quote}</blockquote>`;
					this.input.insertQuote(quoteHTML, src_obj.dataset.id);

					this.input.focus(true);
				});
			});

		document
			.querySelectorAll(`${popup_qs} .saito-userline-reply .chat-copy`)
			.forEach((el) => {
				el.addEventListener('click', (e) => {
					let icon_element = e.currentTarget.firstElementChild;
					if (icon_element) {
						icon_element.classList.toggle('fa-copy');
						icon_element.classList.toggle('fa-check');

						setTimeout(() => {
							icon_element.classList.toggle('fa-copy');
							icon_element.classList.toggle('fa-check');
						}, 800);
					}

					let parent = el.parentElement.parentElement;
					let text = '';

					for (let child of parent.childNodes) {
						if (child.nodeType === 3) {
							text += child.textContent;
						}
						//We may want to also pull inner text from element nodes as long as they aren't the hidden buttons
						if (child.nodeType === 1) {
							if (
								child.classList.contains('saito-treated-link')
							) {
								text += child.href;
							} else if (
								!child.classList.contains(
									'saito-userline-reply'
								) &&
								child.nodeName !== 'BLOCKQUOTE'
							) {
								text += child.innerText;
							}
						}
					}

					text = text.replace(/^\s+|\s+$/g, '');

					navigator.clipboard.writeText(text);
				});
			});

		document
			.querySelectorAll(`${popup_qs} .saito-userline-reply .chat-like`)
			.forEach((el) => {
				el.addEventListener('click', async (event) => {
					let parentElement = event.target.closest(
						'.saito-userline-reply'
					);

					// Retrieve the 'data-id' attribute from the found parent element
					let sig = parentElement.getAttribute('data-id');
					let target = parentElement
						.closest('.saito-userline')
						.getAttribute('data-id');
					const newtx = await this.mod.createChatLikeTransaction(
						this.group,
						sig,
						target
					);
					if (newtx) {
						mod.hasSeenTransaction(newtx);
						mod.receiveChatLikeTransaction(newtx);
					}
				});
			});


		if (chatPopup.querySelector(".fix-me.fa-unlock")){
			chatPopup.querySelector(".fix-me.fa-unlock").onclick = (e) => {
				this.app.connection.emit("encrypt-reset-key-exchange", e.currentTarget.dataset.id); 
			}
		}


		//
		// Click on a block quote to see original message being replied to
		//
		document.querySelectorAll(`${popup_qs} blockquote`).forEach((el) => {
			el.onclick = (e) => {
				let href = el.getAttribute('href');

				let myAnchor = document.querySelector(popup_qs + ' #' + href);
				if (myAnchor) {
					myAnchor.scrollIntoView({
						block: 'end',
						inline: 'nearest',
						behavior: 'smooth'
					});
				}
			};
		});

		//
		// At top of chat body, check for older chat messages
		//
		if (document.querySelector(popup_qs + ' #load-older-chats')) {
			document.querySelector(popup_qs + ' #load-older-chats').onclick =
				async (e) => {
					await this.mod.getOlderTransactions(
						e.currentTarget.dataset.id
					);
				};
		}

		//
		// While scrolled up, new messages below... scroll to bottom
		//
		if (document.querySelector(popup_qs + ' .saito-notification-dot')) {
			document.querySelector(
				popup_qs + ' .saito-notification-dot'
			).onclick = (e) => {

				if (chatPopup.classList.contains('minimized')) {
					this.restorePopup(chatPopup);
				}
				
				document
					.querySelector(popup_qs + ' .chat-body')
					.lastElementChild.scrollIntoView({ behavior: 'smooth' });
			};
		}

		//
		// Remove scroll notification dynamically
		//
		let myBody = document.querySelector(popup_qs + ' .chat-body');
		if (myBody && myBody?.lastElementChild) {
			const pollScrollHeight = () => {
				let lastChild = myBody.lastElementChild;
				if (lastChild.querySelector('.saito-user .saito-userline')) {
					lastChild =
						myBody.lastElementChild.lastElementChild
							.lastElementChild;
				}

				if (
					lastChild.getBoundingClientRect().top >
					myBody.getBoundingClientRect().bottom
				) {
					this.is_scrolling = myBody.scrollTop;
				} else {
					this.is_scrolling = null;
					this.group.unread = 0;
					this.updateNotification(0);
				}

				//Check position of new messages...
				let next_new = document.querySelector(
					popup_qs + ' .chat-body .new-message'
				);
				while (
					next_new &&
					next_new.getBoundingClientRect().top <
						myBody.getBoundingClientRect().bottom
				) {
					//the message has scrolled into view
					next_new.classList.remove('new-message');
					this.group.unread = Math.max(0, this.group.unread - 1);
					this.group.last_read_message = next_new.dataset.id;
					this.updateNotification(this.group.unread);
					next_new = document.querySelector(
						popup_qs + ' .chat-body .new-message'
					);
				}
				this.mod.saveChatGroup(this.group);
			};

			pollScrollHeight();
			myBody.addEventListener('scroll', debounce(pollScrollHeight, 100));
		}

		//
		// Click images to view full size
		//
		document.querySelectorAll(`.img-prev`).forEach(function (img, key) {
			img.onclick = (e) => {
				e.preventDefault();

				let img = e.currentTarget;
				let src = img.getAttribute('src');

				this_self.overlay.show(
					`<img class="chat-popup-img-enhanced" src="${src}" >`
				);
			};
		});

		/* 
      avoids re-adding of events to same element, to fix issues with resizing 
      The following events apply to the whole popup, its header or its footer, which
      don't get rerendered... 
    */
		if (this.events_attached == false) {
			this.events_attached = true;
		} else {
			return;
		}


		if (this.app.browser.isMobileBrowser()){
			window.history.pushState("chat", "");
			this.closeFn = window.onpopstate;
			window.onpopstate = (e) => {
				this.close();
			}
		}

		if (this.group.name != this.mod.communityGroupName) {
			document.querySelectorAll('.chat-action-item').forEach((menu) => {
				let id = menu.getAttribute('id');
				if (id && this_self.callbacks[id]) {
					let callback = this_self.callbacks[id];
					menu.onclick = (e) => {
						callback(app, id);
					};
				}
			});
		}

		if (!this.mod.browser_active && !this.app.browser.isMobileBrowser()) {
			//
			// make draggable and resizable, but no in mobile/main - page
			//
			this.app.browser.makeDraggable(popup_id, header_id, true);
			this.app.browser.makeResizeable(popup_qs, header_qs, group_id);
		}


		chatPopup.onmousedown = this.activate;

		//
		// minimize
		let chat_bubble = document.querySelector(
			`${popup_qs} .chat-header .chat-minimizer-icon`
		);
		let mximize_icon = document.querySelector(
			`${popup_qs} .chat-header .chat-maximizer-icon`
		);

		if (chat_bubble && mximize_icon /*&& !this.mod.chat_manager_overlay*/) {
			chat_bubble.onclick = (e) => {
				if (chatPopup.classList.contains('minimized')) {
					this.restorePopup(chatPopup);
				} else {
					if (chatPopup.classList.contains('maximized')) {
						chatPopup.classList.remove('maximized');
					} else {
						//only update if not also maximized
						this.savePopupDimensions(chatPopup);
					}

					//Undo any drag styling
					chatPopup.style.top = '';
					chatPopup.style.left = '';

					//Return to default bottom=0 from css
					chatPopup.style.bottom = '';

					//Undo any manual resizing
					chatPopup.style.height = '';

					if (
						parseInt(window.getComputedStyle(chatPopup).width) > 360
					) {
						chatPopup.style.width = '';
					}

					chatPopup.classList.add('minimized');
					chatPopup.classList.remove('active');
					chatPopup.querySelector('.resize-icon').style.display =
						'none';
				}
			};

			//
			// maximize

			mximize_icon.onclick = (e) => {
				if (chatPopup.classList.contains('maximized')) {
					this.restorePopup(chatPopup);
				} else {
					if (chatPopup.classList.contains('minimized')) {
						chatPopup.classList.remove('minimized');
					} else {
						this.savePopupDimensions(chatPopup);
					}

					//Undo any drag styling
					chatPopup.style.top = '';
					chatPopup.style.left = '';

					chatPopup.style.width = '750px';
					chatPopup.style.height = window.innerHeight + 'px';

					//Return to default bottom=0 from css
					chatPopup.style.bottom = '';

					// decide to maximize to left or right
					if (
						this.dimensions.left < Math.floor(window.innerWidth / 2)
					) {
						chatPopup.style.right = window.innerWidth - 750 + 'px';
					} else {
						chatPopup.style.right = '0px';
					}

					chatPopup.classList.add('maximized');
					chatPopup.querySelector('.resize-icon').style.display =
						'none';
				}
			};
		}

		//
		// close
		//
		document.querySelector(
			`${popup_qs} .chat-header .chat-container-close`
		).onclick = (e) => {
			this.close();
		};

		document.querySelector(
			`${popup_qs} .chat-header .chat-mobile-back`
		).onclick = (e) => {
			this.close();
		};


		//
		// submit
		//
		this.input.callbackOnReturn = async (message) => {
			if (message.trim() == `${this.input.quote}`) {
				console.log('Reply with no content');
				return;
			}

			let new_msg = message
				.replaceAll('&nbsp;', ' ')
				.replaceAll('<br>', ' ');
			if (new_msg.trim() == '') {
				return;
			}

			let newtx = await mod.createChatTransaction(
				group_id,
				message,
				this.input.getMentions()
			);
			this.input.clear();

			if (newtx) {
				await mod.receiveChatTransaction(newtx);
			}

			if (document.querySelector(popup_qs + ' .chat-body')) {
				this.is_scrolling = null;
				document
					.querySelector(popup_qs + ' .chat-body')
					.scroll(0, 1000000000);
			}
		};

		this.input.callbackOnUpload = async (result, confirm = false) => {
			let imageUrl;

			if (typeof result === 'string') {
				if (!result.includes('giphy.gif')){
					let response = await fetch(result);
					let blob = await response.blob();
					imageUrl = URL.createObjectURL(blob);
				} else {
					imageUrl = result;
				}
			} else if (result instanceof File) {
				imageUrl = URL.createObjectURL(result);
			} else {
				throw new Error('Invalid filesrc type');
			}

			let resizedImageUrl = imageUrl;
			if (!imageUrl.includes('giphy.gif')){
				console.log("************* Resize Image!");
				resizedImageUrl = await app.browser.resizeImg(imageUrl); // (img, dimensions, quality)
			}

			let img = document.createElement('img');
			img.classList.add('img-prev');
			img.src = resizedImageUrl;

			this.overlay.show(
				`<div class="chat-popup-img-overlay-box">
				   <img class="chat-popup-img-enhanced" src="${resizedImageUrl}" >
				   <button id="photo-preview-upload" class="saito-button-primary">Upload</button>
				</div>`
			);

			document.getElementById("photo-preview-upload").onclick = async (e) => {

				this.overlay.close();
				let msg = img.outerHTML;
				let typed_msg = this.input.getInput();
				await this.input.callbackOnReturn(msg);
				this.input.setInput(typed_msg);
			}

			document.getElementById("photo-preview-upload").focus();			

		};

		//
		// submit (button)
		//
		document.querySelector(
			`${popup_qs} .chat-footer .chat-input-submit`
		).onclick = (e) => {
			this.input.callbackOnReturn(this.input.getInput(false));
		};

		//
		// drag and drop images into chat window
		//

		app.browser.addDragAndDropFileUploadToElement(
			popup_id,
			this.input.callbackOnUpload,
			false
		); // false = no drag-and-drop image click
	}

	addChatActionItem(item, id) {
		let popup_qs = '#chat-popup-' + this.group.id;

		let html = `<div id="${id}" class="chat-action-item" title="${item.text}">
				<i class="${item.icon}"></i>
			</div>`;

		this.app.browser.prependElementToSelector(
			html,
			`${popup_qs} .chat-actions`
		);
	}

	restorePopup(chatPopup) {
		chatPopup.classList.remove('minimized');
		chatPopup.classList.remove('maximized');

		this.activate();

		//console.log("Restore: ", this.dimensions);
		if (Object.keys(this.dimensions).length > 0) {
			chatPopup.style.width = this.dimensions.width + 'px';
			chatPopup.style.height = this.dimensions.height + 'px';

			if (chatPopup.style.left) {
				//Moved after minimized or maximized
				chatPopup.style.left = '';
				chatPopup.style.top = '';
			}

			chatPopup.style.bottom = this.dimensions.bottom + 'px';
			chatPopup.style.right = this.dimensions.right + 'px';
		}

		this.dimensions = {};
		if (chatPopup.querySelector('.resize-icon')){
			chatPopup.querySelector('.resize-icon').style.display = 'block';	
		}
		
	}

	savePopupDimensions(chatPopup) {
		//
		// You need to copy into a new object!!!!
		//
		let obj = chatPopup.getBoundingClientRect();
		this.dimensions.width = obj.width;
		this.dimensions.height = obj.height;
		this.dimensions.left = obj.left;
		this.dimensions.top = obj.top;
		this.dimensions.bottom = window.innerHeight - obj.bottom;
		this.dimensions.right = window.innerWidth - obj.right;

		//console.log("Save: ", this.dimensions);

		if (chatPopup.style.top) {
			// Will revert to bottom/right coordinates for animation to be anchored
			chatPopup.style.bottom = this.dimensions.bottom + 'px';
			chatPopup.style.right = this.dimensions.right + 'px';
		}
	}

	close(){
		this.manually_closed = true;
		this.remove();
		this.app.storage.saveOptions();
		window.onpopstate = this.closeFn;
		this.close_function = null;
	}
}

module.exports = ChatPopup;
