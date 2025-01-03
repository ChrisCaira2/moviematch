import React from 'react';

const MovieCard = ({ movie }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
        <div className="relative h-96">
            {movie.Poster !== 'N/A' ? (
                <img
                    src={movie.Poster}
                    alt={movie.Title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.src = '/api/placeholder/300/400';
                        e.target.alt = 'No poster available';
                    }}
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <span className="text-gray-500">No poster available</span>
                </div>
            )}
        </div>
        <div className="p-4">
            <h3 className="font-semibold text-lg mb-1 text-gray-900 truncate">
                {movie.Title}
            </h3>
            <p className="text-gray-600">{movie.Year}</p>
        </div>
    </div>
);

export default MovieCard;