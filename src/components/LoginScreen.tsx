import React, { useState } from 'react';
import {
  Sparkles,
  User as UserIcon,
  AtSign,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import type { User } from '../types/auth';
import { validatePassword, registerAccount, loginAccount } from '../services/authService';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Validação dinâmica da senha
  const passValidation = validatePassword(password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (mode === 'register') {
      if (!name.trim()) {
        setErrorMessage('Por favor, preencha o seu nome completo.');
        return;
      }
      if (!username.trim()) {
        setErrorMessage('Por favor, informe um nome de usuário.');
        return;
      }
      if (!passValidation.isValid) {
        setErrorMessage('A senha precisa atender a todos os requisitos de segurança abaixo.');
        return;
      }

      const res = registerAccount(name, username, password);
      if (!res.success) {
        setErrorMessage(res.message || 'Erro ao realizar cadastro.');
        return;
      }
      if (res.user) {
        onLoginSuccess(res.user);
      }
    } else {
      // Modo login
      if (!username.trim()) {
        setErrorMessage('Informe seu nome de usuário ou nome.');
        return;
      }
      if (!password) {
        setErrorMessage('Por favor, digite sua senha.');
        return;
      }

      const res = loginAccount(username, password);
      if (!res.success) {
        setErrorMessage(res.message || 'Credenciais inválidas.');
        return;
      }
      if (res.user) {
        onLoginSuccess(res.user);
      }
    }
  };

  // Preenchimento de demonstração rápida
  const handleQuickDemo = () => {
    setName('Rafael Silva');
    setUsername('rafael');
    setPassword('Fin@2026');
    setErrorMessage(null);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #0F172A 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Elementos visuais de fundo brilhantes (Glowing Orbs) */}
      <div style={{
        position: 'absolute',
        top: '-15%',
        left: '-10%',
        width: 500,
        height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, rgba(59, 130, 246, 0) 70%)',
        filter: 'blur(60px)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-15%',
        right: '-10%',
        width: 550,
        height: 550,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(99, 102, 241, 0) 70%)',
        filter: 'blur(70px)',
        pointerEvents: 'none'
      }} />

      {/* Cartão Central de Login / Cadastro */}
      <div style={{
        maxWidth: 480,
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderRadius: 20,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.2)',
        padding: '36px 32px',
        position: 'relative',
        zIndex: 10,
        backdropFilter: 'blur(20px)'
      }}>
        {/* Cabeçalho da Marca FinAI */}
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <div style={{
            width: 54,
            height: 54,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(37, 99, 235, 0.35)',
            marginBottom: 12
          }}>
            <Sparkles size={28} color="#FFFFFF" />
          </div>
          <h1 style={{
            fontSize: '1.65rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#0F172A',
            margin: 0
          }}>
            Fin<span style={{ color: '#2563EB' }}>AI</span>
          </h1>
          <p style={{
            fontSize: '0.85rem',
            color: '#64748B',
            marginTop: 4,
            fontWeight: 500
          }}>
            Gestão Financeira & Análise Orçamentária
          </p>
        </div>

        {/* Alternador de Modo (Cadastrar vs Entrar) */}
        <div style={{
          display: 'flex',
          backgroundColor: '#F1F5F9',
          borderRadius: 12,
          padding: 4,
          marginBottom: 24
        }}>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMessage(null); }}
            style={{
              flex: 1,
              padding: '9px 12px',
              borderRadius: 9,
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backgroundColor: mode === 'register' ? '#FFFFFF' : 'transparent',
              color: mode === 'register' ? '#1E40AF' : '#64748B',
              boxShadow: mode === 'register' ? '0 2px 8px rgba(0, 0, 0, 0.08)' : 'none'
            }}
          >
            Cadastrar-se
          </button>
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMessage(null); }}
            style={{
              flex: 1,
              padding: '9px 12px',
              borderRadius: 9,
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backgroundColor: mode === 'login' ? '#FFFFFF' : 'transparent',
              color: mode === 'login' ? '#1E40AF' : '#64748B',
              boxShadow: mode === 'login' ? '0 2px 8px rgba(0, 0, 0, 0.08)' : 'none'
            }}
          >
            Entrar
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Campo: Nome Completo (exibido no cadastro ou opcional no login) */}
          {mode === 'register' && (
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#334155',
                marginBottom: 6
              }}>
                Nome Completo
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94A3B8'
                }}>
                  <UserIcon size={18} />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Rafael Silva"
                  required
                  style={{
                    width: '100%',
                    padding: '11px 14px 11px 42px',
                    borderRadius: 10,
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.9rem',
                    backgroundColor: '#F8FAFC',
                    color: '#0F172A',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2563EB'}
                  onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}
                />
              </div>
            </div>
          )}

          {/* Campo: Nome de Usuário */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#334155',
              marginBottom: 6
            }}>
              Nome de Usuário
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94A3B8'
              }}>
                <AtSign size={18} />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={mode === 'register' ? 'Ex: rafael ou rafael.silva' : 'Seu usuário cadastrado'}
                required
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 42px',
                  borderRadius: 10,
                  border: '1.5px solid #CBD5E1',
                  fontSize: '0.9rem',
                  backgroundColor: '#F8FAFC',
                  color: '#0F172A',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2563EB'}
                onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}
              />
            </div>
          </div>

          {/* Campo: Senha */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#334155',
              marginBottom: 6
            }}>
              Senha
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94A3B8'
              }}>
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha..."
                required
                style={{
                  width: '100%',
                  padding: '11px 44px 11px 42px',
                  borderRadius: 10,
                  border: '1.5px solid #CBD5E1',
                  fontSize: '0.9rem',
                  backgroundColor: '#F8FAFC',
                  color: '#0F172A',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2563EB'}
                onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: '#64748B',
                  cursor: 'pointer',
                  padding: 4
                }}
                title={showPassword ? 'Ocultar senha' : 'Ver senha'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Checklist visual de requisitos de senha (Mínimo 6 caracteres, 1 número, 1 caractere especial) */}
          <div style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: 10,
            padding: '12px 14px'
          }}>
            <div style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              color: '#475569',
              marginBottom: 8,
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              Requisitos de Segurança da Senha:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.785rem' }}>
              {/* Regra 1: Mínimo 6 caracteres */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: passValidation.hasMinLength ? '#059669' : '#64748B',
                fontWeight: passValidation.hasMinLength ? 600 : 400
              }}>
                {passValidation.hasMinLength ? (
                  <CheckCircle2 size={16} color="#059669" />
                ) : (
                  <XCircle size={16} color="#94A3B8" />
                )}
                <span>Pelo menos <strong>6 caracteres</strong></span>
              </div>

              {/* Regra 2: Pelo menos 1 número */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: passValidation.hasNumber ? '#059669' : '#64748B',
                fontWeight: passValidation.hasNumber ? 600 : 400
              }}>
                {passValidation.hasNumber ? (
                  <CheckCircle2 size={16} color="#059669" />
                ) : (
                  <XCircle size={16} color="#94A3B8" />
                )}
                <span>Pelo menos <strong>1 número</strong> (0 a 9)</span>
              </div>

              {/* Regra 3: Pelo menos 1 caractere especial */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: passValidation.hasSpecial ? '#059669' : '#64748B',
                fontWeight: passValidation.hasSpecial ? 600 : 400
              }}>
                {passValidation.hasSpecial ? (
                  <CheckCircle2 size={16} color="#059669" />
                ) : (
                  <XCircle size={16} color="#94A3B8" />
                )}
                <span>Pelo menos <strong>1 caractere especial</strong> (ex: ! @ # $ % & *)</span>
              </div>
            </div>
          </div>

          {/* Mensagem de Erro se houver */}
          {errorMessage && (
            <div style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: 8,
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: '#DC2626',
              fontSize: '0.8rem'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Botão de Envio */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '12px 18px',
              fontSize: '0.95rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              borderRadius: 10,
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
              marginTop: 4
            }}
          >
            <span>{mode === 'register' ? 'Criar Conta e Acessar' : 'Entrar no FinAI'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Rodapé do Card com Atalho de Demonstração */}
        <div style={{
          marginTop: 22,
          paddingTop: 18,
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10
        }}>
          <button
            type="button"
            onClick={handleQuickDemo}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#2563EB',
              fontSize: '0.785rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <ShieldCheck size={14} />
            <span>Preencher credenciais de teste para demonstração</span>
          </button>

          <span style={{ fontSize: '0.725rem', color: '#94A3B8' }}>
            Seus dados e credenciais ficam salvos com segurança no seu navegador.
          </span>
        </div>
      </div>
    </div>
  );
};
