import React, { useState } from 'react';
import type { FinancialMetrics } from '../types/finance';
import { Wallet, TrendingDown, PiggyBank, Edit3, Check, AlertTriangle, ShieldAlert } from 'lucide-react';

interface SalaryCardProps {
  metrics: FinancialMetrics;
  onUpdateSalary: (newSalary: number) => void;
}

export const SalaryCard: React.FC<SalaryCardProps> = ({ metrics, onUpdateSalary }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempSalary, setTempSalary] = useState(metrics.salary.toString());

  const handleSave = () => {
    const val = parseFloat(tempSalary.replace(',', '.'));
    if (!isNaN(val) && val >= 0) {
      onUpdateSalary(val);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setTempSalary(metrics.salary.toString());
      setIsEditing(false);
    }
  };

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    });
  };

  const isPositive = metrics.remainingSalary >= 0;
  const progressPercent = Math.min(100, Math.max(0, metrics.spentPercentage));

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: 16,
      marginBottom: 24
    }}>
      {/* Card 1: Meu Salário */}
      <div className="glass-panel" style={{
        padding: 22,
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
        borderColor: 'var(--border-pastel-blue)'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: 4,
          background: 'linear-gradient(90deg, #3B82F6, #60A5FA)'
        }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Wallet size={18} color="#2563EB" />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E40AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Salário Mensal
            </span>
          </div>

          <button
            onClick={() => {
              if (isEditing) handleSave();
              else {
                setTempSalary(metrics.salary.toString());
                setIsEditing(true);
              }
            }}
            className="btn btn-secondary btn-sm"
            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
          >
            {isEditing ? <Check size={14} color="#059669" /> : <Edit3 size={14} />}
            <span>{isEditing ? 'Salvar' : 'Editar'}</span>
          </button>
        </div>

        {isEditing ? (
          <div style={{ marginTop: 10 }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
              Digite seu salário líquido mensal (R$):
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="number"
                step="50"
                value={tempSalary}
                onChange={(e) => setTempSalary(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                className="input-field"
                placeholder="Ex: 5000"
                style={{ fontSize: '1.25rem', fontWeight: 700 }}
              />
              <button onClick={handleSave} className="btn btn-primary btn-sm">
                OK
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1E3A8A', letterSpacing: '-0.02em' }}>
              {formatBRL(metrics.salary)}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Renda líquida base para o controle financeiro
            </p>
          </div>
        )}
      </div>

      {/* Card 2: Total de Gastos */}
      <div className="glass-panel" style={{
        padding: 22,
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
        borderColor: '#FECACA'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: 4,
          background: 'linear-gradient(90deg, #EF4444, #F87171)'
        }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TrendingDown size={18} color="#DC2626" />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#B91C1C', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total de Gastos
            </span>
          </div>

          <span className={`badge ${metrics.spentPercentage > 85 ? 'badge-danger' : 'badge-warning'}`}>
            {metrics.spentPercentage.toFixed(1)}% da renda
          </span>
        </div>

        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#B91C1C', letterSpacing: '-0.02em' }}>
          {formatBRL(metrics.totalExpenses)}
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
          {metrics.transactionCount} lançamentos categorizados no mês
        </p>

        {/* Progress bar de comprometimento */}
        <div style={{
          marginTop: 14,
          height: 7,
          backgroundColor: '#F1F5F9',
          borderRadius: 9999,
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${progressPercent}%`,
            background: progressPercent > 90
              ? 'linear-gradient(90deg, #F59E0B, #EF4444)'
              : 'linear-gradient(90deg, #3B82F6, #60A5FA)',
            borderRadius: 9999,
            transition: 'width 0.4s ease'
          }} />
        </div>
      </div>

      {/* Card 3: QUANTO SOBROU DO SALÁRIO (Destaque Principal) */}
      <div className="glass-panel" style={{
        padding: 22,
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: isPositive ? '#F0FDF4' : '#FEF2F2',
        borderColor: isPositive ? '#A7F3D0' : '#FECACA',
        boxShadow: isPositive ? '0 4px 14px rgba(16, 185, 129, 0.12)' : '0 4px 14px rgba(239, 68, 68, 0.12)'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: 4,
          background: isPositive
            ? 'linear-gradient(90deg, #10B981, #34D399)'
            : 'linear-gradient(90deg, #EF4444, #F87171)'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: isPositive ? '#ECFDF5' : '#FEF2F2',
              border: `1px solid ${isPositive ? '#A7F3D0' : '#FECACA'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {isPositive ? (
                <PiggyBank size={18} color="#059669" />
              ) : (
                <AlertTriangle size={18} color="#DC2626" />
              )}
            </div>
            <span style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: isPositive ? '#047857' : '#B91C1C',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {isPositive ? 'Quanto Sobrou do Salário' : 'Déficit Salarial'}
            </span>
          </div>

          <span className={`badge ${isPositive ? 'badge-positive' : 'badge-danger'}`}>
            {isPositive ? `+${metrics.savingsPercentage.toFixed(1)}% Poupança` : 'Estourou o Salário'}
          </span>
        </div>

        <div style={{
          fontSize: '2.1rem',
          fontWeight: 800,
          color: isPositive ? '#065F46' : '#991B1B',
          letterSpacing: '-0.02em'
        }}>
          {formatBRL(metrics.remainingSalary)}
        </div>

        <p style={{
          fontSize: '0.8rem',
          color: isPositive ? '#047857' : '#B91C1C',
          marginTop: 4,
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          {isPositive ? (
            <>Saldo livre para poupar, investir ou realizar planos futuros.</>
          ) : (
            <><ShieldAlert size={14} /> Atenção: você gastou mais do que recebeu este mês.</>
          )}
        </p>
      </div>
    </div>
  );
};
