# 开发记录

一个专为嵌入式开发技术分享而设计的现代化博客网站，支持Markdown文章和分类导航。

## 文章存放与加载（重要）

- 所有文章以 Markdown 文件形式存放在 `doc/` 目录下。
- 页面支持两种模式加载文章：
  1) 自动清单模式（推荐，GitHub Pages 环境）：前端在运行时通过 GitHub API 扫描 `doc/`，自动生成清单；无需维护 `manifest.json`。
  2) 手动清单模式（本地/离线预览）：使用 `doc/manifest.json` 维护文章清单与分类。

### 自动清单模式（无需手写 manifest.json）

- 触发条件：当页面无法加载 `doc/manifest.json` 时，会自动切换到“自动清单模式”。
- 执行环境：需要在 GitHub Pages（`*.github.io`）上访问，脚本会通过 GitHub 公共 API 扫描仓库的 `doc/` 目录。
- 分类与标题规则：
  - 文件名形如 `pcb-xxxx.md` → 分类为 `pcb`，标题取 `xxxx`，并将 `-/_` 转为空格、首字母大写。
  - 若为子目录：`doc/pcb/xxxx.md` → 分类回退为目录名 `pcb`，标题为 `xxxx`（同样美化）。
- 日期：取该文件的最后一次提交时间（UTC，格式 `YYYY-MM-DD`）。
- 排序：同一分类内按日期倒序显示。
- 速率限制：GitHub 公共 API 对未授权请求有速率限制（约 60 次/小时/源IP）。文章很多时首次加载可能稍慢或遇到限制；如需更稳定，可保留 `doc/manifest.json` 手动模式。

### 手动清单模式（可选）

- 清单示例：
```json
{
  "version": "1.0.0",
  "categories": {
    "stm32": [
      { "title": "STM32入门指南：从零开始学习", "date": "2024-01-20", "category": "STM32", "file": "stm32-getting-started.md" }
    ]
  }
}
```

#### 添加/修改文章步骤（手动模式）

1. 在 `doc/` 目录新增一个 `.md` 文件，例如：`stm32-uart.md`。
2. 在 `doc/manifest.json` 对应分类里增加一条记录：
   - `title`: 文章标题
   - `date`: 日期（YYYY-MM-DD）
   - `category`: 分类显示名（例如 STM32、PCB设计）
   - `file`: 刚添加的 Markdown 文件名（相对 `doc/` 的路径）
3. 刷新页面即可看到更新（GitHub Pages 可能有缓存，稍等或改动 `version` 字段强制刷新）。

> 注意：因为浏览器安全策略，直接双击打开 `index.html` 加载本地文件时，`fetch` 可能被拦截。建议使用本地服务器（如 VSCode Live Server）或部署到 GitHub Pages 访问。若本地预览且无法使用 GitHub API，请使用手动清单模式。

## 功能特性

### 🎯 核心功能
- **分类导航**: 左侧边栏提供完整的嵌入式开发技术分类
- **文章管理**: 支持Markdown格式的技术文章（从 `doc/` 动态加载）
- **代码高亮**: 集成Prism.js，支持多种编程语言的语法高亮
- **响应式设计**: 适配桌面和移动设备
- **现代化UI**: 美观的渐变色彩和动画效果

### 📚 技术分类
- **硬件设计**: PCB设计、原理图设计、布局布线
- **单片机开发**: STM32、Arduino、ESP32、PIC单片机
- **嵌入式系统**: RTOS、嵌入式Linux、FreeRTOS
- **通信协议**: UART、I2C、SPI、CAN总线
- **传感器应用**: 温度、压力、运动传感器
- **开发工具**: IDE、调试工具、仿真工具

## 文件结构

```
LLKitty.github.io/
├── index.html          # 主页面文件
├── styles.css          # 样式文件
├── script.js           # 前端逻辑：优先自动清单，失败时读取 manifest.json
└── doc/
    ├── manifest.json   # 文章清单（可选；自动模式下可不提供）
    ├── pcb-basic.md
    ├── pcb-impedance.md
    ├── stm32-getting-started.md
    ├── stm32-timer.md
    ├── arduino-iot.md
    └── uart-overview.md
```

## 部署说明（含本地预览）

- 本地预览：使用开发服务器（如 VSCode Live Server、`python -m http.server` 等）；若无法访问 GitHub API，请提供 `doc/manifest.json`。
- GitHub Pages：推送到仓库并在 Settings → Pages 启用即可（推荐自动清单模式）。

## 自定义与扩展

- 在 `index.html` 左侧导航添加/调整分类项，并通过文件命名或子目录实现自动归类。
- 需要更多代码语言高亮时，在 `index.html` 中增加 Prism.js 对应语言包脚本。

---

**享受你的嵌入式开发技术分享之旅！** 🚀
