// DOM 引用
const postsEl = document.getElementById('postList');
const postContentEl = document.getElementById('postContent');
const categoryListEl = document.getElementById('categoryList');
const searchInput = document.getElementById('searchInput');
const resultCountEl = document.getElementById('resultCount');
const clearBtn = document.getElementById('clearFilters');
const backToTop = document.getElementById('backToTop');
const themeToggle = document.getElementById('themeToggle');

// 状态
let posts = [];
let activeTags = new Set();
let query = '';
let activePostSlug = '';

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
    const res = await fetch('./doc/manifest.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('manifest 加载失败');
    const manifest = await res.json();
    const mdList = await Promise.all(
      manifest.map(async (item) => {
        const mdRes = await fetch(`./doc/${item.file}`, { cache: 'no-store' });
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
    postsEl.innerHTML = `<article class=\"post\"><h3>无法加载文章</h3><p class=\"muted\">${htmlEscape(String(err))}</p><p class=\"muted\">如在 GitHub Pages 上，请确保仓库根目录存在 <code>.nojekyll</code> 文件以禁用 Jekyll，并确认 <code>doc/manifest.json</code> 与 <code>doc/*.md</code> 均已发布。</p></article>`;
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
  categoryListEl.innerHTML = '';
  all.forEach((tag) => {
    const item = document.createElement('div');
    item.className = 'category-item';
    const btn = document.createElement('button');
    btn.className = 'category-btn';
    btn.type = 'button';
    btn.textContent = tag;
    btn.setAttribute('aria-pressed', activeTags.has(tag) ? 'true' : 'false');
    btn.addEventListener('click', () => {
      // 单选；再次点击则清除
      if (activeTags.has(tag)) activeTags.clear();
      else activeTags = new Set([tag]);
      renderTags();
      renderPosts();
    });
    item.appendChild(btn);
    categoryListEl.appendChild(item);
  });
}

function renderPosts() {
  const matched = posts.filter(matchPost).sort((a, b) => b.date.localeCompare(a.date));
  postsEl.innerHTML = matched.map((p) => `
    <div class="post-row">
      <div class="meta">${p.date} · ${p.tags.map((t) => `#${t}`).join(' ')}</div>
      <h3 class="title"><a href="#${p.slug}" data-slug="${p.slug}">${p.title}</a></h3>
      <p class="excerpt">${p.excerpt}</p>
    </div>
  `).join('');
  resultCountEl.textContent = `共 ${matched.length} 篇`;
  postsEl.setAttribute('aria-busy', 'false');

  // 绑定点击打开全文
  postsEl.querySelectorAll('a[data-slug]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const slug = a.getAttribute('data-slug');
      openPost(slug);
    });
  });
}

function computeAndRender() {
  renderTags();
  renderPosts();
}

function openPost(slug) {
  const post = posts.find((p) => p.slug === slug);
  if (!post) return;
  activePostSlug = slug;
  postContentEl.innerHTML = `
    <h1>${post.title}</h1>
    <div class="meta">${post.date} · ${post.tags.map((t) => `#${t}`).join(' ')}</div>
    <div class="markdown">${post.contentHtml}</div>
  `;
  postContentEl.hidden = false;
  // 更新 hash，便于刷新/分享
  if (location.hash !== `#${slug}`) {
    history.replaceState(null, '', `#${slug}`);
  }
  postContentEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// 支持通过 URL hash 直接打开文章
window.addEventListener('hashchange', () => {
  const slug = (location.hash || '').replace(/^#/, '');
  if (slug) openPost(slug);
});

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


