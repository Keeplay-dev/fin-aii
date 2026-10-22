import React, { useState } from 'react';
import type { FinancialMetrics, Transaction } from '../types/finance';
import {
  getSavedGeminiKey,
  setSavedGeminiKey,
  generateFinancialAuditWithGemini,
  askGeminiAssistant
} from '../services/geminiService';
import { X, Sparkles, Send, Key, Loader2, Bot, Check, AlertCircle } from 'lucide-react';

interface GeminiAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: FinancialMetrics;
  transactions: Transaction[];
}

export const GeminiAdvisorModal: React.FC<GeminiAdvisorModalProps> = ({
  isOpen,
  onClose,
  metrics,
  transactions
}) => {
  const [apiKey, setApiKey] = useState(getSavedGeminiKey());
  const [keySaved, setKeySaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'audit' | 'chat'>('audit');

  // Estado da Análise Executiva
  const [auditText, setAuditText] = useState<string | null>(null);
  const [isGeneratingAudit, setIsGeneratingAudit] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);

  // Estado do Chat / Perguntas
  const [question, setQuestion] = useState('');
  const [chatAnswer, setChatAnswer] = useState<string | null>(null);
  const [isGeneratingChat, setIsGeneratingChat] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveKey = () => {
    setSavedGeminiKey(apiKey);
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
  };

  const handleRunAudit = async () => {
    if (!apiKey.trim()) {
      setAuditError('Por favor, informe sua chave de API Gemini no campo acima.');
      return;
    }
    setAuditError(null);
    setIsGeneratingAudit(true);
    try {
      const result = await generateFinancialAuditWithGemini(metrics, transactions, apiKey);
      setAuditText(result);
    } catch (err: any) {
      setAuditError(err.message || 'Erro ao gerar análise com Gemini.');
    } finally {
      setIsGeneratingAudit(false);
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    if (!apiKey.trim()) {
      setChatError('Por favor, informe sua chave de API Gemini no campo acima.');
      return;
    }
    setChatError(null);
    setIsGeneratingChat(true);
    try {
      const answer = await askGeminiAssistant(question, metrics, transactions, apiKey);
      setChatAnswer(answer);
    } catch (err: any) {
      setChatError(err.message || 'Erro ao consultar o assistente.');
    } finally {
      setIsGeneratingChat(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.45)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: 16
    }}>
      <div className="glass-panel animate-fade-in" style={{
        maxWidth: 680,
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: 24,
        position: 'relative',
        backgroundColor: '#FFFFFF',
        borderColor: 'var(--border-pastel-blue)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
            }}>
              <Bot size={22} color="#FFFFFF" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                IA Generativa Google Gemini
              </h3>
              <p style={{ fontSize: '0.785rem', color: 'var(--text-secondary)' }}>
                Consultoria executiva e respostas inteligentes sobre suas finanças
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

        {/* Configuração da Chave Gemini API */}
        <div style={{
          backgroundColor: 'var(--bg-pastel-blue)',
          border: '1px solid var(--border-pastel-blue)',
          borderRadius: 'var(--radius-md)',
          padding: 14,
          marginBottom: 18
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-blue)' }}>
              <Key size={15} />
              <span>Chave de API do Gemini (Google AI Studio)</span>
            </div>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: '0.75rem', color: '#2563EB', textDecoration: 'none', fontWeight: 600 }}
            >
              Obter chave gratuita ↗
            </a>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Cole sua API Key do Gemini aqui..."
              className="input-field"
              style={{ fontSize: '0.85rem', padding: '8px 12px' }}
            />
            <button onClick={handleSaveKey} className="btn btn-secondary btn-sm" style={{ flexShrink: 0 }}>
              {keySaved ? <Check size={14} color="#059669" /> : null}
              <span>{keySaved ? 'Salva!' : 'Salvar'}</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--border-subtle)', marginBottom: 16 }}>
          <button
            onClick={() => setActiveTab('audit')}
            style={{
              padding: '8px 16px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.875rem',
              color: activeTab === 'audit' ? '#2563EB' : 'var(--text-muted)',
              borderBottom: activeTab === 'audit' ? '2px solid #2563EB' : '2px solid transparent'
            }}
          >
            Diagnóstico Executivo do Mês
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            style={{
              padding: '8px 16px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.875rem',
              color: activeTab === 'chat' ? '#2563EB' : 'var(--text-muted)',
              borderBottom: activeTab === 'chat' ? '2px solid #2563EB' : '2px solid transparent'
            }}
          >
            Perguntar à IA
          </button>
        </div>

        {/* Tab 1: Diagnóstico Executivo */}
        {activeTab === 'audit' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Gera um relatório completo sobre seus gastos, alertando sobre custos com comida, combustível, financiamentos e sugerindo metas.
              </p>
              <button
                onClick={handleRunAudit}
                disabled={isGeneratingAudit}
                className="btn btn-primary btn-sm"
                style={{ flexShrink: 0 }}
              >
                {isGeneratingAudit ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={15} />}
                <span>{isGeneratingAudit ? 'Gerando...' : 'Gerar Análise'}</span>
              </button>
            </div>

            {auditError && (
              <div style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#B91C1C',
                fontSize: '0.825rem',
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <AlertCircle size={16} />
                <span>{auditError}</span>
              </div>
            )}

            {auditText ? (
              <div style={{
                backgroundColor: 'var(--bg-pastel-blue-light)',
                border: '1px solid var(--border-pastel-blue)',
                borderRadius: 'var(--radius-md)',
                padding: 18,
                fontSize: '0.875rem',
                lineHeight: 1.6,
                color: 'var(--text-primary)',
                whiteSpace: 'pre-wrap'
              }}>
                {auditText}
              </div>
            ) : !isGeneratingAudit ? (
              <div style={{
                padding: '36px 20px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                backgroundColor: 'var(--bg-pastel-blue)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem'
              }}>
                Clique em "Gerar Análise" para conectar à API do Gemini e avaliar seus dados financeiros deste mês.
              </div>
            ) : null}
          </div>
        )}

        {/* Tab 2: Perguntar à IA */}
        {activeTab === 'chat' && (
          <div>
            <form onSubmit={handleAskQuestion} style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ex: 'Quanto gastei com combustível?', 'Qual foi meu maior gasto?'..."
                className="input-field"
                style={{ fontSize: '0.875rem' }}
              />
              <button
                type="submit"
                disabled={isGeneratingChat}
                className="btn btn-primary btn-sm"
                style={{ flexShrink: 0 }}
              >
                {isGeneratingChat ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={15} />}
                <span>Enviar</span>
              </button>
            </form>

            {chatError && (
              <div style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#B91C1C',
                fontSize: '0.825rem',
                marginBottom: 12
              }}>
                {chatError}
              </div>
            )}

            {chatAnswer && (
              <div style={{
                backgroundColor: 'var(--bg-pastel-blue-light)',
                border: '1px solid var(--border-pastel-blue)',
                borderRadius: 'var(--radius-md)',
                padding: 16,
                fontSize: '0.875rem',
                lineHeight: 1.6,
                color: 'var(--text-primary)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, color: '#2563EB', fontWeight: 700 }}>
                  <Sparkles size={15} />
                  <span>Resposta do Assistente Gemini:</span>
                </div>
                {chatAnswer}
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
          <button onClick={onClose} className="btn btn-secondary">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
