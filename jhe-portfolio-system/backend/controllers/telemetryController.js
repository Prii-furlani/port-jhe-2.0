const pool = require('../config/db');

exports.registerClick = async (req, res) => {
    res.json({ message: 'Register click' });
};

exports.getTelemetrySummary = async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    let dateFilter = '';
    switch (period) {
      case '7d':
        dateFilter = 'INTERVAL 7 DAY';
        break;
      case '90d':
        dateFilter = 'INTERVAL 90 DAY';
        break;
      case 'year':
        dateFilter = 'INTERVAL 1 YEAR';
        break;
      case '30d':
      default:
        dateFilter = 'INTERVAL 30 DAY';
        break;
    }

    const connection = await pool.getConnection();

    try {
      // 1. Total Views
      const [viewsResult] = await connection.query(`
        SELECT COUNT(id) as total_views 
        FROM telemetria_cliques 
        WHERE tipo = 'view_project' 
        AND criado_em >= DATE_SUB(NOW(), ${dateFilter})
      `);
      const totalViews = viewsResult[0].total_views || 0;

      // 2. Unique Visitors
      const [visitorsResult] = await connection.query(`
        SELECT COUNT(DISTINCT ip_hash) as unique_visitors 
        FROM telemetria_sessoes 
        WHERE data_acesso >= DATE_SUB(NOW(), ${dateFilter})
      `);
      const uniqueVisitors = visitorsResult[0].unique_visitors || 0;

      // Avg views per visitor
      const avgViewsPerVisitor = uniqueVisitors > 0 ? (totalViews / uniqueVisitors).toFixed(1) : 0;

      // 3. Most Viewed Service/Sector
      const [serviceResult] = await connection.query(`
        SELECT p.setor, COUNT(t.id) as views 
        FROM telemetria_cliques t
        JOIN projetos p ON t.projeto_id = p.id
        WHERE t.tipo = 'view_project' AND t.criado_em >= DATE_SUB(NOW(), ${dateFilter})
        GROUP BY p.setor
        ORDER BY views DESC
        LIMIT 1
      `);
      const mostViewedService = serviceResult.length > 0 ? serviceResult[0].setor : 'N/A';

      // 4. Time Series (Daily views)
      const [timeSeries] = await connection.query(`
        SELECT DATE_FORMAT(criado_em, '%Y-%m-%d') as date, COUNT(id) as views 
        FROM telemetria_cliques 
        WHERE tipo = 'view_project' AND criado_em >= DATE_SUB(NOW(), ${dateFilter})
        GROUP BY DATE_FORMAT(criado_em, '%Y-%m-%d')
        ORDER BY date ASC
      `);

      // 5. Top 5 Projects
      const [topProjects] = await connection.query(`
        SELECT p.id, p.titulo as title, p.setor as service_name, p.imagem_url as cover_image_url, COUNT(t.id) as views 
        FROM telemetria_cliques t
        JOIN projetos p ON t.projeto_id = p.id
        WHERE t.tipo = 'view_project' AND t.criado_em >= DATE_SUB(NOW(), ${dateFilter})
        GROUP BY p.id, p.titulo, p.setor, p.imagem_url
        ORDER BY views DESC
        LIMIT 5
      `);

      // 6. Top Search Terms
      const [topSearches] = await connection.query(`
        SELECT search_term as name, COUNT(id) as count 
        FROM search_logs
        WHERE created_at >= DATE_SUB(NOW(), ${dateFilter})
        GROUP BY search_term
        ORDER BY count DESC
        LIMIT 6
      `);

      // 7. Distribution by Category (Donut)
      const [categoryDistribution] = await connection.query(`
        SELECT p.setor as name, COUNT(t.id) as value 
        FROM telemetria_cliques t
        JOIN projetos p ON t.projeto_id = p.id
        WHERE t.tipo = 'view_project' AND t.criado_em >= DATE_SUB(NOW(), ${dateFilter})
        GROUP BY p.setor
        ORDER BY value DESC
      `);

      res.json({
        success: true,
        data: {
          kpis: {
            total_views: totalViews,
            unique_visitors: uniqueVisitors,
            avg_views_per_visitor: avgViewsPerVisitor,
            most_viewed_service: mostViewedService
          },
          time_series: timeSeries,
          top_projects: topProjects,
          top_searches: topSearches,
          category_distribution: categoryDistribution
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Erro em getTelemetrySummary:', error);
    res.status(500).json({ success: false, message: 'Erro interno ao processar telemetria', error: error.message });
  }
};
