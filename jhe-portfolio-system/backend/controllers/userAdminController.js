const pool = require('../config/db');
const bcrypt = require('bcryptjs');

async function registrarAuditoria(userId, acao, tabela, req) {
    try {
        const ip = req.ip || req.connection.remoteAddress;
        await pool.query(
            'INSERT INTO auditoria_logs (usuario_id, acao, tabela_afetada, ip_originario, status) VALUES (?, ?, ?, ?, ?)',
            [userId, acao, tabela, ip, 'sucesso']
        );
    } catch (err) {
        console.error('Falha ao registrar auditoria:', err);
    }
}

exports.getAllUsers = async (req, res) => {
    try {
        const query = `
            SELECT u.id, u.nome, u.email, u.role, u.ativo, COUNT(p.id) as projetos_criados 
            FROM usuarios u 
            LEFT JOIN projetos p ON u.id = p.created_by 
            GROUP BY u.id
            ORDER BY u.id DESC
        `;
        const [rows] = await pool.query(query);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar usuários' });
    }
};

exports.createUser = async (req, res) => {
    const { nome, email, role } = req.body;
    try {
        if (!nome || !email || !role) {
            return res.status(400).json({ success: false, error: 'Preencha todos os campos obrigatórios.' });
        }

        const [existing] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, error: 'E-mail já está em uso.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPw = await bcrypt.hash('123456', salt);

        const [result] = await pool.query(
            'INSERT INTO usuarios (nome, email, senha, role, ativo, failed_login_attempts) VALUES (?, ?, ?, ?, 1, 0)',
            [nome, email, hashedPw, role]
        );

        await registrarAuditoria(req.user.id, `CRIAR_USUARIO (${result.insertId})`, 'usuarios', req);

        res.json({ success: true, message: 'Usuário criado com sucesso com senha padrão 123456.' });
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        res.status(500).json({ success: false, error: 'Erro ao criar usuário' });
    }
};

exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { nome, email, role } = req.body;
    try {
        const [existing] = await pool.query('SELECT id FROM usuarios WHERE email = ? AND id != ?', [email, id]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, error: 'E-mail já está em uso por outro usuário.' });
        }

        await pool.query(
            'UPDATE usuarios SET nome = ?, email = ?, role = ? WHERE id = ?',
            [nome, email, role, id]
        );

        await registrarAuditoria(req.user.id, `EDITAR_USUARIO (${id})`, 'usuarios', req);

        res.json({ success: true, message: 'Usuário atualizado com sucesso.' });
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ success: false, error: 'Erro ao atualizar usuário' });
    }
};

exports.resetPassword = async (req, res) => {
    const { id } = req.params;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPw = await bcrypt.hash('123456', salt);

        await pool.query(
            'UPDATE usuarios SET senha = ?, failed_login_attempts = 0, password_changed_at = NOW() WHERE id = ?',
            [hashedPw, id]
        );

        await registrarAuditoria(req.user.id, `RESET_SENHA_USUARIO (${id})`, 'usuarios', req);

        res.json({ success: true, message: 'Senha resetada para 123456 com sucesso.' });
    } catch (error) {
        console.error('Erro ao resetar senha:', error);
        res.status(500).json({ success: false, error: 'Erro ao resetar senha' });
    }
};

exports.toggleStatus = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT ativo FROM usuarios WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ success: false, error: 'Usuário não encontrado' });

        const newStatus = rows[0].ativo ? 0 : 1;

        await pool.query('UPDATE usuarios SET ativo = ? WHERE id = ?', [newStatus, id]);

        await registrarAuditoria(req.user.id, `ALTERAR_STATUS_USUARIO (${id} -> ${newStatus})`, 'usuarios', req);

        res.json({ success: true, message: `Status do usuário alterado para ${newStatus ? 'ativo' : 'inativo'}.` });
    } catch (error) {
        console.error('Erro ao alterar status:', error);
        res.status(500).json({ success: false, error: 'Erro ao alterar status' });
    }
};
