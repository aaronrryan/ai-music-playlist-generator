import React, { useState, useCallback, useEffect } from 'react';
import GenreForm from './components/GenreForm';
import SongList from './components/SongList';
import PlaylistActions from './components/PlaylistActions';
import { Song, PlaylistState, SavedPlaylist, PromptSettings } from './types';
import { generateSongPlaylist, generateSongDetails, DEFAULT_PROMPT_SETTINGS } from './api';
import { getPlaylistIdFromUrl, getPlaylistById, getPlaylists } from './utils/storage';
import SavedPlaylists from './components/SavedPlaylists';

// Create the missing components
const LoadingIndicator: React.FC<{ stage: 'songs' | 'details', genre: string }> = ({ stage, genre }) => (
  <div className="flex flex-col items-center justify-center p-8">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
    <p className="text-gray-700">
      {stage === 'songs' 
        ? `Generating your ${genre} playlist...` 
        : `Adding details to your ${genre} songs...`}
    </p>
    <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
  </div>
);

const ErrorDisplay: React.FC<{ message: string, onRetry: () => void }> = ({ message, onRetry }) => (
  <div className="text-center p-8">
    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-md mb-6">
      <p className="font-medium">Error generating playlist</p>
      <p className="text-sm mt-1">{message}</p>
    </div>
    <button
      onClick={onRetry}
      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
    >
      Try Again
    </button>
  </div>
);

const SettingsButton: React.FC<{ 
  promptSettings: PromptSettings, 
  onChange: (settings: PromptSettings) => void 
}> = ({ promptSettings, onChange }) => (
  <button
    onClick={() => {
      // In a real implementation, this would open a settings modal
      console.log("Would open settings with", promptSettings);
    }}
    className="flex items-center py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
  >
    Settings
  </button>
);

// Update PlaylistState interface with new status field
interface EnhancedPlaylistState extends PlaylistState {
  status: 'idle' | 'loading' | 'generating_details' | 'success' | 'error' | 'saved_playlists';
  savedPlaylists?: SavedPlaylist[];
  playlistId?: string;
}

const App: React.FC = () => {
  const [playlistState, setPlaylistState] = useState<EnhancedPlaylistState>({
    status: 'idle',
    songs: [],
    error: null,
    genre: '',
    loading: false,
  });
  const [selectedModel, setSelectedModel] = useState<string>('gpt-3.5-turbo');
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'ollama'>('openai');
  const [promptSettings, setPromptSettings] = useState<PromptSettings>(DEFAULT_PROMPT_SETTINGS);

  // Load saved playlists on mount
  useEffect(() => {
    const loadSavedPlaylists = async () => {
      try {
        const playlists = await getPlaylists();
        // If there are saved playlists and URL has no playlist ID, show them
        if (playlists.length > 0 && !getPlaylistIdFromUrl()) {
          setPlaylistState({
            status: 'saved_playlists',
            songs: [],
            savedPlaylists: playlists,
            error: null,
            genre: '',
            loading: false,
          });
        } else if (getPlaylistIdFromUrl()) {
          await loadSavedPlaylist(getPlaylistIdFromUrl() as string);
        }
      } catch (error) {
        console.error('Failed to load saved playlists', error);
      }
    };
    
    loadSavedPlaylists();
  }, []);
  
  const loadSavedPlaylist = useCallback(async (id: string) => {
    try {
      const playlist = await getPlaylistById(id);
      if (playlist) {
        setPlaylistState({
          status: 'success',
          songs: playlist.songs,
          error: null,
          genre: playlist.genre,
          playlistId: playlist.id,
          loading: false,
        });
        setSelectedModel(playlist.model || 'gpt-3.5-turbo');
        setSelectedProvider(playlist.modelProvider || 'openai');
      }
    } catch (error) {
      console.error('Failed to load playlist', error);
    }
  }, []);

  const handleGenreSubmit = useCallback(async (genre: string, model: string, provider: 'openai' | 'ollama') => {
    setPlaylistState({
      status: 'loading',
      songs: [],
      error: null,
      genre,
      loading: true,
    });
    setSelectedModel(model);
    setSelectedProvider(provider);
    
    try {
      const songs = await generateSongPlaylist(
        genre,
        20,
        model,
        promptSettings,
        provider
      );
      
      setPlaylistState({
        status: 'generating_details',
        songs,
        error: null,
        genre,
        loading: true,
      });
      
      // Process each song to add details
      const songsWithDetails: Song[] = [];
      
      for (const song of songs) {
        const songWithDetails = await generateSongDetails(
          song,
          genre,
          model,
          promptSettings,
          provider
        );
        songsWithDetails.push(songWithDetails);
      }
      
      setPlaylistState({
        status: 'success',
        songs: songsWithDetails,
        error: null,
        genre,
        loading: false,
      });
    } catch (error) {
      console.error('Failed to generate playlist', error);
      setPlaylistState({
        status: 'error',
        songs: [],
        error: error instanceof Error ? error.message : 'Failed to generate playlist',
        genre,
        loading: false,
      });
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
  
  const handleRetry = useCallback(() => {
    setPlaylistState({
      status: 'idle',
      songs: [],
      error: null,
      genre: '',
      loading: false,
    });
  }, []);
  
  const handleBack = useCallback(() => {
    if (playlistState.savedPlaylists) {
      setPlaylistState({
        status: 'saved_playlists',
        songs: [],
        error: null,
        genre: '',
        savedPlaylists: playlistState.savedPlaylists,
        loading: false,
      });
    } else {
      setPlaylistState({
        status: 'idle',
        songs: [],
        error: null,
        genre: '',
        loading: false,
      });
    }
  }, [playlistState.savedPlaylists]);
  
  const handlePromptSettingsChange = useCallback((settings: PromptSettings) => {
    setPromptSettings(settings);
  }, []);

  // Helper function to adapt the loadSavedPlaylist function to work with SavedPlaylists component
  const handlePlaylistLoad = (playlist: SavedPlaylist) => {
    loadSavedPlaylist(playlist.id);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center">
          
          {(playlistState.status === 'idle') && (
            <GenreForm 
              onSubmit={handleGenreSubmit}
              isLoading={false}
            />
          )}
          
          {(playlistState.status === 'saved_playlists' && playlistState.savedPlaylists) && (
            <SavedPlaylists 
              playlists={playlistState.savedPlaylists}
              onLoadPlaylist={handlePlaylistLoad}
              onCreateNew={() => setPlaylistState({
                status: 'idle',
                songs: [],
                error: null,
                genre: '',
                loading: false,
              })}
            />
          )}
          
          {(playlistState.status === 'loading' || playlistState.status === 'generating_details') && (
            <div className="flex flex-col items-center">
              <LoadingIndicator 
                stage={playlistState.status === 'generating_details' ? 'details' : 'songs'}
                genre={playlistState.genre}
              />
              
              {playlistState.status === 'generating_details' && playlistState.songs.length > 0 && (
                <div className="mt-8 w-full max-w-3xl">
                  <SongList 
                    songs={playlistState.songs}
                    genre={playlistState.genre}
                    onUpdateSong={handleUpdateSong}
                    onFetchSongDetails={async (song) => song}
                    selectedModel={selectedModel}
                  />
                </div>
              )}
            </div>
          )}
          
          {playlistState.status === 'error' && (
            <ErrorDisplay 
              message={playlistState.error || 'An error occurred'} 
              onRetry={handleRetry}
            />
          )}
          
          {playlistState.status === 'success' && (
            <div className="w-full max-w-4xl">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {playlistState.genre} Playlist
                  </h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Generated with {selectedModel}
                  </p>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={handleBack}
                    className="py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    ← Back
                  </button>
                  
                  <SettingsButton 
                    promptSettings={promptSettings}
                    onChange={handlePromptSettingsChange}
                  />
                </div>
              </div>
              
              <SongList 
                songs={playlistState.songs}
                genre={playlistState.genre}
                onUpdateSong={handleUpdateSong}
                onFetchSongDetails={async (song) => song}
                selectedModel={selectedModel}
              />
              
              <div className="mt-8">
                <PlaylistActions 
                  songs={playlistState.songs} 
                  genre={playlistState.genre}
                  selectedModel={selectedModel}
                  modelProvider={selectedProvider}
                  promptSettings={promptSettings}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
