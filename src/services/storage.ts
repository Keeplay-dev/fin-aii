import type { Transaction, FinancialMetrics, CategoryId } from '../types/finance';
import { CATEGORY_LIST } from './categories';

const SALARY_KEY = 'finai_salary_v1';
const TRANSACTIONS_KEY = 'finai_transactions_v1';

export function loadStoredSalary(userId?: number): number {
  try {
    if (userId) {
      const userKey = `${SALARY_KEY}_u${userId}`;
      const rawUser = localStorage.getItem(userKey);
      if (rawUser) return parseFloat(rawUser);
    }
    const rawGlobal = localStorage.getItem(SALARY_KEY);
    return rawGlobal ? parseFloat(rawGlobal) : 6500;
  } catch {
    return 6500;
  }
}

export function saveStoredSalary(salary: number, userId?: number): void {
  try {
    if (userId) {
      localStorage.setItem(`${SALARY_KEY}_u${userId}`, String(salary));
    }
    localStorage.setItem(SALARY_KEY, String(salary));
  } catch (e) {
    console.error('Erro ao salvar salário:', e);
  }
}

export function loadStoredTransactions(userId?: number): Transaction[] {
  try {
    if (userId) {
      const userKey = `${TRANSACTIONS_KEY}_u${userId}`;
      const rawUser = localStorage.getItem(userKey);
      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        if (Array.isArray(parsed)) return parsed;
      }
    }
    const rawGlobal = localStorage.getItem(TRANSACTIONS_KEY);
    if (rawGlobal) {
      const parsed = JSON.parse(rawGlobal);
      if (Array.isArray(parsed)) return parsed;
    }
    return [];
  } catch {
    return [];
  }
}

export function saveStoredTransactions(transactions: Transaction[], userId?: number): void {
  try {
    if (userId) {
      localStorage.setItem(`${TRANSACTIONS_KEY}_u${userId}`, JSON.stringify(transactions));
    }
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  } catch (e) {
    console.error('Erro ao salvar transações:', e);
  }
}

// Sincronização assíncrona com o TiDB Cloud
export async function syncTransactionsWithTiDB(userId: number, transactions: Transaction[]): Promise<void> {
  if (!userId || transactions.length === 0) return;
  try {
    await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, transactions })
    });
  } catch (e) {
    console.warn('Sincronização TiDB temporariamente offline:', e);
  }
}

export async function fetchUserTransactionsFromTiDB(userId: number): Promise<Transaction[] | null> {
  if (!userId) return null;
  try {
    const res = await fetch(`/api/transactions?userId=${userId}&_t=${Date.now()}`, {
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        saveStoredTransactions(data, userId);
        return data;
      }
    }
  } catch (e) {
    console.warn('Não foi possível carregar do TiDB remoto:', e);
  }
  return null;
}

export async function updateTransactionCategoryInTiDB(
  userId: number,
  transactionId: string,
  category: CategoryId,
  merchantPattern?: string,
  aiReason?: string
): Promise<void> {
  if (!userId || !transactionId) return;
  try {
    await fetch('/api/transactions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        id: transactionId,
        category,
        merchantPattern,
        aiReason
      })
    });
  } catch (e) {
    console.warn('Falha ao atualizar categoria no TiDB:', e);
  }
}

export async function deleteTransactionFromTiDB(userId: number, transactionId: string): Promise<void> {
  if (!userId || !transactionId) return;
  try {
    await fetch(`/api/transactions?userId=${userId}&id=${transactionId}`, { method: 'DELETE' });
  } catch (e) {
    console.warn('Falha ao excluir no TiDB:', e);
  }
}

export async function clearAllTransactionsFromTiDB(userId: number): Promise<void> {
  if (!userId) return;
  try {
    await fetch(`/api/transactions?userId=${userId}&all=true`, { method: 'DELETE' });
  } catch (e) {
    console.warn('Falha ao limpar transações no TiDB:', e);
  }
}

export async function syncSalaryWithTiDB(userId: number, salary: number): Promise<void> {
  if (!userId) return;
  try {
    await fetch('/api/salary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, salary })
    });
  } catch (e) {
    console.warn('Falha ao sincronizar salário no TiDB:', e);
  }
}

export async function fetchUserSalaryFromTiDB(userId: number): Promise<number | null> {
  if (!userId) return null;
  try {
    const res = await fetch(`/api/salary?userId=${userId}&_t=${Date.now()}`, {
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.salary === 'number') {
        saveStoredSalary(data.salary, userId);
        return data.salary;
      }
    }
  } catch (e) {
    console.warn('Falha ao carregar salário remoto do TiDB:', e);
  }
  return null;
}

// Funções de compatibilidade para evitar quebras de build caso o arquivo antigo exista no GitHub
export function loadGeminiKey(): string {
  return '';
}

export function saveGeminiKey(_key?: string): void {
  // Descontinuado
}

// Calcular todas as métricas financeiras consolidadas
export function calculateFinancialMetrics(salary: number, transactions: Transaction[]): FinancialMetrics {
  const categoryTotals: Record<CategoryId, number> = {
    comida: 0,
    gasolina: 0,
    transporte: 0,
    financiamentos: 0,
    saude: 0,
    pet: 0,
    moradia: 0,
    lazer: 0,
    outros: 0
  };

  let totalExpenses = 0;

  for (const t of transactions) {
    if (t.type === 'expense') {
      totalExpenses += t.amount;
      if (categoryTotals[t.category] !== undefined) {
        categoryTotals[t.category] += t.amount;
      } else {
        categoryTotals.outros += t.amount;
      }
    }
  }

  const remainingSalary = salary - totalExpenses;
  const spentPercentage = salary > 0 ? (totalExpenses / salary) * 100 : 0;
  const savingsPercentage = salary > 0 ? (remainingSalary / salary) * 100 : 0;

  let status: 'positive' | 'warning' | 'danger' = 'positive';
  if (remainingSalary < 0) {
    status = 'danger';
  } else if (spentPercentage > 85) {
    status = 'warning';
  }

  // Pontuação de saúde financeira de 0 a 100
  let healthScore = 100;
  if (salary > 0) {
    if (remainingSalary < 0) {
      healthScore = Math.max(10, Math.round(50 - (Math.abs(remainingSalary) / salary) * 50));
    } else {
      healthScore = Math.min(100, Math.round(savingsPercentage * 1.5 + 40));
    }
  }

  let healthLabel = 'Excelente';
  if (healthScore < 40) healthLabel = 'Crítico';
  else if (healthScore < 60) healthLabel = 'Atenção';
  else if (healthScore < 80) healthLabel = 'Bom';

  const categoryPercentages: Record<CategoryId, number> = {} as any;
  for (const cat of CATEGORY_LIST) {
    categoryPercentages[cat.id] = totalExpenses > 0 ? (categoryTotals[cat.id] / totalExpenses) * 100 : 0;
  }

  return {
    salary,
    totalExpenses,
    remainingSalary,
    savingsPercentage,
    spentPercentage,
    status,
    healthScore,
    healthLabel,
    categoryTotals,
    categoryPercentages,
    transactionCount: transactions.length
  };
}
