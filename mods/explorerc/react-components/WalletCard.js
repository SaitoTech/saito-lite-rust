import React, { useEffect, useState } from 'react';
import SlipTable from './SlipTable'; // Import the new component

// Helper to format BigInt balance (optional, basic)
const formatSaitoBalance = (nolanString) => {
  try {
    const nolan = BigInt(nolanString || 0);
    // Basic formatting, you might have a more sophisticated library/method
    const saito = Number(nolan) / 100000000; // Convert Nolan to Saito
    return saito.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 8 });
  } catch (e) {
    console.error("Error formatting balance:", e);
    return "Error";
  }
};

const WalletCard = ({ address, mod }) => {
  const [balance, setBalance] = useState('Loading...');
  const [slips, setSlips] = useState([]);
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [slipsVisible, setSlipsVisible] = useState(false);

  useEffect(() => {
    const fetchWalletData = async () => {
      setStatus('loading');
      if (!address) { // Removed dependency on mod for this fetch
          setStatus('error');
          console.error("Address not provided to WalletCard");
          return;
      }
      try {
        // Fetch raw text data from the /balance/ endpoint
        console.log(`WalletCard: Fetching from /balance/${address}`);
        const response = await fetch(`/balance/${address}`); 
        if (!response.ok) {
           // Try to get error text, but default if not available
           let errorText = `HTTP error! status: ${response.status}`;
           try { errorText = await response.text() || errorText; } catch (e) { /* ignore */ }
           throw new Error(errorText);
        }
        const textData = await response.text();
        console.log(`WalletCard: Received text data for ${address}`);

        let calculatedBalance = BigInt(0);
        let parsedSlips = [];
        const lines = textData.trim().split('\n');

        console.log(`WalletCard: Processing ${lines.length} lines for address ${address}`);

        lines.forEach(line => {
            if (!line.trim()) return; // Skip empty lines
            const columns = line.trim().split(/\s+/); // Split by one or more whitespace
            
            // Expecting 5 columns: address, block, tx, slip, amount
            if (columns.length === 5 && columns[0] === address) {
                try {
                    const amount = BigInt(columns[4]);
                    calculatedBalance += amount;
                    // Format for slips table: [hiddenKey, Block, TX, Slip, Nolan]
                    const slipData = [
                        `${columns[0]}-${columns[1]}-${columns[2]}-${columns[3]}`, // Key
                        columns[1], // Block
                        columns[2], // TX
                        columns[3], // Slip
                        columns[4]  // Nolan (amount as string)
                    ];
                    parsedSlips.push(slipData);
                } catch (e) {
                    console.warn(`WalletCard: Skipping line due to parsing error (BigInt?): "${line}"`, e);
                }
            }
        });
        
        console.log(`WalletCard: Calculated Balance: ${calculatedBalance.toString()}, Slips found: ${parsedSlips.length}`);

        setBalance(calculatedBalance.toString()); 
        setSlips(parsedSlips);
        setStatus('success');

      } catch (error) {
        console.error(`WalletCard: Error fetching or processing wallet data for ${address}:`, error);
        setBalance('Error');
        setSlips([]);
        setStatus('error');
      }
    };

    fetchWalletData();
  //}, [address, mod]); // mod no longer needed for this specific fetch
  }, [address]); // Refetch only if address changes

  const toggleSlipsVisibility = () => {
    setSlipsVisible(!slipsVisible);
  };

  // Calculate total Nolan from the last column of slips array
  // const totalNolan = slips.reduce((sum, slip) => {
  //   const nolan = BigInt(slip[slip.length - 1] || 0); // Assuming last element is Nolan amount
  //   return sum + nolan;
  // }, BigInt(0));
  // Note: Balance is directly provided by API now, no need to sum slips here.

  return (
    <div className="node-info-card">
      <div className="node-info-header">Wallet Details</div>
      <div className="node-info-body">
        <p>
          <span className="node-info-label">Address:</span>
          <code className="mono-data">{address}</code>
        </p>
        <p>
          <span className="node-info-label">Balance:</span>
          <code className="mono-data"> 
            {status === 'success' ? `${formatSaitoBalance(balance)} SAITO` : balance}
          </code>
        </p>

        {status === 'loading' && <p>Loading wallet details...</p>}
        {status === 'error' && <p className="error-message">Could not load wallet details.</p>}

        {status === 'success' && slips.length > 0 && (
          <div className="slips-section">
            <div className="slips-toggle" onClick={toggleSlipsVisibility}>
              <span className={`slips-toggle-icon ${slipsVisible ? 'expanded' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </span>
              <span>Slips ({slips.length})</span>
            </div>
            {slipsVisible && <SlipTable slips={slips} />}
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletCard;