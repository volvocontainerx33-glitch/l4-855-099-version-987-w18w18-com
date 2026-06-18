(function () {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const input = form.querySelector('input[name="q"]');
      const value = input ? input.value.trim() : '';
      const query = value ? '?q=' + encodeURIComponent(value) : '';
      window.location.href = 'search.html' + query;
    });
  });

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    const input = scope.querySelector('[data-filter-input]');
    const selects = Array.from(scope.querySelectorAll('[data-filter-select]'));
    const cards = Array.from(scope.querySelectorAll('[data-filter-card]'));
    const empty = scope.querySelector('[data-empty-state]');

    function applyFilter() {
      const keyword = input ? input.value.trim().toLowerCase() : '';
      const activeFilters = {};

      selects.forEach(function (select) {
        const key = select.getAttribute('data-filter-select');
        activeFilters[key] = select.value;
      });

      let visibleCount = 0;

      cards.forEach(function (card) {
        const haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre')
        ].join(' ').toLowerCase();

        const keywordMatch = !keyword || haystack.includes(keyword);
        const selectMatch = Object.keys(activeFilters).every(function (key) {
          const value = activeFilters[key];
          return !value || card.getAttribute('data-' + key) === value;
        });

        const shouldShow = keywordMatch && selectMatch;
        card.hidden = !shouldShow;
        if (shouldShow) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.hidden = visibleCount !== 0;
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    selects.forEach(function (select) {
      select.addEventListener('change', applyFilter);
    });
  });

  const searchPage = document.querySelector('[data-search-page]');

  if (searchPage && Array.isArray(window.searchIndex)) {
    const params = new URLSearchParams(window.location.search);
    const query = (params.get('q') || '').trim();
    const formInput = searchPage.querySelector('.search-page-form input[name="q"]');
    const title = searchPage.querySelector('[data-search-title]');
    const results = searchPage.querySelector('[data-search-results]');

    if (formInput) {
      formInput.value = query;
    }

    if (title) {
      title.textContent = query ? '搜索结果：' + query : '热门片库搜索';
    }

    if (results) {
      const keyword = query.toLowerCase();
      const matches = window.searchIndex.filter(function (item) {
        if (!keyword) {
          return item.hot;
        }
        return [item.title, item.region, item.year, item.type, item.genre, item.tags].join(' ').toLowerCase().includes(keyword);
      }).slice(0, 96);

      if (matches.length === 0) {
        results.innerHTML = '<div class="empty-state">没有找到匹配的内容</div>';
      } else {
        results.innerHTML = matches.map(function (item) {
          return [
            '<a class="movie-card" href="' + item.url + '">',
            '  <div class="card-image">',
            '    <img src="' + item.image + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
            '    <span class="card-badge">' + escapeHtml(item.type) + '</span>',
            '  </div>',
            '  <div class="card-body">',
            '    <h3>' + escapeHtml(item.title) + '</h3>',
            '    <p>' + escapeHtml(item.oneLine) + '</p>',
            '    <div class="card-meta"><span>★ ' + item.rating + '</span><span>' + item.views + '</span></div>',
            '    <div class="tag-row">' + renderTags(item.tags) + '</div>',
            '  </div>',
            '</a>'
          ].join('');
        }).join('');
      }
    }
  }

  function renderTags(tags) {
    return String(tags || '').split(',').filter(Boolean).slice(0, 2).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }
}());
