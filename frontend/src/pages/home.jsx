import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import './css/home.css';

function Home() {
  return (
    <div className="container">
      <h1 className="title">Spotify Playlist Generator</h1>
      <p className="subtitle">Create custom playlists based on your preferences</p>
      <Link to="/generate">
        <Button variant="default" size="lg" className="start-button">
          Get Started
        </Button>
      </Link>
    </div>
  );
}

export default Home;