import { pool } from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { userId, id, all } = req.query;

  try {
    // 1. GET: Buscar lançamentos do usuário
    if (req.method === 'GET') {
      if (!userId) {
        return res.status(400).json({ error: 'userId é obrigatório.' });
      }

      const [rows] = await pool.query(
        'SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC, created_at DESC',
        [userId]
      );

      const formatted = rows.map(r => ({
        id: r.id,
        date: r.date,
        dateDisplay: r.date_display,
        dayOfWeek: r.day_of_week,
        merchantName: r.merchant_name,
        description: r.description,
        originalText: r.original_text || '',
        amount: Number(r.amount),
        type: r.type,
        category: r.category,
        aiConfidence: r.ai_confidence,
        aiSource: r.ai_source,
        aiReason: r.ai_reason,
        statementName: r.statement_name
      }));

      return res.status(200).json(formatted);
    }

    // 2. POST: Salvar um ou vários lançamentos
    if (req.method === 'POST') {
      const { userId: bodyUserId, transactions } = req.body || {};
      const targetUserId = bodyUserId || userId;

      if (!targetUserId) {
        return res.status(400).json({ error: 'userId é obrigatório.' });
      }

      const list = Array.isArray(transactions) ? transactions : [req.body];

      for (const t of list) {
        if (!t.id || !t.amount) continue;

        await pool.query(`
          INSERT INTO transactions (
            id, user_id, date, date_display, day_of_week, merchant_name,
            description, original_text, amount, type, category,
            ai_confidence, ai_source, ai_reason, statement_name
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            merchant_name = VALUES(merchant_name),
            category = VALUES(category),
            amount = VALUES(amount),
            ai_confidence = VALUES(ai_confidence),
            ai_source = VALUES(ai_source),
            ai_reason = VALUES(ai_reason)
        `, [
          t.id,
          targetUserId,
          t.date || new Date().toISOString().split('T')[0],
          t.dateDisplay || '',
          t.dayOfWeek || '',
          t.merchantName || t.description || 'Lançamento',
          t.description || '',
          t.originalText || '',
          t.amount,
          t.type || 'expense',
          t.category || 'outros',
          t.aiConfidence || 80,
          t.aiSource || 'nlp_heuristic',
          t.aiReason || '',
          t.statementName || ''
        ]);
      }

      return res.status(200).json({ success: true, count: list.length });
    }

    // 3. PUT: Atualizar categoria de um lançamento
    if (req.method === 'PUT') {
      const { id: txId, category, aiReason, merchantPattern } = req.body || {};

      if (!txId || !category) {
        return res.status(400).json({ error: 'id e category são obrigatórios.' });
      }

      await pool.query(
        'UPDATE transactions SET category = ?, ai_source = "learned", ai_confidence = 100, ai_reason = ? WHERE id = ?',
        [category, aiReason || 'Atualizado manualmente por você', txId]
      );

      // Salva regra aprendida se informada
      if (userId && merchantPattern) {
        await pool.query(`
          INSERT INTO learned_rules (user_id, merchant_pattern, category)
          VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE category = VALUES(category), updated_at = CURRENT_TIMESTAMP
        `, [userId, merchantPattern, category]);
      }

      return res.status(200).json({ success: true });
    }

    // 4. DELETE: Excluir um lançamento ou limpar todos
    if (req.method === 'DELETE') {
      if (!userId) {
        return res.status(400).json({ error: 'userId é obrigatório.' });
      }

      if (all === 'true') {
        await pool.query('DELETE FROM transactions WHERE user_id = ?', [userId]);
        return res.status(200).json({ success: true, message: 'Todos os lançamentos foram limpos.' });
      }

      if (id) {
        await pool.query('DELETE FROM transactions WHERE id = ? AND user_id = ?', [id, userId]);
        return res.status(200).json({ success: true, message: 'Lançamento excluído.' });
      }

      return res.status(400).json({ error: 'Informe id ou all=true para exclusão.' });
    }

    return res.status(405).json({ message: 'Método não permitido.' });
  } catch (error) {
    console.error('Erro na API de Transactions:', error);
    return res.status(500).json({ error: 'Erro no banco de dados.', details: error.message });
  }
}
