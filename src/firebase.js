import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export const addTransaction = async (transaction, userId) => {
  try {
    await addDoc(collection(db, 'transactions'), {
      ...transaction,
      userId,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }
};

export const getTransactions = async (userId) => {
  try {
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting transactions:', error);
    return [];
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const registerUser = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Update display name
    await userCredential.user.updateProfile({
      displayName: displayName
    });
    return userCredential.user;
  } catch (error) {
    console.error('Error registering:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};