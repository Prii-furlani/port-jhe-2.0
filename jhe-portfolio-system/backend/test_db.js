const pool = require('./config/db');

async function test() {
    try {
        console.log('Testing users query...');
        const query = `
            SELECT u.id, u.nome, u.email, u.role, u.ativo, COUNT(p.id) as projetos_criados 
            FROM usuarios u 
            LEFT JOIN projetos p ON u.id = p.created_by 
            GROUP BY u.id
            ORDER BY u.id DESC
        `;
        const [rows] = await pool.query(query);
        console.log('Success!', rows);
    } catch (e) {
        console.error('Error in query:', e.message);
    } finally {
        process.exit();
    }
}
test();
