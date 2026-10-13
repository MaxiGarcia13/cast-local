## 0.6.0 (2026-10-13)

### 🚀 Features

- Implement file transfer functionality with progress tracking and error handling ([d1a82e1](https://github.com/MaxiGarcia13/roomcast/commit/d1a82e1))
- Add downloadFiles utility for batch file downloads ([d5ffdbd](https://github.com/MaxiGarcia13/roomcast/commit/d5ffdbd))
- Add client-zip dependency to client package ([30166e5](https://github.com/MaxiGarcia13/roomcast/commit/30166e5))

### 🐞 Fixes

- Enhance downloadBlob function to manage object URLs more effectively ([82df8f6](https://github.com/MaxiGarcia13/roomcast/commit/82df8f6))

### 🧱 Updated Dependencies

- Updated @roomcast/shared to 0.5.0

### ❤️ Thank You

- Maximiliano Garcia Mortigliengo

## 0.5.0 (2026-10-13)

### 🚀 Features

- Integrate usePasteSharePayload in pick-app component for enhanced file and text sharing ([9c9a3ce](https://github.com/MaxiGarcia13/roomcast/commit/9c9a3ce))
- Implement usePasteSharePayload composable for handling pasted files and text ([3ccb777](https://github.com/MaxiGarcia13/roomcast/commit/3ccb777))

### 🐞 Fixes

- Refactor file extension normalization in usePasteSharePayload composable ([3ebfd06](https://github.com/MaxiGarcia13/roomcast/commit/3ebfd06))
- Update file-picker component text for clarity ([be286d6](https://github.com/MaxiGarcia13/roomcast/commit/be286d6))

### ❤️ Thank You

- Maximiliano Garcia Mortigliengo

## 0.4.0 (2026-10-13)

### 🧹 Chores

- Update meta tags in index.html for improved SEO and clarity ([e1e1443](https://github.com/MaxiGarcia13/roomcast/commit/e1e1443))

### ❤️ Thank You

- Maximiliano Garcia Mortigliengo

## 0.3.0 (2026-10-13)

### 🚀 Features

- Initialize @roomcast/client with core components, routing, and file sharing functionality ([c7a48e0](https://github.com/MaxiGarcia13/roomcast/commit/c7a48e0))

### 🧱 Updated Dependencies

- Updated @roomcast/shared to 0.3.0

### ❤️ Thank You

- Maximiliano Garcia Mortigliengo

## 0.2.1 (2026-10-13)

### 🔄 Refactors

- Update data channel path in AGENTS.md and integrate reusable Button component in room-host-panel.vue for improved code organization and user experience ([ab85a15](https://github.com/MaxiGarcia13/roomcast/commit/ab85a15))
- Remove unused properties from signaling composables for cleaner code and improved maintainability ([c785a9e](https://github.com/MaxiGarcia13/roomcast/commit/c785a9e))
- Consolidate payload summary formatting into a new utility module for better code reuse and clarity ([6ad479e](https://github.com/MaxiGarcia13/roomcast/commit/6ad479e))
- Implement useCopyToClipboard composable for improved clipboard functionality in transfer-progress and room-invite components ([63458ca](https://github.com/MaxiGarcia13/roomcast/commit/63458ca))
- Replace room-host and room-guest views with a unified room-view component for better code organization and maintainability ([35b6f96](https://github.com/MaxiGarcia13/roomcast/commit/35b6f96))

### ❤️ Thank You

- Maximiliano Garcia Mortigliengo

## 0.2.0 (2026-10-13)

### 🧱 Updated Dependencies

- Updated @roomcast/shared to 0.2.0

## 0.1.0 (2026-10-13)

### 🚀 Features

- Initialize Vue + Vite SPA client with room routing, WebSocket proxy, and essential components for file sharing functionality. Update changelog to reflect version 0.0.0 and initial setup details. ([c9fe052](https://github.com/MaxiGarcia13/roomcast/commit/c9fe052))
- Refactor server architecture to integrate signaling and HTTP handling in a single process, enhancing deployment simplicity and updating documentation for clarity on usage and commands. ([02a0582](https://github.com/MaxiGarcia13/roomcast/commit/02a0582))

### 🔄 Refactors

- Rename project from Cast Local to Roomcast, updating all relevant documentation, package names, and imports to reflect the new branding. ([5345ada](https://github.com/MaxiGarcia13/roomcast/commit/5345ada))

### 🧹 Chores

- Update TypeScript target version to ES2024 across all configuration files for improved compatibility and features. ([2f5a135](https://github.com/MaxiGarcia13/roomcast/commit/2f5a135))
- Refine project documentation for clarity, update package.json clean scripts for consistency, and enhance TypeScript configuration across client and server for improved development experience. ([52b6ac5](https://github.com/MaxiGarcia13/roomcast/commit/52b6ac5))

### 🧱 Updated Dependencies

- Updated @roomcast/shared to 0.1.0

### ❤️ Thank You

- Maximiliano Garcia Mortigliengo

# Changelog

## 0.0.0

- Initial Vue + Vite SPA with room routes and same-origin `/ws` proxy
