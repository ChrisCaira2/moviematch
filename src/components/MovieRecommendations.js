import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRecommendations } from '../utils/recommendationEngine';
import { getRatingColor } from '../utils/movieHelpers';

const MovieRecommendations = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadRecommendations = async () => {
            try {
                const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
                if (favorites.length === 0) {
                    setError('Please add some favorite movies first!');
                    setLoading(false);
                    return;
                }

                // Get candidate movies (similar genres to favorites)
                const allGenres = [...new Set(favorites.flatMap(movie =>
                    movie.Genre ? movie.Genre.split(', ') : []
                ))];

                // Search for movies in similar genres
                const genreSearches = allGenres.map(async genre => {
                    try {
                        const response = await fetch(
                            `https://www.omdbapi.com/?s=${encodeURIComponent(genre)}&type=movie&apikey=157fce84`
                        );
                        const data = await response.json();
                        return data.Search || [];
                    } catch (error) {
                        console.error(`Error searching genre ${genre}:`, error);
                        return [];
                    }
                });

                let candidateMovies = await Promise.all(genreSearches);
                candidateMovies = [...new Set(candidateMovies.flat())]
                    .filter(movie => !favorites.some(f => f.imdbID === movie.imdbID));

                // Get detailed info for candidates
                const detailedCandidates = await Promise.all(
                    candidateMovies.slice(0, 50).map(async movie => {
                        const response = await fetch(
                            `https://www.omdbapi.com/?i=${movie.imdbID}&apikey=157fce84`
                        );
                        return response.json();
                    })
                );

                const recs = await getRecommendations(favorites, detailedCandidates);
                setRecommendations(recs);
                setError('');
            } catch (error) {
                console.error('Error loading recommendations:', error);
                setError('Failed to load recommendations');
            } finally {
                setLoading(false);
            }
        };

        loadRecommendations();
    }, []);

    const getScoreColor = (score) => {
        if (score >= 8) return 'text-green-500';
        if (score >= 6) return 'text-yellow-500';
        return 'text-red-500';
    };

    return (
        <div className="min-h-screen bg-gray-800 py-8">
            <Link
                to="/"
                className="fixed top-4 left-4 z-50 bg-gray-900 px-4 py-2 rounded-lg
                          hover:bg-gray-700 transition-colors shadow-lg text-white"
            >
                ← Back
            </Link>

            <div className="max-w-7xl mx-auto px-4">
                <h1 className="text-4xl font-bold text-gray-100 mb-8 
                             font-['Bebas_Neue'] tracking-wider text-center">
                    Recommended For You
                </h1>

                {recommendations.length > 0 && (
                    <p className="text-center text-gray-400 mb-8">
                        Based on {recommendations[0].basedOnCount} favorite movies
                    </p>
                )}

                {loading && (
                    <div className="text-center text-white">Loading recommendations...</div>
                )}

                {error && (
                    <div className="text-center text-red-500">{error}</div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {recommendations.map((movie) => (
                        <div
                            key={movie.imdbID}
                            className="bg-gray-900 rounded-xl shadow-lg 
                                     overflow-hidden border border-gray-700 flex flex-col"
                        >
                            <div className="relative pt-[150%]">
                                <div className={`absolute top-2 right-2 z-10 
                                               bg-gray-900 px-3 py-1 rounded-lg
                                               text-lg font-bold shadow-md
                                               ${getScoreColor(movie.recommendationScore)}`}>
                                    {movie.recommendationScore.toFixed(1)}
                                </div>
                                {movie.Poster !== 'N/A' ? (
                                    <img
                                        src={movie.Poster}
                                        alt={movie.Title}
                                        className="absolute top-0 left-0 w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="absolute top-0 left-0 w-full h-full 
                                                flex items-center justify-center bg-gray-800">
                                        <span className="text-gray-400">No poster available</span>
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="font-['Bebas_Neue'] tracking-wide text-xl mb-2 text-white truncate">
                                    {movie.Title}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400">{movie.Year}</span>
                                    {movie.imdbRating && movie.imdbRating !== "N/A" && (
                                        <span className={`${getRatingColor(movie.imdbRating)} 
                                                      px-2 py-0.5 rounded text-white text-sm 
                                                      font-semibold`}>
                                            {movie.imdbRating}
                                        </span>
                                    )}
                                </div>
                                <div className="text-gray-300 mt-2 text-sm">
                                    {movie.Genre}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MovieRecommendations;
