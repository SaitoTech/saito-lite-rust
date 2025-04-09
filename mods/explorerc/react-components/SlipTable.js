import React from 'react';

// Helper to format BigInt balance (can be imported or passed as prop)
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

const SlipTable = ({ slips }) => {
  if (!slips || slips.length === 0) {
    return <p>No slips found.</p>;
  }

  // Assuming slips is an array of arrays: 
  // [key, Block, TX, Slip, NolanAmountString]
  
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
            <tr key={slip[0] || index}> {/* Use provided key or index */} 
              <td>{slip[1]}</td> {/* Block */}
              <td>{slip[2]}</td> {/* TX */}
              <td>{slip[3]}</td> {/* Slip */}
              <td className="mono-data nolan-column">{slip[4]}</td> {/* Nolan */}
              <td className="saito-column">{formatSaitoBalance(slip[4])}</td> {/* Saito */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SlipTable; 