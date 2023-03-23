

    this.importUnit("infantry", {
      name     		:       "Infantry",
      type     		:       "infantry",
      cost 		:	0.5,
      combat 		:	8,
      strength 		:	1,
      space		:	0,
      ground		:	1,
      can_be_stored	:	1,
      capacity_required :	1,
      description	:	"Infantry invade planets, but require transport on carriers or other capital ships.",
    });

    this.importUnit("fighter", {
      name     		:       "Fighter",
      type     		:       "fighter",
      cost 		:	0.5,
      move 		:	1,
      combat 		:	9,
      strength 		:	1,
      can_be_stored	:	1,
      capacity_required :	1,
      description	:	"Fighters are weak ships that soak up hits in battle. Transport them on carriers or other capital ships.",
    });


    this.importUnit("pds", {
      name     		:       "PDS",
      type     		:       "pds",
      range 		:	0,
      cost 		:	5,
      combat 		:	6,
      description	:	"PDS units fire on ships that enter their firing range, and foreign infantry invading their planet.",
    });

    this.importUnit("spacedock", {
      name     		:       "Spacedock",
      type     		:       "spacedock",
      capacity 		:	3,
      production 	:	2,
      combat      	: 	0,
      range       	: 	0,
      description	:	"Spacedocks can produce infantry and other ships unless blockaded by enemy ships.",
    });

    this.importUnit("carrier", {
      name     		:       "Carrier",
      type     		:       "carrier",
      cost 		:	3,
      move 		:	1,
      combat 		:	9,
      capacity 		:	4,
      strength 		:	1,
      description	:	"The Carrier is a troop and fighter transport ship that is weak in battle.",
    });

    this.importUnit("destroyer", {
      name     		:       "Destroyer",
      type     		:       "destroyer",
      cost 		:	1,
      move 		:	2,
      combat 		:	9,
      strength 		:	1,
      anti_fighter_barrage :	2,
      anti_fighter_barrage_combat :	9,
      description	:	"The Destroyer is a cheap ship with ANTI-FIGHTER BARRAGE capable of moving two hexes",
    });

    this.importUnit("cruiser", {
      name     		:       "Cruiser",
      type     		:       "cruiser",
      cost 		:	2,
      move 		:	2,
      combat 		:	7,
      strength 		:	1,
      description	:	"The Cruiser is a more powerful ship with a reasonable range",
    });

    this.importUnit("dreadnaught", {
      name     		:       "Dreadnaught",
      type     		:       "dreadnaught",
      cost 		:	4,
      move 		:	1,
      capacity 		:	1,
      combat 		:	6,
      strength 		:	2,
      bombardment_rolls	:	1,
      bombardment_combat:	5,
      description	:	"The Dreadnaught is a powerful combat ship able to SUSTAIN DAMAGE before destruction in combat",
    });

    this.importUnit("flagship", {
      name     		:       "Flagship",
      type     		:       "flagship",
      cost 		:	8,
      move 		:	1,
      capacity 		:	1,
      combat 		:	7,
      strength 		:	2,
      description	:	"Each faction's flagship has special abilities. See your factino sheet for more details",
    });

    this.importUnit("warsun", {
      name     		:       "War Sun",
      type     		:       "warsun",
      cost 		:	12,
      shots 		:	3,
      move 		:	1,
      capacity 		:	3,
      combat 		:	3,
      strength 		:	2,
      bombardment_rolls	:	3,
      bombardment_combat:	3,
      description	:	"Death packaged in a mass of planet-destroying turbinium. Rumours of lethality abound, but few have fought and lived to tell the tale." ,
    });

  
    this.importUnit("infantry-ii", {
      name     		:       "Infantry II",
      type     		:       "infantry",
      cost 		:	0.5,
      combat 		:	7,
      strength 		:	1,
      space		:	0,
      ground		:	1,
      can_be_stored	:	1,
      capacity_required :	1,
      extension 	: 	1,
      description	:	"Infantry II are stronger and more resilient with a chance of revivication on your homeworld post-death",
    });

    this.importUnit("fighter-ii", {
      name     		:       "Fighter II",
      type     		:       "fighter",
      cost 		:	0.5,
      move 		:	2,
      combat 		:	8,
      strength 		:	1,
      can_be_stored	:	1,
      capacity_required :	1,
      extension 	: 	1,
      description	:	"Fighter II can move without being transported by other ships. Excess count against your sector fleet supply.",
      
    });

    this.importUnit("spacedock-ii", {
      name     		:       "Spacedock II",
      type     		:       "spacedock",
      capacity 		:	3,
      production 	:	4,
      extension 	: 	1,
      description	:	"Spacedock II can produce 4 more units than their planet resource limit.",
    });

    this.importUnit("pds-ii", {
      name     		:       "PDS II",
      type     		:       "pds",
      cost 		:	5,
      combat 		:	5,
      range		:	1,
      extension 	: 	1,
      description	:	"PDS II has a greater chance of scoring hits and fires into adjacent sectors.",
    });

    this.importUnit("carrier-ii", {
      name     		:       "Carrier II",
      type     		:       "carrier",
      cost 		:	3,
      move 		:	2,
      combat 		:	9,
      capacity 		:	6,
      strength 		:	1,
      extension 	: 	1,
      description	:	"Carrier II has upgraded ship capacity and is slightly more robust in combat",
    });

    this.importUnit("destroyer-ii", {
      name     		:       "Destroyer II",
      type     		:       "destroyer",
      cost 		:	1,
      move 		:	2,
      combat 		:	8,
      strength 		:	1,
      extension 	: 	1,
      anti_fighter_barrage :	3,
      anti_fighter_barrage_combat :	6,
      description	:	"Destroyer II has improved ANTI-FIGHTER-BARRAGE (3x6) and is slightly more effective in general combat",
    });

    this.importUnit("cruiser-ii", {
      name     		:       "Cruiser II",
      type     		:       "cruiser",
      cost 		:	2,
      move 		:	3,
      combat 		:	6,
      strength 		:	1,
      extension 	: 	1,
      description	:	"Cruiser II has extended range and the ability to support a small phalanx of ground troops",
    });

    this.importUnit("dreadnaught-ii", {
      name     		:       "Dreadnaught II",
      type     		:       "dreadnaught",
      cost 		:	4,
      move 		:	2,
      capacity 		:	1,
      combat 		:	5,
      strength 		:	2,
      extension 	: 	1,
      description	:	"Dreadnaught II has improved movement, can support a small ground team and is slightly more effective in space combat",
    });




 
