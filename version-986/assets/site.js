document.addEventListener("DOMContentLoaded", function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-menu]");

    if (menuButton && menu) {
        menuButton.addEventListener("click", function () {
            menu.classList.toggle("open");
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        var show = function (target) {
            if (!slides.length) {
                return;
            }

            index = (target + slides.length) % slides.length;

            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle("active", itemIndex === index);
            });

            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle("active", itemIndex === index);
            });
        };

        var start = function () {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        };

        var stop = function () {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        };

        if (prev) {
            prev.addEventListener("click", function () {
                stop();
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                stop();
                show(index + 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                stop();
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll(".site-search"));

    searchInputs.forEach(function (input) {
        input.addEventListener("input", function () {
            var root = input.closest(".content-section") || document;
            var cards = Array.prototype.slice.call(root.querySelectorAll(".movie-card"));
            var empty = root.querySelector(".empty-state");
            var query = input.value.trim().toLowerCase();
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute("data-title") || "",
                    card.getAttribute("data-tags") || "",
                    card.getAttribute("data-year") || "",
                    card.textContent || ""
                ].join(" ").toLowerCase();
                var matched = !query || haystack.indexOf(query) !== -1;
                card.style.display = matched ? "" : "none";

                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("show", visible === 0);
            }
        });
    });
});

function initPlayer(videoId, overlayId, streamUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var initialized = false;

    if (!video) {
        return;
    }

    var start = function () {
        if (overlay) {
            overlay.classList.add("is-hidden");
        }

        if (!initialized) {
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                video.hlsPlayer = hls;
            } else {
                video.src = streamUrl;
            }

            initialized = true;
        }

        var promise = video.play();

        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
                if (overlay) {
                    overlay.classList.remove("is-hidden");
                }
            });
        }
    };

    if (overlay) {
        overlay.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            start();
        }
    });
}
