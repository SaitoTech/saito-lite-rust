const SectorTemplate = require('./sector.template');

class Sector {
	constructor(app, mod, container = '', sector) {
		this.app = app;
		this.mod = mod;
		this.container = container;
		this.sector = sector;
		console.log('Setting sector as: ' + sector);
	}

	render() {
		let myqs = this.container + ` .hexIn`;
		let obj = null;

		try {
			obj = document.querySelector(myqs);
		} catch (err) {}

		if (obj) {
			this.app.browser.replaceElementBySelector(
				SectorTemplate(this.mod, this.sector),
				myqs
			);
		} else {
			this.app.browser.addElementToSelector(
				SectorTemplate(this.mod, this.sector),
				this.container
			);
		}

		this.update();
	}

	update() {
		let imperium_self = this.mod;
		let sector = this.sector;
		let sys = imperium_self.returnSectorAndPlanets(sector);

		//
		// first remove any units we do not want to display, but skip this if we
		// are midway through destroying units, as pruning in that situation can
		// cause issues with ships disappearing from arrays.
		//
		for (let i = 0; i < imperium_self.game.state.players_info.length; i++) {
			if (imperium_self.game.queue.length > 0) {
				let lmv =
					imperium_self.game.queue[
						imperium_self.game.queue.length - 1
					].split('\t');
				if (lmv[0] !== 'destroy_unit' && lmv[0] !== 'assign_hit') {
					imperium_self.eliminateDestroyedUnitsInSector(
						i + 1,
						sector
					);
				}
			}
		}

		let divsector = '#hex_space_' + sector;
		let fleet_color = '';
		let bg = '';
		let bgsize = '';
		let sector_controlled = 0;
		let player_border_visible = 0;
		let player_fleet_drawn = 0;
		let player_planets_drawn = 0;

		//
		// is activated?
		//
		if (sys.s.activated[imperium_self.game.player - 1] == 1) {
			let divpid = '#' + sector;
			$(divpid)
				.find('.hex_activated')
				.css(
					'background-color',
					'var(--p' + imperium_self.game.player + ')'
				);
			$(divpid).find('.hex_activated').css('opacity', '0.3');
		} else {
			let divpid = '#' + sector;
			$(divpid).find('.hex_activated').css('opacity', '0.0');
		}

		//
		// for each faction with units in space...
		//
		for (let z = 0; z < sys.s.units.length; z++) {
			let player = z + 1;

			if (sys.s.type > 0) {
				let divpid = '#hex_img_hazard_border_' + sector;
				$(divpid).css('display', 'block');
			}

			if (sys.s.units[player - 1].length > 0) {
				let divpid = '#hex_img_faction_border_' + sector;
				let newclass = 'player_color_' + player;
				$(divpid).removeClass('player_color_1');
				$(divpid).removeClass('player_color_2');
				$(divpid).removeClass('player_color_3');
				$(divpid).removeClass('player_color_4');
				$(divpid).removeClass('player_color_5');
				$(divpid).removeClass('player_color_6');
				$(divpid).addClass(newclass);
				$(divpid).css('display', 'block');
				$(divpid).css('opacity', '1');
				player_border_visible = 1;
			}

			//
			// for each space unit belonging to this faction
			//
			let updated_space_graphics = null;
			if (sys.s.units[player - 1].length > 0) {
				updated_space_graphics = 1;
				player_fleet_drawn = 1;

				let carriers = 0;
				let fighters = 0;
				let destroyers = 0;
				let cruisers = 0;
				let dreadnaughts = 0;
				let flagships = 0;
				let warsuns = 0;

				for (let i = 0; i < sys.s.units[player - 1].length; i++) {
					let ship = sys.s.units[player - 1][i];
					if (ship.type == 'carrier') {
						carriers++;
					}
					if (ship.type == 'fighter') {
						fighters++;
					}
					if (ship.type == 'destroyer') {
						destroyers++;
					}
					if (ship.type == 'cruiser') {
						cruisers++;
					}
					if (ship.type == 'dreadnaught') {
						dreadnaughts++;
					}
					if (ship.type == 'flagship') {
						flagships++;
					}
					if (ship.type == 'warsun') {
						warsuns++;
					}
				}

				let space_frames = [];
				let ship_graphics = [];

				////////////////////
				// SPACE GRAPHICS //
				////////////////////
				fleet_color = 'color' + player;

				if (fighters > 0) {
					let x = fighters;
					if (fighters > 9) {
						x = 9;
					}
					let numpng = 'white_space_frame_1_' + x + '.png';
					ship_graphics.push('white_space_fighter.png');
					space_frames.push(numpng);
				}
				if (destroyers > 0) {
					let x = destroyers;
					if (destroyers > 9) {
						x = 9;
					}
					let numpng = 'white_space_frame_2_' + x + '.png';
					ship_graphics.push('white_space_destroyer.png');
					space_frames.push(numpng);
				}
				if (carriers > 0) {
					let x = carriers;
					if (carriers > 9) {
						x = 9;
					}
					let numpng = 'white_space_frame_3_' + x + '.png';
					ship_graphics.push('white_space_carrier.png');
					space_frames.push(numpng);
				}
				if (cruisers > 0) {
					let x = cruisers;
					if (cruisers > 9) {
						x = 9;
					}
					let numpng = 'white_space_frame_4_' + x + '.png';
					ship_graphics.push('white_space_cruiser.png');
					space_frames.push(numpng);
				}
				if (dreadnaughts > 0) {
					let x = dreadnaughts;
					if (dreadnaughts > 9) {
						x = 9;
					}
					let numpng = 'white_space_frame_5_' + x + '.png';
					ship_graphics.push('white_space_dreadnaught.png');
					space_frames.push(numpng);
				}

				if (flagships > 0) {
					let x = flagships;
					if (flagships > 9) {
						x = 9;
					}
					let numpng = 'white_space_frame_6_' + x + '.png';
					ship_graphics.push('white_space_flagship.png');
					space_frames.push(numpng);
				}
				if (warsuns > 0) {
					let x = warsuns;
					if (warsuns > 9) {
						x = 9;
					}
					let numpng = 'white_space_frame_7_' + x + '.png';
					ship_graphics.push('white_space_warsun.png');
					space_frames.push(numpng);
				}

				//
				// remove and re-add space frames
				//
				let old_images = '#hex_bg_' + sector + ' > .sector_graphics';
				$(old_images).remove();
				let divsector2 = '#hex_bg_' + sector;
				let player_color = 'player_color_' + player;
				for (let i = 0; i < ship_graphics.length; i++) {
					$(divsector2).append(
						'<img class="sector_graphics ' +
							player_color +
							' ship_graphic sector_graphics_space sector_graphics_space_' +
							sector +
							'" src="/imperium/img/frame/' +
							ship_graphics[i] +
							'" />'
					);
				}
				for (let i = 0; i < space_frames.length; i++) {
					$(divsector2).append(
						'<img style="opacity:0.8" class="sector_graphics sector_graphics_space sector_graphics_space_' +
							sector +
							'" src="/imperium/img/frame/' +
							space_frames[i] +
							'" />'
					);
				}
			}
		}

		//
		// if player_fleet_drawn is 0 then remove any space ships
		//
		if (player_fleet_drawn == 0) {
			let old_images = '#hex_bg_' + sector + ' > .sector_graphics';
			$(old_images).remove();
		}

		let ground_frames = [];
		let ground_pos = [];

		for (let z = 0; z < sys.s.units.length; z++) {
			let player = z + 1;

			////////////////////////
			// PLANETARY GRAPHICS //
			////////////////////////
			let total_ground_forces_of_player = 0;

			for (let j = 0; j < sys.p.length; j++) {
				total_ground_forces_of_player +=
					sys.p[j].units[player - 1].length;
			}

			if (total_ground_forces_of_player > 0) {
				for (let j = 0; j < sys.p.length; j++) {
					player_planets_drawn = 1;

					if (
						sys.p[j].units[player - 1].length > 0 &&
						player_border_visible == 0
					) {
						let divpid = '#hex_img_faction_border_' + sector;
						let newclass = 'player_color_' + player;
						$(divpid).removeClass('player_color_1');
						$(divpid).removeClass('player_color_2');
						$(divpid).removeClass('player_color_3');
						$(divpid).removeClass('player_color_4');
						$(divpid).removeClass('player_color_5');
						$(divpid).removeClass('player_color_6');
						$(divpid).addClass(newclass);
						$(divpid).css('display', 'block');
						$(divpid).css('opacity', '0.6');
						player_border_visible = 1;
					}

					let infantry = 0;
					let spacedock = 0;
					let pds = 0;

					for (
						let k = 0;
						k < sys.p[j].units[player - 1].length;
						k++
					) {
						let unit = sys.p[j].units[player - 1][k];
						if (unit.type == 'infantry') {
							infantry++;
						}
						if (unit.type == 'pds') {
							pds++;
						}
						if (unit.type == 'spacedock') {
							spacedock++;
						}
					}

					let postext = '';
					ground_frames.push('white_planet_center.png');
					if (sys.p.length == 1) {
						postext = 'center';
					} else {
						if (j == 0) {
							postext = 'top_left';
						}
						if (j == 1) {
							postext = 'bottom_right';
						}
					}
					ground_pos.push(postext);

					if (infantry > 0) {
						let x = infantry;
						if (infantry > 9) {
							x = 9;
						}
						let numpng = 'white_planet_center_1_' + x + '.png';
						ground_frames.push(numpng);
						ground_pos.push(postext);
					}
					if (spacedock > 0) {
						let x = spacedock;
						if (spacedock > 9) {
							x = 9;
						}
						let numpng = 'white_planet_center_2_' + x + '.png';
						ground_frames.push(numpng);
						ground_pos.push(postext);
					}
					if (pds > 0) {
						let x = pds;
						if (pds > 9) {
							x = 9;
						}
						let numpng = 'white_planet_center_3_' + x + '.png';
						ground_frames.push(numpng);
						ground_pos.push(postext);
					}
				}

				//
				// remove space units if needed - otherwise last unit will not be removed when sector is emptied
				//
				if (player_fleet_drawn == 0) {
					let old_images =
						'#hex_bg_' + sector + ' > .sector_graphics';
					$(old_images).remove();
					player_fleet_drawn = 1;
				}

				//
				// remove and re-add space frames
				//
				let old_images =
					'#hex_bg_' + sector + ' > .sector_graphics_planet';
				$(old_images).remove();

				let divsector2 = '#hex_bg_' + sector;
				let player_color = 'player_color_' + player;
				let pid = 0;
				for (let i = 0; i < ground_frames.length; i++) {
					if (i > 0 && ground_pos[i] != ground_pos[i - 1]) {
						pid++;
					}
				}
			}
		}

		if (player_border_visible == 0) {
			for (let p = 0; p < sys.p.length; p++) {
				if (sys.p[p].owner != -1) {
					let divpid = '#hex_img_faction_border_' + sector;
					let newclass = 'player_color_' + sys.p[p].owner;
					$(divpid).removeClass('player_color_1');
					$(divpid).removeClass('player_color_2');
					$(divpid).removeClass('player_color_3');
					$(divpid).removeClass('player_color_4');
					$(divpid).removeClass('player_color_5');
					$(divpid).removeClass('player_color_6');
					$(divpid).addClass(newclass);
					$(divpid).css('display', 'block');
					$(divpid).css('opacity', '0.6');
					player_border_visible = 1;
				}
			}
		}

		//
		// add events to anything listed
		//
		this.attachEvents();
	}

	attachEvents() {
		let imperium_self = this.mod;
		let qs = `.sector_${this.sector}`;
		let sys = imperium_self.returnSectorAndPlanets(this.sector);
		let sector = this.sector;

		console.log('attach events...');
		console.log('testing: ' + qs);
		console.log('to sector: ' + this.sector);
		let xpos = 0;
		let ypos = 0;

		try {
			$(qs).off();

			$(qs)
				.on('mouseenter', function () {
					let pid = $(this).attr('id');
					imperium_self.showSector(pid);
				})
				.on('mouseleave', function () {
					let pid = $(this).attr('id');
					imperium_self.hideSector(pid);
				});

			$(qs).on('mousedown', function (e) {
				xpos = e.clientX;
				ypos = e.clientY;
			});

			$(qs).on('mouseup', function (e) {
				if (Math.abs(xpos - e.clientX) > 4) {
					return;
				}
				if (Math.abs(ypos - e.clientY) > 4) {
					return;
				}
// TEST / HACK
				imperium_self.zoom_overlay.render(sector);
//				imperium_self.sector_overlay.render(sector);
			});
		} catch (err) {
			console.log('error attaching events to sector...');
		}
	}
}

module.exports = Sector;
