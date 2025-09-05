import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert('สมัครสมาชิกสำเร็จ!');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <h2>สมัครสมาชิก</h2>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="อีเมล" required />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="รหัสผ่าน" required />
      <button type="submit">สมัคร</button>
    </form>
  );
}
