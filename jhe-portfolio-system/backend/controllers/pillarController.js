const pool = require('../config/db');

// Listar todos os pilares
exports.getAllPillars = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM pillars ORDER BY id ASC');
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Erro ao buscar pilares:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar pilares.' });
    }
};

// Criar novo pilar
exports.createPillar = async (req, res) => {
    try {
        const { titulo, descricao, icone, kicker, footer_text } = req.body;
        if (!titulo) return res.status(400).json({ success: false, error: 'O título do pilar é obrigatório.' });

        const [result] = await pool.query(
            'INSERT INTO pillars (titulo, descricao, icone, kicker, footer_text) VALUES (?, ?, ?, ?, ?)',
            [titulo, descricao || null, icone || 'Target', kicker || null, footer_text || null]
        );

        res.json({ 
            success: true, 
            message: 'Pilar cadastrado com sucesso!', 
            data: { id: result.insertId, titulo, descricao, icone, kicker, footer_text }
        });
    } catch (error) {
        console.error('Erro ao criar pilar:', error);
        res.status(500).json({ success: false, error: 'Erro interno ao salvar pilar.' });
    }
};

// Atualizar pilar
exports.updatePillar = async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, descricao, icone, kicker, footer_text } = req.body;

        if (!titulo) return res.status(400).json({ success: false, error: 'O título do pilar é obrigatório.' });

        const [result] = await pool.query(
            'UPDATE pillars SET titulo = ?, descricao = ?, icone = ?, kicker = ?, footer_text = ? WHERE id = ?',
            [titulo, descricao || null, icone || 'Target', kicker || null, footer_text || null, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Pilar não encontrado.' });
        }

        res.json({ success: true, message: 'Pilar atualizado com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar pilar:', error);
        res.status(500).json({ success: false, error: 'Erro interno ao atualizar pilar.' });
    }
};

// Deletar pilar
exports.deletePillar = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM pillars WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Pilar não encontrado.' });
        }

        res.json({ success: true, message: 'Pilar removido com sucesso!' });
    } catch (error) {
        console.error('Erro ao remover pilar:', error);
        res.status(500).json({ success: false, error: 'Erro interno ao excluir pilar.' });
    }
};
