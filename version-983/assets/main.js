(function () {
  const toggle = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let activeIndex = 0;

    const setHero = function (nextIndex) {
      if (!slides.length) {
        return;
      }

      activeIndex = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, index) {
        slide.classList.toggle('active', index === activeIndex);
      });

      dots.forEach(function (dot, index) {
        dot.classList.toggle('active', index === activeIndex);
      });
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        const next = Number(dot.getAttribute('data-hero-dot') || '0');
        setHero(next);
      });
    });

    setInterval(function () {
      setHero(activeIndex + 1);
    }, 5200);
  }

  const panel = document.querySelector('[data-filter-panel]');
  const container = document.querySelector('[data-card-container]');

  if (panel && container) {
    const search = panel.querySelector('#movie-search');
    const selects = Array.from(panel.querySelectorAll('.filter-select'));
    const cards = Array.from(container.querySelectorAll('.movie-card, .horizontal-card'));

    const normalize = function (value) {
      return String(value || '').trim().toLowerCase();
    };

    const applyFilters = function () {
      const term = normalize(search ? search.value : '');
      const selected = {};

      selects.forEach(function (select) {
        selected[select.getAttribute('data-filter')] = normalize(select.value);
      });

      cards.forEach(function (card) {
        const text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-type'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-category')
        ].join(' '));

        const matchesTerm = !term || text.includes(term);
        const matchesSelects = Object.keys(selected).every(function (key) {
          if (!selected[key]) {
            return true;
          }

          return normalize(card.getAttribute('data-' + key)).includes(selected[key]);
        });

        card.classList.toggle('is-filtered-out', !(matchesTerm && matchesSelects));
      });
    };

    if (search) {
      search.addEventListener('input', applyFilters);
    }

    selects.forEach(function (select) {
      select.addEventListener('change', applyFilters);
    });
  }
})();
