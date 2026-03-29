import fs from 'node:fs';
import path from 'node:path';

const root = '/Users/kunhao/Documents/blogs';
const contentDir = path.join(root, 'content/posts');
const postsDir = path.join(root, 'posts');

function parseFrontMatter(raw) {
  const normalized = raw.replace(/\r\n/g, '\n');
  if (!normalized.startsWith('---\n')) return { meta: {}, body: normalized };

  const end = normalized.indexOf('\n---\n', 4);
  if (end === -1) return { meta: {}, body: normalized };

  const metaText = normalized.slice(4, end);
  const body = normalized.slice(end + 5).trim();
  const meta = {};

  for (const line of metaText.split('\n')) {
    const sep = line.indexOf(':');
    if (sep === -1) continue;
    const key = line.slice(0, sep).trim();
    const value = line.slice(sep + 1).trim();
    meta[key] = value;
  }

  return { meta, body };
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function inlineMarkdown(text) {
  let out = escapeHtml(text);
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return out;
}

function markdownToHtml(md) {
  const lines = md.split('\n');
  const html = [];
  let inList = false;
  let inCode = false;
  let para = [];

  const flushPara = () => {
    if (!para.length) return;
    html.push(`<p>${inlineMarkdown(para.join(' '))}</p>`);
    para = [];
  };

  const closeList = () => {
    if (!inList) return;
    html.push('</ul>');
    inList = false;
  };

  for (const line of lines) {
    if (line.startsWith('```')) {
      flushPara();
      closeList();
      if (!inCode) {
        inCode = true;
        html.push('<pre><code>');
      } else {
        inCode = false;
        html.push('</code></pre>');
      }
      continue;
    }

    if (inCode) {
      html.push(escapeHtml(line));
      continue;
    }

    if (!line.trim()) {
      flushPara();
      closeList();
      continue;
    }

    if (/^#{1,3}\s/.test(line)) {
      flushPara();
      closeList();
      const level = line.match(/^#{1,3}/)[0].length;
      const text = line.replace(/^#{1,3}\s+/, '');
      html.push(`<h${level}>${inlineMarkdown(text)}</h${level}>`);
      continue;
    }

    if (/^-\s+/.test(line)) {
      flushPara();
      if (!inList) {
        inList = true;
        html.push('<ul>');
      }
      html.push(`<li>${inlineMarkdown(line.replace(/^-\s+/, ''))}</li>`);
      continue;
    }

    para.push(line.trim());
  }

  flushPara();
  closeList();
  return html.join('\n');
}

function pageHead(title, stylePrefix = './') {
  return `
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Space+Grotesk:wght@400;600;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="${stylePrefix}styles.css" />
  </head>
`;
}

const files = fs.readdirSync(contentDir).filter((f) => f.endsWith('.md'));

const posts = files.map((file) => {
  const filePath = path.join(contentDir, file);
  const raw = fs.readFileSync(filePath, 'utf8');
  const { meta, body } = parseFrontMatter(raw);

  if (!meta.title || !meta.date || !meta.slug) {
    throw new Error(`Post metadata missing in ${file}`);
  }

  return {
    ...meta,
    bodyHtml: markdownToHtml(body),
  };
});

posts.sort((a, b) => (a.date < b.date ? 1 : -1));

for (const post of posts) {
  const articleHtml = `
${pageHead(`${post.title} | K Blog`, '../')}
  <body>
    <header class="site-header compact">
      <a class="logo" href="../index.html">K Blog</a>
      <nav>
        <a href="../index.html">首页</a>
        <a href="../about.html">关于</a>
      </nav>
    </header>
    <main class="container narrow">
      <article class="article">
        <p class="post-meta">${escapeHtml(post.date)} · ${escapeHtml(post.readingTime || '阅读')}</p>
        <h1>${escapeHtml(post.title)}</h1>
        ${post.bodyHtml}
      </article>

      <section class="comments-wrap">
        <h2>评论</h2>
        <div id="comments"></div>
      </section>
    </main>
    <script src="../assets/site-config.js"></script>
    <script src="../assets/comments.js"></script>
  </body>
</html>
`;

  fs.writeFileSync(path.join(postsDir, `${post.slug}.html`), articleHtml.trimStart());
}

const cards = posts
  .map(
    (post) => `
        <article class="post-card">
          <p class="post-meta">${escapeHtml(post.date)} · ${escapeHtml(post.readingTime || '阅读')}</p>
          <h2><a href="./posts/${escapeHtml(post.slug)}.html">${escapeHtml(post.title)}</a></h2>
          <p>${escapeHtml(post.summary || '')}</p>
        </article>`
  )
  .join('\n');

const indexHtml = `
${pageHead('K Blog | 技术与生活随笔')}
  <body>
    <div class="bg-shape bg-shape-left"></div>
    <div class="bg-shape bg-shape-right"></div>

    <header class="site-header">
      <a class="logo" href="./index.html">K Blog</a>
      <nav>
        <a href="./index.html">首页</a>
        <a href="./about.html">关于</a>
      </nav>
    </header>

    <main class="container">
      <section class="hero">
        <p class="eyebrow">PERSONAL NOTES · 2026</p>
        <h1>记录代码、产品与日常思考</h1>
        <p class="hero-desc">一个简洁但不无聊的个人博客。这里会持续更新技术文章、踩坑总结和项目复盘。</p>
      </section>

      <section class="post-grid">${cards}
      </section>
    </main>

    <footer class="site-footer">
      <p>© 2026 K Blog · Built with static HTML</p>
    </footer>
  </body>
</html>
`;

fs.writeFileSync(path.join(root, 'index.html'), indexHtml.trimStart());
console.log(`Generated ${posts.length} post pages and index.html`);
