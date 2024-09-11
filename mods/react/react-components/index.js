import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';



function App() {
  let react = window.saito.modules.returnModule('React')
  console.log(react, 'react mod');


  useEffect(() => {
    react.onConfirmation = function(blk, tx) {
      console.log('confirmation, react mod')
    }
    react.handlePeerTransaction = function(blk, tx) {
      console.log('peer transaction,', blk, tx)
    }
  }, []);

  return (
    <div>
      <h1>Hello from React and Saito!</h1>
    </div>
  );
}

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);
root.render(<App />);
