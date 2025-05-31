CREATE TABLE "attachment_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"course_id" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "category_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chapter_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"position" integer NOT NULL,
	"is_published" boolean DEFAULT false,
	"is_free" boolean DEFAULT false,
	"course_id" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"category_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"image_url" text,
	"price" numeric,
	"is_published" boolean DEFAULT false,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mux_data_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"asset_id" text NOT NULL,
	"playback_id" text,
	"chapter_id" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"course_id" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stripe_customer_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"stripe_customer_id" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_progress_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"chapter_id" uuid NOT NULL,
	"is_complete" boolean DEFAULT false,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"clerk_user_id" text NOT NULL,
	"is_teacher" boolean DEFAULT false,
	"is_admin" boolean DEFAULT false,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_table_email_unique" UNIQUE("email"),
	CONSTRAINT "user_table_clerk_user_id_unique" UNIQUE("clerk_user_id")
);
--> statement-breakpoint
ALTER TABLE "attachment_table" ADD CONSTRAINT "attachment_table_course_id_course_table_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chapter_table" ADD CONSTRAINT "chapter_table_course_id_course_table_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_table" ADD CONSTRAINT "course_table_category_id_category_table_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category_table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mux_data_table" ADD CONSTRAINT "mux_data_table_chapter_id_chapter_table_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapter_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_table" ADD CONSTRAINT "purchase_table_course_id_course_table_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress_table" ADD CONSTRAINT "user_progress_table_chapter_id_chapter_table_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapter_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "attachment_course_id_idx" ON "attachment_table" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "chapter_course_id_idx" ON "chapter_table" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "course_category_id_idx" ON "course_table" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "mux_chapter_id_idx" ON "mux_data_table" USING btree ("chapter_id");--> statement-breakpoint
CREATE INDEX "purchase_course_id_idx" ON "purchase_table" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "user_progress_chapter_id_idx" ON "user_progress_table" USING btree ("chapter_id");