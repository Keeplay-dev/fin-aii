import mysql from 'mysql2/promise';

const DB_CONFIG = {
  host: 'gateway01.sa-east-1.prod.aws.tidbcloud.com',
  port: 4000,
  user: '4Db9TkTCgRce3Xz.root',
  password: 'V0fk1CTSF29NoFzv',
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true
  }
};

async function setup() {
  console.log('🔄 Conectando ao TiDB Cloud...');
  const connection = await mysql.createConnection(DB_CONFIG);
  console.log('✅ Conexão inicial estabelecida com sucesso!');

  console.log('🔄 Criando o banco de dados dedicado "finai_db" (sem misturar com outros dados)...');
  await connection.query(`CREATE DATABASE IF NOT EXISTS finai_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  console.log('✅ Banco de dados "finai_db" criado/verificado!');

  await connection.query(`USE finai_db;`);
  console.log('✅ Contexto alterado para "finai_db".');

  console.log('🔄 Criando tabela "users" (logins e perfil)...');
  await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      username VARCHAR(100) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      salary DECIMAL(12, 2) DEFAULT 6500.00,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_username (username)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('✅ Tabela "users" criada com sucesso!');

  console.log('🔄 Criando tabela "transactions" (históricos e lançamentos)...');
  await connection.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id VARCHAR(100) PRIMARY KEY,
      user_id INT NOT NULL,
      date VARCHAR(20) NOT NULL,
      date_display VARCHAR(30) NOT NULL,
      day_of_week VARCHAR(50) NOT NULL,
      merchant_name VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      original_text TEXT,
      amount DECIMAL(12, 2) NOT NULL,
      type VARCHAR(20) DEFAULT 'expense',
      category VARCHAR(50) NOT NULL,
      ai_confidence INT DEFAULT 80,
      ai_source VARCHAR(50) DEFAULT 'nlp_heuristic',
      ai_reason VARCHAR(255),
      statement_name VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_user_id (user_id),
      INDEX idx_category (category),
      INDEX idx_date (date),
      CONSTRAINT fk_transactions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('✅ Tabela "transactions" criada com sucesso!');

  console.log('🔄 Criando tabela "learned_rules" (regras de categorização do usuário)...');
  await connection.query(`
    CREATE TABLE IF NOT EXISTS learned_rules (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      merchant_pattern VARCHAR(255) NOT NULL,
      category VARCHAR(50) NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_rules_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY uq_user_merchant (user_id, merchant_pattern)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('✅ Tabela "learned_rules" criada com sucesso!');

  // Inserir usuário inicial padrão se a tabela estiver vazia
  const [rows] = await connection.query('SELECT COUNT(*) as count FROM users');
  if (rows[0].count === 0) {
    console.log('🔄 Criando usuário demonstrativo inicial...');
    await connection.query(`
      INSERT INTO users (name, username, password_hash, salary)
      VALUES ('Rafael Silva', 'rafael', 'Fin@2026', 6500.00)
    `);
    console.log('✅ Usuário padrão "rafael" (senha: Fin@2026) criado.');
  }

  // Listar bancos existentes para conferência
  const [databases] = await connection.query('SHOW DATABASES;');
  console.log('\n📊 Bancos de dados existentes no seu TiDB:');
  databases.forEach(db => {
    console.log(` - ${Object.values(db)[0]}`);
  });

  // Listar tabelas criadas no finai_db
  const [tables] = await connection.query('SHOW TABLES FROM finai_db;');
  console.log('\n📋 Tabelas criadas no "finai_db":');
  tables.forEach(tb => {
    console.log(` - ${Object.values(tb)[0]}`);
  });

  await connection.end();
  console.log('\n🎉 Inicialização do TiDB concluída com sucesso e isolamento total!');
}

setup().catch(err => {
  console.error('❌ Erro na configuração do TiDB:', err);
  process.exit(1);
});
