# 图标说明

## 已创建的图标

项目中已包含基础 SVG 图标：
- `/public/icon.svg` - 深蓝色圆形背景，白色时间线图案

这个图标会显示在：
- 浏览器标签页
- 手机添加到主屏幕时

## 生成高质量 PNG 图标

为了更好的兼容性，建议生成 PNG 格式的图标：

### 方案 1：在线工具（推荐）

1. 访问 [https://realfavicongenerator.net](https://realfavicongenerator.net)
2. 上传 `/public/icon.svg` 文件
3. 按照提示调整各平台图标
4. 下载生成的图标包
5. 将以下文件放到 `/public/` 目录：
   - `icon-192.png` (192x192)
   - `icon-512.png` (512x512)
   - `favicon.ico`
   - `apple-touch-icon.png`

### 方案 2：使用设计工具

如果您想要更精美的图标，可以：
1. 找设计师设计一个图标
2. 要求提供以下尺寸的 PNG 文件：
   - 192x192 像素（命名为 `icon-192.png`）
   - 512x512 像素（命名为 `icon-512.png`）
   - 180x180 像素（命名为 `apple-touch-icon.png`）
3. 将文件放到 `/public/` 目录

### 方案 3：使用 AI 生成图标

可以用 AI 工具（如 Midjourney、DALL-E）生成：
- 提示词示例："A minimalist app icon for a life timeline app, featuring a vertical timeline with milestone dots, clean modern design, deep blue and white color scheme, flat design"

## PWA 功能

项目已配置 PWA（渐进式 Web 应用），用户可以：
- 在手机浏览器打开网站
- 点击"添加到主屏幕"
- 像原生 APP 一样使用

## 图标设计建议

如果要定制图标，建议：
- **主色调**：深蓝色 #1E40AF（与 APP 配色一致）
- **图案**：时间线、里程碑、日历等相关元素
- **风格**：简洁现代，扁平化设计
- **形状**：圆形或圆角矩形
- **对比度**：确保在白色和深色背景下都清晰可见
