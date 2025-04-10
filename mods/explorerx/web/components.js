// Transaction Types Definition
const txTypes = {
  0: { name: 'Normal' },
  1: { name: 'Fee Payment' },
  2: { name: 'Golden Ticket'},
  3: { name: 'ATR' },
  4: { name: 'VIP (deprecated)' },
  5: { name: 'SPV' },
  6: { name: 'Network Issuance' },
  7: { name: 'Block Stake' },
  8: { name: 'Bound' }
};

// Utility functions
const formatTimestamp = (timestamp) => {
  const date = new Date(Number(timestamp));
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  // Format actual date
  const actualDate = date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  // Format relative time
  let relativeTime;
  if (diffInSeconds < 60) relativeTime = 'just now';
  else if (diffInSeconds < 3600) relativeTime = `${Math.floor(diffInSeconds/60)} minutes ago`;
  else if (diffInSeconds < 86400) relativeTime = `${Math.floor(diffInSeconds/3600)} hours ago`;
  else relativeTime = `${Math.floor(diffInSeconds/86400)} days ago`;

  return `${actualDate} (${relativeTime})`;
};

const formatSaito = (amount) => {
  if (!amount) return '0.00'; // Handle undefined, null, or empty string
  try {
    const nolan = BigInt(amount);
    const saito = Number(nolan) / 100000000;
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    }).format(saito);
  } catch (err) {
    console.error('Error formatting Saito amount:', err);
    return '0.00';
  }
};

const getTxSenderType = (tx) => {
  if (tx.from.length === 0) {
    if (tx.type === 6) return "issuance tx";
    if (tx.type === 7) return "block stake tx";
    return "fee tx";
  }
  return tx.from[0].publicKey;
};

const calculateFees = (tx) => {
  let inputs = tx.from.reduce((sum, input) => sum + BigInt(input.amount), BigInt(0));
  let outputs = tx.to.reduce((sum, output) => {
    if (output.type !== 1 && output.type !== 2) {
      return sum + BigInt(output.amount);
    }
    return sum;
  }, BigInt(0));
  return inputs - outputs;
};

const formatFees = (fees) => {
  return `${formatSaito(fees)} SAITO`;
};

// Icons for expand/collapse (using heroicons)
const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

const ChevronUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
  </svg>
);

// Add search icon component
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="search-icon">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

// Add Search component
const Search = ({ onSearch }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');
  const searchRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Updated address validation function
  const isValidAddress = (value) => {
    // Check for base-58 encoded string, 44 or 45 characters
    return /^[1-9A-HJ-NP-Za-km-z]{44,45}$/.test(value);
  };

  const isValidBlockHash = (value) => {
    // Check for 64-character hex string
    return /^[0-9a-f]{64}$/i.test(value);
  };

  const handleSearch = (type) => {
    onSearch(type, searchValue);
    setIsOpen(false);
    setSearchValue('');
  };

  return (
    <div className="search-container" ref={searchRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        <SearchIcon />
      </div>
      {isOpen && (
        <div className="search-panel">
          <input
            type="text"
            className="search-input"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Enter address or block hash..."
            autoFocus
          />
          <div className="search-buttons">
            <button
              className={`search-button ${isValidAddress(searchValue) ? 'active' : ''}`}
              disabled={!isValidAddress(searchValue)}
              onClick={() => handleSearch('address')}
            >
              Address
            </button>
            <button
              className={`search-button ${isValidBlockHash(searchValue) ? 'active' : ''}`}
              disabled={!isValidBlockHash(searchValue)}
              onClick={() => handleSearch('block')}
            >
              Block
            </button>
            <button
              className="search-button"
              onClick={() => handleSearch('all-balances')}
            >
              Show All Balances
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Header Component with Stats
const Header = ({ onSearch }) => {
  const [stats, setStats] = React.useState({
    address: '',
    balance: '0',
    mempoolCount: 0,
    latestBlock: '0'
  });

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/explorerx/stats');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setStats({
          ...data,
          balance: data.balance || '0',
          mempoolCount: data.mempoolCount || 0,
          latestBlock: data.latestBlock || '0'
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="header">
      <div className="container">
        <div className="flex flex-wrap items-center gap-4 flex-1">
          <div className="stat-box flex-1 min-w-[250px]">
            <div className="text-secondary text-sm">Server Address</div>
            <div className="font-medium truncate" title={stats.address || ''}>
              {stats.address || 'Not available'}
            </div>
          </div>
          <div className="stat-box flex-1 min-w-[200px]">
            <div className="text-secondary text-sm">Balance</div>
            <div className="font-medium">
              {formatSaito(stats.balance)} SAITO
            </div>
          </div>
          <div className="stat-box flex-1 min-w-[180px]">
            <div className="text-secondary text-sm">Mempool</div>
            <div className="font-medium">
              {stats.mempoolCount} transactions
            </div>
          </div>
          <div className="stat-box flex-1 min-w-[150px]">
            <div className="text-secondary text-sm">Latest Block</div>
            <div className="font-medium">
              #{stats.latestBlock}
            </div>
          </div>
        </div>
        <Search onSearch={onSearch} />
      </div>
    </div>
  );
};

// Transaction Card Component
const TransactionCard = ({ tx, index }) => {
  const [expanded, setExpanded] = React.useState(false);
  const jsonContainerRef = React.useRef(null);

  React.useEffect(() => {
    if (expanded && jsonContainerRef.current) {
      // Clear previous content
      jsonContainerRef.current.innerHTML = '';
      // Create new JsonTree instance
      window.jsonTree.create(tx, jsonContainerRef.current);
    }
  }, [expanded, tx]);

  const sender = tx.from && tx.from[0] ? tx.from[0].publicKey : getTxSenderType(tx);
  const fee = formatFees(calculateFees(tx));

  const getBadgeInfo = (tx) => {
    if (tx.type === 0) {
      // For normal transactions, use module name from msg
      const moduleName = tx.msg?.module || 'Unknown/Encrypted';
      return {
        name: `Mod: ${moduleName}`,  // Add "Mod:" prefix
        badge: 'primary'
      };
    }
    
    // Existing badge types
    return txTypes[tx.type] || { name: 'Unknown', badge: 'warning' };
  };

  const badgeInfo = getBadgeInfo(tx);

  return (
    <div className="transaction-card">
      <div className="transaction-header">
        <div className="transaction-info flex-1">
          <div className="flex items-center flex-wrap gap-4">
            <span className="transaction-info-item">
              <span className="tx-id mono-text">TX #{index}</span>
            </span>
            
            <span className="transaction-info-item">
              <span className={`badge ${tx.type === 2 ? 'badge-golden-ticket' : ''} mono-text`}>
                {tx.type === 0 
                  ? `Mod: ${tx.msg?.module || 'Unknown/Encrypted'}`
                  : txTypes[tx.type]?.name || 'Unknown'
                }
              </span>
            </span>
            
            <span className="transaction-info-item">
              <span className="text-secondary">Sender:</span>
              <span className="sender-value mono-text ml-2" title={sender}>
                {sender}
              </span>
            </span>
            
            <span className="transaction-info-item">
              <span className="text-secondary">Fee:</span>
              <span className="value mono-text ml-2">{fee}</span>
            </span>
          </div>
        </div>
        <div 
          onClick={() => setExpanded(!expanded)}
          className="chevron-icon cursor-pointer ml-2 shrink-0"
        >
          {expanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </div>
      </div>
      
      {expanded && (
        <div className="transaction-content">
          <div 
            ref={jsonContainerRef}
            className="json-tree-container"
          />
        </div>
      )}
    </div>
  );
};

// Block Card Component
const BlockCard = ({ block }) => {
  const [expanded, setExpanded] = React.useState(false);
  const [transactions, setTransactions] = React.useState(null);

  const loadTransactions = async () => {
    try {
      const response = await fetch(`/explorerx/json-block/${block.hash}`);
      const data = await response.json();
      setTransactions(data.transactions);
    } catch (err) {
      console.error('Error loading transactions:', err);
    }
  };

  const handleExpand = () => {
    if (!expanded && !transactions) {
      loadTransactions();
    }
    setExpanded(!expanded);
  };

  const hasGoldenTicket = block.transactions.some(tx => tx.type === 2);

  return (
    <>
      <div className="card">
        <div className="block-header">
          <div className="block-info flex-1">
            <div className="info-rows">
              <div className="info-row-special">
                <div className="info-group">
                  <span className="text-secondary">Block ID:</span>
                  <span className="value mono-text">{block.id}</span>
                </div>
                <div className="info-group">
                  <span className={`chain-status ${block.isLongestChain ? 'longest' : 'orphan'}`}>
                    {block.isLongestChain ? 'Longest Chain' : 'Orphan'}
                  </span>
                </div>
                {hasGoldenTicket && (
                  <div className="golden-ticket-indicator">
                    Golden Ticket
                  </div>
                )}
              </div>
              
              <div className="info-row">
                <span className="text-secondary">Hash:</span>
                <span className="value mono-text truncate" title={block.hash}>
                  {block.hash}
                </span>
              </div>
              
              <div className="info-row">
                <span className="text-secondary">Previous:</span>
                <span className="value mono-text truncate" title={block.previousBlockHash}>
                  {block.previousBlockHash || block.previous_block_hash}
                </span>
              </div>
              
              <div className="info-row">
                <span className="text-secondary">Creator:</span>
                <span className="value mono-text truncate" title={block.creator}>
                  {block.creator}
                </span>
              </div>
              
              <div className="info-row">
                <span className="text-secondary">Time:</span>
                <span className="value mono-text">{formatTimestamp(block.timestamp)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card-footer">
          <div className="tx-count">
            <span className="text-secondary">TX Count:</span>
            <span className="value mono-text ml-2">{block.transactions.length}</span>
          </div>
          <div 
            onClick={handleExpand}
            className="chevron-icon cursor-pointer"
          >
            {expanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </div>
        </div>
      </div>
      {expanded && transactions && (
        <div className="transactions-container">
          {transactions.map((tx, index) => (
            <TransactionCard key={index} tx={tx} index={index} />
          ))}
        </div>
      )}
    </>
  );
};

// Transaction List Component
const TransactionList = ({ transactions }) => {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Transactions</h3>
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Sender</th>
              <th>Fee</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, index) => (
              <tr key={index}>
                <td>{index}</td>
                <td>
                  <span className={`badge badge-${txTypes[tx.type]?.badge || 'warning'}`}>
                    {txTypes[tx.type]?.name || 'Unknown'}
                  </span>
                </td>
                <td className="truncate max-w-[200px]">
                  {tx.from && tx.from[0] ? tx.from[0].publicKey : getTxSenderType(tx)}
                </td>
                <td>{formatFees(calculateFees(tx))}</td>
                <td>
                  <button 
                    className="button button-primary text-sm"
                    onClick={() => toggleTxDetails(index)}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Block View Component
const BlockView = ({ hash }) => {
  const [block, setBlock] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchBlock();
  }, [hash]);

  const fetchBlock = async () => {
    try {
      const response = await fetch(`/explorerx/json-block/${hash}`);
      const data = await response.json();
      setBlock(data);
    } catch (err) {
      console.error('Error fetching block:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!block) return <div>Block not found</div>;

  return (
    <>
      <Header />
      <div className="explorer-main">
        <div className="container">
          <BlockCard block={block} />
          <TransactionList transactions={block.transactions} />
        </div>
      </div>
    </>
  );
};

const BalanceDisplay = ({ address, balance }) => {
  const saito = BigInt(balance) / BigInt(100000000);
  const nolan = BigInt(balance);
  
  return (
    <div className="balance-display">
      <div className="balance-row">
        <div>
          <div className="balance-label">Address</div>
          <div className="balance-address">{address}</div>
        </div>
        <div>
          <div className="balance-label">SAITO</div>
          <div className="balance-amount">{saito.toString()}</div>
        </div>
        <div>
          <div className="balance-label">NOLAN</div>
          <div className="balance-amount">{nolan.toString()}</div>
        </div>
      </div>
    </div>
  );
};

const AllBalancesDisplay = ({ balances }) => {
  return (
    <div className="balance-display">
      <div className="balance-row balance-header">
        <div className="balance-label">Address</div>
        <div className="balance-label">SAITO</div>
        <div className="balance-label">NOLAN</div>
      </div>
      {Object.entries(balances).map(([address, balance]) => (
        <div key={address} className="balance-row">
          <div className="balance-address">{address}</div>
          <div className="balance-amount">
            {(BigInt(balance) / BigInt(100000000)).toString()}
          </div>
          <div className="balance-amount">
            {(BigInt(balance) % BigInt(100000000)).toString()}
          </div>
        </div>
      ))}
    </div>
  );
};

// Main Explorer App Component
const ExplorerApp = ({ initialPage }) => {
  const [view, setView] = React.useState('blocks');
  const [blocks, setBlocks] = React.useState([]);
  const [balanceData, setBalanceData] = React.useState(null);
  const [allBalances, setAllBalances] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [hasMore, setHasMore] = React.useState(true);
  const [page, setPage] = React.useState(0);
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    fetchBlocks();
    
    // Set up block listener using the module's app instance
    const module = document.querySelector('.explorer-main')?.__module;
    if (module?.app?.blockchain) {
      module.app.connection.on('block-added', handleNewBlock);
    }

    // Cleanup listener on unmount
    return () => {
      if (module?.app?.connection) {
        module.app.connection.off('block-added', handleNewBlock);
      }
    };
  }, []);

  const handleNewBlock = async (newBlock) => {
    if (view === 'blocks') {
      try {
        const formattedBlock = {
          id: newBlock.block.id,
          hash: newBlock.block.hash,
          creator: newBlock.block.creator,
          timestamp: newBlock.block.timestamp,
          transactions: newBlock.transactions || []
        };
        setBlocks(prevBlocks => [formattedBlock, ...prevBlocks.slice(0, 9)]);
      } catch (err) {
        console.error('Error handling new block:', err);
      }
    }
  };

  const fetchBlocks = async () => {
    try {
      const response = await fetch(`/explorerx/blocks/${page}`);
      const data = await response.json();
      
      if (data.blocks.length < 10) {
        setHasMore(false);
      }
      
      setBlocks(prevBlocks => [...prevBlocks, ...data.blocks]);
      setPage(prevPage => prevPage + 1);
    } catch (err) {
      console.error('Error fetching blocks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (e) => {
    if (!containerRef.current || !hasMore || loading) return;
    
    const { scrollTop, clientHeight, scrollHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      fetchBlocks();
    }
  };

  const processBalanceData = (rawData) => {
    const lines = rawData.split(/\n/).filter(Boolean);
    const balance_list = {};
    
    // Start from index 1 to skip filename in first line
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(/\s/);
      if (balance_list.hasOwnProperty(row[0])) {
        balance_list[row[0]] = Number(balance_list[row[0]]) + Number(row[4]);
      } else {
        balance_list[row[0]] = Number(row[4]);
      }
    }
    return balance_list;
  };

  const handleSearch = async (type, value) => {
    try {
      if (type === 'block') {
        const response = await fetch(`/explorerx/json-block/${value}`);
        const data = await response.json();
        setBlocks([data]);
        setBalanceData(null);
        setAllBalances(null);
        setView('blocks');
      } 
      else if (type === 'address') {
        const response = await fetch(`/balance/${value}`);
        const rawData = await response.text();
        const balances = processBalanceData(rawData);
        setBalanceData({ 
          address: value, 
          balance: balances[value] || 0 
        });
        setBlocks([]);
        setAllBalances(null);
        setView('address');
      } 
      else if (type === 'all-balances') {
        const response = await fetch('/balance/');
        const rawData = await response.text();
        const balances = processBalanceData(rawData);
        setAllBalances(balances);
        setBlocks([]);
        setBalanceData(null);
        setView('all-balances');
      }
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  const handleBackToBlocks = async () => {
    setView('blocks');
    setBalanceData(null);
    setAllBalances(null);
    // Fetch fresh blocks when returning
    const response = await fetch('/explorerx/blocks/0');
    const data = await response.json();
    setBlocks(data.blocks);
  };

  const renderContent = () => {
    switch (view) {
      case 'address':
        return (
          <>
            <button className="back-button" onClick={handleBackToBlocks}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back to Blocks
            </button>
            <BalanceDisplay {...balanceData} />
          </>
        );
      
      case 'all-balances':
        return (
          <>
            <button className="back-button" onClick={handleBackToBlocks}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back to Blocks
            </button>
            <AllBalancesDisplay balances={allBalances} />
          </>
        );
      
      default:
        return blocks.map(block => (
          <BlockCard key={block.hash} block={block} />
        ));
    }
  };

  if (loading && blocks.length === 0) {
    return (
      <div className="explorer-main">
        <div className="container">
          <div className="flex items-center justify-center p-4">
            Loading blocks...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="explorer-wrapper">
      <Header onSearch={handleSearch} />
      <div 
        className="explorer-scroll-container"
        ref={containerRef}
        onScroll={handleScroll}
      >
        <div className="explorer-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

// Make components available globally
window.ExplorerApp = ExplorerApp;
window.BlockView = BlockView;

const toggleTxDetails = (index) => {
  const element = document.getElementById(`tx-${index}`);
  element?.classList.toggle('hidden');
};
