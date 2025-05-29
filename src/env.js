import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),
    CLERK_SECRET_KEY: z.string().min(1, "Clerk Secret Key is Required"),
    DATABASE_URL: z.string().min(1, "Database URL is Required"),
    UPLOADTHING_SECRET: z.string().min(1, "Uploadthing Secret is Required"),
    UPLOADTHING_APP_ID: z.string().min(1, "Uploadthing App ID is Required"),
    MUX_TOKEN_ID: z.string().min(1, "Mux Token ID is Required"),
    MUX_TOKEN_SECRET: z.string().min(1, "Mux Secret is Required"),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
    NEXT_PUBLIC_APP_URL: z.string().min(1, "App URL is Required"),
    NEXT_PUBLIC_TEACHER_ID: z.string().min(1, "Teacher ID is Required"),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z
      .string()
      .min(1, "Clerk Publishable Key is Required"),
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: z
      .string()
      .min(1, "Clerk Sign In URL is Required"),
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: z
      .string()
      .min(1, "Clerk Sign Up URL is Required"),
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z
      .string()
      .min(1, "Clerk After Sign In URL is Required"),
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z
      .string()
      .min(1, "Clerk After Sign Up URL is Required"),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_TEACHER_ID: process.env.NEXT_PUBLIC_TEACHER_ID,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL:
      process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL:
      process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL,
    UPLOADTHING_APP_ID: process.env.UPLOADTHING_APP_ID,
    UPLOADTHING_SECRET: process.env.UPLOADTHING_SECRET,
    MUX_TOKEN_ID: process.env.MUX_TOKEN_ID,
    MUX_TOKEN_SECRET: process.env.MUX_TOKEN_SECRET,
    // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
