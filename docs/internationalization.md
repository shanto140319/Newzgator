# Interface languages

The app uses next-intl with the App Router and a server-readable `news-language` cookie. Bangla (`bn`) is the default; English (`en`) is also supported. Invalid cookie values fall back to Bangla.

The language selector calls a Server Action that validates the locale and saves an HttpOnly, SameSite=Lax cookie for one year (Secure in production). Next.js updates the server-rendered interface without replacing client feed state or changing article URLs. Locale-prefixed routes are intentionally not used because publisher article content is not translated.

## Translation sources

- `messages/bn.json` and `messages/en.json`: interface messages; keep keys aligned.
- `i18n/request.ts`: locale resolution, dictionaries, and Asia/Dhaka time zone.
- `app/lib/localized-name.ts`: API category/publisher names with fallback.

Headlines, summaries, article content, and user comments retain their original language. Interface labels, dates, numbers, metadata labels, categories, and available publisher names follow the selected language. HTML `lang` is set on the server.

## Verification

Run `npm run build`, then `node tests/check-language.cjs`. The browser check starts a production server on port 3104 and requires Microsoft Edge. Initial content uses the configured article API; additional pagination is mocked. It checks switching both ways, reload persistence, retained loaded articles and query parameters, details-page labels, and responsive widths.

`@swc/core` is pinned to 1.16.0 within next-intl's supported range because 1.16.13 failed to initialize its native binding in this Windows workspace.

References: https://next-intl.dev/docs/getting-started/app-router and https://nextjs.org/docs/app/guides/internationalization
