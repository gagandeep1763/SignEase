import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import SignConcepts from './pages/SignConcepts';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/sign-concepts" element={<SignConcepts />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
