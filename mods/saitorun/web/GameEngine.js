import * as THREE from './three.module.js';
import { GLTFLoader } from './GLTFLoader.js';
import { DRACOLoader } from './DRACOLoader.js';
import { RGBELoader } from './RGBELoader.js';
import { LoadingBar } from './LoadingBar.js';
import { Vector3 } from './three.module.js';
import { getRandomQuestion } from './trivia.js';

class GameEngine {
	constructor() {
		const container = document.createElement('div');
		document.body.appendChild(container);

		this.clock = new THREE.Clock();

		this.loadingBar = new LoadingBar();
		this.loadingBar.visible = false;

		this.camera = new THREE.PerspectiveCamera(
			60,
			window.innerWidth / window.innerHeight,
			0.1,
			100
		);
		this.camera.position.set(0, 2, -5);

		this.cameraController = new THREE.Object3D();
		this.cameraController.add(this.camera);

		this.cameraTarget = new THREE.Vector3(3, 3, 0);

		this.scene = new THREE.Scene();

		this.scene.add(this.cameraController);

		// new light
		this.dirLight.position.set(0, 2.3, 8);
		this.dirLight.target.position.set(0, -10, 6);
		this.dirLight.castShadow = true;
		this.dirLight.shadow.bias = -0.001;
		this.dirLight.shadow.mapSize.width = 2048;
		this.dirLight.shadow.mapSize.height = 16384;
		this.dirLight.shadow.camera.near = 0.1;
		this.dirLight.shadow.camera.far = 500.0;
		this.dirLight.shadow.camera.near = 0.5;
		this.dirLight.shadow.camera.far = 500.0;
		this.dirLight.shadow.camera.left = 100;
		this.dirLight.shadow.camera.right = -100;
		this.dirLight.shadow.camera.top = 100;
		this.dirLight.shadow.camera.bottom = -100;
		this.scene.add(this.dirLight);
		this.scene.add(this.dirLight.target);

		let ambient = new THREE.AmbientLight(0x101010);
		this.scene.add(ambient);

		this.renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true
		});
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setClearColor(0x000000, 0); // the default
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.outputEncoding = THREE.sRGBEncoding;
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		container.appendChild(this.renderer.domElement);
		this.setEnvironment();

		window.addEventListener('resize', this.resize.bind(this));

		document.addEventListener('keydown', this.keyDown.bind(this));

		// mobile touch actions
		document.addEventListener(
			'touchstart',
			this.handleTouchStart.bind(this),
			false
		);
		document.addEventListener(
			'touchmove',
			this.handleTouchMove.bind(this),
			false
		);
		// mobile touch actions end
		const answer1Button = document.getElementById('answer-0');
		const answer2Button = document.getElementById('answer-1');
		const answer3Button = document.getElementById('answer-2');

		function handleAnswer1() {
			this.handleAnswer(0);
		}

		function handleAnswer2() {
			this.handleAnswer(1);
		}

		function handleAnswer3() {
			this.handleAnswer(2);
		}

		answer1Button.addEventListener('click', handleAnswer1.bind(this));
		answer2Button.addEventListener('click', handleAnswer2.bind(this));
		answer3Button.addEventListener('click', handleAnswer3.bind(this));
	}

	gameLoaded = false;

	dirLight = new THREE.DirectionalLight(0xffffff, 5);

	// mobile touch actions
	xDown = null;
	yDown = null;

	getTouches(evt) {
		return (
			evt.touches || // browser API
			evt.originalEvent.touches
		); // jQuery
	}

	handleTouchStart(evt) {
		const firstTouch = this.getTouches(evt)[0];
		this.xDown = firstTouch.clientX;
		this.yDown = firstTouch.clientY;
	}

	handleTouchMove(evt) {
		if (!this.xDown || !this.yDown) {
			return;
		}

		var xUp = evt.touches[0].clientX;
		var yUp = evt.touches[0].clientY;

		var xDiff = this.xDown - xUp;
		var yDiff = this.yDown - yUp;
		if (!this.gameLoaded && this.triviaAnswered) {
			if (yDiff < 0) {
				this.gameLoaded = true;
				this.loadCharacter();
				return;
			} else {
				return;
			}
		}

		if (Math.abs(xDiff) > Math.abs(yDiff)) {
			/*most significant*/
			if (xDiff > 0) {
				this.leftAction();
			} else {
				this.rightAction();
			}
		} else {
			if (yDiff > 0) {
				this.jumpAction();
			} else {
				this.slideAction();
			}
		}
		/* reset values */
		this.xDown = null;
		this.yDown = null;
	}
	// mobile touch actions end

	canTurn() {
		return !this.isJumping && !this.isSliding && this.triviaAnswered;
	}

	canResumeRunning() {
		return (
			!this.isJumping &&
			!this.isSliding &&
			this.action !== 'falling' &&
			this.action !== 'bounce' &&
			!this.levelCompleted &&
			this.triviaAnswered
		);
	}

	jumpAction() {
		if (this.canResumeRunning()) {
			this.jumpStart = Math.round(this.character.position.z * 10) / 10;
			this.jumpEnd =
				Math.round(
					(this.character.position.z + 16 * this.moveBy) * 10
				) / 10; // approx 16 translateZ movements within a slide
			this.jump();
		}
	}

	slideAction() {
		if (this.canResumeRunning()) {
			this.diveStart = Math.round(this.character.position.z * 10) / 10;
			this.diveEnd =
				Math.round(
					(this.character.position.z + 16 * this.moveBy) * 10
				) / 10; // approx 16 translateZ movements within a slide
			this.slide();
		}
	}

	leftAction() {
		if (
			this.character.position.x < 1 &&
			!this.levelCompleted &&
			this.canTurn()
		) {
			this.previousX = Math.round(this.character.position.x * 10) / 10;
			this.currentX = this.previousX + 1;
			this.character.translateX(1);
			this.updateCamera();
		}
	}

	rightAction() {
		if (
			this.character.position.x > -1 &&
			!this.levelCompleted &&
			this.canTurn()
		) {
			this.previousX = Math.round(this.character.position.x * 10) / 10;
			this.currentX = this.previousX - 1;
			this.character.translateX(-1);
			this.updateCamera();
		}
	}

	keyDown(evt) {
		if (!this.gameLoaded && this.triviaAnswered) {
			if (evt.keyCode === 40) {
				this.gameLoaded = true;
				this.loadCharacter();
				return;
			}
		}
		if (this.animIndex > 1 && !this.stopped) {
			switch (evt.keyCode) {
			case 32:
				this.jumpAction();
				break;
			case 40: // down arrow
				this.slideAction();
				break;
			case 37: // left arrow
				this.leftAction();
				break;
			case 39: // right arrow
				this.rightAction();
				break;
			}
		}
	}

	addPathCube(geometry, material, x, y, z, rotate) {
		const cube = new THREE.Mesh(geometry, material);
		cube.position.setX(x);
		cube.position.setY(y);
		cube.position.setZ(z);
		if (rotate) {
			cube.rotation.z = Math.PI - Math.PI / 2;
		}
		cube.receiveShadow = true;
		cube.castShadow = true;
		this.scene.add(cube);
		this.floorCubes.push(cube);
	}

	addCeiling() {
		const ceilingTexture = new THREE.TextureLoader().load(
			`./img/crooked-grey-bricks.png`
		);
		ceilingTexture.wrapS = ceilingTexture.wrapT = THREE.RepeatWrapping;
		ceilingTexture.repeat.set(3, 3);
		const material = new THREE.MeshBasicMaterial({
			map: ceilingTexture,
			side: THREE.DoubleSide
		});
		const geometry = new THREE.PlaneGeometry(9, 9, 1, 1);
		const cube = new THREE.Mesh(geometry, material);
		cube.receiveShadow = true;
		cube.castShadow = true;
		cube.rotation.x = Math.PI - Math.PI / 2;
		for (let z = -9; z <= 414; z = z + 9) {
			let c = cube.clone();
			c.position.setX(0);
			c.position.setY(2.2);
			c.position.setZ(z);
			this.scene.add(c);
			this.ceilingCubes.push(c);
		}
	}

	addHangingObstacle(x, z) {
		const texture = new THREE.TextureLoader().load(`./img/mark.jpg`);
		const wallMaterialNormal = new THREE.MeshBasicMaterial({
			map: texture,
			side: THREE.DoubleSide
		});
		const wallGeometry = new THREE.PlaneGeometry(3, 2, 1, 1);
		const hangingObstacle = new THREE.Mesh(
			wallGeometry,
			wallMaterialNormal
		);
		hangingObstacle.position.set(0, 1, z);
		this.wallSegments.push(hangingObstacle);
		this.scene.add(hangingObstacle);
		for (const xs of x) {
			const geometry = new THREE.PlaneGeometry(1, 1);
			const material = new THREE.MeshStandardMaterial({
				color: 0x000000,
				side: THREE.DoubleSide,
				transparent: true,
				opacity: 0.2
			});
			const plane = new THREE.Mesh(geometry, material);
			plane.position.set(xs, -0.99, z + 0.5);
			plane.rotation.x = Math.PI / 2;
			this.scene.add(plane);
			this.wallSegments.push(plane);
		}
	}

	addWalls() {
		const normalTexture = new THREE.TextureLoader().load(
			`./img/thick-grey.png`
		);
		const wallMaterialNormal = new THREE.MeshBasicMaterial({
			map: normalTexture,
			side: THREE.DoubleSide
		});
		const wallGeometry = new THREE.PlaneGeometry(8, 8, 1, 1);
		for (let z = -8; z <= 408; ) {
			const wall = new THREE.Mesh(wallGeometry, wallMaterialNormal);
			const wall2 = new THREE.Mesh(wallGeometry, wallMaterialNormal);
			wall.rotation.y = Math.PI / 2;
			wall.position.set(-1.5, -2, z);
			wall2.position.set(1.5, -2, z);
			wall2.rotation.y = Math.PI / 2;
			this.scene.add(wall);
			this.scene.add(wall2);
			this.wallSegments.push(wall);
			this.wallSegments.push(wall2);
			z = z + 8;
		}
	}

	getPreviousNarrowIndex(zIndex) {
		const lastMapEntryKey = (zIndex - 1).toString();
		if (
			this.pathTrackingMap.has(lastMapEntryKey) &&
			this.pathTrackingMap.get(lastMapEntryKey)['narrow'] === true
		) {
			if (this.pathTrackingMap.get(lastMapEntryKey)['1'] === true) {
				return 1;
			} else if (
				this.pathTrackingMap.get(lastMapEntryKey)['0'] === true
			) {
				return 0;
			} else {
				return -1;
			}
		}
		return -2;
	}

	getNarrowIndex(previousIndex) {
		if (previousIndex === -2) {
			return Math.floor(Math.random() * 3) - 1;
		} else {
			if (previousIndex === 1 || previousIndex === -1) {
				return 0;
			} else {
				return Math.floor(Math.random() * 2) - 1;
			}
		}
	}

	addPath(increment, blocksForward) {
		const floorTexture = new THREE.TextureLoader().load(
			`./img/grey-green-old.jpg`
		);
		const floorMaterial = new THREE.MeshBasicMaterial({
			map: floorTexture
		});

		const dimension = 1;
		const geometry = new THREE.BoxGeometry(dimension, dimension, dimension);
		// initial floor
		if (increment === 0) {
			for (let i = -4; i < blocksForward + 1; i++) {
				let zPosition = i;
				for (let j = -1; j < 2; j++) {
					this.addPathCube(
						geometry,
						floorMaterial,
						j,
						-1.5,
						zPosition,
						true
					);
				}
			}
		} else {
			const pathTypeIndicator = Math.floor(Math.random() * 3); // 0,1,2
			const isNarrow =
				(this.level === 1 && pathTypeIndicator === 2) ||
				(this.level > 1 && pathTypeIndicator > 0);
			const ditchIndicator = Math.floor(Math.random() * 2); // 0,1
			const isDitch =
				ditchIndicator > 0 && !(this.level === 1 && isNarrow);
			const hangingObstacleIndicator = Math.floor(Math.random() * 2); // 0,1
			const isHanging =
				hangingObstacleIndicator === 1 &&
				!isDitch &&
				((this.level === 2 && !isNarrow) || this.level > 2);
			const hangingZIndex = Math.floor(Math.random() * 3 + 3) + increment;
			const ditchStartZIndex = 2 + increment;
			const previousNarrowIndex = this.getPreviousNarrowIndex(increment);
			const narrowIndex = this.getNarrowIndex(previousNarrowIndex);

			let ditchLengthExtension = 0;
			let addNarrowPathToPreviousBatchLength = 3;
			const distance = increment + this.getDistance();
			if (distance > 300 && distance <= 600) {
				ditchLengthExtension = 1;
			} else if (distance > 600 && distance <= 800) {
				ditchLengthExtension = 2;
			} else if (distance > 800 && distance <= 1000) {
				ditchLengthExtension = 3;
				addNarrowPathToPreviousBatchLength = 4;
			} else if (distance > 1000) {
				ditchLengthExtension = 4;
				addNarrowPathToPreviousBatchLength = 5;
			}

			// add narrow path extension to previous batch to allow for moving left/right
			if (isNarrow && previousNarrowIndex !== -2) {
				for (
					let z = increment - 1;
					z >= increment - addNarrowPathToPreviousBatchLength;
					z--
				) {
					const mapEntry = this.pathTrackingMap.get(z.toString());
					this.pathTrackingMap.set(z.toString(), {
						ditch: mapEntry['ditch'],
						hanging: mapEntry['hanging'],
						narrow: mapEntry['narrow'],
						1: mapEntry['1'] === true || narrowIndex === 1,
						0: mapEntry['0'] === true || narrowIndex === 0,
						'-1': mapEntry['-1'] === true || narrowIndex === -1
					});
					this.addPathCube(
						geometry,
						floorMaterial,
						narrowIndex,
						-1.5,
						z,
						true
					);
				}
			}
			// initial path state for the next 10 moves forward
			for (let z = increment; z < increment + blocksForward; z++) {
				const isDitchIndex =
					isDitch &&
					z >= ditchStartZIndex &&
					z <= ditchStartZIndex + ditchLengthExtension;
				const isHangingIndex = isHanging && hangingZIndex === z;
				const fillOne =
					!isDitchIndex &&
					(!isNarrow || (isNarrow && narrowIndex === 1));
				const fillZero =
					!isDitchIndex &&
					(!isNarrow || (isNarrow && narrowIndex === 0));
				const fillMinusOne =
					!isDitchIndex &&
					(!isNarrow || (isNarrow && narrowIndex === -1));
				this.pathTrackingMap.set(z.toString(), {
					ditch: isDitchIndex,
					hanging: isHangingIndex,
					narrow: isNarrow,
					1: fillOne,
					0: fillZero,
					'-1': fillMinusOne
				});
				if (isHangingIndex) {
					if (isNarrow) {
						this.addHangingObstacle([narrowIndex], z);
					} else {
						this.addHangingObstacle([-1, 0, 1], z);
					}
				}
				if (fillOne) {
					this.addPathCube(geometry, floorMaterial, 1, -1.5, z, true);
				}
				if (fillZero) {
					this.addPathCube(geometry, floorMaterial, 0, -1.5, z, true);
				}
				if (fillMinusOne) {
					this.addPathCube(
						geometry,
						floorMaterial,
						-1,
						-1.5,
						z,
						true
					);
				}
				if (this.zNextPoints === z) {
					this.addPoint(z, 0, narrowIndex);
					if (this.pointsLeftInSequence === 0) {
						this.pointsLeftInSequence = 12;
						this.zNextPoints = this.zNextPoints + 40;
					} else {
						this.zNextPoints = this.zNextPoints + 2;
					}
				}
			}
		}
	}

	getPointValue() {
		return this.level;
	}

	addPoint(zIndex, yIndex, xIndex) {
		const dim = 0.2;
		this.pointsLeftInSequence--;
		let pointImage = `cube${this.level}.png`;
		const geometry = new THREE.BoxGeometry(dim, dim, dim);

		const loader = new THREE.TextureLoader();

		const material = new THREE.MeshBasicMaterial({
			map: loader.load(`./img/${pointImage}`)
		});

		const cube = new THREE.Mesh(geometry, material);
		cube.position.setX(xIndex);
		cube.position.setY(yIndex);
		cube.position.setZ(zIndex);
		cube.rotateX(135);
		cube.rotateY(135);
		cube.rotateZ(180);
		cube.castShadow = true;
		cube.receiveShadow = true;
		this.scene.add(cube);
		this.points.push(cube);
	}

	removeFirstPoint(z, hit) {
		if (this.points.length > 0 && this.points[0].position.z === z) {
			if (hit) {
				this.points[0].position.y = this.points[0].position.y + 0.5;
				this.increaseScore(this.getPointValue());
			}
			this.scene.remove(this.points[0]);
			this.points.splice(0, 1);
		}
	}

	getDistance() {
		return (this.level - 1) * 400;
	}

	async sleep(milliseconds) {
		return new Promise((resolve) => setTimeout(resolve, milliseconds));
	}

	cleanupCollection(collection, zIncrement) {
		let i = collection.length;
		while (i--) {
			if (collection[i].position.z < zIncrement - 15) {
				collection[i].material.dispose();
				collection[i].geometry.dispose();
				this.scene.remove(collection[i]);
				collection.splice(i, 1);
			}
		}
	}

	increaseScore(points) {
		this.pointsEarned = this.pointsEarned + points;

		const elm = document.getElementById('score');

		elm.innerHTML = this.pointsEarned;

		elm.classList.add('scaleOut');
		setTimeout(() => {
			elm.classList.remove('scaleOut');
		}, 100);
	}

	setDistance(distance) {
		const elm = document.getElementById('distance');

		elm.innerHTML = distance;
	}

	animatePoints() {
		let pointIndex = 0;
		while (pointIndex < 12 && pointIndex < this.points.length) {
			this.points[pointIndex].rotation.x += 0.2;
			this.points[pointIndex].rotation.y += 0.2;
			this.points[pointIndex].rotation.z += 0.2;
			pointIndex++;
		}
	}

	moveForward() {
		this.animatePoints();
		const distance = this.getDistance() + this.character.position.z;
		if (!this.levelCompleted) {
			if (distance < 200) {
				this.moveBy = 0.3;
			} else if (distance < 400) {
				if (
					this.action !== 'sprint' &&
					!this.isSliding &&
					!this.isJumping &&
					this.stumbleZ !== 0
				) {
					this.runningAction = 'sprint';
					this.action = this.runningAction;
				}
				this.moveBy = 0.4;
			} else if (distance < 600) {
				this.moveBy = 0.5;
			} else if (distance < 1000) {
				this.moveBy = 0.6;
			} else {
				this.moveBy = 0.8;
			}
			this.previousZ = Math.round(this.character.position.z * 10) / 10;

			this.currentZ = Math.round(
				((this.character.position.z + this.moveBy) * 10) / 10
			);
			if (this.currentZ % 20 === 0) {
				this.cleanupCollection(this.ceilingCubes, this.currentZ);
				this.cleanupCollection(this.floorCubes, this.currentZ);
				this.cleanupCollection(this.wallSegments, this.currentZ);
			}

			this.setDistance(Math.floor(distance));

			if (Math.floor(this.character.position.z) === this.levelStop - 1) {
				this.action = 'idle';
				this.levelCompleted = true;
				this.answerTrivia();
				return;
			}

			this.character.translateZ(this.moveBy);
			this.updateCamera();

			// detect collisions here
			let zFloor = Math.floor(this.currentZ);

			// zPosition.toString(), {"ditch": <bool>, "hanging": <bool>, "narrow": <bool>, "1": <bool>, "0": <bool>, "-1": <bool>}
			if (this.pathTrackingMap.has(zFloor.toString()) && !this.stopped) {
				let pathMapEntry = this.pathTrackingMap.get(zFloor.toString());

				// fall
				if (
					pathMapEntry['ditch'] === true &&
					!(this.jumpStart <= zFloor && this.jumpEnd >= zFloor + 1)
				) {
					this.stopped = true;
					setTimeout(this.fall.bind(this), 1);
					// hit hanging obstacle
				} else if (
					pathMapEntry['hanging'] === true &&
					!(this.diveStart <= zFloor && this.diveEnd >= zFloor + 1)
				) {
					this.stumbleZ = zFloor;
					this.stopped = true;
					setTimeout(this.stumble.bind(this), 1);
					// if narrow path
				} else if (
					!pathMapEntry['1'] ||
					!pathMapEntry['0'] ||
					!pathMapEntry['-1']
				) {
					if (
						!(
							this.jumpStart <= zFloor &&
							this.jumpEnd >= zFloor + 1
						)
					) {
						if (!pathMapEntry[this.currentX.toString()]) {
							setTimeout(this.fall.bind(this), 50);
						} else {
							if (
								this.points.length > 0 &&
								this.points[0].position.z === zFloor
							) {
								this.removeFirstPoint(
									zFloor,
									this.points[0].position.x === this.currentX
								);
							}
							setTimeout(this.moveForward.bind(this), 50);
						}
						// skip current z position check, if jump occurred before and will end after current z
					} else {
						if (
							this.points.length > 0 &&
							this.points[0].position.z === zFloor
						) {
							this.removeFirstPoint(
								zFloor,
								this.points[0].position.x === this.currentX
							);
						}
						setTimeout(this.moveForward.bind(this), 50);
					}
				} else {
					if (
						this.points.length > 0 &&
						this.points[0].position.z === zFloor
					) {
						this.removeFirstPoint(
							zFloor,
							this.points[0].position.x === this.currentX
						);
					}
					setTimeout(this.moveForward.bind(this), 50);
				}
			} else {
				setTimeout(this.moveForward.bind(this), 50);
			}
		}
	}

	answerTrivia() {
		this.triviaAnswered = false;
		this.question = getRandomQuestion();
		const triviaPanel = document.getElementById('trivia-panel');
		triviaPanel.style.display = 'block';
		const questionBlock = document.getElementById('question');
		const answer1Block = document.getElementById('answer-0-text');
		const answer2Block = document.getElementById('answer-1-text');
		const answer3Block = document.getElementById('answer-2-text');

		questionBlock.innerHTML = this.question.question;
		answer1Block.innerHTML = `a. ${this.question.answers[0].answer}`;
		answer2Block.innerHTML = `b. ${this.question.answers[1].answer}`;
		answer3Block.innerHTML = `c. ${this.question.answers[2].answer}`;
	}

	question = {};

	handleAnswer(answerIndex) {
		const triviaPanel = document.getElementById('trivia-panel');
		const wrongAnswer = this.question.correctAnswerIndex !== answerIndex;
		this.triviaAnswered = true;
		triviaPanel.style.display = 'none';
		this.endGame(false, wrongAnswer, this.question);
	}

	async stumble() {
		this.action = 'bounce';
		await this.sleep(3000);
		this.endGame(true, false, {});
	}

	async fall() {
		this.stopped = true;
		this.action = 'falling'; // TODO constant
		if (this.fallingIndex >= 0) {
			this.fallingIndex--;
			this.character.translateY(-2);
			this.updateCamera();
			setTimeout(this.fall.bind(this), 50);
		} else {
			await this.sleep(3000);
			this.endGame(true, false, {});
		}
	}

	level = 1;

	stumbleZ = 0;

	fallingIndex = 20;

	// position of next points objects sequence start
	zNextPoints = 40;

	// add 12 points in one sequence
	pointsLeftInSequence = 12;

	question = {};

	// pathTrackingMap - used to calculate potential collisions
	pathTrackingMap = new Map();

	isJumping = false;

	isSliding = false;

	jumpingIndex = 0;

	slidingIndex = 0;
	levelStop = 400;

	runningAction = 'running';

	startCount = 4;

	stopped = false;

	animIndex = 0;

	// points
	points = [];

	moveBy = 0;

	pathSegments = 8;

	previousZ = 0;
	previousX = 0;
	currentZ = 0;
	currentX = 0;
	jumpStart = 0;
	jumpEnd = 0;
	diveStart = 0;
	diveEnd = 0;

	hitHangingObstacle = false;

	pointsEarned = 0;

	floorCubes = [];

	ceilingCubes = [];

	wallSegments = [];

	levelCompleted = false;
	maxLevels = 5;

	triviaAnswered = true;

	resetGameFinishValues() {
		this.pointsEarned = 0;
		this.increaseScore(0);
		this.setDistance(0);
		this.previousZ = 0;
		this.previousX = 0;
		this.currentZ = 0;
		this.currentX = 0;
		this.moveBy = 0;
		this.level = 1;
		this.levelCompleted = false;
	}

	endGame(playerFailed, wrongAnswer, question) {
		const distance = this.currentZ + this.getDistance();
		if (this.triviaAnswered && distance > 0) {
			document.body.style.backgroundImage = 'url(\'./img/background.jpg\')';
			const instructions = document.getElementById('instructions');
			instructions.style.display = 'block';
			this.setDistance(distance);
			let message = `Level ${this.level} completed!<br>Distance: ${distance}<br>Points: ${this.pointsEarned}<br>Swipe down or press down arrow to continue`;
			const gameOver =
				wrongAnswer || playerFailed || this.level === this.maxLevels;
			if (wrongAnswer) {
				instructions.style.fontSize = '20px';
				message = `Wrong answer! <br> Correct answer for question <br>${
					question.question
				} <br>is: <br>${
					question.answers[question.correctAnswerIndex].answer
				} <br>Game over!<br>Distance: ${distance}<br>Points: ${
					this.pointsEarned
				}<br>Swipe down or press down arrow to restart`;
			} else if (playerFailed) {
				message = `Game over!<br>Distance: ${distance}<br>Points: ${this.pointsEarned}<br>Swipe down or press down arrow to restart`;
			} else {
				if (this.level === this.maxLevels) {
					message = `Level ${this.level} completed!<br>Distance: ${distance}<br>Points: ${this.pointsEarned}<br>More levels coming soon! Swipe down or press down arrow to restart`;
				}
				this.level++;
			}
			if (gameOver) {
				console.info(
					`SAITORUN:${this.level}|${distance}|${this.pointsEarned}`
				);
				this.pointsEarned = 0;
				this.resetGameFinishValues();
			}
			this.levelCompleted = false;
			instructions.innerHTML = message;

			this.cleanupCollection(this.floorCubes, this.currentZ + 3000);
			this.cleanupCollection(this.ceilingCubes, this.currentZ + 3000);
			this.cleanupCollection(this.wallSegments, this.currentZ + 3000);
			this.pathTrackingMap.clear();
			this.cleanupAllPointCubes();
			this.scene.remove(this.character);
			this.gameLoaded = false;
			this.animIndex = 0;
			this.stumbleZ = 0;
			this.pointsLeftInSequence = 12;
			this.pathTrackingMap = new Map();
			this.isJumping = false;
			this.isSliding = false;
			this.jumpingIndex = 0;
			this.slidingIndex = 0;
			this.startCount = 4;
			this.stopped = false;
			this.points = [];
			this.pathSegments = 100;
			this.jumpStart = 0;
			this.jumpEnd = 0;
			this.diveStart = 0;
			this.diveEnd = 0;
			this.hitHangingObstacle = false;
			this.floorCubes = [];
			this.zNextPoints = 40;
		}
	}

	cleanupAllPointCubes() {
		let i = this.points.length;
		while (i--) {
			this.points[i].material.dispose();
			this.points[i].geometry.dispose();
			this.scene.remove(this.points[i]);
			this.points.splice(i, 1);
		}
	}

	slide() {
		let timeout = 800;
		if (this.slidingIndex < 2 && !this.stopped) {
			if (!this.isSliding) {
				let action = 'rolling';
				this.action = action;
				this.isSliding = true;
			} else {
				this.isSliding = false;
				let action = this.runningAction;
				this.action = action;
				timeout = 1;
			}
			this.slidingIndex++;
			setTimeout(this.slide.bind(this), timeout);
		} else {
			this.slidingIndex = 0;
		}
	}

	jump() {
		let timeout = 800;
		if (this.jumpingIndex < 2 && !this.stopped) {
			if (!this.isJumping) {
				let action = 'jump';
				this.action = action;
				this.isJumping = true;
			} else {
				this.isJumping = false;
				let action = this.runningAction;
				this.action = action;
				timeout = 1;
			}
			this.jumpingIndex++;
			setTimeout(this.jump.bind(this), timeout);
		} else {
			this.jumpingIndex = 0;
		}
	}

	resize() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}

	setEnvironment() {
		const loader = new RGBELoader().setPath('');
		const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
		pmremGenerator.compileEquirectangularShader();

		const self = this;

		loader.load(
			'./img/hdr/factory.hdr',
			(texture) => {
				const envMap =
					pmremGenerator.fromEquirectangular(texture).texture;
				pmremGenerator.dispose();

				self.scene.environment = envMap;
			},
			undefined,
			(err) => {
				console.error(err.message);
			}
		);
	}

	loadCharacter() {
		const loader = new GLTFLoader().setPath(`./img/`);
		const dracoLoader = new DRACOLoader();
		dracoLoader.setDecoderConfig({ type: 'js' });
		dracoLoader.setDecoderPath(
			'https://www.gstatic.com/draco/v1/decoders/'
		);
		loader.setDRACOLoader(dracoLoader);
		this.loadingBar.visible = true;

		// Load animated character
		loader.load(
			'runner.glb',
			// called when the resource is loaded
			(gltf) => {
				this.scene.add(gltf.scene);
				this.character = gltf.scene;

				this.mixer = new THREE.AnimationMixer(gltf.scene);

				this.character.position.x = 0;
				this.character.position.y = -1;
				this.character.position.z = 0;

				this.character.castShadow = true;
				this.character.receiveShadow = true;

				this.character.scale.y = 0.8;
				this.character.scale.x = 0.8;
				this.character.scale.z = 0.8;

				this.fallingIndex = 20;

				this.animations = {};

				gltf.animations.forEach((animation) => {
					this.animations[animation.name.toLowerCase()] = animation;
				});

				this.actionName = '';

				this.newAnim();

				for (let i = 0; i < 410; i = i + 10) {
					this.addPath(i, 10);
				}
				this.addWalls();
				this.addCeiling();
				this.loadingBar.visible = false;
				this.updateCamera();

				this.renderer.setAnimationLoop(this.render.bind(this));
			},
			// called while loading is progressing
			(xhr) => {
				this.loadingBar.progress = xhr.loaded / xhr.total;
			},
			// called when loading has errors
			(err) => {
				console.error(err);
			}
		);
	}

	async triggerCountDown() {
		const instructions = document.getElementById('instructions');
		instructions.style.fontSize = '80px';
		if (this.startCount > 0) {
			instructions.innerHTML = this.startCount;
			this.startCount--;
			setTimeout(this.triggerCountDown.bind(this), 1200);
		} else {
			instructions.innerHTML = 'Go!';
			await this.sleep(400);
			instructions.style.display = 'none';
			instructions.style.fontSize = '30px';
		}
	}

	newAnim() {
		if (this.animIndex < 2) {
			let timeouts = [5000, 5000];
			let actions = ['idle', 'running'];
			let action = actions[this.animIndex];
			let timeout = timeouts[this.animIndex];
			this.action = action;
			this.animIndex++;
			setTimeout(this.newAnim.bind(this), timeout);
			this.updateCamera();
			if (this.animIndex === 1) {
				document.body.style.backgroundImage = 'url(\'./img/sky.jpg\')';
				this.triggerCountDown();
			}
			if (this.animIndex === 2) {
				this.moveForward();
			}
		}
	}

	set action(name) {
		if (this.actionName == name.toLowerCase()) return;
		const clip = this.animations[name.toLowerCase()];

		if (clip !== undefined) {
			const action = this.mixer.clipAction(clip);
			if (name == 'stop') {
				action.clampWhenFinished = true;
				action.setLoop(THREE.LoopOnce);
			}
			action.reset();
			const nofade = this.actionName == 'bounce';
			this.actionName = name.toLowerCase();
			action.play();
			if (this.curAction) {
				if (nofade) {
					this.curAction.enabled = false;
				} else {
					this.curAction.crossFadeTo(action, 0.2);
				}
			}
			this.curAction = action;
		}
	}

	render() {
		const dt = this.clock.getDelta();

		if (this.mixer !== undefined) this.mixer.update(dt);

		this.renderer.render(this.scene, this.camera);

		this.velocity = new Vector3(1, 1, 1);

		this.velocity.set(0, 0, 0.1);
	}

	updateCamera() {
		this.cameraController.position.copy(this.character.position);
		this.cameraController.position.x = 0;
		if (this.character.position.y > -2) {
			this.cameraController.position.y = -1;
		}
		this.cameraTarget.z = this.character.position.z;
		this.cameraTarget.y = this.character.position.y + 1;
		this.cameraTarget.x = 0;
		this.camera.lookAt(this.cameraTarget);
		let t = new THREE.Object3D();
		t.translateX(0);
		t.translateY(-1);
		t.translateZ(this.character.position.z);
		this.dirLight.target = t;
		this.dirLight.position.set(0, 2.5, this.character.position.z);
		this.dirLight.target.updateMatrixWorld();
	}
}

export { GameEngine };
