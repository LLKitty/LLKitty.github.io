# 嵌入式开发技术博客

一个专为嵌入式开发技术分享而设计的现代化博客网站，支持Markdown文章和分类导航。

## 功能特性

### 🎯 核心功能
- **分类导航**: 左侧边栏提供完整的嵌入式开发技术分类
- **文章管理**: 支持Markdown格式的技术文章
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

### ✨ 特色功能
- **Markdown支持**: 完整的Markdown语法支持
- **代码高亮**: C/C++、Python等语言的语法高亮
- **文章预览**: 智能文章摘要生成
- **分类描述**: 每个分类都有详细的技术说明
- **平滑动画**: 优雅的页面切换和悬停效果

## 文件结构

```
LLKitty.github.io/
├── index.html          # 主页面文件
├── styles.css          # 样式文件
├── script.js           # JavaScript功能文件
└── README.md           # 说明文档
```

## 使用方法

### 1. 基本使用
1. 直接在浏览器中打开 `index.html` 文件
2. 点击左侧分类导航浏览不同技术领域
3. 点击文章标题阅读完整内容
4. 使用返回按钮回到文章列表

### 2. 添加新文章
在 `script.js` 文件中的 `articles` 对象中添加新文章：

```javascript
const articles = {
    // 在现有分类中添加新文章
    stm32: [
        // 现有文章...
        {
            title: "新文章标题",
            date: "2024-01-25",
            category: "STM32",
            content: `
# 新文章内容

## 使用Markdown语法

\`\`\`c
// 代码示例
void example() {
    // 你的代码
}
\`\`\`
            `
        }
    ]
};
```

### 3. 添加新分类
1. 在HTML中添加分类链接
2. 在CSS中添加分类样式
3. 在JavaScript中添加分类描述和文章

## 技术实现

### 前端技术
- **HTML5**: 语义化标签和模板系统
- **CSS3**: Flexbox布局、Grid布局、渐变、动画
- **JavaScript ES6+**: 模块化代码、事件处理、DOM操作

### 第三方库
- **Marked.js**: Markdown解析器
- **Prism.js**: 代码语法高亮
- **CDN资源**: 在线加载，无需本地安装

### 设计特点
- **响应式布局**: 使用Flexbox和Grid实现
- **现代化设计**: 渐变背景、阴影效果、悬停动画
- **用户体验**: 平滑的页面切换和交互反馈

## 自定义配置

### 修改颜色主题
在 `styles.css` 中修改CSS变量：

```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --text-color: #2c3e50;
    --background-color: #f8f9fa;
}
```

### 修改分类结构
在 `index.html` 中调整分类导航：

```html
<div class="category-group">
    <h3>新分类名称</h3>
    <ul>
        <li><a href="#" data-category="new-category">子分类</a></li>
    </ul>
</div>
```

### 添加新的代码语言支持
在HTML中添加Prism.js语言包：

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-java.min.js"></script>
```

## 浏览器兼容性

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ⚠️ IE 11 (部分功能可能不支持)

## 部署说明

### GitHub Pages部署
1. 将文件推送到GitHub仓库
2. 在仓库设置中启用GitHub Pages
3. 选择主分支作为源
4. 访问生成的网站链接

### 本地部署
1. 使用本地Web服务器（如Live Server）
2. 或直接双击 `index.html` 文件在浏览器中打开

### 在线部署
1. 上传到任何支持静态网站的托管服务
2. 如Netlify、Vercel、阿里云OSS等

## 扩展功能建议

### 功能增强
- [ ] 文章搜索功能
- [ ] 文章标签系统
- [ ] 评论系统
- [ ] 文章分享功能
- [ ] 暗色主题切换

### 内容管理
- [ ] 文章编辑器
- [ ] 图片上传功能
- [ ] 文章版本控制
- [ ] 多语言支持

### 性能优化
- [ ] 图片懒加载
- [ ] 代码分割
- [ ] 缓存策略
- [ ] PWA支持

## 贡献指南

欢迎提交Issue和Pull Request来改进这个项目！

### 贡献方式
1. Fork项目仓库
2. 创建功能分支
3. 提交代码更改
4. 创建Pull Request

### 代码规范
- 使用有意义的变量和函数名
- 添加必要的注释
- 保持代码结构清晰
- 遵循现有的代码风格

## 许可证

本项目采用MIT许可证，详见LICENSE文件。

## 联系方式

如有问题或建议，请通过以下方式联系：
- 提交GitHub Issue
- 发送邮件至：[your-email@example.com]

---

**享受你的嵌入式开发技术分享之旅！** 🚀
