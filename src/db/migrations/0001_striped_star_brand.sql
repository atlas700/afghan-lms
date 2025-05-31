ALTER TABLE "chapter_table" RENAME COLUMN "name" TO "title";--> statement-breakpoint
ALTER TABLE "chapter_table" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "chapter_table" ADD COLUMN "video_url" text;