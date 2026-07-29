require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function resetDB() {
    try {
        console.log('Connecting to MySQL (no database specified)...');
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            multipleStatements: true
        });

        console.log('Dropping database...');
        await connection.query('DROP DATABASE IF EXISTS jhe_portfolio_db_2;');
        console.log('Database dropped.');

        console.log('Reading SQL file...');
        const sqlPath = path.join(__dirname, '..', 'arquitetura_banco_de_dados.txt');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executing SQL statements to recreate DB...');
        await connection.query(sqlContent);
        console.log('Database recreated successfully from arquitetura_banco_de_dados.txt.');

        await connection.end();

        console.log('Running node migrations in sequence...');
        
        const commands = [
            'node migrations/02_projects_module.js',
            'node migrations/03_project_gallery.js',
            'node migrations/04_telemetry.js',
            'node migrate.js',
            'node seed_pillars.js',
            'node seed_telemetry.js',
            'node migrate_changelog.js'
        ];

        for (const cmd of commands) {
            console.log(`Executing: ${cmd}`);
            try {
                execSync(cmd, { stdio: 'inherit', cwd: __dirname });
            } catch (err) {
                console.error(`Error executing ${cmd}:`, err.message);
            }
        }

        console.log('All migrations completed successfully.');

    } catch (e) {
        console.error('Reset failed:', e);
    } finally {
        process.exit();
    }
}
resetDB();
