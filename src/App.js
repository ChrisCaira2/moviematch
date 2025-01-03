import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import MovieSearch from './components/MovieSearch';
import Favorites from './components/Favorites';
import MovieRecommendations from './components/MovieRecommendations';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<MovieSearch />} />
        <Route path="/favorites" element={<Favorites />} />
        {/* <Route path="/recommendations" element={<MovieRecommendations />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
