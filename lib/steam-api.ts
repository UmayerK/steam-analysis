import axios from 'axios';
import { config } from './config';
import type { SteamGame, SteamAppDetails, SteamReviewsResponse } from './types';

const steamApi = axios.create({
  timeout: 10000,
});

/**
 * Get a list of all Steam apps
 * Note: This returns a very large list, use with caution
 */
export async function getAllSteamApps(): Promise<SteamGame[]> {
  try {
    const response = await steamApi.get(
      `${config.steamApiBaseUrl}/ISteamApps/GetAppList/v2/`
    );
    return response.data.applist.apps;
  } catch (error) {
    console.error('Error fetching Steam apps:', error);
    throw new Error('Failed to fetch Steam apps');
  }
}

/**
 * Search for games by name
 */
export async function searchGames(query: string): Promise<SteamGame[]> {
  try {
    const allApps = await getAllSteamApps();
    const searchTerm = query.toLowerCase();

    // Filter games by search term and limit results
    return allApps
      .filter(app => app.name.toLowerCase().includes(searchTerm))
      .slice(0, 20);
  } catch (error) {
    console.error('Error searching games:', error);
    throw new Error('Failed to search games');
  }
}

/**
 * Get detailed information about a specific game
 */
export async function getGameDetails(appId: number): Promise<SteamAppDetails | null> {
  try {
    const response = await steamApi.get(
      `${config.steamStoreApiBaseUrl}/appdetails`,
      {
        params: {
          appids: appId,
        },
      }
    );

    const data = response.data[appId];
    if (!data || !data.success) {
      return null;
    }

    return data;
  } catch (error) {
    console.error(`Error fetching game details for app ${appId}:`, error);
    return null;
  }
}

/**
 * Get reviews for a specific game
 */
export async function getGameReviews(
  appId: number,
  params?: {
    cursor?: string;
    num_per_page?: number;
    filter?: 'recent' | 'updated' | 'all';
    language?: string;
  }
): Promise<SteamReviewsResponse | null> {
  try {
    // Note: Reviews endpoint is at store.steampowered.com/appreviews, NOT /api/appreviews
    const url = `https://store.steampowered.com/appreviews/${appId}`;
    const requestParams = {
      json: 1,
      cursor: params?.cursor || '*',
      num_per_page: params?.num_per_page || 20,
      filter: params?.filter || 'recent',
      language: params?.language || 'english',
      purchase_type: 'all',
    };

    const response = await steamApi.get(url, { params: requestParams });

    if (response.data.success !== 1) {
      return null;
    }

    return response.data;
  } catch (error) {
    console.error(`Error fetching reviews for app ${appId}:`, error);
    return null;
  }
}

/**
 * Get a list of popular games (top sellers/most played)
 * This is a workaround since Steam doesn't have a direct API for this
 * We'll use a curated list of popular game IDs
 */
export function getPopularGameIds(): number[] {
  return [
    730,    // Counter-Strike 2
    570,    // Dota 2
    1172470, // Apex Legends
    271590,  // GTA V
    1091500, // Cyberpunk 2077
    1245620, // Elden Ring
    2358720, // Black Myth: Wukong
    2519060, // Helldivers 2
    2357570, // Hades II
    292030,  // The Witcher 3
    1086940, // Baldur's Gate 3
    1938090, // Call of Duty
    578080,  // PUBG
    105600,  // Terraria
    1426210, // It Takes Two
    2399830, // Lethal Company
    1203220, // Naraka: Bladepoint
    2050650, // Stardew Valley
    322330,  // Don't Starve Together
    1997040, // Satisfactory
  ];
}

/**
 * Get random games for the hero banner
 */
export async function getRandomGamesForBanner(count: number = 5): Promise<SteamGame[]> {
  const popularIds = getPopularGameIds();
  const shuffled = popularIds.sort(() => 0.5 - Math.random());
  const selectedIds = shuffled.slice(0, count);

  try {
    const allApps = await getAllSteamApps();
    return allApps.filter(app => selectedIds.includes(app.appid));
  } catch (error) {
    console.error('Error fetching random games:', error);
    return [];
  }
}
