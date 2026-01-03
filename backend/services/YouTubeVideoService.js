const axios = require('axios');
require('dotenv').config();

class YouTubeVideoService {
    constructor() {
        this.apiKey = process.env.YOUTUBE_API_KEY;
        this.baseUrl = 'https://www.googleapis.com/youtube/v3';
        
        // Note: YouTube API key is optional - if not provided, we'll return mock data
        if (!this.apiKey) {
            console.warn('YOUTUBE_API_KEY not found in environment variables. Using mock data for video searches.');
        }
    }

    async searchVideosByTitleAndLanguage(title, language) {
        try {
            if (!this.apiKey) {
                // Return mock data if no API key is provided
                return this.getMockVideoLinks(title, language);
            }

            const searchQuery = title;
            const response = await axios.get(`${this.baseUrl}/search`, {
                params: {
                    key: this.apiKey,
                    q: searchQuery,
                    part: 'snippet',
                    type: 'video',
                    maxResults: 2,
                    relevanceLanguage: this.getLanguageCode(language),
                    order: 'relevance'
                }
            });

            const videoLinks = [];
            if (response.data.items) {
                for (const item of response.data.items) {
                    const videoId = item.id.videoId;
                    const videoLink = `https://www.youtube.com/watch?v=${videoId}`;
                    videoLinks.push(videoLink);
                }
            }

            return videoLinks;

        } catch (error) {
            console.error('Error searching YouTube videos:', error.message);
            // Fall back to mock data on error
            return this.getMockVideoLinks(title, language);
        }
    }

    getMockVideoLinks(title, language) {
        // Return mock YouTube links for development/testing purposes
        return [
            `https://www.youtube.com/results?search_query=${encodeURIComponent(title + ' ' + language)}`,
            `https://www.youtube.com/results?search_query=${encodeURIComponent(title + ' tutorial ' + language)}`
        ];
    }

    getLanguageCode(language) {
        // Map common language names to YouTube language codes
        const languageCodes = {
            'english': 'en',
            'spanish': 'es',
            'french': 'fr',
            'german': 'de',
            'italian': 'it',
            'portuguese': 'pt',
            'russian': 'ru',
            'japanese': 'ja',
            'korean': 'ko',
            'chinese': 'zh',
            'hindi': 'hi',
            'arabic': 'ar',
            'dutch': 'nl',
            'swedish': 'sv',
            'norwegian': 'no',
            'danish': 'da',
            'finnish': 'fi',
            'polish': 'pl',
            'czech': 'cs',
            'hungarian': 'hu',
            'turkish': 'tr',
            'greek': 'el',
            'hebrew': 'he',
            'thai': 'th',
            'vietnamese': 'vi',
            'indonesian': 'id',
            'malay': 'ms',
            'filipino': 'tl',
            'bengali': 'bn',
            'urdu': 'ur',
            'tamil': 'ta',
            'telugu': 'te',
            'gujarati': 'gu',
            'kannada': 'kn',
            'malayalam': 'ml',
            'marathi': 'mr',
            'punjabi': 'pa'
        };

        return languageCodes[language.toLowerCase()] || 'en';
    }
}

module.exports = YouTubeVideoService;