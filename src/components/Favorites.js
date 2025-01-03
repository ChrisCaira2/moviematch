import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Favorites = () => {
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        const savedFavorites = localStorage.getItem('favorites');
        if (savedFavorites) {
            setFavorites(JSON.parse(savedFavorites));
        }
    }, []);

    const removeFavorite = (movie) => {
        const newFavorites = favorites.filter(fav => fav.imdbID !== movie.imdbID);
        setFavorites(newFavorites);
        localStorage.setItem('favorites', JSON.stringify(newFavorites));
    };

    return (
        <div className="min-h-screen bg-gray-800 py-8">
            <Link
                to="/search"
                className="fixed top-4 left-4 z-50 bg-gray-900 px-4 py-2 rounded-lg
                          hover:bg-gray-700 transition-colors shadow-lg text-white"
            >
                ← Back
            </Link>

            <div className="max-w-7xl mx-auto px-4">
                <h1 className="text-4xl font-bold text-gray-100 mb-8 
                             font-['Bebas_Neue'] tracking-wider">
                    My Favorites
                </h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {favorites.map((movie) => (
                        <div
                            key={movie.imdbID}
                            className="bg-gray-900 rounded-xl shadow-lg 
                                     overflow-hidden border border-gray-700 
                                     relative group flex flex-col"
                        >
                            <div className="relative pt-[150%]">
                                <button
                                    onClick={() => removeFavorite(movie)}
                                    className="absolute top-2 right-2 z-10 
                                              bg-red-600 px-2 py-1 rounded-lg
                                              text-white text-sm font-semibold
                                              shadow-md opacity-0 group-hover:opacity-100
                                              transition-opacity duration-200"
                                >
                                    Remove ×
                                </button>
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

                {favorites.length === 0 && (
                    <div className="text-center text-gray-400 mt-8">
                        <p>No favorites added yet!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Favorites;