/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit3,
  X,
  PieChart,
  Calendar,
  Check,
  DollarSign,
  PiggyBank,
  AlertCircle,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Sliders,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Transaction, TransactionType } from '../../types';

const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Housing & Rent',
  'Shopping & Books',
  'Wellness & Care',
  'Transport',
  'Entertainment',
  'Other Expenses',
];

const INCOME_CATEGORIES = [
  'Salary',
  'Freelance & Side',
  'Investments',
  'Gifts & Grants',
  'Other Income',
];

export const MoneyTrackerView: React.FC = () => {
  const {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    categoryBudgets,
    updateCategoryBudget,
  } = useApp();

  // Selected Month Year Filter (default to current YYYY-MM)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  });

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  // Add Transaction Form
  const [txType, setTxType] = useState<TransactionType>('expense');
  const [txAmount, setTxAmount] = useState('');
  const [txCategory, setTxCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [txDate, setTxDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [txNote, setTxNote] = useState('');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Edit Transaction State
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editType, setEditType] = useState<TransactionType>('expense');
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editNote, setEditNote] = useState('');

  // Delete Confirm State
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Category Budget Edit State inside modal
  const [editingBudgets, setEditingBudgets] = useState<Record<string, number>>({});

  // Filter transactions for the selected month YYYY-MM
  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // Total Summary
  const { totalIncome, totalExpenses, netBalance } = useMemo(() => {
    let income = 0;
    let expense = 0;

    monthTransactions.forEach((t) => {
      if (t.type === 'income') {
        income += t.amount;
      } else {
        expense += t.amount;
      }
    });

    return {
      totalIncome: income,
      totalExpenses: expense,
      netBalance: income - expense,
    };
  }, [monthTransactions]);

  // Spending by Expense Category
  const categorySpending = useMemo(() => {
    const spending: Record<string, number> = {};
    monthTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        spending[t.category] = (spending[t.category] || 0) + t.amount;
      });
    return spending;
  }, [monthTransactions]);

  // Search & Filtered List
  const filteredTransactions = useMemo(() => {
    return monthTransactions.filter((t) => {
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (filterCategory !== 'all' && t.category !== filterCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesNote = t.note && t.note.toLowerCase().includes(q);
        const matchesCategory = t.category.toLowerCase().includes(q);
        const matchesAmount = t.amount.toString().includes(q);
        if (!matchesNote && !matchesCategory && !matchesAmount) return false;
      }
      return true;
    });
  }, [monthTransactions, filterType, filterCategory, searchQuery]);

  // Form submit for new transaction
  const handleSaveNewTx = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(txAmount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    addTransaction({
      type: txType,
      amount: numAmount,
      category: txCategory,
      date: txDate,
      note: txNote.trim() || undefined,
    });

    setTxAmount('');
    setTxNote('');
    setIsAddModalOpen(false);
  };

  // Open Edit Modal
  const handleOpenEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setEditType(tx.type);
    setEditAmount(tx.amount.toString());
    setEditCategory(tx.category);
    setEditDate(tx.date);
    setEditNote(tx.note || '');
  };

  // Form submit for edit transaction
  const handleSaveEditTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;
    const numAmount = parseFloat(editAmount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    updateTransaction(editingTx.id, {
      type: editType,
      amount: numAmount,
      category: editCategory,
      date: editDate,
      note: editNote.trim() || undefined,
    });

    setEditingTx(null);
  };

  // Open Budget Modal
  const handleOpenBudgetModal = () => {
    setEditingBudgets({ ...categoryBudgets });
    setIsBudgetModalOpen(true);
  };

  // Save Budgets
  const handleSaveBudgets = () => {
    Object.entries(editingBudgets).forEach(([cat, val]) => {
      updateCategoryBudget(cat, val);
    });
    setIsBudgetModalOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-8 animate-in fade-in duration-300 select-none">
      {/* 1. Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#151520] via-[#12111B] to-[#151520] border border-[#2E2942] p-6 sm:p-8 overflow-hidden shadow-xl shadow-[#7863A8]/10">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#B8A4D8]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-[#7863A8]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-light text-[#B8A4D8] tracking-wider uppercase">
              <Wallet className="w-4 h-4 text-[#B8A4D8]" />
              <span>Financial Overview</span>
              <span>·</span>
              <span>MY MONEY TRACKER</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-light text-[#EAE6F2] tracking-wide">
              My Money Tracker 💳
            </h1>
            <p className="text-sm font-light text-[#AAA4B8] leading-relaxed">
              Keep track of income, expenses, and category budgets in your personal sanctuary. Clear, private, and simple.
            </p>
          </div>

          {/* Month Selector & Actions */}
          <div className="flex items-center gap-3 flex-wrap shrink-0">
            <div className="flex items-center gap-2 bg-[#1B1A28] border border-[#3B3654] rounded-2xl px-3.5 py-2">
              <Calendar className="w-4 h-4 text-[#B8A4D8]" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-xs text-[#EAE6F2] focus:outline-none cursor-pointer"
              />
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="min-h-[42px] px-5 py-2 rounded-2xl bg-[#B8A4D8] text-[#08080C] hover:bg-[#c7b6e4] transition-all text-xs font-medium flex items-center gap-2 shadow-lg shadow-[#B8A4D8]/20 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#08080C]" />
              <span>Add Transaction</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Monthly Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Total Income Card */}
        <div className="rounded-3xl bg-[#12111B] border border-[#2E2942] p-5 space-y-3 relative overflow-hidden shadow-md">
          <div className="flex items-center justify-between text-xs text-[#AAA4B8]">
            <span className="font-light">Total Income</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-light text-emerald-400">
              ${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-[#AAA4B8] font-light mt-1">For {selectedMonth}</p>
          </div>
        </div>

        {/* Total Expenses Card */}
        <div className="rounded-3xl bg-[#12111B] border border-[#2E2942] p-5 space-y-3 relative overflow-hidden shadow-md">
          <div className="flex items-center justify-between text-xs text-[#AAA4B8]">
            <span className="font-light">Total Expenses</span>
            <div className="w-8 h-8 rounded-xl bg-rose-950/60 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-light text-rose-400">
              ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-[#AAA4B8] font-light mt-1">For {selectedMonth}</p>
          </div>
        </div>

        {/* Net Balance Card */}
        <div className="rounded-3xl bg-[#12111B] border border-[#2E2942] p-5 space-y-3 relative overflow-hidden shadow-md">
          <div className="flex items-center justify-between text-xs text-[#AAA4B8]">
            <span className="font-light">Net Balance</span>
            <div className="w-8 h-8 rounded-xl bg-[#1B1A28] border border-[#B8A4D8]/40 flex items-center justify-center text-[#B8A4D8]">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className={`text-2xl sm:text-3xl font-light ${netBalance >= 0 ? 'text-[#B8A4D8]' : 'text-rose-400'}`}>
              ${netBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-[#AAA4B8] font-light mt-1">
              {netBalance >= 0 ? 'Positive net savings' : 'Expenses exceed income'}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Category Budgets & Spending Progress */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#12111B] border border-[#2E2942] shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2E2942]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#B8A4D8]" />
              <h2 className="text-base font-normal text-[#EAE6F2]">Category Spending & Budgets</h2>
            </div>
            <p className="text-xs text-[#AAA4B8] font-light">
              Track your spending progress against your monthly limits.
            </p>
          </div>

          <button
            onClick={handleOpenBudgetModal}
            className="px-4 py-2 rounded-xl bg-[#1B1A28] border border-[#2E2942] text-xs font-light text-[#EAE6F2] hover:bg-[#232136] transition-colors cursor-pointer self-start sm:self-auto"
          >
            Manage Monthly Limits
          </button>
        </div>

        {/* Budget Progress Bars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {EXPENSE_CATEGORIES.map((cat) => {
            const spent = categorySpending[cat] || 0;
            const limit = categoryBudgets[cat] || 300;
            const percent = Math.min(Math.round((spent / limit) * 100), 100);
            const isOver = spent > limit;

            return (
              <div key={cat} className="p-4 rounded-2xl bg-[#151520] border border-[#262438] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-normal text-[#EAE6F2]">{cat}</span>
                  {isOver ? (
                    <span className="px-2 py-0.5 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-300 text-[10px] font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Over Limit
                    </span>
                  ) : (
                    <span className="text-[#AAA4B8] font-light text-[11px]">
                      {percent}% used
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-[#1A1828] overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isOver
                        ? 'bg-rose-500'
                        : percent > 80
                        ? 'bg-amber-400'
                        : 'bg-[#B8A4D8]'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#AAA4B8] font-light">
                  <span>${spent.toFixed(2)} spent</span>
                  <span>Limit: ${limit.toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Transaction History Section */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-normal text-[#EAE6F2]">Transactions History</h2>
            <p className="text-xs text-[#AAA4B8] font-light">
              Showing {filteredTransactions.length} records for {selectedMonth}
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative w-48 sm:w-56">
              <Search className="w-3.5 h-3.5 text-[#AAA4B8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#151520] border border-[#262438] text-xs text-[#EAE6F2] placeholder-[#AAA4B8] focus:outline-none focus:border-[#B8A4D8]"
              />
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-[#151520] border border-[#262438] rounded-xl px-3 py-1.5 text-xs text-[#EAE6F2] focus:outline-none focus:border-[#B8A4D8] cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="income">Income Only</option>
              <option value="expense">Expenses Only</option>
            </select>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-[#151520] border border-[#262438] rounded-xl px-3 py-1.5 text-xs text-[#EAE6F2] focus:outline-none focus:border-[#B8A4D8] cursor-pointer"
            >
              <option value="all">All Categories</option>
              {[...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Transactions Table / List */}
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-16 px-6 rounded-3xl bg-[#12111B] border border-[#2E2942] space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1B1A28] border border-[#2E2942] flex items-center justify-center text-[#B8A4D8] mx-auto">
              <Wallet className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-normal text-[#EAE6F2]">No transactions found</h3>
            <p className="text-xs text-[#AAA4B8] font-light max-w-sm mx-auto">
              There are no transactions matching your search filters for {selectedMonth}. Click "Add Transaction" above to create one.
            </p>
          </div>
        ) : (
          <div className="rounded-3xl bg-[#12111B] border border-[#2E2942] overflow-hidden shadow-lg">
            <div className="divide-y divide-[#262438]">
              {filteredTransactions.map((tx) => {
                const isIncome = tx.type === 'income';
                return (
                  <div
                    key={tx.id}
                    className="p-4 sm:px-6 hover:bg-[#151520]/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 ${
                          isIncome
                            ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-400'
                            : 'bg-rose-950/60 border-rose-500/30 text-rose-400'
                        }`}
                      >
                        {isIncome ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-normal text-[#EAE6F2]">{tx.category}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1B1A28] border border-[#262438] text-[#AAA4B8]">
                            {tx.date}
                          </span>
                        </div>
                        {tx.note && (
                          <p className="text-[11px] text-[#AAA4B8] font-light italic">
                            {tx.note}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#262438]">
                      <span className={`text-sm sm:text-base font-light ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isIncome ? '+' : '-'}${tx.amount.toFixed(2)}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(tx)}
                          className="p-1.5 rounded-lg text-[#AAA4B8] hover:text-[#EAE6F2] hover:bg-[#1B1A28] transition-colors cursor-pointer"
                          title="Edit transaction"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#B8A4D8]" />
                        </button>

                        {confirmDeleteId === tx.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                deleteTransaction(tx.id);
                                setConfirmDeleteId(null);
                              }}
                              className="px-2 py-1 rounded bg-rose-900/80 text-rose-200 text-[10px] cursor-pointer"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-[10px] text-[#AAA4B8] cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(tx.id)}
                            className="p-1.5 rounded-lg text-[#AAA4B8] hover:text-rose-400 hover:bg-[#1B1A28] transition-colors cursor-pointer"
                            title="Delete transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 5. Add Transaction Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <form
            onSubmit={handleSaveNewTx}
            className="relative w-full max-w-lg bg-[#12111B] border border-[#2E2942] rounded-3xl p-6 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#2E2942]">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-[#B8A4D8]" />
                <h3 className="text-sm font-normal text-[#EAE6F2]">Add New Transaction</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#151520] border border-[#2E2942] flex items-center justify-center text-[#AAA4B8] hover:text-[#EAE6F2] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Type selector */}
              <div>
                <label className="text-[11px] text-[#AAA4B8] block mb-1.5">Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setTxType('expense');
                      setTxCategory(EXPENSE_CATEGORIES[0]);
                    }}
                    className={`py-2 rounded-xl text-xs font-medium border cursor-pointer transition-all ${
                      txType === 'expense'
                        ? 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                        : 'bg-[#151520] border-[#262438] text-[#AAA4B8]'
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTxType('income');
                      setTxCategory(INCOME_CATEGORIES[0]);
                    }}
                    className={`py-2 rounded-xl text-xs font-medium border cursor-pointer transition-all ${
                      txType === 'income'
                        ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                        : 'bg-[#151520] border-[#262438] text-[#AAA4B8]'
                    }`}
                  >
                    Income
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="text-[11px] text-[#AAA4B8] block mb-1">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#151520] border border-[#262438] text-sm text-[#EAE6F2] focus:outline-none focus:border-[#B8A4D8]"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-[11px] text-[#AAA4B8] block mb-1">Category</label>
                <select
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#151520] border border-[#262438] text-xs text-[#EAE6F2] focus:outline-none focus:border-[#B8A4D8]"
                >
                  {(txType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="text-[11px] text-[#AAA4B8] block mb-1">Date</label>
                <input
                  type="date"
                  value={txDate}
                  onChange={(e) => setTxDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#151520] border border-[#262438] text-xs text-[#EAE6F2]"
                  required
                />
              </div>

              {/* Note */}
              <div>
                <label className="text-[11px] text-[#AAA4B8] block mb-1">Optional Note / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Organic coffee, Monthly rent, Side project..."
                  value={txNote}
                  onChange={(e) => setTxNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#151520] border border-[#262438] text-xs text-[#EAE6F2] focus:outline-none focus:border-[#B8A4D8]"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#2E2942] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#1B1A28] border border-[#2E2942] text-xs font-light text-[#EAE6F2] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#B8A4D8] text-[#08080C] text-xs font-medium hover:bg-[#c7b6e4] cursor-pointer shadow-sm"
              >
                Save Transaction
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 6. Edit Transaction Modal */}
      {editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <form
            onSubmit={handleSaveEditTx}
            className="relative w-full max-w-lg bg-[#12111B] border border-[#2E2942] rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#2E2942]">
              <h3 className="text-sm font-normal text-[#EAE6F2]">Edit Transaction</h3>
              <button
                type="button"
                onClick={() => setEditingTx(null)}
                className="w-8 h-8 rounded-full bg-[#151520] border border-[#2E2942] flex items-center justify-center text-[#AAA4B8] hover:text-[#EAE6F2] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setEditType('expense')}
                  className={`py-2 rounded-xl text-xs font-medium border cursor-pointer ${
                    editType === 'expense' ? 'bg-rose-950/60 border-rose-500/50 text-rose-300' : 'bg-[#151520] border-[#262438] text-[#AAA4B8]'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setEditType('income')}
                  className={`py-2 rounded-xl text-xs font-medium border cursor-pointer ${
                    editType === 'income' ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300' : 'bg-[#151520] border-[#262438] text-[#AAA4B8]'
                  }`}
                >
                  Income
                </button>
              </div>

              <div>
                <label className="text-[11px] text-[#AAA4B8] block mb-1">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#151520] border border-[#262438] text-sm text-[#EAE6F2]"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-[#AAA4B8] block mb-1">Category</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#151520] border border-[#262438] text-xs text-[#EAE6F2]"
                >
                  {(editType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-[#AAA4B8] block mb-1">Date</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#151520] border border-[#262438] text-xs text-[#EAE6F2]"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-[#AAA4B8] block mb-1">Note</label>
                <input
                  type="text"
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#151520] border border-[#262438] text-xs text-[#EAE6F2]"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#2E2942] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingTx(null)}
                className="px-4 py-2 rounded-xl bg-[#1B1A28] border border-[#2E2942] text-xs font-light text-[#EAE6F2] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#B8A4D8] text-[#08080C] text-xs font-medium hover:bg-[#c7b6e4] cursor-pointer shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 7. Manage Category Budgets Modal */}
      {isBudgetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#12111B] border border-[#2E2942] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2E2942]">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#B8A4D8]" />
                <h3 className="text-sm font-normal text-[#EAE6F2]">Manage Monthly Category Limits</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBudgetModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#151520] border border-[#2E2942] flex items-center justify-center text-[#AAA4B8] hover:text-[#EAE6F2] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {EXPENSE_CATEGORIES.map((cat) => (
                <div key={cat} className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-[#151520] border border-[#262438]">
                  <span className="text-xs font-normal text-[#EAE6F2]">{cat}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-[#AAA4B8]">$</span>
                    <input
                      type="number"
                      step="10"
                      min="0"
                      value={editingBudgets[cat] ?? 300}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setEditingBudgets((prev) => ({ ...prev, [cat]: val }));
                      }}
                      className="w-24 px-2.5 py-1 rounded-xl bg-[#1B1A28] border border-[#2E2942] text-xs text-[#EAE6F2] text-right focus:outline-none focus:border-[#B8A4D8]"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[#2E2942] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsBudgetModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#1B1A28] border border-[#2E2942] text-xs font-light text-[#EAE6F2] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveBudgets}
                className="px-5 py-2 rounded-xl bg-[#B8A4D8] text-[#08080C] text-xs font-medium hover:bg-[#c7b6e4] cursor-pointer shadow-sm"
              >
                Save Limits
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
