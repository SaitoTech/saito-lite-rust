const GameMenuTemplate = require('./game-menu.template');
const GameMenuIconTemplate = require('./game-menu-icon.template');
const GameMenuOptionTemplate = require('./game-menu-option.template');
const InviteLink = require('./../modals/saito-link/saito-link');
const jsonTree = require('json-tree-viewer');
const SaitoOverlay = require('./../saito-overlay/saito-overlay');

/**
 * A customizable menu system that sits along top of screen with click to open drop down lists of submenus
 * Menu actions are defined by callbacks passed through options objects and seperately stored in properties: icons, options, sub_options
 * this.options contains the top level menu items which (by default) open to display a list of submenu options
 * this.sub_options contains the details of the second and third tier submenu options (third tier submenus are contained as a array of objects within the submenu object)
 * this.icons are direct action items in the top-level menu
 *
 * GameMenu is included in GameTemplate and accessible through .menu
 * The menu should be defined (through addMenuOption, addSubMenuOption, and addMenuIcon) in the game module's initializeHTML
 * As usual, render and attachEvents must also be called in the module.
 */
class GameMenu {
	/**
	 * @param app - the Saito application
	 * @param mod - reference to the game module
	 */
	constructor(app, mod) {
		this.app = app;
		this.game_mod = mod;

		this.icons = [];
		this.options = [];
		this.sub_options = [];
		this.sub_menu_open = '';
		this.initialized = 0;
		this.debug = true;
		this.overlay = new SaitoOverlay(app, mod);
		this.lock = null;
		this.container = '#saito-header';
	}

	/**
	 * Creates the Menu in the DOM if it doesn't already exist
	 * Menu must be defined using the other functions prior to rendering!
	 */
	render() {
		let menu_self = this;

		if (this.initialized == 0) {
			// *************************************************
			this.addMenuOption('game-share', 'Share');

			// Swap these out when ready to promote game recording and game casting

			/*this.addSubMenuOption('game-game', {
				text: 'Share',
				id: 'game-share',
				class: 'game-share',
			});*/
			// *************************************************

			for (const menMod of this.app.modules.respondTo('game-menu', this.game_mod)) {
				let menu = menMod.respondTo('game-menu', this.game_mod);

				/* 
			for potential initialization functions, might be used to render a menu and  an array of submenu options
			*/
				if (menu.init) {
					menu.init(this.app, this.game_mod);
				}

				if (menu?.id && menu?.text) {
					this.addMenuOption(menu.id, menu.text);
				}

				for (let sub_menu of menu.submenus) {
					this.addSubMenuOption(sub_menu.parent, sub_menu);
				}
			}

			this.initialized = 1;

			//Insert Standard functions here
			if (this.game_mod.opengame) {
				this.addSubMenuOption('game-share', {
					text: 'Join Link',
					id: 'game-link',
					class: 'game-link',
					callback: function (app, game_mod) {
						game_mod.menu.hideSubMenus();

						let data = {
							game: game_mod.name,
							game_id: app.crypto.hash(game_mod.game.id).slice(-6),
							path: '/arcade/',
							name: 'Join'
						};

						let link = new InviteLink(app, game_mod, data);
						link.render();
					}
				});
			} else if (this.game_mod.enable_observer) {
				this.addSubMenuOption('game-share', {
					text: 'Observer Link',
					id: 'game-link',
					class: 'game-link',
					callback: function (app, game_mod) {
						game_mod.menu.hideSubMenus();

						let data = {
							game: game_mod.name,
							game_id: app.crypto.hash(game_mod.game.id).slice(-6),
							step: game_mod.game.step.game,
							path: '/arcade/',
							name: 'Observer'
						};

						let link = new InviteLink(app, game_mod, data);
						link.render();
					}
				});
			}

			if (this.debug || this.game_mod.debug) {
				this.addSubMenuOption('game-game', {
					text: 'Debug',
					id: 'game-debug',
					class: 'game-debug',
					callback: function (app, game_mod) {
						game_mod.menu.hideSubMenus();
						console.log(JSON.parse(JSON.stringify(game_mod.game)));

						menu_self.overlay.show(
							`<div class="debug_overlay">
								<button class="saito-button-primary" id="checkmoves">Check for missed transaction</button>
								<div class="debug-stats"><span>Gaming Active</span><span>${game_mod.gaming_active}</span><span>Halted</span><span>${game_mod.halted}</span><span>Game run initialized</span><span>${game_mod.initialize_game_run}</span></div>
							</div>`
						);

						//debug info
						let el = document.querySelector('.debug_overlay');

						if (!game_mod.styles.includes('/saito/lib/jsonTree/jsonTree.css')) {
							game_mod.styles.push('/saito/lib/jsonTree/jsonTree.css');
							game_mod.attachStyleSheets();
						}

						try {
							let optjson = JSON.parse(
								JSON.stringify(
									game_mod.game,
									(key, value) => (typeof value === 'bigint' ? value.toString() : value) // return everything else unchanged
								)
							);
							var tree = jsonTree.create(optjson, el);
						} catch (err) {
							console.log('error creating jsonTree: ' + err);
						}

						let btn = document.getElementById('checkmoves');
						if (btn) {
							btn.onclick = (e) => {
								e.stopPropagation();
								btn.onclick = null;
								btn.classList.add('disabled');
								btn.innerHTML = 'fetching';

								let query = game_mod.name + '_' + game_mod.game.id;

								app.storage.loadTransactions(
									{
										field1: query
									},
									async (txs) => {
										siteMessage('(re)processing moves...', 2500);
										for (let i = txs.length - 1; i >= 0; i--) {
											console.log(txs[i]);
											await game_mod.onConfirmation(-1, txs[i], 0);
										}
									},
									null
								);
							};
						}
					}
				});
			}

			this.addSubMenuOption('game-game', {
				text: 'Export',
				id: 'game-export',
				class: 'game-export',
				callback: function (app, game_mod) {
					game_mod.exportGame();
				}
			});
			this.addSubMenuOption('game-game', {
				text: 'Exit',
				id: 'game-exit',
				class: 'game-exit',
				callback: function (app, game_mod) {
					game_mod.exitGame();
				}
			});
			this.addMenuIcon({
				text: '<i class="fa fa-window-maximize" aria-hidden="true"></i>',
				id: 'game-menu-fullscreen',
				callback: function (app, game_mod) {
					game_mod.menu.hideSubMenus();
					app.browser.requestFullscreen();
				}
			});
		}

		let html = `<ul>`;
		for (let i = 0; i < this.icons.length; i++) {
			html += GameMenuIconTemplate(this.icons[i]);
		}
		for (let i = 0; i < this.options.length; i++) {
			html += GameMenuOptionTemplate(this.options[i], this.sub_options[i]);
		}

		html += `<div id="game-menu-toggle" class="game-menu-mobile-toggle"><i class="fas fa-bars"></i></div></ul>`;

		if (document.getElementById('game-menu')) {
			this.app.browser.replaceElementById(GameMenuTemplate(html), 'game-menu');
		} else {
			this.app.browser.prependElementToSelector(GameMenuTemplate(html), this.container);
		}

		this.attachEvents();
	}

	/**
	 * Add functionality to menu so that clicking on menu items evokes their callbacks
	 * If callback is undefined for top-level menu options, default behavior is to attempt to open its submenu
	 */
	attachEvents() {
		if (
			this.app.browser.isMobileBrowser(navigator.userAgent) ||
			window.innerWidth < 600 ||
			window.innerHeight < 600
		) {
			//We really need the makeDraggable to prevent propagation of click events
			//this.app.browser.makeDraggable("game-menu", "game-menu", true);

			document.body.addEventListener('click', (e) => {
				if (!document.querySelector('.game-menu').contains(e.target)) {
					this.hideSubMenus(true);
				}
			});
		}

		//
		// callbacks in game-menu-option
		//
		for (let i = 0; i < this.options.length; i++) {
			let menu = document.querySelector('#' + this.options[i].id);

			menu.ontouch = (e) => {
				let id = e.currentTarget.id;
				e.currentTarget.classList.remove('notification');
				for (let i = 0; i < this.options.length; i++) {
					if (this.options[i].id === id) {
						if (this.sub_menu_open === id) {
							//keep mobile menue visible
							this.hideSubMenus(false);
						} else {
							if (this.options[i].callback != undefined) {
								this.options[i].callback(this.app, this.game_mod);
							} else {
								this.showSubMenu(id);
							}
						}
						e.stopPropagation();
						return;
					}
				}
			};
			menu.onclick = (e) => {
				let id = e.currentTarget.id;
				e.currentTarget.classList.remove('notification');
				for (let i = 0; i < this.options.length; i++) {
					if (this.options[i].id === id) {
						if (this.sub_menu_open === id) {
							//Toggle submenu by clicking it
							this.hideSubMenus(false);
						} else {
							if (this.options[i].callback != undefined) {
								this.options[i].callback(this.app, this.game_mod);
							} else {
								this.showSubMenu(id);
							}
						}
						e.stopPropagation();
						return;
					}
				}
			};

			menu.onmouseleave = (e) => {
				if (!this.lock) {
					this.hideSubMenus(false);
				}
			};
		}

		//
		// sub-menu
		//
		for (let i = 0; i < this.sub_options.length; i++) {
			for (let ii = 0; ii < this.sub_options[i].length; ii++) {
				let submenu = document.querySelector('#' + this.sub_options[i][ii].id);
				submenu.ontouch = (e) => {
					e.currentTarget.classList.remove('notification');
					let menuObj = this.returnMenuFromID(e.currentTarget.id);
					if (menuObj?.callback) {
						menuObj.callback(this.app, this.game_mod);
						e.stopPropagation();
						return;
					}
				};
				submenu.onclick = (e) => {
					e.currentTarget.classList.remove('notification');
					e.stopPropagation();

					let menuObj = this.returnMenuFromID(e.currentTarget.id);
					if (menuObj?.callback) {
						menuObj.callback(this.app, this.game_mod);
						return;
					}

					if (this.lock) {
						this.hideSubSubMenu(this.lock);
					}
					if (this.lock === e.currentTarget.id) {
						this.lock = null;
					} else {
						this.lock = e.currentTarget.id;
					}
					this.showSubSubMenu(e.currentTarget.id);
				};

				submenu.onmouseover = (e) => {
					let id = e.currentTarget.id;

					if (!this.lock) {
						this.showSubSubMenu(id);
					}

					e.stopPropagation();
					return;
				};
				submenu.onmouseleave = (e) => {
					if (!this.lock) {
						let id = e.currentTarget.id;
						this.hideSubSubMenu(id);
						e.stopPropagation();
						return;
					}
				};
				//Sub-sub-menus
				if (this.sub_options[i][ii].sub_menu) {
					for (let j = 0; j < this.sub_options[i][ii].sub_menu.length; j++) {
						let ssubmenu = document.querySelector('#' + this.sub_options[i][ii].sub_menu[j].id);
						ssubmenu.onclick = (e) => {
							let menuObj = this.returnMenuFromID(e.currentTarget.id);
							if (menuObj?.callback) {
								menuObj.callback(this.app, this.game_mod);
								e.stopPropagation();
								return;
							}
						};
					}
				}
			}
		}

		//
		// callbacks in game-menu-icon
		//
		for (let i = 0; i < this.icons.length; i++) {
			let menu = document.querySelector('#' + this.icons[i].id);

			menu.onclick = (e) => {
				let menuObj = this.returnMenuFromID(e.currentTarget.id);
				if (menuObj?.callback) {
					menuObj.callback(this.app, this.game_mod);
					e.stopPropagation();
					return;
				}
			};

			menu.ontouch = (e) => {
				let menuObj = this.returnMenuFromID(e.currentTarget.id);
				if (menuObj?.callback) {
					menuObj.callback(this.app, this.game_mod);
					e.stopPropagation();
					return;
				}
			};
		}

		let mobileToggle = document.querySelector('#game-menu-toggle');
		if (mobileToggle) {
			mobileToggle.onclick = (e) => {
				e.currentTarget.classList.remove('notification');
				let menu = document.querySelector('.game-menu');
				if (menu) {
					if (menu.classList.contains('mobile-visible')) {
						this.hideSubMenus();
					} else {
						menu.classList.add('mobile-visible');
					}
				}
			};
		}
	}

	/**
	 * Helper function to seach the class properties for the menu object based on its id
	 * Note, all menu id's should be unique!
	 */
	returnMenuFromID(id) {
		//Icons
		for (let i = 0; i < this.icons.length; i++) {
			if (this.icons[i].id === id) {
				return this.icons[i];
			}
		}
		//Menu
		for (let i = 0; i < this.options.length; i++) {
			if (this.options[i].id === id) {
				return this.options[i];
			}
		}
		//Submenu
		for (let i = 0; i < this.sub_options.length; i++) {
			for (let j = 0; j < this.sub_options[i].length; j++) {
				if (this.sub_options[i][j].id === id) {
					return this.sub_options[i][j];
				}
				if (this.sub_options[i][j].sub_menu) {
					for (let k = 0; k < this.sub_options[i][j].sub_menu.length; k++) {
						if (this.sub_options[i][j].sub_menu[k].id === id) {
							return this.sub_options[i][j].sub_menu[k];
						}
					}
				}
			}
		}
		return null;
	}

	replaceMenuByID(options) {
		for (let i = 0; i < this.options.length; i++) {
			if (this.options[i].id === options.id) {
				this.options[i] = options;
				return;
			}
		}
	}

	/**
	 * Hide the menu from the DOM
	 */
	hide() {
		try {
			document.querySelector('.game-menu').style.display = 'none';
		} catch (err) {
			console.log('Cannot hide menu?');
		}
	}

	/**
	 * Add a top-level menu option to the menu
	 * @param options -- an object containing id, text, class, and callback
	 * id is a unique reference to the menu item (will not permit duplicate ids),
	 * text is what is displayed in the menu,
	 * class (if defined) is passed along to the html template for css styling or query selection
	 * callback is the function to run on clicking. Generally, that should be a reference to this.showSubMenu
	 *
	 *
	 */
	addMenuOption(id, text) {
		if (this.returnMenuFromID(id)) {
			return;
		}

		let options = {
			id: id,
			text: text,
			class: id,
			callback: function (app, game_mod) {
				game_mod.menu.showSubMenu(id);
			}
		};

		this.options.push(options);
		this.sub_options.push([]);
	}

	/**
	 * Adds a sub menu to a top-level menu option or to a secondary menu option (sub_option)
	 * @param parent_id -- the id of the containing top-level menu item
	 * @param options -- an object containing id, text, class, and callback
	 * id is a unique reference to the menu item (will not permit duplicate ids),
	 * text is what is displayed in the menu,
	 * class (if defined) is passed along to the html template for css styling or query selection
	 * callback is the function to run on clicking. Generally, that should be a function defined in the game module
	 *
	 *
	 */
	addSubMenuOption(parent_id, options = {}) {
		if (!options.id) {
			console.error('No menu id specified!');
			return;
		}

		//if (this.returnMenuFromID(options.id)) {
		//  //console.error("Duplicate menu id:",options.id);
		//  return;
		//}

		for (let i = 0; i < this.options.length; i++) {
			if (this.options[i].id === parent_id) {
				if (this.sub_options[i]) {
					for (let j = 0; j < this.sub_options[i].length; j++) {
						if (this.sub_options[i][j].id == options.id) {
							this.sub_options[i][j] = options;
							return 1; // replacement
						}
					}
					this.sub_options[i].push(options);
					return 1; //addition!
				}
			}
		}

		//Sub-sub menu --> we only reach here if the specified parent_id is not a top level menu
		let parentMenu = this.returnMenuFromID(parent_id);
		if (!parentMenu) {
			console.error('Invalid menu parent');
			console.log('Target id: ' + parent_id);
			console.log(options);
			return;
		}

		if (parentMenu.sub_menu) {
			parentMenu.sub_menu.push(options);
		} else {
			parentMenu.sub_menu = [];
			parentMenu.sub_menu.push(options);
		}
	}

	/**
	 * Add a top-level menu option to the menu
	 * @param options -- an object containing id, text, class, and callback
	 * id is a unique reference to the menu item (will not permit duplicate ids),
	 * text is what is displayed in the menu,
	 * class (if defined) is passed along to the html template for css styling or query selection
	 * callback is the function to run on clicking. Generally, that should be a reference to this.showSubMenu
	 *
	 * menuIcon differs from menuOption in that menuOption assumes there is a subMenu, while menuIcon results in a direct action
	 * A typical example of icon text is the html: '<i class="fa fa-window-maximize" aria-hidden="true"></i>'
	 */
	addMenuIcon(options = {}) {
		for (let i = 0; i < this.icons.length; i++) {
			if (this.icons[i].id == options.id) {
				return;
			}
		}
		this.icons.push(options);
	}

	/**
	 * Opens the specified submenu (closing any currently open one)
	 * @param parent_id - the id of the menu option containing the submenu to be openeed
	 */
	showSubMenu(parent_id) {
		if (this.sub_menu_open != '') {
			this.hideSubMenus(false);
		}
		this.sub_menu_open = parent_id;

		let el = document.querySelector('#' + parent_id + ' > ul');
		if (el) {
			el.style.display = 'block';
		}
	}

	/**
	 * Sets the sub menu the specified menu to display
	 * Only differs from showSubMenu because we don't want to close all the submenus
	 * @param parent_id - the id of the (sub)menu option containing the submenu to be openeed
	 */
	showSubSubMenu(parent_id) {
		let el = document.querySelector('#' + parent_id + ' > ul');
		if (el) {
			el.style.display = 'block';

			//if (this.lock)
			//this.hideSubMenus(e.currentTarget.parentElement);
		}
	}

	/**
	 * Hides all submenus
	 *
	 */
	hideSubMenus(activeClose = true) {
		this.sub_menu_open = '';
		this.lock = null;

		for (let i = 0; i < this.options.length; i++) {
			let divname = '#' + this.options[i].id + ' ul';
			let subLists = document.querySelectorAll(divname);
			for (let i = 0; i < subLists.length; i++) {
				if (subLists[i]) {
					subLists[i].style.display = 'none';
				}
			}
		}

		let menu = document.querySelector('.game-menu');
		if (menu && activeClose) {
			menu.classList.remove('mobile-visible');
		}
	}

	/**
	 * Hide the menu contained within the specified parent id
	 * @param parent_id - the id of the <li> containing the submenu
	 */
	hideSubSubMenu(parent_id) {
		let div = document.querySelector(`#${parent_id} ul`);
		if (div) {
			div.style.display = 'none';
		}
	}

	/**
	 * A convienence function for game modules to quickly add chat features to the game menu
	 * @param names - an optional specification of player names, if not provided, defaults to Player 1, Player 2, etc.
	 */
	addChatMenu(shortNames = null, longNames = null) {
		let menu_self = this;

		//
		// it is such a pain in the ass to get the object returned by a module's
		// respondTo function
		//

		let chat = this.app.modules.respondTo('saito-game-menu');
		let cm = null;

		if (chat?.length > 0) {
			let chat2 = chat[0].respondTo('saito-game-menu');
			if (chat2?.length > 0) {
				cm = chat2[0];
			}
		}

		if (!cm) {
			return;
		}

		cm.event('game-chat-manager');

		//
		//Add notifications to the game-menu for chat events
		//
		this.app.connection.on('chat-popup-render-request', (chat_group = null) => {
			if (this.initialized) {
				try {
					if (!chat_group || chat_group.unread == 0) {
						return;
					}

					document.getElementById('game-social').classList.add('notification');
					document.getElementById('game-chat').classList.add('notification');
					document.getElementById('game-menu-toggle').classList.add('notification');
					document.getElementById('game-social').classList.add('new-notification');
					document.getElementById('game-menu-toggle').classList.add('new-notification');

					if (chat_group.members.length == 1) {
						document.getElementById('game-chat-community').classList.add('notification');
					} else if (chat_group.members.length >= 2) {
						document.getElementById('game-chat-group').classList.add('notification');
					} else {
					}

					setTimeout(() => {
						document.getElementById('game-social').classList.remove('new-notification');
						document.getElementById('game-menu-toggle').classList.remove('new-notification');
					}, 1000);
				} catch (err) {
					//console.warn(err);
				}
			}
		});

		this.addMenuOption('game-social', 'Chat');

		//
		// Create group chat but just for this game, not the whole community
		//
		if (this.game_mod?.game?.players?.length > 1) {

			// DM
			let key = this.game_mod.game.opponents[0];

			// Group
			if (this.game_mod.game.players.length > 2){
				key = this.game_mod.game.players.slice();
			}

			// Open table
			if (this.game_mod.opengame) {
				key = false;
			}

			if (!this.app.browser.isMobileBrowser()) {
				this.app.connection.on('chat-ready', () => {
					if (this.game_mod.game.players.length > 2 || this.game_mod.opengame) {
						this.app.connection.emit('open-chat-with', {
							key,
							name: this.game_mod.returnName() + ' Chat',
							id: this.game_mod.game.id,
							temporary: true
						});
					} else {
						this.app.connection.emit('open-chat-with', { key });
					}
					this.app.connection.emit('chat-manager-request-no-interrupts');
				});
			}

			let chat_title = 'Player Chat';
			if (this.game_mod.game.players.length > 2) {
				chat_title = 'Game Chat';
			}

			this.addSubMenuOption('game-social', {
				text: chat_title,
				id: 'game-chat-group',
				class: 'game-chat-group',
				callback: function (app, game_mod) {
					menu_self.hideSubMenus();

					if (game_mod.game.players.length > 2 || game_mod.opengame) {
						//Create an on-the-fly chat group for 3+ players
						app.connection.emit('open-chat-with', {
							key,
							name: game_mod.returnName() + ' Chat',
							id: game_mod.game.id,
							temporary: true
						});
					} else {
						//Default DM with 1-to-1 games
						app.connection.emit('open-chat-with', { key });
					}

					app.connection.emit('chat-manager-request-no-interrupts');
				}
			});
		}

		if (menu_self.game_mod?.game?.players?.length > 2) {
			for (let z = 0; z < menu_self.game_mod.game.players.length; z++) {
				if (menu_self.game_mod.game.player != z + 1) {
					menu_self.addSubMenuOption('game-social', {
						text: `${menu_self.game_mod.returnUsername(menu_self.game_mod.game.players[z])}`,
						id: `game-chat-group-${z + 1}`,
						class: `game-chat-group-${z + 1}`,
						callback: function (app, game_mod) {
							menu_self.hideSubMenus();
							menu_self.app.connection.emit('open-chat-with', {
								key: menu_self.game_mod.game.players[z]
							});
						}
					});
				}
			}
		}

		menu_self.addSubMenuOption('game-social', {
			text: 'More Chats',
			id: 'game-chat-manager',
			class: 'game-chat-manager',
			callback: function (app, game_mod) {
				menu_self.hideSubMenus();
				cm.callback();
			}
		});
	}
}

module.exports = GameMenu;
