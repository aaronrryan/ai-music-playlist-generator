import React, { useState } from 'react';
import { Song } from '../types';
import { Clock, Music, User, Disc, Calendar, FileText, Youtube, ExternalLink } from 'lucide-react';

interface SongListProps {
  songs: Song[];
  genre: string;
  onUpdateSong: (updatedSong: Song) => void;
  onFetchSongDetails: (song: Song) => Promise<Song>;
  selectedModel: string;
}

const SongList: React.FC<SongListProps> = ({ songs, genre, onUpdateSong, onFetchSongDetails, selectedModel }) => {
  const [expandedSongId, setExpandedSongId] = useState<string | null>(null);
  const [loadingSongId, setLoadingSongId] = useState<string | null>(null);

  const handleSongClick = async (song: Song) => {
    if (expandedSongId === song.id) {
      setExpandedSongId(null);
      return;
    }
    
    setExpandedSongId(song.id);
    
    // If we don't have details yet, fetch them
    if (!song.album) {
      setLoadingSongId(song.id);
      try {
        await onFetchSongDetails(song);
      } finally {
        setLoadingSongId(null);
      }
    }
  };

  if (songs.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Music className="h-6 w-6 text-indigo-600 mr-2" />
              {genre} Playlist
            </h2>
            <p className="text-gray-600 mt-1">
              {songs.length} songs generated by AI using {selectedModel}
            </p>
          </div>
        </div>
      </div>
      
      <ul className="divide-y divide-gray-200">
        {songs.map((song, index) => {
          // Create search queries for each song
          const songQuery = `${song.title} ${song.artist}`;
          const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(songQuery)}`;
          const spotifyUrl = `https://open.spotify.com/search/${encodeURIComponent(songQuery)}`;
          const appleMusicUrl = `https://music.apple.com/us/search?term=${encodeURIComponent(songQuery)}`;
          const youtubeMusicUrl = `https://music.youtube.com/search?q=${encodeURIComponent(songQuery)}`;
          const amazonMusicUrl = `https://music.amazon.com/search/${encodeURIComponent(songQuery)}`;
          
          return (
            <li 
              key={song.id}
              className={`hover:bg-gray-50 transition ${
                expandedSongId === song.id ? 'bg-indigo-50' : ''
              }`}
            >
              <div className="p-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div 
                    className="flex items-center flex-grow cursor-pointer" 
                    onClick={() => handleSongClick(song)}
                  >
                    <span className="w-8 text-center text-gray-500 font-medium">{index + 1}</span>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{song.title}</h3>
                      <p className="text-sm text-gray-500 flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {song.artist}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {song.duration && (
                      <span className="text-sm text-gray-500 flex items-center mr-3">
                        <Clock className="h-3 w-3 mr-1" />
                        {song.duration}
                      </span>
                    )}
                    
                    {/* Music service links */}
                    <a
                      href={youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-600 hover:text-red-800 transition"
                      title={`Find "${song.title}" on YouTube`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Youtube className="h-5 w-5" />
                    </a>
                    
                    {/* YouTube Music */}
                    <a
                      href={youtubeMusicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-500 hover:text-red-700 transition"
                      title={`Find "${song.title}" on YouTube Music`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm0 19.104c-3.924 0-7.104-3.18-7.104-7.104S8.076 4.896 12 4.896s7.104 3.18 7.104 7.104-3.18 7.104-7.104 7.104zm0-13.332c-3.432 0-6.228 2.796-6.228 6.228S8.568 18.228 12 18.228s6.228-2.796 6.228-6.228S15.432 5.772 12 5.772zM9.684 15.54V8.46L16.2 12l-6.516 3.54z"/>
                      </svg>
                    </a>
                    
                    {/* Spotify */}
                    <a
                      href={spotifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-800 transition"
                      title={`Find "${song.title}" on Spotify`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                      </svg>
                    </a>
                    
                    {/* Apple Music */}
                    <a
                      href={appleMusicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-600 hover:text-pink-800 transition"
                      title={`Find "${song.title}" on Apple Music`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg className="h-5 w-5" viewBox="0 0 361 361" fill="currentColor">
                        <path d="M360 112.61c0-4.3 0-8.6-.02-12.9-.02-3.62-.06-7.24-.16-10.86-.21-7.89-.68-15.84-2.08-23.64-1.42-7.92-3.75-15.29-7.41-22.49-3.6-7.07-8.3-13.53-13.91-19.14-5.61-5.61-12.08-10.31-19.15-13.91-7.19-3.66-14.56-5.98-22.47-7.41-7.8-1.4-15.76-1.87-23.65-2.08-3.62-.1-7.24-.14-10.86-.16C255.99 0 251.69 0 247.39 0H112.61c-4.3 0-8.6 0-12.9.02-3.62.02-7.24.06-10.86.16C80.96.4 73 .86 65.2 2.27c-7.92 1.42-15.28 3.75-22.47 7.41-7.07 3.6-13.54 8.3-19.15 13.91-5.61 5.61-10.31 12.07-13.91 19.14-3.66 7.2-5.99 14.57-7.41 22.49-1.4 7.8-1.87 15.76-2.08 23.64-.1 3.62-.14 7.24-.16 10.86C0 104.01 0 108.31 0 112.61v134.77c0 4.3 0 8.6.02 12.9.02 3.62.06 7.24.16 10.86.21 7.89.68 15.84 2.08 23.64 1.42 7.92 3.75 15.29 7.41 22.49 3.6 7.07 8.3 13.53 13.91 19.14 5.61 5.61 12.08 10.31 19.15 13.91 7.19 3.66 14.56 5.98 22.47 7.41 7.8 1.4 15.76 1.87 23.65 2.08 3.62.1 7.24.14 10.86.16 4.3.03 8.6.02 12.9.02h134.77c4.3 0 8.6 0 12.9-.02 3.62-.02 7.24-.06 10.86-.16 7.89-.21 15.85-.68 23.65-2.08 7.92-1.42 15.28-3.75 22.47-7.41 7.07-3.6 13.54-8.3 19.15-13.91 5.61-5.61 10.31-12.07 13.91-19.14 3.66-7.2 5.99-14.57 7.41-22.49 1.4-7.8 1.87-15.76 2.08-23.64.1-3.62.14-7.24.16-10.86.03-4.3.02-8.6.02-12.9V112.61z" />
                        <path fill="white" d="M254.5 55c-.87.08-8.6 1.45-9.53 1.64l-107 21.59-.04.01c-2.79.59-4.98 1.58-6.67 3-2.04 1.71-3.17 4.13-3.6 6.95-.09.6-.24 1.82-.24 3.62 0 0 0 109.32 0 133.92 0 3.13-.25 6.17-2.37 8.76-2.12 2.59-4.74 3.37-7.81 3.99-2.33.47-4.66.94-6.99 1.41-8.84 1.78-14.59 2.99-19.8 5.01-4.98 1.93-8.71 4.39-11.68 7.51-5.89 6.17-8.28 14.54-7.46 22.38.7 6.69 3.71 13.09 8.88 17.82 3.49 3.2 7.85 5.63 12.99 6.66 5.33 1.07 11.01.7 19.31-.98 4.42-.89 8.56-2.28 12.5-4.61 3.9-2.3 7.24-5.37 9.85-9.11 2.62-3.75 4.31-7.92 5.24-12.35.96-4.57 1.19-8.7 1.19-13.26l0-116.15c0-6.22 1.76-7.86 6.78-9.08 0 0 88.94-17.94 93.09-18.75 5.79-1.11 8.52.54 8.52 6.61l0 79.29c0 3.14-.03 6.32-2.17 8.92-2.12 2.59-4.74 3.37-7.81 3.99-2.33.47-4.66.94-6.99 1.41-8.84 1.78-14.59 2.99-19.8 5.01-4.98 1.93-8.71 4.39-11.68 7.51-5.89 6.17-8.49 14.54-7.67 22.38.7 6.69 3.92 13.09 9.09 17.82 3.49 3.2 7.85 5.56 12.99 6.6 5.33 1.07 11.01.69 19.31-.98 4.42-.89 8.56-2.22 12.5-4.55 3.9-2.3 7.24-5.37 9.85-9.11 2.62-3.75 4.31-7.92 5.24-12.35.96-4.57 1-8.7 1-13.26V64.46c0-6.16-3.25-9.96-9.04-9.46z" />
                      </svg>
                    </a>
                    
                    {/* Amazon Music */}
                    <a
                      href={amazonMusicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 transition"
                      title={`Find "${song.title}" on Amazon Music`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg className="h-5 w-5" viewBox="0 0 89.016 52" fill="currentColor">
                        <path d="M59.7 40.5c-.6.4-1.5.7-2.6.7-1.7 0-3.3-.2-4.9-.7-.4-.1-.7-.2-.9-.2-.3 0-.4.2-.4.6v1c0 .3.1.5.2.7.1.1.3.3.6.4 1.6.7 3.4 1 5.4 1 2.1 0 3.7-.5 5-1.5 1.3-1 1.9-2.3 1.9-4 0-1.2-.3-2.1-.9-2.9-.6-.7-1.6-1.4-3-1.9l-2.8-1.1c-1.1-.4-1.9-.8-2.2-1.2-.4-.4-.6-.8-.6-1.5 0-1.5 1.1-2.3 3.4-2.3 1.3 0 2.6.2 3.8.6.4.1.7.2.8.2.3 0 .5-.2.5-.6v-1c0-.3-.1-.5-.2-.7-.1-.2-.3-.3-.6-.4-1.5-.5-3-.8-4.5-.8-1.9 0-3.5.5-4.7 1.4-1.2.9-1.8 2.2-1.8 3.7 0 2.3 1.3 4 3.9 5l3 1.1c1 .4 1.6.7 2 1.1.4.4.5.8.5 1.4 0 .8-.3 1.5-.9 1.9z"/>
                        <path d="M44 26.1v13.3c-1.7 1.1-3.4 1.7-5.1 1.7-1.1 0-1.9-.3-2.4-.9-.6-.6-.8-1.5-.8-2.8V26.1c0-.5-.2-.7-.7-.7h-2.1c-.5 0-.7.2-.7.7v12.4c0 1.7.4 3.1 1.3 4 .9.9 2.2 1.4 3.9 1.4 2.3 0 4.6-.8 6.8-2.4l.2 1.2c0 .3.1.4.3.5.1.1.3.1.6.1h1.5c.5 0 .7-.2.7-.7V26.1c0-.5-.2-.7-.7-.7h-2.1c-.6 0-.8.3-.8.7z"/>
                        <path d="M25 43.4h2.1c.5 0 .7-.2.7-.7V30.2c0-1.7-.4-3-1.3-3.9-.9-.9-2.1-1.4-3.8-1.4-2.3 0-4.7.8-7 2.5-.8-1.7-2.3-2.5-4.5-2.5-2.2 0-4.4.8-6.6 2.3l-.2-1.1c0-.3-.1-.4-.3-.5-.1-.1-.3-.1-.5-.1h-1.6c-.5 0-.7.2-.7.7v16.6c0 .5.2.7.7.7H4c.5 0 .7-.2.7-.7V29.3c1.7-1 3.4-1.6 5.2-1.6 1 0 1.7.3 2.1.9.4.6.7 1.4.7 2.6v11.5c0 .5.2.7.7.7h2.1c.5 0 .7-.2.7-.7V30.4 29.8c0-.2 0-.4 0-.5 1.8-1.1 3.5-1.6 5.2-1.6 1 0 1.7.3 2.1.9.4.6.7 1.4.7 2.6v11.5c0 .5.2.7.7.7z"/>
                        <path d="M79.5 56.7c-10.9 4.6-22.8 6.9-33.6 6.9-16 0-31.5-4.4-44-11.7-.2-.1-.4-.2-.6-.2-.7 0-1.1.8-.4 1.5 11.6 10.5 27 16.8 44 16.8 12.2 0 26.3-3.8 36-11 1.7-1.2.3-3-1.4-2.3z"/>
                        <path d="M79.2 29.4c.9-1 2.3-1.5 4.3-1.5 1 0 2 .1 2.9.4.3.1.4.1.6.1.3 0 .5-.2.5-.7v-1C87.5 26.4 87.4 26.1 87.3 26c-.1-.1-.3-.3-.5-.4-1.3-.3-2.6-.6-3.8-.6-2.8 0-4.9.8-6.5 2.5-1.5 1.6-2.3 4-2.3 7 0 3 .7 5.3 2.2 6.9 1.5 1.6 3.6 2.4 6.4 2.4 1.5 0 2.9-.2 4-.7.3-.1.5-.2.6-.4.1-.1.1-.4.1-.7v-1c0-.5-.2-.7-.5-.7-.1 0-.3 0-.5.1-1.1.3-2.2.5-3.2.5-1.9 0-3.3-.5-4.2-1.5-.9-1-1.3-2.6-1.3-4.7v-.5c.1-2.2.5-3.8 1.4-4.8z"/>
                        <path d="M83.7 66.1c5.2-4.4 6.6-13.5 5.5-14.9-.5-.6-2.9-1.2-5.9-1.2-3.2 0-7 .7-9.9 2.7-.9.6-.7 1.4.2 1.3 3.1-.4 10.1-1.2 11.4.4 1.2 1.6-1.4 8.2-2.6 11.1-.3.9.4 1.2 1.3.6z"/>
                        <path d="M69.8 25.4h-2.1c-.5 0-.7.2-.7.7v16.6c0 .5.2.7.7.7h2.1c.5 0 .7-.2.7-.7V26.1c0-.4-.2-.7-.7-.7z"/>
                        <path d="M70.4 18.6c-.4-.4-1-.6-1.7-.6-.7 0-1.2.2-1.6.6-.4.4-.6.9-.6 1.5 0 .6.2 1.2.6 1.5.4.4.9.6 1.6.6.7 0 1.2-.2 1.6-.6.4-.4.6-.9.6-1.5 0-.6-.1-1.2-.5-1.5z"/>
                      </svg>
                    </a>
                  </div>
                </div>
                
                {expandedSongId === song.id && (
                  <div className="mt-4 pl-12 pr-4 pb-2 text-sm">
                    {loadingSongId === song.id ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {song.album && (
                          <p className="text-gray-700 flex items-center">
                            <Disc className="h-4 w-4 text-indigo-500 mr-2" />
                            <span className="font-medium mr-1">Album:</span> {song.album}
                          </p>
                        )}
                        
                        {song.year && (
                          <p className="text-gray-700 flex items-center">
                            <Calendar className="h-4 w-4 text-indigo-500 mr-2" />
                            <span className="font-medium mr-1">Year:</span> {song.year}
                          </p>
                        )}
                        
                        {song.lyrics && (
                          <div className="mt-3">
                            <p className="text-gray-700 flex items-center mb-2">
                              <FileText className="h-4 w-4 text-indigo-500 mr-2" />
                              <span className="font-medium">Lyrics:</span>
                            </p>
                            <div className="pl-6 italic text-gray-600 whitespace-pre-line">
                              {song.lyrics}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default SongList;
