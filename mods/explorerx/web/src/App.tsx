import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import BlockDetails from './components/BlockDetails';
import BlockList from './components/BlockList';
import Header from './components/Header';
import WalletBalance from './components/WalletBalance';

const App: React.FC = () => {
  return (
    <BrowserRouter basename="/explorerx">
      <div className="app">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<BlockList />} />
            <Route path="/block/:hash" element={<BlockDetails />} />
            <Route path="/balance/:address" element={<WalletBalance />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App; 