const express = require('express');
const cors = require('cors');
const axios = require('axios');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:8888/callback';
const FRONTEND_URI = process.env.FRONTEND_URI || 'http://localhost:3000';

const app = express();
const PORT = process.env.PORT || 8888;

app.use(express.json());
app.use(cors());
app.use(cookieParser());

// Authentication routes
app.get('/login', (req, res) => {
  const scope = 'user-read-private user-read-email playlist-modify-public playlist-modify-private user-top-read user-follow-read';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: CLIENT_ID,
      scope: scope,
      redirect_uri: REDIRECT_URI,
    }));
});

app.get('/callback', async (req, res) => {
  const code = req.query.code || null;

  try {
    const response = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      data: querystring.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI
      }),
      headers: {
        'Authorization': 'Basic ' + (Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (response.status === 200) {
      const { access_token, refresh_token } = response.data;

      // Redirect to frontend with tokens
      res.redirect(`${FRONTEND_URI}/?access_token=${access_token}&refresh_token=${refresh_token}`);
    } else {
      res.redirect(`${FRONTEND_URI}/?error=invalid_token`);
    }
  } catch (error) {
    res.redirect(`${FRONTEND_URI}/?error=invalid_token`);
  }
});

// New generatePlaylist function using non-deprecated endpoints
async function generatePlaylist(accessToken, mood, genres, numSongs) {
  try {
    // Track collection to store our results
    let allTracks = [];
    const processedTrackIds = new Set();
    const moodTerms = getMoodSearchTerms(mood);
    
    // Get user's top tracks for personalization
    let topArtistIds = [];
    try {
      const topArtistsResponse = await axios.get('https://api.spotify.com/v1/me/top/artists', {
        headers: { 'Authorization': `Bearer ${accessToken}` },
        params: { limit: 5, time_range: 'medium_term' }
      });
      
      if (topArtistsResponse.data && topArtistsResponse.data.items) {
        topArtistIds = topArtistsResponse.data.items.map(artist => artist.id);
      }
    } catch (err) {
      // If we can't get top artists, just continue
      console.log('Could not fetch user top artists:', err.message);
    }
    
    // For each genre, search for tracks
    for (const genre of genres) {
      if (allTracks.length >= numSongs * 3) break; // Get more than needed for filtering
      
      // Try different search combinations to get diverse results
      const searchQueries = [
        `genre:${genre} ${moodTerms[0]}`,
        `${genre} ${moodTerms[1]}`,
        `${genre} ${mood}`
      ];
      
      for (const query of searchQueries) {
        if (allTracks.length >= numSongs * 3) break;
        
        try {
          const searchResponse = await axios.get('https://api.spotify.com/v1/search', {
            headers: { 'Authorization': `Bearer ${accessToken}` },
            params: {
              q: query,
              type: 'track',
              limit: 50
            }
          });
          
          if (searchResponse.data && searchResponse.data.tracks && searchResponse.data.tracks.items) {
            for (const track of searchResponse.data.tracks.items) {
              if (!processedTrackIds.has(track.id)) {
                allTracks.push(track);
                processedTrackIds.add(track.id);
              }
            }
          }
        } catch (searchError) {
          console.error(`Error searching with query "${query}":`, searchError.message);
          continue;
        }
      }
      
      // If we have top artists, add some of their tracks
      if (topArtistIds.length > 0 && allTracks.length < numSongs * 3) {
        for (const artistId of topArtistIds) {
          if (allTracks.length >= numSongs * 3) break;
          
          try {
            // Get artist's top tracks
            const artistTracksResponse = await axios.get(
              `https://api.spotify.com/v1/artists/${artistId}/top-tracks`, {
              headers: { 'Authorization': `Bearer ${accessToken}` },
              params: { market: 'US' }
            });
            
            if (artistTracksResponse.data && artistTracksResponse.data.tracks) {
              for (const track of artistTracksResponse.data.tracks) {
                if (!processedTrackIds.has(track.id)) {
                  allTracks.push(track);
                  processedTrackIds.add(track.id);
                }
              }
            }
          } catch (artistError) {
            console.error(`Error getting tracks for artist ${artistId}:`, artistError.message);
            continue;
          }
        }
      }
    }
    
    // If we couldn't find enough tracks, try searching for mood directly
    if (allTracks.length < numSongs) {
      try {
        const moodSearchResponse = await axios.get('https://api.spotify.com/v1/search', {
          headers: { 'Authorization': `Bearer ${accessToken}` },
          params: {
            q: `${mood} music`,
            type: 'track',
            limit: 50
          }
        });
        
        if (moodSearchResponse.data && moodSearchResponse.data.tracks && moodSearchResponse.data.tracks.items) {
          for (const track of moodSearchResponse.data.tracks.items) {
            if (!processedTrackIds.has(track.id)) {
              allTracks.push(track);
              processedTrackIds.add(track.id);
            }
          }
        }
      } catch (moodSearchError) {
        console.error('Error searching by mood:', moodSearchError.message);
      }
    }
    
    // Score tracks based on user input and sort
    const scoredTracks = allTracks.map(track => {
      let score = 0;
      
      // Score by genre match
      if (track.artists.some(artist => 
        artist.genres && genres.some(g => artist.genres.includes(g)))) {
        score += 3;
      }
      
      // Score by popularity (balance between too popular and too obscure)
      if (track.popularity > 20 && track.popularity < 80) {
        score += 2;
      }
      
      // If track is from user's top artists, give bonus
      if (track.artists.some(artist => topArtistIds.includes(artist.id))) {
        score += 4;
      }
      
      return { track, score };
    });
    
    // Sort by score and take the number of songs requested
    scoredTracks.sort((a, b) => b.score - a.score);
    return scoredTracks.slice(0, numSongs).map(item => item.track);
    
  } catch (error) {
    console.error('Error in generatePlaylist:', error.message);
    return [];
  }
}

// Helper function to map mood to search terms
function getMoodSearchTerms(mood) {
  const moodMap = {
    'energetic': ['upbeat', 'fast tempo', 'high energy'],
    'happy': ['uplifting', 'cheerful', 'feel good'],
    'chill': ['relaxing', 'laid back', 'mellow'],
    'relaxed': ['calm', 'peaceful', 'ambient'],
    'focus': ['concentration', 'background', 'study'],
    'sad': ['melancholy', 'emotional', 'heartbreak']
  };

  return moodMap[mood.toLowerCase()] || ['popular', 'hits'];
}

// Update the API endpoint
app.post('/api/generate-playlist', async (req, res) => {
  const {
    accessToken,
    mood,
    genres,
    numSongs, // Changed from duration
    playlistName
  } = req.body;

  try {
    // Get track recommendations using our updated function
    const trackResults = await generatePlaylist(accessToken, mood, genres, numSongs);

    if (trackResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Could not find enough tracks matching your criteria'
      });
    }

    // Create the playlist
    const userResponse = await axios.get('https://api.spotify.com/v1/me', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    const userId = userResponse.data.id;

    const playlistResponse = await axios.post(
      `https://api.spotify.com/v1/users/${userId}/playlists`,
      {
        name: playlistName || `${mood} Playlist`,
        description: 'Generated with Spotify Playlist Generator',
        public: true
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const playlistId = playlistResponse.data.id;
    const trackUris = trackResults.map(track => track.uri);

    await axios.post(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        uris: trackUris
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({
      success: true,
      playlist: playlistResponse.data,
      tracks: trackResults
    });
  } catch (error) {
    console.error('Error generating playlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate playlist',
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});