import React, { useState } from 'react';
import type { CategoryId, Transaction } from '../types/finance';
import { CATEGORIES } from '../services/categories';
import { extractMerchantName } from '../services/merchantExtractor';
import {
  UtensilsCrossed,
  Fuel,
  Car,
  Home,
  HeartPulse,
  Dog,
  Tv,
  Tag,
  ChevronDown,
  Calendar,
  Sparkles,
  Trash2,
  Search,
  Store
} from 'lucide-react';

interface CategoryCardProps {
  categoryId: CategoryId;
  transactions: Transaction[];
  totalSalary: number;
  totalExpenses: number;
  onRecategorize: (transactionId: string, newCategory: CategoryId, description: string) => void;
  onDeleteTransaction: (transactionId: string) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  categoryId,
  transactions,
  totalSalary,
  totalExpenses,
  onRecategorize,
  onDeleteTransaction
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const category = CATEGORIES[categoryId];
  const categoryTotal = transactions.reduce((acc, t) => acc + t.amount, 0);
  const percentOfExpenses = totalExpenses > 0 ? (categoryTotal / totalExpenses) * 100 : 0;
  const percentOfSalary = totalSalary > 0 ? (categoryTotal / totalSalary) * 100 : 0;

  // Lista dos principais estabelecimentos nesta categoria
  const distinctMerchants = Array.from(
    new Set(transactions.map(t => t.merchantName || extractMerchantName(t.description)))
  ).filter(name => name && name !== 'Estabelecimento Não Identificado').slice(0, 3);

  // Filtragem interna das transações
  const filteredTransactions = transactions.filter(t => {
    const term = searchTerm.toLowerCase();
    const merchant = (t.merchantName || extractMerchantName(t.description)).toLowerCase();
    const desc = (t.description || '').toLowerCase();
    const date = t.dateDisplay || '';
    const day = (t.dayOfWeek || '').toLowerCase();
    return merchant.includes(term) || desc.includes(term) || date.includes(term) || day.includes(term);
  });

  // Mapeamento de ícones dinâmicos
  const renderIcon = (id: CategoryId) => {
    const size = 22;
    switch (id) {
      case 'comida':
        return <UtensilsCrossed size={size} color={category.textColor} />;
      case 'gasolina':
        return <Fuel size={size} color={category.textColor} />;
      case 'transporte':
        return <Car size={size} color={category.textColor} />;
      case 'financiamentos':
        return <Home size={size} color={category.textColor} />;
      case 'saude':
        return <HeartPulse size={size} color={category.textColor} />;
      case 'pet':
        return <Dog size={size} color={category.textColor} />;
      case 'lazer':
        return <Tv size={size} color={category.textColor} />;
      default:
        return <Tag size={size} color={category.textColor} />;
    }
  };

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    });
  };

  return (
    <div
      className="glass-panel"
      style={{
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--border-pastel-blue)',
        borderLeftWidth: 4,
        borderLeftStyle: 'solid',
        borderLeftColor: category.color,
        transition: 'all 0.25s ease'
      }}
    >
      {/* Cabeçalho do Card (Clicável para Expandir/Recolher) */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          padding: '18px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          backgroundColor: isExpanded ? '#F8FAFD' : '#FFFFFF',
          transition: 'background-color 0.2s ease',
          userSelect: 'none'
        }}
      >
        {/* Esquerda: Ícone + Título + Descrição */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 46,
            height: 46,
            borderRadius: 12,
            backgroundColor: category.accentBg,
            border: `1px solid ${category.color}40`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 2px 8px ${category.color}25`
          }}>
            {renderIcon(categoryId)}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {category.name}
              </h3>
              <span style={{
                fontSize: '0.725rem',
                padding: '2px 8px',
                borderRadius: 9999,
                backgroundColor: 'var(--bg-pastel-blue)',
                border: '1px solid var(--border-pastel-blue)',
                color: 'var(--text-blue)',
                fontWeight: 600
              }}>
                {transactions.length} {transactions.length === 1 ? 'item' : 'itens'}
              </span>
            </div>
            <p style={{ fontSize: '0.785rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              {category.description}
            </p>
            {distinctMerchants.length > 0 && (
              <div style={{ fontSize: '0.735rem', color: '#475569', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: 'var(--text-muted)' }}>Principais:</span>
                <span style={{ color: '#1E40AF', fontWeight: 600 }}>
                  {distinctMerchants.join(' • ')}{transactions.length > 3 ? '...' : ''}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Direita: Total Gasto + Percentuais + Botão Expandir */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: categoryTotal > 0 ? '#0F172A' : 'var(--text-muted)'
            }}>
              {formatBRL(categoryTotal)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <span>{percentOfExpenses.toFixed(1)}% dos gastos</span>
              {totalSalary > 0 && (
                <span>• {percentOfSalary.toFixed(1)}% do salário</span>
              )}
            </div>
          </div>

          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            backgroundColor: 'var(--bg-pastel-blue)',
            border: '1px solid var(--border-pastel-blue)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.25s ease',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
          }}>
            <ChevronDown size={18} color="#2563EB" />
          </div>
        </div>
      </div>

      {/* Área Expandida com Lista Detalhada de Transações */}
      {isExpanded && (
        <div style={{
          borderTop: '1px solid var(--border-pastel-blue)',
          backgroundColor: '#F8FAFD',
          padding: '16px 20px',
          animation: 'fadeIn 0.25s ease-out'
        }}>
          {/* Barra de Busca dentro da categoria */}
          {transactions.length > 3 && (
            <div style={{ marginBottom: 14, position: 'relative' }}>
              <Search size={14} color="#64748B" style={{ position: 'absolute', left: 12, top: 11 }} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Buscar em ${category.name}...`}
                className="input-field"
                style={{ paddingLeft: 34, fontSize: '0.85rem', padding: '8px 12px 8px 34px', backgroundColor: '#FFFFFF' }}
              />
            </div>
          )}

          {filteredTransactions.length === 0 ? (
            <div style={{
              padding: '24px 0',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.875rem'
            }}>
              {transactions.length === 0
                ? 'Nenhum lançamento registrado nesta categoria ainda.'
                : 'Nenhuma transação encontrada com o termo buscado.'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredTransactions.map((tx) => (
                <div
                  key={tx.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--border-pastel-blue)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12,
                    boxShadow: '0 2px 6px rgba(59, 130, 246, 0.04)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {/* Coluna 1: Data e Dia da Semana */}
                  <div style={{ minWidth: 150, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      backgroundColor: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Calendar size={15} color="#2563EB" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {tx.dateDisplay}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {tx.dayOfWeek}
                      </div>
                    </div>
                  </div>

                  {/* Coluna 2: Nome do Estabelecimento + Extrato Original + IA */}
                  <div style={{ flex: 1, minWidth: 240 }}>
                    {/* Nome do Estabelecimento em Destaque */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <Store size={15} color="#2563EB" style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.01em' }}>
                        {tx.merchantName || extractMerchantName(tx.description)}
                      </span>
                    </div>

                    {/* Descrição original do extrato bancário */}
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#64748B',
                      marginTop: 3,
                      fontFamily: 'monospace',
                      wordBreak: 'break-all'
                    }}>
                      Extrato: {tx.description || tx.originalText}
                    </div>

                    {/* Selo e Raciocínio da IA */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5, flexWrap: 'wrap' }}>
                      <span className="badge badge-ai" style={{ fontSize: '0.675rem' }}>
                        <Sparkles size={10} /> {tx.aiConfidence}% IA
                      </span>
                      {tx.aiReason && (
                        <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                          {tx.aiReason}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Coluna 3: Valor Monetário */}
                  <div style={{ minWidth: 120, textAlign: 'right' }}>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                      {formatBRL(tx.amount)}
                    </div>
                  </div>

                  {/* Coluna 4: Ações (Mover Categoria / Excluir) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ position: 'relative' }}>
                      <select
                        value={tx.category}
                        onChange={(e) => onRecategorize(tx.id, e.target.value as CategoryId, tx.description)}
                        style={{
                          backgroundColor: '#F8FAFC',
                          color: '#334155',
                          border: '1px solid #CBD5E1',
                          borderRadius: 'var(--radius-sm)',
                          padding: '5px 8px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          outline: 'none'
                        }}
                        title="Mudar categoria"
                      >
                        {Object.values(CATEGORIES).map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name.split('&')[0].trim()}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={() => onDeleteTransaction(tx.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '6px 8px', color: '#DC2626', backgroundColor: '#FEF2F2', borderColor: '#FECACA' }}
                      title="Excluir este lançamento"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
