import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import "./css/results.css";

function ResultsPage() {
  return (
    <div>
      <Navbar />
      <div className="results-container">
        <h1 className="title">Your Generated Playlist</h1>
        <div className="playlist">
          <h2 className="playlist-title">Awesome Mix</h2>
          <ul className="playlist-list">
            <li>Song 1 - Artist 1</li>
            <li>Song 2 - Artist 2</li>
            <li>Song 3 - Artist 3</li>
            <li>Song 4 - Artist 4</li>
            <li>Song 5 - Artist 5</li>
          </ul>
        </div>
        <div className="button-container">
          <Link to="/mood">
            <button className="generate-button">Generate Another</button>
          </Link>
          <button className="save-button">Save to Spotify</button>
        </div>
      </div>
    </div>
  );
}

export default ResultsPage;