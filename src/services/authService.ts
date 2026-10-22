import type { User, PasswordValidation } from '../types/auth';

const SESSION_KEY = 'finai_auth_session_v1';
const USERS_DB_KEY = 'finai_users_database_v1';

interface StoredAccount {
  name: string;
  username: string;
  passwordHash: string;
  createdAt: string;
}

// Validador de senha estrito conforme requisitos do usuário:
// - Pelo menos 6 caracteres
// - Pelo menos 1 número
// - Pelo menos 1 caractere especial
export function validatePassword(password: string): PasswordValidation {
  const hasMinLength = password.length >= 6;
  const hasNumber = /\d/.test(password);
  // Aceita qualquer caractere que não seja letra nem número nem espaço
  const hasSpecial = /[^A-Za-z0-9\s]/.test(password);

  return {
    isValid: hasMinLength && hasNumber && hasSpecial,
    hasMinLength,
    hasNumber,
    hasSpecial
  };
}

// Carregar usuário ativo na sessão
export function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Erro ao ler sessão de usuário:', e);
    return null;
  }
}

// Salvar sessão do usuário logado
export function saveUserSession(user: User): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Erro ao salvar sessão:', e);
  }
}

// Encerrar sessão (Logout)
export function clearUserSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (e) {
    console.error('Erro ao limpar sessão:', e);
  }
}

// Carregar lista de contas salvas localmente
function getStoredAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(USERS_DB_KEY);
    if (!raw) {
      // Usuário padrão demonstrativo
      const defaultUser: StoredAccount = {
        name: 'Rafael Silva',
        username: 'rafael',
        passwordHash: 'Fin@2026',
        createdAt: new Date().toISOString()
      };
      localStorage.setItem(USERS_DB_KEY, JSON.stringify([defaultUser]));
      return [defaultUser];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveStoredAccounts(accounts: StoredAccount[]): void {
  try {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.error('Erro ao salvar banco de usuários:', e);
  }
}

export interface AuthResult {
  success: boolean;
  message?: string;
  user?: User;
}

// Registrar novo usuário com sincronização TiDB Cloud
export async function registerAccount(name: string, username: string, password: string): Promise<AuthResult> {
  const cleanName = name.trim();
  const cleanUsername = username.trim().toLowerCase();

  if (!cleanName) {
    return { success: false, message: 'Por favor, informe seu nome completo.' };
  }

  if (!cleanUsername || cleanUsername.length < 3) {
    return { success: false, message: 'O nome de usuário deve ter no mínimo 3 caracteres.' };
  }

  const passValidation = validatePassword(password);
  if (!passValidation.isValid) {
    return {
      success: false,
      message: 'A senha não atende aos requisitos de segurança (mínimo 6 dígitos, 1 número e 1 especial).'
    };
  }

  // 1. Tentar salvar no TiDB Cloud via API
  try {
    const res = await fetch('/api/auth?action=register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: cleanName, username: cleanUsername, password })
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data?.user) {
      saveUserSession(data.user);
      return { success: true, user: data.user };
    }

    if (data?.message) {
      return { success: false, message: data.message };
    }
  } catch (err) {
    console.warn('API TiDB offline ou ambiente local sem rotas serverless, usando fallback local:', err);
  }

  // 2. Fallback de persistência local
  const accounts = getStoredAccounts();
  const exists = accounts.some(acc => acc.username.toLowerCase() === cleanUsername);
  if (exists) {
    return { success: false, message: 'Este nome de usuário já está cadastrado. Tente outro ou faça login.' };
  }

  const newAccount: StoredAccount = {
    name: cleanName,
    username: cleanUsername,
    passwordHash: password,
    createdAt: new Date().toISOString()
  };

  accounts.push(newAccount);
  saveStoredAccounts(accounts);

  const user: User = {
    id: Date.now(),
    name: cleanName,
    username: cleanUsername,
    createdAt: newAccount.createdAt
  };

  saveUserSession(user);
  return { success: true, user };
}

// Fazer login com usuário ou nome e senha com sincronização TiDB Cloud
export async function loginAccount(usernameOrName: string, password: string): Promise<AuthResult> {
  const cleanQuery = usernameOrName.trim().toLowerCase();

  if (!cleanQuery) {
    return { success: false, message: 'Por favor, informe seu nome de usuário ou nome.' };
  }

  if (!password) {
    return { success: false, message: 'Por favor, digite sua senha.' };
  }

  // 1. Tentar autenticar via TiDB Cloud API
  try {
    const res = await fetch('/api/auth?action=login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: cleanQuery, password })
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data?.user) {
      saveUserSession(data.user);
      return { success: true, user: data.user };
    }

    if (data?.message) {
      return { success: false, message: data.message };
    }
  } catch (err) {
    console.warn('API TiDB offline ou ambiente local sem rotas serverless, usando fallback local:', err);
  }

  // 2. Fallback de persistência local
  const accounts = getStoredAccounts();
  const match = accounts.find(
    acc => acc.username.toLowerCase() === cleanQuery || acc.name.toLowerCase() === cleanQuery
  );

  if (!match) {
    return {
      success: false,
      message: 'Usuário não encontrado. Se ainda não possui cadastro, crie uma conta.'
    };
  }

  if (match.passwordHash !== password) {
    return { success: false, message: 'Senha incorreta. Verifique e tente novamente.' };
  }

  const user: User = {
    id: 1,
    name: match.name,
    username: match.username,
    createdAt: match.createdAt
  };

  saveUserSession(user);
  return { success: true, user };
}
