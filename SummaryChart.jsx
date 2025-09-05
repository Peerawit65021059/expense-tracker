import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { fetchTransactions } from '../firebase';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale);

export default function SummaryChart() {
  const [monthlyData, setMonthlyData] = useState({});

  useEffect(() => {
    const loadData = async () => {
      const transactions = await fetchTransactions();
      const summary = {};

      transactions.forEach(txn => {
        const month = new Date(txn.date.seconds * 1000).toLocaleString('default', { month: 'short' });
        summary[month] = (summary[month] || 0) + txn.amount * (txn.type === 'expense' ? -1 : 1);
      });

      setMonthlyData(summary);
    };

    loadData();
  }, []);

  const chartData = {
    labels: Object.keys(monthlyData),
    datasets: [
      {
        label: 'ยอดรวมรายเดือน (บาท)',
        data: Object.values(monthlyData),
        backgroundColor: '#4bc0c0',
      },
    ],
  };

  return (
    <div>
      <h2>สรุปยอดรวมรายเดือน</h2>
      <Bar data={chartData} />
    </div>
  );
}
