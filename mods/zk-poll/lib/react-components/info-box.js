import React, { useState, useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';

const ZKInfoBox = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // const zkInfoHidden = localStorage.getItem('zkInfoHidden');
    // if (zkInfoHidden === 'true') {
    //   setIsVisible(false);
    // }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('zkInfoHidden', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="zk-info-box">
      <div onClick={handleDismiss} className="zk-info-close">
        <X size={18} />
      </div>
      <div className="zk-info-header">
        <ShieldCheck className="zk-icon" />
        <span className="zk-title">Powered by Zero-Knowledge Proofs</span>
      </div>
      <div className="zk-info-content">
This polling system leverages zero-knowledge proofs (ZK-SNARKs) to ensure complete voter anonymity while maintaining verifiable fairness. Voters can participate without revealing their identity. To learn how to integrate zero-knowledge proofs with Saito, check out our <a href="https://wiki.saito.io/en/tech/zk-proofs" target="_blank" rel="noopener noreferrer">ZK integration guide</a>.
</div>
    </div>
  );
};

export default ZKInfoBox;