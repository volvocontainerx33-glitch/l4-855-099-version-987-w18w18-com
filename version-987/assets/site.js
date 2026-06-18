
(function () {
  var HLS_SOURCES = [
    "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/hls.js/1.5.18/hls.min.js"
  ];

  document.addEventListener("DOMContentLoaded", function () {
    setupHeader();
    setupMobileMenu();
    setupHeroSlider();
    setupSearchForms();
    setupSearchPage();
    setupPlayer();
    setupImageFallbacks();
  });

  function setupHeader() {
    var header = document.querySelector("[data-site-header]");
    if (!header) {
      return;
    }

    function refresh() {
      header.classList.toggle("is-scrolled", window.scrollY > 48);
    }

    refresh();
    window.addEventListener("scroll", refresh, { passive: true });
  }

  function setupMobileMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var previous = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (previous) {
      previous.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot") || 0));
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    start();
  }

  function setupSearchForms() {
    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";

        if (!query) {
          event.preventDefault();
          window.location.href = "movies.html";
        }
      });
    });
  }

  function setupSearchPage() {
    var results = document.querySelector("[data-search-results]");
    if (!results) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var input = document.querySelector("[data-search-input]");

    if (input) {
      input.value = query;
    }

    if (!query) {
      results.innerHTML = "<p class=\"empty-state\">请输入关键词开始搜索。</p>";
      return;
    }

    fetch("assets/movie-search.json")
      .then(function (response) {
        return response.json();
      })
      .then(function (movies) {
        var normalized = query.toLowerCase();
        var matched = movies.filter(function (movie) {
          var haystack = [
            movie.title,
            movie.year,
            movie.region,
            movie.genre,
            movie.category,
            movie.description,
            (movie.tags || []).join(" ")
          ].join(" ").toLowerCase();

          return haystack.indexOf(normalized) !== -1;
        }).slice(0, 120);

        if (!matched.length) {
          results.innerHTML = "<p class=\"empty-state\">没有找到匹配影片，可以换一个关键词继续搜索。</p>";
          return;
        }

        results.innerHTML = matched.map(renderSearchCard).join("");
        setupImageFallbacks(results);
      })
      .catch(function () {
        results.innerHTML = "<p class=\"empty-state\">搜索索引加载失败，请稍后重试。</p>";
      });
  }

  function renderSearchCard(movie) {
    return [
      "<a class=\"movie-card\" href=\"" + escapeHtml(movie.file) + "\" aria-label=\"观看" + escapeHtml(movie.title) + "\">",
      "  <div class=\"poster-frame\">",
      "    <img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
      "    <span class=\"card-badge\">" + escapeHtml(movie.category) + "</span>",
      "    <span class=\"rating-badge\">★ " + Number(movie.rating).toFixed(1) + "</span>",
      "    <span class=\"play-hover\">▶</span>",
      "  </div>",
      "  <div class=\"movie-card__body\">",
      "    <h3>" + escapeHtml(movie.title) + "</h3>",
      "    <p class=\"movie-card__desc\">" + escapeHtml(movie.description) + "</p>",
      "    <div class=\"movie-meta-row\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.genre) + "</span></div>",
      "  </div>",
      "</a>"
    ].join("\n");
  }

  function setupPlayer() {
    var video = document.getElementById("moviePlayer");
    if (!video) {
      return;
    }

    var source = video.getAttribute("data-src");
    var overlayButton = document.querySelector("[data-player-play]");
    var status = document.querySelector("[data-player-status]");
    var hlsInstance = null;

    if (!source) {
      setStatus("播放源不可用");
      return;
    }

    attachSource(source);

    if (overlayButton) {
      overlayButton.addEventListener("click", function () {
        video.play().catch(function () {
          setStatus("浏览器阻止了自动播放，请使用播放器控制栏开始播放");
        });
      });
    }

    video.addEventListener("play", function () {
      if (overlayButton) {
        overlayButton.classList.add("is-hidden");
      }
      setStatus("正在播放：" + (video.getAttribute("data-title") || "高清影片"));
    });

    video.addEventListener("pause", function () {
      if (overlayButton && video.currentTime < video.duration) {
        overlayButton.classList.remove("is-hidden");
      }
    });

    video.addEventListener("ended", function () {
      if (overlayButton) {
        overlayButton.classList.remove("is-hidden");
      }
      setStatus("播放结束");
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });

    function attachSource(url) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        setStatus("高清播放源准备就绪");
        return;
      }

      loadHlsScript(0, function () {
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hlsInstance.loadSource(url);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus("高清播放源准备就绪");
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }

            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hlsInstance.startLoad();
              setStatus("网络波动，正在重新加载播放源");
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hlsInstance.recoverMediaError();
              setStatus("播放器正在恢复媒体解码");
            } else {
              hlsInstance.destroy();
              video.src = url;
              setStatus("正在尝试使用浏览器原生播放");
            }
          });
        } else {
          video.src = url;
          setStatus("当前浏览器可能不支持 HLS，请使用新版浏览器观看");
        }
      });
    }

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }
  }

  function loadHlsScript(sourceIndex, callback) {
    if (window.Hls) {
      callback();
      return;
    }

    if (sourceIndex >= HLS_SOURCES.length) {
      callback();
      return;
    }

    var existing = document.querySelector("script[data-hls-loader]");
    if (existing) {
      existing.addEventListener("load", callback, { once: true });
      existing.addEventListener("error", function () {
        loadHlsScript(sourceIndex + 1, callback);
      }, { once: true });
      return;
    }

    var script = document.createElement("script");
    script.src = HLS_SOURCES[sourceIndex];
    script.async = true;
    script.setAttribute("data-hls-loader", "true");
    script.addEventListener("load", callback, { once: true });
    script.addEventListener("error", function () {
      script.remove();
      loadHlsScript(sourceIndex + 1, callback);
    }, { once: true });
    document.head.appendChild(script);
  }

  function setupImageFallbacks(root) {
    var scope = root || document;
    scope.querySelectorAll("img").forEach(function (image) {
      function markMissing() {
        var holder = image.closest(".poster-frame, .hero-slide");
        if (holder) {
          holder.classList.add("image-missing");
          holder.setAttribute("data-title", image.getAttribute("alt") || "高清电影");
        }
        image.style.opacity = "0";
      }

      if (image.complete && image.naturalWidth === 0) {
        markMissing();
      } else {
        image.addEventListener("error", markMissing, { once: true });
      }
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
