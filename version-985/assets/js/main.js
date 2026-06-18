(function () {
  function qsAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initNavigation() {
    var header = document.querySelector('.site-header');
    var button = document.querySelector('.nav-toggle');
    if (!header || !button) {
      return;
    }
    button.addEventListener('click', function () {
      var opened = header.classList.toggle('nav-open');
      button.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsAll('.hero-slide', hero);
    var dots = qsAll('.hero-dot', hero);
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
        dot.setAttribute('aria-current', i === index ? 'true' : 'false');
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

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

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

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    qsAll('[data-filter-panel]').forEach(function (panel) {
      var scope = panel.closest('main') || document;
      var input = panel.querySelector('[data-search-input]');
      var category = panel.querySelector('[data-category-filter]');
      var year = panel.querySelector('[data-year-filter]');
      var cards = qsAll('.movie-card', scope);
      var rows = qsAll('.rank-row', scope);
      var empty = panel.querySelector('[data-empty-state]');
      var items = cards.concat(rows);

      function valueOf(el) {
        return el ? String(el.value || '').trim().toLowerCase() : '';
      }

      function apply() {
        var query = valueOf(input);
        var cat = valueOf(category);
        var selectedYear = valueOf(year);
        var visible = 0;

        items.forEach(function (item) {
          var text = [
            item.getAttribute('data-title'),
            item.getAttribute('data-region'),
            item.getAttribute('data-tags'),
            item.textContent
          ].join(' ').toLowerCase();
          var itemCat = String(item.getAttribute('data-category') || '').toLowerCase();
          var itemYear = String(item.getAttribute('data-year') || '').toLowerCase();
          var ok = true;
          if (query && text.indexOf(query) === -1) {
            ok = false;
          }
          if (cat && itemCat !== cat) {
            ok = false;
          }
          if (selectedYear && itemYear !== selectedYear) {
            ok = false;
          }
          item.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [input, category, year].forEach(function (el) {
        if (el) {
          el.addEventListener('input', apply);
          el.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  function initPlayers() {
    qsAll('[data-video-player]').forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('.player-start');
      var message = player.querySelector('.player-message');
      var source = player.getAttribute('data-src');
      var hlsInstance = null;

      if (!video || !source) {
        return;
      }

      function setMessage(text) {
        if (message) {
          message.textContent = text;
        }
      }

      function prepare() {
        if (video.dataset.ready === 'true') {
          return;
        }
        video.dataset.ready = 'true';
        video.controls = true;
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setMessage('播放源加载异常，请刷新页面后重试');
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else {
          video.src = source;
        }
      }

      function play() {
        prepare();
        var request = video.play();
        if (request && typeof request.catch === 'function') {
          request.catch(function () {
            setMessage('请再次点击播放按钮开始播放');
          });
        }
      }

      if (button) {
        button.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
          play();
        });
      }

      player.addEventListener('click', function (event) {
        if (event.target === video || event.target.closest('button')) {
          return;
        }
        play();
      });

      video.addEventListener('play', function () {
        player.classList.add('is-playing');
        setMessage('');
      });

      video.addEventListener('pause', function () {
        if (!video.ended) {
          player.classList.remove('is-playing');
        }
      });

      video.addEventListener('ended', function () {
        player.classList.remove('is-playing');
      });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initHero();
    initFilters();
    initPlayers();
  });
})();
