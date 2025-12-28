<p align="center">
    <img src='/public/icons/android-chrome-192x192.png' />
</p>

<p align="center">
    <a href="https://www.github.com/srsman/PPTist/stargazers" target="_black">
        <img src="https://img.shields.io/github/stars/srsman/PPTist?logo=github" alt="stars" />
    </a>
    <a href="https://www.github.com/srsman/PPTist/network/members" target="_black">
        <img src="https://img.shields.io/github/forks/srsman/PPTist?logo=github" alt="forks" />
    </a>
    <a href="https://www.github.com/srsman/PPTist/blob/master/LICENSE" target="_black">
        <img src="https://img.shields.io/github/license/srsman/PPTist?color=%232DCE89&logo=github" alt="license" />
    </a>
    <a href="https://www.typescriptlang.org" target="_black">
        <img src="https://img.shields.io/badge/language-TypeScript-blue.svg" alt="language">
    </a>
    <a href="https://github.com/srsman/PPTist/issues" target="_black">
        <img src="https://img.shields.io/github/issues-closed/srsman/PPTist.svg" alt="issue">
    </a>
</p>

---

# 🎨 PPTist

<details open>
<summary><b>简体中文</b></summary>

> 一个基于 Vue3.x + TypeScript 的在线演示文稿（幻灯片）应用，还原了大部分 Office PowerPoint 常用功能，力求还原桌面应用级体验。支持导出本地 PPTX 文件，支持移动端基础编辑和预览。

## 🆕 核心新增：模板服务器 (Template Server)

本项目现已全面升级，新增了**高性能服务器端模板存储**功能，实现了真正的全平台协同。

### 🚀 亮点功能
- **协同共享**：一处设置，全端同步。支持跨设备共享默认模板。
- **安全加固**：模板操作（设置/修改/清除）均受 SHA-256 加密验证保护。
-- **极简部署**：支持前后端一键启动，内置生产级 Express 静态服务。

### 🛠️ 快速开始

**推荐：一键启动（开发环境）**
```bash
# 1. 安装项目所有依赖
npm install
cd server && npm install && cd ..

# 2. 启动全栈服务 (Frontend + Backend)
npm run dev:all
```
*访问地址：[http://localhost:5173](http://localhost:5173)*

**生产环境部署**
```bash
# 构建并启动
npm run build
npm start
```
*访问地址：[http://localhost:3000](http://localhost:3000)*

---

## 📚 核心文档
- 📖 [前后端整合说明](INTEGRATION_SUCCESS.md) - 架构与通信机制深度解析
- 📖 [功能使用指南](TEMPLATE_SERVER_README.md) - 重点介绍模板服务器操作
- 📖 [部署手册](DEPLOYMENT.md) - 包含 Docker 及多种环境配置

---

## 👀 功能亮点
### 1. 幻灯片编辑
- **全要素支持**：文字（富文本）、图片、形状、线条、图表、表格、视频、音频、公式。
- **极致体验**：支持历史记录、快捷键、右键菜单、吸附对齐、层级调整、元素组合。
- **媒体处理**：图片滤镜、裁剪（按形状）、视频封底设置。
- **高级动效**：丰富的入场/强调/退场动画，多种页面翻页转场。

### 2. 生态与集成
- **导出能力**：支持导出 PPTX、JSON、图片、PDF 及特有的 `.pptist` 格式。
- **演示模式**：演讲者视图、画笔工具、黑板、计时器、激光笔、自动放映。
- **移动端适配**：支持移动端基础编辑、备注查看及播放预览。

---

## 🎯 开发者指南
- [项目目录与数据结构](/doc/DirectoryAndData.md)
- [画布与元素的基本原理](/doc/Canvas.md)
- [如何自定义一个元素](/doc/CustomElement.md)

---

## ⚖️ 开源与版权
本项目的模板服务器增强功能遵循 **AGPL-3.0 协议**。
- [AGPL-3.0 License](/LICENSE) | Copyright © 2020-PRESENT [pipipi-pikachu](https://github.com/pipipi-pikachu)

### 🧮 商业用途
- 若需闭源商用，请参考[商业用途详细说明](#-商业用途)或使用早期的 Apache 2.0 版本。

</details>

<details>
<summary><b>English</b></summary>

> A web-based presentation application built with Vue3.x and TypeScript, replicating most features of MS PowerPoint with a desktop-like experience.

## 🆕 New: Template Server

The project now includes **server-side template storage** for cross-device synchronization.

### 🚀 Key Features
- **Cloud Sync**: Share default templates across all your devices.
- **Security**: Password protection with SHA-256 encryption for template management.
- **Smart Networking**: Automatic adaptation to localhost and IP-based access.
- **Unified Stack**: Integrated frontend and backend with single-command startup.

### 🛠️ Quick Start

**Standard Launch (Recommended)**
```bash
npm install
cd server && npm install && cd ..
npm run dev:all
```
*Access: [http://localhost:5173](http://localhost:5173)*

### 📚 Documentation
- 📖 [User Guide](TEMPLATE_SERVER_README.md)
- 📖 [Deployment Manual](DEPLOYMENT.md)

---

## 📄 License
[AGPL-3.0 License](https://github.com/pipipi-pikachu/PPTist/blob/master/LICENSE) | Copyright © 2020-PRESENT [pipipi-pikachu](https://github.com/pipipi-pikachu)

</details>
