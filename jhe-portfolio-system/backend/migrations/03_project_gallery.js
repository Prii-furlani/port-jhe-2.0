const pool = require('../config/db');

async function up() {
    console.log('Iniciando migração da Galeria de Projetos...');

    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS projeto_imagens (
                id INT AUTO_INCREMENT PRIMARY KEY,
                projeto_id INT NOT NULL,
                imagem_url VARCHAR(255) NOT NULL,
                criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE
            )
        `);
        console.log('Tabela projeto_imagens criada com sucesso!');
        process.exit(0);
    } catch (e) {
        console.error('Erro na migração:', e);
        process.exit(1);
    }
}

up();
