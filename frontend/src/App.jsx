import React, { useState, useEffect } from 'react';
import './App.css';
import LoginButton from './components/LoginButton.jsx';
import PlaylistForm from './components/PlaylistForm.jsx';
import PlaylistResult from './components/PlaylistResult.jsx';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';

function App() {
  const [accessToken, setAccessToken] = useState('');
  const [playlist, setPlaylist] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Extract token from URL parameters (from OAuth redirect)
    const params = new URLSearchParams(window.location.search);
    const token = params.get('access_token');

    if (token) {
      setAccessToken(token);
      // Clean URL
      window.history.replaceState({}, document.title, '/');
    }
  }, []);

  const handleGeneratePlaylist = async (playlistParams) => {
    setIsLoading(true);
    setError('');
  
    try {
      const response = await fetch('http://localhost:8888/api/generate-playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken,
          ...playlistParams
        }),
      });
  
      const data = await response.json();
  
      if (data.success) {
        setPlaylist(data);
      } else {
        setError(data.message || 'Failed to generate playlist');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <Navbar />

      <main>
        {!accessToken ? (
          <Hero onLogin={() => window.location.href = 'http://localhost:8888/login'} />
        ) : (
          <div className="content">
            {!playlist ? (
              <PlaylistForm
                onSubmit={handleGeneratePlaylist}
                isLoading={isLoading}
                accessToken={accessToken}
              />
            ) : (
              <PlaylistResult playlist={playlist} onCreateNew={() => setPlaylist(null)} />
            )}

            {error && <div className="error-message">{error}</div>}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;