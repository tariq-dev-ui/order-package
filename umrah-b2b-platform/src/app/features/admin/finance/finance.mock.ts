import {
  AccountRoutingRule,
  FinanceAccount,
  FinancePageKind,
  FinancePageMeta,
  FinanceWallet,
  FinancialReportTile,
  FiscalYear,
  JournalEntry,
  OpeningBalanceRow,
  CostCenter,
} from './finance.models';

export const FINANCE_PAGE_META: Record<FinancePageKind, FinancePageMeta> = {
  chart: {
    kind: 'chart',
    title: 'الشجرة المحاسبية',
    eyebrow: 'Chart of Accounts',
    description: 'هيكل الحسابات الرئيسي مع الأرصدة والحالة لكل مستوى محاسبي.',
    icon: 'account_tree',
  },
  'fiscal-year': {
    kind: 'fiscal-year',
    title: 'السنة المالية',
    eyebrow: 'Fiscal Year',
    description: 'إدارة السنوات المالية وحالات الإقفال وعدد القيود المرتبطة.',
    icon: 'calendar_month',
  },
  'journal-entries': {
    kind: 'journal-entries',
    title: 'القيود المحاسبية',
    eyebrow: 'Journal Entries',
    description: 'قائمة القيود اليومية مع حالة الترحيل وتوازن المدين والدائن.',
    icon: 'receipt_long',
  },
  'account-statement': {
    kind: 'account-statement',
    title: 'كشف الحساب',
    eyebrow: 'Account Statement',
    description: 'حركة الحساب المختار مع الرصيد الجاري لكل عملية.',
    icon: 'description',
  },
  'trial-balance': {
    kind: 'trial-balance',
    title: 'ميزان المراجعة',
    eyebrow: 'Trial Balance',
    description: 'ملخص أرصدة افتتاحية وحركة الفترة وأرصدة الإقفال.',
    icon: 'balance',
  },
  'opening-balance': {
    kind: 'opening-balance',
    title: 'الرصيد الافتتاحي',
    eyebrow: 'Opening Balance',
    description: 'نموذج أرصدة افتتاحية محلي للحسابات التشغيلية.',
    icon: 'account_balance_wallet',
  },
  wallets: {
    kind: 'wallets',
    title: 'الحسابات والمحافظ',
    eyebrow: 'Cash / Wallets',
    description: 'الصناديق والحسابات البنكية وطرق الدفع المستخدمة مالياً.',
    icon: 'account_balance',
  },
  'account-routing': {
    kind: 'account-routing',
    title: 'توجيه الحسابات',
    eyebrow: 'Account Routing',
    description: 'ربط العمليات التشغيلية بحسابات المدين والدائن الافتراضية.',
    icon: 'alt_route',
  },
  'income-statement': {
    kind: 'income-statement',
    title: 'قائمة الدخل',
    eyebrow: 'Income Statement',
    description: 'إيرادات ومصروفات الفترة وصافي الدخل من بيانات محلية.',
    icon: 'trending_up',
  },
  'cost-centers': {
    kind: 'cost-centers',
    title: 'مراكز التكلفة',
    eyebrow: 'Cost Centers',
    description: 'مراكز تكلفة تشغيلية مع الميزانية والمصروف الفعلي.',
    icon: 'hub',
  },
  'financial-reports': {
    kind: 'financial-reports',
    title: 'التقارير المالية',
    eyebrow: 'Financial Reports',
    description: 'واجهات التقارير المالية المتاحة للإدارة والتحليل.',
    icon: 'summarize',
  },
};

export const FINANCE_ACCOUNTS: FinanceAccount[] = [
  { id: 'acc-1000', code: '1000', name: 'الأصول', type: 'asset', nature: 'debit', level: 0, balance: 1840000, isActive: true },
  { id: 'acc-1100', code: '1100', name: 'الأصول المتداولة', type: 'asset', nature: 'debit', level: 1, parentCode: '1000', balance: 970000, isActive: true },
  { id: 'acc-1111', code: '1111', name: 'الصندوق الرئيسي', type: 'asset', nature: 'debit', level: 2, parentCode: '1100', balance: 185000, isActive: true },
  { id: 'acc-1112', code: '1112', name: 'صندوق الاستقبال', type: 'asset', nature: 'debit', level: 2, parentCode: '1100', balance: 62000, isActive: true },
  { id: 'acc-1120', code: '1120', name: 'البنوك', type: 'asset', nature: 'debit', level: 2, parentCode: '1100', balance: 625000, isActive: true },
  { id: 'acc-1121', code: '1121', name: 'البنك الأهلي - حساب جاري', type: 'asset', nature: 'debit', level: 3, parentCode: '1120', balance: 395000, isActive: true },
  { id: 'acc-1122', code: '1122', name: 'بنك الراجحي - حساب توفير', type: 'asset', nature: 'debit', level: 3, parentCode: '1120', balance: 230000, isActive: true },
  { id: 'acc-1130', code: '1130', name: 'الذمم المدينة', type: 'asset', nature: 'debit', level: 2, parentCode: '1100', balance: 98000, isActive: true },
  { id: 'acc-2000', code: '2000', name: 'الالتزامات', type: 'liability', nature: 'credit', level: 0, balance: 510000, isActive: true },
  { id: 'acc-2100', code: '2100', name: 'الذمم الدائنة', type: 'liability', nature: 'credit', level: 1, parentCode: '2000', balance: 245000, isActive: true },
  { id: 'acc-2200', code: '2200', name: 'ضريبة القيمة المضافة المستحقة', type: 'liability', nature: 'credit', level: 1, parentCode: '2000', balance: 68000, isActive: true },
  { id: 'acc-3000', code: '3000', name: 'حقوق الملكية', type: 'equity', nature: 'credit', level: 0, balance: 1330000, isActive: true },
  { id: 'acc-4000', code: '4000', name: 'الإيرادات', type: 'revenue', nature: 'credit', level: 0, balance: 720000, isActive: true },
  { id: 'acc-4100', code: '4100', name: 'إيرادات الباقات', type: 'revenue', nature: 'credit', level: 1, parentCode: '4000', balance: 510000, isActive: true },
  { id: 'acc-4200', code: '4200', name: 'إيرادات الخدمات', type: 'revenue', nature: 'credit', level: 1, parentCode: '4000', balance: 210000, isActive: true },
  { id: 'acc-5000', code: '5000', name: 'المصروفات', type: 'expense', nature: 'debit', level: 0, balance: 318000, isActive: true },
  { id: 'acc-5100', code: '5100', name: 'مصروفات التشغيل', type: 'expense', nature: 'debit', level: 1, parentCode: '5000', balance: 176000, isActive: true },
  { id: 'acc-5200', code: '5200', name: 'مصروفات النقل', type: 'expense', nature: 'debit', level: 1, parentCode: '5000', balance: 82000, isActive: true },
  { id: 'acc-5300', code: '5300', name: 'مصروفات البنك', type: 'expense', nature: 'debit', level: 1, parentCode: '5000', balance: 15000, isActive: true },
  { id: 'acc-5400', code: '5400', name: 'مصروفات التسويق', type: 'expense', nature: 'debit', level: 1, parentCode: '5000', balance: 45000, isActive: false },
];

export const FISCAL_YEARS: FiscalYear[] = [
  { id: 'fy-2026', name: 'السنة المالية 2026', startDate: '2026-01-01', endDate: '2026-12-31', status: 'open', entriesCount: 34 },
  { id: 'fy-2025', name: 'السنة المالية 2025', startDate: '2025-01-01', endDate: '2025-12-31', status: 'closed', entriesCount: 218 },
  { id: 'fy-2027', name: 'السنة المالية 2027', startDate: '2027-01-01', endDate: '2027-12-31', status: 'planned', entriesCount: 0 },
];

export const COST_CENTERS: CostCenter[] = [
  { id: 'cc-ops', code: 'CC-001', name: 'العمليات', owner: 'Operations', budget: 220000, actual: 176000, isActive: true },
  { id: 'cc-sales', code: 'CC-002', name: 'المبيعات', owner: 'Sales', budget: 120000, actual: 93000, isActive: true },
  { id: 'cc-fin', code: 'CC-003', name: 'المالية', owner: 'Finance', budget: 80000, actual: 51000, isActive: true },
  { id: 'cc-mkt', code: 'CC-004', name: 'التسويق', owner: 'Marketing', budget: 90000, actual: 45000, isActive: false },
];

export const JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: 'je-001',
    number: 'JV-2026-001',
    date: '2026-01-06',
    description: 'مبيعات كاش يوم 06/01/2026',
    status: 'posted',
    source: 'Sales',
    lines: [
      { accountId: 'acc-1111', accountName: 'الصندوق الرئيسي', debit: 72000, credit: 0, costCenterId: 'cc-sales' },
      { accountId: 'acc-4100', accountName: 'إيرادات الباقات', debit: 0, credit: 72000, costCenterId: 'cc-sales' },
    ],
  },
  {
    id: 'je-002',
    number: 'JV-2026-002',
    date: '2026-01-07',
    description: 'تحويل بنكي من صندوق الاستقبال',
    status: 'posted',
    source: 'Bank Transfer',
    lines: [
      { accountId: 'acc-1121', accountName: 'البنك الأهلي - حساب جاري', debit: 55000, credit: 0, costCenterId: 'cc-fin' },
      { accountId: 'acc-1112', accountName: 'صندوق الاستقبال', debit: 0, credit: 55000, costCenterId: 'cc-fin' },
    ],
  },
  {
    id: 'je-003',
    number: 'JV-2026-003',
    date: '2026-01-09',
    description: 'مصروفات نقل للمعتمرين',
    status: 'posted',
    source: 'Transport',
    lines: [
      { accountId: 'acc-5200', accountName: 'مصروفات النقل', debit: 28000, credit: 0, costCenterId: 'cc-ops' },
      { accountId: 'acc-1121', accountName: 'البنك الأهلي - حساب جاري', debit: 0, credit: 28000, costCenterId: 'cc-ops' },
    ],
  },
  {
    id: 'je-004',
    number: 'JV-2026-004',
    date: '2026-01-12',
    description: 'مصروفات تسويق الحملة الموسمية',
    status: 'pending',
    source: 'Marketing',
    lines: [
      { accountId: 'acc-5400', accountName: 'مصروفات التسويق', debit: 18500, credit: 0, costCenterId: 'cc-mkt' },
      { accountId: 'acc-2100', accountName: 'الذمم الدائنة', debit: 0, credit: 18500, costCenterId: 'cc-mkt' },
    ],
  },
  {
    id: 'je-005',
    number: 'JV-2026-005',
    date: '2026-01-15',
    description: 'رسوم ومصاريف بنكية',
    status: 'draft',
    source: 'Bank Fees',
    lines: [
      { accountId: 'acc-5300', accountName: 'مصروفات البنك', debit: 4500, credit: 0, costCenterId: 'cc-fin' },
      { accountId: 'acc-1122', accountName: 'بنك الراجحي - حساب توفير', debit: 0, credit: 4500, costCenterId: 'cc-fin' },
    ],
  },
  {
    id: 'je-006',
    number: 'JV-2026-006',
    date: '2026-01-18',
    description: 'إيرادات خدمات إضافية',
    status: 'posted',
    source: 'Services',
    lines: [
      { accountId: 'acc-1130', accountName: 'الذمم المدينة', debit: 36000, credit: 0, costCenterId: 'cc-sales' },
      { accountId: 'acc-4200', accountName: 'إيرادات الخدمات', debit: 0, credit: 36000, costCenterId: 'cc-sales' },
    ],
  },
];

export const OPENING_BALANCES: OpeningBalanceRow[] = [
  { accountId: 'acc-1111', accountCode: '1111', accountName: 'الصندوق الرئيسي', debit: 95000, credit: 0 },
  { accountId: 'acc-1112', accountCode: '1112', accountName: 'صندوق الاستقبال', debit: 35000, credit: 0 },
  { accountId: 'acc-1121', accountCode: '1121', accountName: 'البنك الأهلي - حساب جاري', debit: 340000, credit: 0 },
  { accountId: 'acc-1122', accountCode: '1122', accountName: 'بنك الراجحي - حساب توفير', debit: 210000, credit: 0 },
  { accountId: 'acc-2100', accountCode: '2100', accountName: 'الذمم الدائنة', debit: 0, credit: 160000 },
  { accountId: 'acc-3000', accountCode: '3000', accountName: 'حقوق الملكية', debit: 0, credit: 520000 },
];

export const ACCOUNT_ROUTING_RULES: AccountRoutingRule[] = [
  { id: 'route-sales-cash', operation: 'مبيعات نقدية', description: 'تسجيل مبيعات الباقات المدفوعة نقداً', debitAccountId: 'acc-1111', creditAccountId: 'acc-4100', isActive: true },
  { id: 'route-sales-credit', operation: 'مبيعات آجلة', description: 'مبيعات العملاء والوكلاء على الحساب', debitAccountId: 'acc-1130', creditAccountId: 'acc-4100', isActive: true },
  { id: 'route-services', operation: 'خدمات إضافية', description: 'إيرادات الخدمات الاختيارية', debitAccountId: 'acc-1130', creditAccountId: 'acc-4200', isActive: true },
  { id: 'route-transport', operation: 'مصروفات النقل', description: 'تكلفة النقل المرتبطة بالباقات', debitAccountId: 'acc-5200', creditAccountId: 'acc-1121', isActive: true },
  { id: 'route-bank-fees', operation: 'رسوم بنكية', description: 'عمولات ورسوم التحويل البنكي', debitAccountId: 'acc-5300', creditAccountId: 'acc-1122', isActive: false },
];

export const FINANCE_WALLETS: FinanceWallet[] = [
  { id: 'wallet-main-cash', name: 'الصندوق الرئيسي', type: 'cash', accountNumber: '1111', currency: 'SAR', balance: 185000, isDefault: true, isActive: true },
  { id: 'wallet-reception', name: 'صندوق الاستقبال', type: 'cash', accountNumber: '1112', currency: 'SAR', balance: 62000, isDefault: false, isActive: true },
  { id: 'wallet-ahli', name: 'البنك الأهلي - حساب جاري', type: 'bank', accountNumber: 'SA1234567890123456789012', currency: 'SAR', balance: 395000, isDefault: true, isActive: true },
  { id: 'wallet-rajhi', name: 'بنك الراجحي - حساب توفير', type: 'bank', accountNumber: 'SA9876543210987654321098', currency: 'SAR', balance: 230000, isDefault: false, isActive: true },
  { id: 'wallet-online', name: 'بوابة الدفع الإلكتروني', type: 'payment', accountNumber: 'PAY-ONLINE-01', currency: 'SAR', balance: 48000, isDefault: false, isActive: true },
];

export const FINANCIAL_REPORTS: FinancialReportTile[] = [
  { id: 'report-trial', title: 'ميزان المراجعة', description: 'أرصدة الحسابات وحركة الفترة', icon: 'balance', updatedAt: '2026-01-20' },
  { id: 'report-statement', title: 'كشف الحساب', description: 'تفاصيل العمليات لحساب محدد', icon: 'description', updatedAt: '2026-01-20' },
  { id: 'report-income', title: 'قائمة الدخل', description: 'الإيرادات والمصروفات وصافي الدخل', icon: 'trending_up', updatedAt: '2026-01-19' },
  { id: 'report-cost', title: 'تقرير مراكز التكلفة', description: 'مقارنة الميزانية بالمصروف الفعلي', icon: 'hub', updatedAt: '2026-01-18' },
  { id: 'report-cash', title: 'حركة الصندوق', description: 'حركات الصناديق والمحافظ النقدية', icon: 'payments', updatedAt: '2026-01-18' },
];
