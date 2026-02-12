import SpotifyWebApi from 'spotify-web-api-node';

const scopes = [
  'user-read-recently-played',
  'user-read-playback-state', // optional, for currently playing
].join(',');

const params = {
  scope: scopes,
};

const queryParamString = new URLSearchParams(params).toString();

export const LOGIN_URL = `https://accounts.spotify.com/authorize?${queryParamString}&response_type=code&client_id=${process.env.SPOTIFY_CLIENT_ID}&redirect_uri=${process.env.SPOTIFY_REDIRECT_URI}`;

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});

export default spotifyApi;
