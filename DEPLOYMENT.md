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

1. **Authentication Error "Failed to authenticate, have you run firebase login?"**:
   - The `FIREBASE_TOKEN` secret is missing or invalid
   - Follow these steps to fix:

     **Step 1: Generate Firebase CI Token**
     ```bash
     # Make sure you're logged in to Firebase
     firebase login

     # Generate a CI token
     firebase login:ci
     ```
     This will output a long token string - copy it.

     **Step 2: Add to GitHub Secrets**
     - Go to your GitHub repository
     - Settings → Secrets and variables → Actions
     - Click "New repository secret"
     - Name: `FIREBASE_TOKEN`
     - Value: Paste the token from Step 1
     - Click "Add secret"

2. **Login Issues**: Ensure Firebase configuration is correct and user has proper permissions
3. **Deployment Failures**: Check that all GitHub secrets are set correctly
4. **Environment Variables**: Make sure REACT_APP_ variables are available during build

### Firebase Project Setup

Ensure your Firebase project has:
- Authentication enabled
- Firestore database created
- Hosting configured
- Functions enabled (if using Firebase Functions)

### Verifying Firebase CI Token Permissions

After generating the CI token, ensure the associated Firebase account has:

1. **Project Editor** or **Owner** role in the Firebase project
2. **Access to deploy** to Hosting, Functions, and Firestore
3. **Billing enabled** (required for Functions deployment)

To check permissions:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings → Users and permissions
4. Ensure your account has the necessary roles

### Testing the Token Locally

Before pushing to GitHub, test the token locally:

```bash
# Set the token as an environment variable
export FIREBASE_TOKEN=your_token_here

# Try a deployment command
firebase use expense-wallet-82d9f
firebase deploy --only hosting --project expense-wallet-82d9f
```

### 🚨 CRITICAL: If CI Token Still Doesn't Work

**Use Firebase Service Account Instead (Most Reliable):**

#### **Step 1: Create Service Account Key**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project `expense-wallet-82d9f`
3. Click **Project Settings** (⚙️ gear icon)
4. Go to **Service accounts** tab
5. Under **Firebase Admin SDK**, click **"Generate new private key"**
6. Download the JSON file

#### **Step 2: Add to GitHub Secrets**
1. Go to GitHub → Repository → Settings → Secrets and variables → Actions
2. Create **TWO** secrets:

   **Secret 1:**
   - Name: `FIREBASE_SERVICE_ACCOUNT`
   - Value: Entire JSON content from downloaded file

   **Secret 2:**
   - Name: `FIREBASE_SERVICE_ACCOUNT_EXPENSE_WALLET_82D9F`
   - Value: **Same JSON content** (for PR previews)

#### **Step 3: Update Workflows to Use Service Account**
The workflows need to be modified to use service account authentication instead of CI tokens.

**Would you like me to update the workflows to use service account authentication instead?**