import axios from 'axios';
import type { SteamSpyGame } from './types';

const steamspyApi = axios.create({
  baseURL: 'https://steamspy.com/api.php',
  timeout: 15000,
});

/**
 * Get top 100 games by player count
 */
export async function getTop100Games(): Promise<SteamSpyGame[]> {
  try {
    const response = await steamspyApi.get('', {
      params: {
        request: 'top100in2weeks',
      },
    });

    // SteamSpy returns an object with appids as keys
    const gamesObj = response.data;
    const games = Object.values(gamesObj) as SteamSpyGame[];

    return games;
  } catch (error) {
    console.error('Error fetching top 100 games:', error);
    throw new Error('Failed to fetch top games');
  }
}

/**
 * Get games by genre
 */
export async function getGamesByGenre(genre: string): Promise<SteamSpyGame[]> {
  try {
    const response = await steamspyApi.get('', {
      params: {
        request: 'genre',
        genre: genre,
      },
    });

    const gamesObj = response.data;
    const games = Object.values(gamesObj) as SteamSpyGame[];

    return games;
  } catch (error) {
    console.error(`Error fetching games by genre ${genre}:`, error);
    throw new Error('Failed to fetch games by genre');
  }
}

/**
 * Get games by tag
 */
export async function getGamesByTag(tag: string): Promise<SteamSpyGame[]> {
  try {
    const response = await steamspyApi.get('', {
      params: {
        request: 'tag',
        tag: tag,
      },
    });

    const gamesObj = response.data;
    const games = Object.values(gamesObj) as SteamSpyGame[];

    return games;
  } catch (error) {
    console.error(`Error fetching games by tag ${tag}:`, error);
    throw new Error('Failed to fetch games by tag');
  }
}

/**
 * Get all available genres
 */
export function getAvailableGenres(): string[] {
  return [
    'Action',
    'Adventure',
    'Casual',
    'Indie',
    'Massively Multiplayer',
    'Racing',
    'RPG',
    'Simulation',
    'Sports',
    'Strategy',
  ];
}

/**
 * Get popular tags
 */
export function getPopularTags(): string[] {
  return [
    'Multiplayer',
    'Singleplayer',
    'Co-op',
    'FPS',
    'Survival',
    'Horror',
    'Open World',
    'Sandbox',
    'Zombies',
    'Crafting',
    'RPG',
    'Strategy',
    'Puzzle',
    'Platformer',
    'Roguelike',
    'Roguelite',
    'Souls-like',
    'Metroidvania',
    'Tower Defense',
    'Card Game',
    'Turn-Based',
    'Real-Time',
    'Point & Click',
    'Visual Novel',
    'Anime',
    'Pixel Graphics',
    '2D',
    '3D',
    'VR',
    'Early Access',
  ];
}

/**
 * Filter games by price range
 */
export function filterByPriceRange(
  games: SteamSpyGame[],
  priceRange: 'free' | 'under10' | '10to30' | 'over30'
): SteamSpyGame[] {
  return games.filter((game) => {
    const price = parseFloat(game.price) / 100; // Convert cents to dollars

    switch (priceRange) {
      case 'free':
        return price === 0;
      case 'under10':
        return price > 0 && price < 10;
      case '10to30':
        return price >= 10 && price <= 30;
      case 'over30':
        return price > 30;
      default:
        return true;
    }
  });
}

/**
 * Filter games by genre
 */
export function filterByGenre(games: SteamSpyGame[], genre: string): SteamSpyGame[] {
  return games.filter((game) =>
    game.genre.toLowerCase().includes(genre.toLowerCase())
  );
}

/**
 * Sort games by different criteria
 */
export function sortGames(
  games: SteamSpyGame[],
  sortBy: 'players' | 'rating' | 'name' = 'players'
): SteamSpyGame[] {
  const sorted = [...games];

  switch (sortBy) {
    case 'players':
      return sorted.sort((a, b) => b.ccu - a.ccu);
    case 'rating':
      return sorted.sort((a, b) => b.userscore - a.userscore);
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return sorted;
  }
}
