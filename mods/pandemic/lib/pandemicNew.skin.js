const PandemicOriginalSkin = require('./pandemicOriginal.skin.js');
const PandemicRetroSkin = require('./pandemicRetro.skin.js');

class PandemicNewSkin extends PandemicRetroSkin {
	constructor(app, mod) {
		super(app, mod);
		this.boardWidth = 3549;
		this.boardHeight = 1685;
	}

	render() {
		$('#gameboard').css({
			'background-image': `url("/${this.mod.name.toLowerCase()}/img/alt/worldmap_pandemic2.jpg")`,
			'background-size': 'cover',
			width: this.boardWidth + 'px',
			height: this.boardHeight + 'px',
			'border-radius': '500px'
		});
		if (!document.getElementById('myCanvas')) {
			this.app.browser.addElementToElement(
				`<canvas id="myCanvas" width="${this.boardWidth}" height="${this.boardHeight}"></canvas>`,
				document.getElementById('gameboard')
			);
		}
	}

	returnCities() {
		var cities = {};

		cities['sanfrancisco'] = {
			top: 515,
			left: 340,
			neighbours: ['tokyo', 'manila', 'losangeles', 'chicago'],
			name: 'Vancouver',
			x: 395,
			y: 580,
			virus: 'blue'
		};
		cities['chicago'] = {
			top: 520,
			left: 533,
			neighbours: [
				'sanfrancisco',
				'losangeles',
				'mexicocity',
				'atlanta',
				'montreal'
			],
			name: 'Chicago',
			x: 660,
			y: 620,
			virus: 'blue'
		};
		cities['montreal'] = {
			top: 500,
			left: 700,
			neighbours: ['chicago', 'newyork', 'washington'],
			name: 'Toronto',
			x: 530,
			y: 750,
			virus: 'blue'
		};
		cities['newyork'] = {
			top: 520,
			left: 815,
			neighbours: ['montreal', 'washington', 'london', 'madrid'],
			name: 'New York',
			virus: 'blue'
		};
		cities['washington'] = {
			top: 625,
			left: 795,
			neighbours: ['montreal', 'newyork', 'miami', 'atlanta'],
			name: 'Washington',
			virus: 'blue'
		};
		cities['atlanta'] = {
			top: 630,
			left: 605,
			neighbours: ['chicago', 'miami', 'washington'],
			name: 'Atlanta',
			virus: 'blue'
		};
		cities['losangeles'] = {
			top: 700,
			left: 385,
			neighbours: ['sydney', 'sanfrancisco', 'mexicocity', 'chicago'],
			name: 'Los Angeles',
			virus: 'yellow'
		};
		cities['mexicocity'] = {
			top: 810,
			left: 520,
			neighbours: ['chicago', 'losangeles', 'miami', 'bogota', 'lima'],
			name: 'Mexico City',
			virus: 'yellow'
		};
		cities['miami'] = {
			top: 735,
			left: 735,
			neighbours: ['washington', 'atlanta', 'mexicocity', 'bogota'],
			name: 'Santo Domingo',
			virus: 'yellow'
		};
		cities['bogota'] = {
			top: 905,
			left: 670,
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
			top: 1100,
			left: 650,
			neighbours: ['santiago', 'bogota', 'mexicocity'],
			name: 'Lima',
			virus: 'yellow'
		};
		cities['santiago'] = {
			top: 1285,
			left: 625,
			neighbours: ['lima'],
			name: 'Santiago',
			virus: 'yellow'
		};
		cities['buenosaires'] = {
			top: 1280,
			left: 885,
			neighbours: ['saopaulo', 'bogota'],
			name: 'Buenos Aires',
			virus: 'yellow'
		};
		cities['saopaulo'] = {
			top: 1070,
			left: 985,
			neighbours: ['bogota', 'buenosaires', 'madrid', 'lagos'],
			name: 'Sao Paulo',
			virus: 'yellow'
		};
		cities['lagos'] = {
			top: 950,
			left: 1250,
			neighbours: ['saopaulo', 'khartoum', 'kinshasa'],
			name: 'Lagos',
			virus: 'yellow'
		};
		cities['khartoum'] = {
			top: 910,
			left: 1500,
			neighbours: ['cairo', 'lagos', 'kinshasa', 'johannesburg'],
			name: 'Dar Es Salaam',
			virus: 'yellow'
		};
		cities['kinshasa'] = {
			top: 1080,
			left: 1340,
			neighbours: ['lagos', 'khartoum', 'johannesburg'],
			name: 'Luanda',
			virus: 'yellow'
		};
		cities['johannesburg'] = {
			top: 1200,
			left: 1435,
			neighbours: ['kinshasa', 'khartoum'],
			name: 'Johannesburg',
			virus: 'yellow'
		};
		cities['london'] = {
			top: 425,
			left: 1150,
			neighbours: ['newyork', 'madrid', 'essen', 'paris'],
			name: 'London',
			virus: 'blue'
		};
		cities['madrid'] = {
			top: 580,
			left: 1145,
			neighbours: ['newyork', 'paris', 'london', 'algiers', 'saopaulo'],
			name: 'Madrid',
			virus: 'blue'
		};
		cities['essen'] = {
			top: 475,
			left: 1415,
			neighbours: ['stpetersburg', 'london', 'milan', 'paris'],
			name: 'Kiev',
			virus: 'blue'
		};
		cities['paris'] = {
			top: 500,
			left: 1295,
			neighbours: ['london', 'essen', 'madrid', 'milan', 'algiers'],
			name: 'Paris',
			virus: 'blue'
		};
		cities['stpetersburg'] = {
			top: 365,
			left: 1480,
			neighbours: ['essen', 'moscow', 'istanbul'],
			name: 'St. Petersburg',
			virus: 'blue'
		};
		cities['milan'] = {
			top: 575,
			left: 1370,
			neighbours: ['essen', 'istanbul', 'paris', 'algiers'],
			name: 'Rome',
			virus: 'blue'
		};
		cities['algiers'] = {
			top: 685,
			left: 1250,
			neighbours: ['madrid', 'paris', 'cairo', 'milan'],
			name: 'Casablanca',
			virus: 'black'
		};
		cities['cairo'] = {
			top: 720,
			left: 1445,
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
			top: 580,
			left: 1490,
			neighbours: ['stpetersburg', 'milan', 'cairo', 'baghdad', 'moscow'],
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
			left: 1585,
			neighbours: ['cairo', 'riyadh', 'karachi', 'tehran', 'istanbul'],
			name: 'Baghdad',
			virus: 'black'
		};
		cities['riyadh'] = {
			top: 760,
			left: 1615,
			neighbours: ['cairo', 'baghdad', 'karachi'],
			name: 'Riyadh',
			virus: 'black'
		};
		cities['tehran'] = {
			top: 540,
			left: 1710,
			neighbours: ['moscow', 'karachi', 'baghdad', 'delhi'],
			name: 'Tehran',
			virus: 'black'
		};
		cities['karachi'] = {
			top: 675,
			left: 1730,
			neighbours: ['baghdad', 'tehran', 'delhi', 'riyadh', 'mumbai'],
			name: 'Karachi',
			virus: 'black'
		};
		cities['mumbai'] = {
			top: 800,
			left: 1750,
			neighbours: ['chennai', 'karachi', 'delhi'],
			name: 'Mumbai',
			virus: 'black'
		};
		cities['delhi'] = {
			top: 650,
			left: 1845,
			neighbours: ['tehran', 'karachi', 'mumbai', 'chennai', 'kolkata'],
			name: 'Delhi',
			virus: 'black'
		};
		cities['chennai'] = {
			top: 890,
			left: 1870,
			neighbours: ['mumbai', 'delhi', 'kolkata', 'bangkok', 'jakarta'],
			name: 'Bangalore',
			virus: 'black'
		};
		cities['kolkata'] = {
			top: 715,
			left: 1940,
			neighbours: ['delhi', 'chennai', 'bangkok', 'hongkong'],
			name: 'Dhaka',
			virus: 'black'
		};
		cities['bangkok'] = {
			top: 810,
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
			top: 995,
			left: 2000,
			neighbours: ['chennai', 'bangkok', 'hochiminhcity', 'sydney'],
			name: 'Jakarta',
			virus: 'red'
		};
		cities['sydney'] = {
			top: 1245,
			left: 2420,
			neighbours: ['jakarta', 'manila', 'losangeles'],
			name: 'Melbourne',
			virus: 'red'
		};
		cities['manila'] = {
			top: 850,
			left: 2260,
			neighbours: ['sydney', 'hongkong', 'hochiminhcity', 'sanfrancisco'],
			name: 'Manila',
			virus: 'red'
		};
		cities['hochiminhcity'] = {
			top: 900,
			left: 2100,
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
			top: 660,
			left: 2030,
			neighbours: ['shanghai', 'hongkong', 'beijing'],
			name: 'Chongqing',
			virus: 'red'
		};
		cities['shanghai'] = {
			top: 685,
			left: 2205,
			neighbours: ['hongkong', 'taipei', 'seoul', 'tokyo', 'osaka'],
			name: 'Shanghai',
			virus: 'red'
		};
		cities['beijing'] = {
			top: 545,
			left: 2085,
			neighbours: ['seoul', 'taipei'],
			name: 'Beijing',
			virus: 'red'
		};
		cities['seoul'] = {
			top: 530,
			left: 2185,
			neighbours: ['beijing', 'shanghai', 'tokyo'],
			name: 'Seoul',
			virus: 'red'
		};
		cities['tokyo'] = {
			top: 550,
			left: 2385,
			neighbours: ['seoul', 'shanghai', 'sanfrancisco', 'osaka'],
			name: 'Tokyo',
			virus: 'red'
		};
		cities['osaka'] = {
			top: 710,
			left: 2325,
			neighbours: ['shanghai', 'tokyo'],
			name: 'Osaka',
			virus: 'red'
		};

		return cities;
	}
}

module.exports = PandemicNewSkin;
