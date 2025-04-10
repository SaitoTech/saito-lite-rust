import React from 'react';

// Helper to format BigInt balance (copied from WalletCard - consider moving to a shared util file)
const formatSaitoBalance = (nolanString) => {
  try {
    const nolan = BigInt(nolanString || 0);
    const saito = Number(nolan) / 100000000; // Convert Nolan to Saito
    return saito.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 8 });
  } catch (e) {
    console.error("Error formatting balance:", e);
    return "Error";
  }
};

const SlipsTable = ({ slips }) => {
  if (!slips || slips.length === 0) {
    return <p>No slips found.</p>;
  }

  return (
    <div className="slips-table-container">
      <table className="saito-table slips-table">
        <thead>
          <tr>
            <th>Block</th>
            <th>TX</th>
            <th>Slip</th>
            <th>Nolan</th>
            <th>Saito</th>
          </tr>
        </thead>
        <tbody>
          {slips.map((slip, index) => (
            // Use a more robust key if available, index is fallback
            <tr key={slip[0] || `slip-${index}`}>
              <td>{slip[1]}</td>
              <td>{slip[2]}</td>
              <td>{slip[3]}</td>
              <td className="mono-data nolan-column">{slip[4]}</td>
              <td className="saito-column">{formatSaitoBalance(slip[4])}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SlipsTable;
