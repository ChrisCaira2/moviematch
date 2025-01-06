export const getRatingColor = (rating) => {
    const numRating = parseFloat(rating);
    if (numRating >= 8.0) return 'bg-green-500';
    if (numRating >= 7.0) return 'bg-green-400';
    if (numRating >= 6.0) return 'bg-yellow-500';
    if (numRating >= 5.0) return 'bg-orange-500';
    return 'bg-red-500';
};