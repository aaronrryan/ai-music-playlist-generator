import { Song, OpenAIModel } from './types';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const DEFAULT_MODEL = 'gpt-4o-mini';

// List of available OpenAI models
export const OPENAI_MODELS: OpenAIModel[] = [
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: 'Smaller, faster, and more affordable version of GPT-4o'
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    description: 'Most capable multimodal model for text, vision, and audio tasks'
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'Fast and efficient model for most everyday tasks'
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    description: 'Advanced model with improved reasoning capabilities'
  }
];

export async function generateSongPlaylist(genre: string, count: number = 20, model: string = DEFAULT_MODEL): Promise<Song[]> {
  try {
    const prompt = `Create a playlist of ${count} popular and influential ${genre} songs that actually exist. Focus on well-known, critically acclaimed, and commercially successful songs that are considered essential or top tracks in the ${genre} genre. Include a mix of classic and modern songs when appropriate.

For each song, provide:
1. The exact title as it was officially released
2. The actual artist who recorded/released the song

Format the response as a JSON array with objects containing "title" and "artist" properties. Only return the JSON array, no other text.

Example format:
[
  {"title": "Actual Song Title", "artist": "Real Artist Name"},
  ...
]`;

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
            content: 'You are a music expert with extensive knowledge of music history and popular songs across all genres. Your task is to provide accurate information about real, existing songs that are considered top tracks in their respective genres. Only respond with valid JSON, no explanations or other text.'
          },
          {
            role: 'user',
            content: prompt
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
    const responseText = data.choices[0].message.content;
    
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

export async function generateSongDetails(song: Song, genre: string, model: string = DEFAULT_MODEL): Promise<Song> {
  try {
    const prompt = `Provide accurate details for the real ${genre} song "${song.title}" by "${song.artist}". Include the actual album name it appeared on, the correct release year, an accurate song duration (in MM:SS format), and a short excerpt of the real lyrics (4-8 lines).

If this is a well-known song, provide the factual information. If you're uncertain about any details, provide the most plausible information based on your knowledge of music history.

Format the response as a JSON object with "album", "year", "duration", and "lyrics" properties. Only return the JSON object, no other text.`;

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
            content: 'You are a music expert with extensive knowledge of music history, albums, release dates, and lyrics. Provide accurate information about real songs. Only respond with valid JSON, no explanations or other text.'
          },
          {
            role: 'user',
            content: prompt
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
    const responseText = data.choices[0].message.content;
    
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
