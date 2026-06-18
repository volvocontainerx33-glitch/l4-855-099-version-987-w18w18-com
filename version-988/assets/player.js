(function () {
  function setStatus(message) {
    var status = document.querySelector('[data-player-status]');
    if (status) {
      status.textContent = message;
    }
  }

  function bootPlayer() {
    var video = document.querySelector('[data-video-player]');
    var button = document.querySelector('[data-play-button]');
    if (!video || !button) {
      return;
    }

    var source = video.getAttribute('data-m3u8');
    var hlsInstance = null;
    var loaded = false;

    function loadSource() {
      if (loaded) {
        return Promise.resolve();
      }
      loaded = true;
      setStatus('正在加载播放源，请稍候...');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        setStatus('播放源已就绪，正在启动播放器。');
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('播放源已就绪，正在启动播放器。');
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            setStatus('网络加载异常，正在尝试恢复播放。');
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            setStatus('媒体播放异常，正在尝试恢复。');
            hlsInstance.recoverMediaError();
          } else {
            setStatus('播放源暂时无法加载，请稍后重试。');
            hlsInstance.destroy();
          }
        });
        return Promise.resolve();
      }

      setStatus('当前浏览器不支持 HLS 播放，请使用现代浏览器打开。');
      return Promise.reject(new Error('HLS not supported'));
    }

    button.addEventListener('click', function () {
      button.classList.add('is-hidden');
      loadSource()
        .then(function () {
          return video.play();
        })
        .catch(function () {
          button.classList.remove('is-hidden');
        });
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', bootPlayer);
})();
