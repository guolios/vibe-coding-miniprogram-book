<div align="center">

<img src="assets/cover.svg" alt="Vibe Coding 微信小程序全流程指南" width="720">

# Vibe Coding 微信小程序全流程指南

**零基础 · 用 AI 从想法到上线**

一本写给「完全不懂技术的人」的微信小程序实战指南：借助任意 AI 编程工具
（Cursor、Claude Code、GitHub Copilot、WorkBuddy… 任选），
把一个想法变成线上运行的微信小程序——覆盖需求、开发、部署、注册、认证、备案、
收款、云服务、提审、上线、迭代、维护全流程。

[📖 在线阅读](https://guolios.github.io/vibe-coding-miniprogram-book/) · [📄 整本 Markdown](docs/00-导读.md) · [🐛 反馈问题](https://github.com/guolios/vibe-coding-miniprogram-book/issues)

</div>

---

## ✨ 这本书适合谁

- 完全不懂编程，但想做一个自己的微信小程序
- 会提需求、能验收，不想被术语淹没
- 想了解小程序从注册到上线的完整「地图」与真实成本

## 📚 内容结构

全书共 **11 章 + 2 个速查附录**，约 2.9 万字，按章节拆分为独立 Markdown 文件：

| 章节 | 内容 |
| --- | --- |
| [导读](docs/00-导读.md) | 这本书怎么用 · 规则时效声明 |
| [第一章](docs/01-认识vibe-coding与微信小程序.md) | 认识 vibe coding 与微信小程序 |
| [第二章](docs/02-把需求想清楚.md) | 阶段一：把需求想清楚 |
| [第三章](docs/03-注册认证备案与收款.md) | 阶段二：注册、认证、备案、收款 |
| [第四章](docs/04-开发让AI写代码.md) | 阶段三：开发，让 AI 写代码 |
| [第五章](docs/05-部署微信云服务.md) | 阶段四：部署微信云服务 |
| [第六章](docs/06-提审与上线.md) | 阶段五：提审与上线 |
| [第七章](docs/07-迭代与运营.md) | 阶段六：迭代与运营 |
| [第八章](docs/08-维护与风控.md) | 阶段七：维护与风控 |
| [第九章](docs/09-费用与时间总账.md) | 费用与时间总账 |
| [第十章](docs/10-常见问题FAQ.md) | 常见问题 FAQ |
| [附录一](docs/附录一-小程序规范速查手册.md) | 小程序规范速查手册 |
| [附录二](docs/附录二-AI编程工具开发小程序速查.md) | AI 编程工具速查（含工具选型与官方 Skills） |

## 🗂️ 仓库结构

```
├── docs/                 # 全书章节（单一事实源，按章节拆分）
├── tools/build_data.py   # 构建脚本：docs/*.md → assets/data.js
├── assets/
│   ├── style.css         # 站点样式（浅/暗双主题）
│   ├── app.js            # 站点逻辑（hash 路由 / 目录 / 搜索）
│   └── data.js           # 由构建脚本生成（勿手改）
├── index.html            # 站点入口
└── .nojekyll             # 跳过 Jekyll，直接发布静态文件
```

## 🛠️ 本地构建与预览

```bash
# 生成 assets/data.js（依赖：pip install markdown）
python3 tools/build_data.py

# 本地预览（任选其一）
python3 -m http.server 8000
# 打开 http://localhost:8000
```

## ⚠️ 规则时效声明

小程序平台规则（认证费用、备案时限、支付政策、云服务计费）更新频繁，
本书内容基于 **2026 年 10 月** 的公开信息整理，关键规则均已在文中标注出处与时效。
**动手前请以微信官方平台（mp.weixin.qq.com）最新公告为准。**

## 📄 许可证

内容采用 [CC BY 4.0](LICENSE) 许可——你可以自由分享和改编，注明出处即可。
