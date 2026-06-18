function initMoviePlayer(source) {
  const video = document.getElementById('movie-player');
  const trigger = document.getElementById('play-trigger');
  let connected = false;
  let hls = null;

  if (!video || !trigger || !source) {
    return;
  }

  function connect() {
    if (connected) {
      return;
    }

    connected = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function start() {
    connect();
    trigger.hidden = true;
    const attempt = video.play();

    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(function () {
        trigger.hidden = false;
      });
    }
  }

  trigger.addEventListener('click', start);

  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });

  video.addEventListener('play', function () {
    trigger.hidden = true;
  });

  video.addEventListener('pause', function () {
    if (video.currentTime === 0 || video.ended) {
      trigger.hidden = false;
    }
  });

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
