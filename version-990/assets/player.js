function initPlayer(videoId, overlayId, source) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    if (!video || !overlay || !source) {
        return;
    }
    var ready = false;
    var hls = null;
    var showOverlay = function () {
        overlay.classList.remove('is-hidden');
    };
    var hideOverlay = function () {
        overlay.classList.add('is-hidden');
    };
    var playVideo = function () {
        hideOverlay();
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                showOverlay();
            });
        }
    };
    var prepare = function () {
        if (ready) {
            playVideo();
            return;
        }
        ready = true;
        video.controls = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.addEventListener('loadedmetadata', playVideo, { once: true });
            video.load();
            playVideo();
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            hls = new Hls({ enableWorker: true, lowLatencyMode: false });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, playVideo);
            hls.on(Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    showOverlay();
                }
            });
            return;
        }
        video.src = source;
        video.load();
        playVideo();
    };
    overlay.addEventListener('click', prepare);
    video.addEventListener('click', function () {
        if (!ready) {
            prepare();
        }
    });
    window.addEventListener('pagehide', function () {
        if (hls) {
            hls.destroy();
        }
    });
}
