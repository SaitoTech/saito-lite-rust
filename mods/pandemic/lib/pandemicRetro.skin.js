const PandemicOriginalSkin = require("./pandemicOriginal.skin.js");

class PandemicRetroSkin extends PandemicOriginalSkin {
	constructor(app, mod){
		super(app, mod);
		this.boardWidth = 2730;
    this.boardHeight = 1536;
	}

  render(){

	$("#gameboard").css({
	  'background-image': 'url("/pandemic/img/alt/pandemic_map.jpg")',
	  'background-size': 'cover',
	  width: this.boardWidth+'px',
	  height: this.boardHeight+'px',
	  "border-radius": "500px", 
	});

	if (!document.getElementById("myCanvas")){
		this.app.browser.addElementToElement(`<canvas id="myCanvas" width="${this.boardWidth}" height="${this.boardHeight}"></canvas>`, document.getElementById("gameboard"));
	}

  }

  returnDisease(color){
    return `/pandemic/img/alt/cube_${color}.png`;
  }


  queryPlayer(role){
    let player = {
      role: role
    };
        if (role === "generalist") {
        player.name = "Pantologist";
        player.pawn = `<img class="scotland_pawn" src="/pandemic/img/alt/pawn1.png"/>`;
        player.card = "alt/role1.png";
        player.desc =
          "The Pantologist may take an extra move every turn, performing 5 actions instead of 4";
        player.moves = 5;
        player.type = 1;
      }
      if (role === "scientist") {
        player.name = "Experimenter";
        player.pawn = `<img class="scotland_pawn" src="/pandemic/img/alt/pawn2.png"/>`;
        player.card = "alt/role2.png";
        player.desc =
          "The Experimenter may research a vaccine with only 4 cards instead of 5";
        player.type = 2;
      }
      if (role === "medic") {
        player.name = "Physician";
        player.pawn = `<img class="scotland_pawn" src="/pandemic/img/alt/pawn3.png"/>`;
        player.card = "alt/role3.png";
        player.desc =
          "The Physician may remove all disease cubes in a city when they treat disease. Once a disease has been cured, the medic removes cubes of that color merely by being in the city.";
        player.type = 3;
      }
      if (role === "operationsexpert") {
        player.name = "Field Expert";
        player.pawn = `<img class="scotland_pawn" src="/pandemic/img/alt/pawn4.png"/>`;
        player.card = "alt/role4.png";
        player.desc =
          "The Field Expert may build a research center in their current city as an action, or may discard a card to move from a research center to any other city.";
        player.type = 4;
      }
      if (role === "quarantinespecialist"){
        player.name = "Contamination Specialist";
        player.pawn = `<img class="scotland_pawn" src="/pandemic/img/alt/pawn5.png"/>`;
        player.card = "alt/role5.png";
        player.desc =
          "The Contamination Specialist prevents both the placement of disease cubes and outbreaks in her present city and all neighboring cities. Initial placement of disease cubes is not affected by the Quarantine Specialist.";
        player.type = 5; 
      }
      if (role === "researcher"){
        player.name = "Investigator";
        player.pawn = `<img class="scotland_pawn" src="/pandemic/img/alt/pawn6.png"/>`;
        player.card = "alt/role6.png";
        player.desc = "The Investigator may give any City card to another player in the same city as them. The transfer must go from the Researcher to the other player.";
        player.type = 6;
      }
    return player;
  }



  displayCities(){
  	let cities = this.returnCities();
  	let board = document.getElementById('gameboard');

	const c = document.querySelector(".gameboard canvas");
    if (!c){ return;}

    let ctx = c.getContext("2d");
    ctx.clearRect(0, 0, this.boardWidth, this.boardHeight);
    ctx.beginPath();
    ctx.strokeStyle = "#C0C0C0";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    let exceptions = ["tokyosanfrancisco", "sanfranciscotokyo","manilasanfrancisco", "sanfranciscomanila", "losangelessydney","sydneylosangeles"];

     for (var i in cities) {
     	try {
     		let city = document.getElementById(i);
     		if (!city){
     			this.app.browser.addElementToElement(`<div class="city dyanmic_city" id="${i}"></div>`, board);	
     			city = document.getElementById(i);
     		}
     	 	
  			city.style.width = "80px";
        city.style.height = "80px";
        city.style.top = this.mod.scale(cities[i].top) + "px";
  			city.style.left = this.mod.scale(cities[i].left) + "px";        
        city.style.backgroundImage = `url("/pandemic/img/alt/city-${cities[i].virus}.png")`;

        let label = city.querySelector(".name");
        if (!label){
          this.app.browser.addElementToElement(`<div class="name">${cities[i].name}</div>`, city);
        }

        for (let neigh of cities[i].neighbours){
        	if (exceptions.includes(i+neigh)){
            if (cities[i].left > cities[neigh].left){
              //City is in the east
              ctx.moveTo(cities[i].left+50,cities[i].top+50);
              ctx.lineTo(this.boardWidth, (cities[i].top + cities[neigh].top) / 2 + 50);    
            }else{
              //City is in the west
              ctx.moveTo(cities[i].left+50,cities[i].top+50);
              ctx.lineTo(0, (cities[i].top + cities[neigh].top) / 2 + 50);    
            }
        	}else{
	   	      ctx.moveTo(cities[i].left+50,cities[i].top+50);
  	        ctx.lineTo(cities[neigh].left+50,cities[neigh].top+50);
        	}
          ctx.stroke();
        }

        } catch (err) {
          console.log(`Error with positioning cities`,err);
        }
      }
  }


  returnCities() {
    var cities = {};

    cities["sanfrancisco"] = {
      top: 515,
      left: 340,
      neighbours: ["tokyo", "manila", "losangeles", "chicago"],
      name: "Vancouver",
      x: 395,
      y: 580,
      virus: "blue",
    };
    cities["chicago"] = {
      top: 520,
      left: 533,
      neighbours: [
        "sanfrancisco",
        "losangeles",
        "mexicocity",
        "atlanta",
        "montreal",
      ],
      name: "Chicago",
      x:660,
      y:620,
      virus: "blue",
    };
    cities["montreal"] = {
      top: 500,
      left: 700,
      neighbours: ["chicago", "newyork", "washington"],
      name: "Toronto",
      x: 530,
      y: 750,
      virus: "blue",
    };
    cities["newyork"] = {
      top: 520,
      left: 815,
      neighbours: ["montreal", "washington", "london", "madrid"],
      name: "New York",
      virus: "blue",
    };
    cities["washington"] = {
      top: 625,
      left: 795,
      neighbours: ["montreal", "newyork", "miami", "atlanta"],
      name: "Washington",
      virus: "blue",
    };
    cities["atlanta"] = {
      top: 630,
      left: 605,
      neighbours: ["chicago", "miami", "washington"],
      name: "Atlanta",
      virus: "blue",
    };
    cities["losangeles"] = {
      top: 700,
      left: 385,
      neighbours: ["sydney", "sanfrancisco", "mexicocity", "chicago"],
      name: "Los Angeles",
      virus: "yellow",
    };
    cities["mexicocity"] = {
      top: 810,
      left: 520,
      neighbours: ["chicago", "losangeles", "miami", "bogota", "lima"],
      name: "Mexico City",
      virus: "yellow",
    };
    cities["miami"] = {
      top: 735,
      left: 705,
      neighbours: ["washington", "atlanta", "mexicocity", "bogota"],
      name: "Miami",
      virus: "yellow",
    };
    cities["bogota"] = {
      top: 905,
      left: 670,
      neighbours: ["miami", "mexicocity", "lima", "saopaulo", "buenosaires"],
      name: "Bogota",
      virus: "yellow",
    };
    cities["lima"] = {
      top: 1100,
      left: 650,
      neighbours: ["santiago", "bogota", "mexicocity"],
      name: "Lima",
      virus: "yellow",
    };
    cities["santiago"] = {
      top: 1285,
      left: 625,
      neighbours: ["lima"],
      name: "Santiago",
      virus: "yellow",
    };
    cities["buenosaires"] = {
      top: 1280,
      left: 885,
      neighbours: ["saopaulo", "bogota"],
      name: "Buenos Aires",
      virus: "yellow",
    };
    cities["saopaulo"] = {
      top: 1070,
      left: 935,
      neighbours: ["bogota", "buenosaires", "madrid", "lagos"],
      name: "Sao Paulo",
      virus: "yellow",
    };
    cities["lagos"] = {
      top: 950,
      left: 1250,
      neighbours: ["saopaulo", "khartoum", "kinshasa"],
      name: "Lagos",
      virus: "yellow",
    };
    cities["khartoum"] = {
      top: 910,
      left: 1500,
      neighbours: ["cairo", "lagos", "kinshasa", "johannesburg"],
      name: "Dar Es Salaam",
      virus: "yellow",
    };
    cities["kinshasa"] = {
      top: 1080,
      left: 1275,
      neighbours: ["lagos", "khartoum", "johannesburg"],
      name: "Luanda",
      virus: "yellow",
    };
    cities["johannesburg"] = {
      top: 1200,
      left: 1435,
      neighbours: ["kinshasa", "khartoum"],
      name: "Johannesburg",
      virus: "yellow",
    };
    cities["london"] = {
      top: 390,
      left: 1150,
      neighbours: ["newyork", "madrid", "essen", "paris"],
      name: "London",
      virus: "blue",
    };
    cities["madrid"] = {
      top: 580,
      left: 1145,
      neighbours: ["newyork", "paris", "london", "algiers", "saopaulo"],
      name: "Madrid",
      virus: "blue",
    };
    cities["essen"] = {
      top: 475,
      left: 1415,
      neighbours: ["stpetersburg", "london", "milan", "paris"],
      name: "Kiev",
      virus: "blue",
    };
    cities["paris"] = {
      top: 500,
      left: 1295,
      neighbours: ["london", "essen", "madrid", "milan", "algiers"],
      name: "Paris",
      virus: "blue",
    };
    cities["stpetersburg"] = {
      top: 320,
      left: 1480,
      neighbours: ["essen", "moscow", "istanbul"],
      name: "St. Petersburg",
      virus: "blue",
    };
    cities["milan"] = {
      top: 575,
      left: 1370,
      neighbours: ["essen", "istanbul", "paris", "algiers"],
      name: "Rome",
      virus: "blue",
    };
    cities["algiers"] = {
      top: 685,
      left: 1220,
      neighbours: ["madrid", "paris", "cairo", "milan"],
      name: "Algiers",
      virus: "black",
    };
    cities["cairo"] = {
      top: 720,
      left: 1445,
      neighbours: ["khartoum", "algiers", "istanbul", "baghdad", "riyadh"],
      name: "Cairo",
      virus: "black",
    };
    cities["istanbul"] = {
      top: 580,
      left: 1490,
      neighbours: [
        "stpetersburg",
        "milan",
        "algiers",
        "cairo",
        "baghdad",
        "moscow",
      ],
      name: "Istanbul",
      virus: "black",
    };
    cities["moscow"] = {
      top: 450,
      left: 1535,
      neighbours: ["stpetersburg", "tehran", "istanbul"],
      name: "Moscow",
      virus: "black",
    };
    cities["baghdad"] = {
      top: 660,
      left: 1585,
      neighbours: ["cairo", "riyadh", "karachi", "tehran", "istanbul"],
      name: "Baghdad",
      virus: "black",
    };
    cities["riyadh"] = {
      top: 760,
      left: 1615,
      neighbours: ["cairo", "baghdad", "karachi"],
      name: "Riyadh",
      virus: "black",
    };
    cities["tehran"] = {
      top: 540,
      left: 1710,
      neighbours: ["moscow", "karachi", "baghdad", "delhi"],
      name: "Tehran",
      virus: "black",
    };
    cities["karachi"] = {
      top: 675,
      left: 1730,
      neighbours: ["baghdad", "tehran", "delhi", "riyadh", "mumbai"],
      name: "Karachi",
      virus: "black",
    };
    cities["mumbai"] = {
      top: 800,
      left: 1750,
      neighbours: ["chennai", "karachi", "delhi"],
      name: "Mumbai",
      virus: "black",
    };
    cities["delhi"] = {
      top: 650,
      left: 1845,
      neighbours: ["tehran", "karachi", "mumbai", "chennai", "kolkata"],
      name: "Delhi",
      virus: "black",
    };
    cities["chennai"] = {
      top: 890,
      left: 1870,
      neighbours: ["mumbai", "delhi", "kolkata", "bangkok", "jakarta"],
      name: "Bangalore",
      virus: "black",
    };
    cities["kolkata"] = {
      top: 715,
      left: 1940,
      neighbours: ["delhi", "chennai", "bangkok", "hongkong"],
      name: "Dhaka",
      virus: "black",
    };
    cities["bangkok"] = {
      top: 810,
      left: 2005,
      neighbours: [
        "kolkata",
        "hongkong",
        "chennai",
        "jakarta",
        "hochiminhcity",
      ],
      name: "Bangkok",
      virus: "red",
    };
    cities["jakarta"] = {
      top: 1000,
      left: 2000,
      neighbours: ["chennai", "bangkok", "hochiminhcity", "sydney"],
      name: "Jakarta",
      virus: "red",
    };
    cities["sydney"] = {
      top: 1245,
      left: 2420,
      neighbours: ["jakarta", "manila", "losangeles"],
      name: "Melbourne",
      virus: "red",
    };
    cities["manila"] = {
      top: 850,
      left: 2260,
      neighbours: [
        "sydney",
        "hongkong",
        "hochiminhcity",
        "sanfrancisco",
      ],
      name: "Manila",
      virus: "red",
    };
    cities["hochiminhcity"] = {
      top: 900,
      left: 2100,
      neighbours: ["jakarta", "bangkok", "hongkong", "manila"],
      name: "Ho Chi Minh City",
      virus: "red",
    };
    cities["hongkong"] = {
      top: 790,
      left: 2115,
      neighbours: [
        "hochiminhcity",
        "shanghai",
        "bangkok",
        "kolkata",
        "taipei",
        "manila",
      ],
      name: "Hong Kong",
      virus: "red",
    };
    cities["taipei"] = {
      top: 660,
      left: 2030,
      neighbours: ["shanghai", "hongkong", "beijing"],
      name: "Taipei",
      virus: "red",
    };
    cities["shanghai"] = {
      top: 685,
      left: 2205,
      neighbours: ["beijing", "hongkong", "taipei", "seoul", "tokyo"],
      name: "Shanghai",
      virus: "red",
    };
    cities["beijing"] = {
      top: 500,
      left: 2085,
      neighbours: ["shanghai", "seoul", "taipei"],
      name: "Beijing",
      virus: "red",
    };
    cities["seoul"] = {
      top: 500,
      left: 2185,
      neighbours: ["beijing", "shanghai", "tokyo"],
      name: "Seoul",
      virus: "red",
    };
    cities["tokyo"] = {
      top: 550,
      left: 2385,
      neighbours: ["seoul", "shanghai", "sanfrancisco", "osaka"],
      name: "Tokyo",
      virus: "red",
    };
    cities["osaka"] = {
      top: 710,
      left: 2325,
      neighbours: ["taipei", "tokyo"],
      name: "Osaka",
      virus: "red",
    };

    return cities;
  }


  returnPlayerCards() {
    var deck = {};
    //48 city cards
    deck["sanfrancisco"] = {
      img: "alt/cards/Card_Vancouver.png",
      name: "Vancouver",
    };
    deck["chicago"] = {
      img: "alt/cards/Card_Chicago.png",
      name: "Chicago",
    };
    deck["montreal"] = {
      img: "alt/cards/Card_Toronto.png",
      name: "Toronto",
    };
    deck["newyork"] = {
      img: "alt/cards/Card_Newyork.png",
      name: "New York",
    };
    deck["washington"] = {
      img: "alt/cards/Card_Washington.png",
      name: "Washington",
    };
    deck["atlanta"] = {
      img: "alt/cards/Card_Atlanta.png",
      name: "Atlanta",
    };
    deck["london"] = {
      img: "alt/cards/Card_London.png",
      name: "London",
    };
    deck["madrid"] = {
      img: "alt/cards/Card_Madrid.png",
      name: "Madrid",
    };
    deck["essen"] = {
      img: "alt/cards/Card_Kiev.png",
      name: "Kiev",
    };
    deck["paris"] = {
      img: "alt/cards/Card_Paris.png",
      name: "Paris",
    };
    deck["stpetersburg"] = {
      img: "alt/cards/Card_StPetersburg.png",
      name: "St. Petersburg",
    };
    deck["milan"] = {
      img: "alt/cards/Card_Rome.png",
      name: "Rome",
    };
    deck["losangeles"] = {
      img: "alt/cards/Card_LosAngeles.png",
      name: "Los Angeles",
    };
    deck["mexicocity"] = {
      img: "alt/cards/Card_Mexico.png",
      name: "Mexico City",
    };
    deck["miami"] = {
      img: "alt/cards/Card_SantoDomingo.png",
      name: "Santo Domingo",
    };
    deck["bogota"] = {
      img: "alt/cards/Card_Bogota.png",
      name: "Bogota",
    };
    deck["lima"] = {
      img: "alt/cards/Card_Lima.png",
      name: "Lima",
    };
    deck["santiago"] = {
      img: "alt/cards/Card_Santiago.png",
      name: "Santiago",
    };
    deck["buenosaires"] = {
      img: "alt/cards/Card_BuenosAires.png",
      name: "Buenos Aires",
    };
    deck["saopaulo"] = {
      img: "alt/cards/Card_Saopaulo.png",
      name: "Sao Paulo",
    };
    deck["lagos"] = {
      img: "alt/cards/Card_Lagos.png",
      name: "Lagos",
    };
    deck["khartoum"] = {
      img: "alt/cards/Card_DaresSalaam.png",
      name: "Dar Es Salaam",
    };
    deck["kinshasa"] = {
      img: "alt/cards/Card_Luanda.png",
      name: "Luanda",
    };
    deck["johannesburg"] = {
      img: "alt/cards/Card_Luanda.png",
      name: "Johannesburg",
    };
    deck["algiers"] = {
      img: "alt/cards/Card_Casablanca.png",
      name: "Casablanca",
    };
    deck["cairo"] = {
      img: "alt/cards/Card_Cairo.png",
      name: "Cairo",
    };
    deck["istanbul"] = {
      img: "alt/cards/Card_Istanbul.png",
      name: "Istanbul",
    };
    deck["moscow"] = {
      img: "alt/cards/Card_Moscow.png",
      name: "Moscow",
    };
    deck["baghdad"] = {
      img: "alt/cards/Card_Baghdad.png",
      name: "Baghdad",
    };
    deck["riyadh"] = {
      img: "alt/cards/Card_Riyadh.png",
      name: "Riyadh",
    };
    deck["tehran"] = {
      img: "alt/cards/Card_Tehran.png",
      name: "Tehran",
    };
    deck["karachi"] = {
      img: "alt/cards/Card_Karachi.png",
      name: "Karachi",
    };
    deck["mumbai"] = {
      img: "alt/cards/Card_Mumbai.png",
      name: "Mumbai",
    };
    deck["delhi"] = {
      img: "alt/cards/Card_Delhi.png",
      name: "New Delhi",
    };
    deck["chennai"] = {
      img: "alt/cards/Card_Bangalore.png",
      name: "Bangalore",
    };
    deck["kolkata"] = {
      img: "alt/cards/Card_Dhaka.png",
      name: "Dhaka",
    };
    deck["bangkok"] = {
      img: "alt/cards/Card_Bangkok.png",
      name: "Bangkok",
    };
    deck["jakarta"] = {
      img: "alt/cards/Card_Jakarta.png",
      name: "Jakarta",
    };
    deck["sydney"] = {
      img: "alt/cards/Card_Melbourne.png",
      name: "Melbourne",
    };
    deck["manila"] = {
      img: "alt/cards/Card_Manila.png",
      name: "Manila",
    };
    deck["hochiminhcity"] = {
      img: "alt/cards/Card_HoChiMinh.png",
      name: "Ho Chi Minh City",
    };
    deck["hongkong"] = {
      img: "alt/cards/Card_Hongkong.png",
      name: "Hong Kong",
    };
    deck["taipei"] = {
      img: "alt/cards/Card_Chongqing.png",
      name: "Chongqing",
    };
    deck["shanghai"] = {
      img: "alt/cards/Card_Shanghai.png",
      name: "Shanghai",
    };
    deck["beijing"] = {
      img: "alt/cards/Card_Beijing.png",
      name: "Beijing",
    };
    deck["seoul"] = {
      img: "alt/cards/Card_Seoul.png",
      name: "Seoul",
    };
    deck["tokyo"] = {
      img: "alt/cards/Card_Tokyo.png",
      name: "Tokyo",
    };
    deck["osaka"] = {
      img: "alt/cards/Card_Osaka.png",
      name: "Osaka",
    };

    //and 5 event cards

    deck["event1"] = {
      img: "Special%20Event%20-%20Airlift.jpg",
      name: "Airlift",
    };
    deck["event2"] = {
      img: "Special%20Event%20-%20Resilient%20Population.jpg",
      name: "Resilient Population",
    };
    deck["event3"] = {
      img: "Special%20Event%20-%20One%20Quiet%20Night.jpg",
      name: "One Quiet Night",
    };
    deck["event4"] = {
      img: "Special%20Event%20-%20Forecast.jpg",
      name: "Forecast",
    };
    deck["event5"] = {
      img: "Special%20Event%20-%20Government%20Grant.jpg",
      name: "Government Grant",
    };

    return deck;
  }

  displayResearchStations(station_list) {
    try{
      $(".research_station_city").removeClass("research_station_city");

      for (let i = 0; i < station_list.length; i++) {
        let city = station_list[i];
        $("#"+city).addClass("research_station_city");
      }
    }catch(err){
      console.log(err);
    }
  }



  displayOutbreaks(outbreaks) {
  }

  displayDecks() {
  }

  displayInfectionRate(infection_rate){

  }


};

module.exports = PandemicRetroSkin;