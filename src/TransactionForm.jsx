import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';

const handleSubmit = async () => {
  await addDoc(collection(db, "transactions"), {
    type: "income",
    amount: 500,
    category: "Salary",
    timestamp: new Date()
  });
};


