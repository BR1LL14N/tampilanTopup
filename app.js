const navButtons = document.querySelectorAll('[data-view]');
const viewSections = document.querySelectorAll('.view');
const mobileNav = document.getElementById('mobileNav');

function showView(viewName) {
  viewSections.forEach((section) => section.classList.toggle('active', section.id === viewName));
  document.querySelectorAll('.nav-btn').forEach((button) => {
    button.classList.toggle('nav-active', button.dataset.view === viewName);
  });
  if (mobileNav) mobileNav.classList.add('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

navButtons.forEach((button) => {
  button.addEventListener('click', () => showView(button.dataset.view));
});

document.getElementById('mobileToggle')?.addEventListener('click', () => {
  mobileNav.classList.toggle('hidden');
});

document.querySelectorAll('[data-catalog-tab]').forEach((button) => {
  button.addEventListener('click', () => {
    const selected = button.dataset.catalogTab;
    document.querySelectorAll('[data-catalog-tab]').forEach((tab) => {
      tab.classList.toggle('catalog-tab-active', tab.dataset.catalogTab === selected);
    });
    document.querySelectorAll('[data-catalog-item]').forEach((item) => {
      item.classList.toggle('hidden', selected !== 'all' && item.dataset.catalogItem !== selected);
    });
  });
});

const carouselTrack = document.getElementById('carouselTrack');
const carouselDots = document.querySelectorAll('[data-carousel-dot]');
const carouselSlides = document.querySelectorAll('.carousel-slide');
let activeSlide = 0;

function setSlide(index) {
  if (!carouselTrack || carouselSlides.length === 0) return;
  activeSlide = (index + carouselSlides.length) % carouselSlides.length;
  carouselTrack.style.transform = `translateX(-${activeSlide * 100}%)`;
  carouselDots.forEach((dot) => {
    dot.classList.toggle('active', Number(dot.dataset.carouselDot) === activeSlide);
  });
}

document.getElementById('carouselPrev')?.addEventListener('click', () => setSlide(activeSlide - 1));
document.getElementById('carouselNext')?.addEventListener('click', () => setSlide(activeSlide + 1));
carouselDots.forEach((dot) => {
  dot.addEventListener('click', () => setSlide(Number(dot.dataset.carouselDot)));
});

if (carouselTrack) {
  setInterval(() => setSlide(activeSlide + 1), 5500);
}

document.querySelector('.hero-carousel')?.addEventListener('mousemove', (event) => {
  const bounds = event.currentTarget.getBoundingClientRect();
  const offsetX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 14;
  const offsetY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 10;
  document.querySelectorAll('.carousel-slide').forEach((slide) => {
    slide.style.setProperty('--parallax-x', `${offsetX}px`);
    slide.style.setProperty('--parallax-y', `${offsetY}px`);
  });
});

document.querySelector('.hero-carousel')?.addEventListener('mouseleave', () => {
  document.querySelectorAll('.carousel-slide').forEach((slide) => {
    slide.style.setProperty('--parallax-x', '0px');
    slide.style.setProperty('--parallax-y', '0px');
  });
});

document.querySelectorAll('section > div, .glass, .order-step, .soft-panel').forEach((element) => {
  element.classList.add('reveal');
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

document.querySelectorAll('button, .rank-card, .poster-card').forEach((element) => {
  element.classList.add('interactive');
});

document.querySelectorAll('.nav-btn').forEach((button) => {
  button.addEventListener('pointermove', (event) => {
    const rect = button.getBoundingClientRect();
    button.style.setProperty('--nav-x', `${event.clientX - rect.left}px`);
    button.style.setProperty('--nav-y', `${event.clientY - rect.top}px`);
  });
});

lucide.createIcons();
