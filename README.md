# ⚡ EZ EDGE CMS (Multilingual Fork)

> 📌 This repository is a fork of [**ez-edge-cms**](https://github.com/Evgenii-Zinner/ez-edge-cms) by [Evgenii Zinner](https://ezinner.com), enhanced with **multilingual (i18n) support**.

[![codecov](https://codecov.io/github/Evgenii-Zinner/ez-edge-cms/graph/badge.svg?token=UHCN0CJZ1W)](https://codecov.io/github/Evgenii-Zinner/ez-edge-cms)

**EZ EDGE CMS** is a high-performance, edge-native Content Management System and Design System built for the Cloudflare global network. By leveraging Cloudflare Workers and KV storage, it provides sub-50ms response times with zero cold starts and eliminates the need for complex build pipelines or traditional server maintenance.

### 🆕 Enhancements in This Fork

This fork builds upon the upstream EZ EDGE CMS with the following additions:

- **Multilingual Navigation & Footer**: Admin panel supports entering labels for navbar and footer links in all supported languages; the front-end automatically displays the correct label based on the visitor's locale.
- **Localized Content**: Pages, site metadata, and navigation items all support per-language strings, stored compactly as either plain strings or multi-language records (`{ [locale]: string }`).
- **Locale-Aware Routing**: URL paths are automatically prefixed with the current locale (e.g., `/zh/blog`), and the site respects locale switching via `Accept-Language` headers and manual selection.

I'm using it in my personal website [![www.zhangshifeng.com](https://www.zhangshifeng.com)](https://www.zhangshifeng.com), which is fully multilingual and powered by this fork.

== About the EZ EDGE CMS ==

**🚀 Go from zero to a live, working website in under 2 minutes.**

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Evgenii-Zinner/ez-edge-cms)

---

## 🌟 Core Architecture

EZ EDGE CMS operates on the principle that the network edge should handle both logic and data. This approach solves the trade-offs between static site generation speed and traditional dynamic CMS flexibility.

- **Zero Build Latency**: Content updates and configuration changes are reflected globally across the edge instantly, bypassing long CI/CD build queues.
- **Isolate-Optimized**: Engineered with isolate-level in-memory caching and native Web APIs to maximize efficiency and minimize execution costs.
- **Programmatic Design System**: A HSL-driven visual engine allows for full brand identity shifts through simple configuration overrides.

---

## 🛠️ Technology Stack

The project utilizes a focused stack of lightweight, modern web technologies:

- **[Hono](https://hono.dev/)**: Ultra-fast web framework optimized for edge environments.
- **[Cloudflare KV](https://www.cloudflare.com/products/workers-kv/)**: Low-latency global key-value storage for content persistence.
- **[UnoCSS](https://unocss.dev/)**: On-demand atomic CSS engine featuring high-performance isolate caching.
- **[HTMX](https://htmx.org/)**: Enables a responsive, SPA-like Administrative HUD with minimal client-side overhead.
- **[Editor.js](https://editorjs.io/)**: A block-based semantic editor providing a modern content creation experience.

---

## ✨ System Features

- **High-Performance SSR**: Fast Server-Side Rendering delivered from the nearest global point of presence.
- **Native Authentication**: Secure session management using WebCrypto API with salt-based hashing; no external providers required.
- **Schema-First Data**: Strict runtime validation using **Zod** ensures data integrity across all KV operations.
- **Data Portability**: Integrated backup and restore functionality for full site configurations and content snapshots.
- **Compliance Management**: Native tools for managing root-level metadata files like `robots.txt`, `ads.txt`, and `llms.txt`.
- **Ultra-Fast Deployment**: Designed for ease of use with zero-configuration setup for a complete website in minutes.

## 🚀 Why EZ EDGE CMS?

If you are looking for an **easy website install** that doesn't require a PhD in DevOps, this is for you. EZ EDGE CMS is designed to be the **fastest no-code CMS** for the modern web.

- **Completely Free**: Run your entire website for free for up to **100,000 visitors per month** by leveraging the Cloudflare Workers free tier.
- **Fastest Deployment**: Go from a blank screen to a professional website in under 2 minutes.
- **No-Code Admin**: Manage your content, theme, and navigation through a sleek, intuitive dashboard—no coding required.
- **Global Speed**: Your site is served from 300+ Cloudflare data centers, ensuring your visitors get sub-50ms response times everywhere.
- **Edge-Native**: No databases to manage, no servers to patch. It just works.

---

## 🚀 Quick Start

### Method 1: Instant Deployment (Fastest)

Deploy the CMS directly to your Cloudflare account using the automated setup button:

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Evgenii-Zinner/ez-edge-cms)

---

### Method 2: Fork & Sync (Recommended for Updates)

**Forking** is the recommended way to maintain your CMS. It allows you to receive core updates from the upstream repository while keeping your unique configurations and content intact.

1. Click the **Fork** button at the top right of this repository.
2. Log into your [**Cloudflare Dashboard**](https://dash.cloudflare.com/?to=account.workers-and-pages).
3. Select **Add** > **Workers** > **Continue with GitHub**.
4. Choose your forked repository. Cloudflare will now deploy your site automatically on every push.

Check out the [**Update Guide**](UPDATE.md) for more details on keeping your CMS up to date.

---

### Method 3: CLI Deployment (Advanced)

For local development and manual deployment control:

#### 1. Environment Setup

Clone the repository and install dependencies:

```bash
git clone https://github.com/anatoliyzhang/zhangshifeng-com.git
cd zhangshifeng-com
bun install
```

#### 2. Local Development

Run the development server to simulate the Cloudflare edge environment:

```bash
bun run dev
```

#### 3. Cloudflare Authentication

Before deploying for the first time, authenticate the CLI with your Cloudflare account:

```bash
bunx wrangler login
```

#### 4. Deploy to Production

Deploy the application to the global network:

```bash
bun run deploy
```

---

## 🤝 Contributing

Contributions are welcome. Please refer to the [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) for community standards and development workflows.

---

## ⚖️ License

Distributed under the **MIT License**. See `LICENSE.md` for more information.

_Built with 🔥 by [Evgenii Zinner](https://ezinner.com)._