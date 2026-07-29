const pool = require('./config/db');

async function migrate() {
    try {
        console.log('Iniciando criação da tabela projeto_atualizacoes...');
        
        await pool.query(`
            CREATE TABLE IF NOT EXISTS projeto_atualizacoes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                projeto_id INT NOT NULL,
                data_atualizacao DATE NOT NULL,
                titulo VARCHAR(255) NOT NULL,
                descricao TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE
            );
        `);
        console.log('Tabela projeto_atualizacoes criada com sucesso!');
    } catch (e) {
        console.error('Erro na migração:', e);
    } finally {
        process.exit();
    }
}
migrate();
