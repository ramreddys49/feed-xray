# Feed X-Ray

**See why you see what you see.**

Feed X-Ray is an interactive educational simulation of how a social feed can infer interests from behavior, rank organic posts, and separately choose a fictional sponsored placement.

It is a client-side Next.js portfolio project. There is no backend, database, authentication, or real-platform tracking.

Source: [github.com/ramreddys49/feed-xray](https://github.com/ramreddys49/feed-xray)

> All posts, creators, advertisers, and scoring rules are fictional. Weights are teaching values, not the proprietary algorithms of Instagram, TikTok, YouTube, LinkedIn, X, or other platforms.

## Live demo

Forthcoming after Vercel deployment. Until then, run locally (see below).

## Screenshots

Captured from the running app:

- User View intro: `public/screenshots/user-view.png`

Still needed (full 1440×900 viewport; automation cropped into illustrations):

- Personalized feed
- Recommendation Engineer Mode
- Learn View
- Guided demo panel
- Why This Post / Why This Ad side-by-side

Save additional captures in `public/screenshots/` before publishing.

## Key features

- Fictional 20-post social feed with likes, saves, skips, and watch-time signals
- Deterministic organic interest profile and ranking
- Independent commercial affinity profile and sponsored selection
- Feed Personalization and Ad Personalization toggles
- Why This Post / Why This Ad explanations and a recommendation timeline
- Guided walkthrough that uses real interactions (no fake likes)
- Learn view that maps the live session to real-world concepts
- Recommendation Engineer Mode for events, vectors, snapshots, and ad selection

## User View

Interact with the feed. The right-hand panels show **outcomes**: inferred interests (Algorithm Mirror, Feed DNA), on-screen mix, commercial affinity, post/ad explanations, timeline, and captured signals.

## Recommendation Engineer Mode

Inspect **mechanism**: live event console, interest and commercial vectors, ranking snapshot vs pending profile, candidate table, and ad selection. Raw event JSON is available for a selected event.

## Learn View

Beginner-friendly modules for the recommendation pipeline, behavioral signals, ranking factors, exploration vs diversity, feedback loops, organic vs sponsored systems, and simulation limits. Live session facts are mapped from current state; empty sessions are not fabricated.

## Guided Demo

An eight-step walkthrough on the real feed. Steps advance only when the required action happens (Technology like/save, personalization, Why This Post/Ad, Not Interested, Engineer Mode). Exit preserves progress. Restart asks before clearing.

## Architecture

Two separate pipelines share the same local event log:

```
Behavior events → interest profile → organic ranking → personalized feed
Behavior events → commercial profile → ad selection → sponsored placement
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for diagrams, visibility lifecycle, snapshots, and the guided-demo state machine.

## Technology stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- Vitest
- Local React state only (no persistence)

## How to run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

No environment variables are required.

## How to run tests

```bash
npm test
npm run lint
npm run build
```

## Educational simulation limitations

Feed X-Ray does **not** implement machine-learning training, embeddings, collaborative filtering, production candidate retrieval, advertising auctions, advertiser integrations, identity tracking, or backend storage. The catalog is 20 local posts. Ranking and commercial scores are deterministic teaching functions.

## Privacy-by-design

- All simulation state lives in the browser session
- Reloading the page clears the profile
- No analytics SDK, no cookies for tracking, no third-party ad network
- Visibility observers are used only to simulate feed attention, not to phone home

## Future improvements

- Hosted live demo URL (set `SITE.demoUrl` after Vercel deploy)
- Optional shareable session snapshots (still client-side)
- Additional Learn modules (creator-side incentives, ranking audits)

Deployment steps: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).
