(function () {
  var cfg = window.SITE_CONFIG && window.SITE_CONFIG.comments;
  var mount = document.getElementById('comments');

  if (!mount || !cfg || !cfg.enabled) {
    if (mount) {
      mount.innerHTML = '<p class="comment-note">评论未启用。配置完成后将自动显示评论区。</p>';
    }
    return;
  }

  if (cfg.provider !== 'giscus') {
    mount.innerHTML = '<p class="comment-note">暂不支持当前评论提供商。</p>';
    return;
  }

  var required = ['repo', 'repoId', 'category', 'categoryId'];
  for (var i = 0; i < required.length; i += 1) {
    if (!cfg[required[i]]) {
      mount.innerHTML = '<p class="comment-note">Giscus 参数不完整，请先完善 assets/site-config.js。</p>';
      return;
    }
  }

  var script = document.createElement('script');
  script.src = 'https://giscus.app/client.js';
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.setAttribute('data-repo', cfg.repo);
  script.setAttribute('data-repo-id', cfg.repoId);
  script.setAttribute('data-category', cfg.category);
  script.setAttribute('data-category-id', cfg.categoryId);
  script.setAttribute('data-mapping', cfg.mapping || 'pathname');
  script.setAttribute('data-strict', cfg.strict || '0');
  script.setAttribute('data-reactions-enabled', cfg.reactionsEnabled || '1');
  script.setAttribute('data-emit-metadata', cfg.emitMetadata || '0');
  script.setAttribute('data-input-position', cfg.inputPosition || 'top');
  script.setAttribute('data-theme', 'light');
  script.setAttribute('data-lang', cfg.lang || 'zh-CN');

  mount.appendChild(script);
})();
