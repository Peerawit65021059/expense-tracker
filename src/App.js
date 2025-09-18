import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import SummaryChart from './components/SummaryChart';
import Logo from './components/Logo';
import Login from './components/Login';
import Register from './components/Register';
import { getTransactions, logoutUser, onAuthStateChange } from './firebase';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('login'); // 'login', 'register', 'dashboard'
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Memoize expensive calculations
  const { totalIncome, totalExpenses, balance } = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    return {
      totalIncome: income,
      totalExpenses: expenses,
      balance: income - expenses
    };
  }, [transactions]);

  // Check for existing authentication on app load
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0]
        };

        setUser(userData);
        setIsAuthenticated(true);
        setCurrentView('dashboard');

        // Load transactions for authenticated user
        await loadTransactions(firebaseUser.uid);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setCurrentView('login');
        setTransactions([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadTransactions = async (userId) => {
    try {
      const data = await getTransactions(userId);
      setTransactions(data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const handleLogin = async (userData, token) => {
    // Auth state will be handled by onAuthStateChange
    // No manual state setting needed
  };

  const handleRegister = async (userData, token) => {
    // Auth state will be handled by onAuthStateChange
    // No manual state setting needed
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      // Firebase auth state change will handle UI updates
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleTransactionAdded = () => {
    if (user?.uid) {
      loadTransactions(user.uid);
    }
  };

  const switchToRegister = () => {
    setCurrentView('register');
  };

  const switchToLogin = () => {
    setCurrentView('login');
  };

  // Show loading screen
  if (loading && isAuthenticated) {
    return (
      <div className="app">
        <div className="loading">กำลังโหลดข้อมูลการเงินของคุณ...</div>
      </div>
    );
  }

  // Show authentication screens
  if (!isAuthenticated) {
    if (currentView === 'register') {
      return <Register onRegister={handleRegister} onSwitchToLogin={switchToLogin} />;
    }
    return <Login onLogin={handleLogin} onSwitchToRegister={switchToRegister} />;
  }

  return (
    <div className="app">
      <header className="header">
        <Logo />
        <div className="header-actions">
          <div className="balance-card">
            <div className="balance-amount">฿{balance.toFixed(2)}</div>
            <div className="balance-label">ยอดเงินคงเหลือ</div>
          </div>
          <div className="user-menu">
            <span className="user-greeting">สวัสดี, {user?.name || user?.email}!</span>
            <button onClick={handleLogout} className="logout-button">
              ออกจากระบบ
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="summary-section">
          <div className="summary-cards">
            <div className="summary-card income">
              <div className="card-icon">📈</div>
              <div className="card-content">
                <div className="card-amount">฿{totalIncome.toFixed(2)}</div>
                <div className="card-label">รายรับทั้งหมด</div>
              </div>
            </div>
            <div className="summary-card expense">
              <div className="card-icon">📉</div>
              <div className="card-content">
                <div className="card-amount">฿{totalExpenses.toFixed(2)}</div>
                <div className="card-label">รายจ่ายทั้งหมด</div>
              </div>
            </div>
          </div>
          <div className="chart-container">
            <SummaryChart transactions={transactions} />
          </div>
        </div>

        <div className="form-section">
          <TransactionForm onTransactionAdded={handleTransactionAdded} />
        </div>

        <div className="list-section">
          <TransactionList transactions={transactions} />
        </div>
      </main>
    </div>
  );
}

export default App;
