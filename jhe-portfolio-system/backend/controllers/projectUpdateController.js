const pool = require('../config/db');

exports.getProjectUpdates = async (req, res) => {
    try {
        const { id } = req.params;
        const [updates] = await pool.query(
            'SELECT * FROM project_updates WHERE project_id = ? ORDER BY update_date DESC, created_at DESC',
            [id]
        );
        
        // Fetch gallery for each update
        for (let update of updates) {
            const [gallery] = await pool.query('SELECT id, imagem_url FROM projeto_imagens WHERE update_id = ?', [update.id]);
            update.gallery = gallery;
        }

        res.json({ success: true, data: updates });
    } catch (e) {
        console.error('Erro getProjectUpdates:', e);
        res.status(500).json({ success: false, message: 'Erro ao buscar atualizações do projeto' });
    }
};

exports.createProjectUpdate = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { id } = req.params;
        const { update_date, title, description } = req.body;
        
        // Verificação de permissão
        const userId = req.user.id;
        const userRole = req.user.role;
        const [proj] = await connection.query('SELECT created_by FROM projetos WHERE id = ?', [id]);
        
        if (proj.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Projeto não encontrado' });
        }
        
        if (userRole !== 'admin_master' && proj[0].created_by !== userId) {
            await connection.rollback();
            return res.status(403).json({ success: false, message: 'Sem permissão para adicionar atualização' });
        }

        const [result] = await connection.query(
            'INSERT INTO project_updates (project_id, created_by, title, description, update_date) VALUES (?, ?, ?, ?, ?)',
            [id, userId, title, description, update_date]
        );
        
        const updateId = result.insertId;

        // Inserir Novas Imagens na Galeria
        if (req.files && req.files['gallery']) {
            for (const file of req.files['gallery']) {
                await connection.query(
                    `INSERT INTO projeto_imagens (projeto_id, update_id, imagem_url) VALUES (?, ?, ?)`,
                    [id, updateId, `/uploads/projects/${file.filename}`]
                );
            }
        }

        // Auditoria
        await connection.query(
            'INSERT INTO auditoria_logs (usuario_id, acao, tabela_afetada, registro_id, ip_originario, status, detalhes) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, 'CRIAR_ATUALIZACAO', 'project_updates', updateId, req.ip, 'SUCESSO', `Adicionou a atualização '${title}' no Projeto ID ${id}`]
        );

        await connection.commit();
        res.status(201).json({ success: true, message: 'Atualização criada com sucesso' });
    } catch (e) {
        await connection.rollback();
        console.error('Erro createProjectUpdate:', e);
        res.status(500).json({ success: false, message: 'Erro ao criar atualização' });
    } finally {
        connection.release();
    }
};

exports.deleteProjectUpdate = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { update_id } = req.params;
        
        const [update] = await connection.query('SELECT project_id, title FROM project_updates WHERE id = ?', [update_id]);
        if (update.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Atualização não encontrada' });
        }
        
        const projetoId = update[0].project_id;
        const title = update[0].title;
        const userId = req.user.id;
        const userRole = req.user.role;

        const [proj] = await connection.query('SELECT created_by FROM projetos WHERE id = ?', [projetoId]);
        if (userRole !== 'admin_master' && proj[0].created_by !== userId) {
            await connection.rollback();
            return res.status(403).json({ success: false, message: 'Sem permissão para excluir esta atualização' });
        }

        await connection.query('DELETE FROM project_updates WHERE id = ?', [update_id]);

        // Auditoria
        await connection.query(
            'INSERT INTO auditoria_logs (usuario_id, acao, tabela_afetada, registro_id, ip_originario, status, detalhes) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, 'EXCLUIR_ATUALIZACAO', 'project_updates', update_id, req.ip, 'SUCESSO', `Excluiu a atualização '${title}' do Projeto ID ${projetoId}`]
        );

        await connection.commit();
        res.json({ success: true, message: 'Atualização excluída com sucesso' });
    } catch (e) {
        await connection.rollback();
        console.error('Erro deleteProjectUpdate:', e);
        res.status(500).json({ success: false, message: 'Erro ao excluir atualização' });
    } finally {
        connection.release();
    }
};
