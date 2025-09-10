import React, { useState } from 'react';
import { addTransaction, getCurrentUser } from '../firebase';
import './TransactionForm.css';

const TransactionForm = ({ onTransactionAdded }) => {
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.category) return;

    const user = getCurrentUser();
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    setLoading(true);
    try {
      await addTransaction({
        ...formData,
        amount: parseFloat(formData.amount)
      }, user.uid);

      setFormData({
        type: 'expense',
        amount: '',
        category: '',
        description: ''
      });
      onTransactionAdded();
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
    setLoading(false);
  };

  return (
    <div className="transaction-form-container">
      <h2>เพิ่มรายการ</h2>
      <form onSubmit={handleSubmit} className="transaction-form">
        <div className="form-group">
          <label htmlFor="type">ประเภท</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="form-select"
          >
            <option value="income">รายรับ</option>
            <option value="expense">รายจ่าย</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="amount">จำนวนเงิน</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">หมวดหมู่</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="form-select"
          >
            <option value="">เลือกหมวดหมู่</option>
            <option value="Food">อาหาร</option>
            <option value="Transport">การเดินทาง</option>
            <option value="Shopping">การช็อปปิ้ง</option>
            <option value="Entertainment">บันเทิง</option>
            <option value="Bills">บิลและค่าบริการ</option>
            <option value="Salary">เงินเดือน</option>
            <option value="Other">อื่นๆ</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">คำอธิบาย</label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="คำอธิบายเพิ่มเติม (ไม่บังคับ)"
            className="form-input"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="submit-button"
        >
          {loading ? 'กำลังเพิ่ม...' : 'เพิ่มรายการ'}
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;