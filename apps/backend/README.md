# Sky Within – Backend

Backend for **Sky Within**, an astrology daily advice app that provides personalized guidance based on the user's natal chart and current planetary positions.

## Tech Stack

- **Framework:** NestJS (TypeScript)
- **Database:** PostgreSQL + Prisma ORM
- **Ephemeris:** astronomy-engine (geocentric ecliptic positions)
- **AI:** OpenAI API (GPT-4o-mini) for natural language generation
- **Notifications:** Firebase Cloud Messaging (FCM)

## Architecture

```
[Natal Chart + Ephemeris]
         │
         ▼
  [Transit Engine] → Transit Array (aspects)
         │
         ▼
[Rule-Based Engine] → RuleResult (dominant_layer, intensity, advice_type, tone)
         │
         ▼
    [AI Layer] → Daily Message
         │
         ▼
  [Database + FCM] → User receives daily message
```

## Project Structure

```
src/
├── user/           # Profile, natal chart, preferences
├── auth/           # JWT login
├── ephemeris/      # Planetary positions (astronomy-engine)
├── transit-engine/ # Aspect calculations (conjunction, trine, square...)
├── rule-engine/    # Interpretation logic (dominant layer, intensity)
├── ai-layer/       # OpenAI message generation
├── daily-message/  # Store & serve daily messages
├── notifications/  # FCM push
├── scheduler/      # Cron job (daily at 06:00 UTC)
└── prisma/         # Prisma service
```

## Setup

### 1. Prerequisites

- Node.js 18+
- PostgreSQL
- (Optional) OpenAI API key
- (Optional) Firebase project for FCM

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

**Required:**
- `DATABASE_URL` – PostgreSQL connection string
- `JWT_SECRET` – Secret for JWT tokens

**Optional:**
- `OPENAI_API_KEY` – For AI-generated messages (falls back to template if missing)
- `OPENAI_MODEL` – Model name (default: gpt-4o-mini)
- `GOOGLE_APPLICATION_CREDENTIALS` – Path to Firebase service account JSON for FCM

### 4. Database

```bash
npm run prisma:migrate
```

### 5. Run

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

API base: `http://localhost:3000/api`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login (email, password) |
| POST | `/api/user/register` | Register new user |
| GET | `/api/user/profile` | Get profile (JWT) |
| PATCH | `/api/user/profile` | Update profile (JWT) |
| PATCH | `/api/user/natal-chart` | Update natal chart manually (JWT) |
| POST | `/api/user/natal-chart/calculate` | Calculate natal chart from birth data (JWT) |
| GET | `/api/user/export` | Export all user data (JWT) |
| POST | `/api/user/reset` | Reset app (clear messages, chart, prefs) (JWT) |
| DELETE | `/api/user/account` | Delete account (JWT) |
| GET | `/api/daily-message` | Today's message (JWT) |
| POST | `/api/daily-message/generate` | Generate daily message (JWT, optional `?date=`) |
| GET | `/api/daily-message/transits` | Transit list (JWT, optional `?date=`) |
| GET | `/api/ephemeris/positions` | Planetary positions (optional `?date=`) |
| GET | `/api/health` | Health check |

## Cron Job

Daily messages are generated at **06:00 UTC** for all users with natal charts. Notification time is configured per user in profile preferences.

## Data Flow

1. **Ephemeris** – Current planetary positions in ecliptic longitude.
2. **Transit Engine** – Compares ephemeris vs natal chart, yields aspects (conjunction, trine, square, etc.) with orbs.
3. **Rule Engine** – Interprets transits → dominant layer (emotional, mental, love…), intensity, advice type, tone.
4. **AI Layer** – Turns structured result into a 1–2 sentence message (OpenAI or fallback template).
5. **Storage** – Daily message stored; push notification sent if enabled.

## License

UNLICENSED (Diploma project)
