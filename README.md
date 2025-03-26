# AI Music Playlist Generator

A web application that creates custom playlists of real songs based on your favorite music genres. This application uses OpenAI's API to generate playlists of popular, existing songs that match your genre preferences, drawing from the AI model's knowledge of music collected from the internet.

![AI Music Playlist Generator](https://i.imgur.com/placeholder.png)

## Features

- **AI-Curated Playlists**: Create playlists of 20 real songs based on any music genre, focusing on top and popular tracks
- **Multiple AI Models**: Choose between different OpenAI models for more accurate song recommendations
- **Song Details**: View and expand detailed information for each song including album, year, and lyrics
- **Music Service Links**: Each song includes direct search links for popular music services
- **Save & Share**: Save playlists locally and share them via unique URLs
- **Export Options**: Export playlists as formatted text or JSON
- **Responsive Design**: Beautiful UI that works on desktop and mobile devices

## How It Works

### Playlist Generation

1. Enter a music genre (e.g., "Jazz", "Rock", "Hip Hop") in the input field
2. Select an OpenAI model from the dropdown menu (more advanced models like GPT-4o may provide more accurate song information)
3. Click "Generate Playlist" to create a playlist of 20 real songs from the selected genre
4. The application sends a request to the OpenAI API to retrieve information about top songs in your chosen genre
5. Once generated, the playlist is displayed with song titles and artists

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
- **OpenAI API**: AI model for retrieving song information

### Key Components

- **App.tsx**: Main application component that manages state and routing
- **GenreForm.tsx**: Form for entering genre and selecting AI model
- **SongList.tsx**: Displays the list of generated songs
- **PlaylistActions.tsx**: Handles saving, sharing, and exporting playlists
- **SavedPlaylists.tsx**: Displays and manages saved playlists

### Data Flow

1. User inputs a genre and selects a model
2. App sends a request to the OpenAI API
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

- **AI Knowledge Cutoff**: The AI model's knowledge has a cutoff date, so very recent songs may not be included
- **Information Accuracy**: While the AI attempts to provide accurate information, there may occasionally be inaccuracies in song details
- **Local Storage**: Playlists are stored in the browser's localStorage, which has size limitations
- **Shared URLs**: Shared playlists only work if the recipient has the playlist in their localStorage
- **Music Service Links**: Links perform searches but cannot directly add songs to music service playlists (due to authentication requirements)

## Future Enhancements

- Integration with music service APIs (requires OAuth authentication)
- User accounts for cloud-based playlist storage
- More customization options for playlist generation (by year, popularity, etc.)
- Ability to edit and customize playlists
- Collaborative playlist creation

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

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

3. Create a `.env` file in the root directory with your OpenAI API key:
   ```
   VITE_OPENAI_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for providing the API that powers the song recommendations
- The React and Tailwind CSS communities for their excellent tools and documentation
