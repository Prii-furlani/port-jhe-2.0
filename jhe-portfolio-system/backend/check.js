const pool = require('./config/db');

async function check() {
    try {
        const [columns] = await pool.query('SHOW COLUMNS FROM projetos');
        console.log(columns.map(c => c.Field));
    } catch(e) {
        console.error(e);
    }
    process.exit();
}
check();
