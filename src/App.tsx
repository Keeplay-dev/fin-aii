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
  syncSalaryWithTiDB
} from './services/storage';
import { saveLearnedRule, generateAIInsights, reclassifyAllTransactions } from './services/aiEngine';
import { getMockTransactions } from './services/mockData';
import { getStoredUser, clearUserSession } from './services/authService';

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
  const [salary, setSalary] = useState<number>(() => loadStoredSalary());
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const stored = loadStoredTransactions();
    // Se o cache tiver dados do mock anterior com nomes artificiais, substitui pelas transações da fatura real
    const hasOldMockNames = stored && stored.some(t =>
      t.id.startsWith('mock_') ||
      t.description.includes('PAO DE ACUCAR') ||
      t.description.includes('HABITACAO CAIXA')
    );

    if (!stored || stored.length === 0 || hasOldMockNames) {
      const realSamples = getMockTransactions();
      saveStoredTransactions(realSamples);
      return realSamples;
    }
    return reclassifyAllTransactions(stored);
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => getStoredUser());
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);

  const handleLogout = () => {
    clearUserSession();
    setCurrentUser(null);
  };

  // Carregar dados remotos do TiDB quando o usuário estiver logado
  useEffect(() => {
    if (currentUser?.id) {
      if (currentUser.salary) {
        setSalary(currentUser.salary);
      }
      fetchUserTransactionsFromTiDB(currentUser.id).then(remoteTx => {
        if (remoteTx && remoteTx.length > 0) {
          setTransactions(remoteTx);
        }
      });
    }
  }, [currentUser?.id]);

  // Sincronizar salário com o localStorage e TiDB
  const handleUpdateSalary = (newSalary: number) => {
    setSalary(newSalary);
    saveStoredSalary(newSalary);
    if (currentUser?.id) {
      syncSalaryWithTiDB(currentUser.id, newSalary);
    }
  };

  // Sincronizar transações com o localStorage e TiDB Cloud
  useEffect(() => {
    saveStoredTransactions(transactions);
    if (currentUser?.id && transactions.length > 0) {
      syncTransactionsWithTiDB(currentUser.id, transactions);
    }
  }, [transactions, currentUser?.id]);

  // Limpar todos os dados
  const handleClearData = () => {
    if (window.confirm('Tem certeza de que deseja limpar todos os lançamentos carregados?')) {
      setTransactions([]);
      if (currentUser?.id) {
        clearAllTransactionsFromTiDB(currentUser.id);
      }
    }
  };

  // Ao receber dados de um PDF ou texto processado
  const handlePDFParsed = (result: ParsedPDFResult) => {
    setTransactions(prev => {
      const updated = [...result.transactions, ...prev];
      if (currentUser?.id) {
        syncTransactionsWithTiDB(currentUser.id, result.transactions);
      }
      return updated;
    });
  };

  // Recategorizar uma transação
  const handleRecategorize = (transactionId: string, newCategory: CategoryId, description: string) => {
    setTransactions(prev =>
      prev.map(t => {
        if (t.id === transactionId) {
          return {
            ...t,
            category: newCategory,
            aiSource: 'learned',
            aiConfidence: 100,
            aiReason: 'Atualizado manualmente por você'
          };
        }
        return t;
      })
    );

    // Salva regra de aprendizado
    saveLearnedRule(description, newCategory);
  };

  // Excluir uma transação
  const handleDeleteTransaction = (transactionId: string) => {
    setTransactions(prev => prev.filter(t => t.id !== transactionId));
    if (currentUser?.id) {
      deleteTransactionFromTiDB(currentUser.id, transactionId);
    }
  };

  // Adicionar transação manual
  const handleAddTransaction = (newTx: Transaction) => {
    setTransactions(prev => [newTx, ...prev]);
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
