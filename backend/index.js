// Import packages we need for our app
const express = require('express'); // This helps us make a web server
const cors = require('cors'); // This lets our frontend talk to our backend
const axios = require('axios'); // This helps us make HTTP requests
const querystring = require('querystring'); // This helps format URL parameters
const cookieParser = require('cookie-parser'); // This helps us handle cookies
const dotenv = require('dotenv'); // This loads our secret keys from a file
const path = require('path'); // This helps with file paths

// Load environment variables from .env file
dotenv.config();

// Store our Spotify API keys
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID; // Get client ID from .env file
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET; // Get client secret from .env file
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:8888/callback'; // Where Spotify sends users after login
const FRONTEND_URI = process.env.FRONTEND_URI || 'http://localhost:3000'; // Our React app address

// Create our express app
const app = express();
const PORT = process.env.PORT || 8888; // The port our server will run on

// Set up middleware (stuff that processes requests)
app.use(express.json()); // This lets us read JSON from requests
app.use(cors()); // This prevents cross-origin errors
app.use(cookieParser()); // This helps us read cookies

// ROUTE 1: Login route - sends users to Spotify to log in
app.get('/login', (req, res) => {
  // These are the permissions we're asking for from Spotify
  const scope = 'user-read-private user-read-email playlist-modify-public playlist-modify-private user-top-read user-follow-read';
  
  // Redirect user to Spotify's login page
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code', // We want an authorization code
      client_id: CLIENT_ID, // Our app's ID
      scope: scope, // The permissions we want
      redirect_uri: REDIRECT_URI, // Where to send the user after login
    }));
});

// ROUTE 2: Callback route - where Spotify sends users after they log in
app.get('/callback', async (req, res) => {
  // Get the authorization code from Spotify
  const code = req.query.code || null;

  try {
    // Exchange the code for access tokens
    const response = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      data: querystring.stringify({
        grant_type: 'authorization_code', // Type of request
        code: code, // The code Spotify gave us
        redirect_uri: REDIRECT_URI // Same redirect URI as before
      }),
      headers: {
        // We need to authenticate our app to Spotify
        'Authorization': 'Basic ' + (Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    // If we got a good response from Spotify
    if (response.status === 200) {
      // Get the tokens from the response
      const { access_token, refresh_token } = response.data;

      // Send the user back to our frontend with the tokens
      res.redirect(`${FRONTEND_URI}/?access_token=${access_token}&refresh_token=${refresh_token}`);
    } else {
      // If something went wrong, send the user back with an error
      res.redirect(`${FRONTEND_URI}/?error=invalid_token`);
    }
  } catch (error) {
    // If there was an error with our code, send the user back with an error
    res.redirect(`${FRONTEND_URI}/?error=invalid_token`);
  }
});

// This function helps us find songs that match the user's mood
function getMoodSearchTerms(mood) {
  // This is a list of keywords that match different moods
  const moodMap = {
    'energetic': ['upbeat', 'fast tempo', 'high energy'],
    'happy': ['uplifting', 'cheerful', 'feel good'],
    'chill': ['relaxing', 'laid back', 'mellow'],
    'relaxed': ['calm', 'peaceful', 'ambient'],
    'focus': ['concentration', 'background', 'study'],
    'sad': ['melancholy', 'emotional', 'heartbreak']
  };

  // Return the matching keywords or default to popular hits
  return moodMap[mood.toLowerCase()] || ['popular', 'hits'];
}

// This is our main function that creates playlists
async function generatePlaylist(accessToken, mood, genres, numSongs) {
  try {
    // Create a list to store all the songs we find
    let allTracks = [];
    
    // This Set helps us avoid duplicate songs
    const processedTrackIds = new Set();
    
    // Get keywords that match the user's mood
    const moodTerms = getMoodSearchTerms(mood);
    
    // Step 1: Try to get the user's favorite artists to personalize the playlist
    let topArtistIds = [];
    try {
      // Ask Spotify for the user's top artists
      const topArtistsResponse = await axios.get('https://api.spotify.com/v1/me/top/artists', {
        headers: { 'Authorization': `Bearer ${accessToken}` },
        params: { limit: 5, time_range: 'medium_term' }
      });
      
      // Store the artist IDs if we got any
      if (topArtistsResponse.data && topArtistsResponse.data.items) {
        topArtistIds = topArtistsResponse.data.items.map(artist => artist.id);
      }
    } catch (err) {
      // If we couldn't get top artists, that's okay, we'll continue anyway
      console.log('Could not fetch user top artists:', err.message);
    }
    
    // Step 2: For each genre the user selected, search for songs
    for (const genre of genres) {
      // Stop if we already have enough songs
      if (allTracks.length >= numSongs * 3) break;
      
      // Try different search combinations to get diverse results
      const searchQueries = [
        `genre:${genre} ${moodTerms[0]}`,
        `${genre} ${moodTerms[1]}`,
        `${genre} ${mood}`
      ];
      
      // Try each search query
      for (const query of searchQueries) {
        if (allTracks.length >= numSongs * 3) break;
        
        try {
          // Search Spotify for tracks matching our query
          const searchResponse = await axios.get('https://api.spotify.com/v1/search', {
            headers: { 'Authorization': `Bearer ${accessToken}` },
            params: {
              q: query,
              type: 'track',
              limit: 50
            }
          });
          
          // Add the songs we found to our list
          if (searchResponse.data && searchResponse.data.tracks && searchResponse.data.tracks.items) {
            for (const track of searchResponse.data.tracks.items) {
              // Only add the song if we haven't seen it before
              if (!processedTrackIds.has(track.id)) {
                allTracks.push(track);
                processedTrackIds.add(track.id);
              }
            }
          }
        } catch (searchError) {
          // If this search failed, log it and try the next one
          console.error(`Error searching with query "${query}":`, searchError.message);
          continue;
        }
      }
      
      // Step 3: Add songs from the user's favorite artists
      if (topArtistIds.length > 0 && allTracks.length < numSongs * 3) {
        for (const artistId of topArtistIds) {
          if (allTracks.length >= numSongs * 3) break;
          
          try {
            // Get this artist's most popular songs
            const artistTracksResponse = await axios.get(
              `https://api.spotify.com/v1/artists/${artistId}/top-tracks`, {
              headers: { 'Authorization': `Bearer ${accessToken}` },
              params: { market: 'US' }
            });
            
            // Add the artist's songs to our list
            if (artistTracksResponse.data && artistTracksResponse.data.tracks) {
              for (const track of artistTracksResponse.data.tracks) {
                if (!processedTrackIds.has(track.id)) {
                  allTracks.push(track);
                  processedTrackIds.add(track.id);
                }
              }
            }
          } catch (artistError) {
            // If we couldn't get this artist's songs, try the next one
            console.error(`Error getting tracks for artist ${artistId}:`, artistError.message);
            continue;
          }
        }
      }
    }
    
    // Step 4: If we still don't have enough songs, try searching by mood directly
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
    
    // Step 5: Score tracks to pick the best ones
    const scoredTracks = allTracks.map(track => {
      let score = 0;
      
      // Give points for matching the genre
      if (track.artists.some(artist => 
        artist.genres && genres.some(g => artist.genres.includes(g)))) {
        score += 3;
      }
      
      // Give points for being moderately popular (not too mainstream, not too obscure)
      if (track.popularity > 20 && track.popularity < 80) {
        score += 2;
      }
      
      // Give bonus points if it's from one of the user's favorite artists
      if (track.artists.some(artist => topArtistIds.includes(artist.id))) {
        score += 4;
      }
      
      return { track, score };
    });
    
    // Sort the tracks by score (highest first) and take only the number we need
    scoredTracks.sort((a, b) => b.score - a.score);
    return scoredTracks.slice(0, numSongs).map(item => item.track);
    
  } catch (error) {
    // If anything went wrong, log the error and return an empty list
    console.error('Error in generatePlaylist:', error.message);
    return [];
  }
}

// ROUTE 3: The main API endpoint that creates playlists
app.post('/api/generate-playlist', async (req, res) => {
  // Get the information from the request
  const {
    accessToken, // The user's Spotify access token
    mood,        // The mood they want (happy, sad, etc.)
    genres,      // The genres they want (rock, pop, etc.)
    numSongs,    // How many songs they want
    playlistName // What they want to call their playlist
  } = req.body;

  try {
    // Step 1: Get songs that match what the user wants
    const trackResults = await generatePlaylist(accessToken, mood, genres, numSongs);

    // If we couldn't find any songs, tell the user
    if (trackResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Could not find enough tracks matching your criteria'
      });
    }

    // Step 2: Get the user's Spotify ID
    const userResponse = await axios.get('https://api.spotify.com/v1/me', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    const userId = userResponse.data.id;

    // Step 3: Create a new playlist on Spotify
    const playlistResponse = await axios.post(
      `https://api.spotify.com/v1/users/${userId}/playlists`,
      {
        name: playlistName || `${mood} Playlist`, // Use the name they provided, or make one up
        description: 'Generated with Spotify Playlist Generator',
        public: true // Make the playlist public so they can share it
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Get the ID of the playlist we just created
    const playlistId = playlistResponse.data.id;
    
    // Make a list of all the song URIs (Spotify's way of identifying songs)
    const trackUris = trackResults.map(track => track.uri);

    // Step 4: Add all the songs to the playlist
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

    // Step 5: Tell the user everything worked!
    res.json({
      success: true,
      playlist: playlistResponse.data,
      tracks: trackResults
    });
  } catch (error) {
    // If anything went wrong, tell the user
    console.error('Error generating playlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate playlist',
      error: error.message
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});