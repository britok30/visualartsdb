import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  date,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Core entities ───────────────────────────────────────────────

export const artists = pgTable(
  "artists",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 512 }).notNull(),
    slug: varchar("slug", { length: 512 }).notNull().unique(),
    birthYear: integer("birth_year"),
    deathYear: integer("death_year"),
    nationality: varchar("nationality", { length: 256 }),
    bio: text("bio"),
    portraitUrl: text("portrait_url"),
    wikiUrl: text("wiki_url"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("artists_name_idx").on(t.name)]
);

export const museums = pgTable("museums", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 512 }).notNull(),
  slug: varchar("slug", { length: 512 }).notNull().unique(),
  city: varchar("city", { length: 256 }),
  country: varchar("country", { length: 256 }),
  website: text("website"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const genres = pgTable("genres", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 256 }).notNull().unique(),
  slug: varchar("slug", { length: 256 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const styles = pgTable("styles", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 256 }).notNull().unique(),
  slug: varchar("slug", { length: 256 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const movements = pgTable("movements", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 256 }).notNull().unique(),
  slug: varchar("slug", { length: 256 }).notNull().unique(),
  description: text("description"),
  startYear: integer("start_year"),
  endYear: integer("end_year"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const periods = pgTable("periods", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 256 }).notNull().unique(),
  slug: varchar("slug", { length: 256 }).notNull().unique(),
  description: text("description"),
  startYear: integer("start_year"),
  endYear: integer("end_year"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const tags = pgTable("tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 256 }).notNull().unique(),
  slug: varchar("slug", { length: 256 }).notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const artworks = pgTable(
  "artworks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 1024 }).notNull(),
    slug: varchar("slug", { length: 1024 }).notNull().unique(),
    year: integer("year"),
    yearTo: integer("year_to"),
    medium: varchar("medium", { length: 512 }),
    dimensions: varchar("dimensions", { length: 256 }),
    description: text("description"),
    imageUrl: text("image_url"),
    thumbnailUrl: text("thumbnail_url"),
    museumId: uuid("museum_id").references(() => museums.id),
    genreId: uuid("genre_id").references(() => genres.id),
    periodId: uuid("period_id").references(() => periods.id),
    isPublicDomain: boolean("is_public_domain").default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("artworks_title_idx").on(t.title),
    index("artworks_year_idx").on(t.year),
    index("artworks_museum_id_idx").on(t.museumId),
    index("artworks_genre_id_idx").on(t.genreId),
  ]
);

export const dailyArt = pgTable("daily_art", {
  id: uuid("id").defaultRandom().primaryKey(),
  artworkId: uuid("artwork_id")
    .notNull()
    .references(() => artworks.id),
  featuredDate: date("featured_date").notNull().unique(),
  curatorNote: text("curator_note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Join tables ─────────────────────────────────────────────────

export const artworkArtists = pgTable(
  "artwork_artists",
  {
    artworkId: uuid("artwork_id")
      .notNull()
      .references(() => artworks.id),
    artistId: uuid("artist_id")
      .notNull()
      .references(() => artists.id),
  },
  (t) => [
    primaryKey({ columns: [t.artworkId, t.artistId] }),
    index("artwork_artists_artist_id_idx").on(t.artistId),
  ]
);

export const artworkStyles = pgTable(
  "artwork_styles",
  {
    artworkId: uuid("artwork_id")
      .notNull()
      .references(() => artworks.id),
    styleId: uuid("style_id")
      .notNull()
      .references(() => styles.id),
  },
  (t) => [
    primaryKey({ columns: [t.artworkId, t.styleId] }),
    index("artwork_styles_style_id_idx").on(t.styleId),
  ]
);

export const artworkTags = pgTable(
  "artwork_tags",
  {
    artworkId: uuid("artwork_id")
      .notNull()
      .references(() => artworks.id),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id),
  },
  (t) => [
    primaryKey({ columns: [t.artworkId, t.tagId] }),
    index("artwork_tags_tag_id_idx").on(t.tagId),
  ]
);

export const artistStyles = pgTable(
  "artist_styles",
  {
    artistId: uuid("artist_id")
      .notNull()
      .references(() => artists.id),
    styleId: uuid("style_id")
      .notNull()
      .references(() => styles.id),
  },
  (t) => [primaryKey({ columns: [t.artistId, t.styleId] })]
);

export const artistMovements = pgTable(
  "artist_movements",
  {
    artistId: uuid("artist_id")
      .notNull()
      .references(() => artists.id),
    movementId: uuid("movement_id")
      .notNull()
      .references(() => movements.id),
  },
  (t) => [primaryKey({ columns: [t.artistId, t.movementId] })]
);

// ─── Relations ───────────────────────────────────────────────────

export const artistsRelations = relations(artists, ({ many }) => ({
  artworkArtists: many(artworkArtists),
  artistStyles: many(artistStyles),
  artistMovements: many(artistMovements),
}));

export const artworksRelations = relations(artworks, ({ one, many }) => ({
  museum: one(museums, {
    fields: [artworks.museumId],
    references: [museums.id],
  }),
  genre: one(genres, {
    fields: [artworks.genreId],
    references: [genres.id],
  }),
  period: one(periods, {
    fields: [artworks.periodId],
    references: [periods.id],
  }),
  artworkArtists: many(artworkArtists),
  artworkStyles: many(artworkStyles),
  artworkTags: many(artworkTags),
  dailyArt: many(dailyArt),
}));

export const museumsRelations = relations(museums, ({ many }) => ({
  artworks: many(artworks),
}));

export const genresRelations = relations(genres, ({ many }) => ({
  artworks: many(artworks),
}));

export const stylesRelations = relations(styles, ({ many }) => ({
  artworkStyles: many(artworkStyles),
  artistStyles: many(artistStyles),
}));

export const movementsRelations = relations(movements, ({ many }) => ({
  artistMovements: many(artistMovements),
}));

export const periodsRelations = relations(periods, ({ many }) => ({
  artworks: many(artworks),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  artworkTags: many(artworkTags),
}));

export const dailyArtRelations = relations(dailyArt, ({ one }) => ({
  artwork: one(artworks, {
    fields: [dailyArt.artworkId],
    references: [artworks.id],
  }),
}));

export const artworkArtistsRelations = relations(
  artworkArtists,
  ({ one }) => ({
    artwork: one(artworks, {
      fields: [artworkArtists.artworkId],
      references: [artworks.id],
    }),
    artist: one(artists, {
      fields: [artworkArtists.artistId],
      references: [artists.id],
    }),
  })
);

export const artworkStylesRelations = relations(
  artworkStyles,
  ({ one }) => ({
    artwork: one(artworks, {
      fields: [artworkStyles.artworkId],
      references: [artworks.id],
    }),
    style: one(styles, {
      fields: [artworkStyles.styleId],
      references: [styles.id],
    }),
  })
);

export const artworkTagsRelations = relations(artworkTags, ({ one }) => ({
  artwork: one(artworks, {
    fields: [artworkTags.artworkId],
    references: [artworks.id],
  }),
  tag: one(tags, {
    fields: [artworkTags.tagId],
    references: [tags.id],
  }),
}));

export const artistStylesRelations = relations(artistStyles, ({ one }) => ({
  artist: one(artists, {
    fields: [artistStyles.artistId],
    references: [artists.id],
  }),
  style: one(styles, {
    fields: [artistStyles.styleId],
    references: [styles.id],
  }),
}));

export const artistMovementsRelations = relations(
  artistMovements,
  ({ one }) => ({
    artist: one(artists, {
      fields: [artistMovements.artistId],
      references: [artists.id],
    }),
    movement: one(movements, {
      fields: [artistMovements.movementId],
      references: [movements.id],
    }),
  })
);
