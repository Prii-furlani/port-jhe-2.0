const pool = require('../config/db');

exports.registerClick = async (req, res) => {
    res.json({ message: 'Register click' });
};

const PDFDocument = require('pdfkit');

async function getTelemetryData(period) {
    let dateFilter = '';
    switch (period) {
      case '7d': dateFilter = 'INTERVAL 7 DAY'; break;
      case '90d': dateFilter = 'INTERVAL 90 DAY'; break;
      case 'year': dateFilter = 'INTERVAL 1 YEAR'; break;
      case '30d': default: dateFilter = 'INTERVAL 30 DAY'; break;
    }

    const connection = await pool.getConnection();
    try {
      const [viewsResult] = await connection.query(`SELECT COUNT(id) as total_views FROM telemetria_cliques WHERE tipo = 'view_project' AND criado_em >= DATE_SUB(NOW(), ${dateFilter})`);
      const totalViews = viewsResult[0].total_views || 0;

      const [visitorsResult] = await connection.query(`SELECT COUNT(DISTINCT ip_hash) as unique_visitors FROM telemetria_sessoes WHERE data_acesso >= DATE_SUB(NOW(), ${dateFilter})`);
      const uniqueVisitors = visitorsResult[0].unique_visitors || 0;

      const avgViewsPerVisitor = uniqueVisitors > 0 ? (totalViews / uniqueVisitors).toFixed(1) : 0;

      const [serviceResult] = await connection.query(`SELECT p.setor, COUNT(t.id) as views FROM telemetria_cliques t JOIN projetos p ON t.projeto_id = p.id WHERE t.tipo = 'view_project' AND t.criado_em >= DATE_SUB(NOW(), ${dateFilter}) GROUP BY p.setor ORDER BY views DESC LIMIT 1`);
      const mostViewedService = serviceResult.length > 0 ? serviceResult[0].setor : 'N/A';

      const [timeSeries] = await connection.query(`SELECT DATE_FORMAT(criado_em, '%Y-%m-%d') as date, COUNT(id) as views FROM telemetria_cliques WHERE tipo = 'view_project' AND criado_em >= DATE_SUB(NOW(), ${dateFilter}) GROUP BY DATE_FORMAT(criado_em, '%Y-%m-%d') ORDER BY date ASC`);

      const [topProjects] = await connection.query(`SELECT p.id, p.titulo as title, p.setor as service_name, p.imagem_url as cover_image_url, COUNT(t.id) as views FROM telemetria_cliques t JOIN projetos p ON t.projeto_id = p.id WHERE t.tipo = 'view_project' AND t.criado_em >= DATE_SUB(NOW(), ${dateFilter}) GROUP BY p.id, p.titulo, p.setor, p.imagem_url ORDER BY views DESC LIMIT 5`);

      const topSearches = [];

      const [categoryDistribution] = await connection.query(`SELECT p.setor as name, COUNT(t.id) as value FROM telemetria_cliques t JOIN projetos p ON t.projeto_id = p.id WHERE t.tipo = 'view_project' AND t.criado_em >= DATE_SUB(NOW(), ${dateFilter}) GROUP BY p.setor ORDER BY value DESC`);

      return {
        kpis: { total_views: totalViews, unique_visitors: uniqueVisitors, avg_views_per_visitor: avgViewsPerVisitor, most_viewed_service: mostViewedService },
        time_series: timeSeries,
        top_projects: topProjects,
        top_searches: topSearches,
        category_distribution: categoryDistribution
      };
    } finally {
      connection.release();
    }
}

exports.getTelemetrySummary = async (req, res) => {
  try {
    const data = await getTelemetryData(req.query.period || '30d');
    res.json({ success: true, data });
  } catch (error) {
    console.error('Erro em getTelemetrySummary:', error);
    res.status(500).json({ success: false, message: 'Erro interno ao processar telemetria', error: error.message });
  }
};

exports.exportPdfSummary = async (req, res) => {
  try {
    const period = req.query.period || '30d';
    const data = await getTelemetryData(period);
    
    // Configura os headers para forçar o download no browser
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=relatorio_telemetria_jhe_${period}_${new Date().toISOString().split('T')[0]}.pdf`);

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    doc.pipe(res); // Joga os dados direto para o response

    const dateStr = new Date().toLocaleDateString('pt-BR');
    const author = req.user ? req.user.nome : 'Administrador';

    // HEADER
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .fillColor('#194775')
       .text('JHE Engenharia', { align: 'center' });
       
    doc.moveDown(0.5);
    doc.fontSize(16)
       .font('Helvetica')
       .fillColor('#333333')
       .text('Relatório Executivo de Telemetria e Analytics', { align: 'center' });

    doc.moveDown(1);
    doc.fontSize(10)
       .fillColor('#666666')
       .text(`Data de Emissão: ${dateStr}`, { align: 'right' })
       .text(`Período Analisado: ${period}`, { align: 'right' });
    
    doc.moveDown(2);

    // KPIs
    doc.fontSize(14).fillColor('#194775').font('Helvetica-Bold').text('Métricas Principais');
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#194775').stroke();
    doc.moveDown(1);

    doc.fontSize(12).fillColor('#333333').font('Helvetica');
    doc.text(`Total de Visualizações: ${data.kpis.total_views}`);
    doc.text(`Visitantes Únicos: ${data.kpis.unique_visitors}`);
    doc.text(`Média Views/Visita: ${data.kpis.avg_views_per_visitor}`);
    doc.text(`Categoria Dominante: ${data.kpis.most_viewed_service}`);
    
    doc.moveDown(2);

    // TOP PROJECTS
    doc.fontSize(14).fillColor('#194775').font('Helvetica-Bold').text('Top Projetos Mais Acessados');
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#194775').stroke();
    doc.moveDown(1);

    data.top_projects.forEach((proj, idx) => {
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#333333')
         .text(`${idx + 1}. ${proj.title}`);
      doc.fontSize(10).font('Helvetica').fillColor('#666666')
         .text(`Setor: ${proj.service_name || '-'} | Views: ${proj.views}`, { indent: 15 });
      doc.moveDown(0.5);
    });

    doc.moveDown(2);

    // CATEGORY DISTRIBUTION
    doc.fontSize(14).fillColor('#194775').font('Helvetica-Bold').text('Distribuição por Categoria');
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#194775').stroke();
    doc.moveDown(1);

    data.category_distribution.forEach((cat) => {
      doc.fontSize(11).font('Helvetica').fillColor('#333333')
         .text(`${cat.name}: ${cat.value} views`);
    });

    // FOOTER
    const bottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    doc.fontSize(9)
       .fillColor('#888888')
       .text(
         `Gerado por: ${author} | Confidencial - Uso interno JHE Engenharia`,
         50,
         doc.page.height - 50,
         { align: 'center', width: doc.page.width - 100 }
       );
    doc.page.margins.bottom = bottom;

    doc.end();
  } catch (error) {
    console.error('Erro em exportPdfSummary:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Erro ao gerar PDF', error: error.message });
    }
  }
};
