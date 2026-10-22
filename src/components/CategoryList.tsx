import React, { useState } from 'react';
import type { CategoryId, Transaction } from '../types/finance';
import { CATEGORIES } from '../services/categories';
import { CategoryCard } from './CategoryCard';
import { Layers } from 'lucide-react';

interface CategoryListProps {
  transactions: Transaction[];
  totalSalary: number;
  totalExpenses: number;
  onRecategorize: (transactionId: string, newCategory: CategoryId, description: string) => void;
  onDeleteTransaction: (transactionId: string) => void;
}

// Ordem prioritária conforme pedido pelo usuário
const PRIORITY_ORDER: CategoryId[] = [
  'comida',
  'gasolina',
  'transporte',
  'financiamentos',
  'saude',
  'pet',
  'moradia',
  'lazer',
  'outros'
];

export const CategoryList: React.FC<CategoryListProps> = ({
  transactions,
  totalSalary,
  totalExpenses,
  onRecategorize,
  onDeleteTransaction
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | CategoryId>('all');

  // Agrupar transações por categoria
  const transactionsByCategory: Record<CategoryId, Transaction[]> = {
    comida: [],
    gasolina: [],
    transporte: [],
    financiamentos: [],
    saude: [],
    pet: [],
    moradia: [],
    lazer: [],
    outros: []
  };

  for (const t of transactions) {
    if (transactionsByCategory[t.category]) {
      transactionsByCategory[t.category].push(t);
    } else {
      transactionsByCategory.outros.push(t);
    }
  }

  // Ordenar transações internas por data decrescente
  for (const catId of Object.keys(transactionsByCategory) as CategoryId[]) {
    transactionsByCategory[catId].sort((a, b) => b.date.localeCompare(a.date));
  }

  const displayedCategories = activeFilter === 'all'
    ? PRIORITY_ORDER
    : [activeFilter];

  return (
    <div style={{ marginBottom: 40 }}>
      {/* Título da Seção e Filtros */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 14,
        marginBottom: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Layers size={18} color="#2563EB" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Detalhamento por Categorias
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Clique em qualquer categoria para expandir e auditar todos os lançamentos
            </p>
          </div>
        </div>

        {/* Filtros rápidos tipo pílula */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveFilter('all')}
            style={{
              padding: '6px 14px',
              borderRadius: 9999,
              fontSize: '0.775rem',
              fontWeight: 700,
              border: activeFilter === 'all' ? '1px solid #2563EB' : '1px solid #BFDBFE',
              cursor: 'pointer',
              backgroundColor: activeFilter === 'all' ? '#2563EB' : '#EFF6FF',
              color: activeFilter === 'all' ? '#FFFFFF' : '#1E40AF',
              transition: 'all 0.15s ease'
            }}
          >
            Todas ({transactions.length})
          </button>

          {PRIORITY_ORDER.slice(0, 6).map((id) => {
            const count = transactionsByCategory[id].length;
            const cat = CATEGORIES[id];
            const isSelected = activeFilter === id;
            return (
              <button
                key={id}
                onClick={() => setActiveFilter(id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 9999,
                  fontSize: '0.775rem',
                  fontWeight: 700,
                  border: isSelected ? `1px solid ${cat.color}` : '1px solid #E2E8F0',
                  cursor: 'pointer',
                  backgroundColor: isSelected ? cat.color : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : '#475569',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat.name.split('&')[0].trim()} {count > 0 && `(${count})`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid vertical de Cards Expansíveis */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {displayedCategories.map((catId) => (
          <CategoryCard
            key={catId}
            categoryId={catId}
            transactions={transactionsByCategory[catId]}
            totalSalary={totalSalary}
            totalExpenses={totalExpenses}
            onRecategorize={onRecategorize}
            onDeleteTransaction={onDeleteTransaction}
          />
        ))}
      </div>
    </div>
  );
};
