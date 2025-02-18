import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <h1 className="text-5xl font-bold mb-8">Spotify Playlist Generator</h1>
      <p className="text-xl mb-8">Create custom playlists based on your preferences</p>
      <Link to="/generate">
        <Button variant="default" size="lg" className="bg-green-500 hover:bg-green-600 text-white">
          Get Started
        </Button>
      </Link>
    </div>
  );
}

export default Home;