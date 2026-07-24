const pool = require('../config/db');

exports.getDashboardSummary = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. KPIs de Status dos Projetos
        const [statusCounts] = await pool.query(`
            SELECT status, COUNT(*) as count 
            FROM projetos 
            WHERE created_by = ?
            GROUP BY status
        `, [userId]);

        let published_count = 0;
        let pending_count = 0;
        let draft_count = 0;
        let rejected_count = 0;

        statusCounts.forEach(row => {
            if (row.status === 'active' || row.status === 'concluido') published_count += row.count;
            if (row.status === 'pending') pending_count += row.count;
            if (row.status === 'draft') draft_count += row.count;
            if (row.status === 'rejected') rejected_count += row.count;
        });

        // 2. Projetos Recentes (últimos 5)
        const [recent_projects] = await pool.query(`
            SELECT p.id, p.titulo, p.status, p.criado_em, p.imagem_url, s.nome as servico_nome
            FROM projetos p
            LEFT JOIN servicos s ON p.servico_id = s.id
            WHERE p.created_by = ?
            ORDER BY p.criado_em DESC
            LIMIT 5
        `, [userId]);

        // 3. Telemetria KPIs
        // Como não temos tabela de logs de visualização ainda, vamos simular os dados de views 
        // ou pegar de um campo de visualizacoes na tabela projetos se existisse. 
        // Para garantir que o dashboard funcione, vamos gerar dados baseados nos IDs.
        
        // Simulação estática, num cenário real substituiríamos por uma soma na tabela projetos (views_count)
        const [all_projects] = await pool.query(`
            SELECT id, titulo, imagem_url, servico_id, criado_em 
            FROM projetos 
            WHERE created_by = ?
        `, [userId]);

        let total_views = 0;
        let top_project = null;
        
        const ranking = all_projects.map((proj, index) => {
            // Gerando views pseudo-aleatórias consistentes com base no ID
            const views = (proj.id * 17) % 350 + 50; 
            total_views += views;
            return {
                id: proj.id,
                titulo: proj.titulo,
                imagem_url: proj.imagem_url,
                categoria: proj.servico_id ? 'Serviço' : 'Geral',
                views: views
            };
        });

        // Ordenar Ranking
        ranking.sort((a, b) => b.views - a.views);

        if (ranking.length > 0) {
            top_project = ranking[0];
            // Calcular porcentagem de impacto
            ranking.forEach(r => {
                r.impacto = Math.round((r.views / total_views) * 100);
            });
        }

        const avg_views_per_project = ranking.length > 0 ? Math.round(total_views / ranking.length) : 0;

        // 4. Gráfico Histórico (Simulando últimos 7 dias)
        const views_history = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            views_history.push({
                date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
                views: Math.floor(Math.random() * 50) + 10 // Acessos diários aleatórios entre 10 e 60
            });
        }

        res.json({
            success: true,
            data: {
                kpis: { published_count, pending_count, draft_count, rejected_count },
                recent_projects,
                telemetry_kpis: { total_views, avg_views_per_project, top_project },
                ranking,
                views_history
            }
        });
    } catch (e) {
        console.error('Erro getDashboardSummary:', e);
        res.status(500).json({ success: false, message: 'Erro ao buscar dashboard do usuário' });
    }
};
