# Under Five

make it under 5$

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c3294fdc-8be5-48ef-a88d-0334351ad4de).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## NEXUS ERP prototype

This workspace is a client-side ERP prototype for Aether Technologies. It uses Next.js 16 (App Router), React 19, Tailwind CSS 4 and shadcn/Radix primitives. All data is deterministic local sample data stored in `src/data/seed.ts`; there is no backend, API key, external AI call or paid service.

Routes: `/dashboard`, `/ai`, `/hr`, `/finance`, `/sales`, `/operations`, `/marketing`, `/tasks`, `/reports`, `/activity`, `/settings`.

The AI Intelligence workspace (`/ai`) runs seven local demo scenarios through a simulated tool layer (`src/services/tools.ts`), shows tool activity, supports conversation persistence in `localStorage`, and requires approval before executing proposed actions. Executed actions write back to the local store and appear in the audit log.

## Development

You need Node.js 20.9+ (Node 24 recommended). Bun also works.

```sh
npm install
npm run dev      # starts the app and prints every route
```

`npm run dev` prints the full route list in the terminal, then starts Next.js at `http://localhost:3000`. Pass extra Next.js CLI arguments if needed, for example `npm run dev -- --port 3001`.

```sh
npm run build
npm run test
npm run lint
```

Use `npm run format` to apply Prettier. Workspace state is persisted in browser `localStorage`; use Settings → Notifications → Reset demo data to restore the seeded state.
