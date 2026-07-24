const pool = require('../config/db');

exports.getDashboardSummary = async (req, res) => {
    try {
        // Executando as queries simultaneamente com Promise.all para ultra-performance
        const [
            [totalProjectsRows],
            [pendingProjectsRows],
            [activeProjectsRows],
            [totalViewsRows],
            [approvalQueueRows],
            [auditStreamRows]
        ] = await Promise.all([
            // 1. Total de Projetos
            pool.query('SELECT COUNT(*) as total FROM projetos'),
            
            // 2. Projetos Pendentes
            pool.query('SELECT COUNT(*) as pending FROM projetos WHERE status IN (?, ?)', ['pending', 'in_review']),
            
            // 3. Projetos Ativos
            pool.query('SELECT COUNT(*) as active FROM projetos WHERE status = ?', ['active']),
            
            // 4. Total de Visualizações na Telemetria
            pool.query('SELECT COUNT(*) as views FROM telemetria_cliques'),
            
            // 5. Fila de Aprovação (Approval Queue) - Últimos 5 pendentes
            pool.query(`
                SELECT p.id, p.titulo as title, u.nome as created_by, p.setor as sector_name, p.criado_em as created_at 
                FROM projetos p 
                LEFT JOIN usuarios u ON p.created_by = u.id 
                WHERE p.status IN (?, ?) 
                ORDER BY p.criado_em DESC 
                LIMIT 5
            `, ['pending', 'in_review']),
            
            // 6. Logs de Auditoria Recentes (Audit Stream) - Últimos 5
            pool.query(`
                SELECT a.id, a.acao, a.tabela_afetada, a.created_at, a.status, u.nome as usuario_nome 
                FROM auditoria_logs a 
                LEFT JOIN usuarios u ON a.usuario_id = u.id 
                ORDER BY a.created_at DESC 
                LIMIT 5
            `)
        ]);

        const summary = {
            kpis: {
                total_projects: totalProjectsRows[0].total,
                pending_approval: pendingProjectsRows[0].pending,
                active_projects: activeProjectsRows[0].active,
                total_views: totalViewsRows[0].views
            },
            approval_queue: approvalQueueRows,
            audit_stream: auditStreamRows
        };

        res.json({ success: true, data: summary });

    } catch (error) {
        console.error('Erro ao buscar resumo do dashboard:', error);
        res.status(500).json({ success: false, error: 'Erro ao compilar métricas do servidor.' });
    }
};
