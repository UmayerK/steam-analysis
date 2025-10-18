import axios from 'axios';
import type { SteamNewsResponse } from './types';

const steamApi = axios.create({
  timeout: 15000,
});

/**
 * Get news for a specific app
 */
export async function getGameNews(appId: number, count: number = 10): Promise<SteamNewsResponse | null> {
  try {
    const response = await steamApi.get(
      `https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/`,
      {
        params: {
          appid: appId,
          count,
          maxlength: 300,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(`Error fetching news for app ${appId}:`, error);
    return null;
  }
}

/**
 * Get Workshop URL for a game
 * Note: Workshop data requires authentication and cannot be fetched via public API
 * Users should visit the Steam Workshop page directly
 */
export function getWorkshopItems(appId: number): null {
  // Workshop items cannot be fetched without API key
  // Return null to indicate this feature is not available
  console.warn(`Workshop items cannot be fetched for app ${appId} without API authentication`);
  return null;
}

/**
 * Get community hub URL for a game
 */
export function getCommunityHubUrl(appId: number): string {
  return `https://steamcommunity.com/app/${appId}`;
}

/**
 * Get discussions URL for a game
 */
export function getDiscussionsUrl(appId: number): string {
  return `https://steamcommunity.com/app/${appId}/discussions/`;
}

/**
 * Get workshop URL for a game
 */
export function getWorkshopUrl(appId: number): string {
  return `https://steamcommunity.com/app/${appId}/workshop/`;
}

/**
 * Get guides URL for a game
 */
export function getGuidesUrl(appId: number): string {
  return `https://steamcommunity.com/app/${appId}/guides/`;
}

/**
 * Get achievements URL for a game
 */
export function getAchievementsUrl(appId: number): string {
  return `https://steamcommunity.com/stats/${appId}/achievements/`;
}
