import type { FinancialMetrics, Transaction } from '../types/finance';
import { CATEGORIES, CATEGORY_LIST } from '../services/categories';
import { X, Printer } from 'lucide-react';

interface PDFReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: FinancialMetrics;
  transactions: Transaction[];
}

export const PDFReportModal: React.FC<PDFReportModalProps> = ({
  isOpen,
  onClose,
  metrics,
  transactions
}) => {
  if (!isOpen) return null;

  const todayDisplay = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.5)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 110,
      padding: 16
    }}>
      <div className="glass-panel animate-fade-in" style={{
        maxWidth: 820,
        width: '100%',
        maxHeight: '92vh',
        overflowY: 'auto',
        padding: 28,
        position: 'relative',
        backgroundColor: '#FFFFFF',
        borderColor: 'var(--border-pastel-blue)'
      }}>
        {/* Barra superior de ações */}
        <div className="no-print" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: 14,
          marginBottom: 20
        }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Relatório Financeiro do Mês
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Visualize e clique em Salvar como PDF para exportar seus dados
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={handlePrint} className="btn btn-primary btn-sm">
              <Printer size={16} />
              <span>Salvar como PDF / Imprimir</span>
            </button>
            <button onClick={onClose} className="btn btn-secondary btn-sm">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Conteúdo do Relatório Formatado para Impressão e PDF */}
        <div id="printable-report" style={{ backgroundColor: '#FFFFFF', color: '#0F172A' }}>
          {/* Cabeçalho do Relatório */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px solid #BFDBFE',
            paddingBottom: 14,
            marginBottom: 20
          }}>
            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1E40AF' }}>
                FinAI - Relatório Financeiro
              </h1>
              <p style={{ fontSize: '0.875rem', color: '#475569' }}>
                Gestão Financeira & Análise Inteligente
              </p>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#64748B' }}>
              <div>Emissão: <strong>{todayDisplay}</strong></div>
              <div>Total de Registros: <strong>{metrics.transactionCount} lançamentos</strong></div>
            </div>
          </div>

          {/* Resumo Executivo (KPIs) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 14,
            marginBottom: 24
          }}>
            <div style={{
              padding: 14,
              borderRadius: 10,
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1E40AF', textTransform: 'uppercase' }}>
                Salário Mensal
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1E3A8A', marginTop: 4 }}>
                {formatBRL(metrics.salary)}
              </div>
            </div>

            <div style={{
              padding: 14,
              borderRadius: 10,
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#B91C1C', textTransform: 'uppercase' }}>
                Total de Gastos
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#991B1B', marginTop: 4 }}>
                {formatBRL(metrics.totalExpenses)}
              </div>
              <div style={{ fontSize: '0.725rem', color: '#64748B', marginTop: 2 }}>
                {metrics.spentPercentage.toFixed(1)}% do salário
              </div>
            </div>

            <div style={{
              padding: 14,
              borderRadius: 10,
              backgroundColor: metrics.remainingSalary >= 0 ? '#ECFDF5' : '#FEF2F2',
              border: `1px solid ${metrics.remainingSalary >= 0 ? '#A7F3D0' : '#FECACA'}`
            }}>
              <div style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: metrics.remainingSalary >= 0 ? '#047857' : '#B91C1C',
                textTransform: 'uppercase'
              }}>
                Quanto Sobrou
              </div>
              <div style={{
                fontSize: '1.4rem',
                fontWeight: 800,
                color: metrics.remainingSalary >= 0 ? '#065F46' : '#991B1B',
                marginTop: 4
              }}>
                {formatBRL(metrics.remainingSalary)}
              </div>
              <div style={{ fontSize: '0.725rem', color: '#64748B', marginTop: 2 }}>
                {metrics.savingsPercentage >= 0 ? `+${metrics.savingsPercentage.toFixed(1)}% poupado` : 'Déficit orçamentário'}
              </div>
            </div>
          </div>

          {/* Tabela de Resumo por Categorias */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1E3A8A', marginBottom: 10 }}>
              Resumo por Categorias de Gasto
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '2px solid #CBD5E1' }}>
                  <th style={{ textAlign: 'left', padding: '8px 10px', color: '#334155' }}>Categoria</th>
                  <th style={{ textAlign: 'right', padding: '8px 10px', color: '#334155' }}>Total Gasto (R$)</th>
                  <th style={{ textAlign: 'right', padding: '8px 10px', color: '#334155' }}>% dos Gastos</th>
                  <th style={{ textAlign: 'right', padding: '8px 10px', color: '#334155' }}>% do Salário</th>
                </tr>
              </thead>
              <tbody>
                {CATEGORY_LIST.map((cat) => {
                  const val = metrics.categoryTotals[cat.id] || 0;
                  const pctExp = metrics.totalExpenses > 0 ? (val / metrics.totalExpenses) * 100 : 0;
                  const pctSal = metrics.salary > 0 ? (val / metrics.salary) * 100 : 0;
                  if (val === 0) return null;

                  return (
                    <tr key={cat.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '8px 10px', fontWeight: 600, color: '#1E293B' }}>
                        {cat.name}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700 }}>
                        {formatBRL(val)}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: '#64748B' }}>
                        {pctExp.toFixed(1)}%
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: '#64748B' }}>
                        {pctSal.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Tabela de Lançamentos Detalhados com Nome do Estabelecimento */}
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1E3A8A', marginBottom: 10 }}>
              Detalhamento de Lançamentos e Estabelecimentos
            </h3>
            {transactions.length === 0 ? (
              <p style={{ color: '#64748B', fontSize: '0.85rem' }}>Nenhuma transação registrada neste mês.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.785rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '2px solid #CBD5E1' }}>
                    <th style={{ textAlign: 'left', padding: '6px 8px', color: '#334155' }}>Data / Dia</th>
                    <th style={{ textAlign: 'left', padding: '6px 8px', color: '#334155' }}>Estabelecimento</th>
                    <th style={{ textAlign: 'left', padding: '6px 8px', color: '#334155' }}>Categoria</th>
                    <th style={{ textAlign: 'right', padding: '6px 8px', color: '#334155' }}>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '6px 8px', color: '#475569' }}>
                        <strong>{tx.dateDisplay}</strong> ({tx.dayOfWeek.split('-')[0]})
                      </td>
                      <td style={{ padding: '6px 8px', color: '#0F172A', fontWeight: 600 }}>
                        {tx.merchantName || tx.description}
                      </td>
                      <td style={{ padding: '6px 8px', color: '#475569' }}>
                        {CATEGORIES[tx.category]?.name.split('&')[0].trim() || tx.category}
                      </td>
                      <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 700, color: '#0F172A' }}>
                        {formatBRL(tx.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
