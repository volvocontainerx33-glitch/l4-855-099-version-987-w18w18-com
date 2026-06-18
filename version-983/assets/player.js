import { H as Hls } from './video-ngrwgkzw.js';

const attachSource = function (video, source) {
  if (!video || !source || video.dataset.ready === 'true') {
    return;
  }

  if (Hls && Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });

    hls.loadSource(source);
    hls.attachMedia(video);
    video._hls = hls;
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
  } else {
    video.src = source;
  }

  video.dataset.ready = 'true';
};

const setupPlayer = function () {
  const frame = document.querySelector('[data-player]');

  if (!frame) {
    return;
  }

  const video = frame.querySelector('video');
  const button = frame.querySelector('[data-play-trigger]');

  if (!video || !button) {
    return;
  }

  const source = video.getAttribute('data-src');

  button.addEventListener('click', function () {
    attachSource(video, source);
    button.classList.add('is-hidden');

    const playback = video.play();

    if (playback && typeof playback.catch === 'function') {
      playback.catch(function () {
        button.classList.remove('is-hidden');
      });
    }
  });

  video.addEventListener('play', function () {
    button.classList.add('is-hidden');
  });

  video.addEventListener('pause', function () {
    if (!video.ended && video.currentTime === 0) {
      button.classList.remove('is-hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (video._hls) {
      video._hls.destroy();
    }
  });
};

setupPlayer();
