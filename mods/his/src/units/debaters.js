
    ////////////////
    // PROTESTANT //
    ////////////////
    this.importDebater('luther-debater', {
      type		:	"luther-debater" ,
      name		: 	"Martin Luther",
      img		:	"LutherDebater.svg",
      language_zone	:	"german" ,
      faction		:	"protestant" ,
      power		:	4,
      ability		:	"Bonus CP for translation in German zone" ,
      committed		: 	0,
    });

    this.importDebater('zwingli-debater', {
      type		:	"zwingli-debater" ,
      name		: 	"Ulrich Zwingli",
      img		:	"ZwingliDebater.svg",
      language_zone	:	"german" ,
      faction		:	"protestant" ,
      power		:	3 ,
      ability		:	"+1 for Reformation attempts within 2 spaces of Zurich" ,
      committed		: 	0,
    });

    this.importDebater('bucer-debater', {
      type		:	"bucer-debater" ,
      name		: 	"Martin Bucer",
      img		:	"BucerDebater.svg",
      language_zone	:	"german" ,
      faction		:	"protestant" ,
      power		:	2 ,
      ability		:	"+1 for Reformation attempts within 2 spaces of Strasburg" ,
      committed		: 	0,
    });

    this.importDebater('bullinger-debater', {
      type		:	"bullinger-debater" ,
      name		: 	"Heinrich Bullinger",
      img		:	"BullingerDebater.svg",
      language_zone	:	"german" ,
      faction		:	"protestant" ,
      power		:	2 ,
      ability		:	"Insert in 2nd round of debate in any Language Zone" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player) {
        if (menu === "debate") {
          return { faction : "protestant" , event : 'substitute_bullinger', html : `<li class="option" id="substitute_bullinger">substitute Bullinger</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, faction) {
        if (menu == "debate") {
	  if (his_self.game.state.theological_debate.round === 2) {
            if (faction === "protestant") {
              return 1;
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu === "debate") {
	  if (his_self.game.state.theological_debate.attacker === "papacy") {
            his_self.addMove("SETVAR\tstate\tevents\ttheological_debate\tdefender_debater\tbullinger-debater");
	  } else {
            his_self.addMove("SETVAR\tstate\tevents\ttheological_debate\tattacker_debater\tbullinger-debater");
	  }
          his_seld.endTurn();
        }
        return 0;
      },

    });

    this.importDebater('carlstadt-debater', {
      type		:	"carlstadt-debater" ,
      name		: 	"Andreas Carlstadt",
      img		:	"CarlstadtDebater.svg",
      language_zone	:	"german" ,
      faction		:	"protestant" ,
      power		:	1 ,
      ability		:	"Target 3 Germany spaces with Treatise, unrest if fails" ,
      committed		: 	0,
    });

    this.importDebater('melanchthon-debater', {
      type		:	"melanchthon-debater" ,
      name		: 	"Philip Melanchthon",
      img		:	"MelanchthonDebater.svg",
      language_zone	:	"german" ,
      faction		:	"protestant" ,
      power		:	3 ,
      ability		:	"Bonus CP for translation in German zone" ,
      committed		: 	0,
    });

    this.importDebater('oekolampadius-debater', {
      type		:	"oekolampadius-debater" ,
      name		: 	"Johannes Oekolampadius",
      img		:	"OekolampadiusDebater.svg",
      language_zone	:	"german" ,
      faction		:	"protestant" ,
      power		:	2 ,
      ability		:	"+1 for Reformation attempts within 2 spaces of Basel" ,
      committed		: 	0,
    });


    ////////////
    // PAPACY //
    ////////////

    this.importDebater('eck-debater', {
      type		:	"eck-debater" ,
      name		: 	"Johann Eck",
      img		:       "EckDebater.svg",
      language_zone	:	"any" ,
      faction		:	"papacy" ,
      power		:	3 ,
      ability		:	"+1 die in Debate Attacks" ,
      committed		: 	0,
    });

    this.importDebater('aleander-debater', {
      type		:	"aleander-debater" ,
      name		: 	"Hieronymus Aleander",
      img		:       "AleanderDebater.svg",
      language_zone	:	"any" ,
      faction		:	"papacy" ,
      power		:	2 ,
      ability		:	"If concludes debate, winner flips an extra space" ,
      committed		: 	0,
    });

    this.importDebater('cajetan-debater', {
      type		:	"cajetan-debater" ,
      name		: 	"Thomas Cajetan",
      img		:	"CajetanDebater.svg",
      language_zone	:	"any" ,
      faction		:	"papacy" ,
      power		:	1 ,
      ability		:	"Target 3 spaces with burn books" ,
      committed		: 	0,
    });

    this.importDebater('campeggio-debater', {
      type		:	"campeggio-debater" ,
      name		: 	"Lorenzo Campeggio",
      img		:	"CampeggioDebater.svg",
      language_zone	:	"any" ,
      faction		:	"papacy" ,
      power		:	2 ,
      ability		:	"Roll die after debate loss; if 5 or 6 result is ignored" ,
      committed		: 	0,
    });

    this.importDebater('canisius-debater', {
      type		:	"canisius-debater" ,
      name		: 	"Peter Canisius",
      img		:	"CanisiusDebater.svg",
      language_zone	:	"any" ,
      faction		:	"papacy" ,
      power		:	3 ,
      ability		:	"+1 die for Counter-Reformation attempts within 2 spaces of Regensburg" ,
      committed		: 	0,
    });

    this.importDebater('caraffa-debater', {
      type		:	"caraffa-debater" ,
      name		: 	"Carlo Caraffa",
      img		:	"CaraffaDebater.svg",
      language_zone	:	"any" ,
      faction		:	"papacy" ,
      power		:	2 ,
      ability		:	"Target 2 spaces in any zone with burn books" ,
      committed		: 	0,
    });

    this.importDebater('contarini-debater', {
      type		:	"contarini-debater" ,
      name		: 	"Gasparo Contarini",
      img		:	"ContariniDebater.svg",
      language_zone	:	"any" ,
      faction		:	"papacy" ,
      power		:	2 ,
      ability		:	"+1 die for Counter-Reformations within 2 spaces of Charles V" ,
      committed		: 	0,
    });

    this.importDebater('faber-debater', {
      type		:	"faber-debater" ,
      name		: 	"Peter Faber",
      img		:	"FaberDebater.svg",
      language_zone	:	"any" ,
      faction		:	"papacy" ,
      power		:	3 ,
      ability		:	"+2 die for Counter-Reformations against an Electorate" ,
      committed		: 	0,
    });

    this.importDebater('gardiner-debater', {
      type		:	"gardiner-debater" ,
      name		: 	"Stephen Gardiner",
      img		:	"GardinerDebater.svg",
      language_zone	:	"any" ,
      faction		:	"papacy" ,
      power		:	3 ,
      ability		:	"+1 die in debate in English zone if attacker" ,
      committed		: 	0,
    });

    this.importDebater('loyola-debater', {
      type		:	"loyola-debater" ,
      name		: 	"Ignatius Loyola",
      img		:	"LoyolaDebater.svg",
      language_zone	:	"any" ,
      faction		:	"papacy" ,
      power		:	4 ,
      ability		:	"Found Jesuit University for only 2 CP" ,
      committed		: 	0,
    });

    this.importDebater('pole-debater', {
      type		:	"pole-debater" ,
      name		: 	"Reginald Pole",
      img		:	"PoleDebater.svg",
      language_zone	:	"any" ,
      faction		:	"papacy" ,
      power		:	3 ,
      ability		:	"+1 die for Papacy if at Council of Trent" ,
      committed		: 	0,
    });

    this.importDebater('tetzel-debater', {
      type		:	"tetzel-debater" ,
      name		: 	"Johann Tetzel ",
      img		:	"TetzelDebater.svg",
      language_zone	:	"any" ,
      faction		:	"papacy" ,
      power		:	1 ,
      ability		:	"1 CP to Saint Peters with Burn Books" ,
      committed		: 	0,
    });


    ////////////
    // FRENCH //
    ////////////

    this.importDebater('calvin-debater', {
      type		:	"calvin-debater" ,
      name		: 	"John Calvin",
      img		:	"CalvinDebater.svg",
      language_zone	:	"french" ,
      faction		:	"france" ,
      power		:	4 ,
      ability		:	"Target 3 French-speaking spaces with a treatise" ,
      committed		: 	0,
    });

    this.importDebater('cop-debater', {
      type		:	"cop-debater" , 
     name		: 	"Nicolas Cop",
      img		:	"CopDebater.svg",
      language_zone	:	"french" ,
      faction		:	"france" ,
      power		:	2 ,
      ability		:	"+1 die for Reformation attempts within 2 spaces of Paris" ,
      committed		: 	0,
    });

    this.importDebater('farel-debater', {
      type		:	"farel-debater" ,
      name		: 	"William Farel",
      img		:	"FarelDebater.svg",
      language_zone	:	"french" ,
      faction		:	"france" ,
      power		:	2 ,
      ability		:	"+1 die for Reformation attempts within 2 spaces of Geneva" ,
      committed		: 	0,
    });

    this.importDebater('olivetan-debater', {
      type		:	"olivetan-debater" ,
      name		: 	"Pierre Robert Olivetan",
      img		:	"OlivetanDebater.svg",
      language_zone	:	"french" ,
      faction		:	"france" ,
      power		:	1 ,
      ability		:	"Bonus CP for translation in French Zone" ,
      committed		: 	0,
    });


    /////////////
    // ENGLISH //
    /////////////

    this.importDebater('cranmer-debater', {
      type		:	"cranmer-debater" ,
      name		: 	"Thomas Cranmer",
      img		:	"CranmerDebater.svg",
      language_zone	:	"english" ,
      faction		:	"england" ,
      power		:	2 ,
      ability		:	"+1 die for Reformation within 2 spaces of London" ,
      committed		: 	0,
    });

    this.importDebater('wishart-debater', {
      type		:	"wishart-debater" ,
      name		: 	"George Wishart",
      img		:	"WishartDebater.svg",
      language_zone	:	"english" ,
      faction		:	"england" ,
      power		:	1 ,
      ability		:	"+1 die for Reformation attempts in Scotland" ,
      committed		: 	0,
    });

    this.importDebater('tyndalex-debater', {
      type		:	"tyndale-debater" ,
      name		: 	"William Tyndale",
      img		:	"TyndaleDebater.svg",
      language_zone	:	"english" ,
      faction		:	"england" ,
      power		:	2 ,
      ability		:	"Bonus CP for translation in English zone" ,
      committed		: 	0,
    });

    this.importDebater('latimer-debater', {
      type		:	"latimer-debater" ,
      name		: 	"Hugh Latimer",
      img		:	"LatimerDebater.svg",
      language_zone	:	"english" ,
      faction		:	"england" ,
      power		:	1 ,
      ability		:	"+1 die for Reformation attempts in England" ,
      committed		: 	0,
    });

    this.importDebater('knox-debater', {
      type		:	"knox-debater" ,
      name		: 	"John Knox",
      img		:	"KnoxDebater.svg",
      language_zone	:	"english" ,
      faction		:	"england" ,
      power		:	3 ,
      ability		:	"+1 die for Reformation Attempts in England or Scotland" ,
      committed		: 	0,
    });

    this.importDebater('coverdale-debater', {
      type		:	"coverdale-debater" ,
      name		: 	"Myles Coverdale",
      img		:	"CoverdaleDebater.svg",
      language_zone	:	"english" ,
      faction		:	"england" ,
      power		:	2 ,
      ability		:	"Bonus CP for translation in English zone" ,
      committed		: 	0,
    });

