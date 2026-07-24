const pool = require('../config/db');

exports.getAllEvents = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM timeline_events ORDER BY display_order ASC, year ASC');
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Erro ao buscar timeline:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar eventos.' });
    }
};

exports.createEvent = async (req, res) => {
    try {
        const { year, title, description, display_order } = req.body;
        if (!year || !title) return res.status(400).json({ success: false, error: 'Ano e Título são obrigatórios.' });

        const [result] = await pool.query(
            'INSERT INTO timeline_events (year, title, description, display_order) VALUES (?, ?, ?, ?)',
            [year, title, description || '', display_order || 0]
        );

        res.json({ success: true, message: 'Evento criado com sucesso!', data: { id: result.insertId } });
    } catch (error) {
        console.error('Erro ao criar evento:', error);
        res.status(500).json({ success: false, error: 'Erro interno ao salvar evento.' });
    }
};

exports.updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { year, title, description, display_order } = req.body;
        
        if (!year || !title) return res.status(400).json({ success: false, error: 'Ano e Título são obrigatórios.' });

        const [result] = await pool.query(
            'UPDATE timeline_events SET year=?, title=?, description=?, display_order=? WHERE id=?',
            [year, title, description || '', display_order || 0, id]
        );

        if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Evento não encontrado.' });
        res.json({ success: true, message: 'Evento atualizado!' });
    } catch (error) {
        console.error('Erro ao atualizar evento:', error);
        res.status(500).json({ success: false, error: 'Erro interno ao atualizar evento.' });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM timeline_events WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Evento não encontrado.' });
        res.json({ success: true, message: 'Evento removido com sucesso!' });
    } catch (error) {
        console.error('Erro ao remover evento:', error);
        res.status(500).json({ success: false, error: 'Erro interno ao excluir evento.' });
    }
};
