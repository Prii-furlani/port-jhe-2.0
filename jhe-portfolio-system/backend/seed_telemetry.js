const pool = require('./config/db');

async function seedTelemetry() {
  try {
    const connection = await pool.getConnection();
    
    // Get all projects to link views to
    const [projects] = await connection.query('SELECT id FROM projetos');
    if (projects.length === 0) {
      console.log('No projects found to link telemetry.');
      process.exit(1);
    }

    console.log('Inserting sessions and clicks...');
    
    for (let i = 0; i < 150; i++) {
      // Random date within the last 90 days
      const daysAgo = Math.floor(Math.random() * 90);
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      const formattedDate = date.toISOString().slice(0, 19).replace('T', ' ');

      // Insert session
      const ip_hash = 'mock_ip_' + Math.floor(Math.random() * 50); // 50 unique visitors
      await connection.query(
        'INSERT INTO telemetria_sessoes (ip_hash, user_agent, data_acesso) VALUES (?, ?, ?)',
        [ip_hash, 'MockBrowser/1.0', formattedDate]
      );

      // Insert click (view_project)
      const project = projects[Math.floor(Math.random() * projects.length)];
      await connection.query(
        'INSERT INTO telemetria_cliques (identificador_cta, tipo, projeto_id, criado_em) VALUES (?, ?, ?, ?)',
        ['project_card', 'view_project', project.id, formattedDate]
      );
    }
    
    connection.release();
    console.log('Successfully seeded telemetry data.');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedTelemetry();
