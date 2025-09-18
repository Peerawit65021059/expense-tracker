import React from 'react';
import './TransactionList.css';

const TransactionList = ({ transactions }) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatAmount = (amount, type) => {
    const formatted = Math.abs(amount).toFixed(2);
    return type === 'income' ? `+฿${formatted}` : `-฿${formatted}`;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      Food: '🍽️',
      Transport: '🚗',
      Shopping: '🛍️',
      Entertainment: '🎬',
      Bills: '💡',
      Salary: '💼',
      Other: '📦'
    };
    return icons[category] || '📦';
  };

  if (transactions.length === 0) {
    return (
      <div className="transaction-list-container">
        <h2>ประวัติการทำรายการ</h2>
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <p>ยังไม่มีรายการ</p>
          <p className="empty-subtitle">เพิ่มรายการแรกของคุณด้านบน</p>
        </div>
      </div>
    );
  }

  return (
    <div className="transaction-list-container">
      <h2>ประวัติการทำรายการ</h2>
      <div className="transaction-list">
        {transactions
          .sort((a, b) => {
            const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
            const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
            return dateB - dateA;
          })
          .map((transaction) => (
            <div
              key={transaction.id}
              className={`transaction-item ${transaction.type}`}
            >
              <div className="transaction-icon">
                {getCategoryIcon(transaction.category)}
              </div>
              <div className="transaction-details">
                <div className="transaction-category">{transaction.category}</div>
                <div className="transaction-description">
                  {transaction.description || 'ไม่มีคำอธิบาย'}
                </div>
                <div className="transaction-date">
                  {formatDate(transaction.timestamp)}
                </div>
              </div>
              <div className="transaction-amount">
                {formatAmount(transaction.amount, transaction.type)}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default TransactionList;