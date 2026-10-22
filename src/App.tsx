import React, { useState, useEffect } from 'react';
import type { Transaction, CategoryId, ParsedPDFResult } from './types/finance';
import type { User } from './types/auth';
import {
  loadStoredSalary,
  saveStoredSalary,
  loadStoredTransactions,
  saveStoredTransactions,
  calculateFinancialMetrics,
  syncTransactionsWithTiDB,
  fetchUserTransactionsFromTiDB,
  deleteTransactionFromTiDB,
  clearAllTransactionsFromTiDB,
  syncSalaryWithTiDB,
  fetchUserSalaryFromTiDB,
  updateTransactionCategoryInTiDB
} from './services/storage';
import { saveLearnedRule, generateAIInsights, reclassifyAllTransactions } from './services/aiEngine';
import { getStoredUser, clearUserSession, saveUserSession } from './services/authService';

import { Header } from './components/Header';
import { SalaryCard } from './components/SalaryCard';
import { DropzonePDF } from './components/DropzonePDF';
import { DashboardCharts } from './components/DashboardCharts';
import { CategoryList } from './components/CategoryList';
import { AIInsights } from './components/AIInsights';
import { ManualModal } from './components/ManualModal';
import { PDFReportModal } from './components/PDFReportModal';
import { LoginScreen } from './components/LoginScreen';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => getStoredUser());

  const [salary, setSalary] = useState<number>(() => {
    const user = getStoredUser();
    if (user?.salary && user.salary > 0) return user.salary;
    return loadStoredSalary(user?.id);
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const user = getStoredUser();
    const stored = loadStoredTransactions(user?.id);
    if (stored && stored.length > 0) {
      return reclassifyAllTransactions(stored);
    }
    return [];
  });

  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const handleLogout = () => {
    clearUserSession();
    setCurrentUser(null);
  };

  // Função central de sincronização com o TiDB Cloud
  const refreshData = async (silent = false) => {
    if (!currentUser?.id) return;
    if (!silent) setIsSyncing(true);

    try {
      const [remoteTx, remoteSalary] = await Promise.all([
        fetchUserTransactionsFromTiDB(currentUser.id),
        fetchUserSalaryFromTiDB(currentUser.id)
      ]);

      if (remoteTx !== null) {
        setTransactions(remoteTx);
        saveStoredTransactions(remoteTx, currentUser.id);
      }

      if (typeof remoteSalary === 'number' && remoteSalary > 0) {
        setSalary(remoteSalary);
        saveStoredSalary(remoteSalary, currentUser.id);
        setCurrentUser(prev => {
          if (!prev) return null;
          const updated = { ...prev, salary: remoteSalary };
          saveUserSession(updated);
          return updated;
        });
      }

      setLastSyncTime(new Date());
    } catch (err) {
      console.warn('Falha na sincronização com TiDB:', err);
    } finally {
      if (!silent) {
        setTimeout(() => setIsSyncing(false), 300);
      }
    }
  };

  // Carregar dados remotos do TiDB quando o usuário estiver logado
  useEffect(() => {
    if (currentUser?.id) {
      refreshData(false);
    }
  }, [currentUser?.id]);

  // Sincronização automática contínua em tempo real (multi-dispositivo: PC e Celular)
  useEffect(() => {
    if (!currentUser?.id) return;

    // 1. Ao voltar para a aba ou desbloquear a tela do celular
    const handleFocus = () => refreshData(true);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshData(true);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 2. Polling silencioso a cada 8 segundos quando o app estiver aberto na tela
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        refreshData(true);
      }
    }, 8000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, [currentUser?.id]);

  // Sincronizar salário com o localStorage, Sessão e TiDB
  const handleUpdateSalary = (newSalary: number) => {
    setSalary(newSalary);
    saveStoredSalary(newSalary, currentUser?.id);
    if (currentUser) {
      const updatedUser = { ...currentUser, salary: newSalary };
      setCurrentUser(updatedUser);
      saveUserSession(updatedUser);
      if (currentUser.id) {
        syncSalaryWithTiDB(currentUser.id, newSalary);
      }
    }
  };

  // Limpar todos os dados
  const handleClearData = () => {
    if (window.confirm('Tem certeza de que deseja limpar todos os lançamentos carregados?')) {
      setTransactions([]);
      saveStoredTransactions([], currentUser?.id);
      if (currentUser?.id) {
        clearAllTransactionsFromTiDB(currentUser.id);
      }
    }
  };

  // Ao receber dados de um PDF ou texto processado
  const handlePDFParsed = (result: ParsedPDFResult) => {
    setTransactions(prev => {
      const updated = [...result.transactions, ...prev];
      saveStoredTransactions(updated, currentUser?.id);
      if (currentUser?.id) {
        syncTransactionsWithTiDB(currentUser.id, result.transactions);
      }
      return updated;
    });
  };

  // Recategorizar uma transação
  const handleRecategorize = (transactionId: string, newCategory: CategoryId, description: string) => {
    setTransactions(prev => {
      const updated = prev.map(t => {
        if (t.id === transactionId) {
          return {
            ...t,
            category: newCategory,
            aiSource: 'learned' as const,
            aiConfidence: 100,
            aiReason: 'Atualizado manualmente por você'
          };
        }
        return t;
      });
      saveStoredTransactions(updated, currentUser?.id);
      return updated;
    });

    // Salva regra de aprendizado local
    saveLearnedRule(description, newCategory);

    // Atualiza imediatamente no TiDB
    if (currentUser?.id) {
      updateTransactionCategoryInTiDB(currentUser.id, transactionId, newCategory, description, 'Atualizado manualmente por você');
    }
  };

  // Excluir uma transação
  const handleDeleteTransaction = (transactionId: string) => {
    setTransactions(prev => {
      const updated = prev.filter(t => t.id !== transactionId);
      saveStoredTransactions(updated, currentUser?.id);
      return updated;
    });
    if (currentUser?.id) {
      deleteTransactionFromTiDB(currentUser.id, transactionId);
    }
  };

  // Adicionar transação manual
  const handleAddTransaction = (newTx: Transaction) => {
    setTransactions(prev => {
      const updated = [newTx, ...prev];
      saveStoredTransactions(updated, currentUser?.id);
      if (currentUser?.id) {
        syncTransactionsWithTiDB(currentUser.id, [newTx]);
      }
      return updated;
    });
  };

  // Métricas calculadas em tempo real
  const metrics = calculateFinancialMetrics(salary, transactions);
  const insights = generateAIInsights(metrics, transactions);

  // Se não estiver logado, exibe a tela de login/cadastro
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={setCurrentUser} />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)' }}>
      {/* Top Header */}
      <Header
        onOpenManualModal={() => setIsManualModalOpen(true)}
        onOpenPDFModal={() => setIsPDFModalOpen(true)}
        onClearData={handleClearData}
        hasData={transactions.length > 0}
        currentUser={currentUser}
        onLogout={handleLogout}
        onSync={() => refreshData(false)}
        isSyncing={isSyncing}
        lastSyncTime={lastSyncTime}
      />

      {/* Main Content Area */}
      <main className="container" style={{ flex: 1 }}>
        {/* Bloco 1: Salário, Total de Gastos e Quanto Sobrou do Salário */}
        <SalaryCard metrics={metrics} onUpdateSalary={handleUpdateSalary} />

        {/* Bloco 2: Dropzone de Upload de Fatura em PDF ou Colar Histórico do Site */}
        <DropzonePDF onPDFParsed={handlePDFParsed} />

        {/* Bloco 3: Dashboard de Gráficos (Donut por Categoria + Histograma Diário) */}
        <DashboardCharts metrics={metrics} transactions={transactions} />

        {/* Bloco 4: Consultoria & Diagnóstico Financeiro */}
        <AIInsights insights={insights} />

        {/* Bloco 5: Lista Minuciosa de Categorias Expansíveis */}
        <CategoryList
          transactions={transactions}
          totalSalary={salary}
          totalExpenses={metrics.totalExpenses}
          onRecategorize={handleRecategorize}
          onDeleteTransaction={handleDeleteTransaction}
        />
      </main>

      {/* Rodapé Moderno */}
      <footer className="no-print" style={{
        borderTop: '1px solid var(--border-pastel-blue)',
        backgroundColor: '#FFFFFF',
        padding: '24px 20px',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <span style={{ fontWeight: 600, color: '#1E40AF' }}>
            FinAI © 2026 • Gestão Financeira & Análise Inteligente
          </span>
          <span>Processamento local seguro no navegador • Relatórios em PDF</span>
        </div>
      </footer>

      {/* Modais */}
      <ManualModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onAddTransaction={handleAddTransaction}
      />

      <PDFReportModal
        isOpen={isPDFModalOpen}
        onClose={() => setIsPDFModalOpen(false)}
        metrics={metrics}
        transactions={transactions}
      />
    </div>
  );
};

export default App;
