/*********************************************************************************
 GAME ANIMATION

	This file contains the sub library of game animations making it (slightly) easier
	to create/copy a game element and move it across the screen to a predetermined 
	location. 
 

**********************************************************************************/

class GameAnimation {
	//
	// Make a function async and await timeout to pause game execution
	//
	timeout(ms) {
		return new Promise((res) => setTimeout(res, ms));
	}

	async runAnimationQueue(timer = 50) {
		if (this.animationSequence.length == 0) {
			//console.log("Animation queue already empty");
			return;
		}
		//console.log(`Sequencing ${this.animationSequence.length} Animations`);

		console.info("Halt game for animation");
		this.halted = 1;

		while (this.animationSequence.length > 0) {
			let nextStep = this.animationSequence.shift();
			let { callback, params } = nextStep;
			console.log("Animation: ", JSON.stringify(params));
			if (nextStep.delay) {
				await this.timeout(nextStep.delay);
			}
			if (callback) {
				callback.apply(this, params);
			}

			if (this.animationSequence.length > 0) {
				await this.timeout(timer);
			} else {
				console.log("Animation Sequence Finished");
				return;
			}
		}
	}

	copyGameElement(target) {
		let target_obj =
			typeof target === 'string'
				? document.querySelector(target)
				: target;

		if (!target_obj) {
			console.warn('Objects not found! ', target);
			return null;
		}

		let source_stats = target_obj.getBoundingClientRect();

		//Find a unique ID for our container
		let i = 0;
		for (let helper of document.querySelectorAll('.animated_elem')) {
			let temp_id = helper.id.replace('ae', '');
			if (parseInt(temp_id) >= i) {
				i = parseInt(temp_id) + 1;
			}
		}

		let divid = 'ae' + i;

		//Create temporary container
		this.app.browser.addElementToDom(
			`<div id="${divid}" class="animated_elem"></div>`
		);

		//Set properties
		let this_helper = document.getElementById(`${divid}`);
		this_helper.style.top = `${source_stats.top}px`;
		this_helper.style.left = `${source_stats.left}px`;
		this_helper.style.height = `${source_stats.height}px`;
		this_helper.style.width = `${source_stats.width}px`;
		this_helper.style.zIndex = 100 + i;

		let as = `${this.animationSpeed / 1000}s`;
		this_helper.style.transition = `left ${as}, top ${as}, width ${as}, height ${as}, opacity ${
			(this.animationSpeed * 3) / 2000
		}s`;

		//Fall back if we haven't defined the hidden class
		//target_obj.style.visibility = "hidden";

		//Copy the element we want to move
		let clone = target_obj.cloneNode(true);
		clone.id = '';
		clone.style.top = '';
		clone.style.bottom = '';
		clone.style.left = '';
		clone.style.right = '';

		//Hide the original (We make the copy so that any flex/grid layouts don't suddenly snap out of place)
		target_obj.classList.add('copied_elem');

		//Insert copy in the element that moves
		this_helper.append(clone);
		//clone.style.visibility = null;

		return divid;
	}

	/**
	 *  @param HTML the html for the object to create
	 *  @param origin_reference a selector for an element in the DOM that will be there reference for the initial top/left of the created element
	 *  @param dimension_reference (optional) a selector for an element to serve as the initial reference for height/width of the created element
	 */
	createGameElement(html, origin_reference, dimension_reference = null) {
		if (
			!document.querySelector(origin_reference) ||
			(dimension_reference &&
				!document.querySelector(dimension_reference))
		) {
			return null;
		}

		let source_stats = document
			.querySelector(origin_reference)
			.getBoundingClientRect();
		let destination_stats = dimension_reference
			? document
				.querySelector(dimension_reference)
				.getBoundingClientRect()
			: source_stats;

		//Find a unique ID for our container
		let i = 0;
		for (let helper of document.querySelectorAll('.animated_elem')) {
			let temp_id = helper.id.replace('ae', '');
			if (parseInt(temp_id) >= i) {
				i = parseInt(temp_id) + 1;
			}
		}

		let divid = 'ae' + i;

		this.app.browser.addElementToDom(
			`<div id="${divid}" class="animated_elem">${html}</div>`
		);

		let this_helper = document.getElementById(`${divid}`);
		this_helper.style.top = `${source_stats.top}px`;
		this_helper.style.left = `${source_stats.left}px`;
		this_helper.style.height = `${destination_stats.height}px`;
		this_helper.style.width = `${destination_stats.width}px`;
		this_helper.style.zIndex = 100 + i;

		let as = `${this.animationSpeed / 1000}s`;
		this_helper.style.transition = `left ${as}, top ${as}, width ${as}, height ${as}`;

		return divid;
	}

	/*
  Useful Options:
      1) callback -- function to run on moving object at beginning of motion
      2) resize -- resize object to that of it's destination
      3) insert -- append object in destination at end of animation
      4) run_all_callbacks -- a flag to run each animations callback up completion

  */
	moveGameElement(animatedObjId, destination, options, callback = null) {
		let game_self = this;

		let destination_obj =
			typeof destination === 'string'
				? document.querySelector(destination)
				: destination;

		if (!destination_obj) {
			console.warn('Object not found: destination', destination);
			return null;
		}

		this.animation_queue.push(animatedObjId);

		let destination_stats = destination_obj.getBoundingClientRect();

		if (!document.getElementById(animatedObjId)){
			console.warn("Object to animate missing!");
		}

		$(`#${animatedObjId}`)
			.delay(10)
			.queue(function () {
				//Flexible callback to add effect during move
				if (options?.resize) {
					$(this).children().css('width', '100%');
					$(this).css({
						width: `${destination_stats.width}px`,
						height: `${destination_stats.height}px`
					});
				}

				$(this).children().css('visibility', '');
				if (options?.callback) {
					options.callback(animatedObjId);
				}

				$(this)
					.css({
						top: `${destination_stats.top}px`,
						left: `${destination_stats.left}px`
					})
					.dequeue();
			})
			.delay(game_self.animationSpeed)
			.queue(function () {
				let item = this;
				if (options?.insert) {
					item = $(this).children()[0];
					//console.log("Appending element:", item);
					$(destination + " .copied_elem").remove();
					document.querySelector(destination).append(item);
				}

				$(this).addClass('done'); //Still used???
				game_self.animation_queue.shift();

				if (
					game_self.animation_queue.length == 0 &&
					game_self.animationSequence.length == 0
				) {

					if (options?.insert) {
						//console.log('Delete original elements');
						$('.copied_elem').remove();
					} else {
						//console.log('Remove copied');
						$('.copied_elem').removeClass('copied_elem');
					}

					if (callback) {
						//console.log("MoveGameElement finished, running callback");
						callback(item);
					} else {
						$('.animated_elem').remove();
						//console.log("MoveGameElement finished, but no callback");
					}
				} else if (options?.run_all_callbacks == true) {
					//console.log('Running callback even though more items in queue');
					if (callback) {
						callback(item);
					}
				}

				$(this).dequeue();
			});
	}
}

module.exports = GameAnimation;
