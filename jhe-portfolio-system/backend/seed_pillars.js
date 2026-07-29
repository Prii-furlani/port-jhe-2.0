const pool = require('./config/db');

async function seed() {
    try {
        console.log('Iniciando inserção dos Pilares Institucionais...');
        
        await pool.query(`
            CREATE TABLE IF NOT EXISTS pillars (
                id INT AUTO_INCREMENT PRIMARY KEY,
                titulo VARCHAR(100) NOT NULL,
                descricao TEXT NOT NULL,
                icone VARCHAR(50) NOT NULL
            )
        `);
        
        const pillars = [
            {
                titulo: 'Sustentabilidade Urbana',
                descricao: 'Gestão técnica e ambiental em megaprojetos de mobilidade e infraestrutura viária. Supervisão de conformidade em obras que impactam milhões de cidadãos, garantindo padrões internacionais de qualidade.',
                icone: 'Globe'
            },
            {
                titulo: 'Inovação Social',
                descricao: 'Parceria estratégica com a Universidade de São Paulo para desenvolvimento de ferramentas inovadoras de gestão hídrica, combate a perdas e universalização do acesso à água.',
                icone: 'Zap'
            },
            {
                titulo: 'Pessoas & Processos',
                descricao: 'Equipe multidisciplinar dedicada à excelência operacional em engenharia, gestão ambiental e compliance corporativo.',
                icone: 'Users'
            },
            {
                titulo: 'INOVAÇÃO / Trabalho Técnico Social',
                descricao: 'Pioneirismo no desenvolvimento de diretrizes para integração entre comunidades e infraestrutura, transformando vidas através da engenharia social.',
                icone: 'Lightbulb'
            }
        ];

        for (const p of pillars) {
            await pool.query(
                'INSERT INTO pillars (titulo, descricao, icone) VALUES (?, ?, ?)',
                [p.titulo, p.descricao, p.icone]
            );
        }

        console.log('Pilares inseridos com sucesso!');
    } catch (e) {
        console.error('Erro na inserção dos pilares:', e);
    } finally {
        process.exit();
    }
}
seed();
