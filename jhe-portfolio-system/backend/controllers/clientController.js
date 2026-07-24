const pool = require('../config/db');

exports.getPortfolioClients = async (req, res) => {
    try {
        // Busca todos os clientes
        const [clientes] = await pool.query('SELECT * FROM clientes ORDER BY id ASC');
        
        // Busca todos os projetos
        const [projetos] = await pool.query('SELECT * FROM projetos ORDER BY id ASC');

        // Agrupa os projetos dentro do respectivo cliente
        const portfolio = clientes.map(cliente => {
            const clienteProjetos = projetos.filter(p => p.cliente_id === cliente.id);
            return {
                id: cliente.id,
                nome: cliente.nome,
                setor: cliente.setor,
                logo_url: cliente.logo_url,
                projetos: clienteProjetos.map(p => ({
                    id: p.id,
                    titulo: p.titulo,
                    setor: p.setor,
                    descricao: p.descricao,
                    status: p.status
                }))
            };
        });

        res.json({ success: true, data: portfolio });
    } catch (error) {
        console.error('Erro ao buscar portfólio:', error);
        res.status(500).json({ success: false, error: 'Erro interno no servidor.' });
    }
};

// ==========================================
// CRUD ADMIN - CLIENTES
// ==========================================

// Listar todos os clientes
exports.getAllClients = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM clientes ORDER BY nome ASC');
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Erro ao buscar clientes:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar clientes.' });
    }
};

// Criar novo cliente
exports.createClient = async (req, res) => {
    try {
        const { nome, setor, servicos } = req.body;
        if (!nome) return res.status(400).json({ success: false, error: 'O nome do cliente é obrigatório.' });

        let logo_url = null;
        if (req.file) {
            logo_url = `/uploads/clients/${req.file.filename}`;
        } else if (req.body.logo_url) {
            logo_url = req.body.logo_url;
        }

        // Garante que servicos seja uma string JSON (se vier como array do Frontend)
        const servicosJson = servicos ? (typeof servicos === 'string' ? servicos : JSON.stringify(servicos)) : '[]';

        const [result] = await pool.query(
            'INSERT INTO clientes (nome, logo_url, setor, servicos) VALUES (?, ?, ?, ?)',
            [nome, logo_url, setor || null, servicosJson]
        );

        res.json({ 
            success: true, 
            message: 'Cliente cadastrado com sucesso!', 
            data: { id: result.insertId, nome, logo_url, setor, servicos }
        });
    } catch (error) {
        console.error('Erro ao criar cliente:', error);
        res.status(500).json({ success: false, error: 'Erro interno ao salvar cliente.' });
    }
};

// Atualizar cliente
exports.updateClient = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, setor, servicos } = req.body;

        if (!nome) return res.status(400).json({ success: false, error: 'O nome do cliente é obrigatório.' });

        let logo_url = null;
        if (req.file) {
            logo_url = `/uploads/clients/${req.file.filename}`;
        } else if (req.body.logo_url !== undefined) {
            logo_url = req.body.logo_url;
        } else {
            // Se não veio logo_url no body e nem arquivo, mantem a antiga
            const [current] = await pool.query('SELECT logo_url FROM clientes WHERE id = ?', [id]);
            if (current.length > 0) {
                logo_url = current[0].logo_url;
            }
        }

        const servicosJson = servicos ? (typeof servicos === 'string' ? servicos : JSON.stringify(servicos)) : '[]';

        const [result] = await pool.query(
            'UPDATE clientes SET nome = ?, logo_url = ?, setor = ?, servicos = ? WHERE id = ?',
            [nome, logo_url, setor || null, servicosJson, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Cliente não encontrado.' });
        }

        res.json({ success: true, message: 'Cliente atualizado com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar cliente:', error);
        res.status(500).json({ success: false, error: 'Erro interno ao atualizar cliente.' });
    }
};

// Deletar cliente
exports.deleteClient = async (req, res) => {
    try {
        const { id } = req.params;

        // Se houver projetos vinculados a este cliente, o MySQL pode dar erro de Foreign Key (Restrict).
        // Capturar esse erro específico seria o ideal.
        const [result] = await pool.query('DELETE FROM clientes WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Cliente não encontrado.' });
        }

        res.json({ success: true, message: 'Cliente removido com sucesso!' });
    } catch (error) {
        console.error('Erro ao remover cliente:', error);
        if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 'ER_ROW_IS_REFERENCED') {
            return res.status(400).json({ success: false, error: 'Não é possível excluir: existem projetos vinculados a este cliente.' });
        }
        res.status(500).json({ success: false, error: 'Erro interno ao excluir cliente.' });
    }
};
