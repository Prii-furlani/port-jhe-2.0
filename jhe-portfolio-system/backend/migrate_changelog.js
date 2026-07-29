require('dotenv').config();
const pool = require('./config/db');

async function migrate() {
    try {
        console.log('Starting migration...');
        
        // 1. Create project_updates
        await pool.query(`
            CREATE TABLE IF NOT EXISTS project_updates (
                id INT AUTO_INCREMENT PRIMARY KEY,
                project_id INT NOT NULL,
                created_by INT,
                title VARCHAR(150) NOT NULL,
                description TEXT,
                update_date DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projetos(id) ON DELETE CASCADE,
                FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL
            )
        `);
        console.log('project_updates table created or exists.');

        // 2. Add update_id to projeto_imagens
        try {
            await pool.query(`
                ALTER TABLE projeto_imagens 
                ADD COLUMN update_id INT NULL,
                ADD FOREIGN KEY (update_id) REFERENCES project_updates(id) ON DELETE CASCADE
            `);
            console.log('Added update_id to projeto_imagens.');
        } catch (alterErr) {
            if (alterErr.code === 'ER_DUP_FIELDNAME') {
                console.log('Column update_id already exists in projeto_imagens.');
            } else {
                console.error('Error altering table:', alterErr.message);
            }
        }
        
        console.log('Migration completed successfully.');
    } catch (e) {
        console.error('Migration failed:', e);
    } finally {
        process.exit();
    }
}
migrate();
