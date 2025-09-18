// Firebase Configuration
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);

// Authentication functions
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const registerUser = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Update display name if provided
    if (displayName && userCredential.user) {
      await userCredential.user.updateProfile({
        displayName: displayName
      });
    }
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Get ID token for API calls
export const getIdToken = async () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No authenticated user');
  }
  return await user.getIdToken();
};

// API functions using Firebase Functions
export const addTransaction = async (transaction, userId) => {
  try {
    console.log('🔄 Calling Firebase Functions API: addTransaction', transaction);
    const idToken = await getIdToken();
    const addTransactionFunction = httpsCallable(functions, 'addTransaction');

    const result = await addTransactionFunction({
      ...transaction,
      userId: userId || auth.currentUser?.uid
    });

    console.log('✅ Transaction added successfully:', result.data.data);
    return result.data.data;
  } catch (error) {
    console.error('❌ Error adding transaction to backend:', error);
    throw error;
  }
};

export const getTransactions = async (userId) => {
  try {
    const userIdToUse = userId || auth.currentUser?.uid;
    if (!userIdToUse) {
      return [];
    }

    console.log('🔄 Calling Firebase Functions API: getTransactions');
    const idToken = await getIdToken();
    const getTransactionsFunction = httpsCallable(functions, 'getTransactions');

    const result = await getTransactionsFunction();
    console.log('✅ Received response from backend:', result.data);

    if (result.data.success) {
      const transactions = result.data.data.map(transaction => ({
        ...transaction,
        timestamp: transaction.timestamp?.toDate ? transaction.timestamp.toDate() : new Date(transaction.timestamp)
      }));
      console.log('📊 Processed transactions:', transactions.length, 'items');
      return transactions;
    } else {
      throw new Error(result.data.error || 'Failed to get transactions');
    }
  } catch (error) {
    console.error('❌ Error getting transactions from backend:', error);
    throw error;
  }
};

// Export Firebase instances for compatibility
export { auth, db, functions };