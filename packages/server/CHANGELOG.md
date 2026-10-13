## 0.5.0 (2026-10-13)

### 🧱 Updated Dependencies

- Updated @roomcast/shared to 0.5.0

## 0.4.0 (2026-10-13)

### 🧹 Chores

- Remove TypeScript dependency from client, server, and shared packages ([ccc4e8c](https://github.com/MaxiGarcia13/roomcast/commit/ccc4e8c))

### 🧱 Updated Dependencies

- Updated @roomcast/shared to 0.4.0

### ❤️ Thank You

- Maximiliano Garcia Mortigliengo

## 0.3.0 (2026-10-13)

### 🚀 Features

- Initialize @roomcast/client with core components, routing, and file sharing functionality ([c7a48e0](https://github.com/MaxiGarcia13/roomcast/commit/c7a48e0))

### 🧱 Updated Dependencies

- Updated @roomcast/shared to 0.3.0

### ❤️ Thank You

- Maximiliano Garcia Mortigliengo

## 0.2.0 (2026-10-13)

### 🧱 Updated Dependencies

- Updated @roomcast/shared to 0.2.0

## 0.1.0 (2026-10-13)

### 🚀 Features

- Revamp server structure by removing legacy files, implementing Fastify for HTTP handling, and adding WebSocket signaling support, enhancing performance and maintainability. Update changelog for version 0.0.0 with initial setup details. ([9a633c6](https://github.com/MaxiGarcia13/roomcast/commit/9a633c6))
- Refactor server architecture to integrate signaling and HTTP handling in a single process, enhancing deployment simplicity and updating documentation for clarity on usage and commands. ([02a0582](https://github.com/MaxiGarcia13/roomcast/commit/02a0582))

### 🔄 Refactors

- Rename project from Cast Local to Roomcast, updating all relevant documentation, package names, and imports to reflect the new branding. ([5345ada](https://github.com/MaxiGarcia13/roomcast/commit/5345ada))
- Restructure server initialization by encapsulating logic in a main function, improving readability and maintainability. Ensure proper handling of production and development environments for static file serving and health checks. ([4a58a70](https://github.com/MaxiGarcia13/roomcast/commit/4a58a70))

### 🧹 Chores

- Update TypeScript build configuration to specify root directory and ensure output directory settings are clear, enhancing build process consistency. ([4ef59ac](https://github.com/MaxiGarcia13/roomcast/commit/4ef59ac))
- Update TypeScript target version to ES2024 across all configuration files for improved compatibility and features. ([2f5a135](https://github.com/MaxiGarcia13/roomcast/commit/2f5a135))
- Update build and start scripts for server and shared packages to improve clarity and consistency. Upgrade TypeScript version to 5.9.3 and adjust imports to use file extensions. Enhance documentation in README and changelogs to reflect changes in build processes. ([e40baf5](https://github.com/MaxiGarcia13/roomcast/commit/e40baf5))
- Refine project documentation for clarity, update package.json clean scripts for consistency, and enhance TypeScript configuration across client and server for improved development experience. ([52b6ac5](https://github.com/MaxiGarcia13/roomcast/commit/52b6ac5))
- Remove linting scripts from package.json in server and shared directories to streamline configuration and focus on essential scripts. ([9741953](https://github.com/MaxiGarcia13/roomcast/commit/9741953))
- Update dependencies in package.json and pnpm-lock.yaml, modify .gitignore for improved project structure, and adjust nx.json for better input formatting and analytics settings. ([ae908f6](https://github.com/MaxiGarcia13/roomcast/commit/ae908f6))

### 🧱 Updated Dependencies

- Updated @roomcast/shared to 0.1.0

### ❤️ Thank You

- Maximiliano Garcia Mortigliengo

# Changelog

## 0.0.0

- Initial Fastify server with WebSocket signaling on `/ws`
- Serves `client/dist` in production (SPA fallback)
- Production build via `tsc` → `dist/`; `start` runs `node dist/index.js`
