(function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var menu = document.querySelector("[data-site-menu]");

  if (menuButton && menu) {
    menuButton.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  var prev = document.querySelector("[data-hero-prev]");
  var next = document.querySelector("[data-hero-next]");
  var active = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    active = (index + slides.length) % slides.length;

    slides.forEach(function (slide, i) {
      slide.classList.toggle("is-active", i === active);
    });

    dots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === active);
    });
  }

  function startHeroTimer() {
    if (timer || slides.length < 2) {
      return;
    }

    timer = window.setInterval(function () {
      showSlide(active + 1);
    }, 5200);
  }

  function stopHeroTimer() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  if (slides.length) {
    showSlide(0);
    startHeroTimer();

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        stopHeroTimer();
        showSlide(i);
        startHeroTimer();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        stopHeroTimer();
        showSlide(active - 1);
        startHeroTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        stopHeroTimer();
        showSlide(active + 1);
        startHeroTimer();
      });
    }
  }

  var filterRoot = document.querySelector("[data-filter-root]");

  if (filterRoot) {
    var searchInput = filterRoot.querySelector("[data-filter-search]");
    var typeSelect = filterRoot.querySelector("[data-filter-type]");
    var yearSelect = filterRoot.querySelector("[data-filter-year]");
    var clearButton = filterRoot.querySelector("[data-filter-clear]");
    var cards = Array.prototype.slice.call(filterRoot.querySelectorAll(".movie-card"));
    var empty = filterRoot.querySelector("[data-empty-state]");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function filterCards() {
      var q = normalize(searchInput ? searchInput.value : "");
      var typeValue = normalize(typeSelect ? typeSelect.value : "");
      var yearValue = normalize(yearSelect ? yearSelect.value : "");
      var visible = 0;

      cards.forEach(function (card) {
        var body = normalize([
          card.dataset.title,
          card.dataset.year,
          card.dataset.region,
          card.dataset.type,
          card.dataset.genre,
          card.dataset.tags
        ].join(" "));
        var typeMatch = !typeValue || normalize(card.dataset.type).indexOf(typeValue) !== -1;
        var yearMatch = !yearValue || normalize(card.dataset.year) === yearValue;
        var textMatch = !q || body.indexOf(q) !== -1;
        var ok = typeMatch && yearMatch && textMatch;

        card.style.display = ok ? "" : "none";

        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    if (query && searchInput) {
      searchInput.value = query;
    }

    [searchInput, typeSelect, yearSelect].forEach(function (element) {
      if (element) {
        element.addEventListener("input", filterCards);
        element.addEventListener("change", filterCards);
      }
    });

    if (clearButton) {
      clearButton.addEventListener("click", function () {
        if (searchInput) {
          searchInput.value = "";
        }
        if (typeSelect) {
          typeSelect.value = "";
        }
        if (yearSelect) {
          yearSelect.value = "";
        }
        filterCards();
      });
    }

    filterCards();
  }

  Array.prototype.slice.call(document.querySelectorAll(".movie-player")).forEach(function (player) {
    var video = player.querySelector("video");
    var button = player.querySelector("[data-play-button]");
    var started = false;
    var hls = null;

    if (!video || !button) {
      return;
    }

    function begin() {
      var stream = video.getAttribute("data-stream");

      if (!stream) {
        return;
      }

      if (!started) {
        started = true;
        button.classList.add("is-hidden");

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            maxBufferLength: 45,
            enableWorker: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }

        video.setAttribute("controls", "controls");
      }

      var play = video.play();

      if (play && typeof play.catch === "function") {
        play.catch(function () {
          button.classList.remove("is-hidden");
          started = false;

          if (hls) {
            hls.destroy();
            hls = null;
          }
        });
      }
    }

    button.addEventListener("click", begin);

    video.addEventListener("click", function () {
      if (!started) {
        begin();
      }
    });
  });

  var topButton = document.createElement("button");
  topButton.type = "button";
  topButton.className = "back-to-top";
  topButton.setAttribute("aria-label", "返回顶部");
  topButton.textContent = "↑";
  document.body.appendChild(topButton);

  window.addEventListener("scroll", function () {
    topButton.classList.toggle("is-visible", window.scrollY > 520);
  });

  topButton.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
})();
