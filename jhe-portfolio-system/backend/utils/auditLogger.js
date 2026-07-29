const pool = require('../config/db');

/**
 * Função utilitária para registrar logs de auditoria detalhados
 * 
 * @param {Object} options 
 * @param {number} options.usuario_id - ID do usuário logado (req.user.id)
 * @param {string} options.acao - Ação realizada (ex: 'EXCLUIR_PROJETO')
 * @param {string} options.tabela_afetada - Tabela que foi modificada
 * @param {number|string} options.registro_id - ID do registro afetado
 * @param {string} options.ip_originario - IP da requisição (req.ip)
 * @param {string} options.status - 'SUCESSO' ou 'FALHA'
 * @param {string} options.detalhes - Descrição extra
 */
const logAudit = async ({
    usuario_id,
    acao,
    tabela_afetada,
    registro_id,
    ip_originario,
    status = 'SUCESSO',
    detalhes = ''
}) => {
    try {
        await pool.query(
            `INSERT INTO auditoria_logs 
             (usuario_id, acao, tabela_afetada, registro_id, ip_originario, status, detalhes) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [usuario_id || null, acao, tabela_afetada, registro_id, ip_originario, status, detalhes]
        );
    } catch (error) {
        console.error('Falha crítica ao gravar log de auditoria:', error);
    }
};

module.exports = { logAudit };
