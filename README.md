# VisualArtsDB

An open visual arts database featuring 290,000+ artworks by 28,000+ artists across 790+ styles and 240+ museums. Browse Impressionism, Surrealism, Baroque, Pop Art, and centuries more.

## Features

- **Browse by Style, Genre, Museum, or Artist** — 790+ styles, 900+ genres, 240+ museums, 28,000+ artists
- **Artwork Detail Pages** — full metadata, related works, citation generator (MLA/APA/Chicago)
- **Artist Profiles** — bio, portrait, timeline view grouped by decade, paginated works
- **Command Palette** — press `⌘K` to search across artworks, artists, styles, and genres instantly
- **Favorites** — save artworks and artists locally (no account required)
- **Horizontal Scroll Galleries** — discover art by style and genre on the homepage
- **Responsive** — mobile nav with animations, works on all screen sizes
- **SEO Optimized** — dynamic metadata, OpenGraph images, sitemap, robots.txt

## Tech Stack

- **Framework** — [Next.js 16](https://nextjs.org) (App Router, React 19)
- **Database** — [Neon PostgreSQL](https://neon.tech) (serverless)
- **ORM** — [Drizzle ORM](https://orm.drizzle.team)
- **Styling** — [Tailwind CSS v4](https://tailwindcss.com)
- **Components** — [shadcn/ui](https://ui.shadcn.com)
- **Animations** — [Framer Motion](https://www.framer.com/motion)
- **Command Palette** — [kbar](https://kbar.vercel.app)
- **Typography** — Times New Roman

## Data Sources

Artwork metadata and images are aggregated from public museum APIs and open-access programs:

- Art Institute of Chicago (IIIF)
- Rijksmuseum
- Metropolitan Museum of Art
- WikiArt
- Cleveland Museum of Art
- MoMA

## Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database

### Setup

```bash
git clone https://github.com/britok30/visualartsdb.git
cd visualartsdb
npm install
```

Create a `.env.local` file:

```
DATABASE_URL=your_neon_database_url
SCRAPE_DATABASE_URL=your_scrape_database_url  # optional, for syncing
```

Push the schema to your database:

```bash
npx drizzle-kit push
```

If you have a scrape database, sync the data:

```bash
npx tsx scripts/sync-data.ts
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/
  page.tsx                    # Homepage with hero + scroll galleries
  artwork/[slug]/page.tsx     # Artwork detail
  artist/[slug]/page.tsx      # Artist profile + timeline
  browse/                     # Styles, genres, museums, artists
  search/page.tsx             # Search results
  favorites/page.tsx          # Local favorites
  api/search/route.ts         # Search API for kbar
  terms/page.tsx              # Terms of use
  privacy/page.tsx            # Privacy policy
components/
  hero.tsx                    # Animated homepage hero
  scroll-row.tsx              # Horizontal scroll gallery
  artwork-card.tsx            # Artwork grid/scroll card
  artwork-image.tsx           # Image with error fallback
  command-palette.tsx         # kbar provider + search
  favorite-button.tsx         # Heart toggle (localStorage)
  cite-button.tsx             # Citation generator dropdown
  artist-timeline.tsx         # Decade-grouped timeline
  pagination.tsx              # Reusable pagination
  header.tsx / footer.tsx     # Layout
lib/
  db/schema.ts                # Drizzle schema (14 tables)
  db/queries.ts               # Data access layer
  db/index.ts                 # DB connection
  constants.ts                # Site-wide stats (single source of truth)
  favorites.ts                # localStorage favorites API
scripts/
  sync-data.ts                # Sync data from scrape DB
```

## License

This project is for educational and research purposes. Artwork images and metadata remain the property of their respective institutions. See [Terms of Use](/terms) and [Privacy Policy](/privacy).
