import React, { useState, useCallback, useEffect } from 'react';
import { Music, Library } from 'lucide-react';
import GenreForm from './components/GenreForm';
import SongList from './components/SongList';
import PlaylistActions from './components/PlaylistActions';
import SavedPlaylists from './components/SavedPlaylists';
import { generateSongPlaylist, generateSongDetails } from './api';
import { PlaylistState, Song, SavedPlaylist } from './types';
import { getPlaylistIdFromUrl, getPlaylistById } from './utils/storage';

function App() {
  const [playlistState, setPlaylistState] = useState<PlaylistState>({
    genre: '',
    songs: [],
    loading: false,
    error: null
  });
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4o-mini');
  const [showSavedPlaylists, setShowSavedPlaylists] = useState(false);

  // Check URL for shared playlist on initial load
  useEffect(() => {
    const playlistId = getPlaylistIdFromUrl();
    if (playlistId) {
      const playlist = getPlaylistById(playlistId);
      if (playlist) {
        loadSavedPlaylist(playlist);
      }
    }
  }, []);

  const handleGenreSubmit = useCallback(async (genre: string, model: string) => {
    setSelectedModel(model);
    setPlaylistState({
      genre,
      songs: [],
      loading: true,
      error: null
    });

    try {
      const songs = await generateSongPlaylist(genre, 20, model);
      setPlaylistState(prev => ({
        ...prev,
        songs,
        loading: false
      }));
    } catch (error) {
      setPlaylistState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      }));
    }
  }, []);

  const handleUpdateSong = useCallback((updatedSong: Song) => {
    setPlaylistState(prev => ({
      ...prev,
      songs: prev.songs.map(song => 
        song.id === updatedSong.id ? updatedSong : song
      )
    }));
  }, []);

  const handleSongDetails = useCallback(async (song: Song) => {
    try {
      const updatedSong = await generateSongDetails(song, playlistState.genre, selectedModel);
      handleUpdateSong(updatedSong);
      return updatedSong;
    } catch (error) {
      console.error('Error fetching song details:', error);
      return song;
    }
  }, [playlistState.genre, selectedModel, handleUpdateSong]);

  const loadSavedPlaylist = (playlist: SavedPlaylist) => {
    setSelectedModel(playlist.model);
    setPlaylistState({
      genre: playlist.genre,
      songs: playlist.songs,
      loading: false,
      error: null
    });
    setShowSavedPlaylists(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex flex-col items-center py-12 px-4">
      <header className="mb-10 text-center">
        <div className="flex items-center justify-center mb-4">
          <Music className="h-12 w-12 text-indigo-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Music Playlist Generator</h1>
        <p className="text-lg text-gray-600 max-w-xl">
          Create custom playlists with AI-generated songs based on your favorite genre
        </p>
      </header>

      <main className="w-full max-w-4xl flex flex-col items-center space-y-8">
        {showSavedPlaylists ? (
          <>
            <SavedPlaylists onLoadPlaylist={loadSavedPlaylist} />
            <button
              onClick={() => setShowSavedPlaylists(false)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
            >
              Back to Generator
            </button>
          </>
        ) : (
          <>
            {!playlistState.genre || playlistState.songs.length === 0 ? (
              <>
                <GenreForm onSubmit={handleGenreSubmit} isLoading={playlistState.loading} />
                
                <button
                  onClick={() => setShowSavedPlaylists(true)}
                  className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition mt-4"
                >
                  <Library className="h-4 w-4 mr-2" />
                  View Saved Playlists
                </button>
              </>
            ) : (
              <>
                <SongList 
                  songs={playlistState.songs} 
                  genre={playlistState.genre}
                  onUpdateSong={handleUpdateSong}
                  onFetchSongDetails={handleSongDetails}
                  selectedModel={selectedModel}
                />
                
                <PlaylistActions 
                  songs={playlistState.songs}
                  genre={playlistState.genre}
                  selectedModel={selectedModel}
                />
                
                <div className="mt-2 flex space-x-4">
                  <button
                    onClick={() => setPlaylistState(prev => ({ ...prev, genre: '', songs: [] }))}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                  >
                    Create New Playlist
                  </button>
                  
                  <button
                    onClick={() => setShowSavedPlaylists(true)}
                    className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                  >
                    <Library className="h-4 w-4 mr-2" />
                    View Saved Playlists
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {playlistState.loading && (
          <div className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-700">Generating your {playlistState.genre} playlist...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
          </div>
        )}

        {playlistState.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <p className="font-medium">Error generating playlist</p>
            <p className="text-sm">{playlistState.error}</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
