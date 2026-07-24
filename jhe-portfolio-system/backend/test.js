const pool = require('./config/db');

async function testInsert() {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const userId = 1;
        const titulo = 'Teste';
        const cliente_id = 1;
        const servico_id = null;
        const setor = 'Teste';
        const resumo_curto = 'Resumo';
        const descricao_detalhada = 'Desc';
        const desafios = 'Desafios';
        const metodologias = 'Metodos';
        const link_oficial = '';
        const ano_desenvolvimento = 2024;
        const stakeholdersJson = '[]';
        const imagem_url = null;
        const finalStatus = 'draft';

        console.log('Inserting into projetos...');
        const [result] = await connection.query(`
            INSERT INTO projetos 
            (titulo, cliente_id, servico_id, setor, resumo_curto, descricao_detalhada, desafios, metodologias, link_oficial, ano_desenvolvimento, stakeholders, imagem_url, status, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            titulo, cliente_id, servico_id || null, setor, resumo_curto, descricao_detalhada, desafios, metodologias, link_oficial, 
            ano_desenvolvimento || null, stakeholdersJson, imagem_url, finalStatus, userId
        ]);
        console.log('Project inserted', result.insertId);
        
        await connection.commit();
        console.log('Success');
    } catch(e) {
        await connection.rollback();
        console.error('ERROR:', e);
    } finally {
        connection.release();
        process.exit();
    }
}
testInsert();
