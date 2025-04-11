import React, { useEffect, useState } from 'react';
import SlipTable from './SlipTable'; // Import the reusable component

// Helper to format BigInt balance 
const formatSaitoBalance = (nolanString) => {
  try {
    const nolan = BigInt(nolanString || 0);
    const saito = Number(nolan) / 100000000; 
    return saito.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 8 });
  } catch (e) {
    console.error("Error formatting balance:", e);
    return "Error";
  }
};

const BalanceList = ({ mod }) => {
  const [aggregatedData, setAggregatedData] = useState({});
  const [status, setStatus] = useState('loading');
  const [expandedAddress, setExpandedAddress] = useState(null); // Track which address's slips are shown

  useEffect(() => {
    const fetchAndProcessBalances = async () => {
      setStatus('loading');
      try {
        // TODO: Replace with actual API call
        console.log("BalanceList: Fetching from /balance/all");
        // const response = await fetch(`/${mod.name}/api/balance/all`); // Assumes endpoint exists
        const response = await fetch(`/balance/all`); // Use core endpoint for now
        
        if (!response.ok) {
          let errorText = `HTTP error! status: ${response.status}`;
          try { errorText = await response.text() || errorText; } catch (e) {} 
          throw new Error(errorText);
        }
        const textData = await response.text();
        console.log("BalanceList: Received text data from /balance/all");

        const data = {};
        const lines = textData.trim().split('\n');
        console.log(`BalanceList: Processing ${lines.length} lines`);

        lines.forEach(line => {
            if (!line.trim()) return;
            const columns = line.trim().split(/\s+/); 
            if (columns.length === 5) { // address, block, tx, slip, amount
                const address = columns[0];
                const amount = BigInt(columns[4] || 0);
                const slipData = [
                    `${columns[0]}-${columns[1]}-${columns[2]}-${columns[3]}`, // key
                    columns[1], // block
                    columns[2], // tx
                    columns[3], // slip
                    columns[4]  // nolan amount string
                ];

                if (!data[address]) {
                    data[address] = { balanceNolan: BigInt(0), slips: [] };
                }
                data[address].balanceNolan += amount;
                data[address].slips.push(slipData);
            }
        });
        
        console.log("BalanceList: Aggregated Data:", data);
        setAggregatedData(data);
        setStatus('success');

      } catch (error) {
        console.error("Error fetching or processing balance list:", error);
        setStatus('error');
      }
    };

    fetchAndProcessBalances();
  // }, [mod]); // Depend on mod if using mod-specific API
  }, []); // Fetch only once on mount

  const toggleSlips = (address) => {
    setExpandedAddress(prev => (prev === address ? null : address));
  };

  if (status === 'loading') {
    return <div>Loading balances...</div>;
  }

  if (status === 'error') {
    return <div className="error-message">Error loading balances.</div>;
  }

  const sortedAddresses = Object.keys(aggregatedData).sort();

  return (
    <div className="balance-list-card">
      <h2>All Balances</h2>
      <table className="saito-table balance-list-table">
        <thead>
          <tr>
            <th>Address</th>
            <th className="numeric-column">Slips</th>
            <th className="numeric-column">Balance (SAITO)</th>
            <th className="numeric-column">Balance (Nolan)</th>
          </tr>
        </thead>
        <tbody>
          {sortedAddresses.length === 0 && (
            <tr><td colSpan="4">No balances found.</td></tr>
          )}
          {sortedAddresses.map((address) => {
            const data = aggregatedData[address];
            const balanceNolanStr = data.balanceNolan.toString();
            const slipCount = data.slips.length;
            const isExpanded = expandedAddress === address;

            return (
              <React.Fragment key={address}>
                <tr onClick={() => toggleSlips(address)} style={{ cursor: 'pointer' }} className={isExpanded ? 'expanded-row' : ''}>
                  <td className="mono-data">{address}</td>
                  <td className="numeric-column">{slipCount}</td>
                  <td className="numeric-column">{formatSaitoBalance(balanceNolanStr)}</td>
                  <td className="mono-data numeric-column">{balanceNolanStr}</td>
                </tr>
                {isExpanded && (
                  <tr className="slip-details-row">
                    <td colSpan="4">
                      <SlipTable slips={data.slips} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default BalanceList; 