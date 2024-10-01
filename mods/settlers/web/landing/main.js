// ------------------------------- Banner Animation
const bannerAnim = {
	init: function () {
		this.cacheDom();
		this.bindEvents();
	},

	cacheDom: function () {
		this.heroBannerBox = document.querySelector(".hero-banner__text");
		this.heroBannerTitleOne = this.heroBannerBox.querySelector(".title-one");
		this.heroBannerTitleTwo = this.heroBannerBox.querySelector(".sm");
		this.heroBannerTitleThree = this.heroBannerBox.querySelector(".title-two");
	},

	bindEvents: function () {
		this.trigerAnimation();
	},

	trigerAnimation: function () {
		const tlBox = gsap.timeline();

		tlBox.to(this.heroBannerBox, {
			duration: 1,
			ease: "elastic.out(1.2, 0.6)",
			y: 0,
			scale: 1,
			opacity: 1
		});

		tlBox.to(this.heroBannerTitleOne, {
			duration: 0.2,
			opacity: 1
		});

		tlBox.to(this.heroBannerTitleTwo, {
			duration: 0.2,
			opacity: 1
		});

		tlBox.to(this.heroBannerTitleThree, {
			duration: 1.4,
			ease: "elastic.out(1, 0.4)",
			opacity: 1,
			y: 0
		});
	}
};
bannerAnim.init();

// ------------------------------- Header Animation
const siteHeader = {
	init: function () {
		this.cacheDom();
		this.bindEvents();
	},

	cacheDom: function () {
		this.scaleBounces = document.querySelectorAll(".anim-ele.bounce-scale");
		this.headerHamn = document.querySelector(".site-header__right-meta");
	},

	bindEvents: function () {
		this.trigerAnimation();
	},

	trigerAnimation: function () {
		this.scaleBounces.forEach((scaleBounce) => {
			gsap.to(scaleBounce, {
				duration: 1,
				ease: "elastic.out(1.2, 0.6)",
				scale: 1,
				opacity: 1
			});
		});

		gsap.to(this.headerNav, {
			duration: 1.4,
			ease: "elastic.out(1, 0.4)",
			opacity: 1,
			x: 0
		});
	}
};
siteHeader.init();

// ------------------------------- Site Nav Animation
const siteNav = {
	init: function () {
		this.cacheDom();
		this.bindEvents();
		this.createAnimation();
	},

	cacheDom: function () {
		this.siteNavCloser = document.querySelector(".site-nav__toggler");
		this.siteCustomButtons = document.querySelectorAll(".custom-btn:not(.menu-btn)");
		this.fixNav = document.querySelector(".site-nav");
		this.overlay = document.querySelector(".overlay");
	},

	bindEvents: function () {
		this.siteNavCloser.addEventListener("click", this.navMenuOpen.bind(this));
		this.overlay.addEventListener("click", this.navMenuOpen.bind(this));
		this.siteCustomButtons.forEach((siteCustomButton) => {
			const isMobile = window.innerWidth < 1200;
			if (isMobile) {
				siteCustomButton.addEventListener("click", this.navMenuOpen.bind(this));
			}
		});
		window.addEventListener("load", this.navMenuOpen.bind(this));
	},

	createAnimation: function () {
		// Initialize GSAP timeline
		this.timeline = gsap.timeline({ reversed: true, ease: "sine.out", });
		this.timeline.to(this.fixNav, {
			x: 0,
			duration: 1.4,
			ease: "elastic.out(1, 0.4)",
			opacity: 1
		});
	},

	navMenuOpen: function () {
		this.fixNav.classList.toggle("active");
		document.body.classList.toggle("menu-opened");
		this.siteNavCloser.classList.toggle("toggler-active");
		if (this.fixNav.classList.contains("active")) {
			this.timeline.play();
		} else {
			this.timeline.reverse();
		}
	}
};
siteNav.init();

// ------------------------------- Global Scroll Animation
const scrollAnim = {
	init() {
		this.cacheDom();
		this.scrollTrigger();
	},

	cacheDom() {
		this.elementsBounceUp = document.querySelectorAll(".anim-ele.bounce-up");
		this.elementsSlideLeft = document.querySelectorAll(".anim-ele.slide-left");
		this.elementsSlideRight = document.querySelectorAll(".anim-ele.slide-right");
	},

	scrollTrigger() {
		this.elementsBounceUp.forEach(element => {
			ScrollTrigger.create({
				trigger: element,
				start: "top bottom-=22%",
				animation: this.createBounceUpTimeline(element)
			});
		});
		this.elementsSlideLeft.forEach(element => {
			ScrollTrigger.create({
				trigger: element,
				start: "top bottom-=32%",
				animation: this.createSlideLeftTimeline(element)
			});
		});
		this.elementsSlideRight.forEach(element => {
			ScrollTrigger.create({
				trigger: element,
				start: "top bottom-=32%",
				animation: this.createSlideLeftTimeline(element)
			});
		});
	},

	createBounceUpTimeline(element) {
		return gsap.timeline().to(element, {
			duration: 1.4,
			ease: "elastic.out(1, 0.4)",
			opacity: 1,
			y: 0
		});
	},

	createSlideLeftTimeline(element) {
		return gsap.timeline().to(element, {
			duration: 1.4,
			ease: "elastic.out(1, 0.4)",
			opacity: 1,
			x: 0
		});
	},

	createSlideRightTimeline(element) {
		return gsap.timeline().to(element, {
			duration: 1.4,
			ease: "elastic.out(1, 0.4)",
			opacity: 1,
			x: 0
		});
	}
};
window.onload = function () {
	scrollAnim.init();
};

// ------------------------------- Random Animation Stagger
const stagAnim = {
	init: function () {
		this.cacheDom();
		this.bindEvents();
	},

	cacheDom: function () {
		this.rndAnimTexts = document.querySelectorAll(".random-anim-text");
	},

	bindEvents: function () {
		this.trigerAnimation();
	},

	trigerAnimation: function () {
		const animTextsArray = Array.from(this.rndAnimTexts);

		gsap.to(animTextsArray, {
			duration: 1,
			ease: "elastic.out(1.2, 0.6)",
			scale: 1,
			delay: 2.6,
			opacity: 1,
			stagger: 1.4, 
		});


		gsap.to(animTextsArray.slice(0, -1), {  
			duration: 1,
			opacity: 0,
			delay: 9.2, 
			ease: "back(4)",
			stagger: {
				from: "end", //try "center" and "edges"
				each: 1
			}
		});

	
	}
}

stagAnim.init();