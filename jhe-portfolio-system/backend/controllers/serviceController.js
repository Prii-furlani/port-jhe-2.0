const pool = require('../config/db');

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
    } catch (error) {
        console.error('Erro ao atualizar serviço:', error);
        res.status(500).json({ success: false, error: 'Erro interno ao atualizar serviço.' });
    }
};

// Deletar serviço
exports.deleteService = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query('DELETE FROM servicos WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Serviço não encontrado.' });
        }

        res.json({ success: true, message: 'Serviço removido com sucesso!' });
    } catch (error) {
        console.error('Erro ao remover serviço:', error);
        res.status(500).json({ success: false, error: 'Erro interno ao excluir serviço.' });
    }
};
