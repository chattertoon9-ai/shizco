import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { ActiveTab } from '../types';
import { 
  Users, 
  FileText, 
  Briefcase, 
  Kanban, 
  Wallet, 
  ClipboardList, 
  Package, 
  CalendarRange, 
  AlertCircle, 
  BarChart3, 
  ShieldCheck, 
  Github, 
  ArrowRight, 
  Sparkles, 
  Building2, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  HardHat, 
  Scale, 
  LogOut,
  Search,
  Filter,
  Layers,
  Activity,
  FileSpreadsheet
} from 'lucide-react';
import { formatCurrency } from '../utils/translations';

interface ModuleItem {
  id: ActiveTab;
  titleEn: string;
  titleUr: string;
  badgeEn: string;
  badgeUr: string;
  descriptionEn: string;
  descriptionUr: string;
  icon: React.ElementType;
  gradient: string;
  borderColor: string;
  statLabelEn: string;
  statLabelUr: string;
  statValue: string | number;
  highlight?: boolean;
}

export const ModulesPortalView: React.FC = () => {
  const { 
    setActiveTab, 
    language, 
    projects, 
    tasks, 
    labor, 
    taxInvoices, 
    rfqs, 
    accounts, 
    materials, 
    snags, 
    dailyLogs,
    currentUser,
    logout,
    activeProjectId,
    setActiveProjectId
  } = useProject();

  const [searchQuery, setSearchQuery] = useState('');

  // Live aggregated stats
  const totalLaborHeadcount = labor.reduce((sum, item) => sum + item.headcount, 0);
  const totalWageLiabilities = labor.reduce((sum, item) => sum + (item.totalWage || (item.headcount * item.dailyWageRate)), 0);
  const totalTasksCount = tasks.length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const activeRfqsCount = rfqs.filter(r => r.status === 'open' || r.status === 'evaluation').length;
  const totalInvoicesCount = taxInvoices.length;
  const openSnags = snags.filter(s => s.status !== 'resolved').length;

  const modules: ModuleItem[] = [
    {
      id: 'manpower',
      titleEn: 'Manpower Attendance & Salary',
      titleUr: 'حاضری، افرادی قوت و تنخواہ',
      badgeEn: 'Daily Muster Roll & Payroll',
      badgeUr: 'حاضری مسٹر رول و اجرت',
      descriptionEn: 'Site workforce daily attendance muster roll, mason & labor headcounts, overtime tracking, and daily wage & salary calculations.',
      descriptionUr: 'سائٹ پر مزدوروں و مستریوں کی روزانہ حاضری، اوور ٹائم ٹریکنگ، روزانہ اجرت و تنخواہ کا حساب اور ادائیگی پرچی۔',
      icon: HardHat,
      gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
      borderColor: 'border-amber-500/40 hover:border-amber-400',
      statLabelEn: 'Active Workforce',
      statLabelUr: 'فعال مزدور',
      statValue: `${totalLaborHeadcount} Personnel`,
      highlight: true
    },
    {
      id: 'tax_compliance',
      titleEn: 'Invoices & RFQ (FBR / SRB)',
      titleUr: 'انوائسز اور آر ایف کیو (FBR/SRB)',
      badgeEn: 'Tax Invoices & Tenders',
      badgeUr: 'سیلز ٹیکس انوائسز و ٹینڈر',
      descriptionEn: 'Client & subcontractor tax invoices with 18% FBR GST & 13% SRB SST, Section 153 WHT calculations, and vendor RFQ tendering with quotation comparison.',
      descriptionUr: 'سرکاری و نجی سیلز ٹیکس انوائسز مع 18% FBR جی ایس ٹی اور 13% SRB سروس ٹیکس، ودہولڈنگ ٹیکس اور وینڈر کوٹیشن موازنہ۔',
      icon: Scale,
      gradient: 'from-blue-600/20 via-indigo-600/10 to-transparent',
      borderColor: 'border-blue-500/40 hover:border-blue-400',
      statLabelEn: 'Invoices & Tenders',
      statLabelUr: 'انوائسز و ٹینڈرز',
      statValue: `${totalInvoicesCount} Invoices · ${activeRfqsCount} RFQs`,
      highlight: true
    },
    {
      id: 'projects',
      titleEn: 'Projects Management',
      titleUr: 'پروجیکٹس مینجمنٹ',
      badgeEn: 'Civil Sites Portfolio',
      badgeUr: 'تعمیراتی سائٹس پورٹ فولیو',
      descriptionEn: 'Multi-site construction lifecycle management, contract details, client records, and real-time site progression across Pakistan.',
      descriptionUr: 'تمام تعمیراتی سائٹس کی مکمل تفصیلات، فیز کی پیش رفت، کلائنٹ معاہدات اور لوکیشن پر مبنی پروگریس مانیٹرنگ۔',
      icon: Briefcase,
      gradient: 'from-blue-500/20 via-cyan-500/10 to-transparent',
      borderColor: 'border-blue-500/30 hover:border-blue-400',
      statLabelEn: 'Active Sites',
      statLabelUr: 'فعال سائٹس',
      statValue: `${projects.length} Construction Sites`
    },
    {
      id: 'tasks',
      titleEn: 'Tasks & Milestone Board',
      titleUr: 'ٹاسکس و کام کی پیش رفت',
      badgeEn: 'Execution Kanban',
      badgeUr: 'کانبان بورڈ و چیک لسٹ',
      descriptionEn: 'Structural, MEP, and finishing work breakdown, sub-contractor trade assignment, completion percentages, and milestone checklists.',
      descriptionUr: 'سول اسٹرکچر، پلمبنگ، الیکٹریکل اور فنشنگ کاموں کی تقسیم، ٹھیکیداروں کی نگرانی اور مرحلہ وار تکمیل۔',
      icon: Kanban,
      gradient: 'from-indigo-500/20 via-purple-500/10 to-transparent',
      borderColor: 'border-indigo-500/30 hover:border-indigo-400',
      statLabelEn: 'Tasks In Progress',
      statLabelUr: 'جاری کام',
      statValue: `${inProgressTasks} Active of ${totalTasksCount}`
    },
    {
      id: 'accounts',
      titleEn: 'Accounts & Expense Ledger',
      titleUr: 'اکاؤنٹس و کیش لیجر',
      badgeEn: 'Cash Flow & Vouchers',
      badgeUr: 'مالیات و اخراجات کیش',
      descriptionEn: 'Comprehensive site financial ledger, vendor disbursements, petty cash vouchers, and bank payment clearances.',
      descriptionUr: 'سائٹ کے تمام یومیہ اخراجات، وینڈر ادائیگیاں، پیٹی کیش واؤچرز اور بینک ریکارڈز کی شفاف تفصیل۔',
      icon: Wallet,
      gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
      borderColor: 'border-emerald-500/30 hover:border-emerald-400',
      statLabelEn: 'Disbursements',
      statLabelUr: 'کل اخراجات',
      statValue: `${accounts.length} Vouchers Recorded`
    },
    {
      id: 'daily_logs',
      titleEn: 'Daily Site Log (Roznamcha)',
      titleUr: 'روزنامچہ سائٹ رپورٹ',
      badgeEn: 'Supervisor Field Diary',
      badgeUr: 'سپروائزر یومیہ ڈائری',
      descriptionEn: 'Daily site supervisor logs, weather impact tracking, equipment deployment, safety observations, and work progress summaries.',
      descriptionUr: 'سائٹ سپروائزر کی روزانہ ڈائری، موسمی اثرات، مشینری کا استعمال اور کوالٹی و حفاظتی مشاہدات۔',
      icon: ClipboardList,
      gradient: 'from-teal-500/20 via-emerald-500/10 to-transparent',
      borderColor: 'border-teal-500/30 hover:border-teal-400',
      statLabelEn: 'Logged Entries',
      statLabelUr: 'درج رپورٹس',
      statValue: `${dailyLogs.length} Site Reports Filed`
    },
    {
      id: 'materials',
      titleEn: 'Materials & Stock Inventory',
      titleUr: 'میٹریل و اسٹاک لیجر',
      badgeEn: 'Rebar, Cement & Aggregates',
      badgeUr: 'سریا، سیمنٹ، ریت و بجری',
      descriptionEn: 'Deformed steel bar weight receipts, cement bag usage, aggregate dispatch, supplier records, and inventory burn tracking.',
      descriptionUr: 'سائٹ پر سریا، سیمنٹ بوریوں، اینٹوں اور ریت بجری کی ترسیل، استعمال اور بقایا اسٹاک کی لمحہ بہ لمحہ مانیٹرنگ۔',
      icon: Package,
      gradient: 'from-orange-500/20 via-amber-500/10 to-transparent',
      borderColor: 'border-orange-500/30 hover:border-orange-400',
      statLabelEn: 'Inventory Items',
      statLabelUr: 'میٹریل آئٹمز',
      statValue: `${materials.length} Material Receipts`
    },
    {
      id: 'gantt',
      titleEn: 'Timeline & Gantt Schedule',
      titleUr: 'ٹائم لائن و شیڈول (Gantt)',
      badgeEn: 'Critical Path Planning',
      badgeUr: 'کرٹیکل پاتھ و شیڈول',
      descriptionEn: 'Interactive timeline charts, project phases (Excavation, Foundation, Structure, MEP, Handover), and deadline milestones.',
      descriptionUr: 'منصوبہ بندی کے تمام مراحل، ڈیڈلائنز، تاخیر کے الرٹس اور کرٹیکل پاتھ کا بصری جائزہ۔',
      icon: CalendarRange,
      gradient: 'from-purple-500/20 via-pink-500/10 to-transparent',
      borderColor: 'border-purple-500/30 hover:border-purple-400',
      statLabelEn: 'Timeline Span',
      statLabelUr: 'شیڈول فیزز',
      statValue: '7 Construction Phases'
    },
    {
      id: 'snags',
      titleEn: 'Quality Snags & Punchlist',
      titleUr: 'کوالٹی نقائص و پنچ لسٹ',
      badgeEn: 'QA/QC Inspections',
      badgeUr: 'کوالٹی معائنہ و نقائص',
      descriptionEn: 'Site snag identification, architectural and structural defect punchlists, severity tagging, and contractor resolution signoffs.',
      descriptionUr: 'سائٹ پر تعمیراتی نقائص کی نشاندہی، سنگین مسائل کی درجہ بندی اور حل کی تصدیقی منظوری۔',
      icon: AlertCircle,
      gradient: 'from-rose-500/20 via-red-500/10 to-transparent',
      borderColor: 'border-rose-500/30 hover:border-rose-400',
      statLabelEn: 'Open Snags',
      statLabelUr: 'زیرِ حل نقائص',
      statValue: `${openSnags} Pending Issues`
    },
    {
      id: 'overview',
      titleEn: 'Executive Overview & PDF Report',
      titleUr: 'ایگزیکٹو ڈیش بورڈ و پی ڈی ایف رپورٹ',
      badgeEn: 'Full Analytics & jsPDF Export',
      badgeUr: 'تجزیاتی رپورٹس و پی ڈی ایف',
      descriptionEn: 'Executive KPI charts, man-hour burndowns, project health metrics, recent team audit trail, and instant formal jsPDF project report export.',
      descriptionUr: 'اعلیٰ انتظامیہ کے لیے مکمل مالی و تعمیراتی چارٹس، مٹیریل استعمال کی سمری اور ون کلک پی ڈی ایف پروجیکٹ رپورٹ۔',
      icon: BarChart3,
      gradient: 'from-cyan-500/20 via-blue-500/10 to-transparent',
      borderColor: 'border-cyan-500/30 hover:border-cyan-400',
      statLabelEn: 'Project Telemetry',
      statLabelUr: 'مکمل رپورٹنگ',
      statValue: 'Live Telemetry & Export'
    },
    {
      id: 'users',
      titleEn: 'User Management & Security',
      titleUr: 'صارفین، رولز و سیکیورٹی',
      badgeEn: 'Role-Based Access Control',
      badgeUr: 'صارفین کی رسائی و اختیارات',
      descriptionEn: 'Manage resident engineers, project managers, accountants, and site supervisors with strict role permissions and security audit.',
      descriptionUr: 'پروجیکٹ مینیجرز، انجینئرز اور اکاؤنٹنٹس کے لاگ ان اکاؤنٹس، اختیارات اور حفاظتی سیٹنگز کا انتظام۔',
      icon: ShieldCheck,
      gradient: 'from-blue-600/20 via-slate-700/20 to-transparent',
      borderColor: 'border-blue-600/30 hover:border-blue-400',
      statLabelEn: 'Access Control',
      statLabelUr: 'سیکیورٹی پروفائلز',
      statValue: 'Admin & Role Permissions'
    },
    {
      id: 'github_guide',
      titleEn: 'GitHub & Deployment Guide',
      titleUr: 'گٹ ہب اور ڈیپلائمنٹ گائیڈ',
      badgeEn: 'Architecture & DevOps',
      badgeUr: 'آرکیٹیکچر و ہدایات',
      descriptionEn: 'Complete documentation for cloning, running locally, configuring environment variables, and production deployment.',
      descriptionUr: 'سسٹم کو گٹ ہب سے کلون کرنے، لوکل سرور چلانے اور کلاؤڈ پر ڈیپلائی کرنے کی مرحلہ وار گائیڈ۔',
      icon: Github,
      gradient: 'from-slate-700/30 via-slate-800/30 to-transparent',
      borderColor: 'border-slate-700 hover:border-slate-500',
      statLabelEn: 'Documentation',
      statLabelUr: 'تکنیکی دستاویزات',
      statValue: 'Full Setup Docs'
    }
  ];

  const filteredModules = modules.filter(m => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.titleEn.toLowerCase().includes(q) ||
      m.titleUr.includes(q) ||
      m.badgeEn.toLowerCase().includes(q) ||
      m.badgeUr.includes(q) ||
      m.descriptionEn.toLowerCase().includes(q) ||
      m.descriptionUr.includes(q)
    );
  });

  return (
    <div className="space-y-8 pb-16 animate-fadeIn">
      {/* Executive Welcome & Top Command Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 border border-blue-900/40 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/40">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                {language === 'ur' ? 'مرکزی پورٹل برائے تمام ٹیبس' : 'System Operations Portal — All Tabs'}
              </span>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs text-slate-300 font-medium">
                {language === 'ur' ? `خوش آمدید: ${currentUser?.name || 'صارف'}` : `Welcome: ${currentUser?.name || 'User'}`}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-800 text-blue-300 border border-slate-700">
                {currentUser?.role || 'authorized'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              {language === 'ur' 
                ? 'الاسد کنسٹرکٹرز — سسٹم موڈیولز و ٹیبس ڈیش بورڈ' 
                : 'Al Asad Constructors — Modules & Tabs Command Hub'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              {language === 'ur'
                ? 'لاگ ان کے بعد سسٹم کے تمام بنیادی ٹیبس درج ذیل ہیں۔ مطلوبہ ٹیب پر کلک کر کے فوری کام شروع کریں:'
                : 'Direct central launchpad for all core construction tracking systems. Select any module tab below to begin operation:'}
            </p>
          </div>

          {/* Quick Site Filter & Direct Logout */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <select
              value={activeProjectId}
              onChange={(e) => setActiveProjectId(e.target.value)}
              className="bg-slate-900/90 border border-blue-800/50 text-slate-200 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all cursor-pointer font-medium shadow-inner"
            >
              <option value="all">{language === 'ur' ? 'تمام پروجیکٹ سائٹس (All Sites)' : 'All Active Sites'}</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.code} - {language === 'ur' && p.nameUrdu ? p.nameUrdu : p.name}
                </option>
              ))}
            </select>

            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-sm"
              title={language === 'ur' ? 'لاگ آؤٹ' : 'Log Out'}
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>{language === 'ur' ? 'لاگ آؤٹ' : 'Log Out'}</span>
            </button>
          </div>
        </div>

        {/* Quick Horizontal Tab Bar: Click any tab to open immediately! */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              {language === 'ur' ? 'فوری ٹیب سلیکٹر (Quick Tab Navigation):' : 'Instant Tab Switcher — Click Any Tab to Open:'}
            </span>
            <span className="text-xs text-slate-400">
              {filteredModules.length} {language === 'ur' ? 'ٹیبس دستیاب' : 'Modules Available'}
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {modules.map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => setActiveTab(m.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
                    m.highlight 
                      ? 'bg-blue-600/20 hover:bg-blue-600/40 text-blue-200 border-blue-500/50 hover:border-blue-400' 
                      : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${m.highlight ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span>{language === 'ur' ? m.titleUr : m.titleEn}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={language === 'ur' ? 'کوئی بھی موڈیول یا ٹیب تلاش کریں...' : 'Search any tab or module...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="font-mono">{language === 'ur' ? 'سسٹم ورژن:' : 'System:'}</span>
          <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-mono border border-blue-800">
            Al Asad v3.4 Enterprise
          </span>
        </div>
      </div>

      {/* Grid of All Module Cards / Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredModules.map((module) => {
          const Icon = module.icon;
          return (
            <div
              key={module.id}
              onClick={() => setActiveTab(module.id)}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border ${module.borderColor} p-6 shadow-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-950/30 cursor-pointer`}
            >
              {/* Highlight badge for newly requested core tabs */}
              {module.highlight && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-blue-600 to-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-md uppercase tracking-wider font-mono">
                  {language === 'ur' ? 'اہم ٹیب' : 'Core Module'}
                </div>
              )}

              {/* Top Row: Icon + Badge */}
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-md">
                    <Icon className="w-6 h-6 transition-colors" />
                  </div>

                  <span className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700/60">
                    {language === 'ur' ? module.badgeUr : module.badgeEn}
                  </span>
                </div>

                {/* Title & Description */}
                <h2 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors flex items-center gap-2">
                  <span>{language === 'ur' ? module.titleUr : module.titleEn}</span>
                </h2>

                <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-3">
                  {language === 'ur' ? module.descriptionUr : module.descriptionEn}
                </p>
              </div>

              {/* Bottom Row: Stat & Direct Open CTA */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-mono text-slate-500">
                    {language === 'ur' ? module.statLabelUr : module.statLabelEn}
                  </span>
                  <span className="text-xs font-bold text-slate-200 font-mono mt-0.5">
                    {module.statValue}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600/20 group-hover:bg-blue-600 text-blue-300 group-hover:text-white border border-blue-500/40 text-xs font-bold transition-all shadow-sm">
                  <span>{language === 'ur' ? 'ٹیب کھولیں' : 'Open Tab'}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Corporate Compliance & Security Footnote */}
      <div className="text-center pt-8 border-t border-slate-900 text-xs text-slate-500 font-mono">
        <p>Al Asad Constructors (Pvt) Ltd · Integrated Site Operations Management System</p>
        <p className="mt-1 text-slate-600">copyright @ 2026, ShizCon · All Rights Reserved</p>
      </div>
    </div>
  );
};
