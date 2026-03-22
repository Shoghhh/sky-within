# Sky Within - Monorepo

Monorepo containing the Sky Within app (Expo) and backend (NestJS).

## Structure

```
sky-within/
├── apps/
│   ├── app/       # Expo React Native app
│   └── backend/   # NestJS API
├── package.json
└── README.md
```

## Setup

```bash
npm install
```

## Scripts

From the monorepo root:

| Command | Description |
|---------|-------------|
| `npm run app` | Start Expo dev server |
| `npm run app:ios` | Run app on iOS |
| `npm run app:android` | Run app on Android |
| `npm run backend` | Start NestJS in dev mode |
| `npm run dev` | Run app + backend concurrently |

Or run from each app:

```bash
cd apps/app && npm run start
cd apps/backend && npm run start:dev
```
