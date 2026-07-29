const pool = require('../config/db');
const { logAudit } = require('../utils/auditLogger');

// Listar todos os serviços
exports.getAllServices = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM servicos ORDER BY nome ASC');
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Erro ao buscar serviços:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar serviços.' });
    }
};

// Criar novo serviço
exports.createService = async (req, res) => {
    try {
        const { nome, descricao, icone } = req.body;
        if (!nome) return res.status(400).json({ success: false, error: 'O nome do serviço é obrigatório.' });

        const [result] = await pool.query(
            'INSERT INTO servicos (nome, descricao, icone) VALUES (?, ?, ?)',
            [nome, descricao || null, icone || null]
        );

        res.json({ 
            success: true, 
            message: 'Serviço cadastrado com sucesso!', 
            data: { id: result.insertId, nome, descricao, icone }
        });
    } catch (error) {
        console.error('Erro ao criar serviço:', error);
        res.status(500).json({ success: false, error: 'Erro interno ao salvar serviço.' });
    }
};

// Atualizar serviço
exports.updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, descricao, icone } = req.body;

        if (!nome) return res.status(400).json({ success: false, error: 'O nome do serviço é obrigatório.' });

        const [result] = await pool.query(
            'UPDATE servicos SET nome = ?, descricao = ?, icone = ? WHERE id = ?',
            [nome, descricao || null, icone || null, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Serviço não encontrado.' });
        }

        res.json({ success: true, message: 'Serviço atualizado com sucesso!' });
        
        await logAudit({
            usuario_id: req.user?.id,
            acao: 'ATUALIZAR_SERVICO',
            tabela_afetada: 'servicos',
            registro_id: id,
            ip_originario: req.ip || req.connection.remoteAddress,
            detalhes: `Serviço '${nome}' (ID: ${id}) atualizado.`
        });
    } catch (error) {
        console.error('Erro ao atualizar serviço:', error);
        res.status(500).json({ success: false, error: 'Erro interno ao atualizar serviço.' });
    }
};

// Deletar serviço
exports.deleteService = async (req, res) => {
    try {
        const { id } = req.params;

        const [srv] = await pool.query('SELECT nome FROM servicos WHERE id = ?', [id]);
        if (srv.length === 0) return res.status(404).json({ success: false, error: 'Serviço não encontrado.' });
        
        const servicoNome = srv[0].nome;

        const [result] = await pool.query('DELETE FROM servicos WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Serviço não encontrado.' });
        }

        res.json({ success: true, message: 'Serviço removido com sucesso!' });
        
        await logAudit({
            usuario_id: req.user?.id,
            acao: 'EXCLUIR_SERVICO',
            tabela_afetada: 'servicos',
            registro_id: id,
            ip_originario: req.ip || req.connection.remoteAddress,
            detalhes: `Serviço '${servicoNome}' (ID: ${id}) foi excluído.`
        });
    } catch (error) {
        console.error('Erro ao remover serviço:', error);
        res.status(500).json({ success: false, error: 'Erro interno ao excluir serviço.' });
    }
};
