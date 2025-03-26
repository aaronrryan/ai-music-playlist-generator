import React, { useState, useEffect } from 'react';
import { Music, Trash2, Calendar, Clock } from 'lucide-react';
import { SavedPlaylist } from '../types';
import { getPlaylists, deletePlaylist } from '../utils/storage';

interface SavedPlaylistsProps {
  onLoadPlaylist: (playlist: SavedPlaylist) => void;
}

const SavedPlaylists: React.FC<SavedPlaylistsProps> = ({ onLoadPlaylist }) => {
  const [playlists, setPlaylists] = useState<SavedPlaylist[]>([]);
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    // Load playlists from local storage
    const savedPlaylists = getPlaylists();
    setPlaylists(savedPlaylists.sort((a, b) => b.createdAt - a.createdAt));
  }, []);

  const handleDeletePlaylist = (id: string) => {
    deletePlaylist(id);
    setPlaylists(prev => prev.filter(p => p.id !== id));
    setShowConfirmDelete(null);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (playlists.length === 0) {
    return (
      <div className="text-center py-8">
        <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No Saved Playlists</h3>
        <p className="text-gray-500">
          Your saved playlists will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Saved Playlists</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {playlists.map(playlist => (
          <div 
            key={playlist.id}
            className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition"
          >
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{playlist.name}</h3>
                  <p className="text-sm text-gray-600">{playlist.genre} • {playlist.songs.length} songs</p>
                </div>
                {showConfirmDelete === playlist.id ? (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowConfirmDelete(null)}
                      className="text-gray-500 hover:text-gray-700 text-xs px-2 py-1 bg-gray-100 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDeletePlaylist(playlist.id)}
                      className="text-white bg-red-500 hover:bg-red-600 text-xs px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowConfirmDelete(playlist.id)}
                    className="text-gray-400 hover:text-red-500 transition"
                    aria-label="Delete playlist"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex items-center text-xs text-gray-500 mb-3">
                <Calendar className="h-3 w-3 mr-1" />
                <span>Created {formatDate(playlist.createdAt)}</span>
                <span className="mx-2">•</span>
                <span>Model: {playlist.model}</span>
              </div>
              
              <div className="mb-4">
                <div className="text-xs text-gray-500 mb-1">Preview:</div>
                <ul className="text-sm text-gray-700">
                  {playlist.songs.slice(0, 3).map((song, index) => (
                    <li key={song.id} className="truncate">
                      {index + 1}. {song.title} - {song.artist}
                    </li>
                  ))}
                  {playlist.songs.length > 3 && (
                    <li className="text-gray-400 italic">
                      +{playlist.songs.length - 3} more songs
                    </li>
                  )}
                </ul>
              </div>
              
              <button
                onClick={() => onLoadPlaylist(playlist)}
                className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
              >
                Load Playlist
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedPlaylists;
