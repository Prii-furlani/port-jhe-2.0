const pool = require('../config/db');
const PDFDocument = require('pdfkit');

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

exports.exportPdf = async (req, res) => {
    try {
        const { filterType = 'all', filterValue = '' } = req.query;

        let queryStr = `
            SELECT a.id, a.acao, a.tabela_afetada, a.ip_originario, a.status, a.created_at, u.nome as usuario_nome 
            FROM auditoria_logs a 
            LEFT JOIN usuarios u ON a.usuario_id = u.id
        `;
        let queryParams = [];

        if (filterType === 'user' && filterValue) {
            queryStr += ` WHERE u.nome LIKE ?`;
            queryParams.push(`%${filterValue}%`);
        } else if (filterType === 'date' && filterValue) {
            queryStr += ` WHERE DATE(a.created_at) = ?`;
            queryParams.push(filterValue);
        }

        queryStr += ` ORDER BY a.created_at DESC LIMIT 500`;

        const [rows] = await pool.query(queryStr, queryParams);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=auditoria_logs_${filterType}_${new Date().toISOString().split('T')[0]}.pdf`);

        const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
        doc.pipe(res);

        const dateStr = new Date().toLocaleDateString('pt-BR');
        const author = req.user ? req.user.nome : 'Administrador';

        const headerHeight = 120;
        const grad = doc.linearGradient(0, 0, doc.page.width, 0);
        grad.stop(0, '#194775').stop(1, '#38bdf8');
        
        doc.rect(0, 0, doc.page.width, headerHeight).fill(grad);

        doc.y = 30;
        doc.fontSize(24).font('Helvetica-Bold').fillColor('#ffffff').text('JHE Engenharia', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(16).font('Helvetica').fillColor('#e0f2fe').text('Relatório de Auditoria e Logs do Sistema', { align: 'center' });
        
        let filtroLabel = 'Filtro: Todos os registros (Últimos 500)';
        if (filterType === 'user') filtroLabel = `Filtro: Usuário "${filterValue}"`;
        if (filterType === 'date') filtroLabel = `Filtro: Data ${filterValue}`;

        doc.fontSize(10).fillColor('#ffffff')
           .text(`Data de Emissão: ${dateStr}`, 40, 95)
           .text(filtroLabel, doc.page.width - 240, 95, { width: 200, align: 'right' });

        doc.y = headerHeight + 30;

        const tableTop = doc.y;
        const colX = { date: 40, user: 180, action: 330, table: 500, ip: 620, status: 720 };
        
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#194775');
        doc.text('Data/Hora', colX.date, tableTop);
        doc.text('Usuário', colX.user, tableTop);
        doc.text('Ação', colX.action, tableTop);
        doc.text('Tabela', colX.table, tableTop);
        doc.text('IP', colX.ip, tableTop);
        doc.text('Status', colX.status, tableTop);
        
        doc.moveTo(40, tableTop + 15).lineTo(doc.page.width - 40, tableTop + 15).strokeColor('#194775').lineWidth(2).stroke();
        
        let y = tableTop + 25;
        doc.font('Helvetica').fillColor('#333333').fontSize(9);

        rows.forEach((row, index) => {
            if (y > doc.page.height - 60) {
                doc.addPage();
                y = 40;
                doc.fontSize(10).font('Helvetica-Bold').fillColor('#194775');
                doc.text('Data/Hora', colX.date, y);
                doc.text('Usuário', colX.user, y);
                doc.text('Ação', colX.action, y);
                doc.text('Tabela', colX.table, y);
                doc.text('IP', colX.ip, y);
                doc.text('Status', colX.status, y);
                doc.moveTo(40, y + 15).lineTo(doc.page.width - 40, y + 15).strokeColor('#194775').lineWidth(1).stroke();
                y += 25;
                doc.font('Helvetica').fontSize(9);
            }

            const logDate = new Date(row.created_at).toLocaleString('pt-BR');
            const userStr = row.usuario_nome || 'Sistema';
            const actionStr = (row.acao || '').substring(0, 30);
            const tableStr = (row.tabela_afetada || '-').substring(0, 18);
            const ipStr = row.ip_originario || '-';
            const statusStr = row.status || '-';

            if (index % 2 === 1) {
                doc.rect(40, y - 5, doc.page.width - 80, 20).fillColor('#f8fafc').fill();
            }
            doc.fillColor('#333333');

            doc.text(logDate, colX.date, y, { width: 130 });
            doc.text(userStr, colX.user, y, { width: 140 });
            doc.text(actionStr, colX.action, y, { width: 160 });
            doc.text(tableStr, colX.table, y, { width: 110 });
            doc.text(ipStr, colX.ip, y, { width: 90 });
            
            if (statusStr.toLowerCase() === 'sucesso') doc.fillColor('#10b981');
            else if (statusStr.toLowerCase() === 'falha') doc.fillColor('#ef4444');
            else doc.fillColor('#f59e0b');
            
            doc.text(statusStr.toUpperCase(), colX.status, y, { width: 80 });

            y += 20;
        });

        const bottom = doc.page.margins.bottom;
        doc.page.margins.bottom = 0;
        doc.fontSize(8)
           .fillColor('#888888')
           .text(
             `Gerado por: ${author} | Confidencial - Uso interno JHE Engenharia`,
             40,
             doc.page.height - 30,
             { align: 'center', width: doc.page.width - 80 }
           );
        doc.page.margins.bottom = bottom;

        doc.end();

    } catch (error) {
        console.error('Erro ao exportar PDF auditoria:', error);
        if (!res.headersSent) {
            res.status(500).json({ success: false, error: 'Erro interno ao exportar logs.' });
        }
    }
};
