const Chart = (() => {
  const categoryLabels = {
    food: 'อาหาร',
    transport: 'เดินทาง',
    shopping: 'ช้อปปิ้ง',
    bills: 'บิล/ค่าใช้จ่าย',
    entertainment: 'บันเทิง',
    health: 'สุขภาพ',
    education: 'การศึกษา',
    other: 'อื่นๆ'
  };

  function renderCategoryChart(containerId, transactions) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const expenses = transactions.filter(t => t.type === 'expense');
    if (expenses.length === 0) {
      container.innerHTML = '<div class="empty-state">ไม่มีรายจ่าย</div>';
      return;
    }

    const categoryTotals = {};
    expenses.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    const maxAmount = Math.max(...Object.values(categoryTotals));

    const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

    container.innerHTML = sorted.map(([cat, amount]) => {
      const pct = maxAmount > 0 ? (amount / maxAmount * 100) : 0;
      const label = categoryLabels[cat] || cat;
      return `
        <div class="chart-bar-row">
          <span class="chart-bar-label">${label}</span>
          <div class="chart-bar-track">
            <div class="chart-bar-fill ${cat}" style="width: ${pct}%"></div>
          </div>
          <span class="chart-bar-value">฿${amount.toLocaleString('th-TH', {minimumFractionDigits: 2})}</span>
        </div>
      `;
    }).join('');
  }

  return {
    renderCategoryChart,
    categoryLabels
  };
})();
