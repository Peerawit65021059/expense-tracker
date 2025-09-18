# CI/CD Pipeline Documentation

This directory contains GitHub Actions workflows for automated CI/CD processes for the Expense Tracker application.

## Workflows Overview

### 1. CI/CD Pipeline (`ci-cd.yml`)
**Triggers:** Push to `main` or `develop` branches, Pull Requests to `main`

**Jobs:**
- **Frontend Test:** Runs linting, tests, and builds the React application
- **Backend Test:** Runs linting and tests for Firebase Functions
- **Security Scan:** Performs dependency vulnerability scanning
- **Deploy Staging:** Deploys to staging environment on `develop` branch pushes
- **Deploy Production:** Deploys to production on `main` branch pushes
- **Rollback:** Automatically rolls back on deployment failures

### 2. Firebase Hosting PR Preview (`firebase-hosting-pull-request.yml`)
**Triggers:** Pull Requests

**Features:**
- Runs tests and builds before deployment
- Creates Firebase Hosting preview for PRs
- Adds automated comments with preview URLs
- 7-day expiration for previews

### 3. Code Quality Checks (`code-quality.yml`)
**Triggers:** Push and Pull Requests to `main` and `develop`

**Checks:**
- ESLint for code quality
- Prettier for code formatting
- Bundle size monitoring
- Dependency updates tracking
- Automated PR comments with dependency status

## Required Secrets

Add these secrets to your GitHub repository:

### Firebase Deployment
- `FIREBASE_TOKEN`: Firebase CLI token for deployment
- `FIREBASE_SERVICE_ACCOUNT_EXPENSE_WALLET_82D9F`: Service account JSON for Firebase

### Optional
- `BUNDLESIZE_GITHUB_TOKEN`: For bundle size monitoring (uses GITHUB_TOKEN)

## Setup Instructions

1. **Firebase CLI Token:**
   ```bash
   firebase login:ci
   # Copy the generated token
   ```

2. **Firebase Service Account:**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Generate new private key
   - Add the JSON content as `FIREBASE_SERVICE_ACCOUNT_EXPENSE_WALLET_82D9F`

3. **Enable Required APIs:**
   - Cloud Functions API
   - Cloud Build API
   - Artifact Registry API
   - Firebase Hosting API

## Branch Strategy

- **`main`**: Production branch - triggers full CI/CD with production deployment
- **`develop`**: Staging branch - triggers CI/CD with staging deployment
- **Feature branches**: Create PRs for testing and preview deployments

## Deployment Environments

### Production (`main` branch)
- Full test suite execution
- Security scanning
- Production Firebase project deployment
- Automated rollback on failures

### Staging (`develop` branch)
- Full test suite execution
- Security scanning
- Staging Firebase project deployment

### Preview (Pull Requests)
- Basic testing
- Firebase Hosting preview
- 7-day expiration
- No function deployment

## Monitoring and Notifications

- **Deployment Status:** Automatic PR comments with deployment results
- **Rollback Notifications:** Alerts on deployment failures
- **Dependency Updates:** PR comments with outdated dependency information
- **Security Issues:** Automated security vulnerability reports

## Manual Triggers

You can manually trigger workflows using GitHub Actions UI or CLI:

```bash
gh workflow run ci-cd.yml --ref main
```

## Troubleshooting

### Common Issues:

1. **Firebase Token Expired:**
   - Regenerate token: `firebase login:ci`
   - Update `FIREBASE_TOKEN` secret

2. **Service Account Permissions:**
   - Ensure service account has Editor role
   - Check Firebase project permissions

3. **Build Failures:**
   - Check Node.js version compatibility
   - Verify dependency versions
   - Review build logs for specific errors

4. **Deployment Timeouts:**
   - Increase timeout in workflow if needed
   - Check Firebase quotas and limits

## Performance Optimization

- **Caching:** Node modules are cached between runs
- **Parallel Jobs:** Tests run in parallel where possible
- **Conditional Deployment:** Only deploys when tests pass
- **Artifact Upload:** Build artifacts are cached for faster deployments

## Security Features

- **Dependency Scanning:** Automated vulnerability detection
- **Code Quality:** ESLint and Prettier checks
- **Access Control:** Service account with minimal required permissions
- **Audit Logs:** All deployments are logged and tracked