// 文章清单（运行时从 doc/manifest.json 加载）
let articlesManifest = { categories: {} };

// 分类描述
const categoryDescriptions = {
	pcb: "PCB设计技术分享，包括原理图设计、布局布线、制造工艺等",
	schematic: "电路原理图设计技巧和最佳实践",
	layout: "PCB布局布线设计方法和注意事项",
	stm32: "STM32单片机开发教程和项目案例",
	arduino: "Arduino开发平台应用和物联网项目",
	esp32: "ESP32开发板应用和WiFi项目",
	pic: "PIC单片机开发技术分享",
	rtos: "实时操作系统原理和应用",
	linux: "嵌入式Linux系统开发和移植",
	freertos: "FreeRTOS实时操作系统使用",
	uart: "串口通信协议和编程实现",
	i2c: "I2C总线协议和应用",
	spi: "SPI通信协议和编程",
	can: "CAN总线通信技术",
	temperature: "温度传感器应用和校准",
	pressure: "压力传感器应用技术",
	motion: "运动传感器和姿态检测",
	ide: "嵌入式开发环境配置",
	debug: "调试工具和技巧",
	simulation: "仿真验证工具"
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', async function() {
	await loadManifest();
	initializeNavigation();
	showWelcomeContent();
});

// 加载文章清单（GitHub Pages 上优先自动模式；否则优先 manifest）
async function loadManifest() {
	const repoInfo = detectRepoFromLocation();
	if (repoInfo) {
		// GitHub Pages：优先尝试自动模式
		const auto = await tryBuildManifestAutomatically().catch(() => null);
		if (auto) {
			articlesManifest = auto;
			return;
		}
		console.warn('自动清单失败，回退到 manifest.json');
	}
	// 尝试读取 manifest.json
	try {
		const res = await fetch('doc/manifest.json');
		if (!res.ok) throw new Error('manifest load failed');
		const data = await res.json();
		if (!data || !data.categories) throw new Error('invalid manifest');
		articlesManifest = data;
		return;
	} catch (e) {
		console.warn('manifest.json 不可用:', e);
	}
	// 非 GitHub 或 manifest 失败：最后再尝试自动模式
	const auto = await tryBuildManifestAutomatically().catch(() => null);
	if (auto) {
		articlesManifest = auto;
	} else {
		console.error('无法加载文章清单。');
	}
}

// 自动构建清单（GitHub Pages 环境下，使用 GitHub API 扫描 doc 目录）
async function tryBuildManifestAutomatically() {
	const repoInfo = detectRepoFromLocation();
	if (!repoInfo) return null;
	const branch = await detectBranch(repoInfo).catch(() => null) || 'main';
	const tree = await fetchRepoTreeRecursive(repoInfo, branch);
	const files = tree.filter(node => node.type === 'blob' && node.path.startsWith('doc/') && node.path.toLowerCase().endsWith('.md'));
	const categories = {};
	for (const f of files) {
		const rel = f.path.substring('doc/'.length);
		const meta = parseMetaFromPath(rel);
		if (!categories[meta.category]) categories[meta.category] = [];
		const date = await fetchFileLastCommitDate(repoInfo, rel).catch(() => '');
		categories[meta.category].push({
			title: meta.title,
			date: date,
			category: meta.categoryDisplay,
			file: rel
		});
	}
	Object.keys(categories).forEach(k => {
		categories[k].sort((a, b) => String(b.date).localeCompare(String(a.date)));
	});
	return { version: String(Date.now()), categories };
}

// 从 host/path 推断仓库信息（仅支持 GitHub Pages）
function detectRepoFromLocation() {
	const host = (window.location && window.location.hostname) || '';
	const path = (window.location && window.location.pathname) || '/';
	if (!host.endsWith('github.io')) return null;
	const owner = host.split('.')[0];
	let repo = `${owner}.github.io`;
	const parts = path.split('/').filter(Boolean);
	if (parts.length >= 1) {
		const candidate = parts[0];
		if (candidate && candidate.toLowerCase() !== `${owner}.github.io`) {
			repo = candidate;
		}
	}
	return { owner, repo };
}

async function detectBranch(repo) {
	try {
		const r = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.repo}`);
		if (r.ok) {
			const j = await r.json();
			if (j && j.default_branch) return j.default_branch;
		}
	} catch {}
	for (const b of ['main', 'master', 'gh-pages']) {
		try {
			const r = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.repo}/branches/${b}`);
			if (r.ok) return b;
		} catch {}
	}
	return 'main';
}

async function fetchRepoTreeRecursive(repo, branch) {
	const br = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.repo}/branches/${branch}`);
	if (!br.ok) throw new Error('cannot read branch');
	const brj = await br.json();
	const sha = brj && brj.commit && brj.commit.sha;
	if (!sha) throw new Error('missing commit sha');
	const treeRes = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.repo}/git/trees/${sha}?recursive=1`);
	if (!treeRes.ok) throw new Error('cannot read tree');
	const tj = await treeRes.json();
	return (tj && tj.tree) || [];
}

// 从相对 doc/ 的路径中解析分类与标题
function parseMetaFromPath(relPath) {
	const parts = relPath.split('/');
	const base = parts[parts.length - 1];
	const name = base.replace(/\.md$/i, '');
	let category = 'uncategorized';
	let title = name;
	if (name.includes('-')) {
		const idx = name.indexOf('-');
		const prefix = name.slice(0, idx).toLowerCase();
		const rest = name.slice(idx + 1);
		category = prefix || (parts.length > 1 ? parts[0].toLowerCase() : 'uncategorized');
		title = rest || name;
	} else if (parts.length > 1) {
		category = parts[0].toLowerCase();
		title = name;
	}
	title = decodeURIComponent(title).replace(/[\-_]+/g, ' ').trim();
	if (title) title = title.charAt(0).toUpperCase() + title.slice(1);
	const categoryDisplay = category.toUpperCase();
	return { category, title, categoryDisplay };
}

async function fetchFileLastCommitDate(repo, relPathUnderDoc) {
	const url = `https://api.github.com/repos/${repo.owner}/${repo.repo}/commits?path=${encodeURIComponent('doc/' + relPathUnderDoc)}&per_page=1`;
	const r = await fetch(url);
	if (!r.ok) return '';
	const j = await r.json();
	const commit = Array.isArray(j) && j[0] && j[0].commit;
	const date = commit && (commit.author && commit.author.date);
	return date ? date.slice(0, 10) : '';
}

// 初始化导航
function initializeNavigation() {
	const categoryLinks = document.querySelectorAll('.category-group a');
	categoryLinks.forEach(link => {
		link.addEventListener('click', function(e) {
			e.preventDefault();
			const category = this.getAttribute('data-category');
			showCategory(category);
			categoryLinks.forEach(l => l.classList.remove('active'));
			this.classList.add('active');
		});
	});
}

// 显示分类内容
function showCategory(category) {
	const currentCategoryEl = document.getElementById('current-category');
	const categoryDescriptionEl = document.getElementById('category-description');
	const list = (articlesManifest.categories && articlesManifest.categories[category]) ? articlesManifest.categories[category] : [];
	currentCategoryEl.textContent = getCategoryTitle(category);
	categoryDescriptionEl.textContent = categoryDescriptions[category] || '该分类下的技术文章和教程';
	if (list.length > 0) {
		displayArticles(category, list);
	} else {
		showNoArticles(category);
	}
}

// 获取分类标题
function getCategoryTitle(category) {
	const titles = {
		pcb: "PCB设计技术",
		schematic: "原理图设计",
		layout: "布局布线设计",
		stm32: "STM32开发技术",
		arduino: "Arduino应用开发",
		esp32: "ESP32开发技术",
		pic: "PIC单片机开发",
		rtos: "实时操作系统",
		linux: "嵌入式Linux",
		freertos: "FreeRTOS应用",
		uart: "UART串口通信",
		i2c: "I2C总线通信",
		spi: "SPI通信协议",
		can: "CAN总线技术",
		temperature: "温度传感器应用",
		pressure: "压力传感器技术",
		motion: "运动传感器应用",
		ide: "开发环境配置",
		debug: "调试工具技巧",
		simulation: "仿真验证工具"
	};
	return titles[category] || "技术文章";
}

// 显示文章列表
function displayArticles(category, articleList) {
	const articleContainer = document.getElementById('article-container');
	let html = '<div class="article-list">';
	html += '<h3>文章列表</h3>';
	articleList.forEach((article, index) => {
		html += `
			<div class="article-item" onclick="showArticle('${category}', ${index})">
				<h4>${escapeHtml(article.title)}</h4>
				<div class="article-meta">
					<span class="date">${escapeHtml(article.date || '')}</span>
					<span class="category">${escapeHtml(article.category || '')}</span>
				</div>
				<p class="article-preview" id="preview-${category}-${index}">加载摘要中...</p>
			</div>
		`;
	});
	html += '</div>';
	articleContainer.innerHTML = html;
	fillPreviews(category, articleList);
}

async function fillPreviews(category, articleList) {
	for (let i = 0; i < articleList.length; i++) {
		const item = articleList[i];
		const previewEl = document.getElementById(`preview-${category}-${i}`);
		if (!previewEl) continue;
		try {
			const text = await fetchMarkdown(`doc/${item.file}`);
			const plain = markdownToPlainText(text);
			previewEl.textContent = plain.length > 100 ? (plain.substring(0, 100) + '...') : plain;
		} catch (e) {
			previewEl.textContent = '';
		}
	}
}

// 显示单篇文章
async function showArticle(category, index) {
	const list = (articlesManifest.categories && articlesManifest.categories[category]) ? articlesManifest.categories[category] : [];
	const meta = list[index];
	if (!meta) return;
	const articleContainer = document.getElementById('article-container');
	const template = document.getElementById('article-template');
	const articleElement = template.content.cloneNode(true);
	articleElement.querySelector('.article-title').textContent = meta.title || '';
	articleElement.querySelector('.article-date').textContent = meta.date || '';
	articleElement.querySelector('.article-category').textContent = meta.category || '';
	const contentElement = articleElement.querySelector('.article-content');
	contentElement.innerHTML = '<p>加载中...</p>';
	articleContainer.innerHTML = '';
	articleContainer.appendChild(articleElement);
	addBackButton(category);
	try {
		const md = await fetchMarkdown(`doc/${meta.file}`);
		contentElement.innerHTML = marked.parse(md);
		Prism.highlightAllUnder(contentElement);
	} catch (e) {
		contentElement.innerHTML = '<p>文章加载失败，请稍后重试。</p>';
	}
}

// 获取Markdown文本
async function fetchMarkdown(path) {
	const res = await fetch(path + `?v=${encodeURIComponent((articlesManifest.version || '1') + '-' + path)}`);
	if (!res.ok) throw new Error('md load failed: ' + path);
	return await res.text();
}

// 添加返回按钮
function addBackButton(category) {
	const backButton = document.createElement('button');
	backButton.className = 'back-button';
	backButton.innerHTML = '← 返回文章列表';
	backButton.onclick = () => showCategory(category);
	const articleContainer = document.getElementById('article-container');
	articleContainer.insertBefore(backButton, articleContainer.firstChild);
}

// 显示无文章提示
function showNoArticles(category) {
	const articleContainer = document.getElementById('article-container');
	articleContainer.innerHTML = `
		<div class="no-articles">
			<h3>暂无文章</h3>
			<p>该分类下暂时没有文章，敬请期待！</p>
			<p>你可以：</p>
			<ul>
				<li>查看其他分类的文章</li>
				<li>稍后再来访问</li>
				<li>联系作者投稿</li>
			</ul>
		</div>
	`;
}

// 显示欢迎内容
function showWelcomeContent() {
	// 默认显示欢迎内容，已在HTML中定义
}

// Markdown 转纯文本（用于摘要）
function markdownToPlainText(markdown) {
	const div = document.createElement('div');
	div.innerHTML = marked.parse(markdown || '');
	const text = div.textContent || div.innerText || '';
	return text.replace(/\s+/g, ' ').trim();
}

// 简单HTML转义
function escapeHtml(str) {
	return String(str || '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

// 追加样式
const additionalStyles = `
	.article-list h3 { font-size: 24px; color: #2c3e50; margin-bottom: 25px; padding-bottom: 10px; border-bottom: 2px solid #e9ecef; }
	.article-item { background: white; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin-bottom: 20px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
	.article-item:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.1); border-color: #667eea; }
	.article-item h4 { font-size: 20px; color: #2c3e50; margin-bottom: 10px; font-weight: 600; }
	.article-item .article-meta { display: flex; gap: 15px; margin-bottom: 15px; font-size: 14px; color: #6c757d; }
	.article-item .article-preview { color: #495057; line-height: 1.6; margin: 0; }
	.back-button { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 14px; margin-bottom: 20px; transition: all 0.3s ease; }
	.back-button:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.2); }
	.no-articles { text-align: center; padding: 60px 20px; color: #6c757d; }
	.no-articles h3 { font-size: 24px; color: #2c3e50; margin-bottom: 20px; }
	.no-articles ul { list-style: none; margin: 20px 0; padding: 0; }
	.no-articles li { padding: 8px 0; border-bottom: 1px solid #e9ecef; }
	.no-articles li:last-child { border-bottom: none; }
	.category-group a.active { background-color: rgba(255, 255, 255, 0.2); color: white; transform: translateX(5px); }
`;
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);
