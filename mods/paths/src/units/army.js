
    //
    // Austria-Hungary AH
    //
    this.importUnit('ah_army01', {
      ckey		:       "AH" ,
      country           :       "Austro-Hungarian" ,
      name		:	"1st Army" ,
      type		:	"army" ,
      front		:	"ah_army01.png" ,
      back		:	"ah_army01_back.png" ,
      combat		:	3 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	1 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });
    this.importUnit('ah_army02', {
      ckey		:       "AH" ,
      country           :       "Austro-Hungarian" ,
      name		:	"2nd Army" ,
      type		:	"army" ,
      front		:	"ah_army02.png" ,
      back		:	"ah_army02_back.png" ,
      combat		:	3 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	1 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });
    this.importUnit('ah_army03', {
      ckey		:       "AH" ,
      country           :       "Austro-Hungarian" ,
      name		:	"3rd Army" ,
      type		:	"army" ,
      front		:	"ah_army03.png" ,
      back		:	"ah_army03_back.png" ,
      combat		:	3 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	1 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });
    this.importUnit('ah_army04', {
      ckey		:       "AH" ,
      country           :       "Austro-Hungarian" ,
      name		:	"4th Army" ,
      type		:	"army" ,
      front		:	"ah_army04.png" ,
      back		:	"ah_army04_back.png" ,
      combat		:	3 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	1 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });
    this.importUnit('ah_army05', {
      ckey		:       "AH" ,
      country           :       "Austro-Hungarian" ,
      name		:	"5th Army" ,
      type		:	"army" ,
      front		:	"ah_army05.png" ,
      back		:	"ah_army05_back.png" ,
      combat		:	3 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	1 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });
    this.importUnit('ah_army06', {
      ckey		:       "AH" ,
      country           :       "Austro-Hungarian" ,
      name		:	"6th Army" ,
      type		:	"army" ,
      front		:	"ah_army06.png" ,
      back		:	"ah_army06_back.png" ,
      combat		:	3 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	1 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });
    this.importUnit('ah_army07', {
      ckey		:       "AH" ,
      country           :       "Austro-Hungarian" ,
      name		:	"7th Army" ,
      type		:	"army" ,
      front		:	"ah_army07.png" ,
      back		:	"ah_army07_back.png" ,
      combat		:	3 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	1 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });
    this.importUnit('ah_army10', {
      ckey		:       "AH" ,
      country           :       "Austro-Hungarian" ,
      name		:	"10th Army" ,
      type		:	"army" ,
      front		:	"ah_army10.png" ,
      back		:	"ah_army10_back.png" ,
      combat		:	3 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	1 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });
    this.importUnit('ah_army11', {
      ckey		:       "AH" ,
      country           :       "Austro-Hungarian" ,
      name		:	"11th Army" ,
      type		:	"army" ,
      front		:	"ah_army11.png" ,
      back		:	"ah_army11_back.png" ,
      combat		:	3 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	1 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });
    this.importUnit('ah_corps', {
      ckey		:       "AH" ,
      country           :       "Austro-Hungarian" ,
      name		:	"AH Corps" ,
      type		:	"corps" ,
      front		:	"ah_corps.png" ,
      back		:	"ah_corps_back.png" ,
      combat		:	1 ,
      loss		:	1 ,
      movement		:	3 ,
      rcombat		:	0 ,
      rloss		:	1 ,
      rmovement		:	3 ,
    });

    //
    // Arab Northern Army
    //
    this.importUnit('ana_corps', {
      ckey		:       "ANA" ,
      country           :       "Arab Northern Army" ,
      name		:	"ANA Corps" ,
      type		:	"corps" ,
      front		:	"ana_corps.png" ,
      back		:	"ana_corps_back.png" ,
      combat		:	1 ,
      loss		:	1 ,
      movement		:	3 ,
      rcombat		:	0 ,
      rloss		:	1 ,
      rmovement		:	3 ,
      checkSupplyStatus :	(paths_self, spacekey) => { return 1; }
    });

    //
    // Army of Islam
    //
    this.importUnit('aoi_corps', {
      ckey		:       "AOI" ,
      country           :       "Army of Islam" ,
      name		:	"AOI Army" ,
      type		:	"army" ,
      front		:	"aoi_army.png" ,
      back		:	"aoi_army_back.png" ,
      combat		:	1 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	1 ,
      rloss		:	2 ,
      rmovement		:	2 ,
    });

    //
    // Australian Corps
    //
    this.importUnit('aus_corps', {
      ckey		:       "AUS" ,
      country           :       "Australian Corps" ,
      name		:	"AUS Corps" ,
      type		:	"corps" ,
      front		:	"aus_corps.png" ,
      back		:	"aus_corps_back.png" ,
      combat		:	2 ,
      loss		:	1 ,
      movement		:	4 ,
      rcombat		:	2 ,
      rloss		:	1 ,
      rmovement		:	4 ,
    });

    //
    // Belgian Army
    //
    this.importUnit('be_army', {
      ckey		:       "BE" ,
      country           :       "Belgium" ,
      name		:	"BE Army" ,
      type		:	"army" ,
      front		:	"be_army.png" ,
      back		:	"be_army_back.png" ,
      combat		:	2 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	1 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });

    //
    // Belgian Corps
    //
    this.importUnit('be_corps', {
      ckey		:       "BE" ,
      country           :       "Belgium" ,
      name		:	"BE Corps" ,
      type		:	"corps" ,
      front		:	"be_corps.png" ,
      back		:	"be_corps_back.png" ,
      combat		:	1 ,
      loss		:	1 ,
      movement		:	3 ,
      rcombat		:	0 ,
      rloss		:	1 ,
      rmovement		:	3 ,
    });

    //
    // British Expeditionary Force
    //
    this.importUnit('bef_army', {
      ckey		:       "BEF" ,
      country           :       "British Expeditionary Force" ,
      name		:	"BEF Army" ,
      type		:	"army" ,
      front		:	"bef_army.png" ,
      back		:	"bef_army_back.png" ,
      combat		:	5 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	4 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });

    //
    // British Expeditionary Force
    //
    this.importUnit('bef_corps', {
      ckey		:       "BEF" ,
      country           :       "British Expeditionary Force" ,
      name		:	"BEF Corps" ,
      type		:	"corps" ,
      front		:	"bef_corps.png" ,
      back		:	"bef_corps_back.png" ,
      combat		:	2 ,
      loss		:	2 ,
      movement		:	4 ,
      rcombat		:	2 ,
      rloss		:	1 ,
      rmovement		:	4 ,
    });


    //
    // British BR
    //
    this.importUnit('br_army01', {
      ckey		:       "BR" ,
      country           :       "British" ,
      name		:	"1st Army" ,
      type		:	"army" ,
      front		:	"br_army01.png" ,
      back		:	"br_army01_back.png" ,
      combat		:	4 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	3 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('br_army02', {
      ckey		:       "BR" ,
      country           :       "British" ,
      name		:	"2nd Army" ,
      type		:	"army" ,
      front		:	"br_army02.png" ,
      back		:	"br_army02_back.png" ,
      combat		:	4 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	3 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('br_army03', {
      ckey		:       "BR" ,
      country           :       "British" ,
      name		:	"3rd Army" ,
      type		:	"army" ,
      front		:	"br_army03.png" ,
      back		:	"br_army03_back.png" ,
      combat		:	4 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	3 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('br_army04', {
      ckey		:       "BR" ,
      country           :       "British" ,
      name		:	"4th Army" ,
      type		:	"army" ,
      front		:	"br_army04.png" ,
      back		:	"br_army04_back.png" ,
      combat		:	4 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	3 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('br_army05', {
      ckey		:       "BR" ,
      country           :       "British" ,
      name		:	"5th Army" ,
      type		:	"army" ,
      front		:	"br_army05.png" ,
      back		:	"br_army05_back.png" ,
      combat		:	4 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	3 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('br_corps', {
      ckey		:       "BR" ,
      country           :       "British" ,
      name		:	"BR Corps" ,
      type		:	"corps" ,
      front		:	"br_corps.png" ,
      back		:	"br_corps_back.png" ,
      combat		:	2 ,
      loss		:	1 ,
      movement		:	4 ,
      rcombat		:	1 ,
      rloss		:	1 ,
      rmovement		:	4 ,
    });

    //
    // Bulgarian
    //
    this.importUnit('bu_corps', {
      ckey		:       "BU" ,
      country           :       "Bulgarian" ,
      name		:	"BU Corps" ,
      type		:	"corps" ,
      front		:	"bu_corps.png" ,
      back		:	"bu_corps_back.png" ,
      combat		:	2 ,
      loss		:	1 ,
      movement		:	3 ,
      rcombat		:	0 ,
      rloss		:	1 ,
      rmovement		:	3 ,
    });

    //
    // Caucasus
    //
    this.importUnit('cau_army', {
      ckey		:       "CAU" ,
      country           :       "Caucasus" ,
      name		:	"CAU Army" ,
      type		:	"army" ,
      front		:	"cau_army.png" ,
      back		:	"cau_army_back.png" ,
      combat		:	3 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	2 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });

    //
    // Canadian
    //
    this.importUnit('cnd_corps', {
      ckey		:       "CND" ,
      country           :       "Canadian" ,
      name		:	"CND Corps" ,
      type		:	"corps" ,
      front		:	"cnd_corps.png" ,
      back		:	"cnd_corps_back.png" ,
      combat		:	2 ,
      loss		:	1 ,
      movement		:	4 ,
      rcombat		:	2 ,
      rloss		:	1 ,
      rmovement		:	4 ,
    });

    //
    // Czech Legion
    //
    this.importUnit('czl_corps', {
      ckey		:       "CZL" ,
      country           :       "Czech Legion" ,
      name		:	"CZL Corps" ,
      type		:	"corps" ,
      front		:	"czl_army.png" ,
      back		:	"czl_army_back.png" ,
      combat		:	2 ,
      loss		:	1 ,
      movement		:	4 ,
      rcombat		:	1 ,
      rloss		:	1 ,
      rmovement		:	4 ,
    });


    //
    // France FR
    //
    this.importUnit('fr_army01', {
      ckey		:       "FR" ,
      country           :       "France" ,
      name		:	"1st Army" ,
      type		:	"army" ,
      front		:	"fr_army01.png" ,
      back		:	"fr_army01_back.png" ,
      combat		:	3 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	2 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('fr_army02', {
      ckey		:       "FR" ,
      country           :       "France" ,
      name		:	"2nd Army" ,
      type		:	"army" ,
      front		:	"fr_army02.png" ,
      back		:	"fr_army02_back.png" ,
      combat		:	3 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	2 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('fr_army03', {
      ckey		:       "FR" ,
      country           :       "France" ,
      name		:	"3rd Army" ,
      type		:	"army" ,
      front		:	"fr_army03.png" ,
      back		:	"fr_army03_back.png" ,
      combat		:	3 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	2 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('fr_army04', {
      ckey		:       "FR" ,
      country           :       "France" ,
      name		:	"4th Army" ,
      type		:	"army" ,
      front		:	"fr_army04.png" ,
      back		:	"fr_army04_back.png" ,
      combat		:	3 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	2 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('fr_army05', {
      ckey		:       "FR" ,
      country           :       "France" ,
      name		:	"5th Army" ,
      type		:	"army" ,
      front		:	"fr_army05.png" ,
      back		:	"fr_army05_back.png" ,
      combat		:	3 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	2 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('fr_army06', {
      ckey		:       "FR" ,
      country           :       "France" ,
      name		:	"6th Army" ,
      type		:	"army" ,
      front		:	"fr_army06.png" ,
      back		:	"fr_army06_back.png" ,
      combat		:	3 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	2 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('fr_army07', {
      ckey		:       "FR" ,
      country           :       "France" ,
      name		:	"7th Army" ,
      type		:	"army" ,
      front		:	"fr_army07.png" ,
      back		:	"fr_army07_back.png" ,
      combat		:	3 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	2 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('fr_army09', {
      ckey		:       "FR" ,
      country           :       "France" ,
      name		:	"9th Army" ,
      type		:	"army" ,
      front		:	"fr_army09.png" ,
      back		:	"fr_army09_back.png" ,
      combat		:	3 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	2 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('fr_army10', {
      ckey		:       "FR" ,
      country           :       "France" ,
      name		:	"10th Army" ,
      type		:	"army" ,
      front		:	"fr_army10.png" ,
      back		:	"fr_army10_back.png" ,
      combat		:	3 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	2 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('fr_corps', {
      ckey		:       "FR" ,
      country           :       "France" ,
      name		:	"FR Corps" ,
      type		:	"corps" ,
      front		:	"fr_corps.png" ,
      back		:	"fr_corps_back.png" ,
      combat		:	1 ,
      loss		:	1 ,
      movement		:	4 ,
      rcombat		:	1 ,
      rloss		:	1 ,
      rmovement		:	4 ,
    });


    //
    // Germany GE
    //
    this.importUnit('ge_army01', {
      ckey		:       "GE" ,
      country           :       "Germany" ,
      name		:	"1st Army" ,
      type		:	"army" ,
      front		:	"ge_army01.png" ,
      back		:	"ge_army01_back.png" ,
      combat		:	5 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	3 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('ge_army02', {
      ckey		:       "GE" ,
      country           :       "Germany" ,
      name		:	"2nd Army" ,
      type		:	"army" ,
      front		:	"ge_army02.png" ,
      back		:	"ge_army02_back.png" ,
      combat		:	5 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	3 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('ge_army03', {
      ckey		:       "GE" ,
      country           :       "Germany" ,
      name		:	"3rd Army" ,
      type		:	"army" ,
      front		:	"ge_army03.png" ,
      back		:	"ge_army03_back.png" ,
      combat		:	5 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	3 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('ge_army04', {
      ckey		:       "GE" ,
      country           :       "Germany" ,
      name		:	"4th Army" ,
      type		:	"army" ,
      front		:	"ge_army04.png" ,
      back		:	"ge_army04_back.png" ,
      combat		:	5 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	3 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('ge_army05', {
      ckey		:       "GE" ,
      country           :       "Germany" ,
      name		:	"5th Army" ,
      type		:	"army" ,
      front		:	"ge_army05.png" ,
      back		:	"ge_army05_back.png" ,
      combat		:	5 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	3 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('ge_army06', {
      ckey		:       "GE" ,
      country           :       "Germany" ,
      name		:	"6th Army" ,
      type		:	"army" ,
      front		:	"ge_army06.png" ,
      back		:	"ge_army06_back.png" ,
      combat		:	5 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	3 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('ge_army07', {
      ckey		:       "GE" ,
      country           :       "Germany" ,
      name		:	"7th Army" ,
      type		:	"army" ,
      front		:	"ge_army07.png" ,
      back		:	"ge_army07_back.png" ,
      combat		:	5 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	3 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('ge_army08', {
      ckey		:       "GE" ,
      country           :       "Germany" ,
      name		:	"8th Army" ,
      type		:	"army" ,
      front		:	"ge_army08.png" ,
      back		:	"ge_army08_back.png" ,
      combat		:	5 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	3 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('ge_army09', {
      ckey		:       "GE" ,
      country           :       "Germany" ,
      name		:	"9th Army" ,
      type		:	"army" ,
      front		:	"ge_army09.png" ,
      back		:	"ge_army09_back.png" ,
      combat		:	5 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	3 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('ge_army10', {
      ckey		:       "GE" ,
      country           :       "Germany" ,
      name		:	"10th Army" ,
      type		:	"army" ,
      front		:	"ge_army10.png" ,
      back		:	"ge_army10_back.png" ,
      combat		:	5 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	3 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('ge_army11', {
      ckey		:       "GE" ,
      country           :       "Germany" ,
      name		:	"11th Army" ,
      type		:	"army" ,
      front		:	"ge_army11.png" ,
      back		:	"ge_army11_back.png" ,
      combat		:	5 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	3 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('ge_army12', {
      ckey		:       "GE" ,
      country           :       "Germany" ,
      name		:	"12th Army" ,
      type		:	"army" ,
      front		:	"ge_army12.png" ,
      back		:	"ge_army12_back.png" ,
      combat		:	5 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	3 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('ge_army14', {
      ckey		:       "GE" ,
      country           :       "Germany" ,
      name		:	"14th Army" ,
      type		:	"army" ,
      front		:	"ge_army14.png" ,
      back		:	"ge_army14_back.png" ,
      combat		:	5 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	3 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('ge_army17', {
      ckey		:       "GE" ,
      country           :       "Germany" ,
      name		:	"17th Army" ,
      type		:	"army" ,
      front		:	"ge_army17.png" ,
      back		:	"ge_army17_back.png" ,
      combat		:	5 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	3 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('ge_army18', {
      ckey		:       "GE" ,
      country           :       "Germany" ,
      name		:	"18th Army" ,
      type		:	"army" ,
      front		:	"ge_army18.png" ,
      back		:	"ge_army18_back.png" ,
      combat		:	5 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	3 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('ge_corps', {
      ckey		:       "GE" ,
      country           :       "Germany" ,
      name		:	"GE Corps" ,
      type		:	"corps" ,
      front		:	"ge_corps.png" ,
      back		:	"ge_corps_back.png" ,
      combat		:	2 ,
      loss		:	1 ,
      movement		:	4 ,
      rcombat		:	1 ,
      rloss		:	1 ,
      rmovement		:	4 ,
    });

    //
    // Greek
    //
    this.importUnit('gr_corps', {
      ckey		:       "GR" ,
      country           :       "Greek Corps" ,
      name		:	"GR Corps" ,
      type		:	"corps" ,
      front		:	"gr_corps.png" ,
      back		:	"gr_corps_back.png" ,
      combat		:	1 ,
      loss		:	1 ,
      movement		:	3 ,
      rcombat		:	0 ,
      rloss		:	1 ,
      rmovement		:	3 ,
    });

    //
    // Italy IT
    //
    this.importUnit('it_army01', {
      ckey		:       "IT" ,
      country           :       "Italy" ,
      name		:	"1st Army" ,
      type		:	"army" ,
      front		:	"it_army01.png" ,
      back		:	"it_army01_back.png" ,
      combat		:	2 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	1 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });
    this.importUnit('it_army02', {
      ckey		:       "IT" ,
      country           :       "Italy" ,
      name		:	"2nd Army" ,
      type		:	"army" ,
      front		:	"it_army02.png" ,
      back		:	"it_army02_back.png" ,
      combat		:	2 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	1 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });
    this.importUnit('it_army03', {
      ckey		:       "IT" ,
      country           :       "Italy" ,
      name		:	"3rd Army" ,
      type		:	"army" ,
      front		:	"it_army03.png" ,
      back		:	"it_army03_back.png" ,
      combat		:	2 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	1 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });
    this.importUnit('it_army04', {
      ckey		:       "IT" ,
      country           :       "Italy" ,
      name		:	"4th Army" ,
      type		:	"army" ,
      front		:	"it_army04.png" ,
      back		:	"it_army04_back.png" ,
      combat		:	2 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	1 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });
    this.importUnit('it_army05', {
      ckey		:       "IT" ,
      country           :       "Italy" ,
      name		:	"5th Army" ,
      type		:	"army" ,
      front		:	"it_army05.png" ,
      back		:	"it_army05_back.png" ,
      combat		:	2 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	1 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });
    this.importUnit('it_corps', {
      ckey		:       "IT" ,
      country           :       "Italy" ,
      name		:	"IT Corps" ,
      type		:	"corps" ,
      front		:	"it_corps.png" ,
      back		:	"it_corps_back.png" ,
      combat		:	2 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	1 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });

    //
    // Mediterranean Expeditionary Force
    //
    this.importUnit('mef_army', {
      ckey		:       "MEF" ,
      country           :       "Mediterranean Expeditionary Force" ,
      name		:	"MEF Army" ,
      type		:	"army" ,
      front		:	"mef_army.png" ,
      back		:	"mef_army_back.png" ,
      combat		:	1 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	1 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });

    //
    // Montenegrin Corps
    //
    this.importUnit('mn_corps', {
      ckey		:       "MN" ,
      country           :       "Montenegro" ,
      name		:	"Montenegrin Corps" ,
      type		:	"corps" ,
      front		:	"mn_corps.png" ,
      back		:	"mn_corps_back.png" ,
      combat		:	1 ,
      loss		:	1 ,
      movement		:	0 ,
      rcombat		:	0 ,
      rloss		:	1 ,
      rmovement		:	0 ,
      checkSupplyStatus :	(paths_self, spacekey) => { return 1; }
    });

    //
    // Near East Army
    //
    this.importUnit('ne_army', {
      ckey		:       "NE" ,
      country           :       "Near East Army" ,
      name		:	"NE Army" ,
      type		:	"army" ,
      front		:	"ne_army.png" ,
      back		:	"ne_army_back.png" ,
      combat		:	4 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	3 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });

    //
    // Orient Army
    //
    this.importUnit('orient_army', {
      ckey		:       "OA" ,
      country           :       "Orient Army" ,
      name		:	"OA Army" ,
      type		:	"army" ,
      front		:	"orient_army.png" ,
      back		:	"orient_army_back.png" ,
      combat		:	3 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	2 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });

    //
    // Polish Corps
    //
    this.importUnit('pol_corps', {
      ckey		:       "POL" ,
      country           :       "Poland" ,
      name		:	"Polish Corps" ,
      type		:	"army" ,
      front		:	"pol_corps.png" ,
      back		:	"pol_corps_back.png" ,
      combat		:	2 ,
      loss		:	1 ,
      movement		:	4 ,
      rcombat		:	1 ,
      rloss		:	1 ,
      rmovement		:	4	 ,
    });

    //
    // Portuguese Corps
    //
    this.importUnit('pt_corps', {
      ckey		:       "PT" ,
      country           :       "Portuguese" ,
      name		:	"Portuguese Corps" ,
      type		:	"army" ,
      front		:	"pt_corps.png" ,
      back		:	"pt_corps_back.png" ,
      combat		:	1 ,
      loss		:	1 ,
      movement		:	3 ,
      rcombat		:	0 ,
      rloss		:	1 ,
      rmovement		:	3 ,
    });

    //
    // Romanian Corps
    //
    this.importUnit('ro_corps', {
      ckey		:       "RO" ,
      country           :       "Romania" ,
      name		:	"Romanian Corps" ,
      type		:	"army" ,
      front		:	"ro_corps.png" ,
      back		:	"ro_corps_back.png" ,
      combat		:	1 ,
      loss		:	1 ,
      movement		:	3 ,
      rcombat		:	0 ,
      rloss		:	1 ,
      rmovement		:	3 ,
    });

    //
    // Russia RU
    //
    this.importUnit('ru_army01', {
      ckey		:       "RU" ,
      country           :       "Russia" ,
      name		:	"1st Army" ,
      type		:	"army" ,
      front		:	"ru_army01.png" ,
      back		:	"ru_army01_back.png" ,
      combat		:	3 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	2 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });
    this.importUnit('ru_army02', {
      ckey		:       "RU" ,
      country           :       "Russia" ,
      name		:	"2nd Army" ,
      type		:	"army" ,
      front		:	"ru_army02.png" ,
      back		:	"ru_army02_back.png" ,
      combat		:	3 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	2 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });
    this.importUnit('ru_army03', {
      ckey		:       "RU" ,
      country           :       "Russia" ,
      name		:	"3rd Army" ,
      type		:	"army" ,
      front		:	"ru_army03.png" ,
      back		:	"ru_army03_back.png" ,
      combat		:	3 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	2 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });
    this.importUnit('ru_army04', {
      ckey		:       "RU" ,
      country           :       "Russia" ,
      name		:	"4th Army" ,
      type		:	"army" ,
      front		:	"ru_army04.png" ,
      back		:	"ru_army04_back.png" ,
      combat		:	3 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	2 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });
    this.importUnit('ru_army05', {
      ckey		:       "RU" ,
      country           :       "Russia" ,
      name		:	"5th Army" ,
      type		:	"army" ,
      front		:	"ru_army05.png" ,
      back		:	"ru_army05_back.png" ,
      combat		:	3 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	2 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });
    this.importUnit('ru_army06', {
      ckey		:       "RU" ,
      country           :       "Russia" ,
      name		:	"6th Army" ,
      type		:	"army" ,
      front		:	"ru_army06.png" ,
      back		:	"ru_army06_back.png" ,
      combat		:	3 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	2 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });
    this.importUnit('ru_army07', {
      ckey		:       "RU" ,
      country           :       "Russia" ,
      name		:	"7th Army" ,
      type		:	"army" ,
      front		:	"ru_army07.png" ,
      back		:	"ru_army07_back.png" ,
      combat		:	3 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	2 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });
    this.importUnit('ru_army08', {
      ckey		:       "RU" ,
      country           :       "Russia" ,
      name		:	"8th Army" ,
      type		:	"army" ,
      front		:	"ru_army08.png" ,
      back		:	"ru_army08_back.png" ,
      combat		:	3 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	2 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });
    this.importUnit('ru_army09', {
      ckey		:       "RU" ,
      country           :       "Russia" ,
      name		:	"9th Army" ,
      type		:	"army" ,
      front		:	"ru_army09.png" ,
      back		:	"ru_army09_back.png" ,
      combat		:	3 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	2 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });
    this.importUnit('ru_army10', {
      ckey		:       "RU" ,
      country           :       "Russia" ,
      name		:	"10th Army" ,
      type		:	"army" ,
      front		:	"ru_army10.png" ,
      back		:	"ru_army10_back.png" ,
      combat		:	3 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	2 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });
    this.importUnit('ru_army11', {
      ckey		:       "RU" ,
      country           :       "Russia" ,
      name		:	"11th Army" ,
      type		:	"army" ,
      front		:	"ru_army11.png" ,
      back		:	"ru_army11_back.png" ,
      combat		:	3 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	2 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });
    this.importUnit('ru_army12', {
      ckey		:       "RU" ,
      country           :       "Russia" ,
      name		:	"12th Army" ,
      type		:	"army" ,
      front		:	"ru_army12.png" ,
      back		:	"ru_army12_back.png" ,
      combat		:	3 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	2 ,
      rloss		:	2 ,
      rmovement		:	3 ,
    });

    //
    // Russian Cavalry
    //
    this.importUnit('ru_cav', {
      ckey		:       "RU" ,
      country           :       "Russia" ,
      name		:	"Russian Cavalry" ,
      type		:	"corps" ,
      front		:	"ru_cav.png" ,
      back		:	"ru_cav_back.png" ,
      combat		:	1 ,
      loss		:	1 ,
      movement		:	4 ,
      rcombat		:	0 ,
      rloss		:	1 ,
      rmovement		:	4 ,
    });

    //
    // Russian Corps
    //
    this.importUnit('ru_corps', {
      ckey		:       "RU" ,
      country           :       "Russia" ,
      name		:	"Russian Corps" ,
      type		:	"corps" ,
      front		:	"ru_corps.png" ,
      back		:	"ru_corps_back.png" ,
      combat		:	1 ,
      loss		:	1 ,
      movement		:	3 ,
      rcombat		:	0 ,
      rloss		:	1 ,
      rmovement		:	3 ,
    });

    //
    // Serbia
    //
    this.importUnit('sb_army01', {
      ckey		:       "SB" ,
      country           :       "Serbia" ,
      name		:	"1st Army" ,
      type		:	"army" ,
      front		:	"sb_army01.png" ,
      back		:	"sb_army01_back.png" ,
      combat		:	2 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	1 ,
      rloss		:	2 ,
      rmovement		:	3 ,
      checkSupplyStatus :	(paths_self, spacekey) => { 
	if (paths_self.game.spaces[spacekey].country == "serbia") { return 1; }
      } ,
    });
    this.importUnit('sb_army02', {
      ckey		:       "SB" ,
      country           :       "Serbia" ,
      name		:	"2nd Army" ,
      type		:	"army" ,
      front		:	"sb_army02.png" ,
      back		:	"sb_army02_back.png" ,
      combat		:	2 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	1 ,
      rloss		:	2 ,
      rmovement		:	3 ,
      checkSupplyStatus :	(paths_self, spacekey) => { 
	if (paths_self.game.spaces[spacekey].country == "serbia") { return 1; }
      } ,
    });

    //
    // Serbian Corps
    //
    this.importUnit('sb_corps', {
      ckey		:       "SB" ,
      country           :       "Serbia" ,
      name		:	"Serbian Corps" ,
      type		:	"corps" ,
      front		:	"sb_corps.png" ,
      back		:	"sb_corps_back.png" ,
      combat		:	1 ,
      loss		:	1 ,
      movement		:	4 ,
      rcombat		:	0 ,
      rloss		:	1 ,
      rmovement		:	4 ,
      checkSupplyStatus :	(paths_self, spacekey) => { 
	if (paths_self.game.spaces[spacekey].country == "serbia") { return 1; }
      } ,
    });

    //
    // Sennusi Tribal
    //
    this.importUnit('sn_corps', {
      ckey		:       "SN" ,
      country           :       "Sennusi" ,
      name		:	"Sennusi Corps" ,
      type		:	"corps" ,
      front		:	"sn_corps.png" ,
      back		:	"sn_corps_back.png" ,
      combat		:	1 ,
      loss		:	1 ,
      movement		:	1 ,
      rcombat		:	0 ,
      rloss		:	1 ,
      rmovement		:	1 ,
      checkSupplyStatus :	(paths_self, spacekey) => { return 1; }
    });

    //
    // Turkish Corps
    //
    this.importUnit('tu_corps', {
      ckey		:       "TU" ,
      country           :       "Turkey" ,
      name		:	"Turkish Corps" ,
      type		:	"corps" ,
      front		:	"tu_corps.png" ,
      back		:	"tu_corps_back.png" ,
      combat		:	1 ,
      loss		:	1 ,
      movement		:	3 ,
      rcombat		:	0 ,
      rloss		:	1 ,
      rmovement		:	3 ,
    });

    //
    // US Army
    //
    this.importUnit('us_army01', {
      ckey		:       "US" ,
      country           :       "United States" ,
      name		:	"1st Army" ,
      type		:	"army" ,
      front		:	"us_army01.png" ,
      back		:	"us_army01_back.png" ,
      combat		:	5 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	3 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });
    this.importUnit('us_army02', {
      ckey		:       "US" ,
      country           :       "United States" ,
      name		:	"2nd Army" ,
      type		:	"army" ,
      front		:	"us_army02.png" ,
      back		:	"us_army02_back.png" ,
      combat		:	5 ,
      loss		:	3 ,
      movement		:	3 ,
      rcombat		:	3 ,
      rloss		:	3 ,
      rmovement		:	3 ,
    });

    //
    // US Army Corps
    //
    this.importUnit('us_corps', {
      ckey		:       "US" ,
      country           :       "United States" ,
      name		:	"United States Corps" ,
      type		:	"corps" ,
      front		:	"us_corps.png" ,
      back		:	"us_corps_back.png" ,
      combat		:	2 ,
      loss		:	1 ,
      movement		:	4 ,
      rcombat		:	1 ,
      rloss		:	1 ,
      rmovement		:	4 ,
    });


    //
    // Yilderim Army
    //
    this.importUnit('yld_army01', {
      ckey		:       "YLD" ,
      country           :       "Yilderim" ,
      name		:	"1st Army" ,
      type		:	"army" ,
      front		:	"yld_army01.png" ,
      back		:	"yld_army01_back.png" ,
      combat		:	1 ,
      loss		:	2 ,
      movement		:	3 ,
      rcombat		:	1 ,
      rloss		:	2 ,
      rmovement		:	2 ,
    });



