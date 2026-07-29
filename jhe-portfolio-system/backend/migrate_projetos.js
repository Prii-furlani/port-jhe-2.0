require('dotenv').config();
const pool = require('./config/db');

async function migrateProjetos() {
    try {
        console.log('Alterando a tabela projetos para tornar cliente_id opcional...');
        
        await pool.query(`
            ALTER TABLE projetos MODIFY cliente_id INT NULL;
        `);

        console.log('Migração concluída: cliente_id agora é NULLABLE.');
    } catch (e) {
        console.error('Erro na migração:', e);
    } finally {
        process.exit();
    }
}

migrateProjetos();
