import React, { useState, useMemo } from 'react';
import { useProject } from '../context/ProjectContext';
import { translations, formatCurrency } from '../utils/translations';
import { LaborEntry } from '../types';
import { 
  Users, 
  HardHat, 
  Calendar, 
  Clock, 
  DollarSign, 
  Plus, 
  Download, 
  Trash2, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  TrendingUp,
  UserCheck,
  ShieldCheck,
  Briefcase,
  ArrowLeft,
  Receipt,
  Printer
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

export const ManpowerView: React.FC = () => {
  const { 
    labor, 
    projects, 
    activeProjectId, 
    setActiveProjectId, 
    setActiveTab,
    language, 
    isAdmin, 
    hasPermission, 
    addLaborEntry, 
    deleteLaborEntry 
  } = useProject();
  const t = translations[language];

  // Attendance & Salary Sub-view state
  const [subTab, setSubTab] = useState<'all' | 'attendance' | 'salary'>('all');
  const [activeSlip, setActiveSlip] = useState<LaborEntry | null>(null);

  // Filter states
  const [tradeFilter, setTradeFilter] = useState<string>('all');
  const [shiftFilter, setShiftFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Labor Form State
  const [newProject, setNewProject] = useState<string>(projects[0]?.id || 'proj-01');
  const [newDate, setNewDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newTrade, setNewTrade] = useState<string>('Masons (Raj Mistri)');
  const [newHeadcount, setNewHeadcount] = useState<number>(5);
  const [newHours, setNewHours] = useState<number>(8);
  const [newDailyRate, setNewDailyRate] = useState<number>(2800);
  const [newContractor, setNewContractor] = useState<string>('Bismillah Civil Builders');
  const [newShift, setNewShift] = useState<'day' | 'night' | 'overtime'>('day');
  const [newStatus, setNewStatus] = useState<'present' | 'half_day' | 'overtime'>('present');
  const [newNotes, setNewNotes] = useState<string>('');

  // Filtered Labor
  const filteredLabor = useMemo(() => {
    return labor.filter(entry => {
      const matchProject = activeProjectId === 'all' || entry.projectId === activeProjectId;
      const matchTrade = tradeFilter === 'all' || entry.trade.toLowerCase().includes(tradeFilter.toLowerCase());
      const matchShift = shiftFilter === 'all' || entry.shift === shiftFilter;
      const matchSearch = searchQuery === '' || 
        entry.trade.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.contractor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (entry.notes && entry.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchProject && matchTrade && matchShift && matchSearch;
    });
  }, [labor, activeProjectId, tradeFilter, shiftFilter, searchQuery]);

  // Summary Metrics
  const totalHeadcount = filteredLabor.reduce((sum, item) => sum + item.headcount, 0);
  const totalWageBill = filteredLabor.reduce((sum, item) => sum + (item.totalWage || (item.headcount * item.dailyWageRate)), 0);

  const skilledCount = filteredLabor.filter(item => 
    !item.trade.toLowerCase().includes('helper') && !item.trade.toLowerCase().includes('mazdoor')
  ).reduce((sum, item) => sum + item.headcount, 0);

  const unskilledCount = filteredLabor.filter(item => 
    item.trade.toLowerCase().includes('helper') || item.trade.toLowerCase().includes('mazdoor')
  ).reduce((sum, item) => sum + item.headcount, 0);

  const uniqueContractors = Array.from(new Set(filteredLabor.map(i => i.contractor))).length;

  // RECHARTS DATA PREPARATION
  // 1. Trade Distribution Data
  const tradeMap: Record<string, number> = {};
  filteredLabor.forEach(item => {
    // Simplify trade label
    let key = item.trade.split('(')[0].trim();
    tradeMap[key] = (tradeMap[key] || 0) + item.headcount;
  });
  const tradeChartData = Object.entries(tradeMap).map(([name, value]) => ({ name, value }));

  // 2. Project-wise Labor Allocation
  const projectLaborData = projects.map(p => {
    const pLabor = labor.filter(l => l.projectId === p.id);
    const count = pLabor.reduce((sum, i) => sum + i.headcount, 0);
    const wage = pLabor.reduce((sum, i) => sum + (i.totalWage || (i.headcount * i.dailyWageRate)), 0);
    return {
      name: p.code,
      fullName: language === 'ur' && p.nameUrdu ? p.nameUrdu : p.name,
      workers: count,
      wages: wage
    };
  });

  // 3. Shifts & Attendance Breakdown
  const shiftData = [
    { name: 'Day Shift', value: filteredLabor.filter(l => l.shift === 'day').reduce((s, i) => s + i.headcount, 0) },
    { name: 'Night Shift', value: filteredLabor.filter(l => l.shift === 'night').reduce((s, i) => s + i.headcount, 0) },
    { name: 'Overtime', value: filteredLabor.filter(l => l.shift === 'overtime').reduce((s, i) => s + i.headcount, 0) },
  ].filter(s => s.value > 0);

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

  // Handle Form Submit
  const handleAddLabor = (e: React.FormEvent) => {
    e.preventDefault();
    const calculatedTotalWage = newHeadcount * newDailyRate;
    addLaborEntry({
      projectId: newProject,
      date: newDate,
      trade: newTrade.trim(),
      headcount: Number(newHeadcount) || 1,
      hoursPerDay: Number(newHours) || 8,
      dailyWageRate: Number(newDailyRate) || 0,
      totalWage: calculatedTotalWage,
      contractor: newContractor.trim() || 'Direct Crew',
      shift: newShift,
      status: newStatus,
      notes: newNotes.trim() || undefined
    });
    setIsAddModalOpen(false);
    setNewNotes('');
  };

  // CSV Export
  const exportCsv = () => {
    const headers = ['ID', 'Date', 'Project Code', 'Trade/Craft', 'Headcount', 'Shift', 'Hours', 'Daily Rate (PKR)', 'Total Wage (PKR)', 'Contractor', 'Status', 'Notes'];
    const rows = filteredLabor.map(item => {
      const proj = projects.find(p => p.id === item.projectId);
      return [
        item.id,
        item.date,
        proj?.code || item.projectId,
        `"${item.trade.replace(/"/g, '""')}"`,
        item.headcount,
        item.shift,
        item.hoursPerDay,
        item.dailyWageRate,
        item.totalWage,
        `"${item.contractor.replace(/"/g, '""')}"`,
        item.status,
        `"${(item.notes || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `alasad_manpower_muster_roll_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header with Title and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-950/60 via-slate-900 to-slate-900 p-5 rounded-2xl border border-blue-900/30 shadow-xl">
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => setActiveTab('home')}
            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer shrink-0"
            title={language === 'ur' ? 'تمام ٹیبس پر واپس جائیں' : 'Back to All Modules Hub'}
          >
            <ArrowLeft className="w-5 h-5 text-blue-400" />
          </button>

          <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-inner shrink-0">
            <Users className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>{language === 'ur' ? 'افرادی قوت — حاضری و تنخواہ' : 'Manpower Attendance & Salary'}</span>
              <span className="px-2 py-0.5 text-xs font-mono bg-blue-900/50 text-blue-300 rounded border border-blue-800">
                {totalHeadcount} {language === 'ur' ? 'مزدور' : 'Workers'}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              {language === 'ur' 
                ? 'روزانہ لیبر حاضری مسٹر رول، ہنر مند کاریگر، یومیہ اجرت و تنخواہ کی ادائیگی' 
                : 'Daily workforce muster roll, trade allocation, biometric headcounts, and daily wage & salary liabilities'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Sub-tabs switch */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setSubTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                subTab === 'all' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {language === 'ur' ? 'مکمل جائزہ' : 'Overview'}
            </button>
            <button
              onClick={() => setSubTab('attendance')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                subTab === 'attendance' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {language === 'ur' ? 'حاضری مسٹر رول' : 'Attendance Roll'}
            </button>
            <button
              onClick={() => setSubTab('salary')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                subTab === 'salary' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {language === 'ur' ? 'تنخواہ و اجرت' : 'Salary & Wages'}
            </button>
          </div>

          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition cursor-pointer shadow-sm"
            title="Download CSV"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">{language === 'ur' ? 'ایکسپورٹ CSV' : 'Export CSV'}</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 border border-blue-400/30 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ur' ? '+ حاضری درج کریں' : '+ Log Attendance / Crew'}</span>
          </button>
        </div>
      </div>

      {/* SUMMARY KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Workers Today */}
        <div className="bg-slate-900/90 border border-blue-900/30 rounded-xl p-4 shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">
              {language === 'ur' ? 'کل افرادی قوت' : 'Total Workforce On-Site'}
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-white">{totalHeadcount}</span>
              <span className="text-xs text-blue-400 font-mono">Present</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Across active job sites</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Skilled Craftsmen */}
        <div className="bg-slate-900/90 border border-emerald-900/30 rounded-xl p-4 shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">
              {language === 'ur' ? 'ہنر مند کاریگر (مستری/لوہار)' : 'Skilled Craftsmen'}
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-emerald-400">{skilledCount}</span>
              <span className="text-xs text-emerald-500/80 font-mono">
                {totalHeadcount > 0 ? Math.round((skilledCount / totalHeadcount) * 100) : 0}%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Masons, Steel, Shuttering</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <HardHat className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Helpers & General Labor */}
        <div className="bg-slate-900/90 border border-amber-900/30 rounded-xl p-4 shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">
              {language === 'ur' ? 'مزدور و ہیلپرز' : 'General Labor & Helpers'}
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-amber-400">{unskilledCount}</span>
              <span className="text-xs text-amber-500/80 font-mono">
                {totalHeadcount > 0 ? Math.round((unskilledCount / totalHeadcount) * 100) : 0}%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Material handling & support</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Daily Wage Outflow */}
        <div className="bg-slate-900/90 border border-indigo-900/30 rounded-xl p-4 shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">
              {language === 'ur' ? 'روزانہ اجرت بل (تخمینہ)' : 'Estimated Daily Wage Bill'}
            </p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl sm:text-2xl font-bold text-indigo-300">
                {formatCurrency(totalWageBill, language)}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">{uniqueContractors} Subcontractor crews</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Trade-Wise Labor Distribution (Donut Chart) */}
        <div className="bg-slate-900/90 border border-blue-900/30 rounded-2xl p-5 shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-400" />
                <span>{language === 'ur' ? 'شعبہ وار افرادی تقسیم' : 'Trade & Skill Distribution'}</span>
              </h2>
              <p className="text-[11px] text-slate-400">Headcount by craft and role</p>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {tradeChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tradeChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {tradeChartData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.75rem', color: '#f8fafc', fontSize: '12px' }}
                    formatter={(value: any) => [`${value} Workers`, 'Crew Size']}
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
              <div className="text-center text-slate-500 text-xs">No manpower records available</div>
            )}
          </div>
        </div>

        {/* Chart 2: Project-wise Crew Allocation (Bar Chart) */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-blue-900/30 rounded-2xl p-5 shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>{language === 'ur' ? 'پروجیکٹ کے لحاظ سے مزدوروں کی تقسیم' : 'Workforce Deployment by Project'}</span>
              </h2>
              <p className="text-[11px] text-slate-400">Total labor count and daily wage obligation</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
              Live Sites
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectLaborData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.75rem', color: '#f8fafc', fontSize: '12px' }}
                  formatter={(value: any, name: any) => [
                    name === 'workers' ? `${value} Workers` : `PKR ${Number(value).toLocaleString()}`,
                    name === 'workers' ? 'Workforce' : 'Daily Wage Bill'
                  ]}
                />
                <Bar dataKey="workers" name="workers" fill="#3b82f6" radius={[4, 4, 0, 0]} />
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

          {/* Shift Filter */}
          <select
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Shifts</option>
            <option value="day">Day Shift</option>
            <option value="night">Night Shift</option>
            <option value="overtime">Overtime</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={language === 'ur' ? 'ٹھیکیدار، ہنر یا تفصیل تلاش کریں...' : 'Search craft, contractor, notes...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* MUSTER ROLL TABLE */}
      <div className="bg-slate-900/90 border border-blue-900/30 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white">
              {language === 'ur' ? 'روزانہ لیبر مسٹر رول لسٹ' : 'Daily Labor Muster Roll Ledger'}
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Showing {filteredLabor.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-4">Trade / Craft</th>
                <th className="py-3 px-4 text-center">Headcount</th>
                <th className="py-3 px-4">Shift & Hours</th>
                <th className="py-3 px-4 text-right">Daily Rate (PKR)</th>
                <th className="py-3 px-4 text-right">Total Wage (PKR)</th>
                <th className="py-3 px-4">Contractor / Jamadar</th>
                <th className="py-3 px-4">Notes</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLabor.length > 0 ? (
                filteredLabor.map((item) => {
                  const proj = projects.find(p => p.id === item.projectId);
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                        {item.date}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800">
                          {proj?.code || item.projectId}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-white whitespace-nowrap">
                        {item.trade}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-900/40 text-blue-300 border border-blue-700/50">
                          {item.headcount}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] uppercase font-mono mr-1.5 ${
                          item.shift === 'night' 
                            ? 'bg-purple-950 text-purple-300 border border-purple-800' 
                            : item.shift === 'overtime'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {item.shift}
                        </span>
                        <span className="text-slate-400">{item.hoursPerDay} hrs</span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-300 whitespace-nowrap">
                        {item.dailyWageRate.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-400 whitespace-nowrap">
                        {(item.totalWage || (item.headcount * item.dailyWageRate)).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                        {item.contractor}
                      </td>
                      <td className="py-3 px-4 text-slate-400 max-w-xs truncate" title={item.notes}>
                        {item.notes || '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setActiveSlip(item)}
                            className="p-1 rounded text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 transition cursor-pointer"
                            title={language === 'ur' ? 'تنخواہ پرچی دیکھیں' : 'View Wage Slip'}
                          >
                            <Receipt className="w-3.5 h-3.5" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => deleteLaborEntry(item.id)}
                              className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition cursor-pointer"
                              title="Delete Entry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500">
                    No workforce records found for this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD LABOR ENTRY MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-slate-900 border border-blue-800/40 rounded-2xl w-full max-w-lg shadow-2xl p-6 text-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HardHat className="w-5 h-5 text-blue-400" />
                <span>{language === 'ur' ? 'لیبر انٹری درج کریں' : 'Log Daily Labor Roster'}</span>
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddLabor} className="space-y-4 pt-4 text-xs">
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

              <div>
                <label className="block text-slate-400 mb-1">Trade / Craft</label>
                <select
                  value={newTrade}
                  onChange={(e) => setNewTrade(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Masons (Raj Mistri)">Masons (Raj Mistri)</option>
                  <option value="Shuttering Carpenters">Shuttering Carpenters</option>
                  <option value="Steel Fixers (Bar Benders)">Steel Fixers (Bar Benders)</option>
                  <option value="Tile & Marble Masons">Tile & Marble Masons</option>
                  <option value="Painters & Wall Polishers">Painters & Wall Polishers</option>
                  <option value="Electricians & Conduit Installers">Electricians & Conduit Installers</option>
                  <option value="Plumbers & Pipe Fitters">Plumbers & Pipe Fitters</option>
                  <option value="Heavy Equipment Operators">Heavy Equipment Operators</option>
                  <option value="General Labor & Helpers (Mazdoor)">General Labor & Helpers (Mazdoor)</option>
                  <option value="Surveyors & Total Station Team">Surveyors & Total Station Team</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Workers Count</label>
                  <input
                    type="number"
                    min="1"
                    value={newHeadcount}
                    onChange={(e) => setNewHeadcount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Daily Wage / Person (PKR)</label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={newDailyRate}
                    onChange={(e) => setNewDailyRate(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Shift</label>
                  <select
                    value={newShift}
                    onChange={(e) => setNewShift(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="day">Day Shift</option>
                    <option value="night">Night Shift</option>
                    <option value="overtime">Overtime</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-blue-950/40 rounded-xl border border-blue-900/40 flex items-center justify-between">
                <span className="text-slate-300">Total Calculated Daily Wage:</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">
                  PKR {(newHeadcount * newDailyRate).toLocaleString()}
                </span>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Contractor / Jamadar Name</label>
                <input
                  type="text"
                  placeholder="e.g. Bismillah Civil Contractors"
                  value={newContractor}
                  onChange={(e) => setNewContractor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Site Activity / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Activity description, grid location, concrete pour details..."
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
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* OFFICIAL WAGE & SALARY SLIP MODAL */}
      {activeSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-slate-900 border border-emerald-600/40 rounded-2xl w-full max-w-md shadow-2xl p-6 text-slate-100">
            {/* Slip Header */}
            <div className="text-center pb-4 border-b border-slate-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
                {language === 'ur' ? 'الاسد کنسٹرکٹرز — لیبر اجرت و حاضری پرچی' : 'Al Asad Constructors — Daily Wage & Attendance Slip'}
              </span>
              <h3 className="text-lg font-extrabold text-white mt-1">
                {activeSlip.trade}
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                SLIP REF: AAC-PAY-{activeSlip.id.slice(-6)} · {activeSlip.date}
              </p>
            </div>

            {/* Slip Details Grid */}
            <div className="space-y-3 py-4 text-xs font-mono">
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">{language === 'ur' ? 'پروجیکٹ:' : 'Project Site:'}</span>
                <span className="font-bold text-white">
                  {projects.find(p => p.id === activeSlip.projectId)?.code || activeSlip.projectId}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">{language === 'ur' ? 'ٹھیکیدار / جمعدار:' : 'Contractor / Lead:'}</span>
                <span className="font-semibold text-slate-200">{activeSlip.contractor}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">{language === 'ur' ? 'حاضری تعداد:' : 'Present Headcount:'}</span>
                <span className="font-bold text-blue-400">{activeSlip.headcount} Workers</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">{language === 'ur' ? 'شفٹ و اوقات:' : 'Shift / Hours:'}</span>
                <span className="text-slate-200 uppercase">{activeSlip.shift} · {activeSlip.hoursPerDay} hrs</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">{language === 'ur' ? 'یومیہ ریٹ فی مزدور:' : 'Daily Rate per Head:'}</span>
                <span className="text-slate-200">PKR {activeSlip.dailyWageRate.toLocaleString()}</span>
              </div>

              <div className="flex justify-between py-2.5 bg-emerald-950/40 px-3 rounded-xl border border-emerald-700/50">
                <span className="font-bold text-emerald-300 text-sm">
                  {language === 'ur' ? 'کل واجب الادا اجرت:' : 'Total Net Wage Payable:'}
                </span>
                <span className="font-bold text-emerald-300 text-base">
                  PKR {(activeSlip.totalWage || (activeSlip.headcount * activeSlip.dailyWageRate)).toLocaleString()}
                </span>
              </div>

              {activeSlip.notes && (
                <div className="p-2.5 bg-slate-950 rounded-lg text-[11px] text-slate-400 border border-slate-800">
                  <span className="text-slate-500 block mb-0.5 font-bold">Site Activity / Notes:</span>
                  {activeSlip.notes}
                </div>
              )}
            </div>

            {/* Signature acknowledgements */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-[10px] text-slate-500 font-mono">
              <div className="text-center pt-4 border-t border-dashed border-slate-700">
                Site Resident Engineer
              </div>
              <div className="text-center pt-4 border-t border-dashed border-slate-700">
                Jamadar Signature
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-4 mt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveSlip(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs text-slate-300 cursor-pointer"
              >
                {language === 'ur' ? 'بند کریں' : 'Close'}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{language === 'ur' ? 'پرنٹ سلپ' : 'Print Slip'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
