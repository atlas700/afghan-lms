import { relations } from "drizzle-orm";
import {
  boolean,
  decimal,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const id = uuid().primaryKey().defaultRandom();
export const createdAt = timestamp({ withTimezone: true })
  .notNull()
  .defaultNow();
export const updatedAt = timestamp({ withTimezone: true })
  .notNull()
  .defaultNow()
  .$onUpdate(() => new Date());

export const UserTable = pgTable("user_table", {
  id,
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  clerkId: text("clerk_user_id").notNull().unique(),
  isTeacher: boolean("is_teacher").default(false),
  isAdmin: boolean("is_admin").default(false),
  createdAt,
  updatedAt,
});

export const CourseTable = pgTable(
  "course_table",
  {
    id,
    userId: text("user_id").notNull(),
    categoryId: uuid("category_id").references(() => CategoryTable.id),
    title: text("title").notNull(),
    description: text("description"),
    imageUrl: text("image_url"),
    price: decimal("price"),
    isPublished: boolean("is_published").default(false),
    createdAt,
    updatedAt,
  },
  (table) => [index("course_category_id_idx").on(table.categoryId)],
);

export const CourseRelations = relations(CourseTable, ({ many, one }) => ({
  category: one(CategoryTable, {
    fields: [CourseTable.categoryId],
    references: [CategoryTable.id],
  }),
  chapters: many(ChapterTable),
  attachments: many(AttachmentTable),
  purchases: many(PurchaseTable),
}));

export const CategoryTable = pgTable("category_table", {
  id,
  name: text("name").notNull(),
});

export const CategoryRelations = relations(CategoryTable, ({ many }) => ({
  courses: many(CourseTable),
}));

export const AttachmentTable = pgTable(
  "attachment_table",
  {
    id,
    name: text("name").notNull(),
    url: text("url").notNull(),
    courseId: uuid("course_id")
      .notNull()
      .references(() => CourseTable.id, {
        onDelete: "cascade",
      }),
    createdAt,
    updatedAt,
  },
  (table) => [index("attachment_course_id_idx").on(table.courseId)],
);

export const AttachmentRelations = relations(AttachmentTable, ({ one }) => ({
  course: one(CourseTable, {
    fields: [AttachmentTable.courseId],
    references: [CourseTable.id],
  }),
}));

export const ChapterTable = pgTable(
  "chapter_table",
  {
    id,
    title: text("name").notNull(),
    description: text("name"),
    videoUrl: text("name"),
    position: integer("position").notNull(),
    isPublished: boolean("is_published").default(false),
    isFree: boolean("is_free").default(false),
    courseId: uuid("course_id")
      .notNull()
      .references(() => CourseTable.id, {
        onDelete: "cascade",
      }),
    createdAt,
    updatedAt,
  },
  (table) => [index("chapter_course_id_idx").on(table.courseId)],
);

export const ChapterRelations = relations(ChapterTable, ({ one, many }) => ({
  course: one(CourseTable, {
    fields: [ChapterTable.courseId],
    references: [CourseTable.id],
  }),
  muxData: one(MuxDataTable, {
    fields: [ChapterTable.id],
    references: [MuxDataTable.chapterId],
  }),
  userProgress: many(UserProgressTable),
}));

export const MuxDataTable = pgTable(
  "mux_data_table",
  {
    id,
    assetId: text("asset_id").notNull(),
    playbackId: text("playback_id"),
    chapterId: uuid("chapter_id")
      .notNull()
      .references(() => ChapterTable.id, {
        onDelete: "cascade",
      }),
    createdAt,
    updatedAt,
  },
  (table) => [index("mux_chapter_id_idx").on(table.chapterId)],
);

export const MuxDataRelations = relations(MuxDataTable, ({ one }) => ({
  chapter: one(ChapterTable, {
    fields: [MuxDataTable.chapterId],
    references: [ChapterTable.id],
  }),
}));

export const UserProgressTable = pgTable(
  "user_progress_table",
  {
    id,
    userId: text("user_id").notNull(),
    chapterId: uuid("chapter_id")
      .notNull()
      .references(() => ChapterTable.id, {
        onDelete: "cascade",
      }),
    isCompleted: boolean("is_complete").default(false),
    createdAt,
    updatedAt,
  },
  (table) => [index("user_progress_chapter_id_idx").on(table.chapterId)],
);

export const UserProgressRelations = relations(
  UserProgressTable,
  ({ one }) => ({
    chapter: one(ChapterTable, {
      fields: [UserProgressTable.chapterId],
      references: [ChapterTable.id],
    }),
  }),
);

export const PurchaseTable = pgTable(
  "purchase_table",
  {
    id,
    userId: text("user_id").notNull(),
    courseId: uuid("course_id")
      .notNull()
      .references(() => CourseTable.id, {
        onDelete: "cascade",
      }),
    createdAt,
    updatedAt,
  },
  (table) => [index("purchase_course_id_idx").on(table.courseId)],
);

export const PurchaseRelations = relations(PurchaseTable, ({ one }) => ({
  course: one(CourseTable, {
    fields: [PurchaseTable.courseId],
    references: [CourseTable.id],
  }),
}));

export const StripeCustomerTable = pgTable("stripe_customer_table", {
  id,
  userId: text("user_id").notNull(),
  stripeCustomerId: text("stripe_customer_id").notNull(),
  createdAt,
  updatedAt,
});
