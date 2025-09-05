import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function addTransaction(data) {
  await addDoc(collection(db, 'transactions'), data);
}
 import { getDocs, collection } from 'firebase/firestore';
import { db } from './firebase';

export async function fetchTransactions() {
  const snapshot = await getDocs(collection(db, 'transactions'));
  return snapshot.docs.map(doc => doc.data());
}
