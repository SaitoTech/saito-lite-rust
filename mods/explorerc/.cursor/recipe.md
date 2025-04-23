# Saito Block Explorer Recipe

## Overview
This document serves as a recipe for building the new Saito Block Explorer application. It contains prompts, definitions, and a todo list for different components of the application, structured according to a typical Saito React module **within this specific project's build environment**.

**Important Build Note**: In this project, all module JavaScript (including React components) is compiled directly into the core `/saito/saito.js` file by a central webpack process. There is no separate `bundle.js` for this module. `require` statements within `explorerc.js` for React/components are resolved during this main build.

## 1. Module Setup (`explorerc.js`)

### Prompts & Definitions
- **Prompt**: Create a modern block explorer for the Saito blockchain that follows the React in Saito guidelines.
- **Definition**: A React-based application class (`Explorerc` extending `ModTemplate`) defined in `explorerc.js`. This file requires React, ReactDOM, and the main App component (from `./react-components/App.js`), and handles initialization, event handling, and direct React rendering in its `render()` method.

### Todo List
- [x] Create the basic `explorerc.js` module structure extending `ModTemplate`.
- [x] Add top-level `require` statements for `react`, `react-dom/client`, and `./react-components/App.default`.
- [x] Implement `initialize()` method (basic console log).
- [ ] Implement necessary event handlers (e.g., `onNewBlock`, `onPeerHandshakeComplete`).
- [x] Define module properties (name, slug, description, categories).
- [x] Define `this.styles` property pointing to `style.css`.
- [x] Ensure `this.scripts` array is empty.
- [x] Implement `render()` method using `createRoot().render()` to directly render the `App` component.

## 2. API Implementation (`webServer` in `explorerc.js`)

### Prompts & Definitions
- **Prompt**: Define the API endpoints for the block explorer.
- **Definition**: RESTful endpoints served via the `webServer` method in `explorerc.js` for retrieving block information, balance information, mempool information. The main route serves the HTML shell.

### Todo List
- [x] Implement `webServer` method in `explorerc.js`.
- [x] Configure static file serving for the `web` directory under `/explorerc/`.
- [x] Implement main application route (`/explorerc/`) to serve the HTML shell (using `mods/explorerc/index.js`).
- [ ] Implement block information endpoints (placeholder JSON added).
- [ ] Implement balance information endpoints (placeholder JSON added).
- [ ] Implement mempool information endpoints (placeholder JSON added).
- [ ] Add *actual* data fetching logic to API endpoints.
- [ ] Add error handling for all endpoints.

## 3. HTML Shell (`mods/explorerc/index.js`)

### Prompts & Definitions
- **Prompt**: Create the initial HTML page structure.
- **Definition**: A JavaScript file (`mods/explorerc/index.js`) exporting a function that generates the HTML string. This HTML includes the mount point (`#saito-react-app`) and loads necessary CSS and the core `/saito/saito.js` script.

### Todo List
- [x] Create `mods/explorerc/index.js`.
- [x] Define and export `ExplorerHomePage` function.
- [x] Implement HTML structure within the function.
- [x] Include `<div id="saito-react-app">`.
- [x] Include link to `/saito/css-imports/saito-variables.css`.
- [x] Include link to `/explorerc/style.css`.
- [x] Include script tag for `/saito/saito.js`.
- [x] Ensure NO script tag for `/explorerc/bundle.js` is included.

## 4. React Components (`react-components/`)

### Prompts & Definitions
- **Prompt**: Design React components for the block explorer.
- **Definition**: Reusable React components located in `react-components/` (at the module base level) for displaying blocks, transactions, balances, etc. These are imported/required by `explorerc.js`.

### Todo List
- [x] Create `react-components/App.js` main application component.
- [x] Create `react-components/Header.js` component.
- [ ] Create `react-components/BlockList.js` component.
- [ ] Create `react-components/BlockDetail.js` component.
- [ ] Create `react-components/TransactionList.js` component.
- [ ] Create `react-components/TransactionDetail.js` component.
- [ ] Create `react-components/BalanceView.js` component.
- [ ] Create `react-components/MempoolView.js` component.
- [ ] Create `react-components/SearchBar.js` component.
- [ ] Create `react-components/Pagination.js` component.
- [ ] Create `react-components/Footer.js` component.

## 5. Entry Point (`web/index.js`) - NOT USED in this setup

### Prompts & Definitions
- **Prompt**: ~~Use index.js instead of index.html as the entry point.~~
- **Definition**: ~~A dynamically written `web/index.js` file that imports the main React App component, sets up the React root, and renders the application into the DOM.~~ **N/A**: Rendering is initiated directly by `explorerc.js`'s `render()` method.

### Todo List
- [ ] ~~Create the `web/index.js` file.~~
- [ ] ~~Import React, ReactDOM, and the main `App` component.~~
- [ ] ~~Implement logic to create the root DOM element.~~
- [ ] ~~Render the React application.~~

## 6. CSS (`web/css/`, `web/style.css`)

### Prompts & Definitions
- **Prompt**: Organize CSS files in the base layer of the web/css folder with prefixes.
- **Definition**: All CSS files located in `web/css/` using prefixes (e.g., `component-header.css`, `theme-light.css`). A main `web/style.css` proxy file imports all individual CSS files. This `style.css` is loaded via `this.styles` in `explorerc.js`.

### Todo List
- [x] Create `web/css/` directory.
- [x] Create `web/css/component-header.css`.
- [x] Create `web/css/main.css` for global styles.
- [ ] Create other component-specific CSS files with prefixes.
- [ ] Create theme CSS files (e.g., `web/css/theme-light.css`, `web/css/theme-dark.css`).
- [x] Create the CSS proxy file `web/style.css` and import `component-header.css`, `main.css`.
- [ ] Ensure `web/style.css` imports all other necessary CSS files.

## 7. JavaScript Utilities (`web/js/`)

### Prompts & Definitions
- **Prompt**: Create utility functions and an API client.
- **Definition**: Generic JavaScript functions and classes located in `web/js/`, such as an API client for interacting with the `webServer` endpoints and utility functions for data formatting. These will likely be imported by React components.

### Todo List
- [ ] Create `web/js/` directory.
- [ ] Create `web/js/api.js` (API client for fetching blockchain data).
- [ ] Create `web/js/utils.js` (utility functions for formatting data, etc.).
- [ ] Implement event listeners or WebSocket logic for real-time updates if needed.

## 8. Build Configuration (`webpack.config.js`, `package.json`) - Centralized

### Prompts & Definitions
- **Prompt**: Configure the build process for React and CSS.
- **Definition**: The central webpack build process (likely outside this module's directory) must be configured to find and compile `explorerc.js` and its required React components (from `./react-components/`) into `/saito/saito.js`. It also needs to handle CSS processing.

### Todo List
- [ ] Ensure central `package.json` includes React, ReactDOM, and necessary loaders (babel-loader, css-loader, style-loader, etc.).
- [ ] Ensure central `webpack.config.js` correctly processes `.js` files in module directories (including JSX).
- [ ] Ensure central `webpack.config.js` correctly processes CSS imports and generates necessary CSS output (or handles it via JS imports).

## 9. Testing

### Todo List
- [ ] Set up testing environment (e.g., Jest, React Testing Library).
- [ ] Write unit tests for React components.
- [ ] Write tests for API endpoints (if possible/applicable).
- [ ] Write integration tests for the full application flow.

## 10. Documentation

### Todo List
- [ ] Update API documentation (`block_explorer_api.md`).
- [ ] Create User Guide.
- [ ] Document React component usage and props.
- [x] Maintain this `recipe.md` file.

## Progress Tracking

### Completed
- [x] Define overall structure based on React module template (direct render approach).
- [x] Module Setup (`explorerc.js`) - Structure, requires, properties, initialize, render method.
- [x] API Implementation (`webServer`) - Static serving, HTML shell route, placeholder endpoints.
- [x] HTML Shell (`mods/explorerc/index.js`) - Structure and content.
- [x] React Components (`react-components/`) - Basic `App.js` and `Header.js` created.
- [x] CSS (`web/css/`, `web/style.css`) - Basic structure, `component-header.css`, `main.css`, proxy file created/updated.

### In Progress
- [ ] API Implementation (`webServer`) - Actual data fetching logic, error handling.
- [ ] CSS (`web/css/`, `web/style.css`) - Add imports for global/theme CSS to proxy, create those files.

### Not Started
- [ ] Module Setup (`explorerc.js`) - Event handlers.
- [ ] React Components (`react-components/`) - Remaining components.
- [ ] JavaScript Utilities (`web/js/`)
- [ ] Build Configuration (Centralized) - Verification needed.
- [ ] Testing
- [ ] Documentation (updates needed)

## Notes
- The explorer should follow the React in Saito guidelines (`react_in_saito.md`), adjusted for this project's build process.
- CSS organization: base layer in `web/css`, prefixes, proxy `style.css` imported via `this.styles`.
- React rendering happens directly in `explorerc.js`'s `render()` method.
- React components are located in `./react-components/` and required directly by `explorerc.js`.
- The central webpack build process is responsible for compiling everything into `/saito/saito.js`.
- The application should be responsive and work on mobile devices.
- The application should support both light and dark themes.