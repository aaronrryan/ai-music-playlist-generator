import React, { useState, useEffect } from 'react';
import { Music, ChevronDown, Server, RefreshCw } from 'lucide-react';
import { AIModel, ALL_AI_MODELS, OPENAI_MODELS, OLLAMA_MODELS, fetchOllamaModels } from '../api';

interface GenreFormProps {
  onSubmit: (genre: string, model: string, provider: 'openai' | 'ollama') => void;
  isLoading: boolean;
  savedPlaylistsCount?: number;
  onViewSavedPlaylists?: () => void;
}

const GenreForm: React.FC<GenreFormProps> = ({ 
  onSubmit, 
  isLoading,
  savedPlaylistsCount, 
  onViewSavedPlaylists 
}) => {
  const [genre, setGenre] = useState('');
  const [selectedModel, setSelectedModel] = useState<AIModel>(OPENAI_MODELS[0]);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [activeProvider, setActiveProvider] = useState<'openai' | 'ollama'>('openai');
  const [customOllamaModels, setCustomOllamaModels] = useState<AIModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (genre.trim()) {
      onSubmit(genre.trim(), selectedModel.id, selectedModel.provider);
    }
  };

  const popularGenres = [
    'Rock', 'Pop', 'Hip Hop', 'Jazz', 'Classical', 
    'Electronic', 'Country', 'R&B', 'Metal', 'Folk'
  ];

  // Fetch Ollama models when switching to Ollama provider
  const handleProviderChange = async (provider: 'openai' | 'ollama') => {
    setActiveProvider(provider);
    
    if (provider === 'openai') {
      setSelectedModel(OPENAI_MODELS[0]);
    } else {
      // If we haven't fetched custom Ollama models yet
      if (customOllamaModels.length === 0) {
        await fetchOllamaModelList();
      }
      
      // Select the first Ollama model
      if (customOllamaModels.length > 0) {
        setSelectedModel(customOllamaModels[0]);
      } else {
        setSelectedModel(OLLAMA_MODELS[0]);
      }
    }
  };

  // Fetch available Ollama models
  const fetchOllamaModelList = async () => {
    setLoadingModels(true);
    try {
      const modelIds = await fetchOllamaModels();
      
      // Convert model IDs to AIModel objects
      const models: AIModel[] = modelIds.map(id => {
        // Check if this is one of our predefined models
        const predefinedModel = OLLAMA_MODELS.find(m => m.id === id);
        if (predefinedModel) {
          return predefinedModel;
        }
        
        // Create a new model entry
        return {
          id,
          name: id,
          description: 'Custom Ollama model',
          provider: 'ollama'
        };
      });
      
      setCustomOllamaModels(models);
    } catch (error) {
      console.error('Failed to fetch Ollama models:', error);
      // Fallback to predefined models
      setCustomOllamaModels(OLLAMA_MODELS);
    } finally {
      setLoadingModels(false);
    }
  };

  // Get models for the active provider
  const getModelsForProvider = () => {
    if (activeProvider === 'openai') {
      return OPENAI_MODELS;
    } else {
      return customOllamaModels.length > 0 ? customOllamaModels : OLLAMA_MODELS;
    }
  };

  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-center mb-6">
        <Music className="h-8 w-8 text-indigo-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-800">AI Music Playlist Generator</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-1">
            What genre of music would you like?
          </label>
          <input
            type="text"
            id="genre"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            placeholder="Enter a music genre..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        
        <div>
          <p className="text-sm text-gray-600 mb-2">Popular genres:</p>
          <div className="flex flex-wrap gap-2">
            {popularGenres.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGenre(g)}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-800 transition"
              >
                {g}
              </button>
            ))}
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !genre.trim()}
          className={`w-full py-2 px-4 rounded-md text-white font-medium transition ${
            isLoading || !genre.trim() 
              ? 'bg-indigo-400 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isLoading ? 'Generating...' : 'Generate Playlist'}
        </button>
        
        <div className="relative pt-3 pb-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-2 text-sm text-gray-500">Advanced Options</span>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Provider
          </label>
          <div className="flex space-x-2 mb-3">
            <button
              type="button"
              className={`flex-1 py-2 px-3 rounded-md flex justify-center items-center transition ${
                activeProvider === 'openai'
                  ? 'bg-indigo-100 border border-indigo-300 text-indigo-800'
                  : 'bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => handleProviderChange('openai')}
            >
              <span className="font-medium">OpenAI</span>
            </button>
            <button
              type="button"
              className={`flex-1 py-2 px-3 rounded-md flex justify-center items-center transition ${
                activeProvider === 'ollama'
                  ? 'bg-indigo-100 border border-indigo-300 text-indigo-800'
                  : 'bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => handleProviderChange('ollama')}
            >
              <Server className="h-4 w-4 mr-1" />
              <span className="font-medium">Ollama</span>
            </button>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="model" className="block text-sm font-medium text-gray-700">
              Select AI Model
            </label>
            {activeProvider === 'ollama' && (
              <button
                type="button"
                onClick={fetchOllamaModelList}
                className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
                disabled={loadingModels}
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${loadingModels ? 'animate-spin' : ''}`} />
                Refresh models
              </button>
            )}
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-indigo-500"
              id="model"
            >
              <div>
                <span className="block font-medium">{selectedModel.name}</span>
                <span className="block text-xs text-gray-500">{selectedModel.description}</span>
              </div>
              <ChevronDown className="h-5 w-5 text-gray-400" />
            </button>
            
            {isModelDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 border border-gray-200 max-h-60 overflow-y-auto">
                {loadingModels ? (
                  <div className="flex justify-center items-center py-4">
                    <RefreshCw className="h-5 w-5 animate-spin text-indigo-600 mr-2" />
                    <span>Loading models...</span>
                  </div>
                ) : (
                  getModelsForProvider().map((model) => (
                    <button
                      key={model.id}
                      type="button"
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                        selectedModel.id === model.id ? 'bg-indigo-50' : ''
                      }`}
                      onClick={() => {
                        setSelectedModel(model);
                        setIsModelDropdownOpen(false);
                      }}
                    >
                      <span className="block font-medium">{model.name}</span>
                      <span className="block text-xs text-gray-500">{model.description}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
        
        {onViewSavedPlaylists && (
          <div className="mt-2 text-center">
            <button
              type="button"
              onClick={onViewSavedPlaylists}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center justify-center mx-auto"
            >
              View Saved Playlists
              {savedPlaylistsCount && savedPlaylistsCount > 0 && (
                <span className="ml-2 bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {savedPlaylistsCount}
                </span>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default GenreForm;
