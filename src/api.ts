import { Song, OpenAIModel, PromptSettings, OllamaModel, AIModel } from './types';

// Re-export AIModel so it can be imported from this file by other components
export type { AIModel };

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OLLAMA_API_URL = import.meta.env.VITE_OLLAMA_API_URL;
const DEFAULT_MODEL = 'gpt-4o-mini';
const DEFAULT_PROVIDER = 'openai';

// List of available OpenAI models
export const OPENAI_MODELS: AIModel[] = [
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: 'Smaller, faster, and more affordable version of GPT-4o',
    provider: 'openai'
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    description: 'Most capable multimodal model for text, vision, and audio tasks',
    provider: 'openai'
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'Fast and efficient model for most everyday tasks',
    provider: 'openai'
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    description: 'Advanced model with improved reasoning capabilities',
    provider: 'openai'
  }
];

// List of available Ollama models
export const OLLAMA_MODELS: AIModel[] = [
  {
    id: 'llama3.1:8b',
    name: 'Llama 3.1 (8B)',
    description: 'Meta\'s Llama 3.1 8B parameter model',
    provider: 'ollama'
  },
  {
    id: 'llama3.2:3b',
    name: 'Llama 3.2 (3B)',
    description: 'Meta\'s Llama 3.2 3B parameter model',
    provider: 'ollama'
  },
  {
    id: 'deepseek-r1:8b',
    name: 'DeepSeek R1 (8B)',
    description: 'DeepSeek\'s R1 8B parameter model',
    provider: 'ollama'
  }
];

// Combine all available models
export const ALL_AI_MODELS: AIModel[] = [...OPENAI_MODELS, ...OLLAMA_MODELS];

// Default prompt settings
export const DEFAULT_PROMPT_SETTINGS: PromptSettings = {
  systemPrompt: 'You are a music expert with extensive knowledge of music history and popular songs across all genres. Your task is to provide accurate information about real, existing songs that are considered top tracks in their respective genres. Only respond with valid JSON, no explanations or other text.',
  
  playlistGenerationPrompt: `Create a playlist of {count} popular and influential {genre} songs that actually exist. Focus on well-known, critically acclaimed, and commercially successful songs that are considered essential or top tracks in the {genre} genre. Include a mix of classic and modern songs when appropriate.

For each song, provide:
1. The exact title as it was officially released
2. The actual artist who recorded/released the song

Format the response as a JSON array with objects containing "title" and "artist" properties. Only return the JSON array, no other text.

Example format:
[
  {"title": "Actual Song Title", "artist": "Real Artist Name"},
  ...
]`,

  songDetailsPrompt: `Provide accurate details for the real {genre} song "{title}" by "{artist}". Include the actual album name it appeared on, the correct release year, an accurate song duration (in MM:SS format), and a short excerpt of the real lyrics (4-8 lines).

If this is a well-known song, provide the factual information. If you're uncertain about any details, provide the most plausible information based on your knowledge of music history.

Format the response as a JSON object with "album", "year", "duration", and "lyrics" properties. Only return the JSON object, no other text.`
};

export async function generateSongPlaylist(
  genre: string, 
  count: number = 20, 
  model: string = DEFAULT_MODEL,
  promptSettings: PromptSettings = DEFAULT_PROMPT_SETTINGS,
  provider: 'openai' | 'ollama' = DEFAULT_PROVIDER
): Promise<Song[]> {
  try {
    // Replace placeholders in the prompt template
    const prompt = promptSettings.playlistGenerationPrompt
      .replace('{genre}', genre)
      .replace('{count}', count.toString());

    let responseText: string;
    
    if (provider === 'openai') {
      responseText = await callOpenAI(model, promptSettings.systemPrompt, prompt);
    } else {
      responseText = await callOllama(model, promptSettings.systemPrompt, prompt);
    }
    
    // Extract JSON from the response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    const jsonStr = jsonMatch ? jsonMatch[0] : responseText;
    
    try {
      const songs = JSON.parse(jsonStr) as Array<{title: string, artist: string}>;
      
      // Convert to Song objects with IDs
      return songs.map((song, index) => ({
        id: `song-${index}`,
        title: song.title,
        artist: song.artist,
      }));
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      throw new Error('Could not parse playlist data from API response');
    }
  } catch (error) {
    console.error('Error generating playlist:', error);
    throw error;
  }
}

export async function generateSongDetails(
  song: Song, 
  genre: string, 
  model: string = DEFAULT_MODEL,
  promptSettings: PromptSettings = DEFAULT_PROMPT_SETTINGS,
  provider: 'openai' | 'ollama' = DEFAULT_PROVIDER
): Promise<Song> {
  try {
    // Replace placeholders in the prompt template
    const prompt = promptSettings.songDetailsPrompt
      .replace('{genre}', genre)
      .replace('{title}', song.title)
      .replace('{artist}', song.artist);

    let responseText: string;
    
    if (provider === 'openai') {
      responseText = await callOpenAI(model, promptSettings.systemPrompt, prompt);
    } else {
      responseText = await callOllama(model, promptSettings.systemPrompt, prompt);
    }
    
    // Extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : responseText;
    
    try {
      const details = JSON.parse(jsonStr);
      
      // Generate music service URLs
      const youtubeUrl = generateYoutubeSearchUrl(song.title, song.artist);
      const spotifyUrl = generateSpotifySearchUrl(song.title, song.artist);
      const appleMusicUrl = generateAppleMusicSearchUrl(song.title, song.artist);
      
      return {
        ...song,
        album: details.album,
        year: details.year,
        duration: details.duration,
        lyrics: details.lyrics,
        youtubeUrl,
        spotifyUrl,
        appleMusicUrl
      };
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      // Still add music service URLs even if other details fail
      return {
        ...song,
        youtubeUrl: generateYoutubeSearchUrl(song.title, song.artist),
        spotifyUrl: generateSpotifySearchUrl(song.title, song.artist),
        appleMusicUrl: generateAppleMusicSearchUrl(song.title, song.artist)
      };
    }
  } catch (error) {
    console.error('Error generating song details:', error);
    // Still add music service URLs even if API call fails
    return {
      ...song,
      youtubeUrl: generateYoutubeSearchUrl(song.title, song.artist),
      spotifyUrl: generateSpotifySearchUrl(song.title, song.artist),
      appleMusicUrl: generateAppleMusicSearchUrl(song.title, song.artist)
    };
  }
}

// Helper function to call OpenAI API
async function callOpenAI(model: string, systemPrompt: string, userPrompt: string): Promise<string> {
  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Helper function to call Ollama API
async function callOllama(model: string, systemPrompt: string, userPrompt: string): Promise<string> {
  const response = await fetch(`${OLLAMA_API_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama API error: ${errorText || response.statusText}`);
  }

  const data = await response.json();
  return data.message.content;
}

export function generateYoutubeSearchUrl(title: string, artist: string): string {
  const searchQuery = encodeURIComponent(`${title} ${artist}`);
  return `https://www.youtube.com/results?search_query=${searchQuery}`;
}

export function generateSpotifySearchUrl(title: string, artist: string): string {
  const searchQuery = encodeURIComponent(`${title} ${artist}`);
  return `https://open.spotify.com/search/${searchQuery}`;
}

export function generateAppleMusicSearchUrl(title: string, artist: string): string {
  const searchQuery = encodeURIComponent(`${title} ${artist}`);
  return `https://music.apple.com/us/search?term=${searchQuery}`;
}

// Function to fetch available models from Ollama server
export async function fetchOllamaModels(): Promise<string[]> {
  try {
    const response = await fetch(`${OLLAMA_API_URL}/api/tags`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Ollama models: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.models.map((model: any) => model.name);
  } catch (error) {
    console.error('Error fetching Ollama models:', error);
    // Return default models if we can't fetch from server
    return OLLAMA_MODELS.map(model => model.id);
  }
}
