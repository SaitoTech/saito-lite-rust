import React, { useEffect, useState } from 'react';

const NodeInfo = ({ app, mod }) => {
  const [publicKey, setPublicKey] = useState('Loading...');
  const [balance, setBalance] = useState('Loading...');
  const [mempoolCount, setMempoolCount] = useState('Loading...');
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setError(null);

    const fetchData = async () => {
      try {
        // Get Public Key
        const pk = mod?.publicKey || await app.wallet.getPublicKey();
        if (isMounted) setPublicKey(pk);

        // Get Balance (assuming client wallet balance for now)
        // This might need adjustment depending on whether you want client or node balance
        const balNolan = await app.wallet.getBalance(); 
        const balSaito = parseFloat(BigInt(balNolan) / BigInt(100000000)).toFixed(4);
        if (isMounted) setBalance(balSaito);

        // Get Mempool Count (Requires API endpoint implementation)
        try {
          const response = await fetch(`/${mod.name}/api/mempool`);
          if (!response.ok) {
              throw new Error(`API Error: ${response.status} ${response.statusText}`);
          }
          const data = await response.json();
          // Assuming the API returns { transactions: [...] } or similar
          const count = data?.transactions?.length ?? data?.count ?? 'N/A'; 
          if (isMounted) setMempoolCount(count);
        } catch (apiError) {
            console.error("Error fetching mempool count:", apiError);
            if (isMounted) setMempoolCount('Error');
            // Optionally set a specific error state for this part
        }

      } catch (err) {
        console.error("Error fetching node info:", err);
        if (isMounted) setError('Failed to load node information.');
      }
    };

    fetchData();

    return () => {
      isMounted = false; // Cleanup function to prevent state updates on unmounted component
    };
  }, [app, mod]); // Dependencies for useEffect

  return (
    <div className="node-info-box">
      <h3>Node Info</h3>
      {error ? (
        <div className="error-message">{error}</div>
      ) : (
        <ul>
          <li>
            <span>Address:</span>
            <code className="mono-data node-info-key">{publicKey}</code>
          </li>
          <li>
            <span>Balance:</span>
            <span className="mono-data">{balance}</span> SAITO
          </li>
          <li>
            <span>Mempool Txs:</span>
            <span className="mono-data">{mempoolCount}</span>
          </li>
        </ul>
      )}
    </div>
  );
};

export default NodeInfo; 