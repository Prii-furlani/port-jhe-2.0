const pool = require('../config/db');

exports.getHomeSettings = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT chave, valor FROM config_home');
        
        // Transformar o array de {chave, valor} em um único objeto JSON { "hero_title": "...", "hero_subtitle": "..." }
        const settings = {};
        rows.forEach(row => {
            settings[row.chave] = row.valor;
        });

        res.json({ success: true, data: settings });
    } catch (error) {
        console.error('Erro ao buscar configurações da Home:', error);
        res.status(500).json({ success: false, error: 'Erro interno.' });
    }
};

exports.updateHomeSettings = async (req, res) => {
    try {
        const { hero_title, hero_subtitle, require_project_approval } = req.body;
        
        // Verifica se a imagem foi enviada pelo Multer
        const file = req.file;
        let hero_image_url = null;

        if (file) {
            // Salva o caminho relativo (acessível pelo frontend estaticamente)
            hero_image_url = `/uploads/settings/${file.filename}`;
        }

        // Helper para o UPSERT (ON DUPLICATE KEY UPDATE)
        const queries = [];
        
        if (hero_title !== undefined) {
            queries.push(pool.query(
                `INSERT INTO config_home (chave, valor) VALUES ('hero_title', ?) ON DUPLICATE KEY UPDATE valor = VALUES(valor)`,
                [hero_title]
            ));
        }

        if (hero_subtitle !== undefined) {
            queries.push(pool.query(
                `INSERT INTO config_home (chave, valor) VALUES ('hero_subtitle', ?) ON DUPLICATE KEY UPDATE valor = VALUES(valor)`,
                [hero_subtitle]
            ));
        }

        if (require_project_approval !== undefined) {
            queries.push(pool.query(
                `INSERT INTO config_home (chave, valor) VALUES ('require_project_approval', ?) ON DUPLICATE KEY UPDATE valor = VALUES(valor)`,
                [require_project_approval]
            ));
        }

        if (hero_image_url !== null) {
            queries.push(pool.query(
                `INSERT INTO config_home (chave, valor) VALUES ('hero_image', ?) ON DUPLICATE KEY UPDATE valor = VALUES(valor)`,
                [hero_image_url]
            ));
        }

        // Executa todas as atualizações em paralelo
        await Promise.all(queries);

        res.json({ success: true, message: 'Configurações atualizadas com sucesso!', image_url: hero_image_url });

    } catch (error) {
        console.error('Erro ao atualizar configurações da Home:', error);
        res.status(500).json({ success: false, error: 'Erro ao salvar configurações.' });
    }
};
