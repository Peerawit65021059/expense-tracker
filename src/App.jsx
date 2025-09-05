import TransactionForm from './components/TransactionForm';
import SummaryChart from './components/SummaryChart';
import { addTransaction } from './firebase';

function App() {
  const handleAdd = async (data) => {
    await addTransaction(data);
    alert('บันทึกสำเร็จ!');
  };

  return (
    <div>
      <h1>Expense Tracker</h1>
      <TransactionForm onAdd={handleAdd} />
      <SummaryChart />
    </div>
  );
}

export default App;

