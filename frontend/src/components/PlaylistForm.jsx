import React, { useState } from 'react';
import '../styles/PlaylistForm.css';

const GENRE_OPTIONS = [
  'pop', 'rock', 'hip-hop', 'electronic', 'indie', 
  'jazz', 'classical', 'r-n-b', 'country', 'metal'
];

const MOOD_OPTIONS = [
  'energetic', 'happy', 'chill', 'relaxed', 'focus', 'sad'
];

const PlaylistForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    playlistName: '',
    mood: 'happy',
    genres: [],
    numSongs: 20 
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleGenreChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setFormData({
        ...formData,
        genres: [...formData.genres, value]
      });
    } else {
      setFormData({
        ...formData,
        genres: formData.genres.filter(genre => genre !== value)
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="playlist-form-container">
      <h1>Create Your Vibe</h1>
      <form onSubmit={handleSubmit} className="playlist-form">
        <div className="form-group">
          <label htmlFor="playlistName">Playlist Name</label>
          <input
            type="text"
            id="playlistName"
            name="playlistName"
            value={formData.playlistName}
            onChange={handleChange}
            placeholder="My Awesome Playlist"
            className="vibify-input"
          />
        </div>

        <div className="form-group mood-section">
          <label htmlFor="mood">Select Mood</label>
          <div className="mood-selector">
            {MOOD_OPTIONS.map(mood => (
              <div 
                key={mood} 
                className={`mood-option ${formData.mood === mood ? 'selected' : ''}`}
                onClick={() => setFormData({...formData, mood: mood})}
              >
                {mood.charAt(0).toUpperCase() + mood.slice(1)}
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Genres <span className="subtitle">(select up to 5)</span></label>
          <div className="genres-grid">
            {GENRE_OPTIONS.map(genre => (
              <div 
                key={genre} 
                className={`genre-item ${formData.genres.includes(genre) ? 'selected' : ''}`}
                onClick={() => {
                  if (formData.genres.includes(genre)) {
                    setFormData({
                      ...formData,
                      genres: formData.genres.filter(g => g !== genre)
                    });
                  } else if (formData.genres.length < 5) {
                    setFormData({
                      ...formData,
                      genres: [...formData.genres, genre]
                    });
                  }
                }}
              >
                {genre.charAt(0).toUpperCase() + genre.slice(1)}
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="numSongs">
            Number of Songs: <span className="song-count">{formData.numSongs}</span>
          </label>
          <input
            type="range"
            id="numSongs"
            name="numSongs"
            min="5"
            max="50"
            step="5"
            value={formData.numSongs}
            onChange={handleChange}
            className="slider"
          />
          <div className="range-labels">
            <span>5</span>
            <span>50</span>
          </div>
        </div>

        <button 
          type="submit" 
          className="generate-button"
          disabled={formData.genres.length === 0 || isLoading}
        >
          {isLoading ? 'Creating Your Vibe...' : 'Generate Playlist'}
        </button>
      </form>
    </div>
  );
};

export default PlaylistForm;