/**
 *  So we can swap out image assets
 *  Must define boardsize and cardsize
 *
 *  returnCities
 *  returnPlayers
 *  returnInfectionCards
 *  returnPlayerCards
 *  displayOutbreaks
 *  displayDecks
 *  displayVials
 *  displayInfectionRate
 *
 */
class PandemicOriginalSkin {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.boardWidth = 2602;
		this.card_height_ratio = 1.41;
		this.cities = this.returnCities();
		this.cards = this.returnPlayerCards();
		this.epidemic = { img: 'Epidemic.jpg' };
		this.actionKey = 'ActionKey.jpg';
	}

	render() {
		this.mod.gamename = 'Pandemic';

		$('#gameboard').css({
			'background-image': `url("/${this.mod.name.toLowerCase()}/img/Board.jpg")`,
			'background-size': 'cover',
			width: '2602px',
			height: '1812px'
		});
	}

	displayCities() {
		let board = document.getElementById('gameboard');
		for (var i in this.cities) {
			try {
				let city = document.getElementById(i);
				if (!city) {
					this.app.browser.addElementToElement(
						`<div class="city" id="${i}"><div class="infectionCubes"></div></div>`,
						board
					);
					city = document.getElementById(i);
				}

				city.style.top = this.mod.scale(this.cities[i].top) + 'px';
				city.style.left = this.mod.scale(this.cities[i].left) + 'px';
			} catch (err) {
				console.log(`Error with positioning cities`, err);
			}
		}
	}

	returnDiseaseImg(color) {
		return `/${this.mod.name.toLowerCase()}/img/cube_${color}.png`;
	}

	getVirusName(virus) {
		return virus;
	}

	queryPlayer(role) {
		let player = {};
		if (role === 'generalist') {
			player.name = 'Generalist';
			player.pawn = `<img src="/${this.mod.name.toLowerCase()}/img/Pawn%20Generalist.png"/>`;
			player.card = 'Role%20-%20Generalist.jpg';
			player.desc =
				'The Generalist may take an extra move every turn, performing 5 actions instead of 4';
			player.moves = 5;
			player.type = 1;
		}
		if (role === 'scientist') {
			player.name = 'Scientist';
			player.pawn = `<img src="/${this.mod.name.toLowerCase()}/img/Pawn%20Scientist.png"/>`;
			player.card = 'Role%20-%20Scientist.jpg';
			player.desc =
				'The Scientist may research a vaccine with only 4 cards instead of 5';
			player.type = 2;
		}
		if (role === 'medic') {
			player.name = 'Medic';
			player.pawn = `<img src="/${this.mod.name.toLowerCase()}/img/Pawn%20Medic.png"/>`;
			player.card = 'Role%20-%20Medic.jpg';
			player.desc =
				'The Medic may remove all disease cubes in a city when they treat disease. Once a disease has been cured, the medic removes cubes of that color merely by being in the city.';
			player.type = 3;
		}
		if (role === 'operationsexpert') {
			player.name = 'Operations Expert';
			player.pawn = `<img src="/${this.mod.name.toLowerCase()}/img/Pawn%20Operations%20Expert.png"/>`;
			player.card = 'Role%20-%20Operations%20Expert.jpg';
			player.desc =
				'The Operations Expert may build a research center in their current city as an action, or may discard a card to move from a research center to any other city.';
			player.type = 4;
		}
		if (role === 'quarantinespecialist') {
			player.name = 'Quarantine Specialist';
			player.pawn = `<img src="/${this.mod.name.toLowerCase()}/img/Pawn%20Quarantine%20Specialist.png"/>`;
			player.card = 'Role%20-%20Quarantine%20Specialist.jpg';
			player.desc =
				'The Quarantine Specialist prevents both the placement of disease cubes and outbreaks in her present city and all neighboring cities. Initial placement of disease cubes is not affected by the Quarantine Specialist.';
			player.type = 5;
		}
		if (role === 'researcher') {
			player.name = 'Researcher';
			player.pawn = `<img src="/${this.mod.name.toLowerCase()}/img/Pawn%20Researcher.png"/>`;
			player.card = 'Role%20-%20Researcher.jpg';
			player.desc =
				'The Researcher may give any City card to another player in the same city as them. The transfer must go from the Researcher to the other player.';
			player.type = 6;
		}
		player.role = role;
		return player;
	}

	returnCities() {
		var cities = {};

		cities['sanfrancisco'] = {
			top: 560,
			left: 95,
			neighbours: ['tokyo', 'manila', 'losangeles', 'chicago'],
			name: 'San Francisco',
			virus: 'blue'
		};
		cities['chicago'] = {
			top: 490,
			left: 340,
			neighbours: [
				'sanfrancisco',
				'losangeles',
				'mexicocity',
				'atlanta',
				'montreal'
			],
			name: 'Chicago',
			virus: 'blue'
		};
		cities['montreal'] = {
			top: 480,
			left: 530,
			neighbours: ['chicago', 'newyork', 'washington'],
			name: 'Montreal',
			virus: 'blue'
		};
		cities['newyork'] = {
			top: 505,
			left: 675,
			neighbours: ['montreal', 'washington', 'london', 'madrid'],
			name: 'New York',
			virus: 'blue'
		};
		cities['washington'] = {
			top: 625,
			left: 615,
			neighbours: ['montreal', 'newyork', 'miami', 'atlanta'],
			name: 'Washington',
			virus: 'blue'
		};
		cities['atlanta'] = {
			top: 630,
			left: 410,
			neighbours: ['chicago', 'miami', 'washington'],
			name: 'Atlanta',
			virus: 'blue'
		};
		cities['losangeles'] = {
			top: 750,
			left: 135,
			neighbours: ['sydney', 'sanfrancisco', 'mexicocity', 'chicago'],
			name: 'Los Angeles',
			virus: 'yellow'
		};
		cities['mexicocity'] = {
			top: 815,
			left: 315,
			neighbours: ['chicago', 'losangeles', 'miami', 'bogota', 'lima'],
			name: 'Mexico City',
			virus: 'yellow'
		};
		cities['miami'] = {
			top: 790,
			left: 530,
			neighbours: ['washington', 'atlanta', 'mexicocity', 'bogota'],
			name: 'Miami',
			virus: 'yellow'
		};
		cities['bogota'] = {
			top: 980,
			left: 515,
			neighbours: [
				'miami',
				'mexicocity',
				'lima',
				'saopaulo',
				'buenosaires'
			],
			name: 'Bogota',
			virus: 'yellow'
		};
		cities['lima'] = {
			top: 1180,
			left: 445,
			neighbours: ['santiago', 'bogota', 'mexicocity'],
			name: 'Lima',
			virus: 'yellow'
		};
		cities['santiago'] = {
			top: 1390,
			left: 470,
			neighbours: ['lima'],
			name: 'Santiago',
			virus: 'yellow'
		};
		cities['buenosaires'] = {
			top: 1355,
			left: 670,
			neighbours: ['saopaulo', 'bogota'],
			name: 'Buenos Aires',
			virus: 'yellow'
		};
		cities['saopaulo'] = {
			top: 1210,
			left: 780,
			neighbours: ['bogota', 'buenosaires', 'madrid', 'lagos'],
			name: 'Sao Paulo',
			virus: 'yellow'
		};
		cities['lagos'] = {
			top: 950,
			left: 1150,
			neighbours: ['saopaulo', 'khartoum', 'kinshasa'],
			name: 'Lagos',
			virus: 'yellow'
		};
		cities['khartoum'] = {
			top: 910,
			left: 1395,
			neighbours: ['cairo', 'lagos', 'kinshasa', 'johannesburg'],
			name: 'Khartoum',
			virus: 'yellow'
		};
		cities['kinshasa'] = {
			top: 1080,
			left: 1275,
			neighbours: ['lagos', 'khartoum', 'johannesburg'],
			name: 'Kinshasa',
			virus: 'yellow'
		};
		cities['johannesburg'] = {
			top: 1270,
			left: 1385,
			neighbours: ['kinshasa', 'khartoum'],
			name: 'Johannesburg',
			virus: 'yellow'
		};
		cities['london'] = {
			top: 390,
			left: 1025,
			neighbours: ['newyork', 'madrid', 'essen', 'paris'],
			name: 'London',
			virus: 'blue'
		};
		cities['madrid'] = {
			top: 580,
			left: 1005,
			neighbours: ['newyork', 'paris', 'london', 'algiers', 'saopaulo'],
			name: 'Madrid',
			virus: 'blue'
		};
		cities['essen'] = {
			top: 360,
			left: 1220,
			neighbours: ['stpetersburg', 'london', 'milan', 'paris'],
			name: 'Essen',
			virus: 'blue'
		};
		cities['paris'] = {
			top: 485,
			left: 1170,
			neighbours: ['london', 'essen', 'madrid', 'milan', 'algiers'],
			name: 'Paris',
			virus: 'blue'
		};
		cities['stpetersburg'] = {
			top: 320,
			left: 1430,
			neighbours: ['essen', 'moscow', 'istanbul'],
			name: 'St. Petersburg',
			virus: 'blue'
		};
		cities['milan'] = {
			top: 450,
			left: 1300,
			neighbours: ['essen', 'istanbul', 'paris'],
			name: 'Milan',
			virus: 'blue'
		};
		cities['algiers'] = {
			top: 685,
			left: 1220,
			neighbours: ['madrid', 'paris', 'cairo', 'istanbul'],
			name: 'Algiers',
			virus: 'black'
		};
		cities['cairo'] = {
			top: 720,
			left: 1360,
			neighbours: [
				'khartoum',
				'algiers',
				'istanbul',
				'baghdad',
				'riyadh'
			],
			name: 'Cairo',
			virus: 'black'
		};
		cities['istanbul'] = {
			top: 560,
			left: 1385,
			neighbours: [
				'stpetersburg',
				'milan',
				'algiers',
				'cairo',
				'baghdad',
				'moscow'
			],
			name: 'Istanbul',
			virus: 'black'
		};
		cities['moscow'] = {
			top: 450,
			left: 1535,
			neighbours: ['stpetersburg', 'tehran', 'istanbul'],
			name: 'Moscow',
			virus: 'black'
		};
		cities['baghdad'] = {
			top: 660,
			left: 1525,
			neighbours: ['cairo', 'riyadh', 'karachi', 'tehran', 'istanbul'],
			name: 'Baghdad',
			virus: 'black'
		};
		cities['riyadh'] = {
			top: 830,
			left: 1545,
			neighbours: ['cairo', 'baghdad', 'karachi'],
			name: 'Riyadh',
			virus: 'black'
		};
		cities['tehran'] = {
			top: 540,
			left: 1665,
			neighbours: ['moscow', 'karachi', 'baghdad', 'delhi'],
			name: 'Tehran',
			virus: 'black'
		};
		cities['karachi'] = {
			top: 720,
			left: 1705,
			neighbours: ['baghdad', 'tehran', 'delhi', 'riyadh', 'mumbai'],
			name: 'Karachi',
			virus: 'black'
		};
		cities['mumbai'] = {
			top: 865,
			left: 1720,
			neighbours: ['chennai', 'karachi', 'delhi'],
			name: 'Mumbai',
			virus: 'black'
		};
		cities['delhi'] = {
			top: 670,
			left: 1845,
			neighbours: ['tehran', 'karachi', 'mumbai', 'chennai', 'kolkata'],
			name: 'Delhi',
			virus: 'black'
		};
		cities['chennai'] = {
			top: 965,
			left: 1870,
			neighbours: ['mumbai', 'delhi', 'kolkata', 'bangkok', 'jakarta'],
			name: 'Chennai',
			virus: 'black'
		};
		cities['kolkata'] = {
			top: 715,
			left: 1975,
			neighbours: ['delhi', 'chennai', 'bangkok', 'hongkong'],
			name: 'Kolkata',
			virus: 'black'
		};
		cities['bangkok'] = {
			top: 880,
			left: 2005,
			neighbours: [
				'kolkata',
				'hongkong',
				'chennai',
				'jakarta',
				'hochiminhcity'
			],
			name: 'Bangkok',
			virus: 'red'
		};
		cities['jakarta'] = {
			top: 1130,
			left: 2005,
			neighbours: ['chennai', 'bangkok', 'hochiminhcity', 'sydney'],
			name: 'Jakarta',
			virus: 'red'
		};
		cities['sydney'] = {
			top: 1390,
			left: 2420,
			neighbours: ['jakarta', 'manila', 'losangeles'],
			name: 'Sydney',
			virus: 'red'
		};
		cities['manila'] = {
			top: 1000,
			left: 2305,
			neighbours: [
				'sydney',
				'hongkong',
				'hochiminhcity',
				'sanfrancisco',
				'taipei'
			],
			name: 'Manila',
			virus: 'red'
		};
		cities['hochiminhcity'] = {
			top: 1010,
			left: 2120,
			neighbours: ['jakarta', 'bangkok', 'hongkong', 'manila'],
			name: 'Ho Chi Minh City',
			virus: 'red'
		};
		cities['hongkong'] = {
			top: 790,
			left: 2115,
			neighbours: [
				'hochiminhcity',
				'shanghai',
				'bangkok',
				'kolkata',
				'taipei',
				'manila'
			],
			name: 'Hong Kong',
			virus: 'red'
		};
		cities['taipei'] = {
			top: 765,
			left: 2270,
			neighbours: ['shanghai', 'hongkong', 'manila', 'osaka'],
			name: 'Taipei',
			virus: 'red'
		};
		cities['shanghai'] = {
			top: 630,
			left: 2095,
			neighbours: ['beijing', 'hongkong', 'taipei', 'seoul', 'tokyo'],
			name: 'Shanghai',
			virus: 'red'
		};
		cities['beijing'] = {
			top: 500,
			left: 2085,
			neighbours: ['shanghai', 'seoul'],
			name: 'Beijing',
			virus: 'red'
		};
		cities['seoul'] = {
			top: 485,
			left: 2255,
			neighbours: ['beijing', 'shanghai', 'tokyo'],
			name: 'Seoul',
			virus: 'red'
		};
		cities['tokyo'] = {
			top: 565,
			left: 2385,
			neighbours: ['seoul', 'shanghai', 'sanfrancisco', 'osaka'],
			name: 'Tokyo',
			virus: 'red'
		};
		cities['osaka'] = {
			top: 710,
			left: 2405,
			neighbours: ['taipei', 'tokyo'],
			name: 'Osaka',
			virus: 'red'
		};

		return cities;
	}

	returnInfectionCards() {
		var deck = {};

		deck['sanfrancisco'] = {
			img: 'Infection%20Blue%20San%20Francisco.jpg'
		};
		deck['chicago'] = { img: 'Infection%20Blue%20Chicago.jpg' };
		deck['montreal'] = { img: 'Infection%20Blue%20Toronto.jpg' };
		deck['newyork'] = { img: 'Infection%20Blue%20New%20York.jpg' };
		deck['washington'] = { img: 'Infection%20Blue%20Washington.jpg' };
		deck['atlanta'] = { img: 'Infection%20Blue%20Atlanta.jpg' };
		deck['losangeles'] = { img: 'Infection%20Yellow%20Los%20Angeles.jpg' };
		deck['mexicocity'] = { img: 'Infection%20Yellow%20Mexico%20City.jpg' };
		deck['miami'] = { img: 'Infection%20Yellow%20Miami.jpg' };
		deck['bogota'] = { img: 'Infection%20Yellow%20Bogota.jpg' };
		deck['lima'] = { img: 'Infection%20Yellow%20Lima.jpg' };
		deck['santiago'] = { img: 'Infection%20Yellow%20Santiago.jpg' };
		deck['buenosaires'] = {
			img: 'Infection%20Yellow%20Buenos%20Aires.jpg'
		};
		deck['saopaulo'] = { img: 'Infection%20Yellow%20Sao%20Paulo.jpg' };
		deck['lagos'] = { img: 'Infection%20Yellow%20Lagos.jpg' };
		deck['khartoum'] = { img: 'Infection%20Yellow%20Khartoum.jpg' };
		deck['kinshasa'] = { img: 'Infection%20Yellow%20Kinsasha.jpg' };
		deck['johannesburg'] = { img: 'Infection%20Yellow%20Johannesburg.jpg' };
		deck['london'] = { img: 'Infection%20Blue%20London.jpg' };
		deck['madrid'] = { img: 'Infection%20Blue%20Madrid.jpg' };
		deck['essen'] = { img: 'Infection%20Blue%20Essen.jpg' };
		deck['paris'] = { img: 'Infection%20Blue%20Paris.jpg' };
		deck['stpetersburg'] = {
			img: 'Infection%20Blue%20St.%20Petersburg.jpg'
		};
		deck['milan'] = { img: 'Infection%20Blue%20Milan.jpg' };
		deck['algiers'] = { img: 'Infection%20Black%20Algiers.jpg' };
		deck['cairo'] = { img: 'Infection%20Black%20Cairo.jpg' };
		deck['istanbul'] = { img: 'Infection%20Black%20Istanbul.jpg' };
		deck['moscow'] = { img: 'Infection%20Black%20Moscow.jpg' };
		deck['baghdad'] = { img: 'Infection%20Black%20Baghdad.jpg' };
		deck['riyadh'] = { img: 'Infection%20Black%20Riyadh.jpg' };
		deck['tehran'] = { img: 'Infection%20Black%20Tehran.jpg' };
		deck['karachi'] = { img: 'Infection%20Black%20Karachi.jpg' };
		deck['mumbai'] = { img: 'Infection%20Black%20Mumbai.jpg' };
		deck['delhi'] = { img: 'Infection%20Black%20Delhi.jpg' };
		deck['chennai'] = { img: 'Infection%20Black%20Chennai.jpg' };
		deck['kolkata'] = { img: 'Infection%20Black%20Kolkata.jpg' };
		deck['bangkok'] = { img: 'Infection%20Red%20Bangkok.jpg' };
		deck['jakarta'] = { img: 'Infection%20Red%20Jakarta.jpg' };
		deck['sydney'] = { img: 'Infection%20Red%20Sydney.jpg' };
		deck['manila'] = { img: 'Infection%20Red%20Manila.jpg' };
		deck['hochiminhcity'] = {
			img: 'Infection%20Red%20Ho%20Chi%20Minh%20City.jpg'
		};
		deck['hongkong'] = { img: 'Infection%20Red%20Hong%20Kong.jpg' };
		deck['taipei'] = { img: 'Infection%20Red%20Taipei.jpg' };
		deck['shanghai'] = { img: 'Infection%20Red%20Shanghai.jpg' };
		deck['beijing'] = { img: 'Infection%20Red%20Beijing.jpg' };
		deck['seoul'] = { img: 'Infection%20Red%20Seoul.jpg' };
		deck['tokyo'] = { img: 'Infection%20Red%20Tokyo.jpg' };
		deck['osaka'] = { img: 'Infection%20Red%20Osaka.jpg' };

		return deck;
	}

	returnPlayerCards() {
		var deck = {};
		//48 city cards
		deck['sanfrancisco'] = {
			img: 'Card%20Blue%20San%20Francisco.jpg',
			name: 'San Francisco'
		};
		deck['chicago'] = {
			img: 'Card%20Blue%20Chicago.jpg',
			name: 'Chicago'
		};
		deck['montreal'] = {
			img: 'Card%20Blue%20Toronto.jpg',
			name: 'Montreal'
		};
		deck['newyork'] = {
			img: 'Card%20Blue%20New%20York.jpg',
			name: 'New York'
		};
		deck['washington'] = {
			img: 'Card%20Blue%20Washington.jpg',
			name: 'Washington'
		};
		deck['atlanta'] = {
			img: 'Card%20Blue%20Atlanta.jpg',
			name: 'Atlanta'
		};
		deck['london'] = {
			img: 'Card%20Blue%20London.jpg',
			name: 'London'
		};
		deck['madrid'] = {
			img: 'Card%20Blue%20Madrid.jpg',
			name: 'Madrid'
		};
		deck['essen'] = {
			img: 'Card%20Blue%20Essen.jpg',
			name: 'Essen'
		};
		deck['paris'] = {
			img: 'Card%20Blue%20Paris.jpg',
			name: 'Paris'
		};
		deck['stpetersburg'] = {
			img: 'Card%20Blue%20St.%20Petersburg.jpg',
			name: 'St. Petersburg'
		};
		deck['milan'] = {
			img: 'Card%20Blue%20Milan.jpg',
			name: 'Milan'
		};
		deck['losangeles'] = {
			img: 'Card%20Yellow%20Los%20Angeles.jpg',
			name: 'Los Angeles'
		};
		deck['mexicocity'] = {
			img: 'Card%20Yellow%20Mexico%20City.jpg',
			name: 'Mexico City'
		};
		deck['miami'] = {
			img: 'Card%20Yellow%20Miami.jpg',
			name: 'Miami'
		};
		deck['bogota'] = {
			img: 'Card%20Yellow%20Bogota.jpg',
			name: 'Bogota'
		};
		deck['lima'] = {
			img: 'Card%20Yellow%20Lima.jpg',
			name: 'Lima'
		};
		deck['santiago'] = {
			img: 'Card%20Yellow%20Santiago.jpg',
			name: 'Santiago'
		};
		deck['buenosaires'] = {
			img: 'Card%20Yellow%20Buenos%20Aires.jpg',
			name: 'Buenos Aires'
		};
		deck['saopaulo'] = {
			img: 'Card%20Yellow%20Sao%20Paulo.jpg',
			name: 'Sao Paulo'
		};
		deck['lagos'] = {
			img: 'Card%20Yellow%20Lagos.jpg',
			name: 'Lagos'
		};
		deck['khartoum'] = {
			img: 'Card%20Yellow%20Khartoum.jpg',
			name: 'Khartoum'
		};
		deck['kinshasa'] = {
			img: 'Card%20Yellow%20Kinsasha.jpg',
			name: 'Kinshasa'
		};
		deck['johannesburg'] = {
			img: 'Card%20Yellow%20Johannesburg.jpg',
			name: 'Johannesburg'
		};
		deck['algiers'] = {
			img: 'Card%20Black%20Algiers.JPG',
			name: 'Algiers'
		};
		deck['cairo'] = {
			img: 'Card%20Black%20Cairo.jpg',
			name: 'Cairo'
		};
		deck['istanbul'] = {
			img: 'Card%20Black%20Istanbul.jpg',
			name: 'Istanbul'
		};
		deck['moscow'] = {
			img: 'Card%20Black%20Moscow.jpg',
			name: 'Moscow'
		};
		deck['baghdad'] = {
			img: 'Card%20Black%20Baghdad.jpg',
			name: 'Baghdad'
		};
		deck['riyadh'] = {
			img: 'Card%20Black%20Riyadh.jpg',
			name: 'Riyadh'
		};
		deck['tehran'] = {
			img: 'Card%20Black%20Tehran.jpg',
			name: 'Tehran'
		};
		deck['karachi'] = {
			img: 'Card%20Black%20Karachi.jpg',
			name: 'Karachi'
		};
		deck['mumbai'] = {
			img: 'Card%20Black%20Mumbai.jpg',
			name: 'Mumbai'
		};
		deck['delhi'] = {
			img: 'Card%20Black%20Delhi.jpg',
			name: 'New Delhi'
		};
		deck['chennai'] = {
			img: 'Card%20Black%20Chennai.jpg',
			name: 'Chennai'
		};
		deck['kolkata'] = {
			img: 'Card%20Black%20Kolkata.jpg',
			name: 'Kolkata'
		};
		deck['bangkok'] = {
			img: 'Card%20Red%20Bangkok.jpg',
			name: 'Bangkok'
		};
		deck['jakarta'] = {
			img: 'Card%20Red%20Jakarta.jpg',
			name: 'Jakarta'
		};
		deck['sydney'] = {
			img: 'Card%20Red%20Sydney.jpg',
			name: 'Sydney'
		};
		deck['manila'] = {
			img: 'Card%20Red%20Manila.jpg',
			name: 'Manila'
		};
		deck['hochiminhcity'] = {
			img: 'Card%20Red%20Ho%20Chi%20Minh%20City.jpg',
			name: 'Ho Chi Minh City'
		};
		deck['hongkong'] = {
			img: 'Card%20Red%20Hong%20Kong.jpg',
			name: 'Hong Kong'
		};
		deck['taipei'] = {
			img: 'Card%20Red%20Taipei.jpg',
			name: 'Taipei'
		};
		deck['shanghai'] = {
			img: 'Card%20Red%20Shanghai.jpg',
			name: 'Shanghai'
		};
		deck['beijing'] = {
			img: 'Card%20Red%20Beijing.jpg',
			name: 'Beijing'
		};
		deck['seoul'] = {
			img: 'Card%20Red%20Seoul.jpg',
			name: 'Seoul'
		};
		deck['tokyo'] = {
			img: 'Card%20Red%20Tokyo.jpg',
			name: 'Tokyo'
		};
		deck['osaka'] = {
			img: 'Card%20Red%20Osaka.jpg',
			name: 'Osaka'
		};

		//and 5 event cards

		deck['event1'] = {
			img: 'Special%20Event%20-%20Airlift.jpg',
			name: 'Airlift'
		};
		deck['event2'] = {
			img: 'Special%20Event%20-%20Resilient%20Population.jpg',
			name: 'Resilient Population'
		};
		deck['event3'] = {
			img: 'Special%20Event%20-%20One%20Quiet%20Night.jpg',
			name: 'One Quiet Night'
		};
		deck['event4'] = {
			img: 'Special%20Event%20-%20Forecast.jpg',
			name: 'Forecast'
		};
		deck['event5'] = {
			img: 'Special%20Event%20-%20Government%20Grant.jpg',
			name: 'Government Grant'
		};

		return deck;
	}

	displayOutbreaks(outbreaks) {
		try {
			let marker = document.getElementById('marker_outbreak');
			if (!marker) {
				this.app.browser.addElementToElement(
					`<div id="marker_outbreak" class="marker_outbreak"></div>`,
					document.getElementById('gameboard')
				);
				marker = document.getElementById('marker_outbreak');
			}
			let t = 982 + 80 * outbreaks;
			let l = outbreaks % 2 === 0 ? 90 : 188;

			marker.style.top = this.mod.scale(t) + 'px';
			marker.style.left = this.mod.scale(l) + 'px';
		} catch (err) {
			console.log(err);
		}
	}

	displayDecks() {
		//console.log(this.mod.game.deck);
		let html = '';
		let board = document.getElementById('gameboard');

		for (let i = 0; i < this.mod.game.deck[0].discards.length; i++) {
			html += `<img style="bottom:${2 * i}px; right:${
				2 * i
			}px;" src="/${this.mod.name.toLowerCase()}/img/${
				this.mod.game.deck[0].cards[this.mod.game.deck[0].discards[i]]
					.img
			}" />`;
		}
		if (document.querySelector('.infection_discard_pile')) {
			document.querySelector('.infection_discard_pile').innerHTML = html;
		} else {
			this.app.browser.addElementToElement(
				`<div class="deck infection_discard_pile">${html}</div>`,
				board
			);
		}

		html = '';
		for (let i = 0; i < this.mod.game.deck[1].discards.length; i++) {
			html += `<img style="bottom:${2 * i}px; right:${
				2 * i
			}px;" src="/${this.mod.name.toLowerCase()}/img/${
				this.mod.game.deck[1].cards[this.mod.game.deck[1].discards[i]]
					.img
			}" />`;
		}
		if (document.querySelector('.player_discard_pile')) {
			document.querySelector('.player_discard_pile').innerHTML = html;
		} else {
			this.app.browser.addElementToElement(
				`<div class="deck player_discard_pile">${html}</div>`,
				board
			);
		}

		html = '';
		for (let i = 0; i < this.mod.game.deck[0].crypt.length; i++) {
			html += `<img src="/${this.mod.name.toLowerCase()}/img/Back%20Infection.gif" style="bottom:${i}px;right:${i}px"/>`;
		}
		if (document.querySelector('.back_infection_card')) {
			document.querySelector('.back_infection_card').innerHTML = html;
		} else {
			this.app.browser.addElementToElement(
				`<div class="deck back_infection_card">${html}</div>`,
				board
			);
		}

		html = '';
		for (let i = 0; i < this.mod.game.deck[1].crypt.length; i++) {
			html += `<img src="/${this.mod.name.toLowerCase()}/img/Back%20Player%20Card.gif" style="bottom:${i}px;right:${i}px"/>`;
		}
		if (document.querySelector('.back_player_card')) {
			document.querySelector('.back_player_card').innerHTML = html;
		} else {
			this.app.browser.addElementToElement(
				`<div class="deck back_player_card">${html}</div>`,
				board
			);
		}
	}

	displayVials() {
		for (let v in this.mod.game.state.cures) {
			let div = document.querySelector('.vial_' + v);
			if (!div) {
				this.app.browser.addElementToElement(
					`<div class="vial vial_${v}"></div>`,
					document.getElementById('gameboard')
				);
				div = document.querySelector('.vial_' + v);
			}

			if (this.mod.game.state.cures[v]) {
				div.style.top = this.mod.scale(1570) + 'px';
				div.style.opacity = '1';
				if (this.mod.isEradicated(v)) {
					let virus_string = v.charAt(0).toUpperCase() + v.slice(1);
					div.style.backgroundImage = `url("/${this.mod.name.toLowerCase()}/img/Vial%20${virus_string}%20Eradicated.png")`;
				}
			} else {
				div.style.top = this.mod.scale(1703) + 'px';
				div.style.opacity = '0.6';
			}
		}
		$('.vial_yellow').css('left', this.mod.scale(816) + 'px');
		$('.vial_red').css('left', this.mod.scale(940) + 'px');
		$('.vial_blue').css('left', this.mod.scale(1068) + 'px');
		$('.vial_black').css('left', this.mod.scale(1182) + 'px');
	}

	displayResearchStations(station_list) {
		try {
			for (let i = 0; i < station_list.length; i++) {
				let divname = '#station_' + (i + 1);
				if (!document.querySelector(divname)) {
					this.app.browser.addElementToElement(
						`<div id="station_${
							i + 1
						}" class="research_station"></div>`,
						document.getElementById('gameboard')
					);
				}

				let city = station_list[i];

				let t = this.cities[city].top + 25;
				let l = this.cities[city].left + 25;

				$(divname).css('top', this.mod.scale(t) + 'px');
				$(divname).css('left', this.mod.scale(l) + 'px');
				$(divname).css('display', 'block');
			}
		} catch (err) {
			console.log(err);
		}
	}

	displayInfectionRate(infection_rate) {
		try {
			let marker = document.getElementById('marker_infection_rate');

			if (!marker) {
				this.app.browser.addElementToElement(
					`<div id="marker_infection_rate" class="marker_infection_rate"></div>`,
					document.getElementById('gameboard')
				);
				marker = document.getElementById('marker_infection_rate');
			}

			let t = 350;
			let l = 1650 + 95 * infection_rate;

			marker.style.top = this.mod.scale(t) + 'px';
			marker.style.left = this.mod.scale(l) + 'px';
		} catch (err) {
			console.log(err);
		}
	}

	animateInfection(city, msg, dontplace, mycallback) {
		let pandemic_self = this.mod;

		let html = `<ul><li class="textchoice confirmit" id="confirmit">I understand...</li></ul>`;

		pandemic_self.defaultDeck = 0;
		pandemic_self.card_height_ratio = 0.709;
		pandemic_self.cardbox.show(city);
		document.getElementById('game-cardbox').style.pointerEvents = 'unset';
		document.getElementById('game-cardbox').classList.add('confirmit');
		try {
			pandemic_self.updateStatusWithOptions(msg, html);
			$('.confirmit').on('click', async (e) => {
				$('.confirmit').off();
				$('.textchoice.confirmit').addClass('confirmed');
				let cb = window.getComputedStyle(
					document.querySelector('#game-cardbox')
				);
				let dp = document
					.querySelector('.infection_discard_pile')
					.getBoundingClientRect();
				let sizedif = Math.round((100 * dp.width) / parseInt(cb.width));
				document.getElementById('game-cardbox').style.transition =
					'transform 1.5s, left 1.5s, top 1.5s';
				document.getElementById('game-cardbox').style.transformOrigin =
					'left top';
				document
					.getElementById('game-cardbox')
					.classList.remove('confirmit');
				//console.log(`++Cardbox++ Left: ${cb.left}, Top: ${cb.top}`);
				//console.log(`++Discard++ Left: ${dp.left}, Top: ${dp.top}, Right: ${dp.right}, Bottom: ${dp.bottom}`);
				document.getElementById(
					'game-cardbox'
				).style.transform = `scale(${sizedif}%)`;
				document.getElementById('game-cardbox').style.top = `${dp.top}`;
				document.getElementById(
					'game-cardbox'
				).style.left = `${dp.left}`;

				setTimeout(() => {
					pandemic_self.defaultDeck = 1;
					pandemic_self.card_height_ratio = 1.41;
					//document.getElementById("game-cardbox").classList.remove("move-to-discard");
					document.getElementById('game-cardbox').style.transition =
						'';
					document.getElementById('game-cardbox').style.transform =
						'';
					document.getElementById('game-cardbox').style.top = '';
					document.getElementById('game-cardbox').style.left = '';
					document.getElementById(
						'game-cardbox'
					).style.transformOrigin = '';
					pandemic_self.cardbox.hide();
					mycallback();
				}, 1200);
			});
		} catch (err) {
			console.error('Error with ACKWNOLEDGE notice!: ' + err);
		}
	}

	prepInfectionDeck(pandemic_self) {
		pandemic_self.defaultDeck = 0;
		pandemic_self.card_height_ratio = 0.709;
	}
	resetInfectionDeck(pandemic_self) {
		pandemic_self.defaultDeck = 1;
		pandemic_self.card_height_ratio = 1.41;
	}
}

module.exports = PandemicOriginalSkin;
