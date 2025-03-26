import React, { useState, useCallback, useEffect } from 'react';
import { Music, Library, Settings } from 'lucide-react';
import GenreForm from './components/GenreForm';
import SongList from './components/SongList';
import PlaylistActions from './components/PlaylistActions';
import SavedPlaylists from './components/SavedPlaylists';
import PromptSettings from './components/PromptSettings';
import { generateSongPlaylist, generateSongDetails, DEFAULT_PROMPT_SETTINGS } from './api';
import { PlaylistState, Song, SavedPlaylist, PromptSettings as PromptSettingsType } from './types';
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
  const [showPromptSettings, setShowPromptSettings] = useState(false);
  const [promptSettings, setPromptSettings] = useState<PromptSettingsType>(DEFAULT_PROMPT_SETTINGS);
  const [currentPrompt, setCurrentPrompt] = useState<string>('');

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
      // Format the prompt with actual values to display it to the user
      const formattedPrompt = promptSettings.playlistGenerationPrompt
        .replace('{genre}', genre)
        .replace('{count}', '20');
      
      setCurrentPrompt(formattedPrompt);
      
      const songs = await generateSongPlaylist(genre, 20, model, promptSettings);
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
  }, [promptSettings]);

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
      // Format the prompt with actual values to display it to the user
      const formattedPrompt = promptSettings.songDetailsPrompt
        .replace('{genre}', playlistState.genre)
        .replace('{title}', song.title)
        .replace('{artist}', song.artist);
      
      setCurrentPrompt(formattedPrompt);
      
      const updatedSong = await generateSongDetails(song, playlistState.genre, selectedModel, promptSettings);
      handleUpdateSong(updatedSong);
      return updatedSong;
    } catch (error) {
      console.error('Error fetching song details:', error);
      return song;
    }
  }, [playlistState.genre, selectedModel, handleUpdateSong, promptSettings]);

  const loadSavedPlaylist = (playlist: SavedPlaylist) => {
    setSelectedModel(playlist.model);
    setPlaylistState({
      genre: playlist.genre,
      songs: playlist.songs,
      loading: false,
      error: null
    });
    
    // Load prompt settings if they exist, otherwise use defaults
    if (playlist.promptSettings) {
      setPromptSettings(playlist.promptSettings);
    }
    
    setShowSavedPlaylists(false);
  };

  const handleSavePromptSettings = (newSettings: PromptSettingsType) => {
    setPromptSettings(newSettings);
    setShowPromptSettings(false);
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
        {showPromptSettings ? (
          <PromptSettings 
            settings={promptSettings} 
            onSave={handleSavePromptSettings} 
            onCancel={() => setShowPromptSettings(false)} 
          />
        ) : showSavedPlaylists ? (
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
                
                <div className="flex space-x-4 mt-4">
                  <button
                    onClick={() => setShowSavedPlaylists(true)}
                    className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                  >
                    <Library className="h-4 w-4 mr-2" />
                    View Saved Playlists
                  </button>
                  
                  <button
                    onClick={() => setShowPromptSettings(true)}
                    className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Customize Prompts
                  </button>
                </div>
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
                  promptSettings={promptSettings}
                />
                
                {currentPrompt && (
                  <div className="w-full mt-4 p-4 bg-gray-100 rounded-lg border border-gray-300">
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Current Prompt</h3>
                    <div className="bg-white p-3 rounded border border-gray-200 font-mono text-sm text-gray-700 whitespace-pre-wrap max-h-32 overflow-y-auto">
                      {currentPrompt}
                    </div>
                  </div>
                )}
                
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
                  
                  <button
                    onClick={() => setShowPromptSettings(true)}
                    className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Customize Prompts
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
            
            {currentPrompt && (
              <div className="mt-4 p-3 bg-white border border-gray-200 rounded-lg max-w-lg">
                <p className="text-sm text-gray-600 mb-1">Using this prompt:</p>
                <div className="font-mono text-xs text-gray-700 whitespace-pre-wrap max-h-28 overflow-y-auto">
                  {currentPrompt}
                </div>
              </div>
            )}
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
