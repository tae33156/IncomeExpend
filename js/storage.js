const Storage = (() => {
  const KEY = 'slip_expense_transactions';

  function getAll() {
    const data = localStorage.getItem(KEY);
    return data ? JSON.parse(data) : [];
  }

  function save(transactions) {
    localStorage.setItem(KEY, JSON.stringify(transactions));
  }

  function add(transaction) {
    const transactions = getAll();
    transaction.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    transaction.createdAt = new Date().toISOString();
    transactions.unshift(transaction);
    save(transactions);
    return transaction;
  }

  function update(id, updates) {
    const transactions = getAll();
    const index = transactions.findIndex(t => t.id === id);
    if (index === -1) return null;
    transactions[index] = { ...transactions[index], ...updates };
    save(transactions);
    return transactions[index];
  }

  function remove(id) {
    const transactions = getAll().filter(t => t.id !== id);
    save(transactions);
  }

  function getByDateRange(startDate, endDate) {
    const transactions = getAll();
    return transactions.filter(t => {
      const d = t.date;
      return d >= startDate && d <= endDate;
    });
  }

  function getToday() {
    const today = new Date().toISOString().split('T')[0];
    return getAll().filter(t => t.date === today);
  }

  function getThisWeek() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    const startDate = monday.toISOString().split('T')[0];
    const endDate = now.toISOString().split('T')[0];
    return getByDateRange(startDate, endDate);
  }

  function getThisMonth() {
    const now = new Date();
    const startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const endDate = now.toISOString().split('T')[0];
    return getByDateRange(startDate, endDate);
  }

  function getLastMonth() {
    const now = new Date();
    const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    const month = now.getMonth() === 0 ? 12 : now.getMonth();
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
    return getByDateRange(startDate, endDate);
  }

  function sumAmounts(transactions, type) {
    return transactions
      .filter(t => t.type === type)
      .reduce((sum, t) => sum + t.amount, 0);
  }

  return {
    getAll,
    add,
    update,
    remove,
    getByDateRange,
    getToday,
    getThisWeek,
    getThisMonth,
    getLastMonth,
    sumAmounts
  };
})();
