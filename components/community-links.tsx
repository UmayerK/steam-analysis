"use client";

import { Card } from "./ui/card";

interface CommunityLinksProps {
  appid: string;
  gameName: string;
}

export function CommunityLinks({ appid, gameName }: CommunityLinksProps) {
  const links = [
    {
      title: "Community Hub",
      description: "Join the community and see what players are sharing",
      icon: "🏠",
      url: `https://steamcommunity.com/app/${appid}`,
    },
    {
      title: "Discussions",
      description: "Browse forums and participate in conversations",
      icon: "💬",
      url: `https://steamcommunity.com/app/${appid}/discussions/`,
    },
    {
      title: "Workshop",
      description: "Find and share user-created content",
      icon: "🛠️",
      url: `https://steamcommunity.com/app/${appid}/workshop/`,
    },
    {
      title: "Guides",
      description: "Read player-created guides and tutorials",
      icon: "📚",
      url: `https://steamcommunity.com/app/${appid}/guides/`,
    },
    {
      title: "Achievements",
      description: "View all achievements and global statistics",
      icon: "🏆",
      url: `https://steamcommunity.com/stats/${appid}/achievements/`,
    },
    {
      title: "Screenshots",
      description: "Browse community screenshots and artwork",
      icon: "📷",
      url: `https://steamcommunity.com/app/${appid}/screenshots/`,
    },
  ];

  return (
    <div>
      <h3 className="mb-6 text-2xl font-bold text-white">Community Links</h3>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <a
            key={link.title}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Card className="p-6 h-full transition-all hover:scale-105 hover:bg-white/10">
              <div className="flex items-start gap-4">
                <div className="text-4xl">{link.icon}</div>
                <div className="flex-1">
                  <h4 className="mb-2 text-lg font-bold text-white">
                    {link.title}
                  </h4>
                  <p className="text-sm text-gray-400">
                    {link.description}
                  </p>
                </div>
                <div className="text-blue-400 text-xl">→</div>
              </div>
            </Card>
          </a>
        ))}
      </div>

      <div className="mt-8 text-center">
        <a
          href={`https://steamcommunity.com/app/${appid}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex rounded-full bg-blue-600 px-8 py-3 font-semibold text-white transition-all hover:bg-blue-700"
        >
          Visit {gameName} Community Hub
        </a>
      </div>
    </div>
  );
}
