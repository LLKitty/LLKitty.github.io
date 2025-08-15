(function () {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const state = {
    theme: localStorage.getItem('theme') || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'),
    query: '',
    activeTags: new Set(),
  };

  /** 示例文章数据 */
  const posts = [
    {
      id: 'react-optimization',
      title: 'React 性能优化实战：从 60fps 到 丝滑体验',
      date: '2024-11-21',
      tags: ['前端', 'React', '性能'],
      excerpt: '系统梳理渲染优化、状态管理、虚拟化与代码分割策略，用真实指标指导优化决策。',
      content:
        '使用 React Profiler 定位重渲染热点；将全局状态拆分并局部化；利用 React.memo、useMemo、useCallback；引入虚拟滚动与动态加载，最终将渲染时间从 120ms 降至 18ms。',
    },
    {
      id: 'node-streaming',
      title: 'Node.js 流与背压：可伸缩服务的关键',
      date: '2024-08-03',
      tags: ['后端', 'Node.js', '架构'],
      excerpt: '读懂背压与高水位线，设计稳定的文件与网络数据管道。',
      content:
        '通过 stream.pipeline 串联处理步骤，使用 async iterator 简化消费端逻辑；合理设置 highWaterMark，避免内存飙升；在生产环境中结合 pino 观察吞吐与延迟。',
    },
    {
      id: 'kubernetes-cost',
      title: 'Kubernetes 成本优化：从监控到调度',
      date: '2024-05-17',
      tags: ['DevOps', 'Kubernetes', '成本优化'],
      excerpt: '用 request/limit、HPA/VPA 与 Spot 实例三板斧，打通观测与调度的闭环。',
      content:
        '结合 Prometheus + Grafana 监控实际使用峰谷；基于资源画像配置 requests 与 limits；通过 HPA/VPA 动态匹配负载；分层容忍度与亲和性规则让 Spot 节省 40% 成本。',
    },
    {
      id: 'rust-ownership',
      title: '一文读懂 Rust 所有权与借用检查器',
      date: '2024-03-11',
      tags: ['系统', 'Rust', '内存安全'],
      excerpt: '从编译期保证内存安全：移动、借用、生命周期与并发。',
      content:
        '通过所有权转移与不可变/可变借用，Rust 在编译期阻止数据竞争；使用生命周期标注消除歧义；Send/Sync trait 使并发更稳健。',
    },
    {
      id: 'llm-eval',
      title: '评测大语言模型：指标、对齐与幻觉',
      date: '2024-09-12',
      tags: ['AI', 'LLM', '评测'],
      excerpt: '从准确率到实用性：如何建立端到端评测体系以降低幻觉风险。',
      content:
        '采用任务相似性指标 + 人审混合评测；通过检索增强减少幻觉；安全对齐方面引入拒答率与红队测试。',
    },
    {
      id: 'web-security-csp',
      title: '前端安全最佳实践：CSP、SRI 与依赖治理',
      date: '2024-07-01',
      tags: ['安全', 'Web', '最佳实践'],
      excerpt: '让常见的 XSS、供应链与点击劫持攻击无处遁形。',
      content:
        '配置严格的 Content-Security-Policy；使用 Subresource Integrity 保护外链资源；依赖树体检与锁定；同源策略与 iframe sandbox 搭配防御。',
    },
  ];

  /** 初始化主题 */
  function applyTheme(theme) {
    state.theme = theme;
    const html = document.documentElement;
    if (theme === 'light') html.classList.add('light');
    else html.classList.remove('light');
    localStorage.setItem('theme', theme);
    $('#themeToggle').setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    $('#themeToggle').textContent = theme === 'dark' ? '🌗 暗色模式' : '🌞 亮色模式';
  }

  /** 渲染标签 */
  function renderTags() {
    const tagHost = $('#tagFilters');
    tagHost.innerHTML = '';
    const all = new Set();
    posts.forEach(p => p.tags.forEach(t => all.add(t)));
    const fragment = document.createDocumentFragment();
    Array.from(all).sort().forEach(tag => {
      const el = document.createElement('button');
      el.className = 'tag';
      el.textContent = tag;
      el.setAttribute('role', 'listitem');
      el.setAttribute('aria-pressed', state.activeTags.has(tag) ? 'true' : 'false');
      if (state.activeTags.has(tag)) el.classList.add('active');
      el.addEventListener('click', () => {
        if (state.activeTags.has(tag)) state.activeTags.delete(tag);
        else state.activeTags.add(tag);
        renderTags();
        renderPosts();
      });
      fragment.appendChild(el);
    });
    tagHost.appendChild(fragment);
  }

  /** 过滤函数 */
  function matchPost(post) {
    const byTag = state.activeTags.size === 0 || post.tags.some(t => state.activeTags.has(t));
    const q = state.query.trim().toLowerCase();
    const byQuery = q === '' ||
      post.title.toLowerCase().includes(q) ||
      post.excerpt.toLowerCase().includes(q) ||
      post.content.toLowerCase().includes(q);
    return byTag && byQuery;
  }

  /** 渲染文章 */
  function renderPosts() {
    const host = $('#posts');
    host.setAttribute('aria-busy', 'true');
    const filtered = posts.filter(matchPost);
    $('#resultCount').textContent = `共 ${filtered.length} 篇文章`;
    host.innerHTML = '';
    const fragment = document.createDocumentFragment();
    filtered
      .sort((a, b) => b.date.localeCompare(a.date))
      .forEach(p => {
        const card = document.createElement('article');
        card.className = 'card';
        card.innerHTML = `
          <h3>${p.title}</h3>
          <div class="meta">${p.date}</div>
          <p class="excerpt">${p.excerpt}</p>
          <div class="tags">${p.tags.map(t => `<span class="tag" tabindex="-1">${t}</span>`).join('')}</div>
          <a class="read-more" href="#" data-id="${p.id}" aria-label="阅读 ${p.title}">阅读全文 →</a>
        `;
        fragment.appendChild(card);
      });
    host.appendChild(fragment);
    host.setAttribute('aria-busy', 'false');

    // 为“阅读全文”绑定事件（弹出简易对话框）
    $$('.read-more', host).forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const id = link.getAttribute('data-id');
        const post = posts.find(p => p.id === id);
        if (!post) return;
        openDialog(post);
      });
    });
  }

  /** 简易对话框 */
  function openDialog(post) {
    const dialog = document.createElement('dialog');
    dialog.style.maxWidth = '800px';
    dialog.style.border = '1px solid var(--border)';
    dialog.style.background = 'var(--panel)';
    dialog.style.color = 'var(--text)';
    dialog.style.borderRadius = '12px';
    dialog.style.padding = '0';
    dialog.innerHTML = `
      <form method="dialog" style="margin:0;padding:0;">
        <header style="display:flex;justify-content:space-between;align-items:center;padding:14px 16px;border-bottom:1px solid var(--border)">
          <div>
            <div style="font-weight:600">${post.title}</div>
            <div class="meta" style="font-size:12px;color:var(--muted)">${post.date} · ${post.tags.join(' / ')}</div>
          </div>
          <button class="btn small" value="close" aria-label="关闭">关闭</button>
        </header>
        <article style="padding:16px;line-height:1.75">
          <p>${post.content}</p>
        </article>
      </form>
    `;
    document.body.appendChild(dialog);
    dialog.addEventListener('close', () => dialog.remove());
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else alert(`${post.title}\n\n${post.content}`);
  }

  /** 事件绑定与初始化 */
  function init() {
    // 主题
    applyTheme(state.theme);
    $('#themeToggle').addEventListener('click', () => {
      applyTheme(state.theme === 'dark' ? 'light' : 'dark');
    });

    // 年份
    $('#year').textContent = new Date().getFullYear();

    // 搜索
    const search = $('#searchInput');
    search.addEventListener('input', (e) => {
      state.query = e.target.value;
      renderPosts();
    });
    // 快捷键：按 / 聚焦搜索
    window.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== search) {
        e.preventDefault();
        search.focus();
      }
    });

    // 清除筛选
    $('#clearFilters').addEventListener('click', () => {
      state.query = '';
      state.activeTags.clear();
      search.value = '';
      renderTags();
      renderPosts();
    });

    // 回到顶部
    $('#backToTop').addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    renderTags();
    renderPosts();
  }

  document.addEventListener('DOMContentLoaded', init);
})();


