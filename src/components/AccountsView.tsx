import React, { useState, useMemo } from 'react';
import { useProject } from '../context/ProjectContext';
import { translations, formatCurrency } from '../utils/translations';
import { AccountTransaction } from '../types';
import { 
  Wallet, 
  DollarSign, 
  TrendingUp, 
  Receipt, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  Download, 
  Trash2, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  CreditCard,
  Building2,
  FileSpreadsheet,
  PieChart as PieIcon,
  Tag
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';

export const AccountsView: React.FC = () => {
  const { 
    accounts, 
    projects, 
    activeProjectId, 
    setActiveProjectId, 
    language, 
    isAdmin, 
    addAccountTransaction, 
    updateAccountTransactionStatus, 
    deleteAccountTransaction 
  } = useProject();
  const t = translations[language];

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentModeFilter, setPaymentModeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Voucher Form
  const [newProject, setNewProject] = useState<string>(projects[0]?.id || 'proj-01');
  const [newVoucherNo, setNewVoucherNo] = useState<string>(`VOC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [newDate, setNewDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newCategory, setNewCategory] = useState<AccountTransaction['category']>('material');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newVendor, setNewVendor] = useState<string>('');
  const [newAmount, setNewAmount] = useState<number>(50000);
  const [newPaymentMode, setNewPaymentMode] = useState<AccountTransaction['paymentMode']>('bank_transfer');
  const [newStatus, setNewStatus] = useState<AccountTransaction['status']>('paid');
  const [newInvoiceRef, setNewInvoiceRef] = useState<string>('');
  const [newNotes, setNewNotes] = useState<string>('');

  // Filtered Accounts
  const filteredAccounts = useMemo(() => {
    return accounts.filter(item => {
      const matchProject = activeProjectId === 'all' || item.projectId === activeProjectId;
      const matchCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchMode = paymentModeFilter === 'all' || item.paymentMode === paymentModeFilter;
      const matchSearch = searchQuery === '' ||
        item.voucherNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.recipientOrVendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.invoiceRef && item.invoiceRef.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchProject && matchCategory && matchStatus && matchMode && matchSearch;
    });
  }, [accounts, activeProjectId, categoryFilter, statusFilter, paymentModeFilter, searchQuery]);

  // Financial KPI calculations
  const relevantProjects = activeProjectId === 'all' ? projects : projects.filter(p => p.id === activeProjectId);
  const totalBudget = relevantProjects.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = relevantProjects.reduce((sum, p) => sum + p.spent, 0);

  const totalVoucherExpense = filteredAccounts
    .filter(a => a.status === 'paid' || a.status === 'cleared')
    .reduce((sum, a) => sum + a.amount, 0);

  const pendingVoucherLiability = filteredAccounts
    .filter(a => a.status === 'pending')
    .reduce((sum, a) => sum + a.amount, 0);

  const materialExpense = filteredAccounts
    .filter(a => a.category === 'material' && a.status !== 'pending')
    .reduce((sum, a) => sum + a.amount, 0);

  const laborExpense = filteredAccounts
    .filter(a => a.category === 'labor' && a.status !== 'pending')
    .reduce((sum, a) => sum + a.amount, 0);

  const machineryExpense = filteredAccounts
    .filter(a => (a.category === 'machinery' || a.category === 'fuel') && a.status !== 'pending')
    .reduce((sum, a) => sum + a.amount, 0);

  const remainingBalance = Math.max(0, totalBudget - totalSpent);

  // RECHARTS DATA PREPARATION
  // 1. Category Distribution
  const categoryMap: Record<string, number> = {};
  filteredAccounts.forEach(item => {
    const catName = item.category.charAt(0).toUpperCase() + item.category.slice(1);
    categoryMap[catName] = (categoryMap[catName] || 0) + item.amount;
  });
  const categoryChartData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

  // 2. Project Budget vs Spent Comparison
  const projectComparisonData = projects.map(p => ({
    name: p.code,
    fullName: language === 'ur' && p.nameUrdu ? p.nameUrdu : p.name,
    budget: Math.round(p.budget / 1000000), // in Millions PKR
    spent: Math.round(p.spent / 1000000),
    balance: Math.round(Math.max(0, p.budget - p.spent) / 1000000)
  }));

  // 3. Cash Flow Timeline / Outflow
  const dateMap: Record<string, number> = {};
  filteredAccounts.forEach(item => {
    dateMap[item.date] = (dateMap[item.date] || 0) + item.amount;
  });
  const cashFlowTimeline = Object.entries(dateMap)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .slice(-7)
    .map(([date, amount]) => ({
      date: date.slice(5),
      amount: Math.round(amount / 1000) // in Thousands PKR
    }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

  const handleAddVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newVendor.trim()) return;

    addAccountTransaction({
      projectId: newProject,
      voucherNo: newVoucherNo.trim(),
      date: newDate,
      category: newCategory,
      title: newTitle.trim(),
      recipientOrVendor: newVendor.trim(),
      amount: Number(newAmount) || 0,
      paymentMode: newPaymentMode,
      status: newStatus,
      invoiceRef: newInvoiceRef.trim() || undefined,
      notes: newNotes.trim() || undefined
    });

    setIsAddModalOpen(false);
    setNewTitle('');
    setNewVendor('');
    setNewInvoiceRef('');
    setNewNotes('');
    setNewVoucherNo(`VOC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  };

  // CSV Export
  const exportCsv = () => {
    const headers = ['Voucher No', 'Date', 'Project Code', 'Category', 'Description/Title', 'Paid To / Vendor', 'Amount (PKR)', 'Payment Mode', 'Status', 'Invoice Ref', 'Notes'];
    const rows = filteredAccounts.map(item => {
      const proj = projects.find(p => p.id === item.projectId);
      return [
        item.voucherNo,
        item.date,
        proj?.code || item.projectId,
        item.category,
        `"${item.title.replace(/"/g, '""')}"`,
        `"${item.recipientOrVendor.replace(/"/g, '""')}"`,
        item.amount,
        item.paymentMode,
        item.status,
        `"${(item.invoiceRef || '').replace(/"/g, '""')}"`,
        `"${(item.notes || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `alasad_accounts_financial_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-950/60 via-slate-900 to-slate-900 p-5 rounded-2xl border border-blue-900/30 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-inner">
            <Wallet className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>{language === 'ur' ? 'اکاؤنٹس و مالیاتی ریکارڈ' : 'Accounts & Financial Management'}</span>
              <span className="px-2 py-0.5 text-xs font-mono bg-emerald-950/70 text-emerald-300 rounded border border-emerald-800">
                {formatCurrency(totalSpent, language)} Spent
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              {language === 'ur' 
                ? 'واؤچرز، سامان و لیبر ادائیگیاں، کیش فلو اور پروجیکٹ بجٹ کھاتے' 
                : 'Expense vouchers, material disbursements, labor payouts, and budget burn rate'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition cursor-pointer shadow-sm"
            title="Download CSV"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>{language === 'ur' ? 'ایکسپورٹ لیجر CSV' : 'Export CSV'}</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 border border-blue-400/30 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ur' ? '+ واؤچر درج کریں' : '+ Record Expense Voucher'}</span>
          </button>
        </div>
      </div>

      {/* SUMMARY KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Allocated Budget */}
        <div className="bg-slate-900/90 border border-blue-900/30 rounded-xl p-4 shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">
              {language === 'ur' ? 'منظور شدہ کل بجٹ' : 'Total Sanctioned Budget'}
            </p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl sm:text-2xl font-bold text-white">
                {formatCurrency(totalBudget, language)}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {relevantProjects.length} Construction sites
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Actual Spent Outflow */}
        <div className="bg-slate-900/90 border border-emerald-900/30 rounded-xl p-4 shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">
              {language === 'ur' ? 'اب تک کے کل اخراجات' : 'Actual Expenditures (Paid)'}
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-bold text-emerald-400">
                {formatCurrency(totalSpent, language)}
              </span>
              <span className="text-xs text-emerald-500 font-mono">
                {totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Budget utilization to date</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Materials & Procurement Outflow */}
        <div className="bg-slate-900/90 border border-amber-900/30 rounded-xl p-4 shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">
              {language === 'ur' ? 'سامان و میٹریل خریداری' : 'Materials & Hardware'}
            </p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl sm:text-2xl font-bold text-amber-300">
                {formatCurrency(materialExpense, language)}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Cement, Steel, Aggregates, Tiles</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Remaining Liquidity / Balance */}
        <div className="bg-slate-900/90 border border-indigo-900/30 rounded-xl p-4 shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">
              {language === 'ur' ? 'باقی ماندہ بجٹ بیلنس' : 'Remaining Budget Balance'}
            </p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl sm:text-2xl font-bold text-indigo-300">
                {formatCurrency(remainingBalance, language)}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Available for remaining phases</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Expenditure Breakdown by Category (Donut) */}
        <div className="bg-slate-900/90 border border-blue-900/30 rounded-2xl p-5 shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-blue-400" />
                <span>{language === 'ur' ? 'اخراجات کی مد وار تقسیم' : 'Expense Category Breakdown'}</span>
              </h2>
              <p className="text-[11px] text-slate-400">Disbursement across construction heads</p>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {categoryChartData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.75rem', color: '#f8fafc', fontSize: '12px' }}
                    formatter={(value: any) => [`PKR ${Number(value).toLocaleString()}`, 'Amount']}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} 
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-slate-500 text-xs">No transaction records available</div>
            )}
          </div>
        </div>

        {/* Chart 2: Project Budget vs Spent (Dual Bar Chart in Millions PKR) */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-blue-900/30 rounded-2xl p-5 shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>{language === 'ur' ? 'پروجیکٹ بجٹ بمقابلہ اصل خرچ' : 'Project Budget vs Actual Spent (Million PKR)'}</span>
              </h2>
              <p className="text-[11px] text-slate-400">Financial absorption comparison across civil projects</p>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-xs bg-blue-600"></span> Budget
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500"></span> Spent
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectComparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit="M" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.75rem', color: '#f8fafc', fontSize: '12px' }}
                  formatter={(value: any, name: any) => [
                    `PKR ${value} Million`,
                    name === 'budget' ? 'Sanctioned Budget' : 'Actual Spent'
                  ]}
                />
                <Bar dataKey="budget" name="budget" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="spent" name="spent" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-slate-900/80 border border-blue-900/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Project Switcher */}
          <select
            value={activeProjectId}
            onChange={(e) => setActiveProjectId(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">{language === 'ur' ? 'تمام منصوبے' : 'All Projects'}</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                {p.code} - {language === 'ur' && p.nameUrdu ? p.nameUrdu : p.name}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="material">Materials</option>
            <option value="labor">Labor Wages</option>
            <option value="subcontractor">Subcontractor</option>
            <option value="machinery">Machinery & Plant</option>
            <option value="fuel">Fuel & Generators</option>
            <option value="overheads">Site Overheads</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="cleared">Cleared</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={language === 'ur' ? 'واؤچر نمبر، وینڈر یا عنوان تلاش کریں...' : 'Search voucher #, vendor, title...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* ACCOUNTS VOUCHER LEDGER TABLE */}
      <div className="bg-slate-900/90 border border-blue-900/30 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white">
              {language === 'ur' ? 'اکاؤنٹس واؤچر و کیش بک لیجر' : 'Accounts Voucher & Cash Disbursement Ledger'}
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Showing {filteredAccounts.length} transactions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Voucher #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Title / Description</th>
                <th className="py-3 px-4">Vendor / Recipient</th>
                <th className="py-3 px-4 text-right">Amount (PKR)</th>
                <th className="py-3 px-4">Payment Mode</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAccounts.length > 0 ? (
                filteredAccounts.map((item) => {
                  const proj = projects.find(p => p.id === item.projectId);
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono font-semibold text-blue-400 whitespace-nowrap">
                        {item.voucherNo}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                        {item.date}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800">
                          {proj?.code || item.projectId}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-white max-w-xs truncate" title={item.title}>
                        {item.title}
                        {item.invoiceRef && (
                          <span className="block text-[10px] text-slate-400 font-mono">
                            Ref: {item.invoiceRef}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                        {item.recipientOrVendor}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-400 whitespace-nowrap">
                        {item.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 uppercase text-[10px] font-mono text-slate-400 whitespace-nowrap">
                        {item.paymentMode.replace('_', ' ')}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          item.status === 'paid' || item.status === 'cleared'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {isAdmin && (
                          <div className="flex items-center justify-center gap-1.5">
                            {item.status === 'pending' && (
                              <button
                                onClick={() => updateAccountTransactionStatus(item.id, 'paid')}
                                className="px-2 py-0.5 rounded text-[10px] bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 cursor-pointer"
                                title="Mark as Paid"
                              >
                                Mark Paid
                              </button>
                            )}
                            <button
                              onClick={() => deleteAccountTransaction(item.id)}
                              className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition cursor-pointer"
                              title="Delete Voucher"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500">
                    No financial vouchers match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD VOUCHER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-slate-900 border border-blue-800/40 rounded-2xl w-full max-w-lg shadow-2xl p-6 text-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-400" />
                <span>{language === 'ur' ? 'نیا واؤچر درج کریں' : 'Record Financial Voucher'}</span>
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddVoucher} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Voucher #</label>
                  <input
                    type="text"
                    value={newVoucherNo}
                    onChange={(e) => setNewVoucherNo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 font-mono text-blue-400 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Project Site</label>
                  <select
                    value={newProject}
                    onChange={(e) => setNewProject(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.code} - {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Expense Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="material">Materials</option>
                    <option value="labor">Labor Wages</option>
                    <option value="subcontractor">Subcontractor</option>
                    <option value="machinery">Machinery & Plant</option>
                    <option value="fuel">Fuel & Generator</option>
                    <option value="overheads">Overheads & Utilities</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Title / Description</label>
                <input
                  type="text"
                  placeholder="e.g. 500 Bags OPC Cement Delivery or Shuttering Crew Wages"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Paid To / Vendor / Supplier</label>
                  <input
                    type="text"
                    placeholder="e.g. Lucky Cement Depot / Bismillah Builders"
                    value={newVendor}
                    onChange={(e) => setNewVendor(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Amount (PKR)</label>
                  <input
                    type="number"
                    min="1"
                    step="1000"
                    value={newAmount}
                    onChange={(e) => setNewAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-emerald-400 font-mono font-bold focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Payment Mode</label>
                  <select
                    value={newPaymentMode}
                    onChange={(e) => setNewPaymentMode(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                    <option value="cash">Cash</option>
                    <option value="pay_order">Pay Order</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Payment Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="cleared">Cleared</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Invoice / Bill Ref #</label>
                  <input
                    type="text"
                    placeholder="INV-9921"
                    value={newInvoiceRef}
                    onChange={(e) => setNewInvoiceRef(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Audit Notes / Approval</label>
                <textarea
                  rows={2}
                  placeholder="Quality inspection passed, consultant stamp, delivery note..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-lg shadow-blue-600/30 cursor-pointer"
                >
                  Save Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
