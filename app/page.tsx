import { HeroBanner } from "@/components/hero-banner";
import { SearchBar } from "@/components/search-bar";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-6xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
            Steam Sentiment Analyzer
          </h1>
          <p className="text-xl text-gray-400">
            AI-powered sentiment analysis for Steam game reviews
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-12">
          <SearchBar />
        </div>

        {/* Hero Banner */}
        <div className="mb-16">
          <HeroBanner />
        </div>
      </div>
    </main>
  );
}
