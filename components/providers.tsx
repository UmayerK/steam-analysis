"use client";

import { WishlistProvider } from "@/lib/wishlist-context";
import { Navbar } from "./navbar";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WishlistProvider>
      <Navbar />
      {children}
    </WishlistProvider>
  );
}
