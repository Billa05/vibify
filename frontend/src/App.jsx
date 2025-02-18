import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import GeneratePage from './pages/generate';
import ResultsPage from './pages/results';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/generate" element={<GeneratePage />} />
      <Route path="/results" element={<ResultsPage />} />
    </Routes>
  );
}

export default App;