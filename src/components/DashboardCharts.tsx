import React, { useState } from 'react';
import type { FinancialMetrics, Transaction, CategoryId } from '../types/finance';
import { CATEGORIES, CATEGORY_LIST } from '../services/categories';
import { PieChart, BarChart2, Info } from 'lucide-react';

interface DashboardChartsProps {
  metrics: FinancialMetrics;
  transactions: Transaction[];
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ metrics, transactions }) => {
  const [hoveredCategory, setHoveredCategory] = useState<CategoryId | null>(null);

  const { totalExpenses, categoryTotals } = metrics;

  // Formatação de moeda
  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    });
  };

  // Preparar dados do Gráfico de Rosca (Donut SVG)
  const radius = 80;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius;
  let accumulatedAngle = 0;

  // Categorias ativas com gastos > 0 ordenadas por valor decrescente
  const activeCategories = CATEGORY_LIST
    .map(cat => ({
      ...cat,
      amount: categoryTotals[cat.id] || 0,
      percentage: totalExpenses > 0 ? ((categoryTotals[cat.id] || 0) / totalExpenses) * 100 : 0
    }))
    .filter(c => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  // Preparar dados da evolução diária (dias 1 a 31)
  const dailySpendMap: Record<number, number> = {};
  for (const t of transactions) {
    if (t.type === 'expense') {
      try {
        const day = parseInt(t.date.split('-')[2], 10);
        dailySpendMap[day] = (dailySpendMap[day] || 0) + t.amount;
      } catch {
        // ignora erro de parse de dia
      }
    }
  }

  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);
  const maxDaySpend = Math.max(10, ...Object.values(dailySpendMap));

  // Dia com maior gasto
  let peakDay = 0;
  let peakAmount = 0;
  for (const [dayStr, amount] of Object.entries(dailySpendMap)) {
    if (amount > peakAmount) {
      peakAmount = amount;
      peakDay = parseInt(dayStr, 10);
    }
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
      gap: 20,
      marginBottom: 28
    }}>
      {/* Gráfico 1: Distribuição por Categoria (Donut SVG) */}
      <div className="glass-panel" style={{
        padding: 22,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        borderColor: 'var(--border-pastel-blue)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <PieChart size={18} color="#2563EB" />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Distribuição dos Gastos
            </h3>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {activeCategories.length} categorias ativas
          </span>
        </div>

        {totalExpenses === 0 ? (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 40,
            color: 'var(--text-muted)',
            fontSize: '0.9rem'
          }}>
            Nenhum gasto registrado para exibir o gráfico.
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
            {/* SVG Donut */}
            <div style={{ position: 'relative', width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="200" height="200" viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="transparent"
                  stroke="#F1F5F9"
                  strokeWidth={strokeWidth}
                />
                {activeCategories.map((cat) => {
                  const strokeDasharray = `${(cat.percentage / 100) * circumference} ${circumference}`;
                  const strokeDashoffset = -accumulatedAngle;
                  accumulatedAngle += (cat.percentage / 100) * circumference;

                  const isHovered = hoveredCategory === cat.id;

                  return (
                    <circle
                      key={cat.id}
                      cx="100"
                      cy="100"
                      r={radius}
                      fill="transparent"
                      stroke={cat.color}
                      strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      transform="rotate(-90 100 100)"
                      style={{
                        cursor: 'pointer',
                        transition: 'all 0.25s ease',
                        opacity: hoveredCategory && !isHovered ? 0.45 : 1
                      }}
                      onMouseEnter={() => setHoveredCategory(cat.id)}
                      onMouseLeave={() => setHoveredCategory(null)}
                    />
                  );
                })}
              </svg>

              {/* Informação Central do Donut */}
              <div style={{
                position: 'absolute',
                textAlign: 'center',
                pointerEvents: 'none'
              }}>
                {hoveredCategory && CATEGORIES[hoveredCategory] ? (
                  <div>
                    <div style={{ fontSize: '0.75rem', color: CATEGORIES[hoveredCategory].color, fontWeight: 700 }}>
                      {CATEGORIES[hoveredCategory].name.split('&')[0]}
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                      {formatBRL(categoryTotals[hoveredCategory] || 0)}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {metrics.categoryPercentages[hoveredCategory]?.toFixed(1)}% do total
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Total Mês
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>
                      {formatBRL(totalExpenses)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Legenda Lateral Interativa */}
            <div style={{ flex: 1, minWidth: 170, display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 200, overflowY: 'auto' }}>
              {activeCategories.slice(0, 6).map((cat) => (
                <div
                  key={cat.id}
                  onMouseEnter={() => setHoveredCategory(cat.id)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '5px 8px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: hoveredCategory === cat.id ? '#EFF6FF' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: cat.color }} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {cat.name.split('&')[0].trim()}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                    {cat.percentage.toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Gráfico 2: Evolução Diária dos Gastos ao Longo do Mês */}
      <div className="glass-panel" style={{
        padding: 22,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        borderColor: 'var(--border-pastel-blue)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BarChart2 size={18} color="#059669" />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Evolução Diária dos Gastos
            </h3>
          </div>

          {peakDay > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#B91C1C' }}>
              <Info size={13} />
              <span>Pico no dia {peakDay} ({formatBRL(peakAmount)})</span>
            </div>
          )}
        </div>

        {totalExpenses === 0 ? (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 40,
            color: 'var(--text-muted)',
            fontSize: '0.9rem'
          }}>
            Carregue um extrato para visualizar os dias com maiores saídas financeiras.
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            {/* Gráfico de barras verticais para os dias */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 3,
              height: 140,
              paddingBottom: 8,
              borderBottom: '1px solid #E2E8F0'
            }}>
              {daysInMonth.map((day) => {
                const amount = dailySpendMap[day] || 0;
                const heightPercent = maxDaySpend > 0 ? (amount / maxDaySpend) * 100 : 0;
                const isPeak = day === peakDay;

                return (
                  <div
                    key={day}
                    style={{
                      flex: 1,
                      height: '100%',
                      display: 'flex',
                      alignItems: 'flex-end',
                      position: 'relative'
                    }}
                    title={`Dia ${day}: ${formatBRL(amount)}`}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: `${Math.max(amount > 0 ? 6 : 2, heightPercent)}%`,
                        background: amount > 0
                          ? isPeak
                            ? 'linear-gradient(180deg, #F87171 0%, #EF4444 100%)'
                            : 'linear-gradient(180deg, #60A5FA 0%, #3B82F6 100%)'
                          : '#F1F5F9',
                        borderRadius: '3px 3px 0 0',
                        transition: 'all 0.2s ease',
                        cursor: amount > 0 ? 'pointer' : 'default'
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Marcadores de Dias */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.7rem',
              color: 'var(--text-muted)',
              marginTop: 6
            }}>
              <span>Dia 01</span>
              <span>Dia 08</span>
              <span>Dia 15</span>
              <span>Dia 22</span>
              <span>Dia 31</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
