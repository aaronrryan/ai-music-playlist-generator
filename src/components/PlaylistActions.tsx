import React, { useState } from 'react';
import { Save, Share2, Download, Clipboard, Check, X } from 'lucide-react';
import { Song, SavedPlaylist } from '../types';
import { 
  savePlaylist, 
  generatePlaylistId, 
  exportPlaylistAsText, 
  exportPlaylistAsJson,
  generateShareableUrl
} from '../utils/storage';

interface PlaylistActionsProps {
  songs: Song[];
  genre: string;
  selectedModel: string;
}

const PlaylistActions: React.FC<PlaylistActionsProps> = ({ songs, genre, selectedModel }) => {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [playlistName, setPlaylistName] = useState(`${genre} Playlist`);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [exportFormat, setExportFormat] = useState<'text' | 'json'>('text');
  const [exportContent, setExportContent] = useState('');

  const handleSave = () => {
    const playlist: SavedPlaylist = {
      id: generatePlaylistId(),
      name: playlistName,
      genre,
      songs,
      model: selectedModel,
      createdAt: Date.now()
    };
    
    savePlaylist(playlist);
    setSaveSuccess(true);
    
    // Generate shareable URL
    const url = generateShareableUrl(playlist.id);
    setShareUrl(url);
    
    setTimeout(() => {
      setSaveSuccess(false);
      setShowSaveModal(false);
      setShowShareModal(true);
    }, 1500);
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleExport = () => {
    setShowExportModal(true);
    
    // Create a temporary playlist object for export
    const playlist: SavedPlaylist = {
      id: generatePlaylistId(),
      name: playlistName,
      genre,
      songs,
      model: selectedModel,
      createdAt: Date.now()
    };
    
    // Generate export content based on selected format
    if (exportFormat === 'text') {
      setExportContent(exportPlaylistAsText(playlist));
    } else {
      setExportContent(exportPlaylistAsJson(playlist));
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCopy = () => {
    navigator.clipboard.writeText(exportContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([exportContent], {type: exportFormat === 'text' ? 'text/plain' : 'application/json'});
    element.href = URL.createObjectURL(file);
    element.download = `${playlistName.replace(/\s+/g, '-').toLowerCase()}.${exportFormat === 'text' ? 'txt' : 'json'}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const updateExportContent = (format: 'text' | 'json') => {
    setExportFormat(format);
    
    // Create a temporary playlist object for export
    const playlist: SavedPlaylist = {
      id: generatePlaylistId(),
      name: playlistName,
      genre,
      songs,
      model: selectedModel,
      createdAt: Date.now()
    };
    
    // Generate export content based on selected format
    if (format === 'text') {
      setExportContent(exportPlaylistAsText(playlist));
    } else {
      setExportContent(exportPlaylistAsJson(playlist));
    }
  };

  return (
    <div className="mt-6 flex flex-wrap justify-center gap-3">
      <button
        onClick={() => setShowSaveModal(true)}
        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
      >
        <Save className="h-4 w-4 mr-2" />
        Save Playlist
      </button>
      
      <button
        onClick={handleExport}
        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
      >
        <Download className="h-4 w-4 mr-2" />
        Export
      </button>
      
      <button
        onClick={handleShare}
        className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
      >
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </button>
      
      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Save Playlist</h3>
              <button 
                onClick={() => setShowSaveModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {saveSuccess ? (
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-lg font-medium text-gray-900">Playlist Saved!</p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label htmlFor="playlist-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Playlist Name
                  </label>
                  <input
                    type="text"
                    id="playlist-name"
                    value={playlistName}
                    onChange={(e) => setPlaylistName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowSaveModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                  >
                    Save
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Share Playlist</h3>
              <button 
                onClick={() => setShowShareModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Share this link with others to let them view your playlist:
              </p>
              <div className="flex">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={handleCopyToClipboard}
                  className={`px-3 py-2 rounded-r-md text-white ${
                    copied ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700'
                  } transition`}
                >
                  {copied ? <Check className="h-5 w-5" /> : <Clipboard className="h-5 w-5" />}
                </button>
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-gray-500">
                Note: Anyone with this link can view your playlist. The playlist is stored in your browser's local storage.
              </p>
            </div>
            
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Export Playlist</h3>
              <button 
                onClick={() => setShowExportModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <div className="flex space-x-4 mb-4">
                <button
                  onClick={() => updateExportContent('text')}
                  className={`px-4 py-2 rounded-md ${
                    exportFormat === 'text' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  } transition`}
                >
                  Text Format
                </button>
                <button
                  onClick={() => updateExportContent('json')}
                  className={`px-4 py-2 rounded-md ${
                    exportFormat === 'json' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  } transition`}
                >
                  JSON Format
                </button>
              </div>
              
              <div className="border border-gray-300 rounded-md p-4 bg-gray-50 h-64 overflow-auto">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap">{exportContent}</pre>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={handleExportCopy}
                className={`flex items-center px-4 py-2 rounded-md ${
                  copied ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                } transition`}
              >
                {copied ? <Check className="h-4 w-4 mr-2" /> : <Clipboard className="h-4 w-4 mr-2" />}
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
              <button
                onClick={handleExportDownload}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistActions;
