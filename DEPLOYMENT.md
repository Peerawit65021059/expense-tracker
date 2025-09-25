# Deployment Guide for Expense Tracker

## GitHub Secrets Setup

To deploy this project to Firebase, you need to set up the following secrets in your GitHub repository:

### Required Secrets for Frontend Deployment

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add these secrets:

1. `FIREBASE_TOKEN` - Firebase CI token for deployment
   - Generate with: `firebase login:ci`

2. `REACT_APP_FIREBASE_API_KEY` - Your Firebase API key
3. `REACT_APP_FIREBASE_AUTH_DOMAIN` - Your Firebase auth domain
4. `REACT_APP_FIREBASE_PROJECT_ID` - Your Firebase project ID
5. `REACT_APP_FIREBASE_STORAGE_BUCKET` - Your Firebase storage bucket
6. `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` - Your Firebase messaging sender ID
7. `REACT_APP_FIREBASE_APP_ID` - Your Firebase app ID
8. `REACT_APP_FIREBASE_MEASUREMENT_ID` - Your Firebase measurement ID (optional)

### How to Get Firebase Configuration Values

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (expense-wallet-82d9f)
3. Go to Project Settings (gear icon)
4. Scroll down to "Your apps" section
5. Copy the config values from the web app

### Local Development

For local development, create a `.env.local` file with the Firebase configuration:

```bash
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef123456
REACT_APP_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Deployment Process

- **Frontend**: Automatically deploys to Firebase Hosting on push to `main` or `develop` branches
- **Backend**: Automatically deploys Firebase Functions and Firestore rules on push to `main` or `develop` branches

### Troubleshooting

1. **Login Issues**: Ensure Firebase configuration is correct and user has proper permissions
2. **Deployment Failures**: Check that all GitHub secrets are set correctly
3. **Environment Variables**: Make sure REACT_APP_ variables are available during build

### Firebase Project Setup

Ensure your Firebase project has:
- Authentication enabled
- Firestore database created
- Hosting configured
- Functions enabled (if using Firebase Functions)