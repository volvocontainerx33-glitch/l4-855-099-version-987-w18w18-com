(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var toggle = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                var open = panel.classList.toggle("open");
                toggle.setAttribute("aria-expanded", open ? "true" : "false");
                toggle.textContent = open ? "×" : "☰";
            });
        }

        var slider = document.getElementById("heroSlider");
        if (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
            var current = 0;
            var timer = null;
            var show = function (index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("active", i === current);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("active", i === current);
                });
            };
            var start = function () {
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            };
            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    window.clearInterval(timer);
                    show(Number(dot.getAttribute("data-slide")) || 0);
                    start();
                });
            });
            if (slides.length > 1) {
                start();
            }
        }

        var localFilter = document.querySelector(".local-filter");
        var yearFilter = document.querySelector(".year-filter");
        var filterList = document.querySelector(".filter-list");
        var applyLocal = function () {
            if (!filterList) {
                return;
            }
            var q = localFilter ? localFilter.value.trim().toLowerCase() : "";
            var y = yearFilter ? yearFilter.value : "";
            filterList.querySelectorAll(".search-item").forEach(function (item) {
                var hay = [
                    item.getAttribute("data-title"),
                    item.getAttribute("data-genre"),
                    item.getAttribute("data-region"),
                    item.getAttribute("data-type"),
                    item.getAttribute("data-year")
                ].join(" ").toLowerCase();
                var okText = !q || hay.indexOf(q) !== -1;
                var okYear = !y || item.getAttribute("data-year") === y;
                item.classList.toggle("hidden-item", !(okText && okYear));
            });
        };
        if (localFilter) {
            localFilter.addEventListener("input", applyLocal);
        }
        if (yearFilter) {
            yearFilter.addEventListener("change", applyLocal);
        }

        var searchInput = document.getElementById("searchInput");
        var regionFilter = document.getElementById("regionFilter");
        var typeFilter = document.getElementById("typeFilter");
        var globalYearFilter = document.getElementById("yearFilter");
        var searchList = document.getElementById("searchList");
        var urlParams = new URLSearchParams(window.location.search);
        if (searchInput && urlParams.get("q")) {
            searchInput.value = urlParams.get("q");
        }
        var applySearch = function () {
            if (!searchList) {
                return;
            }
            var q = searchInput ? searchInput.value.trim().toLowerCase() : "";
            var region = regionFilter ? regionFilter.value : "";
            var type = typeFilter ? typeFilter.value : "";
            var year = globalYearFilter ? globalYearFilter.value : "";
            searchList.querySelectorAll(".search-item").forEach(function (item) {
                var hay = [
                    item.getAttribute("data-title"),
                    item.getAttribute("data-genre"),
                    item.getAttribute("data-region"),
                    item.getAttribute("data-type"),
                    item.getAttribute("data-year")
                ].join(" ").toLowerCase();
                var ok = true;
                if (q && hay.indexOf(q) === -1) ok = false;
                if (region && item.getAttribute("data-region") !== region) ok = false;
                if (type && item.getAttribute("data-type") !== type) ok = false;
                if (year && item.getAttribute("data-year") !== year) ok = false;
                item.classList.toggle("hidden-item", !ok);
            });
        };
        [searchInput, regionFilter, typeFilter, globalYearFilter].forEach(function (control) {
            if (control) {
                control.addEventListener(control.tagName === "INPUT" ? "input" : "change", applySearch);
            }
        });
        applySearch();
    });
})();
