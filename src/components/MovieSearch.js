import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const MovieSearch = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [favorites, setFavorites] = useState([]);

    const API_KEY = '157fce84';

    // Load top rated movies on initial render
    useEffect(() => {
        const loadTopRatedMovies = async () => {
            try {
                // List of some of the highest-rated movies
                const topMovieIds = [
                    'tt0111161', // The Shawshank Redemption
                    'tt0068646', // The Godfather
                    'tt0071562', // The Godfather: Part II
                    'tt0468569', // The Dark Knight
                    'tt0050083', // 12 Angry Men
                    'tt0108052', // Schindler's List
                    'tt0167260', // The Lord of the Rings: The Return of the King
                    'tt0110912', // Pulp Fiction
                    'tt0060196', // The Good, the Bad and the Ugly
                    'tt0109830', // Forrest Gump
                    'tt0120737', // The Lord of the Rings: The Fellowship of the Ring
                    'tt0137523', // Fight Club
                    'tt0080684', // Star Wars: Episode V - The Empire Strikes Back
                    'tt0167261', // The Lord of the Rings: The Two Towers
                    'tt0133093', // The Matrix
                    'tt0099685'  // Goodfellas
                ];

                const topMovies = await Promise.all(
                    topMovieIds.map(async (id) => {
                        const response = await fetch(
                            `https://www.omdbapi.com/?i=${id}&apikey=157fce84`
                        );
                        return response.json();
                    })
                );

                setMovies(topMovies.sort((a, b) =>
                    parseFloat(b.imdbRating) - parseFloat(a.imdbRating)
                ));
            } catch (error) {
                setError('Failed to fetch top rated movies');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        loadTopRatedMovies();

        // Load favorites from localStorage
        const savedFavorites = localStorage.getItem('favorites');
        if (savedFavorites) {
            setFavorites(JSON.parse(savedFavorites));
        }
    }, []);

    const loadTopRatedMovies = async () => {
        try {
            // List of some of the highest-rated movies
            const topMovieIds = [
                'tt0111161', // The Shawshank Redemption
                'tt0068646', // The Godfather
                'tt0071562', // The Godfather: Part II
                'tt0468569', // The Dark Knight
                'tt0050083', // 12 Angry Men
                'tt0108052', // Schindler's List
                'tt0167260', // The Lord of the Rings: The Return of the King
                'tt0110912', // Pulp Fiction
                'tt0060196', // The Good, the Bad and the Ugly
                'tt0109830', // Forrest Gump
                'tt0120737', // The Lord of the Rings: The Fellowship of the Ring
                'tt0137523', // Fight Club
                'tt0080684', // Star Wars: Episode V - The Empire Strikes Back
                'tt0167261', // The Lord of the Rings: The Two Towers
                'tt0133093', // The Matrix
                'tt0099685'  // Goodfellas
            ];

            const topMovies = await Promise.all(
                topMovieIds.map(async (id) => {
                    const response = await fetch(
                        `https://www.omdbapi.com/?i=${id}&apikey=157fce84`
                    );
                    return response.json();
                })
            );

            setMovies(topMovies.sort((a, b) =>
                parseFloat(b.imdbRating) - parseFloat(a.imdbRating)
            ));
        } catch (error) {
            setError('Failed to fetch top rated movies');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault(); // Prevent form submission default behavior

        if (!searchTerm || searchTerm.trim() === '') {
            // If search is empty, load top rated movies
            setLoading(true);
            await loadTopRatedMovies();
            return;
        }

        setLoading(true);
        setError('');
        try {
            const response = await fetch(
                `https://www.omdbapi.com/?s=${searchTerm}&type=movie&apikey=157fce84`
            );
            const data = await response.json();

            if (data.Response === "True") {
                // Get full details for each movie including ratings
                const moviesWithRatings = await Promise.all(
                    data.Search.slice(0, 10).map(async (movie) => {
                        try {
                            const detailResponse = await fetch(
                                `https://www.omdbapi.com/?i=${movie.imdbID}&apikey=157fce84`
                            );
                            const detailData = await detailResponse.json();

                            return {
                                ...movie,
                                imdbRating: detailData.imdbRating || "N/A",
                                Year: detailData.Year || movie.Year,
                                Title: detailData.Title || movie.Title,
                                Poster: movie.Poster || "N/A"
                            };
                        } catch (error) {
                            console.error(`Error fetching details for movie:`, error);
                            return null;
                        }
                    })
                );

                // Filter out any null results and sort by rating
                const validMovies = moviesWithRatings
                    .filter(movie => movie !== null)
                    .filter(movie => movie.imdbRating && movie.imdbRating !== "N/A")
                    .sort((a, b) => {
                        const ratingA = parseFloat(a.imdbRating);
                        const ratingB = parseFloat(b.imdbRating);
                        return ratingB - ratingA;
                    });

                setMovies(validMovies);
            } else {
                setError(data.Error || 'No results found');
                setMovies([]);
            }
        } catch (error) {
            console.error('Search function error:', error);
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

    // Add this helper function to determine the color based on rating
    const getRatingColor = (rating) => {
        const numRating = parseFloat(rating);
        if (numRating >= 8.0) return 'bg-green-500';
        if (numRating >= 7.0) return 'bg-green-400';
        if (numRating >= 6.0) return 'bg-yellow-500';
        if (numRating >= 5.0) return 'bg-orange-500';
        return 'bg-red-500';
    };

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

                <form onSubmit={handleSearch} className="mb-8">
                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search for movies..."
                            className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-600 
                                     bg-gray-700 text-white placeholder-gray-400
                                     focus:outline-none focus:border-blue-500 focus:ring-2 
                                     focus:ring-blue-500 text-lg"
                        />
                        <button
                            type="submit"
                            className="px-8 py-3 bg-blue-600 text-white rounded-xl
                                     hover:bg-blue-700 transition-colors duration-200
                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Search
                        </button>
                    </div>
                </form>

                {loading && (
                    <div className="text-center text-white">Loading movies...</div>
                )}

                {error && (
                    <div className="text-center text-red-500">{error}</div>
                )}

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
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MovieSearch;