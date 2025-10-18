"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface WishlistGame {
  appid: number;
  name: string;
  header_image?: string;
  addedAt: number;
}

interface WishlistContextType {
  wishlist: WishlistGame[];
  addToWishlist: (game: WishlistGame) => void;
  removeFromWishlist: (appid: number) => void;
  isInWishlist: (appid: number) => boolean;
  clearWishlist: () => void;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = 'steam-sentiment-wishlist';

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistGame[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (stored) {
        setWishlist(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
      } catch (error) {
        console.error('Error saving wishlist:', error);
      }
    }
  }, [wishlist, isLoaded]);

  const addToWishlist = (game: WishlistGame) => {
    setWishlist((prev) => {
      // Don't add if already in wishlist
      if (prev.some((item) => item.appid === game.appid)) {
        return prev;
      }
      return [...prev, { ...game, addedAt: Date.now() }];
    });
  };

  const removeFromWishlist = (appid: number) => {
    setWishlist((prev) => prev.filter((item) => item.appid !== appid));
  };

  const isInWishlist = (appid: number) => {
    return wishlist.some((item) => item.appid === appid);
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  const value: WishlistContextType = {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    wishlistCount: wishlist.length,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
