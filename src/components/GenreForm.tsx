import React, { useState } from 'react';
import { Music, ChevronDown } from 'lucide-react';
import { OpenAIModel, OPENAI_MODELS } from '../api';

interface GenreFormProps {
  onSubmit: (genre: string, model: string) => void;
  isLoading: boolean;
}

const GenreForm: React.FC<GenreFormProps> = ({ onSubmit, isLoading }) => {
  const [genre, setGenre] = useState('');
  const [selectedModel, setSelectedModel] = useState<OpenAIModel>(OPENAI_MODELS[0]);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (genre.trim()) {
      onSubmit(genre.trim(), selectedModel.id);
    }
  };

  const popularGenres = [
    'Rock', 'Pop', 'Hip Hop', 'Jazz', 'Classical', 
    'Electronic', 'Country', 'R&B', 'Metal', 'Folk'
  ];

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
          <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
            Select AI Model
          </label>
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
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 border border-gray-200">
                {OPENAI_MODELS.map((model) => (
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
                ))}
              </div>
            )}
          </div>
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
      </form>
    </div>
  );
};

export default GenreForm;
