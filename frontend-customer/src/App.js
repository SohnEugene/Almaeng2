import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import WeighingPage from './pages/WeighingPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/weighing" element={<WeighingPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
