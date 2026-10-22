import React from 'react';
import { Sparkles, PlusCircle, Trash2, Printer, LogOut, RefreshCw } from 'lucide-react';
import type { User } from '../types/auth';

interface HeaderProps {
  onOpenManualModal: () => void;
  onOpenPDFModal: () => void;
  onClearData: () => void;
  hasData: boolean;
  currentUser?: User | null;
  onLogout?: () => void;
  onSync?: () => void;
  isSyncing?: boolean;
  lastSyncTime?: Date | null;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenManualModal,
  onOpenPDFModal,
  onClearData,
  hasData,
  currentUser,
  onLogout,
  onSync,
  isSyncing = false
}) => {
  return (
    <header className="no-print" style={{
      borderBottom: '1px solid var(--border-pastel-blue)',
      backgroundColor: '#FFFFFF',
      boxShadow: '0 2px 10px rgba(59, 130, 246, 0.05)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      padding: '10px 16px'
    }}>
      <div style={{
        maxWidth: 1240,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 10
      }}>
        {/* Logo & Título */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
            flexShrink: 0
          }}>
            <Sparkles size={20} color="#FFFFFF" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#0F172A', lineHeight: 1.1 }}>
              Fin<span style={{ color: '#2563EB' }}>AI</span>
            </h1>
            <p className="hide-on-mobile" style={{ fontSize: '0.785rem', color: '#475569', fontWeight: 500, marginTop: 2 }}>
              Gestão Financeira & Análise Inteligente
            </p>
          </div>
        </div>

        {/* Botões de Ação */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Botão Sincronizar em Tempo Real com Nuvem */}
          {currentUser && onSync && (
            <button
              onClick={onSync}
              disabled={isSyncing}
              className="btn btn-secondary btn-sm"
              title="Sincronizar em tempo real com outros dispositivos (computador / celular)"
              style={{
                color: '#1E40AF',
                borderColor: '#BFDBFE',
                backgroundColor: isSyncing ? '#EFF6FF' : '#F0FDF4',
                cursor: isSyncing ? 'wait' : 'pointer'
              }}
            >
              <RefreshCw size={14} color="#059669" className={isSyncing ? 'animate-spin-sync' : ''} />
              <span className="hide-on-mobile">{isSyncing ? 'Sincronizando...' : 'Sincronizar'}</span>
            </button>
          )}

          {/* Botão para Gerar PDF do Mês */}
          <button
            onClick={onOpenPDFModal}
            className="btn btn-primary btn-sm"
            title="Gerar e salvar relatório em PDF com os dados do mês"
          >
            <Printer size={15} />
            <span><span className="hide-on-mobile">Gerar </span>PDF<span className="hide-on-mobile"> do Mês</span></span>
          </button>

          {/* Botão Novo Lançamento */}
          <button
            onClick={onOpenManualModal}
            className="btn btn-secondary btn-sm"
            title="Lançar gasto ou receita manualmente"
          >
            <PlusCircle size={15} color="#059669" />
            <span><span className="hide-on-mobile">Novo </span>Lançamento</span>
          </button>

          {/* Botão Limpar */}
          {hasData && (
            <button
              onClick={onClearData}
              className="btn btn-secondary btn-sm"
              style={{ color: '#DC2626', borderColor: '#FECACA', backgroundColor: '#FEF2F2' }}
              title="Limpar todos os dados carregados"
            >
              <Trash2 size={15} />
              <span className="hide-on-mobile">Limpar</span>
            </button>
          )}

          {/* Usuário Logado & Logout */}
          {currentUser && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              paddingLeft: 6,
              borderLeft: '1px solid #E2E8F0',
              marginLeft: 2
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                backgroundColor: '#F8FAFC',
                border: '1px solid #CBD5E1',
                padding: '3px 8px',
                borderRadius: 20
              }}>
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.725rem',
                  fontWeight: 700,
                  flexShrink: 0
                }}>
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0F172A', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {currentUser.name}
                  </span>
                  <span className="hide-on-mobile" style={{ fontSize: '0.65rem', color: '#64748B' }}>
                    @{currentUser.username}
                  </span>
                </div>
              </div>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="btn btn-secondary btn-sm"
                  style={{
                    padding: '5px 8px',
                    color: '#64748B',
                    borderColor: '#CBD5E1',
                    fontSize: '0.725rem',
                    gap: 4
                  }}
                  title="Encerrar sessão e voltar para a tela de login"
                >
                  <LogOut size={13} />
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
