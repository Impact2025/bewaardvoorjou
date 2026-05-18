import * as Sentry from "@sentry/nextjs";

// Only initialise when DSN is configured — set NEXT_PUBLIC_SENTRY_DSN in .env.local
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
    environment: process.env.NODE_ENV,
    // Reduce noise in development
    debug: false,
  });
}
