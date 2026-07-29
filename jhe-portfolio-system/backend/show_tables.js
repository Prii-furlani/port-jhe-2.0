require('dotenv').config();
const pool = require('./config/db');

async function test() {
    try {
        const [rows] = await pool.query('SHOW TABLES');
        console.log(rows);
    } catch (e) {
        console.error('Error in query:', e.message);
    } finally {
        process.exit();
    }
}
test();
