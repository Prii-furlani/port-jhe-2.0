const pool = require('../config/db');

exports.getAuditLogs = async (req, res) => {
    try {
        const { limit = 50, offset = 0, search = '' } = req.query;

        let queryStr = `
            SELECT a.id, a.acao, a.tabela_afetada, a.registro_id, a.ip_originario, a.status, a.detalhes, a.created_at, u.nome as usuario_nome 
            FROM auditoria_logs a 
            LEFT JOIN usuarios u ON a.usuario_id = u.id
        `;
        let countQueryStr = `
            SELECT COUNT(*) as total 
            FROM auditoria_logs a 
            LEFT JOIN usuarios u ON a.usuario_id = u.id
        `;
        let queryParams = [];
        let countParams = [];

        if (search) {
            const searchPattern = `%${search}%`;
            queryStr += ` WHERE a.acao LIKE ? OR a.tabela_afetada LIKE ? OR u.nome LIKE ?`;
            countQueryStr += ` WHERE a.acao LIKE ? OR a.tabela_afetada LIKE ? OR u.nome LIKE ?`;
            queryParams.push(searchPattern, searchPattern, searchPattern);
            countParams.push(searchPattern, searchPattern, searchPattern);
        }

        queryStr += ` ORDER BY a.created_at DESC LIMIT ? OFFSET ?`;
        queryParams.push(Number(limit), Number(offset));

        const [rows] = await pool.query(queryStr, queryParams);
        const [countRows] = await pool.query(countQueryStr, countParams);

        res.json({
            success: true,
            data: rows,
            pagination: {
                total: countRows[0].total,
                limit: Number(limit),
                offset: Number(offset)
            }
        });

    } catch (error) {
        console.error('Erro ao buscar logs de auditoria:', error);
        res.status(500).json({ success: false, error: 'Erro interno ao buscar logs.' });
    }
};
