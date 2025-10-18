/**
 * Get the Steam header image URL for a game
 */
export function getSteamHeaderImage(appid: number): string {
  return `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appid}/header.jpg`;
}

/**
 * Get the Steam capsule image URL for a game (alternative format)
 */
export function getSteamCapsuleImage(appid: number): string {
  return `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appid}/capsule_616x353.jpg`;
}

/**
 * Get the Steam library capsule image (best quality for cards)
 */
export function getSteamLibraryCapsule(appid: number): string {
  return `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appid}/library_600x900.jpg`;
}
