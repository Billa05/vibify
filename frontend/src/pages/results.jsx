import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

function ResultsPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-bold mb-8">Your Generated Playlist</h1>
      <div className="bg-gray-900 p-6 rounded-lg mb-8">
        <h2 className="text-2xl font-semibold mb-4">Awesome Mix</h2>
        <ul className="list-disc list-inside">
          <li>Song 1 - Artist 1</li>
          <li>Song 2 - Artist 2</li>
          <li>Song 3 - Artist 3</li>
          <li>Song 4 - Artist 4</li>
          <li>Song 5 - Artist 5</li>
        </ul>
      </div>
      <Link to="/generate">
        <Button variant="outline" className="mr-4 text-black">
          Generate Another
        </Button>
      </Link>
      <Button className="bg-green-500 hover:bg-green-600 text-white">Save to Spotify</Button>
    </div>
  );
}

export default ResultsPage;