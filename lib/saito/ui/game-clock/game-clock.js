const GameClockTemplate = require('./game-clock.template');
const GameShotClockTemplate = require("./game-clock-shot.template");

class GameClock {
	constructor(app, mod) {
		this.app = app;
		this.game_mod = mod;
		this.container = "";
		this.clock_limit = 3600000; // maximum amount of time a player can have
		this.clock_timer = null; // For individual control of the clock
		this.useShotClock = false;
	}

	render() {

		try {
			if (!document.querySelector('.game-clock')) {

				let html = (this.useShotClock) ? GameShotClockTemplate() : GameClockTemplate();

				if (this.container){
					for (let i = 1; i <= this.game_mod.game.clock.length; i++){
						let qs = this.container + i;
						this.app.browser.addElementToSelector(html, qs);
					}
				}else{
					this.app.browser.addElementToDom(html);
					this.attachEvents();
				}
			}

			//document.getElementById('game-clock').style.display = 'block';

		} catch (err) {}

	}

	attachEvents() {
		try {
			document
				.querySelector('.game-clock')
				.addEventListener('click', (e) => {
					this.moveClock();
				});
		} catch (err) {}
	}

	returnHours(x) {
		if (x <= 0) {
			return 0;
		}
		return Math.floor(this.returnMinutes(x) / 60);
	}
	returnMinutes(x) {
		if (x <= 0) {
			return 0;
		}
		return Math.floor(this.returnSeconds(x) / 60);
	}
	returnSeconds(x) {
		if (x <= 0) {
			return 0;
		}
		return Math.floor(x / 1000);
	}

	startClock(time, player = 0) {
		clearInterval(this.clock_timer); //Just in case
		this.clock_limit = time;
		this.render();

		let baseTime = new Date().getTime() + time;

		//Refresh the clock every second
		this.clock_timer = setInterval(() => {
			let currentTime = new Date().getTime();

			let timeLeft = baseTime - currentTime;

			if (timeLeft <= 0) {
				clearInterval(this.clock_timer);
				this.displayTime(0, player);
			}
			this.displayTime(timeLeft, player);
		}, 79);
	}

	stopClock(){
		clearInterval(this.clock_timer);
		setTimeout(()=> {
			this.hide();	
		}, 800); 
	}

	displayTime(clock, player = 0) {

		this.show();

		let hours = this.returnHours(clock);
		let minutes = this.returnMinutes(clock);
		let seconds = this.returnSeconds(clock);
		let ms = clock % 1000;

		seconds = seconds - minutes * 60;
		minutes = minutes - hours * 60;

		if (hours < 0) {
			hours = 0;
		}
		if (minutes < 0) {
			minutes = 0;
		}
		if (seconds < 0) {
			seconds = 0;
		}

		if (minutes < 10) {
			minutes = '0' + minutes;
		}

		if (seconds < 10) {
			seconds = '0' + seconds;
		}

		let qs = "";
		if (this.container && player){
			qs = this.container+player + " ";
		}

		if (document.querySelector(qs + '#game-clock-hours')){
			document.querySelector(qs + '#game-clock-hours').innerHTML = hours;
		}
		if (document.querySelector(qs + '#game-clock-minutes')){
			document.querySelector(qs + '#game-clock-minutes').innerHTML = minutes;
		}
		if (document.querySelector(qs + '#game-clock-seconds')){
			document.querySelector(qs + '#game-clock-seconds').innerHTML = seconds;	
		}
		if (document.querySelector(qs + '#game-clock-miliseconds')){
			ms = ms.toString().padStart(3, "0");
			document.querySelector(qs + '#game-clock-miliseconds').innerHTML = ms;
		}

		if (document.querySelector(qs + '.game-clock')){
			document.querySelector(qs + '.game-clock').style.color = this.analyzeTime(clock);	
		}

	}

	analyzeTime(clock) {
		if (clock / this.clock_limit > 0.8) {
			return 'darkorange'
		}
		if (clock / this.clock_limit > 0.65) {
			return 'darkorange';
		}
		if (clock / this.clock_limit > 0.5) {
			return 'gold';
		}
		if (clock / this.clock_limit > 0.3) {
			return 'orange';
		}
		if (clock / this.clock_limit > 0.15) {
			return 'orangered';
		}
		return '';
	}

	moveClock() {
		let c = document.querySelector('.game-clock');

		if (
			c.style.top === '0px' ||
			c.style.top == null ||
			c.style.top === ' ' ||
			c.style.top == ''
		) {
			c.style.top = 'unset';
			c.style.bottom = '0px';
		} else {
			c.style.bottom = 'unset';
			c.style.top = '0px';
		}
	}

	show() {
		let c = document.querySelectorAll('.game-clock');
		for (let clock of c) {
			clock.style.display = '';
		}
	}

	hide() {
		let c = document.querySelectorAll('.game-clock');
		for (let clock of c) {
			clock.style.display = 'none';
		}
	}
}

	/*
	Sample code for a shot-clock

	startClock() {
		if (!this.useClock || this.game.over) {
			return;
		}

		clearTimeout(this.clock_timer); //Just in case

		this.clock.startClock(this.game.clock_limit);

		//Refresh the clock every second
		this.clock_timer = setTimeout(() => {
			this.clock.displayTime(0);
			salert('Turn ended automatically');
			this.clearBoard();
			this.removeEvents();
			this.addMove('discard_tiles\t' + this.game.player + '\t');
			this.endTurn();
		}, this.game.clock_limit);
	}

	stopClock() {
		if (!this.useClock) {
			return;
		}
		clearTimeout(this.clock_timer);
		this.clock.stopClock();
	}*/


module.exports = GameClock;
