# Deployment checklist

Feed X-Ray is a static-friendly Next.js App Router app. No backend, database, or environment secrets are required.

Source repository: [https://github.com/ramreddys49/feed-xray](https://github.com/ramreddys49/feed-xray)

## 1. GitHub repository preparation

1. Confirm `origin` is `https://github.com/ramreddys49/feed-xray.git`.
2. Push `main` (do not force-push).
3. `SITE.githubUrl` in `lib/site.ts` should match that URL; the README source link should too.
4. Confirm `.gitignore` still excludes `.env*`, `.next/`, and `node_modules/`.

## 2. Vercel import

1. Sign in at [vercel.com](https://vercel.com).
2. Import the GitHub repository.
3. Framework preset: **Next.js**.
4. Root directory: repository root (this folder).

## 3. Build settings

| Setting | Value |
| --- | --- |
| Install command | `npm install` |
| Build command | `npm run build` |
| Output | Next.js default (Vercel detects automatically) |
| Node | 20.x or current Vercel default |

There are **no** environment variables to add.

## 4. Domain

Production: [https://feed-xray.vercel.app](https://feed-xray.vercel.app)

Attach a custom domain only after the production smoke tests pass.

## 5. After deploy

`SITE.demoUrl` and the README live-demo link are set to [https://feed-xray.vercel.app](https://feed-xray.vercel.app). `SITE.githubUrl` is [https://github.com/ramreddys49/feed-xray](https://github.com/ramreddys49/feed-xray).

## 6. Production smoke tests

- Home loads; intro headline and **Start Guided Demo** / **Explore Freely** are visible
- Like a Technology post; Algorithm Mirror updates
- Feed Personalization On reorders the feed
- Ad Personalization On changes the sponsored card without requiring organic rank
- User → Learn → User keeps likes
- Engineer Mode tables scroll; selected rows are visible
- Guided demo advances only on real clicks
- Footer disclaimer is visible
- `prefers-reduced-motion` does not pulse guide highlights

## 7. Rollback

Vercel keeps prior deployments. Instant rollback to the last known-good production deployment if a release fails smoke tests.

## 8. Security notes

- Client-only simulation; no user accounts
- Do not add analytics or ad SDKs
- Do not commit secrets (none are used today)
- Fictional content only — keep the footer disclaimer
