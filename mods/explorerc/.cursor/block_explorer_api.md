# Saito Block Explorer API Documentation

## Overview
The Saito Block Explorer API provides endpoints for exploring the Saito blockchain, including blocks, transactions, balances, and mempool information.

## Module Structure

### ExplorerCore Class
The block explorer is implemented as an `ExplorerCore` class that extends the `ModTemplate` class.

```javascript
const ModTemplate = require('../../lib/templates/modtemplate');
const sanitizer = require('sanitizer');
const JSON = require('json-bigint');
const S = require('saito-js/saito').default;
const fs = require("fs");
const path = require("path");

class ExplorerCore extends ModTemplate {
  constructor(app) {
    super(app);
    this.name = "explorer";
    this.webServer = null;
  }
}
```

### Required Dependencies
The module requires the following dependencies:
```javascript
const ModTemplate = require('../../lib/templates/modtemplate');
const sanitizer = require('sanitizer');
const JSON = require('json-bigint');
const S = require('saito-js/saito').default;
const fs = require("fs");
const path = require("path");
```

### Required Resources
The explorer requires the following resources in the `web/` directory:
1. `utils.js` - Client-side JavaScript for dynamic data fetching and display
2. `jsonTree.js` - Library for displaying JSON data in a collapsible tree format
3. `style.css` - CSS styles for the explorer interface
4. `logo.png` - Logo image for the explorer header

### Initialization
The explorer is initialized through the following methods:

1. `initialize()` - Sets up the web server and routes
2. `webServer()` - Configures Express routes and middleware
3. `onPeerHandshakeComplete(peer)` - Handles peer connections

### Event Handlers
The explorer implements the following event handlers:

1. `onNewBlock(block)` - Triggered when a new block is added to the blockchain
   - Updates the explorer's state with the new block information
   - Refreshes the mempool display
   - Updates the block list on the main explorer page
   - Notifies connected clients about the new block

### Required App Configuration
The explorer requires the following app configuration:
```javascript
{
  "blockchain": {
    "getBlock": function(hash) { /* ... */ },
    "getBlockByIndex": function(index) { /* ... */ },
    "getBlockCount": function() { /* ... */ }
  },
  "wallet": {
    "getPublicKey": function() { /* ... */ },
    "getBalance": function() { /* ... */ }
  }
}
```

## Base URL
All API endpoints are prefixed with `/explorer/`

## Endpoints

### Block Information

#### Get Block by Hash
```
GET /explorer/block
```
Query Parameters:
- `hash` (required): The hash of the block to retrieve

Response: HTML page displaying block details including:
- Block hash
- Block ID
- Number of transactions
- Previous block hash
- Block creator
- Timestamp
- Transaction list

#### Get Block Source
```
GET /explorer/blocksource
```
Query Parameters:
- `hash` (required): The hash of the block to retrieve

Response: HTML page displaying raw block data in JSON format

#### Get Block JSON
```
GET /explorer/json-block/:bhash
```
Path Parameters:
- `bhash` (required): The hash of the block to retrieve

Response: JSON object containing:
- Block metadata
- Block header
- Full transaction list with messages
- Block creator information
- Timestamp

### Balance Information

#### Get Wallet Balance
```
GET /explorer/balance
```
Query Parameters:
- `pubkey` (required): The public key of the wallet to check

Response: HTML page displaying:
- Wallet address
- Saito balance
- Nolan balance (smallest unit)

#### Get All Balances
```
GET /explorer/balance/all
```
Response: HTML page displaying:
- Total supply information
- List of all wallet holders with their balances
- Saito and Nolan balances for each holder

### Mempool Information

#### Get Mempool Transactions
```
GET /explorer/mempool
```
Response: HTML page displaying:
- List of pending transactions in the mempool
- Transaction details in JSON format

### Main Explorer Page

#### Get Explorer Index
```
GET /explorer/
```
Query Parameters:
- `page` (optional): Page number for block list pagination (default: 0)

Response: HTML page displaying:
- Server address
- Current wallet balance
- Mempool transaction count
- Block search form
- Paginated list of recent blocks
- Balance check form

## Views

The explorer module provides the following views:

- **Block View**: Displays detailed information about a specific block, including its hash, ID, number of transactions, previous block hash, creator, timestamp, and a list of transactions.
- **Block Source View**: Displays the raw block data in JSON format, with a back button to return to the block view.
- **Balance View**: Displays the balance of a specific wallet, including the wallet address, Saito balance, and Nolan balance.
- **All Balances View**: Displays the total supply information and a list of all wallet holders with their balances.
- **Mempool View**: Displays a list of pending transactions in the mempool, with transaction details in JSON format.
- **Explorer Index View**: Displays the main explorer page, including the server address, current wallet balance, mempool transaction count, block search form, paginated list of recent blocks, and balance check form.

## Block Data Structure

### Block Object
```json
{
  "id": "string",
  "hash": "string",
  "previousBlockHash": "string",
  "creator": "string",
  "timestamp": "number",
  "transactions": [
    {
      "hash": "string",
      "from": "string",
      "to": "string",
      "amount": "string",
      "fee": "string",
      "msg": "string",
      "timestamp": "number"
    }
  ]
}
```

### Transaction Object
```json
{
  "hash": "string",
  "from": "string",
  "to": "string",
  "amount": "string",
  "fee": "string",
  "msg": "string",
  "timestamp": "number"
}
```

## Error Handling

The API returns appropriate HTTP status codes:
- 200: Successful request
- 400: Bad request (e.g., missing required parameters)
- 404: Resource not found

Error responses include a message explaining the error:
```json
{
  "error": {
    "message": "Error description"
  }
}
```

## Client-Side JavaScript
The `utils.js` file provides the following functionality:
1. `fetchBlock(hash)` - Fetches block data from the API
2. `fetchBalance(pubkey)` - Fetches wallet balance
3. `fetchMempool()` - Fetches mempool transactions
4. `displayJsonTree(data, element)` - Displays JSON data in a tree format

## Notes

1. All timestamps are in Unix timestamp format (seconds since epoch)
2. Balances are returned in both Saito (main unit) and Nolan (smallest unit) formats
3. The block list is paginated with 200 blocks per page
4. The API includes navigation between blocks (previous/next)
5. All responses include proper HTML structure with necessary CSS and JavaScript resources
6. The explorer uses client-side JavaScript (utils.js) to fetch and display data dynamically
7. The explorer uses the jsonTree library to display JSON data in a collapsible tree format
8. The module requires proper initialization of the Saito blockchain and wallet components
9. All HTML generation functions must be called with the app instance to access blockchain and wallet functionality
10. The web server must be properly configured with Express middleware for handling static files and JSON responses 