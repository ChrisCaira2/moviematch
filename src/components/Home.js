import React from 'react';
import { Link } from 'react-router-dom';
import { Search, ThumbsUp } from 'lucide-react'; // Import icons if you have lucide-react

const Home = () => {
    return (
        <div className="min-h-screen bg-gray-800 flex flex-col items-center py-20 px-4">
            {/* Title with darker shade */}
            <h1 className="text-9xl font-bold text-gray-300 mb-20 text-center 
                         font-['Bebas_Neue'] tracking-wider"
            >
                Movie Match
            </h1>

            {/* Buttons Container - made even wider */}
            <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
                {/* Search Button - increased height further */}
                <Link
                    to="/search"
                    className="bg-blue-600 rounded-2xl p-12 flex flex-col items-center 
                             justify-center gap-6 hover:bg-blue-700 transition-colors 
                             shadow-lg group h-96"
                >
                    <Search size={80} className="text-white group-hover:scale-110 transition-transform" />
                    <div className="text-center">
                        <h2 className="text-4xl font-bold text-gray-200 mb-3">
                            Add Favorites
                        </h2>
                        <p className="text-gray-200 text-xl">
                            Tell us your favorite movies so we can recommend some that you will like
                        </p>
                    </div>
                </Link>

                {/* Recommendations Button - increased height further */}
                <Link
                    to="/recommendations"
                    className="bg-purple-600 rounded-2xl p-12 flex flex-col items-center 
                             justify-center gap-6 hover:bg-purple-700 transition-colors 
                             shadow-lg group h-96"
                >
                    <ThumbsUp size={80} className="text-white group-hover:scale-110 transition-transform" />
                    <div className="text-center">
                        <h2 className="text-4xl font-bold text-gray-200 mb-3">
                            Get Recommendations
                        </h2>
                        <p className="text-gray-200 text-xl">
                            Discover movies based on your favorites
                        </p>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default Home;