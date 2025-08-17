# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# React Login & Register with Firebase

A React application with Firebase Authentication and Firestore database integration. Users can register, login, and their data is securely stored in Firebase Firestore.

## Features

- ✅ User Registration with email and password
- ✅ User Login with email and password
- ✅ User Logout functionality
- ✅ Data persistence in Firebase Firestore
- ✅ Real-time authentication state management
- ✅ Responsive design
- ✅ Form validation
- ✅ Error handling
- ✅ TypeScript support

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Styling**: CSS3
- **Deployment**: GitHub Pages

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/smsnaher/personal-report.git
cd personal-report
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable "Email/Password" provider
4. Create Firestore Database:
   - Go to Firestore Database
   - Create database in test mode
5. Get your Firebase config:
   - Go to Project Settings > General
   - Scroll down to "Your apps" section
   - Click on web app icon or create a new web app
   - Copy the configuration object

### 4. Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your Firebase configuration:
   ```
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

### 5. Run the Application

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/          # React components
│   ├── Login.tsx       # Login form component
│   ├── Register.tsx    # Registration form component
│   └── Dashboard.tsx   # User dashboard component
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── firebase/           # Firebase configuration
│   ├── config.ts      # Firebase app configuration
│   └── auth.ts        # Authentication service functions
├── App.tsx            # Main app component
├── App.css           # Application styles
└── main.tsx          # App entry point
```

## Firestore Data Structure

The app stores user data in Firestore with the following structure:

```
users/{userId}
├── uid: string
├── email: string
├── displayName: string (optional)
└── createdAt: Timestamp
```

## Deployment

The app is configured for automatic deployment to GitHub Pages using GitHub Actions. The workflow file is located at `.github/workflows/deploy.yml`.

### Setting up GitHub Secrets

For secure deployment, add the following secrets to your GitHub repository:

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add each of these:

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `VITE_FIREBASE_API_KEY` | Your Firebase API key | `AIzaSyBdVl-cCQ...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Your Firebase auth domain | `myproject.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Your Firebase project ID | `myproject-12345` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Your Firebase storage bucket | `myproject.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Your Firebase sender ID | `123456789` |
| `VITE_FIREBASE_APP_ID` | Your Firebase app ID | `1:123456789:web:abc123` |
| `VITE_FIREBASE_MEASUREMENT_ID` | Your Firebase measurement ID | `G-ABC123DEF4` |

### Deploying

To deploy:

1. Push your changes to the `main` branch
2. GitHub Actions will automatically build and deploy to GitHub Pages
3. Your app will be available at: `https://smsnaher.github.io/personal-report/`

## Security Rules (Firestore)

For production, update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
