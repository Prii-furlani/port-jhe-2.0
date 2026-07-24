const pool = require('../config/db');

async function up() {
  console.log('Executando migration 05_review_feedback...');
  try {
    const connection = await pool.getConnection();

    try {
      // 1. Adicionar coluna review_feedback na tabela projetos
      // Tratando caso a coluna já exista
      const [columns] = await connection.query(`SHOW COLUMNS FROM projetos LIKE 'review_feedback'`);
      if (columns.length === 0) {
        await connection.query(`
          ALTER TABLE projetos ADD COLUMN review_feedback TEXT NULL;
        `);
        console.log('Coluna review_feedback adicionada com sucesso.');
      } else {
        console.log('Coluna review_feedback já existe.');
      }

      // 2. Mock: Inserir ou atualizar alguns projetos para simular a fila
      // Vamos pegar o ID de Priscila ou Isabelly que possuem role 'user'
      const [users] = await connection.query(`SELECT id FROM usuarios WHERE role = 'user' LIMIT 1`);
      
      if (users.length > 0) {
        const userId = users[0].id;
        
        // Criar um projeto Pendente 
        await connection.query(`
          INSERT INTO projetos (titulo, cliente_id, setor, status, created_by, descricao) 
          VALUES ('Projeto Piloto de BIM', 1, 'Inovação', 'pending', ?, 'Implementação do sistema BIM para testes.')
        `, [userId]);

        // Criar um projeto Rejeitado
        await connection.query(`
          INSERT INTO projetos (titulo, cliente_id, setor, status, created_by, review_feedback, descricao) 
          VALUES ('Sistema de Macrodrenagem Avançado', 2, 'Saneamento', 'rejected', ?, 'Por favor, adicione fotos da obra no momento da execução.', 'Estudo de macrodrenagem.')
        `, [userId]);
      }

    } finally {
      connection.release();
    }
    
    console.log('Migration 05_review_feedback executada com sucesso.');
  } catch (error) {
    console.error('Erro ao executar migration 05_review_feedback:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  up().then(() => process.exit(0));
}

module.exports = { up };
