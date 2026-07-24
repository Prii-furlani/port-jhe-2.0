const pool = require('../config/db');

// Listar todas as tecnologias
exports.getAllTechnologies = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM tecnologias ORDER BY nome ASC');
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Erro ao buscar tecnologias:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar tecnologias.' });
    }
};

// Criar nova tecnologia
exports.createTechnology = async (req, res) => {
    try {
        const { nome, icone_url } = req.body;
        if (!nome) return res.status(400).json({ success: false, error: 'O nome da tecnologia é obrigatório.' });

        const [result] = await pool.query(
            'INSERT INTO tecnologias (nome, icone_url) VALUES (?, ?)',
            [nome, icone_url || null]
        );

        res.json({ 
            success: true, 
            message: 'Tecnologia cadastrada com sucesso!', 
            data: { id: result.insertId, nome, icone_url }
        });
    } catch (error) {
        console.error('Erro ao criar tecnologia:', error);
        res.status(500).json({ success: false, error: 'Erro interno ao salvar tecnologia.' });
    }
};

// Atualizar tecnologia
exports.updateTechnology = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, icone_url } = req.body;

        if (!nome) return res.status(400).json({ success: false, error: 'O nome da tecnologia é obrigatório.' });

        const [result] = await pool.query(
            'UPDATE tecnologias SET nome = ?, icone_url = ? WHERE id = ?',
            [nome, icone_url || null, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Tecnologia não encontrada.' });
        }

        res.json({ success: true, message: 'Tecnologia atualizada com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar tecnologia:', error);
        res.status(500).json({ success: false, error: 'Erro interno ao atualizar tecnologia.' });
    }
};

// Deletar tecnologia
exports.deleteTechnology = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query('DELETE FROM tecnologias WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Tecnologia não encontrada.' });
        }

        res.json({ success: true, message: 'Tecnologia removida com sucesso!' });
    } catch (error) {
        console.error('Erro ao remover tecnologia:', error);
        res.status(500).json({ success: false, error: 'Erro interno ao excluir tecnologia.' });
    }
};
