// Handle navigation dots
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav a');
const header = document.querySelector('.main-header');
const saitoText = document.querySelector('.saito-text');
const mainHeader = document.querySelector('.main-header');

const observerOptions = {
    threshold: 0.5
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${id}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}, observerOptions);

sections.forEach(section => {
    observer.observe(section);
});

// Handle scroll for desktop menu transformation
let lastScroll = 0;
document.querySelector('.container').addEventListener('scroll', () => {
    const currentScroll = document.querySelector('.container').scrollTop;

    if (currentScroll > 100) {
        header.classList.add('scrolled');
        header.style.transform = `translateY(0)`;
        saitoText.classList.add('scrolled');
        mainHeader.classList.add('loaded');
    } else {
        header.classList.remove('scrolled');
        // Calculate transform based on scroll position
        const transformValue = Math.min(0, (currentScroll / 100 - 1) * 100);
        header.style.transform = `translateY(${transformValue}%)`;
        saitoText.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
});

// Menu handling
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu-content');
const dropdownBtns = document.querySelectorAll('.dropdown-btn');

// Mobile menu toggle with click-away handling
hamburger?.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent click from immediately closing menu
    hamburger.classList.toggle('active');
    mobileMenu?.classList.toggle('active');
});

// Click away handler for mobile menu
document.addEventListener('click', (e) => {
    if (mobileMenu?.classList.contains('active') &&
        !mobileMenu.contains(e.target) &&
        !hamburger.contains(e.target)) {
        mobileMenu.classList.remove('active');
        hamburger.classList.remove('active');
    }
});

// Prevent clicks inside mobile menu from closing it
mobileMenu?.addEventListener('click', (e) => {
    e.stopPropagation();
});

// Desktop dropdown handling
dropdownBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const dropdown = btn.nextElementSibling;
        dropdown.classList.toggle('active');
    });
});

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.matches('.dropdown-btn')) {
        dropdownBtns.forEach(btn => {
            const dropdown = btn.nextElementSibling;
            if (dropdown.classList.contains('active')) {
                dropdown.classList.remove('active');
            }
        });
    }
});

document.getElementById("start_anim_mobile").addEventListener("click", function () {
    document.getElementById("anim_mobile").classList.add("vis");
}, false);
document.getElementById("close_anim_bttn").addEventListener("click", function () {
    document.getElementById("anim_mobile").classList.remove("vis");
}, false);


document.getElementById("start_anim2").addEventListener("click", function () {
    document.getElementById("bottom_title").classList.add("hidden");
    document.getElementById("bottom-animation").classList.add("expand");
    document.getElementById("bttm_anim1").classList.remove("vis");
    document.getElementById("bttm_anim2").classList.add("vis");
    document.getElementById("close_anim2").classList.add("vis");
}, false);
document.getElementById("close_anim2").addEventListener("click", function () {
    document.getElementById("bottom_title").classList.remove("hidden");
    document.getElementById("bottom-animation").classList.remove("expand");
    document.getElementById("bttm_anim1").classList.add("vis");
    document.getElementById("bttm_anim2").classList.remove("vis");
    document.getElementById("close_anim2").classList.remove("vis");
}, false);
document.getElementById("start_anim2_mobile").addEventListener("click", function () {
    document.getElementById("anim2_mobile").classList.add("vis");
}, false);
document.getElementById("close_anim2_bttn").addEventListener("click", function () {
    document.getElementById("anim2_mobile").classList.remove("vis");
}, false);

// Function to check if a color is light
function isLightColor(color) {
    const rgb = color.match(/\d+/g);
    if (!rgb) return false;
    
    // Calculate relative luminance
    const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
    return luminance > 0.7;
}

// Debounce function to handle scroll stop
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}

// Function to update colors based on background
function updateColors() {
    const desktopLogo = document.querySelector('.desktop-menu .header-logo svg');
    const mobileLogo = document.querySelector('.mobile-header .header-logo svg');
    
    // Get the element at the center of the viewport
    const centerY = window.innerHeight / 2;
    const centerX = window.innerWidth / 2;
    const elementAtCenter = document.elementFromPoint(centerX, centerY);
    
    if (!elementAtCenter) return;
    
    // Get background color of the element or its closest section parent
    const section = elementAtCenter.closest('section');
    if (!section) return;
    
    const backgroundColor = window.getComputedStyle(section).backgroundColor;
    const isLight = isLightColor(backgroundColor);
    
    // Colors to use
    const lightBgColor = '#f61745';  // Saito red for light backgrounds
    const darkBgColor = '#ffffff';   // White for dark backgrounds
    const color = isLight ? lightBgColor : darkBgColor;
    
    // Set the CSS variable at root level
    document.documentElement.style.setProperty('--menu-color', color);

    // Update desktop logo color
    if (desktopLogo) {
        const styleEl = desktopLogo.querySelector('style');
        if (styleEl) {
            styleEl.textContent = `.cls-1{fill:${color}}`;
        }
    }

    // Update mobile logo color
    if (mobileLogo) {
        const styleEl = mobileLogo.querySelector('style');
        if (styleEl) {
            styleEl.textContent = `.cls-1{fill:${color}}`;
        }
    }
}

// Make sure this is being called on container scroll
const container = document.querySelector('.container');
if (container) {
    container.addEventListener('scroll', debounce(updateColors, 50));
}

// Set initial height and colors
function init() {
    setVH();
    updateColors();
}

// Run init on various events
document.addEventListener('DOMContentLoaded', init);
window.addEventListener('load', () => {
    init();
    setTimeout(init, 100);
});
window.addEventListener('resize', setVH);
window.addEventListener('orientationchange', setVH);

function setVH() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    //alert('vh: ' + vh);
}

// Add this to your scroll handler
function updateHeaderState() {
    const header = document.querySelector('.main-header');
    const landingSection = document.querySelector('#landing');
    
    if (header && landingSection) {
        const rect = landingSection.getBoundingClientRect();
        if (rect.top >= 0) {
            header.classList.add('on-landing');
        } else {
            header.classList.remove('on-landing');
        }
    }
}

// Add to your container scroll listener
if (container) {
    container.addEventListener('scroll', () => {
        updateHeaderState();
        // ... existing scroll handlers ...
    });
}

// Add to your existing scroll handler
function handleScroll() {
    const landingSection = document.querySelector('#landing');
    const container = document.querySelector('.container');
    
    if (landingSection && !window.hasShownAlert) {
        const rect = landingSection.getBoundingClientRect();
        if (rect.bottom <= 0) {
            alert("You've scrolled past the landing page!");
            window.hasShownAlert = true;  // Only show once
        }
    }
}

// Optional click handler for the caret
document.addEventListener('DOMContentLoaded', () => {
    const caret = document.querySelector('.scroll-caret');
    const container = document.querySelector('.container');
    const consensusSection = document.querySelector('#consensus');

    if (caret && container && consensusSection) {
        caret.addEventListener('click', () => {
            container.scrollTo({
                top: consensusSection.offsetTop,
                behavior: 'smooth'
            });
        });
    }
});
