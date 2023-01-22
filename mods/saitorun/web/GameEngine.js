import * as THREE from './three.module.js';
import { GLTFLoader } from './GLTFLoader.js';
import { DRACOLoader } from './DRACOLoader.js';
import { RGBELoader } from './RGBELoader.js';
import { LoadingBar } from './LoadingBar.js';
import { Vector3 } from './three.module.js';

class GameEngine {
	constructor() {
		const container = document.createElement('div');
		document.body.appendChild(container);

		this.clock = new THREE.Clock();

		this.loadingBar = new LoadingBar();
		this.loadingBar.visible = false;

		this.assetsPath = './img/';

		this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 12);
		this.camera.position.set(0, 3, -5);

		this.cameraController = new THREE.Object3D();
		this.cameraController.add(this.camera);

		this.cameraTarget = new THREE.Vector3(3, 3, 0);

		this.scene = new THREE.Scene();

		this.scene.add(this.cameraController);

		// new light
		this.dirLight.position.set(0, 30, 8);
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

		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
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
		document.addEventListener('touchstart', this.handleTouchStart.bind(this), false);
		document.addEventListener('touchmove', this.handleTouchMove.bind(this), false);
		// mobile touch actions end
	}

	gameLoaded = false;

	dirLight = new THREE.DirectionalLight(0xFFFFFF, 1);

	// mobile touch actions
	xDown = null;
	yDown = null;

	getTouches(evt) {
		return evt.touches ||             // browser API
			evt.originalEvent.touches; // jQuery
	}

	handleTouchStart(evt) {
		const firstTouch = this.getTouches(evt)[0];
		this.xDown = firstTouch.clientX;
		this.yDown = firstTouch.clientY;
	}

	handleTouchMove(evt) {
		if (!this.gameLoaded) {
			this.gameLoaded = true;
			this.loadCharacter();
			return
		}
		if (!this.xDown || !this.yDown) {
			return;
		}

		var xUp = evt.touches[0].clientX;
		var yUp = evt.touches[0].clientY;

		var xDiff = this.xDown - xUp;
		var yDiff = this.yDown - yUp;

		if (Math.abs(xDiff) > Math.abs(yDiff)) {/*most significant*/
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

	jumpAction() {
		if (!this.isJumping && !this.isSliding && this.action !== 'falling' && this.action !== 'stop') {
			this.jumpStart = Math.round(this.character.position.z * 10) / 10;
			this.jumpEnd = Math.round((this.character.position.z + 16 * this.moveBy) * 10) / 10; // approx 16 translateZ movements within a slide
			this.jump();
		}
	}

	slideAction() {
		if (!this.isJumping && !this.isSliding && this.action !== 'falling' && this.action !== 'stop') {
			this.diveStart = Math.round(this.character.position.z * 10) / 10;
			this.diveEnd = Math.round((this.character.position.z + 16 * this.moveBy) * 10) / 10; // approx 16 translateZ movements within a slide
			this.slide();
		}
	}

	leftAction() {
		if (this.character.position.x < 1) {
			this.previousX = Math.round(this.character.position.x * 10) / 10;
			this.currentX = this.previousX + 1;
			this.character.translateX(1);
			this.updateCamera();
		}
	}

	rightAction() {
		if (this.character.position.x > -1) {
			this.previousX = Math.round(this.character.position.x * 10) / 10;
			this.currentX = this.previousX - 1;
			this.character.translateX(-1);
			this.updateCamera();
		}
	}

	keyDown(evt) {
		if (!this.gameLoaded) {
			this.gameLoaded = true;
			this.loadCharacter();
			return
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

	// remove not visible elements from the map
	removeOldPathTrackingEntries(increment) {
		if (increment < 8) {
			return;
		}
		for (let i = increment; i > 7; i--) {
			let key = i.toString();
			if (this.pathTrackingMap.has(key)) {
				this.pathTrackingMap.delete(key);
			} else {
				return;
			}
		}
	}

	addPathCube(geometry, material, x, y, z) {
		const cube = new THREE.Mesh(geometry, material);
		cube.position.setX(x);
		cube.position.setY(y);
		cube.position.setZ(z);
		cube.rotation.z = Math.PI - Math.PI / 2;
		cube.receiveShadow = true;
		cube.castShadow = true;
		this.scene.add(cube);
		this.floorCubes.push(cube)
	}

	addPath(increment, blocksForward) {
		this.removeOldPathTrackingEntries(increment - 30);
		// add cube
		const dim = 1;
		const geometry = new THREE.BoxGeometry(dim, dim, dim);

		const loader = new THREE.TextureLoader();

		const material = new THREE.MeshStandardMaterial({
			map: loader.load(`${this.assetsPath}/tile.png`),
		});
		const transparentMaterial = new THREE.MeshStandardMaterial({
			map: loader.load(`${this.assetsPath}/floor2.png`),
			transparent: true,
			opacity: 0.5,
		});
		// initial cubes
		if (increment === 0) {
			for (let i = -4; i < blocksForward + 1; i++) {
				let zPosition = i;
				for (let j = -1; j < 2; j++) {
					this.addPathCube(geometry, material, j, -1.5, zPosition);
				}
			}
		} else {
			let obstacleIndicator = Math.floor(Math.random() * blocksForward) - 1; // -1,0,1,2,3,4,5,6
			if (increment > 600) {
				obstacleIndicator = Math.floor(Math.random() * (blocksForward - 2) - 1); // -1,0,1,2,3,4
			}

			// -1 - add only left lane
			// 0 - add only middle lane
			// 1 - add only right lane
			// 2 - add full width ditch
			// 3 - add hanging obstacle
			// 4 or more - add normal path

			// initially only create full width ditches
			if (increment < 100) {
				if (obstacleIndicator === 2) {
					this.addFullWidthDitch(increment, blocksForward, geometry, material);
				} else {
					this.addNormalPath(increment, blocksForward, geometry, material);
				}
			} else {
				if (obstacleIndicator < 2) {
					this.addNarrowPath(increment, obstacleIndicator, blocksForward, geometry, material);
				} else if (obstacleIndicator === 2) {
					this.addFullWidthDitch(increment, blocksForward, geometry, material);
				} else if (obstacleIndicator === 3) {
					this.addHangingObstacle(increment, blocksForward, geometry, transparentMaterial);
					this.addNormalPath(increment, blocksForward, geometry, material);
				} else {
					this.addNormalPath(increment, blocksForward, geometry, material);
				}
			}
		}
		this.cleanupOldFloorCubes(increment);
		// add cube end
	}

	addPoint(zIndex, yIndex, xIndex) {
		this.pointsLeftInSequence--;
		let pointImage = "cube1.png";
		if (zIndex < 200) {
			this.pointValue = 1;
		} else if (zIndex < 400) {
			pointImage = "cube2.png";
			this.pointValue = 2;
		} else {
			pointImage = "cube3.png";
			this.pointValue = 3;
		}
		const dim = 0.15;
		const geometry = new THREE.BoxGeometry(dim, dim, dim);

		const loader = new THREE.TextureLoader();

		const material = new THREE.MeshBasicMaterial({
			map: loader.load(`${this.assetsPath}/${pointImage}`),
		});

		const cube = new THREE.Mesh(geometry, material);
		cube.position.setX(xIndex);
		cube.position.setY(yIndex);
		cube.position.setZ(zIndex);
		cube.rotateY(45);
		cube.rotateX(45);
		cube.castShadow = true;
		this.scene.add(cube);
		this.points.push(cube);
	}

	removeFirstPoint(z, hit) {
		if (this.points.length > 0 && this.points[0].position.z === z) {
			if (hit) {
				this.points[0].position.y = this.points[0].position.y + 0.5;
				this.increaseScore(this.pointValue);
			}
			this.scene.remove(this.points[0]);
			this.points.splice(0, 1);
		}
	}

	async addFullWidthDitch(increment, blocksForward, geometry, material) {
		// random x position for point
		let xPosition = Math.floor(Math.random() * 3) - 1; // (-1,0,1)
		let lengthExtension = 0;
		if (increment > 100 && increment <= 300) {
			lengthExtension = 1;
		} else if (increment > 300) {
			lengthExtension = 2;
		}
		let ditchStart = Math.floor(Math.random() * blocksForward - 2); // 0..<blocksForward - 3>
		for (let i = 0; i < blocksForward; i++) {
			let zPosition = i + increment;
			// add gap of 'lengthExtension + 1' cubes in forward facing direction and full width
			if (i < ditchStart || i > ditchStart + lengthExtension) {
				// add z position entry for tracking collisions
				this.pathTrackingMap.set(zPosition.toString(), { "ditch": false, "hanging": false, "1": true, "0": true, "-1": true });
				//
				for (let j = -1; j < 2; j++) {
					this.addPathCube(geometry, material, j, -1.5, zPosition);
				}
				// add point end
				if (this.zNextPoints === zPosition) {
					this.addPoint(zPosition, 0, xPosition);
					if (this.pointsLeftInSequence === 0) {
						this.pointsLeftInSequence = 12;
						this.zNextPoints = this.zNextPoints + 40;
					} else {
						this.zNextPoints = this.zNextPoints + 2;
					}
				}
				// add point end
			} else {
				// add z position entry for tracking collisions
				if (!this.pathTrackingMap.has(zPosition.toString())) {
					this.pathTrackingMap.set(zPosition.toString(), { "ditch": true, "hanging": false, "1": false, "0": false, "-1": false });
				}
				// end
				// add point end
				if (this.zNextPoints === zPosition) {
					this.addPoint(zPosition, 0.25, xPosition);
					if (this.pointsLeftInSequence === 0) {
						this.pointsLeftInSequence = 12;
						this.zNextPoints = this.zNextPoints + 40;
					} else {
						this.zNextPoints = this.zNextPoints + 2;
					}
				}
				// add point end
			}
		}
	}

	async addNarrowPath(increment, laneToShow, blocksForward, geometry, material) {
		for (let i = 0; i < blocksForward + 1; i++) {
			let zPosition = i + increment;
			for (let j = -1; j < 2; j++) {
				if (laneToShow === j) {
					this.addPathCube(geometry, material, j, -1.5, zPosition);
				}
			}
			// -1 - add only left lane
			// 0 - add only middle lane
			// 1 - add only right lane
			if (laneToShow == -1) {
				// add z position entry for tracking collisions
				this.pathTrackingMap.set(zPosition.toString(), { "ditch": false, "hanging": false, "1": false, "0": false, "-1": true });
				//
			} else if (laneToShow == 0) {
				// add z position entry for tracking collisions
				this.pathTrackingMap.set(zPosition.toString(), { "ditch": false, "hanging": false, "1": false, "0": true, "-1": false });
				//
			} else if (laneToShow == 1) {
				// add z position entry for tracking collisions
				this.pathTrackingMap.set(zPosition.toString(), { "ditch": false, "hanging": false, "1": true, "0": false, "-1": false });
				//
			}
			// add point
			if (this.zNextPoints === zPosition) {
				this.addPoint(zPosition, 0.25, laneToShow);
				if (this.pointsLeftInSequence === 0) {
					this.pointsLeftInSequence = 12;
					this.zNextPoints = this.zNextPoints + 40;
				} else {
					this.zNextPoints = this.zNextPoints + 2;
				}
			}
			// add point end
		}
	}

	async addHangingObstacle(increment, blocksForward, geometry, material) {
		let zPos = Math.floor(Math.random() * (blocksForward / 2)) + 1;
		for (let j = -1; j < 2; j++) {
			this.addPathCube(geometry, material, j, 1, increment + zPos);
		}
		let t = new THREE.Object3D();
		t.translateX(0);
		t.translateY(-10);
		t.translateZ(increment + zPos + 5);
		this.dirLight.target = t;
		this.dirLight.position.set(0, 30, increment + zPos + 5);
		this.dirLight.target.updateMatrixWorld();
		// add z position entry for tracking collisions
		this.pathTrackingMap.set((increment + zPos).toString(), { "ditch": false, "hanging": true, "1": true, "0": true, "-1": true });
		//
	}

	async addNormalPath(increment, blocksForward, geometry, material) {
		// random x position for point
		let xPosition = Math.floor(Math.random() * 3) - 1; // (-1,0,1)
		let yPosition = 0.5;
		for (let i = 0; i < blocksForward; i++) {
			let zPosition = i + increment;
			for (let j = -1; j < 2; j++) {
				this.addPathCube(geometry, material, j, -1.5, zPosition);
			}
			// hanging obstacle could have been added already - don't add new map entry if that's the case
			if (!this.pathTrackingMap.has(zPosition.toString())) {
				// add z position entry for tracking collisions
				this.pathTrackingMap.set(zPosition.toString(), { "ditch": false, "hanging": false, "1": true, "0": true, "-1": true });
			}
			if (this.pathTrackingMap.has(zPosition.toString())) {
				// check if hanging obstacle is present
				let pathMapEntry = this.pathTrackingMap.get(zPosition.toString());
				if (pathMapEntry["hanging"] === true) {
					yPosition = 1;
				}
				// add point
				if (this.zNextPoints === zPosition) {
					this.addPoint(zPosition, 0.25, xPosition);
					if (this.pointsLeftInSequence === 0) {
						this.pointsLeftInSequence = 12;
						this.zNextPoints = this.zNextPoints + 40;
					} else {
						this.zNextPoints = this.zNextPoints + 2;
					}
				}
				// add point end
			}
		}
	}

	async sleep(milliseconds) {
		return new Promise((resolve) => setTimeout(resolve, milliseconds));
	}

	cleanupOldFloorCubes(increment) {
		let i = this.floorCubes.length;
		while (i--) {

			if (this.floorCubes[i].position.z < increment - 15) {
				this.floorCubes[i].material.dispose();
				this.floorCubes[i].geometry.dispose();
				this.scene.remove(this.floorCubes[i]);
				this.floorCubes.splice(i, 1);
			}
		}
	}

	increaseScore(points) {
		this.pointsEarned = this.pointsEarned + points;

		const elm = document.getElementById('score');

		elm.innerHTML = this.pointsEarned;
	}

	setDistance(distance) {
		const elm = document.getElementById('distance');

		elm.innerHTML = distance;
	}

	moveForward() {
		if (this.character.position.z < 100) {
			this.moveBy = 0.2;
		} else if (this.character.position.z < 300) {
			this.moveBy = 0.3;
		} else if (this.character.position.z < 500) {
			if (this.action !== 'sprint' && !this.isSliding && !this.isJumping && this.stumbleZ !== 0) {
				this.runningAction = 'sprint';
				this.action = this.runningAction;
			}
			this.moveBy = 0.4;
		} else if (this.character.position.z < 750) {
			this.pathSegments = 12;
			this.moveBy = 0.5;
		} else if (this.character.position.z < 1000) {
			this.moveBy = 0.6;
		} else {
			this.moveBy = 0.8;
		}
		this.previousZ = Math.round(this.character.position.z * 10) / 10;

		this.currentZ = Math.round((this.character.position.z + this.moveBy) * 10 / 10);
		if (this.character.position.z > this.previousZpath + 1) {
			this.previousZpath = this.previousZpath + this.pathSegments;
			this.addPath(this.previousZpath, this.pathSegments);
		}

		this.character.translateZ(this.moveBy);
		this.updateCamera();

		// detect collisions here
		let zFloor = Math.floor(this.currentZ);

		this.setDistance(zFloor);

		// zPosition.toString(), {"ditch": <bool>, "hanging": <bool>, "1": <bool>, "0": <bool>, "-1": <bool>}
		if (this.pathTrackingMap.has(zFloor.toString()) && !this.stopped) {
			let pathMapEntry = this.pathTrackingMap.get(zFloor.toString());

			// fall
			if (pathMapEntry["ditch"] === true && !(this.jumpStart <= zFloor && this.jumpEnd >= zFloor + 1)) {
				this.stopped = true;
				setTimeout(this.fall.bind(this), 1);
				// hit hanging obstacle
			} else if (pathMapEntry["hanging"] === true && !(this.diveStart <= zFloor && this.diveEnd >= zFloor + 1)) {
				this.stumbleZ = zFloor;
				this.stopped = true;
				setTimeout(this.stumble.bind(this), 1);
				// if narrow path
			} else if (!pathMapEntry["1"] || !pathMapEntry["0"] || !pathMapEntry["-1"]) {
				if (!(this.jumpStart <= zFloor && this.jumpEnd >= zFloor + 1)) {
					if (!pathMapEntry[this.currentX.toString()]) {
						setTimeout(this.fall.bind(this), 50);
					} else {
						if (this.points.length > 0 && this.points[0].position.z === zFloor) {
							if (Math.floor(this.points[0].position.x) === this.currentX) {
								this.removeFirstPoint(zFloor, true)
							} else {
								this.removeFirstPoint(zFloor, false)
							}
						}
						setTimeout(this.moveForward.bind(this), 50);
					}
					// skip current z position check, if jump occurred before and will end after current z
				} else {
					if (this.points.length > 0 && this.points[0].position.z === zFloor) {
						if (Math.floor(this.points[0].position.x) === this.currentX) {
							this.removeFirstPoint(zFloor, true)
						} else {
							this.removeFirstPoint(zFloor, false)
						}
					}
					setTimeout(this.moveForward.bind(this), 50);
				}
			} else {
				if (this.points.length > 0 && this.points[0].position.z === zFloor) {
					if (Math.floor(this.points[0].position.x) === this.currentX) {
						this.removeFirstPoint(zFloor, true)
					} else {
						this.removeFirstPoint(zFloor, false)
					}
				}
				setTimeout(this.moveForward.bind(this), 50);
			}
		} else {
			setTimeout(this.moveForward.bind(this), 50);
		}
	}

	async stumble() {
		this.action = 'stop';
		let indices = [];
		for (let index = 0; index < this.floorCubes.length; index++) {
			if (this.floorCubes[index].position.z === this.stumbleZ && this.floorCubes[index].position.y === 1) {
				indices.push(index);
			}
		}
		let i = this.floorCubes.length;
		while (i--) {
			if (indices.includes(i)) {
				this.scene.remove(this.floorCubes[i]);
				this.floorCubes.splice(i, 1);
			}
		}
		await this.sleep(3000);
		this.endGame();
	}

	async fall() {
		this.action = 'falling'; // TODO constant
		if (this.fallingIndex >= 0) {
			this.fallingIndex--;
			this.character.translateY(-1);
			this.updateCamera();
			setTimeout(this.fall.bind(this), 50);
		} else {
			await this.sleep(3000);
			this.endGame();
		}
	}

	stumbleZ = 0;

	fallingIndex = 10;

	// position of next points objects sequence start
	zNextPoints = 40;

	// add 12 points in one sequence
	pointsLeftInSequence = 12;

	// pathTrackingMap - used to calculate potential collisions
	pathTrackingMap = new Map();

	isJumping = false;

	isSliding = false;

	jumpingIndex = 0;

	slidingIndex = 0;

	runningAction = "running";

	startCount = 4;

	stopped = false;

	animIndex = 0;

	// points
	points = [];

	pointValue = 1;

	previousZpath = 0;

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

	endGame() {
		const instructions = document.getElementById('instructions');
		instructions.style.display = 'block';
		instructions.innerHTML = `Game over!<br>Distance: ${this.currentZ}<br>Points: ${this.pointsEarned}<br>Swipe or press any key to continue`;
		this.cleanupOldFloorCubes(this.currentZ + 30); // cleanup all floor cubes
		this.pathTrackingMap.clear();
		this.cleanupAllPointCubes();
		this.scene.remove(this.character);
		this.gameLoaded = false;
		this.animIndex = 0;
		this.stumbleZ = 0;
		this.zNextPoints = 40;
		this.pointsLeftInSequence = 12;
		this.pathTrackingMap = new Map();
		this.isJumping = false;
		this.isSliding = false;
		this.jumpingIndex = 0;
		this.slidingIndex = 0;
		this.startCount = 4;
		this.stopped = false;
		this.points = [];
		this.pointValue = 1;
		this.previousZpath = 0;
		this.moveBy = 0;
		this.pathSegments = 8;
		this.previousZ = 0;
		this.previousX = 0;
		this.currentZ = 0;
		this.currentX = 0;
		this.jumpStart = 0;
		this.jumpEnd = 0;
		this.diveStart = 0;
		this.diveEnd = 0;
		this.hitHangingObstacle = false;
		this.pointsEarned = 0;
		this.floorCubes = [];
		this.increaseScore(0);
		this.setDistance(0);
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
				let action = 'dive';
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
				let action = 'ljump';
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
		const loader = new RGBELoader().setPath(this.assetsPath);
		const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
		pmremGenerator.compileEquirectangularShader();

		const self = this;

		loader.load('./hdr/factory.hdr', (texture) => {
			const envMap = pmremGenerator.fromEquirectangular(texture).texture;
			pmremGenerator.dispose();

			self.scene.environment = envMap;

		}, undefined, (err) => {
			console.error(err.message);
		});
	}

	loadCharacter() {
		const loader = new GLTFLoader().setPath(`${this.assetsPath}/`);
		const dracoLoader = new DRACOLoader();
		dracoLoader.setDecoderConfig({ type: 'js' });
		dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
		loader.setDRACOLoader(dracoLoader);
		this.loadingBar.visible = true;

		// Load animated character
		loader.load(
			'character.glb',
			// called when the resource is loaded
			gltf => {

				this.scene.add(gltf.scene);
				this.character = gltf.scene;

				this.mixer = new THREE.AnimationMixer(gltf.scene);

				this.character.position.x = 0;
				this.character.position.y = -1;
				this.character.position.z = 0;

				this.character.castShadow = true;
				this.character.receiveShadow = true;

				this.character.scale.y = 0.75;
				this.character.scale.x = 0.75;
				this.character.scale.z = 0.75;

				this.velocity = new Vector3(1, 1, 1);

				this.fallingIndex = 10;

				this.animations = {};

				gltf.animations.forEach(animation => {
					this.animations[animation.name.toLowerCase()] = animation;
				});

				this.actionName = '';

				this.newAnim();

				this.addPath(0, 8);

				this.loadingBar.visible = false;

				this.renderer.setAnimationLoop(this.render.bind(this));
			},
			// called while loading is progressing
			xhr => {

				this.loadingBar.progress = (xhr.loaded / xhr.total);

			},
			// called when loading has errors
			err => {

				console.error(err);

			}
		);
	}

	async triggerCountDown() {
		const instructions = document.getElementById('instructions');
		instructions.style.fontSize = "80px";
		if (this.startCount > 0) {
			instructions.innerHTML = this.startCount;
			this.startCount--;
			setTimeout(this.triggerCountDown.bind(this), 1200);
		} else {
			instructions.innerHTML = "Go!";
			await this.sleep(400);
			instructions.style.display = 'none';
			instructions.style.fontSize = "30px";
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
			const nofade = this.actionName == 'stop';
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
	}
}

export { GameEngine };