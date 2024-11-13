var saito = require('../../lib/saito/saito');
var GameTemplate = require('../../lib/templates/gametemplate');
const JSON = require('json-bigint');
const MidnightGameRulesTemplate = require('./lib/midnight-game-rules.template');
const MidnightBook = require('./lib/midnight-book');

//////////////////
// CONSTRUCTOR  //
//////////////////
class Midnight extends GameTemplate {
	constructor(app) {
		super(app);

		this.name = 'Midnight';
		this.slug = 'midnight';
		this.gamename = 'Midnight Rogue';

		this.categories = 'Games One-player Textadventure';
		this.description = `Danger lurks around every corner in this second-person interactive role playing story. <br> 
												As a thief apprentice, you are tasked to steal the EYE OF THE BASILISK and your special skills
												will be put to the limit. What terrors await in the darkness as you test your luck and choose 
												your way through this adventure?`;
		this.maxPlayers = 1;
		this.minPlayers = 1;
		this.app = app;
		this.can_bet = 0;
	}

	/* Opt out of letting League create a default*/
	respondTo(type) {
		if (type == 'default-league') {
			return null;
		}
		return super.respondTo(type);
	}

	returnGameRulesHTML() {
		return MidnightGameRulesTemplate(this.app, this);
	}

	async initializeHTML(app) {
		if (!this.browser_active) {
			return;
		}
		if (this.initialize_game_run) {
			return;
		}

		// init single player if needed
		if (this.game.players.length == 0) {
			this.initializeSinglePlayerGame();
		}

		// Override the game template initializeHTML function
		await super.initializeHTML(app);

		this.menu.addMenuOption('game-game', 'Game');
		this.menu.addMenuOption('game-info', 'Info');

		this.menu.addSubMenuOption('game-game', {
			text: 'Restart',
			id: 'game-restart',
			class: 'game-restart',
			callback: async function (app, game_mod) {
				game_mod.game.state = null;
				await game_mod.initializeGame();
				game_mod.startQueue();
			}
		});
		this.menu.addSubMenuOption('game-game', {
			text: 'Go back',
			id: 'game-backup',
			class: 'game-backup',
			callback: function (app, game_mod) {
				game_mod.game.queue = [`page\t${game_mod.game.state.lastpage}`];
				game_mod.startQueue();
			}
		});

		this.menu.addSubMenuOption('game-game', {
			text: 'Skip to Page',
			id: 'game-skip',
			class: 'game-skip',
			callback: async function (app, game_mod) {
				game_mod.menu.hideSubMenus();
				let page_num = await sprompt('Skip to which page');
				if (page_num) {
					game_mod.game.queue = [
						`page\t${page_num.padStart(3, '0')}`
					];
					game_mod.endTurn();
				}
			}
		});
		this.menu.addSubMenuOption('game-info', {
			text: 'How to Play',
			id: 'game-intro',
			class: 'game-intro',
			callback: function (app, game_mod) {
				game_mod.menu.hideSubMenus();
				game_mod.overlay.show(game_mod.returnGameRulesHTML());
			}
		});

		// Add Chat Features to Menu
		this.menu.addChatMenu();

		// Render menu and attach events
		this.menu.render();

		this.playerbox.render();
	}

	initializeGame(game_id) {
		if (!this.game.state) {
			this.updateStatus('Generating the Game');
			this.game.queue = [];
			this.game.queue.push('page\t001');
			this.game.queue.push('select_potion');
			this.game.queue.push('initialize_player');
			this.game.queue.push('READY');
			this.game.state = this.returnState();
		}

		if (this.browser_active) {
			//Only initialize the data structures if we are in the game
			this.book = MidnightBook(this);
			this.potions = this.returnPotions();
			this.enemies = this.returnEnemy();
			this.inventory = this.returnInventory();
			this.skills = this.returnSkills();
			this.displayPlayer();
		}
	}

	displayPlayer() {
		if (!this.browser_active) {
			return;
		}

		let html = `<div class="player_stats">
                <div>SKILL:</div><div>${this.game.state.skill}</div>
                <div>STAMINA:</div><div>${this.game.state.stamina} / ${this.game.state.max_stamina}</div>
                <div>LUCK:</div><div>${this.game.state.luck}</div>
                <div>GOLD:</div><div>${this.game.state.gold}</div>
                <div>PROVISIONS:</div><div class="food">${this.game.state.provisions}</div>
                </div>`;

		html += `<div class="player_skills"><span>My skills:</span>`;
		if (this.game.state.special_skills) {
			for (let s of this.game.state.special_skills) {
				html += `<div class="tip">${this.skills[s].icon}<div class="tiptext">${this.skills[s].name}</div></div>`;
			}
		}
		html += `</div>
             <div class="player_skills"><span>Inventory:</span>`;

		for (let i of this.game.state.inventory) {
			html += `<div class="tip">${this.inventory[i].icon}<div class="tiptext">${this.inventory[i].name}</div></div>`;
		}
		html += '</div>';
		html += `<div class="player_skills">`;
		if (this.game.state.inventory.includes('potion')) {
			html += `<div class="potion textoption">Drink Potion</div>`;
		}
		if (this.game.state.provisions > 0) {
			html += `<div class="food textoption">Eat Provisions</div>`;
		}
		html += '</div>';

		this.playerbox.refreshInfo(html);

		let midnight_self = this;

		$('.food').off();
		$('.food').on('click', () => {
			midnight_self.eatProvision();
			``;
		});

		$('.potion').off();
		$('.potion').on('click', async () => {
			let c = await sconfirm(
				`Use your ${midnight_self.game.state.potion.name}?`
			);
			if (c) {
				midnight_self.game.state.potion.event();
			}
		});
	}

	async eatProvision() {
		if (this.game.state.provisions === 0) {
			this.displayModal('You have no provisions to eat');
			return;
		}
		if (this.game.state.in_combat) {
			this.displayModal('You cannot eat when in combat');
			return;
		}

		let c = await sconfirm('Eat one provision to regain 4 STAMINA?');
		if (c) {
			this.game.state.provisions--;
			this.game.state.stamina = Math.min(
				this.game.state.stamina + 4,
				this.game.state.max_stamina
			);
			if (this.game.state.provisions == 0) {
				this.game.state.inventory = this.game.state.inventory.filter(
					(f) => f !== 'provisions'
				);
			}
			this.displayPlayer();
		}
	}

	async handleGameLoop(msg = null) {
		let midnight_self = this;
		this.displayPlayer();
		///////////
		// QUEUE //
		///////////
		if (this.game.queue.length > 0) {
			let qe = this.game.queue.length - 1;
			let mv = this.game.queue[qe].split('\t');

			if (mv[0] === 'select_potion') {
				this.game.queue.splice(qe, 1);
				this.potionSelection();
				return 0;
			}

			if (mv[0] === 'potion') {
				this.game.queue.splice(qe, 1);
				this.game.state.potion = this.potions[mv[1]];
				return 1;
			}

			if (mv[0] === 'initialize_player') {
				this.game.queue.splice(qe, 1);
				this.skillSelection();
				return 0;
			}

			if (mv[0] === 'restart') {
				this.game.queue = [];
				this.game.state = null;
				await this.initializeGame();
				return 1;
			}

			if (mv[0] === 'page') {
				let page = mv[1];

				this.game.queue.splice(qe, 1);

				if (page === '0') {
					return 1;
				}

				this.game.state.newPage = 1;
				this.game.state.in_combat = false;
				this.game.state.lastpage = this.game.state.currentpage;
				this.game.state.currentpage = page;
				this.showPage(page);
				return 0;
			}

			/*
      {
        limit: 1,
        reward: "page"
        victory: "page"
      }

      */

			if (mv[0] === 'combat') {
				this.game.queue.splice(qe, 1);

				let params = JSON.parse(mv[1]);
				if (params.enemy) {
					this.game.state.enemies = params.enemy;
				}
				if (params?.first >= 0) {
					this.simulCombat(params);
				} else {
					this.handleCombat(params);
				}

				return 0;
			}

			if (mv[0] === 'skill') {
				this.game.queue.splice(qe, 1);
				this.checkSkill(mv[1], mv[2]);
				return 0;
			}

			if (mv[0] === 'stamina') {
				this.game.queue.splice(qe, 1);
				this.checkStamina(mv[1], mv[2]);
				return 0;
			}

			if (mv[0] === 'statcheck') {
				this.game.queue.splice(qe, 1);
				this.roll2Move(mv[1], mv[2], mv[3], mv[4]);
				return 0;
			}

			if (mv[0] === 'damage') {
				this.game.queue.splice(qe, 1);
				this.roll4Damage(mv[1], mv[2], mv[3]);
				return 0;
			}

			if (mv[0] === 'bribe') {
				this.game.queue.splice(qe, 1);
				this.bribeNPC(mv[1], mv[2]);
				return 0;
			}

			//Adjust which, by how much
			if (mv[0] === 'changestats') {
				this.game.queue.splice(qe, 1);
				let field = mv[1];
				let amount = parseInt(mv[2]);

				this.game.state[field] += amount;
				//Don't go below zero
				this.game.state[field] = Math.max(0, this.game.state[field]);
				//Don't go above max (if there is)
				if (this.game.state[`max_${field}`]) {
					this.game.state[field] = Math.min(
						this.game.state[field],
						this.game.state[`max_${field}`]
					);
				}

				this.displayPlayer();

				if (mv[3]) {
					this.game.queue.push(`page\t${mv[3]}`);
					return 1;
				}

				this.showPage(this.game.state.currentpage);
				return 0;
			}

			if (mv[0] === 'inventory') {
				this.game.queue.splice(qe, 1);
				if (mv[1] == 'gain') {
					this.game.state.inventory.push(mv[2]);
				} else {
					this.game.state.inventory =
						this.game.state.inventory.filter((e) => e !== mv[2]);
				}

				this.displayPlayer();

				if (mv[3]) {
					this.game.queue.push(`page\t${mv[3]}`);
					return 1;
				}

				this.showPage(this.game.state.currentpage);
				return 0;
			}

			if (mv[0] === 'key') {
				this.game.queue.splice(qe, 1);
				this.game.state.keys.push(mv[1]);

				this.displayPlayer();

				if (mv[2]) {
					this.game.queue.push(`page\t${mv[2]}`);
					return 1;
				}

				this.showPage(this.game.state.currentpage);
				return 0;
			}

			if (mv[0] === 'selectitem') {
				this.game.queue.splice(qe, 1);

				this.selectItem(mv[1]);
				return 0;
			}

			if (mv[0] === 'selectweapon') {
				this.game.queue.splice(qe, 1);
				this.selectItem(mv[1], true);
				return 0;
			}
		} // if cards in queue
		return 1;
	}

	potionSelection() {
		let midnight_self = this;
		let html = `<div>You may choose <em>1</em> magic potion for the game</div>
                <div class="special_skills">`;

		for (let s in this.potions) {
			html += `<div class="potion" id="${s}">${this.potions[s].name} : ${this.potions[s].desc}</div>`;
		}
		html += `</div>`;
		this.updateStatus(html);

		$('.potion').on('click', function () {
			let choice = $(this).attr('id');
			midnight_self.addMove(`potion\t${choice}`);
			midnight_self.endTurn();
		});
	}

	skillSelection() {
		let midnight_self = this;
		let html = `<div>You may choose <em>3</em> special skills for the game</div>
                <div class="special_skills">`;

		for (let s in this.skills) {
			html += `<div id="${s}">${this.skills[s].icon} : ${this.skills[s].name}</div>`;
		}
		html += `</div>
            <button class="button" id="confirm_btn">CONFIRM</button>`;
		this.updateStatus(html);
		let skills = [];
		$('.special_skills div').on('click', function () {
			let choice = $(this).attr('id');
			if ($(this).hasClass('selected')) {
				$(this).removeClass('selected');
				skills = skills.filter((i) => i !== choice);
			} else {
				$(this).addClass('selected');
				skills.push(choice);
				if (skills.length > 3) {
					choice = skills.shift();
					$(`#${choice}`).removeClass('selected');
				}
			}
		});
		$('#confirm_btn').on('click', function () {
			if (skills.length === 3) {
				midnight_self.game.state.special_skills = skills;
				midnight_self.endTurn();
			} else {
				midnight_self.displayModal('You must select three skills');
			}
		});
	}

	filterChoices(page_obj) {
		//Check if need to filter options based on special skill or inventory
		let apply_filter = false;
		let success = false;
		if (page_obj.filter) {
			apply_filter = true;
			if (page_obj.filter.field == 'stats') {
				success =
					this.game.state[page_obj.filter.value] >=
					page_obj.filter.min;
			} else if (page_obj.filter.field == 'clues') {
				success = Object.keys(this.game.state.clues).length == 3;
			} else {
				success = this.game.state[page_obj.filter.field].includes(
					page_obj.filter.value
				);
			}
		}

		if (page_obj.choices?.length > 0) {
			for (let i = 0; i < page_obj.choices.length; i++) {
				if (apply_filter) {
					if (
						page_obj.choices[i].filter !== undefined &&
						page_obj.choices[i].filter !== success
					) {
						page_obj.choices[i].skipme = true;
					}
				}

				if (page_obj.choices[i].inventory) {
					page_obj.choices[i].skipme =
						!this.game.state.inventory.includes(
							page_obj.choices[i].inventory
						);
				}

				if (page_obj.choices[i].skill) {
					if (page_obj.choices[i].skipme) {
						page_obj.choices[i].skipme =
							page_obj.choices[i].skipme &&
							!this.game.state.special_skills.includes(
								page_obj.choices[i].skill
							);
					} else {
						page_obj.choices[i].skipme =
							!this.game.state.special_skills.includes(
								page_obj.choices[i].skill
							);
					}
				}

				if (page_obj.choices[i].gold) {
					page_obj.choices[i].skipme =
						this.game.state.gold < page_obj.choices[i].gold;
				}

				if (page_obj.choices[i].event) {
					if (
						this.game.state.events.includes(
							page_obj.choices[i].event
						)
					) {
						page_obj.choices[i].skipme = true;
					}
				}

				if (page_obj.choices[i].key !== undefined) {
					if (
						page_obj.choices[i].key == 'R' ||
						page_obj.choices[i].key == 'L'
					) {
						page_obj.choices[i].skipme =
							!this.game.state.keys.includes(
								page_obj.choices[i].key
							);
					} else {
						page_obj.choices[i].skipme =
							page_obj.choices[i].key !==
							this.game.state.keys.length;
					}
				}
			}
		}

		return page_obj.choices;
	}

	/**
	 * Display the page of the book and do a little processing to limit the options
	 *
	 */
	showPage(page_num) {
		let midnight_self = this;
		let html = ''; //book[page].text;

		let page = this.book[page_num];
		if (!page) {
			salert('Undefined page! -- ' + page_num);
			return;
		}

		//Update Player stats based on page event
		if (this.game.state.newPage) {
			this.game.state.newPage = 0;

			if (page.clue) {
				this.game.state.clues[page.clue] = 1;
			}

			//Sometimes we need to know if we have visited this page before
			if (page.event) {
				this.game.state.events.push(page.event);
			}

			if (page?.instant?.length > 0) {
				for (let mv of page.instant) {
					this.addMove(mv);
				}
				delete page.instant;
				this.endTurn();
			}
		}

		//Block provisions if it is a combat page
		if (page.combat) {
			this.game.state.in_combat = true;
			$('.gameboard').addClass('combat');
		} else {
			$('.combat').removeClass('combat');
		}

		let choices = this.filterChoices(page);

		if (this.game.state.stamina <= 0) {
			html += `<ul class="choicelist">`;
			html += `<li class="textchoice">You have ran out of STAMINA and your adventure ends here.</li>`;
			html += '</ul>';
		} else {
			if (choices?.length > 0) {
				html += `<ul class="choicelist">`;
				for (let i = 0; i < choices.length; i++) {
					let classname = choices[i].skipme
						? 'nonchoice'
						: 'textchoice';
					html += `<li class="${classname}" id="${i}">${choices[i].option}</li>`;
				}
				html += '</ul>';
			}
		}

		this.updateStatus(
			`<div class="page_number">${page_num}</div><div class="story">${page.text}</div>${html}`
		);

		$('.textchoice').off();
		$('.textchoice').on('click', function () {
			$('.textchoice').off();
			let action = $(this).attr('id');
			if (action && page.choices[action].command) {
				midnight_self.addMove(page.choices[action].command);
				midnight_self.endTurn();
			}
		});
	}

	checkSkill(victory_page, modifier = 0) {
		let midnight_self = this;

		modifier = parseInt(modifier);
		let page = this.book[this.game.state.currentpage];
		let roll = this.rollDice(6) + this.rollDice(6) + modifier;
		let success = roll <= this.game.state.skill;
		let html = `<div class="result">You roll a ${roll}${
			modifier ? ` (including ${modifier} roll modifier)` : ''
		}, `;
		if (success) {
			html += `Success!</div>`;
		} else {
			html += `Failure!</div>`;
		}

		let choices = this.filterChoices(page);

		if (choices?.length > 0) {
			html += `<ul class="choicelist">`;
			for (let i = 0; i < choices.length; i++) {
				let message = choices[i].option;
				if (success && choices[i].success) {
					message = choices[i].success;
				}
				if (!success && choices[i].failure) {
					message = choices[i].failure;
				}
				html += `<li class="${
					choices[i].skipme ? 'nonchoice' : 'textchoice'
				}" id="${i}">${message}</li>`;
			}
			html += '</ul>';
		}

		this.updateStatus(
			`<div class="page_number">${this.game.state.currentpage}</div><div class="story">${page.text}</div>${html}`
		);

		$('.textchoice').off();
		$('.textchoice').on('click', function () {
			$('.textchoice').off();
			let action = $(this).attr('id');

			if (page.choices[action].success) {
				if (success) {
					midnight_self.addMove(`page\t${victory_page}`);
				} else if (page.choices[action].penalty) {
					//if (page.choices[action].repeat_on_failure){
					//  midnight_self.addMove(page.choices[action].command);
					//}
					midnight_self.addMove(page.choices[action].penalty);
				} else {
					return;
				}
			} else {
				midnight_self.addMove(page.choices[action].command);
			}

			midnight_self.endTurn();
		});
	}

	checkStamina(num_die, next_page) {
		let midnight_self = this;

		let page = this.book[this.game.state.currentpage];
		let total = 0;
		let html = `<div class="result">You roll: `;
		for (let i = 0; i < num_die; i++) {
			let roll = this.rollDice(6);
			total += roll;
			html += `${roll}, `;
		}

		html += `for a total of ${total}, versus your STAMINA of ${this.game.state.stamina}</div>`;

		let success = total <= this.game.state.stamina;

		let choicesHTML = `<ul class="choicelist">`;
		if (success) {
			this.game.state.stamina--;
			choicesHTML += `<li class="${
				this.game.state.stamina > 0 ? 'textchoice' : 'nonchoice'
			}">Success! You only lose 1 STAMINA point</li>`;
		} else {
			this.game.state.stamina -= 4;
			this.game.satte.skill--;
			choicesHTML += `<li class="${
				this.game.state.stamina > 0 ? 'textchoice' : 'nonchoice'
			}">Failure! You lose 4 STAMINA points and 1 SKILL point</li>`;
		}

		this.updateStatus(
			`<div class="page_number">${this.game.state.currentpage}</div><div class="story">${page.text}</div>${html}${choicesHTML}`
		);
		this.displayPlayer();

		$('.textchoice').off();
		$('.textchoice').on('click', function () {
			midnight_self.addMOve(`page\t${next_page}`);
			midnight_self.endTurn();
		});
	}

	roll2Move(stat, victory_page, failure_page, modifier = 0) {
		let midnight_self = this;
		let page = this.book[this.game.state.currentpage];
		let roll = this.rollDice(6) + this.rollDice(6) + parseInt(modifier);

		let html = `<div class="result">You rolled a ${roll} ${
			modifier ? `(Includes modifier of ${modifier}) ` : ''
		}versus your ${stat.toUpperCase()} of ${this.game.state[stat]}</div>`;

		let choices = `<ul class="choicelist">`;
		if (roll <= this.game.state[stat]) {
			choices += `<li class="textchoice" id="${victory_page}">SUCCESS</li>`;
		} else {
			choices += `<li class="textchoice" id="${failure_page}">FAILURE</li>`;
		}
		choices += '</ul>';

		if (stat == 'luck') {
			this.game.state.luck--;
		}

		this.updateStatus(
			`<div class="page_number">${this.game.state.currentpage}</div><div class="story">${page.text}</div>${html}${choices}`
		);
		this.displayPlayer();

		$('.textchoice').off();
		$('.textchoice').on('click', function () {
			$('.textchoice').off();
			let action = $(this).attr('id');
			midnight_self.addMove(`page\t${action}`);
			midnight_self.endTurn();
		});
	}

	simulCombat(params) {
		let midnight_self = this;

		let combatHTML, choicesHTML;
		let winner;

		let enemies = [];

		combatHTML = `<div class="result">You are fighting `;

		for (let e of params.enemy) {
			let enemy = JSON.parse(JSON.stringify(this.enemies[e]));
			enemies.push(enemy);
			combatHTML += `<span class="bold">${enemy.name}</span>, Skill: ${enemy.skill}, Stamina: ${enemy.stamina};`;
		}
		combatHTML += `</div>`;

		const combat = (target) => {
			let killed = false;
			let attack = 0;
			for (let i = 0; i < enemies.length; i++) {
				let enemy = enemies[i];
				let myAttack =
					this.rollDice(6) + this.rollDice(6) + this.game.state.skill;
				let enemyAttack =
					this.rollDice(6) + this.rollDice(6) + enemy.skill;

				combatHTML += `<div class="result">
                         <div class="player_skills">
                           <div>Your attack: ${myAttack}</div>
                           <div>${enemy.name}'s attack: ${enemyAttack}</div>
                         </div>`;

				if (myAttack >= enemyAttack) {
					attack++;
					if (i == target) {
						enemy.stamina -= 2;
						combatHTML += `<div>You deal 2 damage to <span class="bold">${enemy.name}</span>, bringing their stamina down to ${enemy.stamina}</div>`;
						if (enemy.stamina <= 0) {
							combatHTML += `<div>You have vanquished <span class="bold">${enemy.name}</span>!</div>`;
							killed = true;
						}
					} else {
						combatHTML += `<div>You parry <span class="bold">${enemy.name}</span>'s blow</div>`;
					}
				} else {
					this.game.state.stamina -= 2;
					combatHTML += `<div><span class="bold">${enemy.name}</span> deals you deal 2 damage, bringing your stamina down to ${this.game.state.stamina}</div>`;
				}
				combatHTML += '</div>';
			}

			if (killed) {
				enemies.splice(target, 1);
			}

			choicesHTML = `<ul class="choicelist">`;
			if (this.game.state.stamina <= 0) {
				choicesHTML += `<li class="textchoice" id="death">You have died, CONFIRM</li>`;
			} else if (enemies.length == 0) {
				choicesHTML += `<li class="textchoice" id="win">You have won the battle, CONTINUE</li>`;
			} else {
				for (let i = 0; i < enemies.length; i++) {
					choicesHTML += `<li class="textchoice" id="${i}">Attack ${enemies[i].name}</li>`;
				}
				if (params?.attack?.limit && attack >= params.attack.limit) {
					choicesHTML += `<li class="textchoice" id="attack">${params.attack.message}</li>`;
				}
			}

			update();
		};

		const update = () => {
			this.displayPlayer();
			this.updateStatus(
				`<div class="page_number">${
					this.game.state.currentpage
				}</div><div class="story">${
					this.book[this.game.state.currentpage].text
				}</div>${combatHTML}${choicesHTML}`
			);

			$('.textchoice').off();
			$('.textchoice').on('click', function () {
				$('.textchoice').off();
				let action = $(this).attr('id');
				if (action == 'death') {
				} else if (action == 'win') {
					midnight_self.addMove(params.victory.reward);
					midnight_self.endTurn();
				} else if (action == 'attack') {
					midnight_self.addMove(params.attack.reward);
					midnight_self.endTurn();
				} else {
					combat(parseInt(action));
				}
			});
		};

		combat(params.first);
	}

	handleCombat(params) {
		let midnight_self = this;

		let enemy, combatHTML;
		let choicesHTML;
		let winner;
		let enemy_attack_modifier = 0;
		let attack_modifier = params?.attack?.modifier || 0;
		let enemies = params.enemy || this.game.state.enemies;
		let rounds = 0;
		let attacks = 0; //Number of times I hit the enemy
		let defends = 0; //Number of times the enemy hits me
		let attack_strength = 2;
		let enemy_attack_strength = 2;

		if (params?.attack?.damage >= 0) {
			attack_strength = params.attack.damage;
		}
		if (params?.defend?.damage >= 0) {
			enemy_attack_strength = params.defend.damage;
		}

		if (!this.hasWeapon()) {
			attack_modifier -= 3;
		}

		const queueNextMonster = () => {
			let next = Array.isArray(enemies) ? enemies.shift() : enemies;
			if (this.enemies[next]) {
				this.game.state.currentEnemy = JSON.parse(
					JSON.stringify(this.enemies[next])
				);
				enemy = this.game.state.currentEnemy;
			} else {
				salert('Enemy not found: ' + next);
			}
			combatHTML = `<div class="result">You are fighting a <span class="bold">${enemy.name}</span>, Skill: ${enemy.skill}, Stamina: ${enemy.stamina}</div>`;
			combat();
		};

		const combat = () => {
			let myRoll = this.rollDice(6) + this.rollDice(6);
			let myAttack = myRoll + this.game.state.skill + attack_modifier;
			let enemyAttack =
				this.rollDice(6) +
				this.rollDice(6) +
				enemy.skill +
				enemy_attack_modifier;
			rounds++;

			combatHTML += `<div class="result">
                       <div class="player_skills">
                         <div>Your attack: ${myAttack}${
	attack_modifier ? ` (includes ${attack_modifier} modifier)` : ''
}</div>
                         <div>Their attack: ${enemyAttack}</div>
                       </div>`;
			if (myAttack >= enemyAttack) {
				winner = true;
				enemy.stamina -= attack_strength;
				attacks++;
				combatHTML += `<div>You deal ${attack_strength} damage to <span class="bold">${enemy.name}</span>`;
				if (attack_strength > 0) {
					combatHTML += `, bringing their stamina down to ${enemy.stamina}</div>`;
				} else {
					combatHTML += `, but at least you avoid their attack</div>`;
				}
				if (enemy.bonus) {
					enemy_attack_modifier = 0;
				}
			} else {
				winner = false;
				this.game.state.stamina -= enemy_attack_strength;
				defends++;
				combatHTML += `<div><span class="bold">${enemy.name}</span> deals you deal ${enemy_attack_strength} damage, bringing your stamina down to ${this.game.state.stamina}</div>`;
				if (enemy.bonus) {
					enemy_attack_modifier = enemy.bonus;
					combatHTML += `<div><span class="bold">${enemy.name}</span> gains ${enemy.bonus} to their next attack</div>`;
				}
				if (enemy.curse) {
					for (let i in enemy.curse) {
						this.game.state[i] = Math.max(
							0,
							this.game.state[i] + enemy.curse[i]
						);
					}
				}
			}
			combatHTML += '</div>';

			choicesHTML = `<ul class="choicelist">`;
			if (this.game.state.stamina <= 0) {
				choicesHTML += `<li class="textchoice" id="death">You have died, CONFIRM</li>`;
			} else if (enemy.stamina <= 0 && params.victory) {
				choicesHTML += `<li class="textchoice" id="win">You have defeated ${enemy.name}, CONTINUE</li>`;
			} else {
				if (params?.victory?.limit && rounds >= params.victory.limit) {
					choicesHTML += `<li class="textchoice" id="timeout">${params.victory.message}</li>`;
				} else {
					if (
						params?.defend?.limit &&
						defends >= params.defend.limit
					) {
						choicesHTML += `<li class="textchoice" id="defend">${params.defend.message}</li>`;
					} else {
						if (
							params?.attack?.limit &&
							attacks >= params.attack.limit
						) {
							choicesHTML += `<li class="textchoice" id="attack">${params.attack.message}</li>`;
							if (!params.attack.optional) {
								update();
								return;
							}
						}

						if (params?.attack?.curse?.limit === myRoll) {
							choicesHTML += `<li class="textchoice" id="curse">${params.attack.curse.message}</li>`;
							update();
							return;
						}

						choicesHTML += `<li class="textchoice" id="fight">keep fighting</li>`;
						choicesHTML += `<li class="textchoice" id="luck">test your luck</li>`;
					}
				}
			}

			update();
		};

		const luck = () => {
			let luck_roll = this.rollDice(6) + this.rollDice(6);
			if (luck_roll <= this.game.state.luck) {
				if (winner) {
					combatHTML += `<div>You got lucky and your blow dealt extra damage</div>`;
					enemy.stamina -= 2;
				} else {
					combatHTML += `<div>You got lucky and only took half damage</div>`;
					this.game.state.stamina += 1;
				}
			} else {
				if (winner) {
					combatHTML += `<div>You were unlucky and your blow glanced off the ${enemy.name}</div>`;
					enemy.stamina++;
				} else {
					combatHTML += `<div>You were unlucky and took a critical hit</div>`;
					this.game.state.stamina--;
				}
			}
			this.game.state.luck--;
			choicesHTML = `<ul class="choicelist">`;
			if (this.game.state.stamina <= 0) {
				choicesHTML += `<li class="textchoice" id="death">You have died, CONFIRM</li>`;
			} else if (enemy.stamina <= 0) {
				choicesHTML += `<li class="textchoice" id="win">You have defeated ${enemy.name}, CONTINUE</li>`;
			} else {
				combat();
				return;
			}
			update();
		};

		const update = () => {
			this.displayPlayer();
			this.updateStatus(
				`<div class="page_number">${
					this.game.state.currentpage
				}</div><div class="story">${
					this.book[this.game.state.currentpage].text
				}</div>${combatHTML}${choicesHTML}`
			);

			$('.textchoice').off();
			$('.textchoice').on('click', function () {
				$('.textchoice').off();
				let action = $(this).attr('id');
				if (action == 'death') {
				}
				if (action == 'win') {
					if (Array.isArray(enemies) && enemies.length > 0) {
						queueNextMonster();
					} else {
						midnight_self.addMove(params.victory.reward);
						midnight_self.endTurn();
					}
				}
				if (action == 'fight') {
					combat();
				}
				if (action == 'luck') {
					luck();
				}
				if (action == 'curse') {
					midnight_self.addMove(params.attack.curse.penalty);
					midnight_self.endTurn();
				}
				if (action == 'defend') {
					midnight_self.addMove(params.defend.penalty);
					midnight_self.endTurn();
				}
				if (action == 'attack') {
					midnight_self.addMove(params.attack.reward);
					midnight_self.endTurn();
				}
				if (action == 'timeout') {
					midnight_self.addMove(params.victory.penalty);
					midnight_self.endTurn();
				}
			});
		};

		if (params.enemy) {
			queueNextMonster();
		} else {
			enemy = this.game.state.currentEnemy;
			combatHTML = `<div class="result">You are still fighting a <span class="bold">${enemy.name}</span>, Skill: ${enemy.skill}, Stamina: ${enemy.stamina}</div>`;
			combat();
		}
	}

	/*
    There are four pages where darts shoot at you. Roll 1 6-sided dice to determine how many hit you
  */
	roll4Damage(die, victory_page, success_message) {
		let midnight_self = this;

		let choicesHTML;
		let damage = this.rollDice(die);

		let html = `<div class="result">You roll a ${damage} taking ${damage} damage</div>`;

		choicesHTML = `<ul class="choicelist">`;
		choicesHTML += `<li class="textchoice" id="luck">test your luck</li>`;
		choicesHTML += `<li class="textchoice" id="continue">move on</li>`;
		choicesHTML += `</ul>`;

		const evaluateDamage = () => {
			this.displayPlayer();
			if (midnight_self.game.state.stamina <= 0) {
				choicesHTML = `<ul class="choicelist"><li class="textchoice">You have died</li></ul>`;
			} else {
				choicesHTML = `<ul class="choicelist"><li class="textchoice" id="success">${success_message}</li></ul>`;
			}

			this.updateStatus(
				`<div class="page_number">${
					this.game.state.currentpage
				}</div><div class="story">${
					this.book[this.game.state.currentpage].text
				}</div>${html}${choicesHTML}`
			);
			$('.textchoice').off();
			$('.textchoice').on('click', function () {
				let action = $(this).attr('id');
				if (action == 'success') {
					midnight_self.addMove(`page\t${victory_page}`);
					midnight_self.endTurn();
				}
			});
		};

		this.updateStatus(
			`<div class="page_number">${
				this.game.state.currentpage
			}</div><div class="story">${
				this.book[this.game.state.currentpage].text
			}</div>${html}${choicesHTML}`
		);

		$('.textchoice').off();
		$('.textchoice').on('click', function () {
			$('.textchoice').off();
			let action = $(this).attr('id');
			if (action == 'luck') {
				let luck_roll =
					midnight_self.rollDice(6) + midnight_self.rollDice(6);
				if (luck_roll <= midnight_self.game.state.luck) {
					damage = Math.ceil(damage / 2);
					html += `<div class="result">You got lucky and only took ${damage} damage</div>`;
				} else {
					html += `<div class="result">You were unlucky and took an extra 2 damage</div>`;
				}
				midnight_self.game.state.luck--;
			}
			midnight_self.game.state.stamina -= damage;
			evaluateDamage();
		});
	}

	bribeNPC(victory_page, failure_page) {
		let midnight_self = this;
		let choicesHTML = `<ul class="choicelist"><li class="textchoice" id="1">1 gold piece</li>`;
		for (let i = 2; i <= 6 && i <= this.game.state.gold; i++) {
			choicesHTML += `<li class="textchoice" id="${i}">${i} gold pieces</li>`;
		}
		choicesHTML += '</ul>';

		this.updateStatus(
			`<div class="page_number">${
				this.game.state.currentpage
			}</div><div class="story">${
				this.book[this.game.state.currentpage].text
			}</div>${choicesHTML}`
		);

		$('.textchoice').off();
		$('.textchoice').on('click', function () {
			$('.textchoice').off();
			let bribe = parseInt($(this).attr('id'));
			midnight_self.game.state.gold -= bribe;
			midnight_self.displayPlayer();

			let roll = midnight_self.rollDice(6);
			if (roll <= bribe) {
				midnight_self.addMove(`page\t${victory_page}`);
			} else {
				midnight_self.addMove(`page\t${failure_page}`);
			}
			midnight_self.endTurn();
		});
	}

	selectItem(next_page, weapon_filter = false) {
		let midnight_self = this;
		let choicesHTML = `<div class="result">Select an item from your inventory: </div><div class="special_skills">`;

		for (let s of this.game.state.inventory) {
			if (!weapon_filter || this.inventory[s].weapon) {
				choicesHTML += `<div id="${s}">${this.inventory[s].icon} : ${this.inventory[s].name}</div>`;
			}
		}
		choicesHTML += `</div>`;

		this.updateStatus(
			`<div class="page_number">${
				this.game.state.currentpage
			}</div><div class="story">${
				this.book[this.game.state.currentpage].text
			}</div>${choicesHTML}`
		);

		$('.special_skills div').off();
		$('.special_skills div').on('click', function () {
			$('.special_skills div').off();
			let item = $(this).attr('id');
			if (item == 'provisions') {
				midnight_self.game.state.provisions--;
			} else {
				midnight_self.game.state.inventory =
					midnight_self.game.state.inventory.filter(
						(f) => f !== item
					);
			}
			midnight_self.addMove(`page\t${next_page}`);
			midnight_self.endTurn();
		});
	}

	hasWeapon() {
		for (let item of this.game.state.inventory) {
			if (this.inventory[item].weapon) {
				return true;
			}
		}
		return false;
	}

	/* Function stub for adding D&D adventure elements to interactive fiction*/
	returnState() {
		let state = {};
		state.max_skill = this.rollDice(6) + 6;
		state.skill = state.max_skill;
		state.max_stamina = this.rollDice(6) + this.rollDice(6) + 12;
		state.stamina = state.max_stamina;
		state.max_luck = this.rollDice(6) + 6;
		state.luck = state.max_luck;

		state.gold = 5;
		state.provisions = 10;

		state.inventory = [
			'shortsword',
			'provisions',
			'potion',
			'lamp',
			'torch',
			'tinderbox'
		];
		state.weapon = 'shortsword';
		state.special_skills = [];

		state.events = [];
		state.keys = [];
		state.clues = {};

		state.lastpage = 0;
		state.currentpage = 0;
		return state;
	}

	returnPotions() {
		const usePotion = (potion, mod = 0) => {
			this.game.state.inventory = this.game.state.inventory.filter(
				(f) => f !== 'potion'
			);
			this.game.state[`max_${potion}`] += mod;
			this.game.state[potion] = this.game.state[`max_${potion}`];
			this.displayPlayer();
			this.game.state.potion = null;
		};

		let potions = {};
		potions['skill'] = {
			name: 'Potion of Skill',
			desc: 'restore SKILL to initial level',
			event: function () {
				usePotion('skill');
			}
		};
		potions['stamina'] = {
			name: 'Potion of Stamina',
			desc: 'restore STAMINA to initial level',
			event: function () {
				usePotion('stamina');
			}
		};
		potions['luck'] = {
			name: 'Potion of Fortune',
			desc: 'restore LUCK to initial level + 1',
			event: function () {
				usePotion('luck', 1);
			}
		};

		return potions;
	}

	returnInventory() {
		let inventory = {};
		inventory['shortsword'] = {
			name: 'Short Sword',
			weapon: true,
			icon: `<i class="fas fa-sword"></i>`
		};
		inventory['provisions'] = {
			name: 'Provisions',
			icon: `<i class="fas fa-pizza-slice food"></i>`
		};
		inventory['potion'] = {
			name: 'Potion',
			icon: `<i class="fas fa-wine-bottle potion"></i>`
		};
		inventory['lamp'] = {
			name: 'Hand-Lamp',
			icon: `<i class="fas fa-oil-can"></i>`
		};
		inventory['torch'] = {
			name: 'Torch',
			icon: `<i class="fas fa-fire"></i>`
		};
		inventory['tinderbox'] = {
			name: 'Tinder-box',
			icon: `<i class="fas fa-box"></i>`
		};
		inventory['rope'] = {
			name: 'Rope and Grapnel',
			skill: 'climb',
			icon: `<i class="fas fa-anchor"></i>`
		};
		inventory['map'] = {
			name: 'Map',
			icon: `<i class="fas fa-map"></i>`
		};
		inventory['dagger'] = {
			name: 'Dagger',
			weapon: true,
			icon: `<i class="fas fa-dagger"></i>`
		};
		inventory['lkey'] = {
			name: 'L-Key',
			icon: `<i class="fas fa-key"></i>`
		};
		inventory['rkey'] = {
			name: 'R-Key',
			icon: `<i class="fas fa-key"></i>`
		};
		inventory['disc'] = {
			name: 'Obsidian Disc',
			icon: `<i class="fas fa-compact-disc"></i>`
		};
		inventory['clock'] = {
			name: 'Black Hooded Cloack',
			skill: 'hide',
			icon: `<i class="fas fa-user-secret"></i>`
		};
		inventory['axe'] = {
			name: 'Stone Axe',
			weapon: true,
			icon: `<i class="fas fa-axe"></i>`
		};
		inventory['magicsword'] = {
			name: 'Enchanted Sword',
			weapon: true,
			icon: `<i class="fas fa-sword"></i>`
		};
		inventory['lockpick'] = {
			name: 'Lock-picks',
			skill: 'lock',
			icon: `<i class="fas fa-tools"></i>`
		};
		inventory['rags'] = {
			name: 'Rags wrapped around your feet',
			skill: 'sneak',
			icon: `<i class="fas fa-socks"></i>`
		};
		inventory['wire'] = {
			name: 'Heavy wire',
			icon: `<i class="fas fa-rainbow"></i>`
		};
		inventory['knife'] = {
			name: 'Throwing knife',
			weapon: true,
			icon: `<i class="fas fa-scalpel"></i>`
		};
		inventory['chain'] = {
			name: 'Heavy Chain',
			weapon: true,
			icon: `<i class="fas fa-link"></i>`
		};
		return inventory;
	}

	returnSkills() {
		let skills = {};
		skills['climb'] = {
			name: 'CLIMB',
			icon: `<i class="fas fa-swimming-pool"></i>`
		};
		skills['sneak'] = {
			name: 'SNEAK',
			icon: `<i class="fas fa-walking"></i>`
		};
		skills['hide'] = {
			name: 'HIDE',
			icon: `<i class="fas fa-user-secret"></i>`
		};
		skills['lock'] = {
			name: 'PICK LOCK',
			icon: `<i class="fas fa-unlock-alt"></i>`
		};
		skills['pickpocket'] = {
			name: 'PICK POCKET',
			icon: `<i class="fas fa-hand-lizard"></i>`
		};
		skills['secret'] = {
			name: 'SECRET SIGNS',
			icon: `<i class="fas fa-om"></i>`
		};
		skills['spot'] = {
			name: 'SPOT HIDDEN',
			icon: `<i class="fas fa-eye"></i>`
		};
		return skills;
	}

	returnEnemy() {
		let enemy = {};

		enemy['piranha'] = {
			name: 'Piranha(s)',
			skill: 6,
			stamina: 1
		};
		enemy['shapechanger'] = {
			name: 'Shapechanger',
			skill: 10,
			stamina: 10
		};
		enemy['woodgolem'] = {
			name: 'Wood Golem',
			skill: 8,
			stamina: 6
		};
		enemy['woodgolem2'] = {
			name: 'Wood Golem',
			skill: 8,
			stamina: 4
		};
		enemy['shadow'] = {
			name: 'Shadow',
			skill: this.game.state.skill,
			stamina: this.game.state.stamina
		};
		enemy['corpse'] = {
			name: 'Animated Corpse',
			skill: 5,
			stamina: 6
		};
		enemy['ghoul'] = {
			name: 'Ghoul',
			skill: 8,
			stamina: 7
		};
		enemy['ghoul2'] = {
			name: 'Ghoul',
			skill: 8,
			stamina: 5
		};
		enemy['thug76'] = {
			name: 'Thug',
			skill: 7,
			stamina: 6
		};
		enemy['thug66'] = {
			name: 'Thug',
			skill: 6,
			stamina: 6
		};
		enemy['thug57'] = {
			name: 'Thug',
			skill: 5,
			stamina: 7
		};
		enemy['skeletonlord'] = {
			name: 'Skeleton Lord',
			skill: 8,
			stamina: 6,
			bonus: 1
		};
		enemy['ogre'] = {
			name: 'Ogre',
			skill: 8,
			stamina: 12
		};
		enemy['ogre2'] = {
			name: 'Ogre',
			skill: 8,
			stamina: 10
		};
		enemy['snake'] = {
			name: 'Citalis',
			skill: 8,
			stamina: 12 //10, but no damage for first hit
		};
		enemy['footpad'] = {
			name: 'Footpad',
			skill: 8,
			stamina: 6
		};
		enemy['footpadx'] = {
			name: 'Footpad',
			skill: 4 + Math.ceil(4 * Math.random()),
			stamina: 4 + Math.ceil(3 * Math.random())
		};
		enemy['chest'] = {
			name: 'Chest Creature',
			skill: 5,
			stamina: 6
		};
		enemy['jibjib'] = {
			name: 'Jib-Jib',
			skill: 1,
			stamina: 2
		};
		enemy['poltergeist'] = {
			name: 'Poltergeist',
			skill: 6,
			stamina: 1
		};
		enemy['possessor'] = {
			name: 'Posessor Spirit',
			skill: 10,
			stamina: 10,
			curse: { luck: -1 }
		};
		enemy['dog'] = {
			name: 'Dog',
			skill: 7,
			stamina: 7
		};
		enemy['servants'] = {
			name: 'servants',
			skill: 7,
			stamina: 9
		};
		enemy['spider'] = {
			name: 'Giant Spider',
			skill: 7,
			stamina: 8
		};
		enemy['weed'] = {
			name: 'Tangle-weed',
			skill: 7,
			stamina: 6
		};
		enemy['gargoyle'] = {
			name: 'Gargoyle',
			skill: 9,
			stamina: 10
		};
		enemy['bats'] = {
			name: 'Bats',
			skill: 5,
			stamina: 12
		};
		enemy['guard'] = {
			name: 'Guard',
			skill: 6,
			stamina: 6
		};
		enemy['guardsman1'] = {
			name: 'First Guardsman',
			skill: 8,
			stamina: 6
		};
		enemy['guardsman2'] = {
			name: 'Second Guardsman',
			skill: 7,
			stamina: 5
		};
		enemy['unseen'] = {
			name: 'Unseen Monster',
			skill: 5,
			stamina: 8
		};
		enemy['skeleton1'] = {
			name: 'First Skeleton',
			skill: 6,
			stamina: 5
		};
		enemy['skeleton2'] = {
			name: 'Second Skeleton',
			skill: 5,
			stamina: 4
		};
		enemy['dwarf1'] = {
			name: 'First Dwarf',
			skill: 7,
			stamina: 7
		};
		enemy['dwarf2'] = {
			name: 'Second Dwarf',
			skill: 6,
			stamina: 7
		};
		enemy['dwarf3'] = {
			name: 'Third Dwarf',
			skill: 6,
			stamina: 6
		};
		enemy['crystal'] = {
			name: 'Crystal Warrior',
			skill: 10,
			stamina: 13
		};

		return enemy;
	}
}

module.exports = Midnight;
