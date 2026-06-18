(function () {
  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  window.handlePosterError = function (image) {
    var frame = image.closest('.poster-frame, .mini-poster, .category-covers, .detail-cover, .hero-slide');
    image.remove();
    if (frame) {
      frame.classList.add('poster-fallback');
    }
  };

  function setupNavigation() {
    var button = document.querySelector('[data-nav-toggle]');
    var header = document.querySelector('.site-header');
    if (!button || !header) {
      return;
    }
    button.addEventListener('click', function () {
      header.classList.toggle('nav-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    if (!cards.length) {
      return;
    }

    var input = document.querySelector('[data-filter-input]');
    var region = document.querySelector('[data-filter-region]');
    var year = document.querySelector('[data-filter-year]');
    var category = document.querySelector('[data-filter-category]');
    var count = document.querySelector('[data-filter-count]');
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (q && input) {
      input.value = q;
    }

    function passRegion(cardRegion, selected) {
      if (!selected) {
        return true;
      }
      if (selected === '其他') {
        return !/(中国|美国|日本|韩国|英国|法国)/.test(cardRegion);
      }
      return cardRegion.indexOf(selected) !== -1;
    }

    function apply() {
      var text = normalize(input && input.value);
      var selectedRegion = region ? region.value : '';
      var selectedYear = year ? year.value : '';
      var selectedCategory = category ? category.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search'));
        var cardRegion = card.getAttribute('data-region') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var cardCategory = card.getAttribute('data-category') || '';
        var isVisible = true;

        if (text && haystack.indexOf(text) === -1) {
          isVisible = false;
        }
        if (!passRegion(cardRegion, selectedRegion)) {
          isVisible = false;
        }
        if (selectedYear && cardYear !== selectedYear) {
          isVisible = false;
        }
        if (selectedCategory && cardCategory !== selectedCategory) {
          isVisible = false;
        }

        card.classList.toggle('hidden-by-filter', !isVisible);
        if (isVisible) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = '已显示 ' + visible + ' 部';
      }
    }

    [input, region, year, category].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  }

  function setupSearchJump() {
    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-search-jump]'));
    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (input && input.value.trim()) {
          return;
        }
        event.preventDefault();
        window.location.href = form.getAttribute('action') || 'search.html';
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupNavigation();
    setupHero();
    setupFilters();
    setupSearchJump();
  });
})();
