const pool = require('../config/db');
const { logAudit } = require('../utils/auditLogger');

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
        const { hero_title, hero_subtitle, require_project_approval, footer_linkedin, footer_website, footer_phone } = req.body;
        
        // Verifica se a imagem foi enviada pelo Multer
        const files = req.files || {};
        
        let hero_image_url = files.hero_image ? `/uploads/settings/${files.hero_image[0].filename}` : null;
        let logo_light_url = files.logo_light ? `/uploads/settings/${files.logo_light[0].filename}` : null;
        let logo_dark_url = files.logo_dark ? `/uploads/settings/${files.logo_dark[0].filename}` : null;
        let logo_footer_url = files.logo_footer ? `/uploads/settings/${files.logo_footer[0].filename}` : null;

        // Helper para o UPSERT (ON DUPLICATE KEY UPDATE)
        const queries = [];
        
        const updateField = (key, value) => {
            if (value !== undefined && value !== null) {
                queries.push(pool.query(
                    `INSERT INTO config_home (chave, valor) VALUES (?, ?) ON DUPLICATE KEY UPDATE valor = VALUES(valor)`,
                    [key, value]
                ));
            }
        };

        updateField('hero_title', hero_title);
        updateField('hero_subtitle', hero_subtitle);
        updateField('require_project_approval', require_project_approval);
        updateField('footer_linkedin', footer_linkedin);
        updateField('footer_website', footer_website);
        updateField('footer_phone', footer_phone);

        updateField('hero_image', hero_image_url);
        updateField('logo_light', logo_light_url);
        updateField('logo_dark', logo_dark_url);
        updateField('logo_footer', logo_footer_url);

        // Executa todas as atualizações em paralelo
        await Promise.all(queries);

        res.json({ success: true, message: 'Configurações atualizadas com sucesso!', image_url: hero_image_url });

        await logAudit({
            usuario_id: req.user?.id,
            acao: 'ATUALIZAR_CONFIG',
            tabela_afetada: 'config_home',
            registro_id: 'HOME',
            ip_originario: req.ip || req.connection.remoteAddress,
            detalhes: 'Configurações gerais da Home foram atualizadas.'
        });


    } catch (error) {
        console.error('Erro ao atualizar configurações da Home:', error);
        res.status(500).json({ success: false, error: 'Erro ao salvar configurações.' });
    }
};
