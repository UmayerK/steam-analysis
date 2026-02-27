"use client";

import Link from "next/link";
import Image from "next/image";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { WishlistButton } from "./wishlist-button";
import { getSteamHeaderImage } from "@/lib/steam-image-api";

interface GameCardProps {
  appid: number;
  name: string;
  header_image?: string;
  score?: number;
  price?: string;
  developer?: string;
  genre?: string;
  owners?: string;
  isFree?: boolean;
}

export function GameCard({
  appid,
  name,
  header_image,
  score,
  price,
  developer,
  genre,
  owners,
  isFree,
}: GameCardProps) {
  const getScoreColor = (scoreValue: number) => {
    if (scoreValue >= 80) return "text-green-400";
    if (scoreValue >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const formatOwners = (ownersStr?: string) => {
    if (!ownersStr) return null;
    const parts = ownersStr.split(' .. ');
    if (parts.length === 2) {
      return `${parts[0]} - ${parts[1]} owners`;
    }
    return ownersStr;
  };

  const formatPrice = () => {
    if (isFree || price === '0') return 'Free';
    if (!price) return null;
    const priceNum = parseFloat(price) / 100;
    return `$${priceNum.toFixed(2)}`;
  };

  // Use provided header_image or generate from appid
  const imageUrl = header_image || getSteamHeaderImage(appid);

  return (
    <Link href={`/game/${appid}`}>
      <Card className="overflow-hidden h-full transition-all hover:scale-105">
        <div className="relative">
          <div className="relative h-48 w-full bg-slate-800">
            <Image
              src={imageUrl}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              quality={90}
              priority={false}
            />
          </div>
          <div className="absolute top-2 right-2">
            <WishlistButton
              appid={appid}
              name={name}
              header_image={imageUrl}
              variant="icon"
              className="bg-black/50 backdrop-blur-sm"
            />
          </div>
        </div>
        <div className="p-4">
          <h3 className="mb-2 text-lg font-bold text-white line-clamp-2">
            {name}
          </h3>
          <div className="mb-3 flex flex-wrap gap-2">
            {score !== undefined && (
              <Badge variant="default" className="text-xs">
                <span className={getScoreColor(score)}>
                  {score}% Positive
                </span>
              </Badge>
            )}
            {formatPrice() && (
              <Badge
                variant={isFree || price === '0' ? "positive" : "default"}
                className="text-xs"
              >
                {formatPrice()}
              </Badge>
            )}
          </div>
          <div className="space-y-1 text-sm text-gray-400">
            {formatOwners(owners) && <p>{formatOwners(owners)}</p>}
            {genre && <p className="line-clamp-1">{genre}</p>}
            {developer && <p className="line-clamp-1">By {developer}</p>}
          </div>
          <div className="mt-3 flex gap-2">
            <div className="flex-1 rounded-full bg-white/10 px-4 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-white/20">
              View Details
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open(`https://store.steampowered.com/app/${appid}`, '_blank', 'noopener,noreferrer');
              }}
              className="flex-1 rounded-full bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Steam Store
            </button>
          </div>
        </div>
      </Card>
    </Link>
  );
}
