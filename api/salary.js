import { pool } from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { userId } = req.query;

  try {
    if (req.method === 'GET') {
      if (!userId) {
        return res.status(400).json({ error: 'userId é obrigatório.' });
      }

      const [rows] = await pool.query('SELECT salary FROM users WHERE id = ?', [userId]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      return res.status(200).json({ salary: Number(rows[0].salary) || 6500 });
    }

    if (req.method === 'POST') {
      const { userId: bodyUserId, salary } = req.body || {};
      const targetUserId = bodyUserId || userId;

      if (!targetUserId || salary === undefined) {
        return res.status(400).json({ error: 'userId e salary são obrigatórios.' });
      }

      await pool.query('UPDATE users SET salary = ? WHERE id = ?', [salary, targetUserId]);
      return res.status(200).json({ success: true, salary });
    }

    return res.status(405).json({ message: 'Método não permitido.' });
  } catch (error) {
    console.error('Erro na API de Salário:', error);
    return res.status(500).json({ error: 'Erro no banco de dados.', details: error.message });
  }
}
