# Sky Within – Mobile App

Expo React Native app for **Sky Within** astrology daily advice.

## Setup

1. **Install dependencies** (already done):
   ```bash
   npm install
   ```

2. **Configure API URL** (for physical device):
   - Edit `src/config.ts`
   - Replace `localhost` / `10.0.2.2` with your machine's IP when testing on a physical device

3. **Start the backend** (in `sky-within-backend`):
   ```bash
   cd ../sky-within-backend && npm run start:dev
   ```

4. **Run the app**:
   ```bash
   npm start
   ```
   Then press `i` for iOS Simulator or `a` for Android emulator.

## Screens

| Screen | Description |
|--------|-------------|
| **Login** | Email/password login |
| **Register** | Create account with birth data |
| **Dashboard** | Today's AI daily message, dominant layer, intensity, tone |
| **Transits** | Table of current aspects to natal chart |
| **Profile** | User info, natal chart, notifications, export, reset, delete account |

## API Integration

- **Auth:** Login stores JWT in SecureStore
- **Dashboard:** `GET /daily-message` (auto-generates if missing)
- **Transits:** `GET /daily-message/transits`
- **Profile:** `GET /user/profile`, `POST /user/natal-chart/calculate`, etc.

## Notes

- **iOS Simulator:** API at `http://localhost:3000/api`
- **Android Emulator:** API at `http://10.0.2.2:3000/api`
- **Physical Device:** Set your machine's IP in `src/config.ts`
