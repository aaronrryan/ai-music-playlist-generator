import { SavedPlaylist, Song } from '../types';

// Local storage key
const PLAYLISTS_STORAGE_KEY = 'ai-music-playlists';

// Generate a unique ID for playlists
export function generatePlaylistId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Save playlist to local storage
export function savePlaylist(playlist: SavedPlaylist): void {
  try {
    const existingPlaylists = getPlaylists();
    const updatedPlaylists = [...existingPlaylists.filter(p => p.id !== playlist.id), playlist];
    localStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(updatedPlaylists));
  } catch (error) {
    console.error('Error saving playlist:', error);
  }
}

// Get all saved playlists
export function getPlaylists(): SavedPlaylist[] {
  try {
    const playlistsJson = localStorage.getItem(PLAYLISTS_STORAGE_KEY);
    if (!playlistsJson) return [];
    return JSON.parse(playlistsJson) as SavedPlaylist[];
  } catch (error) {
    console.error('Error retrieving playlists:', error);
    return [];
  }
}

// Get a specific playlist by ID
export function getPlaylistById(id: string): SavedPlaylist | null {
  try {
    const playlists = getPlaylists();
    return playlists.find(p => p.id === id) || null;
  } catch (error) {
    console.error('Error retrieving playlist:', error);
    return null;
  }
}

// Delete a playlist
export function deletePlaylist(id: string): void {
  try {
    const playlists = getPlaylists();
    const updatedPlaylists = playlists.filter(p => p.id !== id);
    localStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(updatedPlaylists));
  } catch (error) {
    console.error('Error deleting playlist:', error);
  }
}

// Export playlist as JSON
export function exportPlaylistAsJson(playlist: SavedPlaylist): string {
  return JSON.stringify(playlist, null, 2);
}

// Export playlist as text
export function exportPlaylistAsText(playlist: SavedPlaylist): string {
  let text = `${playlist.name} (${playlist.genre})\n`;
  text += `Generated with ${playlist.model}\n\n`;
  
  playlist.songs.forEach((song, index) => {
    text += `${index + 1}. "${song.title}" by ${song.artist}\n`;
    if (song.album) text += `   Album: ${song.album}\n`;
    if (song.year) text += `   Year: ${song.year}\n`;
    if (song.duration) text += `   Duration: ${song.duration}\n`;
    if (song.lyrics) text += `   Lyrics: ${song.lyrics.split('\n').join('\n   ')}\n`;
    text += '\n';
  });
  
  return text;
}

// Generate a shareable URL for a playlist
export function generateShareableUrl(playlistId: string): string {
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?playlist=${playlistId}`;
}

// Parse playlist ID from URL if present
export function getPlaylistIdFromUrl(): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('playlist');
}
