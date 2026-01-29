# 人生大事 - Life Events

一个简洁优雅的个人生平事迹记录应用，帮助您以时间轴的形式记录人生中的里程碑事件。

Version: 1.0.0

## 功能特点

- 📝 记录人生大事（标题、日期、描述、照片）
- 📅 时间轴展示（按年份分组，垂直时间线）
- 📷 单张照片上传
- ✏️ 编辑和删除事件
- 🔐 用户认证（邮箱+密码）
- 📱 手机端优化
- 🎨 简洁现代的界面设计

## 技术栈

- **前端框架**: Next.js 14 (React)
- **样式**: Tailwind CSS
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **存储**: Supabase Storage (支持未来切换到七牛云/阿里云OSS)
- **部署**: Vercel

## 部署步骤

### 1. 准备工作

需要注册以下账号（都是免费的）：
- GitHub 账号（用于代码托管和 Vercel 部署）
- Supabase 账号（数据库和存储）
- Vercel 账号（部署和托管）

### 2. 设置 Supabase

#### 2.1 创建项目
1. 访问 [https://supabase.com](https://supabase.com)
2. 注册/登录账号
3. 点击 "New Project"
4. 填写项目信息：
   - Name: life-events
   - Database Password: 设置一个强密码（记住这个密码）
   - Region: 选择离您最近的区域（建议选择 Singapore）
5. 点击 "Create new project"，等待项目创建完成（约2分钟）

#### 2.2 运行数据库脚本
1. 在 Supabase 项目页面，点击左侧菜单的 "SQL Editor"
2. 点击 "New Query"
3. 将本项目中的 `supabase-schema.sql` 文件的全部内容复制粘贴到编辑器中
4. 点击右下角的 "Run" 按钮执行脚本
5. 如果显示 "Success. No rows returned"，说明执行成功

#### 2.3 获取 API 密钥
1. 点击左侧菜单的 "Project Settings"（齿轮图标）
2. 点击左侧的 "API"
3. 找到以下信息并复制保存：
   - **Project URL**: 类似 `https://xxxxx.supabase.co`
   - **anon public** key: 一长串字符串

### 3. 将代码上传到 GitHub

#### 3.1 创建 GitHub 仓库
1. 访问 [https://github.com](https://github.com)
2. 登录后点击右上角的 "+" → "New repository"
3. 填写仓库信息：
   - Repository name: life-events
   - 选择 Public 或 Private
4. 点击 "Create repository"

#### 3.2 上传代码
在本地项目目录中执行以下命令（您的技术朋友可以帮您）：

```bash
cd /home/fanwenjie/life-events
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/life-events.git
git push -u origin main
```

### 4. 部署到 Vercel

#### 4.1 连接 GitHub
1. 访问 [https://vercel.com](https://vercel.com)
2. 注册/登录账号（建议用 GitHub 账号登录）
3. 点击 "Add New..." → "Project"
4. 点击 "Import Git Repository"
5. 选择您刚才创建的 `life-events` 仓库
6. 点击 "Import"

#### 4.2 配置环境变量
1. 在 "Configure Project" 页面，展开 "Environment Variables"
2. 添加以下两个环境变量：
   - **Name**: `NEXT_PUBLIC_SUPABASE_URL`
     - **Value**: 粘贴您在步骤 2.3 中复制的 Project URL
   - **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - **Value**: 粘贴您在步骤 2.3 中复制的 anon public key
3. 点击 "Deploy"

#### 4.3 等待部署完成
- 部署大约需要 2-3 分钟
- 完成后会显示 "Congratulations!" 页面
- 点击页面上的链接或访问域名即可使用您的应用

### 5. 使用应用

1. 打开 Vercel 提供的域名（类似 `https://life-events-xxxxx.vercel.app`）
2. 点击"还没账号？立即注册"
3. 输入邮箱、密码（密码至少6位）、确认密码
4. 点击"注册"按钮，注册成功后会自动登录并跳转到时间轴页面
5. 开始记录您的人生大事！

**注意**：为了简化使用流程，本应用已关闭邮箱验证功能，注册后可直接使用。

## 本地开发（可选）

如果您想在本地运行项目进行开发：

```bash
# 安装依赖
npm install

# 创建环境变量文件
cp .env.local.example .env.local
# 编辑 .env.local，填入您的 Supabase 配置

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

## 存储服务切换

本项目已实现存储抽象层，未来可以轻松切换到七牛云或阿里云 OSS：

1. 打开 `/lib/storage.ts`
2. 找到 `getStorageService()` 函数
3. 取消注释对应的存储服务实现，并注释掉 Supabase 的实现
4. 在 `.env.local` 中添加对应的云服务配置
5. 重新部署

## 常见问题

### Q: 如何关闭邮箱验证功能？
A: 在 Supabase 项目设置中关闭邮箱确认：
- 进入 Supabase 项目
- Authentication → Providers → Email
- 关闭 "Confirm email" 开关并保存

**重要**：必须关闭邮箱验证功能，否则用户注册后无法登录。

### Q: 照片上传失败？
A: 确保：
1. 照片大小不超过 5MB
2. 格式是 JPG 或 PNG
3. Supabase 存储桶已正确创建（运行了 SQL 脚本）

### Q: 如何更新应用？
A: 修改代码后：
1. 将代码提交到 GitHub
2. Vercel 会自动检测更新并重新部署
3. 用户访问时自动获取最新版本（无需手动更新）

### Q: 如何自定义域名？
A: 在 Vercel 项目设置中：
1. 进入 "Settings" → "Domains"
2. 添加您的域名
3. 按提示配置 DNS 记录

## 成本说明

- **Supabase 免费额度**:
  - 500MB 数据库存储
  - 1GB 文件存储
  - 2GB 带宽/月
  - 适合 10-50 个活跃用户

- **Vercel 免费额度**:
  - 100GB 带宽/月
  - 无限次部署
  - 自动 HTTPS

对于您的使用场景（10 个用户），完全免费够用。

## 支持

如有问题，请联系您的技术朋友或查看：
- Next.js 文档: https://nextjs.org/docs
- Supabase 文档: https://supabase.com/docs
- Vercel 文档: https://vercel.com/docs

## 许可证

MIT
