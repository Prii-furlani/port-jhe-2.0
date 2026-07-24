const pool = require('./config/db');

async function test() {
    try {
        const [rows] = await pool.query('DESCRIBE projetos');
        console.log(rows);
    } catch (e) {
        console.error('Error in query:', e.message);
    } finally {
        process.exit();
    }
}
test();
