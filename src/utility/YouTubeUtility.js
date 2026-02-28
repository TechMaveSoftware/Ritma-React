/**
 * Extracts the YouTube video ID from a given URL.
 * Supports various formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 * 
 * @param {string} url The YouTube URL
 * @returns {string|null} The video ID or null if not found
 */
export const getYouTubeVideoId = (url) => {
    if (!url) return null;

    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(regex);

    return (match && match[1]) ? match[1] : null;
};
