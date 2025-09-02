# Firebase Storage Troubleshooting Guide

## Common Issues and Solutions

### 1. "storage/unknown" Error

This error typically occurs when there are issues with Firebase Storage configuration or permissions.

#### Possible Causes:
- Firebase Storage not enabled in your project
- Incorrect storage rules
- Network connectivity issues
- Firebase project configuration problems

#### Solutions:

##### A. Enable Firebase Storage
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Storage** in the left sidebar
4. Click **Get Started** if Storage is not enabled
5. Choose a location for your storage bucket
6. Start in test mode (you can change rules later)

##### B. Check Storage Rules
1. In Firebase Console, go to **Storage** → **Rules**
2. Ensure you have rules that allow uploads:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /products/{allPaths=**} {
      allow read, write: if true; // For testing - change this later
    }
  }
}
```

**⚠️ Warning**: The above rules allow anyone to read/write. For production, use proper authentication rules.

##### C. Verify Firebase Config
Check your `firebaseConfig.js` file has the correct project ID:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id", // Make sure this matches
  storageBucket: "your-project-id.appspot.com", // This should exist
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### 2. Image Upload Fails

#### Check Image Size and Format:
- Ensure image is not too large (recommend under 5MB)
- Use common formats: JPG, PNG, GIF
- Check if image file is corrupted

#### Network Issues:
- Ensure stable internet connection
- Check if you're behind a firewall/proxy
- Try on different network (mobile data vs WiFi)

### 3. Permission Denied Errors

#### Check Authentication:
- Ensure user is logged in (if using auth rules)
- Check if user has proper permissions
- Verify Firebase Auth is properly configured

### 4. Storage Quota Exceeded

#### Check Usage:
1. Go to Firebase Console → **Storage** → **Usage**
2. Check if you've hit the free tier limits
3. Consider upgrading plan if needed

### 5. Testing Storage Connection

The app now includes a storage connection test. Check the console logs for:
- "Storage connection test: Reference created successfully" ✅
- "Storage connection test failed: [error]" ❌

### 6. Alternative Solutions

If Firebase Storage continues to fail:

#### Option A: Use Base64 Images (Temporary)
- Convert images to base64 strings
- Store directly in Firestore (not recommended for production)
- Limited by Firestore document size (1MB)

#### Option B: External Image Service
- Use services like Cloudinary, Imgur, or AWS S3
- Update the upload function accordingly

#### Option C: Local Storage Only
- Store images locally on device
- No cloud backup but functional for testing

## Getting Help

1. **Check Firebase Console** for error details
2. **Review console logs** in your app
3. **Test with Firebase CLI**: `firebase storage:rules:test`
4. **Contact Firebase Support** if issues persist

## Best Practices

1. **Always handle upload failures gracefully**
2. **Implement retry logic** for failed uploads
3. **Use proper error messages** for users
4. **Test with different image types and sizes**
5. **Monitor storage usage** regularly
6. **Implement proper security rules** before production

## Quick Fix Commands

```bash
# Reinstall Firebase
npm uninstall firebase
npm install firebase

# Clear Metro cache
npx react-native start --reset-cache

# Check Firebase CLI
firebase --version
firebase projects:list
```

