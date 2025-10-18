# Steam Sentiment Analyzer

An AI-powered sentiment analysis tool for Steam game reviews built with Next.js, Tailwind CSS, and Aceternity UI.

## Features

- **Real-time Sentiment Analysis**: Uses NLP to analyze Steam game reviews and provide sentiment scores
- **Beautiful UI**: Modern, sleek interface built with Tailwind CSS and Aceternity UI components
- **Hero Banner**: Rotating showcase of popular Steam games with sentiment indicators
- **Search Functionality**: Search for any Steam game
- **Detailed Game Pages**: View comprehensive sentiment statistics, review trends, and game metadata
- **No Login Required**: Simple and accessible for all users

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animations
- **Sentiment.js** - NLP sentiment analysis
- **Steam API** - Game data and reviews

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Steam API key (optional - Steam's public APIs are used)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd "Vibe Code"
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# The .env file is already created
# Add your Steam API key if needed (currently optional)
STEAM_API_KEY=your_steam_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── games/        # Game-related endpoints
│   │   ├── reviews/      # Review endpoints
│   │   └── sentiment/    # Sentiment analysis endpoints
│   ├── game/[appid]/     # Game detail page
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/
│   ├── ui/               # UI components
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   └── spotlight-card.tsx
│   ├── hero-banner.tsx   # Rotating hero banner
│   └── search-bar.tsx    # Search component
├── lib/
│   ├── config.ts         # Configuration
│   ├── steam-api.ts      # Steam API utilities
│   ├── sentiment-analysis.ts  # Sentiment analysis logic
│   ├── types.ts          # TypeScript types
│   └── utils.ts          # Utility functions
└── README.md
```

## API Endpoints

### Games
- `GET /api/games/random` - Get random popular games for hero banner
- `GET /api/games/search?q={query}` - Search for games by name
- `GET /api/games/[appid]` - Get detailed game information

### Reviews
- `GET /api/reviews/[appid]` - Get reviews with sentiment analysis

### Sentiment
- `GET /api/sentiment/[appid]` - Get sentiment statistics and trends

## Features Explained

### Sentiment Analysis
The app uses the `sentiment` library to perform NLP analysis on Steam review text. Each review gets:
- A sentiment score (-5 to +5)
- A sentiment label (positive, neutral, negative)
- Identification of positive and negative keywords

### Hero Banner
- Displays 5 random popular games
- Auto-rotates every 5 seconds
- Shows sentiment percentage for each game
- Links to detailed game page and Steam store

### Game Detail Page
- Game metadata (description, price, release date, etc.)
- Overall sentiment statistics
- Sentiment trend timeline
- Individual reviews with sentiment scores
- Direct link to Steam store page

## Customization

### Adding More Games to Hero Banner
Edit `lib/steam-api.ts` and modify the `getPopularGameIds()` function to include different game App IDs.

### Styling
All styling uses Tailwind CSS. Modify classes in components or extend the theme in `tailwind.config.ts`.

## Building for Production

```bash
npm run build
npm start
```

## Notes

- Steam API has rate limits - the app caches data where possible
- Some Steam games may not have reviews available
- Sentiment analysis is performed server-side to keep the API key secure
- The app uses Steam's public APIs which don't require authentication for most features

## License

MIT

## Acknowledgments

- Steam for providing the API
- Aceternity UI for design inspiration
- Sentiment.js for NLP analysis
