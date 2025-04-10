# React in Saito Applications

## Overview
This document outlines the rules and best practices for using React in Saito applications.

## Core Rules

1. **Peer-to-Peer Architecture**
   - Saito apps are peer-to-peer and **not** client-server
   - React should **not** be used on the node/server side
   - React is exclusively for client-side UI rendering

2. **UI Component Structure**
   - React UI components should be stored either in:
     - `./react-components/` (at the module root, as seen in the `react` module example)
     - OR `./web/components/` (if preferred, requires adjustment in imports/build)
   - Follow a component-based architecture for better maintainability
   - Keep components focused on a single responsibility

3. **Dependencies and Bundling**
   - All React and associated code should be included from npm packages
   - Dependencies will be bundled by webpack (often into a central `/saito/saito.js`)
   - **No CDNs should be loaded** for React or related libraries
   - Use package.json to manage all dependencies

4. **JavaScript Organization**
   - Generic JavaScript code should be placed in `./web/js`
   - This directory will automatically be served by ModTemplate
   - Keep business logic separate from UI components

5. **CSS Organization**
   - CSS files should be organized in the `./web/css` directory
   - All CSS files should be in the base layer of the `web/css` folder
   - Use prefixes in filenames to organize CSS (e.g., `component-header.css`, `theme-light.css`)
   - The main `style.css` file should be a proxy that imports all CSS files from the css directory

6. **Entry Point**
   - Use `index.js` instead of `index.html` as the entry point
   - The `index.js` file should be dynamically written to include necessary React components
   - This allows for more flexibility in how the application is initialized

## Implementation Guidelines

### Project Structure Examples

**Example 1: Components at Module Root (`react-components/`)**

```
my-saito-app/
├── react-components/  # React UI components at module root
│   ├── App.js
│   ├── Header.js
│   └── BlockList.js
├── web/
│   ├── css/           # CSS files (all in base layer)
│   │   ├── main.css
│   │   ├── component-header.css
│   │   └── component-block-list.css
│   ├── js/            # Generic JavaScript (served statically)
│   │   └── utils.js
│   └── style.css      # Proxy file that imports all CSS from /web/css/*
├── my-saito-app.js    # Main module file (requires ./react-components/App)
├── index.js           # Generates HTML shell
└── package.json       # Dependencies (likely managed centrally)
```

**Example 2: Components inside `web/` (`web/components/`)**

```
my-saito-app/
├── web/
│   ├── components/     # React UI components inside web
│   │   ├── App.js
│   │   ├── Header.js
│   │   └── BlockList.js
│   ├── css/           # CSS files (all in base layer)
│   │   ├── main.css
│   │   ├── component-header.css
│   │   └── component-block-list.css
│   ├── js/            # Generic JavaScript (served statically)
│   │   └── utils.js
│   ├── style.css      # Proxy file that imports all CSS from /web/css/*
│   └── index.js       # Entry point if using separate bundle.js
├── my-saito-app.js    # Main module file 
├── index.js           # Generates HTML shell
└── package.json       # Dependencies (likely managed centrally)
```

### Index.js Example (HTML Shell Generator)
The `index.js` file at the module root should generate the HTML shell:

```javascript
// index.js - Generates HTML Shell
module.exports = (app, mod, build_number) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="${mod.description}">
    <title>${mod.returnTitle()}</title>
    <link rel="stylesheet" type="text/css" href="/saito/css-imports/saito-variables.css" />
    <link rel="stylesheet" type="text/css" href="/${mod.returnSlug()}/style.css" /> 
    <link rel="icon" media="(prefers-color-scheme: light)" href="/saito/img/favicon.svg" type="image/svg+xml" />
    <link rel="icon" media="(prefers-color-scheme: dark)" href="/saito/img/favicon-dark.svg" type="image/svg+xml" />
  </head>
  <body>
    <div id="saito-react-app"></div>
    <script type="text/javascript" src="/saito/saito.js"></script>
  </body>
  </html>
  `;
};
```

### CSS Proxy File Example
The `web/style.css` file should import all CSS files from the css directory:

```css
/* style.css - Proxy file for all CSS */
@import 'css/main.css';
@import 'css/component-header.css';
@import 'css/component-block-list.css';
@import 'css/component-transaction-view.css';
@import 'css/theme-light.css';
@import 'css/theme-dark.css';
```

### Webpack Configuration
Ensure your webpack configuration:
- Bundles all React components
- Processes CSS and other assets
- Outputs to the appropriate directory
- Excludes node-specific code from client bundles
- Sets `index.js` as the entry point

### ModTemplate Integration
ModTemplate provides a comprehensive set of functions for building Saito applications. Here are the key functions you should be aware of:

#### Core Lifecycle Functions
- `initialize(app)` - Called when the module is initialized
- `installModule(app)` - Called when the module is first installed
- `render()` - Renders the module's UI components
- `webServer(app, expressapp, express)` - Sets up the web server for serving static files
- `onNewBlock(blk, lc)` - Called when a new block is added to the blockchain
- `onConfirmation(blk, tx, confnum)` - Called when a transaction is confirmed
- `onPeerHandshakeComplete(app, peer)` - Called when a peer handshake is completed
- `onConnectionStable(app, peer)` - Called when a connection becomes stable
- `onConnectionUnstable(app, publicKey)` - Called when a connection becomes unstable

#### UI and Resource Management
- `attachStyleSheets()` - Attaches CSS stylesheets to the document
- `attachScripts()` - Attaches JavaScript files to the document
- `attachPostScripts()` - Attaches scripts that should load after the main scripts
- `attachMeta()` - Attaches meta tags to the document
- `removeStyleSheets()` - Removes stylesheets from the document
- `removeScripts()` - Removes scripts from the document
- `removeMeta()` - Removes meta tags from the document
- `removeEvents()` - Removes event listeners from the document
- `destroy()` - Cleans up resources when the module is destroyed

#### Component Management
- `addComponent(obj)` - Adds a UI component to the module
- `removeComponent(obj)` - Removes a UI component from the module
- `renderInto(querySelector)` - Renders the module into a specific DOM element
- `canRenderInto(querySelector)` - Checks if the module can render into a specific DOM element

#### Communication and Events
- `sendEvent(eventname, data)` - Sends an event to other modules
- `receiveEvent(eventname, data)` - Receives an event from another module
- `handlePeerTransaction(app, tx, peer, mycallback)` - Handles a transaction from a peer
- `sendPeerRequestWithFilter(msg_callback, success_callback, peerfilter)` - Sends a request to peers that match a filter
- `sendPeerDatabaseRequest(dbname, tablename, select, where, peer, mycallback)` - Sends a database request to a peer

#### Utility Functions
- `returnName()` - Returns the name of the module
- `returnSlug()` - Returns the slug of the module
- `returnLink()` - Returns the link to the module
- `isSlug(slug)` - Checks if a slug matches the module's slug
- `hasSeenTransaction(tx)` - Checks if a transaction has been seen before
- `displayModal(modalHeaderText, modalBodyText)` - Displays a modal dialog
- `displayWarning(warningTitle, warningText, time)` - Displays a warning message

#### Database Functions
- `sendPeerDatabaseRequestRaw(db, sql, mycallback)` - Sends a raw SQL query to a peer
- `sendPeerDatabaseRequestWithFilter(modname, sql, success_callback, peerfilter)` - Sends a database request with a filter

#### WebSocket Functions
- `getWebsocketPath()` - Returns the WebSocket path for the module
- `onWebSocketServer(wss)` - Called when the WebSocket server is initialized

## Best Practices

1. **State Management**
   - Use React's built-in state management for component-specific state
   - Consider Redux or Context API for global state if needed
   - Keep state management separate from P2P communication logic

2. **Performance**
   - Implement code splitting for larger applications
   - Use React.memo and useMemo for expensive computations
   - Optimize bundle size by analyzing dependencies

3. **Testing**
   - Write tests for React components using Jest and React Testing Library
   - Test UI components in isolation from P2P logic
   - Use mock data for testing components that depend on blockchain data

4. **Accessibility**
   - Ensure all components are accessible
   - Use semantic HTML elements
   - Include appropriate ARIA attributes

## Conclusion

Following these guidelines will ensure that React is used appropriately within the Saito ecosystem, maintaining the peer-to-peer architecture while providing a modern, component-based UI for users.
