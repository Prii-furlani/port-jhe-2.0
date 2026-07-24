const pool = require('../config/db');

exports.getUserTelemetry = async (req, res) => {
  try {
    const userId = req.user.id;

    const connection = await pool.getConnection();

    try {
      // 1. my_total_projects (Total de Projetos do Autor)
      const [projectsCountResult] = await connection.query(`
        SELECT COUNT(id) as total 
        FROM projetos 
        WHERE created_by = ?
      `, [userId]);
      const my_total_projects = projectsCountResult[0].total || 0;

      // 2. my_total_views (Soma total de visualizações nos projetos do autor)
      const [viewsResult] = await connection.query(`
        SELECT COUNT(t.id) as total_views 
        FROM telemetria_cliques t
        JOIN projetos p ON t.projeto_id = p.id
        WHERE t.tipo = 'view_project' AND p.created_by = ?
      `, [userId]);
      const my_total_views = viewsResult[0].total_views || 0;

      // 3. my_top_project (Projeto Destaque)
      const [topProjectResult] = await connection.query(`
        SELECT p.id, p.titulo, p.imagem_url, p.status, COUNT(t.id) as views 
        FROM projetos p
        LEFT JOIN telemetria_cliques t ON t.projeto_id = p.id AND t.tipo = 'view_project'
        WHERE p.created_by = ?
        GROUP BY p.id, p.titulo, p.imagem_url, p.status
        ORDER BY views DESC
        LIMIT 1
      `, [userId]);
      const my_top_project = topProjectResult.length > 0 ? topProjectResult[0] : null;

      // 4. views_history (Gráfico Diário - Últimos 30 dias)
      const [viewsHistory] = await connection.query(`
        SELECT DATE_FORMAT(t.criado_em, '%Y-%m-%d') as date, COUNT(t.id) as views 
        FROM telemetria_cliques t
        JOIN projetos p ON t.projeto_id = p.id
        WHERE t.tipo = 'view_project' AND p.created_by = ? AND t.criado_em >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE_FORMAT(t.criado_em, '%Y-%m-%d')
        ORDER BY date ASC
      `, [userId]);

      // 5. projects_list (Tabela de Performance por Projeto)
      const [projectsList] = await connection.query(`
        SELECT p.id, p.titulo, p.imagem_url, p.status, p.criado_em, COUNT(t.id) as views 
        FROM projetos p
        LEFT JOIN telemetria_cliques t ON t.projeto_id = p.id AND t.tipo = 'view_project'
        WHERE p.created_by = ?
        GROUP BY p.id, p.titulo, p.imagem_url, p.status, p.criado_em
        ORDER BY views DESC, p.criado_em DESC
      `, [userId]);

      res.json({
        success: true,
        data: {
          my_total_projects,
          my_total_views,
          my_top_project,
          views_history: viewsHistory,
          projects_list: projectsList
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Erro em getUserTelemetry:', error);
    res.status(500).json({ success: false, message: 'Erro interno ao processar telemetria do usuário', error: error.message });
  }
};
