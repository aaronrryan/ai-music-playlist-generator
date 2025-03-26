export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  year?: number;
  duration?: string;
  lyrics?: string;
  youtubeUrl?: string;
  spotifyUrl?: string;
  appleMusicUrl?: string;
}

export interface PlaylistState {
  genre: string;
  songs: Song[];
  loading: boolean;
  error: string | null;
  id?: string; // Unique ID for sharing
}

export interface OpenAIModel {
  id: string;
  name: string;
  description: string;
}

export interface OllamaModel {
  id: string;
  name: string;
  description: string;
}

export interface AIModel extends OpenAIModel {
  provider: 'openai' | 'ollama';
}

export interface PromptSettings {
  playlistGenerationPrompt: string;
  songDetailsPrompt: string;
  systemPrompt: string;
}

export interface SavedPlaylist {
  id: string;
  name: string;
  genre: string;
  songs: Song[];
  model: string;
  modelProvider: 'openai' | 'ollama';
  createdAt: number;
  promptSettings?: PromptSettings;
}
