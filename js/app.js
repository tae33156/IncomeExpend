const App = (() => {
  const categoryIcons = {
    food: '🍽️',
    transport: '🚗',
    shopping: '🛍️',
    bills: '📄',
    entertainment: '🎬',
    health: '💊',
    education: '📚',
    other: '📌'
  };

  let currentView = 'dashboard';
  let currentFilter = 'thisMonth';
  let editingType = 'expense';

  function init() {
    setupNavigation();
    setupManualForm();
    setupScanTab();
    setupAddTabs();
    setupFilterBar();
    setupEditModal();
    setDefaultDate();
    renderDashboard();
    setCurrentMonth();
  }

  function setupNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        navigate(view);
      });
    });
  }

  function navigate(view) {
    currentView = view;
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(`view-${view}`).classList.add('active');

    document.querySelectorAll('.bottom-nav .nav-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.view === view);
    });

    if (view === 'dashboard') renderDashboard();
    if (view === 'summary') renderSummary();
  }

  function setupAddTabs() {
    document.querySelectorAll('.add-tabs .tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.add-tabs .tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('#view-add .tab-content').forEach(t => t.classList.remove('active'));
        document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
      });
    });
  }

  function setupManualForm() {
    // Type toggle
    document.querySelectorAll('#manualForm .type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#manualForm .type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    document.getElementById('manualForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const typeBtn = document.querySelector('#manualForm .type-btn.active');
      const transaction = {
        type: typeBtn.dataset.type,
        amount: parseFloat(document.getElementById('amount').value),
        category: document.getElementById('category').value,
        description: document.getElementById('description').value,
        date: document.getElementById('date').value,
      };

      if (!transaction.amount || !transaction.date) {
        showToast('กรุณากรอกข้อมูลให้ครบ');
        return;
      }

      Storage.add(transaction);
      showToast('บันทึกเรียบร้อย');
      resetManualForm();
      navigate('dashboard');
    });
  }

  function resetManualForm() {
    document.getElementById('manualForm').reset();
    document.querySelectorAll('#manualForm .type-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('#manualForm .type-btn[data-type="expense"]').classList.add('active');
    setDefaultDate();
  }

  function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
  }

  function setupScanTab() {
    const slipInput = document.getElementById('slipInput');
    const btnCapture = document.getElementById('btnCapture');
    const btnUpload = document.getElementById('btnUpload');
    const btnRescan = document.getElementById('btnRescan');
    const btnSaveOcr = document.getElementById('btnSaveOcr');

    btnCapture.addEventListener('click', () => {
      slipInput.setAttribute('capture', 'environment');
      slipInput.removeAttribute('accept');
      slipInput.setAttribute('accept', 'image/*');
      slipInput.click();
    });

    btnUpload.addEventListener('click', () => {
      slipInput.removeAttribute('capture');
      slipInput.click();
    });

    slipInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (ev) => {
        const imageData = ev.target.result;

        // Show preview
        document.getElementById('slipPreview').src = imageData;
        document.getElementById('slipPreview').classList.remove('hidden');
        document.getElementById('scanPlaceholder').classList.add('hidden');
        document.getElementById('scanButtons').classList.add('hidden');
        document.getElementById('ocrLoading').classList.remove('hidden');

        try {
          const result = await OCR.processSlip(imageData);

          document.getElementById('ocrLoading').classList.add('hidden');
          document.getElementById('ocrResult').classList.remove('hidden');

          if (result.amount) document.getElementById('ocrAmount').value = result.amount;
          if (result.date) document.getElementById('ocrDate').value = result.date;
          if (result.name) document.getElementById('ocrName').value = result.name;

          if (!result.amount && !result.date && !result.name) {
            showToast('อ่านข้อมูลไม่ได้ กรุณากรอกเอง');
          }
        } catch (err) {
          document.getElementById('ocrLoading').classList.add('hidden');
          document.getElementById('ocrResult').classList.remove('hidden');
          showToast('เกิดข้อผิดพลาด กรุณากรอกเอง');
        }
      };
      reader.readAsDataURL(file);
      slipInput.value = '';
    });

    btnRescan.addEventListener('click', () => {
      document.getElementById('slipPreview').classList.add('hidden');
      document.getElementById('ocrResult').classList.add('hidden');
      document.getElementById('scanPlaceholder').classList.remove('hidden');
      document.getElementById('scanButtons').classList.remove('hidden');
    });

    btnSaveOcr.addEventListener('click', () => {
      const amount = parseFloat(document.getElementById('ocrAmount').value);
      const date = document.getElementById('ocrDate').value;
      const name = document.getElementById('ocrName').value;
      const category = document.getElementById('ocrCategory').value;

      if (!amount || !date) {
        showToast('กรุณากรอกจำนวนเงินและวันที่');
        return;
      }

      const slipImage = document.getElementById('slipPreview').src;

      Storage.add({
        type: 'expense',
        amount,
        category,
        description: name || 'จาก Slip',
        date,
        slipImage: slipImage.length < 500000 ? slipImage : null
      });

      showToast('บันทึกเรียบร้อย');
      resetScanTab();
      navigate('dashboard');
    });
  }

  function resetScanTab() {
    document.getElementById('slipPreview').classList.add('hidden');
    document.getElementById('ocrResult').classList.add('hidden');
    document.getElementById('ocrLoading').classList.add('hidden');
    document.getElementById('scanPlaceholder').classList.remove('hidden');
    document.getElementById('scanButtons').classList.remove('hidden');
    document.getElementById('ocrAmount').value = '';
    document.getElementById('ocrDate').value = '';
    document.getElementById('ocrName').value = '';
  }

  function setupFilterBar() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderSummary();
      });
    });
  }

  function setupEditModal() {
    // Type toggle in edit form
    document.querySelectorAll('.edit-type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.edit-type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    document.getElementById('editForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('editId').value;
      const typeBtn = document.querySelector('.edit-type-btn.active');

      Storage.update(id, {
        type: typeBtn.dataset.type,
        amount: parseFloat(document.getElementById('editAmount').value),
        category: document.getElementById('editCategory').value,
        description: document.getElementById('editDescription').value,
        date: document.getElementById('editDate').value,
      });

      closeModal();
      showToast('แก้ไขเรียบร้อย');
      renderDashboard();
      renderSummary();
    });

    document.getElementById('btnDelete').addEventListener('click', () => {
      const id = document.getElementById('editId').value;
      if (confirm('ต้องการลบรายการนี้?')) {
        Storage.remove(id);
        closeModal();
        showToast('ลบเรียบร้อย');
        renderDashboard();
        renderSummary();
      }
    });
  }

  function renderDashboard() {
    const todayTx = Storage.getToday();
    const weekTx = Storage.getThisWeek();
    const monthTx = Storage.getThisMonth();

    const todayExpense = Storage.sumAmounts(todayTx, 'expense');
    const weekExpense = Storage.sumAmounts(weekTx, 'expense');
    const monthExpense = Storage.sumAmounts(monthTx, 'expense');

    document.getElementById('todayTotal').textContent = formatMoney(todayExpense);
    document.getElementById('weekTotal').textContent = formatMoney(weekExpense);
    document.getElementById('monthTotal').textContent = formatMoney(monthExpense);

    const recent = Storage.getAll().slice(0, 5);
    const recentList = document.getElementById('recentList');

    if (recent.length === 0) {
      recentList.innerHTML = '<div class="empty-state">ยังไม่มีรายการ<br>กด + เพื่อเพิ่มรายการใหม่</div>';
      return;
    }

    recentList.innerHTML = recent.map(renderTransactionItem).join('');
  }

  function renderSummary() {
    let transactions;
    switch (currentFilter) {
      case 'thisMonth': transactions = Storage.getThisMonth(); break;
      case 'lastMonth': transactions = Storage.getLastMonth(); break;
      case 'thisWeek': transactions = Storage.getThisWeek(); break;
      default: transactions = Storage.getAll();
    }

    const totalExpense = Storage.sumAmounts(transactions, 'expense');
    const totalIncome = Storage.sumAmounts(transactions, 'income');

    document.getElementById('sumExpense').textContent = formatMoney(totalExpense);
    document.getElementById('sumIncome').textContent = formatMoney(totalIncome);

    Chart.renderCategoryChart('categoryChart', transactions);

    const allList = document.getElementById('allTransactions');
    const count = document.getElementById('transactionCount');
    count.textContent = transactions.length;

    if (transactions.length === 0) {
      allList.innerHTML = '<div class="empty-state">ไม่มีรายการในช่วงนี้</div>';
      return;
    }

    allList.innerHTML = transactions.map(renderTransactionItem).join('');
  }

  function renderTransactionItem(tx) {
    const icon = categoryIcons[tx.category] || '📌';
    const sign = tx.type === 'expense' ? '-' : '+';
    const typeClass = tx.type === 'expense' ? 'expense' : 'income';
    const desc = tx.description || Chart.categoryLabels[tx.category] || tx.category;

    return `
      <div class="transaction-item" onclick="App.openEdit('${tx.id}')">
        ${tx.slipImage ? `<img src="${tx.slipImage}" class="tx-slip-thumb" alt="slip">` :
          `<div class="tx-icon ${tx.category}">${icon}</div>`}
        <div class="tx-info">
          <div class="tx-category">${Chart.categoryLabels[tx.category] || tx.category}</div>
          <div class="tx-desc">${desc}</div>
        </div>
        <div style="text-align:right">
          <div class="tx-amount ${typeClass}">${sign}฿${tx.amount.toLocaleString('th-TH', {minimumFractionDigits: 2})}</div>
          <div class="tx-date">${formatDate(tx.date)}</div>
        </div>
      </div>
    `;
  }

  function openEdit(id) {
    const tx = Storage.getAll().find(t => t.id === id);
    if (!tx) return;

    document.getElementById('editId').value = tx.id;
    document.getElementById('editAmount').value = tx.amount;
    document.getElementById('editCategory').value = tx.category;
    document.getElementById('editDescription').value = tx.description || '';
    document.getElementById('editDate').value = tx.date;

    document.querySelectorAll('.edit-type-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.type === tx.type);
    });

    document.getElementById('editModal').classList.remove('hidden');
  }

  function closeModal() {
    document.getElementById('editModal').classList.add('hidden');
  }

  function setCurrentMonth() {
    const months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    const now = new Date();
    document.getElementById('currentMonth').textContent =
      `${months[now.getMonth()]} ${now.getFullYear() + 543}`;
  }

  function formatMoney(amount) {
    return '฿' + amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  let toastTimer;
  function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.add('hidden'), 2500);
  }

  return {
    init,
    navigate,
    openEdit,
    closeModal,
    showToast
  };
})();

document.addEventListener('DOMContentLoaded', App.init);
