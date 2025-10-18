"use client";

import { useState, useEffect } from "react";
import { useWishlist } from "@/lib/wishlist-context";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  appid: number;
  name: string;
  header_image?: string;
  variant?: "icon" | "button";
  className?: string;
}

export function WishlistButton({
  appid,
  name,
  header_image,
  variant = "icon",
  className,
}: WishlistButtonProps) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [inWishlist, setInWishlist] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    setInWishlist(isInWishlist(appid));
  }, [appid, isInWishlist]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (inWishlist) {
      removeFromWishlist(appid);
      setToastMessage("Removed from wishlist");
    } else {
      addToWishlist({ appid, name, header_image });
      setToastMessage("Added to wishlist");
    }

    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  if (variant === "button") {
    return (
      <>
        <button
          onClick={handleClick}
          className={cn(
            "rounded-full px-6 py-2 font-semibold transition-all",
            inWishlist
              ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
              : "bg-white/10 text-white hover:bg-white/20",
            className
          )}
        >
          {inWishlist ? (
            <>
              <span className="mr-2">💔</span>
              Remove from Wishlist
            </>
          ) : (
            <>
              <span className="mr-2">❤️</span>
              Add to Wishlist
            </>
          )}
        </button>
        {showToast && <Toast message={toastMessage} />}
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleClick}
        className={cn(
          "rounded-full p-2 transition-all hover:scale-110",
          inWishlist
            ? "bg-red-500 text-white"
            : "bg-white/10 text-white hover:bg-white/20",
          className
        )}
        title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
      >
        <svg
          className="h-6 w-6"
          fill={inWishlist ? "currentColor" : "none"}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>
      {showToast && <Toast message={toastMessage} />}
    </>
  );
}

function Toast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-8 right-8 z-50 animate-in fade-in slide-in-from-bottom-4">
      <div className="rounded-full bg-white/10 px-6 py-3 text-white backdrop-blur-md border border-white/20 shadow-lg">
        {message}
      </div>
    </div>
  );
}
