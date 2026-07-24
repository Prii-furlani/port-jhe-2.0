const pool = require('../config/db');

async function up() {
  console.log('Executando migration 06_add_ano...');
  try {
    const connection = await pool.getConnection();

    try {
      const [columns] = await connection.query(`SHOW COLUMNS FROM projetos LIKE 'ano'`);
      if (columns.length === 0) {
        // Usando VARCHAR para permitir entradas como "2023 - 2024"
        await connection.query(`
          ALTER TABLE projetos ADD COLUMN ano VARCHAR(50) NULL;
        `);
        console.log('Coluna ano adicionada com sucesso.');
      } else {
        console.log('Coluna ano já existe.');
      }
    } finally {
      connection.release();
    }
    
    console.log('Migration 06_add_ano executada com sucesso.');
  } catch (error) {
    console.error('Erro ao executar migration 06_add_ano:', error);
  }
}

if (require.main === module) {
  up().then(() => process.exit(0));
}

module.exports = { up };
