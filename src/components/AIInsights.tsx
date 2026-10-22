import React from 'react';
import type { AIAdvisorInsight } from '../types/finance';
import { Sparkles, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';

interface AIInsightsProps {
  insights: AIAdvisorInsight[];
}

export const AIInsights: React.FC<AIInsightsProps> = ({ insights }) => {
  if (insights.length === 0) return null;

  return (
    <div style={{ marginBottom: 30 }}>
      {/* Header do Diagnóstico Financeiro */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
          }}>
            <Sparkles size={18} color="#FFFFFF" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Diagnóstico Financeiro
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Análise dos seus gastos reais e saúde orçamentária com base no seu salário
            </p>
          </div>
        </div>
      </div>

      {/* Grid de Cards de Insights */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
        gap: 14
      }}>
        {insights.map((insight) => {
          let borderColor = '#BFDBFE';
          let icon = <Lightbulb size={20} color="#2563EB" />;
          let bgColor = '#EFF6FF';
          let titleColor = '#1E3A8A';
          let textColor = '#1E40AF';

          if (insight.type === 'alert') {
            borderColor = '#FECACA';
            bgColor = '#FEF2F2';
            titleColor = '#991B1B';
            textColor = '#B91C1C';
            icon = <AlertTriangle size={20} color="#DC2626" />;
          } else if (insight.type === 'praise') {
            borderColor = '#A7F3D0';
            bgColor = '#F0FDF4';
            titleColor = '#065F46';
            textColor = '#047857';
            icon = <CheckCircle size={20} color="#059669" />;
          }

          return (
            <div
              key={insight.id}
              className="glass-panel"
              style={{
                padding: '16px 18px',
                borderColor,
                backgroundColor: bgColor,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 10
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ flexShrink: 0 }}>{icon}</div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: titleColor, lineHeight: 1.3 }}>
                    {insight.title}
                  </h4>
                </div>
                <p style={{ fontSize: '0.835rem', color: textColor, lineHeight: 1.5 }}>
                  {insight.message}
                </p>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: 8,
                borderTop: `1px solid ${borderColor}`,
                fontSize: '0.725rem',
                color: '#64748B'
              }}>
                <span style={{ textTransform: 'capitalize' }}>
                  Impacto: <strong>{insight.impactLevel === 'high' ? 'Alto' : insight.impactLevel === 'medium' ? 'Médio' : 'Leve'}</strong>
                </span>
                <span className="badge badge-ai" style={{ fontSize: '0.65rem' }}>
                  Diagnóstico FinAI
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
