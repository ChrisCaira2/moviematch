const API_KEY = '157fce84';

// Constants for scoring weights (total = 1.0)
const WEIGHTS = {
    genre: 0.30,      // Primary factor
    ratings: 0.25,    // Combined ratings from different sources
    content: 0.20,    // Plot, themes, mood
    creative: 0.15,   // Director, actors, production
    technical: 0.10   // Year, runtime, etc.
};

// Function to get detailed movie info from OMDB API
const getMovieDetails = async (imdbID) => {
    const response = await fetch(`https://www.omdbapi.com/?i=${imdbID}&apikey=${API_KEY}&plot=full`);
    const data = await response.json();
    return data;
};

// Calculate similarity score between two movies
const calculateMovieSimilarity = (favoriteMovie, candidateMovie) => {
    let score = 0;

    // Genre Similarity (0-3 points)
    const favoriteGenres = favoriteMovie.Genre?.split(', ') || [];
    const candidateGenres = candidateMovie.Genre?.split(', ') || [];
    const commonGenres = favoriteGenres.filter(g => candidateGenres.includes(g));
    const genreScore = (commonGenres.length / Math.max(favoriteGenres.length, candidateGenres.length)) * 3;
    score += genreScore * WEIGHTS.genre;

    // Ratings Similarity (0-2.5 points)
    const ratingFactors = ['imdbRating', 'Metascore'].map(factor => {
        const favRating = parseFloat(favoriteMovie[factor]) || 0;
        const candRating = parseFloat(candidateMovie[factor]) || 0;
        if (favRating > 0 && candRating > 0) {
            const diff = Math.abs(favRating - candRating);
            return Math.max(0, 1 - (diff / 20));
        }
        return 0;
    });
    const ratingScore = (ratingFactors.reduce((a, b) => a + b, 0) / ratingFactors.length) * 2.5;
    score += ratingScore * WEIGHTS.ratings;

    // Content Similarity (0-2 points)
    let contentScore = 0;
    // Plot keywords comparison (if available)
    const favKeywords = favoriteMovie.Plot?.toLowerCase().split(' ') || [];
    const candKeywords = candidateMovie.Plot?.toLowerCase().split(' ') || [];
    const commonWords = favKeywords.filter(word =>
        word.length > 4 && candKeywords.includes(word)
    ).length;
    contentScore += Math.min(commonWords / 10, 1);

    // Runtime similarity
    const runtimeDiff = Math.abs(
        parseInt(favoriteMovie.Runtime) - parseInt(candidateMovie.Runtime)
    );
    contentScore += Math.max(0, 1 - (runtimeDiff / 60));
    score += (contentScore / 2) * WEIGHTS.content * 2;

    // Creative Team Similarity (0-1.5 points)
    let creativeScore = 0;
    // Director
    if (favoriteMovie.Director === candidateMovie.Director) {
        creativeScore += 0.5;
    }
    // Actors
    const favoriteActors = favoriteMovie.Actors?.split(', ') || [];
    const candidateActors = candidateMovie.Actors?.split(', ') || [];
    const commonActors = favoriteActors.filter(a => candidateActors.includes(a));
    creativeScore += (commonActors.length / Math.max(favoriteActors.length, candidateActors.length));
    score += creativeScore * WEIGHTS.creative * 1.5;

    // Technical Aspects (0-1 point)
    let technicalScore = 0;
    // Year proximity
    const yearDiff = Math.abs(parseInt(favoriteMovie.Year) - parseInt(candidateMovie.Year));
    technicalScore += Math.max(0, 1 - (yearDiff / 20));
    // Language match
    if (favoriteMovie.Language === candidateMovie.Language) {
        technicalScore += 0.5;
    }
    score += (technicalScore / 1.5) * WEIGHTS.technical;

    // Convert to 1-10 scale with better distribution
    const scaledScore = score * 8; // Multiply by 5 to better utilize the 1-10 range
    return Math.min(10, Math.max(1, scaledScore));
};

// Function to search movies by year range
const searchMoviesByYear = async (year, page = 1) => {
    try {
        const response = await fetch(
            `https://www.omdbapi.com/?s=*&y=${year}&type=movie&page=${page}&apikey=${API_KEY}`
        );
        const data = await response.json();
        return data.Search || [];
    } catch (error) {
        console.error(`Error searching year ${year}:`, error);
        return [];
    }
};

export const getRecommendations = async (favorites) => {
    try {
        console.log(`Starting recommendations process with ${favorites.length} favorites:`,
            favorites.map(f => f.Title));

        // Get detailed info for all favorite movies
        const favoriteDetails = await Promise.all(
            favorites.map(movie => getMovieDetails(movie.imdbID))
        );

        console.log('Successfully retrieved details for favorites:',
            favoriteDetails.map(f => ({
                title: f.Title,
                year: f.Year,
                genres: f.Genre
            }))
        );

        // Get the years range from favorites
        const favoriteYears = favoriteDetails.map(movie => parseInt(movie.Year));
        const minYear = Math.min(...favoriteYears) - 10;
        const maxYear = Math.max(...favoriteYears) + 10;

        // Search for movies in relevant years (parallel searches)
        const yearSearches = [];
        for (let year = minYear; year <= maxYear; year++) {
            // Search first 3 pages for each year to get more candidates
            for (let page = 1; page <= 3; page++) {
                yearSearches.push(searchMoviesByYear(year, page));
            }
        }

        // Also search by genres to ensure we don't miss similar movies
        const allGenres = [...new Set(favoriteDetails.flatMap(movie =>
            movie.Genre ? movie.Genre.split(', ') : []
        ))];

        const genreSearches = allGenres.map(async genre => {
            try {
                const response = await fetch(
                    `https://www.omdbapi.com/?s=${encodeURIComponent(genre)}&type=movie&apikey=${API_KEY}`
                );
                const data = await response.json();
                return data.Search || [];
            } catch (error) {
                console.error(`Error searching genre ${genre}:`, error);
                return [];
            }
        });

        // Combine year and genre searches
        let candidateMovies = await Promise.all([...yearSearches, ...genreSearches]);
        candidateMovies = [...new Set(candidateMovies.flat())]
            .filter(movie =>
                movie &&
                !favorites.some(f => f.imdbID === movie.imdbID)
            );

        console.log(`Found ${candidateMovies.length} potential candidates`);

        // Get detailed info for candidates (process in batches to avoid API rate limits)
        const batchSize = 10;
        let candidateDetails = [];

        for (let i = 0; i < candidateMovies.length; i += batchSize) {
            const batch = candidateMovies.slice(i, i + batchSize);
            const batchDetails = await Promise.all(
                batch.map(movie => getMovieDetails(movie.imdbID))
            );
            candidateDetails.push(...batchDetails);

            // Add a small delay between batches to respect API rate limits
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Calculate recommendations using ALL favorites
        const recommendations = candidateDetails
            .filter(movie => movie && movie.Title)
            .map(candidate => {
                // Calculate similarity score against EACH favorite
                const scores = favoriteDetails.map(favorite => {
                    const score = calculateMovieSimilarity(favorite, candidate);
                    console.log(`Similarity between "${favorite.Title}" and "${candidate.Title}": ${score}`);
                    return score;
                });

                // Average score across ALL favorites
                const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
                console.log(`Final score for "${candidate.Title}": ${averageScore} (averaged across ${scores.length} favorites)`);

                return {
                    ...candidate,
                    recommendationScore: averageScore,
                    basedOnCount: favoriteDetails.length // Add count of favorites used
                };
            });

        // Sort and get top recommendations
        const topRecommendations = recommendations
            .sort((a, b) => b.recommendationScore - a.recommendationScore)
            .slice(0, 20);

        console.log(`Generated ${topRecommendations.length} recommendations based on ${favoriteDetails.length} favorites`);
        return topRecommendations;

    } catch (error) {
        console.error('Error in getRecommendations:', error);
        throw error;
    }
};