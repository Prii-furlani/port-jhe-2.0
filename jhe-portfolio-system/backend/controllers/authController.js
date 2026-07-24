const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper para calcular tempo relativo (ex: "há 2 dias")
function formatRelativeTime(dateString) {
    if (!dateString) return 'recentemente';
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now - past;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHours === 0) {
            const diffMin = Math.floor(diffMs / (1000 * 60));
            return diffMin === 0 ? 'agora mesmo' : `há ${diffMin} minuto${diffMin > 1 ? 's' : ''}`;
        }
        return `há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    }
    if (diffDays < 7) return `há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
    if (diffDays < 30) {
        const w = Math.floor(diffDays / 7);
        return `há ${w} semana${w > 1 ? 's' : ''}`;
    }
    const m = Math.floor(diffDays / 30);
    return `há ${m} mês${m > 1 ? 'es' : ''}`;
}

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        if (!username || !password) {
            return res.status(400).json({ error: 'Preencha todos os campos.' });
        }

        const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ? AND ativo = 1', [username]);

        if (rows.length === 0) {
            await registrarAuditoria(null, 'LOGIN_FALHA', 'usuarios', req);
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.senha);

        if (!isMatch) {
            // Incrementa tentativas falhas
            const novasTentativas = (user.failed_login_attempts || 0) + 1;
            await pool.query('UPDATE usuarios SET failed_login_attempts = ? WHERE id = ?', [novasTentativas, user.id]);
            await registrarAuditoria(user.id, 'LOGIN_FALHA', 'usuarios', req);

            // LGPD Preventivo: Verifica se já falhou 2 ou mais vezes
            if (novasTentativas >= 2 && user.password_changed_at) {
                const tempoRelativo = formatRelativeTime(user.password_changed_at);
                return res.status(401).json({ 
                    error: `Atenção: a senha desta conta foi alterada ${tempoRelativo}. Caso não tenha sido você, entre em contato imediatamente com o suporte.` 
                });
            }

            return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
        }

        // Sucesso no login: zera as tentativas falhas
        if (user.failed_login_attempts > 0) {
            await pool.query('UPDATE usuarios SET failed_login_attempts = 0 WHERE id = ?', [user.id]);
        }

        // Gera JWT
        const token = jwt.sign(
            { id: user.id, nome: user.nome, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'your_super_secret_key_here',
            { expiresIn: '8h' }
        );

        await registrarAuditoria(user.id, 'LOGIN_SUCESSO', 'usuarios', req);

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro interno no servidor.' });
    }
};

exports.changePassword = async (req, res) => {
    const userId = req.user.id; // Vem do token JWT validado pelo middleware
    const { currentPassword, newPassword } = req.body;

    try {
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, error: 'Forneça a senha atual e a nova senha.' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, error: 'A nova senha deve ter pelo menos 6 caracteres.' });
        }

        const [rows] = await pool.query('SELECT senha FROM usuarios WHERE id = ? AND ativo = 1', [userId]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Usuário não encontrado.' });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(currentPassword, user.senha);
        
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Senha atual incorreta.' });
        }

        // Criptografa nova senha
        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        // Atualiza a senha, data de alteração e zera falhas
        await pool.query(
            'UPDATE usuarios SET senha = ?, password_changed_at = NOW(), failed_login_attempts = 0 WHERE id = ?', 
            [hashedNewPassword, userId]
        );

        await registrarAuditoria(userId, 'TROCA_SENHA', 'usuarios', req);

        res.json({ success: true, message: 'Senha alterada com sucesso.' });
    } catch (error) {
        console.error('Erro na troca de senha:', error);
        res.status(500).json({ success: false, error: 'Erro interno do servidor ao trocar senha.' });
    }
};

async function registrarAuditoria(userId, acao, tabela, req) {
    try {
        const ip = req.ip || req.connection.remoteAddress;
        const status = acao.includes('SUCESSO') || acao === 'TROCA_SENHA' ? 'sucesso' : 'falha';
        await pool.query(
            'INSERT INTO auditoria_logs (usuario_id, acao, tabela_afetada, ip_originario, status) VALUES (?, ?, ?, ?, ?)',
            [userId, acao, tabela, ip, status]
        );
    } catch (err) {
        console.error('Falha ao registrar auditoria:', err);
    }
}
