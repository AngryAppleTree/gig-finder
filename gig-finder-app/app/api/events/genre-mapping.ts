// Genre Mapping for Skiddle API
// Maps Skiddle's genre names to our GigFinder categories

export type VibeCategory =
    | 'rock_blues_punk'
    | 'indie_alt'
    | 'metal'
    | 'pop'
    | 'electronic'
    | 'hiphop'
    | 'acoustic'
    | 'classical';

// Comprehensive mapping of Skiddle genres to our categories
const genreMap: { [key: string]: VibeCategory } = {
    // Rock, Blues & Punk
    'rock': 'rock_blues_punk',
    'punk': 'rock_blues_punk',
    'blues': 'rock_blues_punk',
    'garage rock': 'rock_blues_punk',
    'psychedelic rock': 'rock_blues_punk',
    'classic rock': 'rock_blues_punk',
    'rock and roll': 'rock_blues_punk',
    'rockabilly': 'rock_blues_punk',
    'ska': 'rock_blues_punk',


    // Indie & Alternative
    'indie': 'indie_alt',
    'alternative': 'indie_alt',
    'indie rock': 'indie_alt',
    'indie pop': 'indie_alt',
    'alternative rock': 'indie_alt',
    'shoegaze': 'indie_alt',
    'post-punk': 'indie_alt',
    'new wave': 'indie_alt',
    'britpop': 'indie_alt',

    // Hard Rock & Metal
    'metal': 'metal',
    'heavy metal': 'metal',
    'hard rock': 'metal',
    'death metal': 'metal',
    'black metal': 'metal',
    'thrash metal': 'metal',
    'doom metal': 'metal',
    'metalcore': 'metal',
    'hardcore': 'metal',

    // Pop & Charts
    'pop': 'pop',
    'chart': 'pop',
    'mainstream': 'pop',
    'top 40': 'pop',
    'synth pop': 'pop',
    'electro pop': 'pop',
    'dance pop': 'pop',

    // Electronic & Dance
    'electronic': 'electronic',
    'dance': 'electronic',
    'edm': 'electronic',
    'house': 'electronic',
    'techno': 'electronic',
    'trance': 'electronic',
    'drum and bass': 'electronic',
    'dubstep': 'electronic',
    'garage': 'electronic',
    'disco': 'electronic',
    'electro': 'electronic',
    'ambient': 'electronic',
    'idm': 'electronic',

    // Hip Hop & R&B
    'hip hop': 'hiphop',
    'rap': 'hiphop',
    'r&b': 'hiphop',
    'rnb': 'hiphop',
    'grime': 'hiphop',
    'trap': 'hiphop',

    'funk': 'hiphop',

    // Acoustic, Folk, Jazz & Soul
    'acoustic': 'acoustic',
    'folk': 'acoustic',
    'jazz': 'acoustic',
    'blues jazz': 'acoustic',
    'singer-songwriter': 'acoustic',
    'country': 'acoustic',
    'americana': 'acoustic',
    'bluegrass': 'acoustic',
    'world music': 'acoustic',
    'celtic': 'acoustic',
    'soul': 'acoustic',
    'reggae': 'acoustic',

    // Classical & Orchestra
    'classical': 'classical',
    'orchestra': 'classical',
    'symphony': 'classical',
    'opera': 'classical',
    'chamber music': 'classical',
};

export function mapGenreToVibe(genres: Array<{ name: string }>): VibeCategory {
    if (!genres || genres.length === 0) {
        return 'indie_alt'; // default
    }

    // Try all genres, not just the first one
    for (const genre of genres) {
        const genreLower = genre.name.toLowerCase().trim();

        // Direct match
        if (genreMap[genreLower]) {
            return genreMap[genreLower];
        }

        // Partial match (check if any keyword is in the genre name)
        for (const [key, vibe] of Object.entries(genreMap)) {
            if (genreLower.includes(key) || key.includes(genreLower)) {
                return vibe;
            }
        }
    }

    // Default fallback
    return 'indie_alt';
}
