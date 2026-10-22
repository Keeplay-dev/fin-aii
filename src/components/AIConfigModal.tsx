import React, { useState } from 'react';
import { getLearnedRules, resetLearnedRules, classifyTransaction } from '../services/aiEngine';
import type { ClassificationResult } from '../services/aiEngine';
import { CATEGORIES } from '../services/categories';
import { X, Cpu, Sparkles, Trash2, Layers } from 'lucide-react';

interface AIConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRulesChanged: () => void;
}

export const AIConfigModal: React.FC<AIConfigModalProps> = ({ isOpen, onClose, onRulesChanged }) => {
  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState<ClassificationResult | null>(null);

  if (!isOpen) return null;

  const learnedRules = getLearnedRules();

  const handleResetRules = () => {
    if (window.confirm('Deseja realmente limpar todas as regras memorizadas pela IA?')) {
      resetLearnedRules();
      onRulesChanged();
    }
  };

  const handleTestClassification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testInput.trim()) return;
    const res = classifyTransaction(testInput);
    setTestResult(res);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: 16
    }}>
      <div className="glass-panel animate-fade-in" style={{
        maxWidth: 580,
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: 24,
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Cpu size={22} color="#FFFFFF" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF' }}>
                Motor de Inteligência Artificial
              </h3>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                Configurações, aprendizado e testes do classificador financeiro
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: 4
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Seção 1: Testador em Tempo Real (Playground) */}
        <div style={{
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: 16,
          marginBottom: 20
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Sparkles size={16} color="#A78BFA" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF' }}>
              Simulador do Motor de IA
            </span>
          </div>

          <form onSubmit={handleTestClassification} style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <input
              type="text"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="Digite um texto (ex: POSTO IPIRANGA, PETZ, HABITACAO CAIXA)..."
              className="input-field"
              style={{ fontSize: '0.85rem' }}
            />
            <button type="submit" className="btn btn-primary btn-sm">
              Classificar
            </button>
          </form>

          {testResult && (
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              borderRadius: 'var(--radius-sm)',
              padding: 12,
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: CATEGORIES[testResult.category]?.textColor || '#FFFFFF' }}>
                  Categoria: {CATEGORIES[testResult.category]?.name || testResult.category}
                </span>
                <span className="badge badge-ai">
                  {testResult.confidence}% Confiança
                </span>
              </div>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                Motivo: {testResult.reason}
              </p>
            </div>
          )}
        </div>

        {/* Seção 2: Regras Memorizadas com o Usuário */}
        <div style={{
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: 16,
          marginBottom: 20
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Layers size={16} color="#34D399" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF' }}>
                Regras Aprendidas ({learnedRules.length})
              </span>
            </div>

            {learnedRules.length > 0 && (
              <button
                onClick={handleResetRules}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.7rem', padding: '3px 8px', color: '#F87171' }}
              >
                <Trash2 size={12} />
                <span>Limpar Memória</span>
              </button>
            )}
          </div>

          <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginBottom: 10 }}>
            Toda vez que você altera a categoria de um lançamento no extrato, a IA memoriza para classificar automaticamente nos próximos meses.
          </p>

          {learnedRules.length === 0 ? (
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Nenhuma regra customizada memorizada ainda. Use o extrato e altere categorias para treinar o motor.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 150, overflowY: 'auto' }}>
              {learnedRules.map((rule, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  fontSize: '0.775rem'
                }}>
                  <span style={{ fontWeight: 600, color: '#F1F5F9' }}>"{rule.merchantPattern}"</span>
                  <span style={{ color: CATEGORIES[rule.category]?.textColor || '#FFFFFF' }}>
                    → {CATEGORIES[rule.category]?.name.split('&')[0]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>



        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
          <button onClick={onClose} className="btn btn-primary">
            Concluído
          </button>
        </div>
      </div>
    </div>
  );
};
