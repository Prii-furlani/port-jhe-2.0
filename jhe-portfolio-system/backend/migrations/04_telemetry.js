const pool = require('../config/db');

async function up() {
  console.log('Executando migration 04_telemetry...');
  try {
    const connection = await pool.getConnection();

    // 1. Tabela: telemetria_sessoes
    await connection.query(`
      CREATE TABLE IF NOT EXISTS telemetria_sessoes (
          id INT AUTO_INCREMENT PRIMARY KEY,
          ip_hash VARCHAR(255) NOT NULL,
          user_agent TEXT,
          data_acesso TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Tabela: telemetria_cliques
    await connection.query(`
      CREATE TABLE IF NOT EXISTS telemetria_cliques (
          id INT AUTO_INCREMENT PRIMARY KEY,
          identificador_cta VARCHAR(100) NOT NULL,
          tipo VARCHAR(50),
          projeto_id INT,
          criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE SET NULL
      )
    `);

    // 3. Tabela: search_logs (Termos de Busca)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS search_logs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          search_term VARCHAR(255) NOT NULL,
          ip_hash VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. Inserir alguns dados iniciais fictícios para facilitar a visualização do dashboard
    // Apenas se a tabela search_logs estiver vazia
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM search_logs');
    if (rows[0].count === 0) {
      await connection.query(`
        INSERT INTO search_logs (search_term, ip_hash) VALUES 
        ('Saneamento', 'ip_mock_1'),
        ('Saneamento', 'ip_mock_2'),
        ('BIM', 'ip_mock_3'),
        ('BIM', 'ip_mock_4'),
        ('BIM', 'ip_mock_5'),
        ('Estrutural', 'ip_mock_6'),
        ('SABESP', 'ip_mock_7'),
        ('SABESP', 'ip_mock_8'),
        ('Habitação', 'ip_mock_9'),
        ('Gestão', 'ip_mock_10')
      `);
      
      // Seed telemetria_cliques (mock views) - Pegando projetos existentes para evitar erro de FK
      const [projetos] = await connection.query('SELECT id FROM projetos LIMIT 3');
      if (projetos.length >= 3) {
        await connection.query(`
          INSERT INTO telemetria_cliques (identificador_cta, tipo, projeto_id, criado_em) VALUES 
          ('view_project_${projetos[0].id}', 'view_project', ${projetos[0].id}, DATE_SUB(NOW(), INTERVAL 2 DAY)),
          ('view_project_${projetos[0].id}', 'view_project', ${projetos[0].id}, DATE_SUB(NOW(), INTERVAL 1 DAY)),
          ('view_project_${projetos[1].id}', 'view_project', ${projetos[1].id}, DATE_SUB(NOW(), INTERVAL 1 DAY)),
          ('view_project_${projetos[2].id}', 'view_project', ${projetos[2].id}, NOW()),
          ('view_project_${projetos[2].id}', 'view_project', ${projetos[2].id}, DATE_SUB(NOW(), INTERVAL 5 DAY)),
          ('view_project_${projetos[2].id}', 'view_project', ${projetos[2].id}, DATE_SUB(NOW(), INTERVAL 10 DAY))
        `);
      }
      
      // Seed telemetria_sessoes (mock unique visitors)
      await connection.query(`
        INSERT INTO telemetria_sessoes (ip_hash, data_acesso) VALUES 
        ('ip_mock_1', DATE_SUB(NOW(), INTERVAL 2 DAY)),
        ('ip_mock_2', DATE_SUB(NOW(), INTERVAL 1 DAY)),
        ('ip_mock_3', NOW())
      `);
    }

    connection.release();
    console.log('Migration 04_telemetry executada com sucesso.');
  } catch (error) {
    console.error('Erro ao executar migration 04_telemetry:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  up().then(() => process.exit(0));
}

module.exports = { up };
