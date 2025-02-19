import React, { useState } from "react";
import "./css/mood.css";
import Navbar from "../components/Navbar/Navbar";

const moods = ["Happy", "Sad", "Angry", "Chill", "Stressed", "In Love"];
const genres = ["Pop", "Rock", "Hip Hop", "Electronic", "Classical", "Jazz"];

function Mood() {
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);

  const handleMoodChange = (mood) => {
    setSelectedMoods((prev) => (prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood]));
  };

  const handleGenreChange = (genre) => {
    setSelectedGenres((prev) => (prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]));
  };

  const handleSubmit = () => {
    console.log("Generating playlist with:", { selectedMoods, selectedGenres });
    window.location.href = "/results";
  };

  return (
    <div>
      <Navbar />
      <div className="mood-container">
        <h1 className="title">Generate Your Playlist</h1>
        <div className="grid">
          <div className="card">
            <h2 className="card-title">Select Moods</h2>
            <div className="card-content">
              {moods.map((mood) => (
                <div key={mood} className="item">
                  <button
                    className={`mood-btn ${selectedMoods.includes(mood) ? "selected" : ""}`}
                    onClick={() => handleMoodChange(mood)}
                  >
                    {mood}
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <h2 className="card-title">Select Genres</h2>
            <div className="card-content">
              {genres.map((genre) => (
                <div key={genre} className="item">
                  <button
                    className={`mood-btn ${selectedGenres.includes(genre) ? "selected" : ""}`}
                    onClick={() => handleGenreChange(genre)}
                  >
                    {genre}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <button onClick={handleSubmit} className="generate-button">
          Generate Playlist
        </button>
      </div>
    </div>
  );
}

export default Mood;