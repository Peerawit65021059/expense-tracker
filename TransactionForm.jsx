import { useState } from 'react';

export default function TransactionForm({ onAdd }) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('expense');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({ amount: parseFloat(amount), category, type, date: new Date() });
    setAmount('');
    setCategory('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="จำนวนเงิน" required />
      <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="หมวดหมู่" required />
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="expense">รายจ่าย</option>
        <option value="income">รายรับ</option>
      </select>
      <button type="submit">บันทึก</button>
    </form>
  );
}

