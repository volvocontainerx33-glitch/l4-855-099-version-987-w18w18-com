(function () {
    const menuButton = document.querySelector(".menu-toggle");
    const mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            const open = mobileNav.classList.toggle("is-open");
            menuButton.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        const prev = hero.querySelector("[data-hero-prev]");
        const next = hero.querySelector("[data-hero-next]");
        let index = 0;
        let timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                const active = slideIndex === index;
                slide.classList.toggle("is-active", active);
                slide.setAttribute("aria-hidden", active ? "false" : "true");
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
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
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
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
                const dotIndex = Number(dot.getAttribute("data-hero-dot"));
                show(dotIndex);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    });

    document.querySelectorAll("[data-global-search]").forEach(function (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            const input = form.querySelector("input[name='q']");
            const keyword = input ? input.value.trim() : "";
            const url = keyword ? "search.html?q=" + encodeURIComponent(keyword) : "search.html";
            window.location.href = url;
        });
    });

    document.querySelectorAll("[data-filter-list]").forEach(function (panel) {
        const container = panel.parentElement;
        const target = container ? container.querySelector(".filter-target") : null;
        const cards = target ? Array.from(target.querySelectorAll(".movie-card")) : [];
        const search = panel.querySelector("[data-filter-search]");
        const selects = Array.from(panel.querySelectorAll("[data-filter-field]"));
        const sortSelect = panel.querySelector("[data-sort-cards]");
        const empty = container ? container.querySelector(".empty-result") : null;

        function normalize(value) {
            return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
        }

        function containsAny(source, query) {
            if (!query) {
                return true;
            }
            const parts = normalize(query).split(" ").filter(Boolean);
            if (!parts.length) {
                return true;
            }
            return parts.some(function (part) {
                return source.indexOf(part) !== -1;
            });
        }

        function apply() {
            const keyword = normalize(search ? search.value : "");
            let visible = 0;

            cards.forEach(function (card) {
                const haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-genre"),
                    card.textContent
                ].join(" "));

                let matched = !keyword || haystack.indexOf(keyword) !== -1;

                selects.forEach(function (select) {
                    const field = select.getAttribute("data-filter-field");
                    const selected = normalize(select.value);
                    if (!selected) {
                        return;
                    }
                    const source = normalize(card.getAttribute("data-" + field) || (card.querySelector(".card-category") ? card.querySelector(".card-category").textContent : card.textContent));
                    if (!containsAny(source, selected)) {
                        matched = false;
                    }
                });

                card.classList.toggle("is-hidden", !matched);
                if (matched) {
                    visible += 1;
                }
            });

            if (sortSelect && target) {
                const mode = sortSelect.value;
                const sorted = cards.slice().sort(function (a, b) {
                    if (mode === "score") {
                        return Number(b.getAttribute("data-score")) - Number(a.getAttribute("data-score"));
                    }
                    if (mode === "year") {
                        return Number(String(b.getAttribute("data-year")).match(/\d{4}/) || 0) - Number(String(a.getAttribute("data-year")).match(/\d{4}/) || 0);
                    }
                    if (mode === "title") {
                        return String(a.getAttribute("data-title")).localeCompare(String(b.getAttribute("data-title")), "zh-Hans-CN");
                    }
                    return 0;
                });
                sorted.forEach(function (card) {
                    target.appendChild(card);
                });
            }

            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        if (search) {
            const params = new URLSearchParams(window.location.search);
            const q = params.get("q");
            if (q) {
                search.value = q;
            }
            search.addEventListener("input", apply);
        }

        selects.forEach(function (select) {
            select.addEventListener("change", apply);
        });

        if (sortSelect) {
            sortSelect.addEventListener("change", apply);
        }

        apply();
    });
})();

function setupMoviePlayer(sourceUrl, videoSelector, overlaySelector) {
    const video = document.querySelector(videoSelector);
    const overlay = document.querySelector(overlaySelector);
    let ready = false;
    let hls = null;

    if (!video) {
        return;
    }

    function prepare() {
        if (ready) {
            return Promise.resolve();
        }

        ready = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = sourceUrl;
            return Promise.resolve();
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
            return new Promise(function (resolve) {
                hls.on(Hls.Events.MANIFEST_PARSED, function () {
                    resolve();
                });
            });
        }

        video.src = sourceUrl;
        return Promise.resolve();
    }

    function play() {
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
        video.controls = true;
        prepare().then(function () {
            const promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                });
            }
        });
    }

    if (overlay) {
        overlay.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            play();
        }
    });
}
