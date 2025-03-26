# AI Music Playlist Generator

A web application that creates custom playlists of real songs based on your favorite music genres. This application uses AI to generate playlists of popular, existing songs that match your genre preferences, drawing from the AI model's knowledge of music collected from the internet.

![AI Music Playlist Generator](https://i.imgur.com/placeholder.png)

## Features

- **AI-Curated Playlists**: Create playlists of 20 real songs based on any music genre, focusing on top and popular tracks
- **Multiple AI Providers**: Choose between OpenAI or Ollama for generating playlists
- **Multiple AI Models**: Select from various OpenAI models (GPT-3.5, GPT-4o, etc.) or Ollama models (Llama, DeepSeek, etc.)
- **Dynamic Model Detection**: Automatically detects installed models on your Ollama server
- **Song Details**: View and expand detailed information for each song including album, year, and lyrics
- **Music Service Links**: Each song includes direct search links for popular music services (YouTube, Spotify, Apple Music, Amazon Music)
- **Save & Share**: Save playlists locally and share them via unique URLs
- **Export Options**: Export playlists as formatted text or JSON
- **Responsive Design**: Beautiful UI that works on desktop and mobile devices

## How It Works

### Playlist Generation

1. Enter a music genre (e.g., "Jazz", "Rock", "Hip Hop") in the input field
2. Select an AI provider (OpenAI or Ollama) and model from the dropdown menu
3. Click "Generate Playlist" to create a playlist of 20 real songs from the selected genre
4. The application sends a request to the selected AI provider to retrieve information about top songs in your chosen genre
5. Once generated, the playlist is displayed with song titles and artists

### Selecting AI Provider and Models

#### OpenAI
- Choose from various OpenAI models like GPT-3.5 Turbo or GPT-4o
- Requires an OpenAI API key set in your environment variables

#### Ollama
- Use locally hosted open-source language models through Ollama
- Automatically detects installed models on your Ollama server
- Includes optimized support for:
  - Llama 3.1 (8B parameter model)
  - Llama 3.2 (3B parameter model)
  - DeepSeek R1 (8B parameter model)
- Click "Refresh models" to update the list of available models from your Ollama server

### Song Details

- Click on any song to view additional information
- The application fetches detailed information about the song including:
  - Album name
  - Release year
  - Song duration
  - Sample lyrics
- This information is retrieved from the AI model's knowledge of music collected from the internet

### Music Service Links

Each song includes links to search for it on popular music streaming services:
- YouTube
- YouTube Music
- Spotify
- Apple Music
- Amazon Music

These links perform a search query on the respective platform using the song title and artist name, allowing you to quickly find and listen to the songs.

### Saving Playlists

1. Click the "Save Playlist" button to save your current playlist
2. Enter a name for your playlist in the modal dialog
3. Click "Save" to store the playlist in your browser's local storage
4. Access saved playlists by clicking "View Saved Playlists"
5. The AI provider and model information is saved with your playlist

### Sharing Playlists

1. Save a playlist using the steps above
2. Click the "Share" button to generate a shareable URL
3. Copy the URL and share it with others
4. When someone opens the URL, the application will load the playlist if it exists in their local storage

### Exporting Playlists

1. Click the "Export" button to open the export modal
2. Choose between Text or JSON format
3. Preview the export content in the modal
4. Click "Copy to Clipboard" to copy the content or "Download" to save it as a file

## Technical Implementation

### Architecture

The application is built using:
- **React**: Frontend UI library
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Build tool and development server
- **OpenAI API**: Cloud-based AI models for retrieving song information
- **Ollama**: Self-hosted open-source language models

### Key Components

- **App.tsx**: Main application component that manages state and routing
- **GenreForm.tsx**: Form for entering genre and selecting AI provider/model
- **SongList.tsx**: Displays the list of generated songs
- **PlaylistActions.tsx**: Handles saving, sharing, and exporting playlists
- **SavedPlaylists.tsx**: Displays and manages saved playlists
- **api.ts**: Handles communication with AI providers (OpenAI and Ollama)

### Data Flow

1. User inputs a genre and selects an AI provider/model
2. App sends a request to the selected AI provider
3. API returns information about real songs in the selected genre
4. App renders the song list
5. User can interact with songs, save playlists, etc.
6. Playlists are stored in localStorage for persistence

### Storage

The application uses browser localStorage to:
- Save generated playlists
- Retrieve playlists when loading from a shared URL
- Manage a library of saved playlists

## Limitations

- **AI Knowledge Cutoff**: The AI models' knowledge has a cutoff date, so very recent songs may not be included
- **Information Accuracy**: While the AI attempts to provide accurate information, there may occasionally be inaccuracies in song details
- **Local Storage**: Playlists are stored in the browser's localStorage, which has size limitations
- **Shared URLs**: Shared playlists only work if the recipient has the playlist in their localStorage
- **Music Service Links**: Links perform searches but cannot directly add songs to music service playlists (due to authentication requirements)
- **Ollama Performance**: The quality of song information may vary depending on the Ollama model used

## Future Enhancements

- Integration with music service APIs (requires OAuth authentication)
- User accounts for cloud-based playlist storage
- More customization options for playlist generation (by year, popularity, etc.)
- Ability to edit and customize playlists
- Collaborative playlist creation
- Support for additional AI providers

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- [Optional] Ollama installed locally for using Ollama models

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/ai-music-playlist-generator.git
   cd ai-music-playlist-generator
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with your API configurations:
   ```
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   VITE_OLLAMA_API_URL=http://localhost:11434  # Default Ollama URL
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:8889`

### Using with Ollama

1. Install Ollama from [https://ollama.com](https://ollama.com)
2. Pull the models you want to use:
   ```
   ollama pull llama3.1:8b
   ollama pull llama3.2:3b
   ollama pull deepseek-r1:8b
   ```
3. Ensure Ollama is running while using the application
4. Select Ollama as the provider in the application UI

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI and Ollama for providing the AI models that power the song recommendations
- The React and Tailwind CSS communities for their excellent tools and documentation
