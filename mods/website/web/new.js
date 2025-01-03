// Handle navigation dots
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav a');
const header = document.querySelector('.main-header');

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
    } else {
        header.classList.remove('scrolled');
        // Calculate transform based on scroll position
        const transformValue = Math.min(0, (currentScroll / 100 - 1) * 100);
        header.style.transform = `translateY(${transformValue}%)`;
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
