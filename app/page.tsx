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

        {/* Info Section */}
        <div className="text-center">
          <h2 className="mb-8 text-3xl font-bold text-white">
            How It Works
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-8 backdrop-blur-sm">
              <div className="mb-4 text-4xl">🔍</div>
              <h3 className="mb-2 text-xl font-bold text-white">Search Games</h3>
              <p className="text-gray-400">
                Find any Steam game using our search feature
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-8 backdrop-blur-sm">
              <div className="mb-4 text-4xl">🤖</div>
              <h3 className="mb-2 text-xl font-bold text-white">AI Analysis</h3>
              <p className="text-gray-400">
                Our NLP model analyzes review sentiment in real-time
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-8 backdrop-blur-sm">
              <div className="mb-4 text-4xl">📊</div>
              <h3 className="mb-2 text-xl font-bold text-white">View Insights</h3>
              <p className="text-gray-400">
                Get detailed sentiment statistics and trends
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
