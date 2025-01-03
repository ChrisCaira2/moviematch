import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const MovieSearch = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [favorites, setFavorites] = useState([]);

    const API_KEY = '157fce84';

    const searchMovies = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(
                `http://www.omdbapi.com/?apikey=${API_KEY}&s=${searchTerm}&type=movie`
            );
            const data = await response.json();

            if (data.Response === 'True') {
                setMovies(data.Search);
            } else {
                setError(data.Error);
                setMovies([]);
            }
        } catch (err) {
            setError('Failed to fetch movies');
            setMovies([]);
        } finally {
            setLoading(false);
        }
    };

    const toggleFavorite = (movie) => {
        setFavorites(prevFavorites => {
            const isFavorite = prevFavorites.some(fav => fav.imdbID === movie.imdbID);
            const newFavorites = isFavorite
                ? prevFavorites.filter(fav => fav.imdbID !== movie.imdbID)
                : [...prevFavorites, movie];

            // Save to localStorage
            localStorage.setItem('favorites', JSON.stringify(newFavorites));
            return newFavorites;
        });
    };

    // Load favorites from localStorage on component mount
    useEffect(() => {
        const savedFavorites = localStorage.getItem('favorites');
        if (savedFavorites) {
            setFavorites(JSON.parse(savedFavorites));
        }
    }, []);

    return (
        <div className="min-h-screen bg-gray-800 py-8">
            <Link
                to="/favorites"
                className="fixed top-4 right-4 z-50 bg-yellow-600 px-6 py-4 rounded-2xl
                          hover:bg-yellow-700 transition-colors shadow-lg flex items-center gap-2"
            >
                <span className="text-white text-xl">Favorites</span>
                <span className="text-white text-2xl">★</span>
            </Link>

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
                    Search Movies
                </h1>

                {/* Search Header */}
                <div className="text-center mb-12">
                    <h3 className="text-2xl font-bold font-['Bebas_Neue'] text-white mb-8">click once to add to favorites, click again to remove</h3>
                    <form onSubmit={searchMovies} className="flex items-center justify-center gap-4">
                        <div className="relative flex-1 max-w-2xl">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search for movies..."
                                className="w-full px-6 py-3 rounded-xl border-2 border-gray-600 
                         bg-gray-700 text-white placeholder-gray-400
                         focus:outline-none focus:border-blue-500 focus:ring-2 
                         focus:ring-blue-500 text-lg"
                            />
                            <button
                                type="submit"
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2
                         bg-blue-500 rounded-lg hover:bg-blue-600 
                         transition-colors duration-200"
                            >
                                <Search size={24} className="text-white" />
                            </button>
                        </div>
                    </form>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="text-center text-gray-300 text-lg mb-8">
                        Loading movies...
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="text-center text-red-400 text-lg mb-8">
                        {error}
                    </div>
                )}

                {/* Movie Grid - Changed from horizontal scroll to responsive grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {movies.map((movie) => (
                        <div
                            key={movie.imdbID}
                            className="bg-gray-900 rounded-xl shadow-lg 
                                     overflow-hidden transition-transform hover:scale-105
                                     border border-gray-700 cursor-pointer flex flex-col"
                            onClick={() => toggleFavorite(movie)}
                        >
                            <div className="relative pt-[150%]">
                                {favorites.some(fav => fav.imdbID === movie.imdbID) && (
                                    <div className="absolute top-2 right-2 z-10 
                                                  bg-yellow-600 px-2 py-1 rounded-lg
                                                  text-white text-sm font-semibold
                                                  shadow-md">
                                        Favorite ★
                                    </div>
                                )}
                                {movie.Poster !== 'N/A' ? (
                                    <img
                                        src={movie.Poster}
                                        alt={movie.Title}
                                        className="absolute top-0 left-0 w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = '/api/placeholder/300/400';
                                            e.target.alt = 'No poster available';
                                        }}
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
                                <p className="text-gray-400">{movie.Year}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* No Results */}
                {!loading && !error && movies.length === 0 && searchTerm && (
                    <div className="text-center text-gray-300 text-lg">
                        No movies found. Try a different search term.
                    </div>
                )}
            </div>
        </div>
    );
};

export default MovieSearch;