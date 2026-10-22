import React, { useState } from 'react';
import type { CategoryId, Transaction } from '../types/finance';
import { CATEGORIES, CATEGORY_LIST } from '../services/categories';
import { classifyTransaction } from '../services/aiEngine';
import { extractMerchantName } from '../services/merchantExtractor';
import { getDayOfWeekFromDate } from '../services/pdfParser';
import { X, Sparkles, PlusCircle } from 'lucide-react';

interface ManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (transaction: Transaction) => void;
}

export const ManualModal: React.FC<ManualModalProps> = ({ isOpen, onClose, onAddTransaction }) => {
  const today = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(today);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<CategoryId>('comida');
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  if (!isOpen) return null;

  // Auto-sugestão em tempo real conforme o usuário digita
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDescription(val);
    if (val.trim().length >= 3) {
      const result = classifyTransaction(val);
      setCategory(result.category);
      setAiSuggestion(`${result.confidence}% de certeza (${CATEGORIES[result.category].name})`);
    } else {
      setAiSuggestion(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (!description.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    const [year, month, day] = date.split('-');
    const dateDisplay = `${day}/${month}/${year}`;
    const dayOfWeek = getDayOfWeekFromDate(date);
    const classification = classifyTransaction(description);
    const merchantName = extractMerchantName(description);

    const newTx: Transaction = {
      id: `manual_${Date.now()}`,
      date,
      dateDisplay,
      dayOfWeek,
      merchantName,
      description: description.trim(),
      originalText: `Manual: ${description}`,
      amount: parsedAmount,
      type: 'expense',
      category,
      aiConfidence: classification.confidence,
      aiSource: 'manual',
      aiReason: 'Lançamento manual pelo usuário'
    };

    onAddTransaction(newTx);
    onClose();
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
        maxWidth: 480,
        width: '100%',
        padding: 24,
        position: 'relative',
        backgroundColor: '#FFFFFF',
        borderColor: 'var(--border-pastel-blue)'
      }}>
        {/* Header do Modal */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
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
              <PlusCircle size={20} color="#2563EB" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Novo Lançamento
              </h3>
              <p style={{ fontSize: '0.785rem', color: 'var(--text-secondary)' }}>
                Adicione um gasto avulso não presente no extrato
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

        {/* Formulário */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
              Descrição do Estabelecimento / Gasto:
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={handleDescriptionChange}
              placeholder="Ex: Posto Shell, Petz, iFood, Farmácia..."
              className="input-field"
              autoFocus
            />
            {aiSuggestion && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: '0.75rem', color: '#A78BFA' }}>
                <Sparkles size={12} />
                <span>IA detectou: {aiSuggestion}</span>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                Valor (R$):
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Ex: 85.50"
                className="input-field"
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                Data do Gasto:
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
              Categoria:
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CategoryId)}
              className="input-field"
              style={{ cursor: 'pointer' }}
            >
              {CATEGORY_LIST.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Salvar Lançamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
