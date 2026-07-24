const pool = require('../config/db');

const auditLog = (acao, tabela) => {
    return async (req, res, next) => {
        // Intercepta a resposta para logar apenas após sucesso
        const originalSend = res.send;
        res.send = function (data) {
            res.send = originalSend;
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const userId = req.userId || null;
                const ip = req.ip || req.connection.remoteAddress;
                // Exemplo básico de registro de auditoria. Em produção, você mapearia o `registro_id` do body ou params.
                pool.query(
                    'INSERT INTO auditoria_logs (usuario_id, acao, tabela_afetada, ip_originario, status) VALUES (?, ?, ?, ?, ?)',
                    [userId, acao, tabela, ip, 'success']
                ).catch(err => console.error('Audit Error:', err));
            }
            return res.send(data);
        };
        next();
    };
};

module.exports = auditLog;
