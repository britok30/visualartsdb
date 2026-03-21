CREATE TABLE "artist_movements" (
	"artist_id" uuid NOT NULL,
	"movement_id" uuid NOT NULL,
	CONSTRAINT "artist_movements_artist_id_movement_id_pk" PRIMARY KEY("artist_id","movement_id")
);
--> statement-breakpoint
CREATE TABLE "artist_styles" (
	"artist_id" uuid NOT NULL,
	"style_id" uuid NOT NULL,
	CONSTRAINT "artist_styles_artist_id_style_id_pk" PRIMARY KEY("artist_id","style_id")
);
--> statement-breakpoint
CREATE TABLE "artists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(512) NOT NULL,
	"slug" varchar(512) NOT NULL,
	"birth_year" integer,
	"death_year" integer,
	"nationality" varchar(256),
	"bio" text,
	"portrait_url" text,
	"wiki_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "artists_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "artwork_artists" (
	"artwork_id" uuid NOT NULL,
	"artist_id" uuid NOT NULL,
	CONSTRAINT "artwork_artists_artwork_id_artist_id_pk" PRIMARY KEY("artwork_id","artist_id")
);
--> statement-breakpoint
CREATE TABLE "artwork_styles" (
	"artwork_id" uuid NOT NULL,
	"style_id" uuid NOT NULL,
	CONSTRAINT "artwork_styles_artwork_id_style_id_pk" PRIMARY KEY("artwork_id","style_id")
);
--> statement-breakpoint
CREATE TABLE "artwork_tags" (
	"artwork_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "artwork_tags_artwork_id_tag_id_pk" PRIMARY KEY("artwork_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "artworks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(1024) NOT NULL,
	"slug" varchar(1024) NOT NULL,
	"year" integer,
	"year_to" integer,
	"medium" varchar(512),
	"dimensions" varchar(256),
	"description" text,
	"image_url" text,
	"thumbnail_url" text,
	"museum_id" uuid,
	"genre_id" uuid,
	"period_id" uuid,
	"is_public_domain" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "artworks_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "daily_art" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"artwork_id" uuid NOT NULL,
	"featured_date" date NOT NULL,
	"curator_note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "daily_art_featured_date_unique" UNIQUE("featured_date")
);
--> statement-breakpoint
CREATE TABLE "genres" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"slug" varchar(256) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "genres_name_unique" UNIQUE("name"),
	CONSTRAINT "genres_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "movements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"slug" varchar(256) NOT NULL,
	"description" text,
	"start_year" integer,
	"end_year" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "movements_name_unique" UNIQUE("name"),
	CONSTRAINT "movements_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "museums" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(512) NOT NULL,
	"slug" varchar(512) NOT NULL,
	"city" varchar(256),
	"country" varchar(256),
	"website" text,
	"image_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "museums_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "periods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"slug" varchar(256) NOT NULL,
	"description" text,
	"start_year" integer,
	"end_year" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "periods_name_unique" UNIQUE("name"),
	CONSTRAINT "periods_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "styles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"slug" varchar(256) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "styles_name_unique" UNIQUE("name"),
	CONSTRAINT "styles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"slug" varchar(256) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tags_name_unique" UNIQUE("name"),
	CONSTRAINT "tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "artist_movements" ADD CONSTRAINT "artist_movements_artist_id_artists_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."artists"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artist_movements" ADD CONSTRAINT "artist_movements_movement_id_movements_id_fk" FOREIGN KEY ("movement_id") REFERENCES "public"."movements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artist_styles" ADD CONSTRAINT "artist_styles_artist_id_artists_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."artists"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artist_styles" ADD CONSTRAINT "artist_styles_style_id_styles_id_fk" FOREIGN KEY ("style_id") REFERENCES "public"."styles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artwork_artists" ADD CONSTRAINT "artwork_artists_artwork_id_artworks_id_fk" FOREIGN KEY ("artwork_id") REFERENCES "public"."artworks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artwork_artists" ADD CONSTRAINT "artwork_artists_artist_id_artists_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."artists"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artwork_styles" ADD CONSTRAINT "artwork_styles_artwork_id_artworks_id_fk" FOREIGN KEY ("artwork_id") REFERENCES "public"."artworks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artwork_styles" ADD CONSTRAINT "artwork_styles_style_id_styles_id_fk" FOREIGN KEY ("style_id") REFERENCES "public"."styles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artwork_tags" ADD CONSTRAINT "artwork_tags_artwork_id_artworks_id_fk" FOREIGN KEY ("artwork_id") REFERENCES "public"."artworks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artwork_tags" ADD CONSTRAINT "artwork_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artworks" ADD CONSTRAINT "artworks_museum_id_museums_id_fk" FOREIGN KEY ("museum_id") REFERENCES "public"."museums"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artworks" ADD CONSTRAINT "artworks_genre_id_genres_id_fk" FOREIGN KEY ("genre_id") REFERENCES "public"."genres"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artworks" ADD CONSTRAINT "artworks_period_id_periods_id_fk" FOREIGN KEY ("period_id") REFERENCES "public"."periods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_art" ADD CONSTRAINT "daily_art_artwork_id_artworks_id_fk" FOREIGN KEY ("artwork_id") REFERENCES "public"."artworks"("id") ON DELETE no action ON UPDATE no action;