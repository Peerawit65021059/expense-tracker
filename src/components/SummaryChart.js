import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import './SummaryChart.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const SummaryChart = ({ transactions }) => {
  // Group transactions by category and calculate totals
  const categoryTotals = transactions.reduce((acc, transaction) => {
    if (transaction.type === 'expense') {
      const category = transaction.category || 'Other';
      acc[category] = (acc[category] || 0) + transaction.amount;
    }
    return acc;
  }, {});

  const categories = Object.keys(categoryTotals);
  const amounts = Object.values(categoryTotals);

  // If no expenses, show empty state
  if (categories.length === 0) {
    return (
      <div className="summary-chart-container">
        <h3>การแบ่งประเภทรายจ่าย</h3>
        <div className="chart-placeholder">
          <div className="placeholder-icon">📊</div>
          <p>ไม่มีรายจ่ายให้แสดง</p>
        </div>
      </div>
    );
  }

  const data = {
    labels: categories,
    datasets: [{
      data: amounts,
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF9F40',
        '#FF6384',
        '#C9CBCF'
      ],
      borderWidth: 2,
      borderColor: '#ffffff',
      hoverBorderWidth: 3,
      hoverBorderColor: '#ffffff'
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ฿${value.toFixed(2)} (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="summary-chart-container">
      <h3>การแบ่งประเภทรายจ่าย</h3>
      <div className="chart-wrapper">
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
};

export default SummaryChart;