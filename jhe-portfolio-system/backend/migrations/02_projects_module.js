const pool = require('../config/db');

async function migrateProjects() {
    try {
        console.log('Iniciando migração do módulo de Projetos...');

        // 1. Alter table projetos to add new columns
        console.log('Atualizando tabela projetos...');
        
        // We do this individually and catch errors if columns already exist
        const columns = [
            'ADD COLUMN ano_desenvolvimento INT',
            'ADD COLUMN resumo_curto TEXT',
            'ADD COLUMN descricao_detalhada TEXT',
            'ADD COLUMN desafios TEXT',
            'ADD COLUMN metodologias TEXT',
            'ADD COLUMN stakeholders JSON',
            'ADD COLUMN servico_id INT',
            'ADD CONSTRAINT fk_servico FOREIGN KEY (servico_id) REFERENCES servicos(id) ON DELETE SET NULL'
        ];

        for (const col of columns) {
            try {
                await pool.query(`ALTER TABLE projetos ${col}`);
            } catch (e) {
                // Ignora erro de duplicidade se a coluna já existir (ER_DUP_FIELDNAME)
                if (e.code !== 'ER_DUP_FIELDNAME' && !e.message.includes('Duplicate key')) {
                    console.log(`Erro ao executar ${col}:`, e.message);
                }
            }
        }

        // Change status default to 'active' or keep it 'concluido' and just use 'pending'/'draft'/'active' in logic
        
        // 2. Create projeto_tecnologias table
        console.log('Criando tabela projeto_tecnologias...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS projeto_tecnologias (
                projeto_id INT NOT NULL,
                tecnologia_id INT NOT NULL,
                PRIMARY KEY (projeto_id, tecnologia_id),
                FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE,
                FOREIGN KEY (tecnologia_id) REFERENCES tecnologias(id) ON DELETE CASCADE
            )
        `);

        // 3. Add system setting for approval
        console.log('Adicionando config_home para aprovação de projetos...');
        try {
            await pool.query(`
                INSERT INTO config_home (chave, valor) VALUES ('require_project_approval', '1')
                ON DUPLICATE KEY UPDATE valor = valor;
            `);
        } catch (e) {
            console.log('Erro ao inserir config_home:', e.message);
        }

        console.log('Migração de Projetos concluída com sucesso!');
    } catch (e) {
        console.error('Erro fatal na migração:', e);
    } finally {
        process.exit();
    }
}

migrateProjects();
