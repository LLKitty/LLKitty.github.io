// DOM 引用
const postsEl = document.getElementById('posts');
const searchInput = document.getElementById('searchInput');
const tagFiltersEl = document.getElementById('tagFilters');
const resultCountEl = document.getElementById('resultCount');
const clearBtn = document.getElementById('clearFilters');
const backToTop = document.getElementById('backToTop');
const themeToggle = document.getElementById('themeToggle');

// 状态
let posts = [];
let activeTags = new Set();
let query = '';

// 工具函数
const htmlEscape = (s) => (s || '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

function stripFrontMatter(md) {
  if (md.startsWith('---')) {
    const end = md.indexOf('\n---', 3);
    if (end !== -1) return md.slice(end + 4).replace(/^\s+/, '');
  }
  return md;
}

function mdToHtml(md) {
  // 极简 Markdown 渲染：标题/代码块/行内代码/列表/粗斜体/链接/段落
  let src = stripFrontMatter(md).replace(/\r\n?/g, '\n');
  // 代码块（```lang\n...```）
  src = src.replace(/```([\w-]*)\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre><code class="language-${htmlEscape(lang)}">${htmlEscape(code)}</code></pre>`;
  });
  // 标题 #..######
  src = src.replace(/^######\s+(.*)$/gm, '<h6>$1</h6>')
           .replace(/^#####\s+(.*)$/gm, '<h5>$1</h5>')
           .replace(/^####\s+(.*)$/gm, '<h4>$1</h4>')
           .replace(/^###\s+(.*)$/gm, '<h3>$1</h3>')
           .replace(/^##\s+(.*)$/gm, '<h2>$1</h2>')
           .replace(/^#\s+(.*)$/gm, '<h1>$1</h1>');
  // 无序列表
  src = src.replace(/^(?:- |\* )(.*)(?:\n(?:- |\* ).*)*/gm, (block) => {
    const items = block.split('\n').map((line) => line.replace(/^(?:- |\* )/, '')).map((t) => `<li>${t}</li>`).join('');
    return `<ul>${items}</ul>`;
  });
  // 有序列表
  src = src.replace(/^\d+\.\s.*(?:\n\d+\.\s.*)*/gm, (block) => {
    const items = block.split('\n').map((line) => line.replace(/^\d+\.\s/, '')).map((t) => `<li>${t}</li>`).join('');
    return `<ol>${items}</ol>`;
  });
  // 行内代码
  src = src.replace(/`([^`]+)`/g, (_, code) => `<code>${htmlEscape(code)}</code>`);
  // 粗体/斜体（简单处理）
  src = src.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*]+)\*/g, '<em>$1</em>');
  // 链接 [text](url)
  src = src.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1<\/a>');
  // 段落（以空行分段，忽略已生成的块级标签）
  const lines = src.split(/\n{2,}/).map((chunk) => {
    if (/^\s*<(h\d|ul|ol|pre|blockquote)/.test(chunk)) return chunk;
    return `<p>${chunk.replace(/\n/g, '<br>')}</p>`;
  });
  return lines.join('\n');
}

function mdToText(md) {
  return stripFrontMatter(md).replace(/```[\s\S]*?```/g, ' ').replace(/`[^`]+`/g, ' ').replace(/\[(.*?)\]\((.*?)\)/g, '$1').replace(/[#>*_\-]/g, ' ').replace(/\s+/g, ' ').trim();
}

async function loadPosts() {
  try {
    const res = await fetch('doc/manifest.json');
    if (!res.ok) throw new Error('manifest 加载失败');
    const manifest = await res.json();
    const mdList = await Promise.all(
      manifest.map(async (item) => {
        const mdRes = await fetch(`doc/${item.file}`);
        if (!mdRes.ok) throw new Error(`${item.file} 加载失败`);
        const md = await mdRes.text();
        return {
          ...item,
          contentMarkdown: md,
          contentHtml: mdToHtml(md),
          contentText: mdToText(md),
        };
      })
    );
    posts = mdList;
    computeAndRender();
  } catch (err) {
    postsEl.innerHTML = `<article class="post"><h3>无法加载文章</h3><p class="muted">${htmlEscape(String(err))}</p><p class="muted">如果是直接用浏览器打开本文件，建议通过本地静态服务器运行。例如：VSCode Live Server 或在本目录执行 <code>python -m http.server</code>。</p></article>`;
    resultCountEl.textContent = '加载失败';
  }
}

function normalize(s) { return (s || '').toLowerCase(); }

function matchPost(post) {
  const q = normalize(query);
  const hitQuery = !q || [post.title, post.excerpt, post.contentText].some((x) => normalize(x).includes(q));
  const hitTags = activeTags.size === 0 || post.tags.some((t) => activeTags.has(t));
  return hitQuery && hitTags;
}

function renderTags() {
  const all = Array.from(new Set(posts.flatMap((p) => p.tags))).sort();
  tagFiltersEl.innerHTML = '';
  all.forEach((tag) => {
    const btn = document.createElement('button');
    btn.className = 'tag';
    btn.type = 'button';
    btn.textContent = tag;
    btn.setAttribute('aria-pressed', activeTags.has(tag) ? 'true' : 'false');
    btn.addEventListener('click', () => {
      if (activeTags.has(tag)) activeTags.delete(tag); else activeTags.add(tag);
      btn.setAttribute('aria-pressed', activeTags.has(tag) ? 'true' : 'false');
      renderPosts();
    });
    tagFiltersEl.appendChild(btn);
  });
}

function renderPosts() {
  const matched = posts.filter(matchPost).sort((a, b) => b.date.localeCompare(a.date));
  postsEl.innerHTML = matched
    .map(
      (p) => `
    <article class="post" tabindex="0">
      <div class="meta">${p.date} · ${p.tags.map((t) => `#${t}`).join(' ')}</div>
      <h3>${p.title}</h3>
      <p class="excerpt">${p.excerpt}</p>
      <details>
        <summary>展开笔记</summary>
        <div class="markdown">${p.contentHtml}</div>
      </details>
    </article>
  `
    )
    .join('');
  resultCountEl.textContent = `共 ${matched.length} 篇`;
  document.querySelector('#posts').setAttribute('aria-busy', 'false');
}

function computeAndRender() {
  renderTags();
  renderPosts();
}

// 搜索交互
searchInput.addEventListener('input', (e) => {
  query = e.target.value || '';
  renderPosts();
});
window.addEventListener('keydown', (e) => {
  if (e.key === '/') {
    e.preventDefault();
    searchInput.focus();
  }
});

// 清除
clearBtn.addEventListener('click', () => {
  query = '';
  activeTags.clear();
  searchInput.value = '';
  renderTags();
  renderPosts();
});

// 回到顶部
backToTop.addEventListener('click', (e) => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// 主题切换（记忆至 localStorage）
const THEME_KEY = 'prefers-dark';
function applyTheme() {
  const prefersDark = localStorage.getItem(THEME_KEY) === '1';
  document.documentElement.classList.toggle('dark', prefersDark);
  themeToggle.setAttribute('aria-pressed', prefersDark ? 'true' : 'false');
  themeToggle.textContent = prefersDark ? '🌞 浅色模式' : '🌗 深色模式';
}
themeToggle.addEventListener('click', () => {
  const next = localStorage.getItem(THEME_KEY) === '1' ? '0' : '1';
  localStorage.setItem(THEME_KEY, next);
  applyTheme();
});

// 年份
document.getElementById('year').textContent = new Date().getFullYear();

// 初始化
applyTheme();
loadPosts();


