const jwt = require('jsonwebtoken');

// Verifica se o Token é válido
exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(403).json({ success: false, error: 'Token não fornecido.' });

    const token = authHeader.split(' ')[1]; // formato: "Bearer <token>"
    if (!token) return res.status(403).json({ success: false, error: 'Token não fornecido.' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jhe_super_secret_key_2026');
        req.user = decoded; // insere os dados do usuário no request
        next();
    } catch (err) {
        return res.status(401).json({ success: false, error: 'Token inválido ou expirado.' });
    }
};

// Verifica se a role é admin_master
exports.requireMasterAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin_master') {
        return res.status(403).json({ success: false, error: 'Acesso negado: Requer privilégios de Master Admin.' });
    }
    next();
};

// Verifica o token mas não barra se não houver
exports.optionalVerifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jhe_super_secret_key_2026');
                req.user = decoded;
            } catch (err) {}
        }
    }
    next();
};
