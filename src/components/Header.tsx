import React from 'react';
import { Sparkles, PlusCircle, Trash2, Printer, LogOut } from 'lucide-react';
import type { User } from '../types/auth';

interface HeaderProps {
  onOpenManualModal: () => void;
  onOpenPDFModal: () => void;
  onClearData: () => void;
  hasData: boolean;
  currentUser?: User | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenManualModal,
  onOpenPDFModal,
  onClearData,
  hasData,
  currentUser,
  onLogout
}) => {
  return (
    <header className="no-print" style={{
      borderBottom: '1px solid var(--border-pastel-blue)',
      backgroundColor: '#FFFFFF',
      boxShadow: '0 2px 10px rgba(59, 130, 246, 0.05)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      padding: '14px 20px'
    }}>
      <div style={{
        maxWidth: 1240,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 14
      }}>
        {/* Logo & Título Solicitado */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
          }}>
            <Sparkles size={22} color="#FFFFFF" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#0F172A' }}>
              Fin<span style={{ color: '#2563EB' }}>AI</span>
            </h1>
            <p style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 500 }}>
              Gestão Financeira & Análise Inteligente
            </p>
          </div>
        </div>

        {/* Botões de Ação */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Botão para Gerar PDF do Mês */}
          <button
            onClick={onOpenPDFModal}
            className="btn btn-primary btn-sm"
            title="Gerar e salvar relatório em PDF com os dados do mês"
          >
            <Printer size={16} />
            <span>Gerar PDF do Mês</span>
          </button>



          {/* Botão Novo Lançamento */}
          <button
            onClick={onOpenManualModal}
            className="btn btn-secondary btn-sm"
            title="Lançar gasto ou receita manualmente"
          >
            <PlusCircle size={16} color="#059669" />
            <span>Novo Lançamento</span>
          </button>

          {/* Botão Limpar */}
          {hasData && (
            <button
              onClick={onClearData}
              className="btn btn-secondary btn-sm"
              style={{ color: '#DC2626', borderColor: '#FECACA', backgroundColor: '#FEF2F2' }}
              title="Limpar todos os dados carregados"
            >
              <Trash2 size={16} />
              <span>Limpar</span>
            </button>
          )}

          {/* Usuário Logado & Logout */}
          {currentUser && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              paddingLeft: 10,
              borderLeft: '1px solid #E2E8F0',
              marginLeft: 4
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                backgroundColor: '#F8FAFC',
                border: '1px solid #CBD5E1',
                padding: '4px 10px',
                borderRadius: 20
              }}>
                <div style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                  <span style={{ fontSize: '0.785rem', fontWeight: 700, color: '#0F172A' }}>
                    {currentUser.name}
                  </span>
                  <span style={{ fontSize: '0.675rem', color: '#64748B' }}>
                    @{currentUser.username}
                  </span>
                </div>
              </div>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="btn btn-secondary btn-sm"
                  style={{
                    padding: '6px 10px',
                    color: '#64748B',
                    borderColor: '#CBD5E1',
                    fontSize: '0.75rem',
                    gap: 4
                  }}
                  title="Encerrar sessão e voltar para a tela de login"
                >
                  <LogOut size={14} />
                  <span>Sair</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
