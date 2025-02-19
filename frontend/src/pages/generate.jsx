import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import "./css/generate.css";

const moods = ["Happy", "Sad", "Energetic", "Relaxed", "Focused"];
const genres = ["Pop", "Rock", "Hip Hop", "Electronic", "Classical", "Jazz"];

function GeneratePage() {
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
    <div className="container">
      <h1 className="title">Generate Your Playlist</h1>
      <div className="grid">
        <Card className="card">
          <CardHeader>
            <CardTitle>Select Moods</CardTitle>
          </CardHeader>
          <CardContent>
            {moods.map((mood) => (
              <div key={mood} className="item">
                <input
                  type="checkbox"
                  id={`mood-${mood}`}
                  checked={selectedMoods.includes(mood)}
                  onChange={() => handleMoodChange(mood)}
                  className="checkbox"
                />
                <label htmlFor={`mood-${mood}`}>{mood}</label>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="card">
          <CardHeader>
            <CardTitle>Select Genres</CardTitle>
          </CardHeader>
          <CardContent>
            {genres.map((genre) => (
              <div key={genre} className="item">
                <input
                  type="checkbox"
                  id={`genre-${genre}`}
                  checked={selectedGenres.includes(genre)}
                  onChange={() => handleGenreChange(genre)}
                  className="checkbox"
                />
                <label htmlFor={`genre-${genre}`}>{genre}</label>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Button onClick={handleSubmit} className="generate-button">
        Generate Playlist
      </Button>
    </div>
  );
}

export default GeneratePage;