import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import ResultsPage from './pages/results';
import "./App.css"
import Mood from './pages/mood';
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/mood" element={<Mood />} />
      <Route path="/results" element={<ResultsPage />} />
    </Routes>
  );
}

export default App;