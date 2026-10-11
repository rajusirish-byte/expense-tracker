import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Wallet, PieChart, List, Settings, Moon, Sun, 
  Trash2, Edit3, ArrowUpRight, ArrowDownRight, Search, 
  Filter, Download, AlertTriangle, CheckCircle, ChevronRight,
  TrendingUp, CreditCard, DollarSign, Calendar, Tag, ShieldAlert,
  Smartphone, Bell, IndianRupee
} from 'lucide-react';

const CATEGORIES = [
  { id: 'Food', label: 'Food & Dining', color: '#f59e0b', icon: '🍔' },
  { id: 'Travel', label: 'Travel & Auto', color: '#3b82f6', icon: '🚗' },
  { id: 'Shopping', label: 'Shopping', color: '#ec4899', icon: '🛍️' },
  { id: 'Bills', label: 'Bills & Utilities', color: '#ef4444', icon: '💡' },
  { id: 'Groceries', label: 'Groceries', color: '#10b981', icon: '🛒' },
  { id: 'Entertainment', label: 'Entertainment', color: '#8b5cf6', icon: '🎬' },
  { id: 'Others', label: 'Others', color: '#64748b', icon: '📦' },
];

const PAYMENT_MODES = [
  { id: 'UPI', label: 'UPI / GPay / PhonePe' },
  { id: 'Card', label: 'Credit / Debit Card' },
  { id: 'NetBanking', label: 'Net Banking' },
  { id: 'Cash', label: 'Cash' },
];

const INITIAL_EXPENSES = [
  { id: '1', description: 'BigBasket Grocery Order', amount: 1450.00, category: 'Groceries', date: '2026-10-10', paymentMode: 'UPI' },
  { id: '2', description: 'Ola Cab to Airport', amount: 650.00, category: 'Travel', date: '2026-10-09', paymentMode: 'UPI' },
  { id: '3', description: 'Restaurant Dinner with Friends', amount: 2400.00, category: 'Food', date: '2026-10-08', paymentMode: 'Card' },
  { id: '4', description: 'Electricity & Internet Bill', amount: 3200.00, category: 'Bills', date: '2026-10-05', paymentMode: 'NetBanking' },
  { id: '5', description: 'Movie Tickets at PVR', amount: 800.00, category: 'Entertainment', date: '2026-10-02', paymentMode: 'UPI' },
];

export default function App() {
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('android_expenses_inr');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [monthlyBudget, setMonthlyBudget] = useState(() => {
    const saved = localStorage.getItem('android_monthly_budget_inr');
    return saved ? parseFloat(saved) : 35000;
  });

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'history' | 'analytics' | 'settings'
  const [darkMode, setDarkMode] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedMonth, setSelectedMonth] = useState('2026-10');

  // Form State
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().slice(0, 10),
    paymentMode: 'UPI',
  });

  // Notification / Toast
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    localStorage.setItem('android_expenses_inr', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('android_monthly_budget_inr', monthlyBudget.toString());
  }, [monthlyBudget]);

  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const currentMonthExpenses = useMemo(() => {
    return expenses.filter(e => e.date.startsWith(selectedMonth));
  }, [expenses, selectedMonth]);

  const totalSpent = useMemo(() => {
    return currentMonthExpenses.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  }, [currentMonthExpenses]);

  const remainingBudget = monthlyBudget - totalSpent;
  const budgetPercentage = Math.min(Math.round((totalSpent / (monthlyBudget || 1)) * 100), 100);

  const categoryTotals = useMemo(() => {
    const totals = {};
    CATEGORIES.forEach(c => { totals[c.id] = 0; });
    currentMonthExpenses.forEach(exp => {
      if (totals[exp.category] !== undefined) {
        totals[exp.category] += parseFloat(exp.amount || 0);
      } else {
        totals['Others'] += parseFloat(exp.amount || 0);
      }
    });
    return totals;
  }, [currentMonthExpenses]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const matchesSearch = exp.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'ALL' || exp.category === selectedCategory;
      const matchesMonth = exp.date.startsWith(selectedMonth);
      return matchesSearch && matchesCategory && matchesMonth;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [expenses, searchQuery, selectedCategory, selectedMonth]);

  const handleSaveExpense = (e) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;

    if (editingExpense) {
      setExpenses(prev => prev.map(item => item.id === editingExpense.id ? {
        ...editingExpense,
        ...formData,
        amount: parseFloat(formData.amount)
      } : item));
      showToast('Expense updated successfully');
    } else {
      const newExp = {
        id: Date.now().toString(),
        ...formData,
        amount: parseFloat(formData.amount)
      };
      setExpenses(prev => [newExp, ...prev]);
      showToast('Expense added successfully');
    }

    closeModal();
  };

  const handleDeleteExpense = (id) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    showToast('Expense deleted');
  };

  const openAddModal = (expense = null) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
        date: expense.date,
        paymentMode: expense.paymentMode || 'UPI',
      });
    } else {
      setEditingExpense(null);
      setFormData({
        description: '',
        amount: '',
        category: 'Food',
        date: new Date().toISOString().slice(0, 10),
        paymentMode: 'UPI',
      });
    }
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingExpense(null);
  };

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(expenses, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `expenses_${selectedMonth}_inr.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Data exported as JSON');
  };

  return (
    <div className={`min-h-screen w-full flex items-center justify-center p-0 sm:p-4 transition-colors duration-300 ${darkMode ? 'dark bg-slate-950' : 'bg-slate-200'}`}>
      
      {/* Android Device Mockup Frame Container */}
      <div className="w-full max-w-md h-[100vh] sm:h-[840px] bg-slate-50 dark:bg-slate-900 sm:rounded-[40px] shadow-2xl flex flex-col overflow-hidden relative border-0 sm:border-[8px] border-slate-800 dark:border-slate-800">
        
        {/* Android Top Status Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-900 px-6 pt-3 pb-2 flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300 select-none z-20">
          <span>9:41</span>
          <div className="hidden sm:block w-16 h-3 bg-slate-800 rounded-full mx-auto my-0"></div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[10px]">5G</span>
            <div className="w-4 h-2.5 border border-current rounded-sm flex p-[0.5px]">
              <div className="bg-current h-full w-full rounded-[0.5px]"></div>
            </div>
          </div>
        </div>

        {/* Top App Bar Header */}
        <header className="px-5 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800 flex justify-between items-center z-10 sticky top-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white leading-tight">PayPulse INR</h1>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Expense Tracker (₹)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
            <input 
              type="month" 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-2 py-1.5 rounded-lg border-0 outline-none font-medium cursor-pointer"
            />
          </div>
        </header>

        {/* Scrollable Main Screen Content */}
        <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-24">
          
          {/* TOAST ALERTS */}
          {toastMessage && (
            <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white dark:bg-white/90 dark:text-slate-900 px-4 py-2 rounded-full text-xs font-medium shadow-lg backdrop-blur-sm flex items-center gap-2 animate-bounce">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* TAB 1: DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-4">
              
              {/* Material You Styled Budget Summary Card with INR */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 translate-x-4 -translate-y-4 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-xs font-medium text-emerald-100/80 tracking-wide uppercase">Monthly Spent</span>
                    <h2 className="text-3xl font-black mt-0.5 tracking-tight">{formatINR(totalSpent)}</h2>
                  </div>
                  <div className="p-2.5 bg-white/15 backdrop-blur-md rounded-2xl">
                    <TrendingUp className="w-5 h-5 text-emerald-100" />
                  </div>
                </div>

                {/* Progress Bar & Target */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-xs font-medium text-emerald-100/90">
                    <span>Budget Limit: {formatINR(monthlyBudget)}</span>
                    <span>{budgetPercentage}% Used</span>
                  </div>
                  <div className="w-full bg-black/20 h-2.5 rounded-full overflow-hidden p-0.5">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${remainingBudget < 0 ? 'bg-rose-400' : 'bg-emerald-300'}`}
                      style={{ width: `${budgetPercentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Remaining Amount & Status */}
                <div className="mt-4 pt-3 border-t border-white/15 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1.5">
                    {remainingBudget < 0 ? (
                      <span className="text-rose-200 flex items-center gap-1 font-semibold">
                        <AlertTriangle className="w-3.5 h-3.5" /> Exceeded by {formatINR(Math.abs(remainingBudget))}
                      </span>
                    ) : (
                      <span className="text-emerald-100 font-medium">
                        Remaining: <strong className="text-white">{formatINR(remainingBudget)}</strong>
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-emerald-100/70">{currentMonthExpenses.length} Transactions</span>
                </div>
              </div>

              {/* Quick Category Summary Grid */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category Breakdown</h3>
                  <button onClick={() => setActiveTab('analytics')} className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                    See All <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {CATEGORIES.slice(0, 4).map(cat => {
                    const amount = categoryTotals[cat.id] || 0;
                    return (
                      <div key={cat.id} className="p-3 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-800 flex items-center gap-3 shadow-sm">
                        <span className="text-xl p-2 rounded-xl bg-slate-100 dark:bg-slate-700/50">{cat.icon}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-medium">{cat.label}</p>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{formatINR(amount)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Activity Section */}
              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center px-1">
                  <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Recent Transactions</h3>
                  <button onClick={() => setActiveTab('history')} className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    View History
                  </button>
                </div>

                <div className="space-y-2">
                  {currentMonthExpenses.length === 0 ? (
                    <div className="py-8 text-center bg-white dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                      <p className="text-xs text-slate-400">No expenses recorded for this month.</p>
                    </div>
                  ) : (
                    currentMonthExpenses.slice(0, 5).map(exp => {
                      const catObj = CATEGORIES.find(c => c.id === exp.category) || CATEGORIES[6];
                      return (
                        <div key={exp.id} className="p-3 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between shadow-sm hover:shadow transition">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg bg-slate-100 dark:bg-slate-700/60 flex-shrink-0">
                              {catObj.icon}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{exp.description}</h4>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                                <span>{exp.date}</span>
                                <span>•</span>
                                <span className="px-1.5 py-0.2 bg-slate-100 dark:bg-slate-700 rounded text-[9px] font-semibold text-slate-600 dark:text-slate-300">{exp.paymentMode || 'UPI'}</span>
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="text-xs font-extrabold text-slate-900 dark:text-white">-{formatINR(exp.amount)}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: HISTORY & LIST VIEW */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              
              {/* Search & Filter Bar */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search transactions..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  <button 
                    onClick={() => setSelectedCategory('ALL')}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition ${selectedCategory === 'ALL' ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}
                  >
                    All Categories
                  </button>
                  {CATEGORIES.map(cat => (
                    <button 
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition flex items-center gap-1 ${selectedCategory === cat.id ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.id}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Transactions List */}
              <div className="space-y-2">
                {filteredExpenses.length === 0 ? (
                  <div className="py-12 text-center bg-white dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-800">
                    <p className="text-xs text-slate-400">No matching expenses found.</p>
                  </div>
                ) : (
                  filteredExpenses.map(exp => {
                    const catObj = CATEGORIES.find(c => c.id === exp.category) || CATEGORIES[6];
                    return (
                      <div key={exp.id} className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-800 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg bg-slate-100 dark:bg-slate-700 flex-shrink-0">
                            {catObj.icon}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{exp.description}</h4>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                              {exp.date} • {exp.paymentMode || 'UPI'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs font-bold text-slate-900 dark:text-white mr-1">-{formatINR(exp.amount)}</span>
                          <button onClick={() => openAddModal(exp)} className="p-1.5 text-slate-400 hover:text-emerald-500 transition">
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDeleteExpense(exp.id)} className="p-1.5 text-slate-400 hover:text-rose-500 transition">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ANALYTICS VIEW */}
          {activeTab === 'analytics' && (
            <div className="space-y-4">
              <div className="p-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-3">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Spending Breakdown (INR)</h3>
                <div className="space-y-2.5 pt-1">
                  {CATEGORIES.map(cat => {
                    const total = categoryTotals[cat.id] || 0;
                    const pct = totalSpent > 0 ? Math.round((total / totalSpent) * 100) : 0;
                    return (
                      <div key={cat.id} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                          <span className="flex items-center gap-1.5">
                            <span>{cat.icon}</span>
                            <span>{cat.label}</span>
                          </span>
                          <span className="font-bold">{formatINR(total)} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-300"
                            style={{ width: `${pct}%`, backgroundColor: cat.color }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Insights Card */}
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-3xl border border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Monthly Insights</span>
                </div>
                <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
                  {remainingBudget >= 0 
                    ? `Great job! You have maintained spending within your budget limit of ${formatINR(monthlyBudget)}.`
                    : `Alert: You are over budget by ${formatINR(Math.abs(remainingBudget))}. Consider optimizing shopping or utility spends.`}
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: SETTINGS VIEW */}
          {activeTab === 'settings' && (
            <div className="space-y-3">
              <div className="p-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Settings</h3>

                {/* Monthly Budget Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Monthly Budget (₹ INR)</label>
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      value={monthlyBudget} 
                      onChange={(e) => setMonthlyBudget(parseFloat(e.target.value) || 0)}
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 space-y-2">
                  <button 
                    onClick={exportData}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-700/40 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
                  >
                    <span className="flex items-center gap-2"><Download className="w-4 h-4 text-emerald-500" /> Export Expense Data (JSON)</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  <button 
                    onClick={() => {
                      if (confirm('Reset all expense data to default INR values?')) {
                        setExpenses(INITIAL_EXPENSES);
                        showToast('Data reset to default INR expenses');
                      }
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-semibold transition"
                  >
                    <span className="flex items-center gap-2"><Trash2 className="w-4 h-4" /> Reset All Expense Records</span>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>

        {/* Android Material Design Floating Action Button (FAB) */}
        <button 
          onClick={() => openAddModal()}
          className="absolute bottom-16 right-5 z-30 w-12 h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-500/40 flex items-center justify-center transition-transform active:scale-95"
          aria-label="Add Expense"
        >
          <Plus className="w-6 h-6" />
        </button>

        {/* Android Navigation Bottom Bar */}
        <nav className="absolute bottom-0 inset-x-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200/60 dark:border-slate-800 px-4 py-2 flex justify-around items-center z-20">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-0.5 p-1 transition ${activeTab === 'dashboard' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400 dark:text-slate-500'}`}
          >
            <Wallet className="w-5 h-5" />
            <span className="text-[10px]">Home</span>
          </button>

          <button 
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center gap-0.5 p-1 transition ${activeTab === 'history' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400 dark:text-slate-500'}`}
          >
            <List className="w-5 h-5" />
            <span className="text-[10px]">History</span>
          </button>

          <button 
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center gap-0.5 p-1 transition ${activeTab === 'analytics' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400 dark:text-slate-500'}`}
          >
            <PieChart className="w-5 h-5" />
            <span className="text-[10px]">Analytics</span>
          </button>

          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-0.5 p-1 transition ${activeTab === 'settings' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400 dark:text-slate-500'}`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px]">Settings</span>
          </button>
        </nav>

        {/* Quick Add / Edit Expense Bottom Modal Sheet */}
        {isAddModalOpen && (
          <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-xs flex items-end justify-center animate-fade-in">
            <div className="w-full bg-white dark:bg-slate-900 rounded-t-3xl p-5 space-y-4 border-t border-slate-200 dark:border-slate-800 animate-slide-up shadow-2xl">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {editingExpense ? 'Edit Expense' : 'Add New Expense'}
                </h3>
                <button onClick={closeModal} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  Cancel
                </button>
              </div>

              <form onSubmit={handleSaveExpense} className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Description</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Swiggy, Petrol, Groceries"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Amount (₹ INR)</label>
                    <input 
                      type="number" 
                      step="1" 
                      required 
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 mt-1 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Date</label>
                    <input 
                      type="date" 
                      required 
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Category</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 mt-1"
                    >
                      {CATEGORIES.map(c => (
                        <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Payment Mode</label>
                    <select 
                      value={formData.paymentMode}
                      onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 mt-1"
                    >
                      {PAYMENT_MODES.map(p => (
                        <option key={p.id} value={p.id}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" 
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition"
                  >
                    {editingExpense ? 'Save Changes' : 'Add Expense'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}