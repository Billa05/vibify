import React from 'react';
import '../styles/PlaylistResult.css';
import spotify from "../assets/spotify.png";
const PlaylistResult = ({ playlist, onCreateNew }) => {
  return (
    <div className="playlist-result-container">
      <h1>Playlist Created!</h1>

      <div className="playlist-result">
        <div className="playlist-header">
          <img
            src={spotify}
            alt="Playlist cover"
            className="playlist-cover"
          />
          <div className="playlist-details">
            <h3>{playlist.playlist.name}</h3>
            <p className="playlist-description">{playlist.playlist.description}</p>
            <p className="song-count">{playlist.tracks.length} songs</p>
            <a
              href={playlist.playlist.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="spotify-link"
            >
              Open in Spotify
            </a>
          </div>
        </div>

        <div className="tracks-list">
          <h4>Tracks</h4>
          <ul>
            {playlist.tracks.map((track, index) => (
              <li key={track.id} className="track-item">
                <span className="track-number">{index + 1}</span>
                {track.album && track.album.images && track.album.images.length > 0 && (
                  <img
                    src={track.album.images[track.album.images.length - 1].url}
                    alt={track.album.name}
                    className="track-image"
                  />
                )}
                <div className="track-info">
                  <span className="track-title">{track.name}</span>
                  <span className="track-artist">
                    {track.artists.map(artist => artist.name).join(', ')}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <button onClick={onCreateNew} className="generate-button">
        Create Another Playlist
      </button>
    </div>
  );
};

export default PlaylistResult;