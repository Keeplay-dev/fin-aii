export type CategoryId =
  | 'comida'
  | 'gasolina'
  | 'transporte'
  | 'financiamentos'
  | 'saude'
  | 'pet'
  | 'moradia'
  | 'lazer'
  | 'outros';

export interface CategoryInfo {
  id: CategoryId;
  name: string;
  iconName: string;
  color: string;
  accentBg: string;
  textColor: string;
  description: string;
  keywords: string[];
}

export interface Transaction {
  id: string;
  date: string; // ISO YYYY-MM-DD
  dateDisplay: string; // DD/MM/AAAA
  dayOfWeek: string; // ex: "Segunda-feira"
  merchantName: string; // Nome limpo do estabelecimento (ex: "Posto Shell", "iFood", "Petz")
  description: string;
  originalText: string;
  amount: number; // positive value in BRL
  type: 'expense' | 'income';
  category: CategoryId;
  aiConfidence: number; // 0 a 100
  aiSource: 'learned' | 'knowledge_base' | 'nlp_heuristic' | 'manual';
  aiReason?: string;
  statementName?: string;
}

export interface FinancialMetrics {
  salary: number;
  totalExpenses: number;
  remainingSalary: number;
  savingsPercentage: number;
  spentPercentage: number;
  status: 'positive' | 'warning' | 'danger';
  healthScore: number;
  healthLabel: string;
  categoryTotals: Record<CategoryId, number>;
  categoryPercentages: Record<CategoryId, number>;
  transactionCount: number;
}

export interface ParsedPDFResult {
  fileName: string;
  pageCount: number;
  transactions: Transaction[];
  rawTextPreview: string;
  detectedBank?: string;
  warnings?: string[];
}

export interface UserLearningRule {
  merchantPattern: string;
  category: CategoryId;
  updatedAt: string;
}

export interface AIAdvisorInsight {
  id: string;
  type: 'tip' | 'alert' | 'praise' | 'prediction';
  title: string;
  message: string;
  category?: CategoryId;
  impactLevel: 'low' | 'medium' | 'high';
}
