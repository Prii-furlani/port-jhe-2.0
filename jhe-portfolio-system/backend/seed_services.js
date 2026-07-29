require('dotenv').config();
const pool = require('./config/db');

async function seedServices() {
    try {
        console.log('Iniciando inserção dos Serviços Dinâmicos (Setores/Áreas)...');
        
        const servicos = [
            {
                nome: 'Saneamento e Recursos Hídricos',
                descricao: 'Projetos de despoluição de bacias, redes de água e Estações de Tratamento de Esgoto.',
                icone: 'Droplet'
            },
            {
                nome: 'Habitação e Gestão Social',
                descricao: 'Apoio a programas de moradia popular, urbanização de favelas e trabalho técnico social.',
                icone: 'Home'
            },
            {
                nome: 'Transportes e Infraestrutura',
                descricao: 'Supervisão de obras viárias, rodovias e sistemas de transporte urbano.',
                icone: 'Train'
            },
            {
                nome: 'Edificações e Equipamentos Públicos',
                descricao: 'Gerenciamento e fiscalização da construção e reforma de prédios públicos e escolas.',
                icone: 'Building2'
            },
            {
                nome: 'Engenharia e Supervisão Ambiental',
                descricao: 'Gerenciamento ambiental, recuperação de áreas degradadas e monitoramento contínuo.',
                icone: 'Leaf'
            },
            {
                nome: 'Consultoria e Softwares',
                descricao: 'Estudos de viabilidade técnica, auditorias de contratos e modelagem BIM.',
                icone: 'Laptop'
            }
        ];

        // Limpar tabela primeiro ou apenas adicionar? Vou apenas garantir que a tabela existe
        await pool.query(`
            CREATE TABLE IF NOT EXISTS servicos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                titulo VARCHAR(150) NOT NULL,
                descricao TEXT,
                icone VARCHAR(50)
            )
        `);

        // Check if empty
        const [rows] = await pool.query('SELECT COUNT(*) as count FROM servicos');
        if (rows[0].count === 0) {
            for (const s of servicos) {
                await pool.query(
                    'INSERT INTO servicos (nome, descricao, icone) VALUES (?, ?, ?)',
                    [s.nome, s.descricao, s.icone]
                );
            }
            console.log('Serviços inseridos com sucesso!');
        } else {
            console.log('A tabela servicos já possui dados, ignorando inserção automática.');
        }
    } catch (e) {
        console.error('Erro na inserção dos serviços:', e);
    } finally {
        process.exit();
    }
}
seedServices();
