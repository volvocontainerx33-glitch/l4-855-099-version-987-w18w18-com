(function () {
    window.setupMoviePlayer = function (options) {
        var video = document.getElementById(options.videoId);
        var button = document.getElementById(options.buttonId);
        var shell = document.getElementById(options.shellId);
        var source = options.source;
        var hlsInstance = null;
        var started = false;

        if (!video || !button || !source) {
            return;
        }

        var hideButton = function () {
            button.classList.add("is-hidden");
        };

        var start = function () {
            if (started) {
                hideButton();
                video.play().catch(function () {});
                return;
            }
            started = true;
            hideButton();

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                video.play().catch(function () {});
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal && hlsInstance) {
                        hlsInstance.destroy();
                        hlsInstance = null;
                        video.src = source;
                    }
                });
                return;
            }

            video.src = source;
            video.play().catch(function () {});
        };

        button.addEventListener("click", start);
        if (shell) {
            shell.addEventListener("click", function (event) {
                if (event.target === video || event.target === shell) {
                    start();
                }
            });
        }
        video.addEventListener("play", hideButton);
    };
})();
