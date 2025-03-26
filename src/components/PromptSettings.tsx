import React, { useState } from 'react';
import { PromptSettings as PromptSettingsType } from '../types';
import { DEFAULT_PROMPT_SETTINGS } from '../api';

interface PromptSettingsProps {
  settings: PromptSettingsType;
  onSave: (settings: PromptSettingsType) => void;
  onCancel: () => void;
}

const PromptSettings: React.FC<PromptSettingsProps> = ({ 
  settings, 
  onSave, 
  onCancel 
}) => {
  const [localSettings, setLocalSettings] = useState<PromptSettingsType>({
    systemPrompt: settings.systemPrompt,
    playlistGenerationPrompt: settings.playlistGenerationPrompt,
    songDetailsPrompt: settings.songDetailsPrompt
  });

  const [activeTab, setActiveTab] = useState<'system' | 'playlist' | 'details'>('playlist');

  const handleChange = (field: keyof PromptSettingsType, value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleReset = () => {
    setLocalSettings({
      systemPrompt: DEFAULT_PROMPT_SETTINGS.systemPrompt,
      playlistGenerationPrompt: DEFAULT_PROMPT_SETTINGS.playlistGenerationPrompt,
      songDetailsPrompt: DEFAULT_PROMPT_SETTINGS.songDetailsPrompt
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localSettings);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl w-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Customize Prompts</h2>
      
      <div className="mb-4">
        <div className="flex border-b border-gray-200">
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === 'playlist' 
                ? 'text-indigo-600 border-b-2 border-indigo-600' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('playlist')}
          >
            Playlist Generation
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === 'details' 
                ? 'text-indigo-600 border-b-2 border-indigo-600' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('details')}
          >
            Song Details
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === 'system' 
                ? 'text-indigo-600 border-b-2 border-indigo-600' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('system')}
          >
            System
          </button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        {activeTab === 'playlist' && (
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Available variables: {'{genre}'}, {'{count}'}
            </p>
            <textarea
              className="w-full h-64 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
              value={localSettings.playlistGenerationPrompt}
              onChange={(e) => handleChange('playlistGenerationPrompt', e.target.value)}
            />
          </div>
        )}
        
        {activeTab === 'details' && (
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Available variables: {'{genre}'}, {'{title}'}, {'{artist}'}
            </p>
            <textarea
              className="w-full h-64 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
              value={localSettings.songDetailsPrompt}
              onChange={(e) => handleChange('songDetailsPrompt', e.target.value)}
            />
          </div>
        )}
        
        {activeTab === 'system' && (
          <div>
            <p className="text-sm text-gray-600 mb-2">
              System prompt that sets the AI's behavior
            </p>
            <textarea
              className="w-full h-64 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
              value={localSettings.systemPrompt}
              onChange={(e) => handleChange('systemPrompt', e.target.value)}
            />
          </div>
        )}
        
        <div className="flex justify-between mt-4">
          <div>
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50"
            >
              Reset to Defaults
            </button>
          </div>
          <div className="space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PromptSettings; 