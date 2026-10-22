import { pool } from './db.js';

export default async function handler(req, res) {
  // Configuração de CORS para permitir requisições seguras
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action } = req.query;

  try {
    if (req.method === 'POST') {
      const { name, username, password } = req.body || {};

      // Ação: Cadastro
      if (action === 'register') {
        const cleanName = (name || '').trim();
        const cleanUsername = (username || '').trim().toLowerCase();

        if (!cleanName || !cleanUsername || !password) {
          return res.status(400).json({
            success: false,
            message: 'Nome, usuário e senha são obrigatórios.'
          });
        }

        // Validação de senha: min 6 chars, 1 número, 1 caractere especial
        const hasMinLength = password.length >= 6;
        const hasNumber = /\d/.test(password);
        const hasSpecial = /[^A-Za-z0-9\s]/.test(password);

        if (!hasMinLength || !hasNumber || !hasSpecial) {
          return res.status(400).json({
            success: false,
            message: 'A senha deve conter ao menos 6 caracteres, 1 número e 1 especial.'
          });
        }

        // Verificar se usuário já existe
        const [existing] = await pool.query(
          'SELECT id FROM users WHERE username = ? LIMIT 1',
          [cleanUsername]
        );

        if (existing.length > 0) {
          return res.status(409).json({
            success: false,
            message: 'Este nome de usuário já está em uso.'
          });
        }

        // Inserir novo usuário
        const [result] = await pool.query(
          'INSERT INTO users (name, username, password_hash, salary) VALUES (?, ?, ?, 6500.00)',
          [cleanName, cleanUsername, password]
        );

        return res.status(201).json({
          success: true,
          user: {
            id: result.insertId,
            name: cleanName,
            username: cleanUsername,
            salary: 6500.00,
            createdAt: new Date().toISOString()
          }
        });
      }

      // Ação: Login
      if (action === 'login' || !action) {
        const cleanQuery = (username || name || '').trim().toLowerCase();

        if (!cleanQuery || !password) {
          return res.status(400).json({
            success: false,
            message: 'Informe usuário/nome e senha.'
          });
        }

        const [rows] = await pool.query(
          'SELECT id, name, username, password_hash, salary, created_at FROM users WHERE username = ? OR LOWER(name) = ? LIMIT 1',
          [cleanQuery, cleanQuery]
        );

        if (rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Usuário não encontrado.'
          });
        }

        const userRow = rows[0];
        if (userRow.password_hash !== password) {
          return res.status(401).json({
            success: false,
            message: 'Senha incorreta.'
          });
        }

        return res.status(200).json({
          success: true,
          user: {
            id: userRow.id,
            name: userRow.name,
            username: userRow.username,
            salary: Number(userRow.salary) || 6500.00,
            createdAt: userRow.created_at
          }
        });
      }
    }

    return res.status(405).json({ message: 'Método não permitido.' });
  } catch (error) {
    console.error('Erro na API de Auth:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno no banco de dados.',
      error: error.message
    });
  }
}
