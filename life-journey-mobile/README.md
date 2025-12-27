# Bewaardvoorjou Mobile App 📱

React Native app voor iOS en Android gebouwd met Expo. Deel van het Bewaardvoorjou ecosysteem voor het vastleggen van levensverhalen.

## 🚀 Technologie Stack

- **Framework**: React Native (Expo SDK 51)
- **Routing**: Expo Router (file-based, type-safe)
- **UI**: React Native Paper (Material Design 3)
- **State**: Zustand met Expo SecureStore
- **Offline Database**: WatermelonDB (planned)
- **Media**: Expo Camera, Expo AV, Expo Media Library
- **Language**: TypeScript

## 📋 Vereisten

- **Node.js**: 20.x of hoger
- **npm** of **yarn**
- **Expo CLI**: `npm install -g @expo/cli`
- Voor iOS development: **Xcode** (macOS only)
- Voor Android development: **Android Studio**

## 🛠️ Setup

### 1. Installeer dependencies

```bash
cd life-journey-mobile
npm install
```

### 2. Configureer environment

De app gebruikt standaard `http://localhost:8000/api/v1` voor development.

Voor productie of andere backends, edit `src/lib/config.ts`:

```typescript
export const API_BASE_URL = "https://your-backend-url.com/api/v1";
```

**Platform-specific endpoints:**
- **iOS Simulator**: `http://localhost:8000/api/v1`
- **Android Emulator**: `http://10.0.2.2:8000/api/v1`
- **Physical Device**: `http://YOUR_LOCAL_IP:8000/api/v1`

### 3. Start development server

```bash
npm run start
```

Dit opent Expo DevTools. Van hieruit kun je:
- **i**: iOS Simulator openen (macOS only)
- **a**: Android Emulator openen
- **w**: Web versie openen (limited functionality)
- **Scan QR code**: Met Expo Go app op je telefoon

## 📱 Runnen op Apparaten

### iOS Simulator (macOS only)

```bash
npm run ios
```

Vereist: Xcode geïnstalleerd

### Android Emulator

```bash
npm run android
```

Vereist: Android Studio + AVD geïnstalleerd

### Physical Device

1. Installeer **Expo Go** app op je telefoon
2. Zorg dat je telefoon op hetzelfde WiFi netwerk zit als je computer
3. Scan de QR code in de terminal met Expo Go

## 🏗️ Project Structuur

```
life-journey-mobile/
├── app/                           # Expo Router pages
│   ├── (auth)/                    # Auth flow
│   │   ├── login.tsx             # Login screen
│   │   ├── register.tsx          # Register screen
│   │   └── _layout.tsx           # Auth layout
│   ├── (tabs)/                   # Main app (tabs)
│   │   ├── dashboard.tsx         # Dashboard
│   │   ├── chapters.tsx          # Chapters list
│   │   ├── timeline.tsx          # Timeline view
│   │   └── _layout.tsx           # Tab navigator
│   └── _layout.tsx               # Root layout (PaperProvider, auth guards)
├── src/
│   ├── components/
│   │   ├── recorder/            # Audio/Video recorder components
│   │   ├── ui/                  # Shared UI components
│   │   └── native/              # Platform-specific components
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts        # API client (retry logic, error handling)
│   │   │   └── auth.ts          # Auth API calls
│   │   ├── stores/
│   │   │   └── auth-store.ts    # Zustand auth store (SecureStore)
│   │   ├── db/                  # WatermelonDB (offline storage)
│   │   ├── sync/                # Sync engine
│   │   ├── storage/             # File system storage
│   │   ├── config.ts            # API URL configuration
│   │   ├── types.ts             # Shared TypeScript types
│   │   └── theme.ts             # React Native Paper theme
│   ├── hooks/                   # Custom React hooks
│   └── utils/                   # Helper functions
├── assets/                      # Images, fonts
├── app.json                     # Expo configuration + permissions
├── package.json
└── tsconfig.json
```

## 🔒 Security

### Token Storage

De app gebruikt **Expo SecureStore** voor veilige opslag van JWT tokens:

```typescript
// Encrypted storage on device
await SecureStore.setItemAsync('auth_token', token);
```

**Encryption:**
- **iOS**: Keychain Services
- **Android**: EncryptedSharedPreferences (Android Keystore)

### Permissions

De app vraagt toestemming voor:
- **Camera**: Video opnames
- **Microfoon**: Audio opnames
- **Media Library**: Opslaan van opnames

Zie `app.json` voor alle permissions.

## 🧪 Development Features

### Hot Reload

Code wijzigingen worden automatisch ververst zonder de app opnieuw te starten.

### TypeScript

Volledige type safety met TypeScript. Run type checking:

```bash
npm run tsc
```

### Debugging

1. Open DevTools in browser: `j` in terminal
2. Chrome DevTools: `Cmd+D` (iOS) of `Cmd+M` (Android) → "Debug Remote JS"
3. React DevTools: Installeer [standalone versie](https://github.com/facebook/react-devtools/tree/main/packages/react-devtools)

## 🚢 Building voor Productie

### Development Build (met Expo)

```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

### EAS Build (Cloud Builds)

Voor productie builds zonder lokale Xcode/Android Studio:

1. Installeer EAS CLI:
```bash
npm install -g eas-cli
```

2. Login:
```bash
eas login
```

3. Configureer project:
```bash
eas build:configure
```

4. Build:
```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

## 📚 Belangrijke Features

### Auth Flow

1. **Login**: Email + password → JWT token opgeslagen in SecureStore
2. **Register**: Account aanmaken → auto-login
3. **Auth Guards**: Automatische redirect naar login als niet authenticated
4. **Session Persistence**: Token blijft geldig tot logout

### Navigation

- **Expo Router**: File-based routing (zoals Next.js)
- **Type-safe**: Autocomplete voor routes
- **Deep Linking**: `bewaardvoorjou://` scheme configured

### Theming

React Native Paper Material Design 3 met Bewaardvoorjou brand colors:

```typescript
primary: '#FF6B35',  // Oranje
background: '#F8FAFC',
```

## 🐛 Troubleshooting

### "Metro Bundler kan niet starten"

```bash
npm start -- --reset-cache
```

### "Expo Go niet verbonden"

- Controleer WiFi (zelfde netwerk als computer)
- Firewall kan poorten blokkeren
- Probeer Tunnel mode: `npm start -- --tunnel`

### "Type errors in node_modules"

```bash
rm -rf node_modules
npm install
```

### "iOS build failed"

- Update Xcode naar laatste versie
- Run `npx pod-install` in project directory
- Clean build: `rm -rf ios/build`

### "Android emulator traag"

- Verhoog RAM allocation in AVD settings (min 2GB)
- Enable Hardware Acceleration (HAXM on Intel, Hypervisor on M1)

## 📖 Volgende Stappen

- [ ] Implementeer chapters list (Expo Router + FlashList)
- [ ] Audio recorder component (Expo AV)
- [ ] Video recorder component (Expo Camera)
- [ ] WatermelonDB setup voor offline storage
- [ ] Sync manager voor upload queue
- [ ] Timeline view met FlashList
- [ ] AI assistent chat

Zie `/plans/snazzy-hugging-jellyfish.md` voor complete roadmap.

## 🤝 Contributing

Dit is een intern project voor Bewaardvoorjou. Voor vragen of aanpassingen, contact het development team.

## 📄 License

Proprietary - Bewaardvoorjou © 2025
