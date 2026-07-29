const pool = require('../config/db');
const uploadClient = require('../config/uploadClient');
const fs = require('fs');
const path = require('path');
const { logAudit } = require('../utils/auditLogger');

// Utilitário para verificar role do usuário a partir do token
// Como o req.user é setado pelo verifyToken middleware:
// req.user = { id, role }

exports.getAllProjects = async (req, res) => {
    try {
        // req.user pode ou não existir (se for rota pública sem token)
        const userRole = req.user?.role;
        const userId = req.user?.id;
        
        let query = `
            SELECT p.*, 
                   c.nome as cliente_nome, c.logo_url as cliente_logo,
                   s.nome as servico_nome,
                   u.nome as autor_nome
            FROM projetos p
            LEFT JOIN clientes c ON p.cliente_id = c.id
            LEFT JOIN servicos s ON p.servico_id = s.id
            LEFT JOIN usuarios u ON p.created_by = u.id
        `;
        
        let whereClauses = [];
        let params = [];

        if (userRole === 'admin_master') {
            // Admin master vê tudo (draft, pending, active, concluido, etc)
        } else if (userRole === 'user') {
            // Usuário normal vê ativos, concluídos e os próprios projetos (draft, pending)
            whereClauses.push(`(p.status IN ('active', 'concluido') OR p.created_by = ?)`);
            params.push(userId);
        } else {
            // Visitante não logado vê apenas ativos e concluídos
            whereClauses.push(`p.status IN ('active', 'concluido')`);
        }

        if (whereClauses.length > 0) {
            query += ` WHERE ` + whereClauses.join(' AND ');
        }
        
        query += ` ORDER BY p.ano_desenvolvimento DESC, p.criado_em DESC`;

        const [projetos] = await pool.query(query, params);

        // Para cada projeto, buscar tecnologias e galeria
        for (let p of projetos) {
            const [tecs] = await pool.query(`
                SELECT t.id, t.nome, t.icone_url 
                FROM tecnologias t
                JOIN projeto_tecnologias pt ON t.id = pt.tecnologia_id
                WHERE pt.projeto_id = ?
            `, [p.id]);
            p.tecnologias = tecs;
            
            const [updates] = await pool.query(`
                SELECT id, title, month_year, description, is_public, created_at, updated_at
                FROM project_updates
                WHERE project_id = ?
                ORDER BY created_at DESC
            `, [p.id]);

            const [galeria] = await pool.query(`SELECT id, imagem_url, update_id FROM projeto_imagens WHERE projeto_id = ?`, [p.id]);
            
            p.updates = updates.map(u => ({
                ...u,
                is_public: u.is_public === 1,
                photos: galeria.filter(g => g.update_id === u.id)
            }));

            p.galeria = galeria.filter(g => g.update_id === null);
            // Parse JSON stakeholders se existir
            if (p.stakeholders) {
                try { p.stakeholders = JSON.parse(p.stakeholders); }
                catch(e) { p.stakeholders = []; }
            } else {
                p.stakeholders = [];
            }
        }

        res.json({ success: true, data: projetos });
    } catch (e) {
        console.error('Erro getAllProjects:', e);
        res.status(500).json({ success: false, message: 'Erro ao buscar projetos' });
    }
};

exports.getProjectById = async (req, res) => {
    try {
        const { id } = req.params;
        const userRole = req.user?.role;
        const userId = req.user?.id;
        
        let query = `
            SELECT p.*, 
                   c.nome as cliente_nome, c.logo_url as cliente_logo,
                   s.nome as servico_nome,
                   u.nome as autor_nome
            FROM projetos p
            LEFT JOIN clientes c ON p.cliente_id = c.id
            LEFT JOIN servicos s ON p.servico_id = s.id
            LEFT JOIN usuarios u ON p.created_by = u.id
            WHERE p.id = ?
        `;

        const [projetos] = await pool.query(query, [id]);
        if (projetos.length === 0) return res.status(404).json({ success: false, message: 'Projeto não encontrado' });
        
        const p = projetos[0];
        
        // Verifica permissão se for user ou visitante (visitante não pode ver rascunhos, user só vê os próprios)
        if (p.status !== 'active' && p.status !== 'concluido') {
            if (userRole !== 'admin_master' && p.created_by !== userId) {
                return res.status(403).json({ success: false, message: 'Sem permissão para ver este projeto' });
            }
        }

        const [tecs] = await pool.query(`
            SELECT t.id, t.nome, t.icone_url 
            FROM tecnologias t
            JOIN projeto_tecnologias pt ON t.id = pt.tecnologia_id
            WHERE pt.projeto_id = ?
        `, [p.id]);
        p.tecnologias = tecs;
        
        const [updates] = await pool.query(`
            SELECT id, title, month_year, description, is_public, created_at, updated_at
            FROM project_updates
            WHERE project_id = ?
            ORDER BY created_at DESC
        `, [p.id]);
        
        const [galeria] = await pool.query(`SELECT id, imagem_url, update_id FROM projeto_imagens WHERE projeto_id = ?`, [p.id]);
        
        p.updates = updates.map(u => ({
            ...u,
            is_public: u.is_public === 1,
            photos: galeria.filter(g => g.update_id === u.id)
        }));

        p.galeria = galeria.filter(g => g.update_id === null);

        if (p.stakeholders) {
            try { p.stakeholders = JSON.parse(p.stakeholders); }
            catch(e) { p.stakeholders = []; }
        } else {
            p.stakeholders = [];
        }

        res.json({ success: true, data: p });
    } catch (e) {
        console.error('Erro getProjectById:', e);
        res.status(500).json({ success: false, message: 'Erro ao buscar projeto' });
    }
};

exports.createProject = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        const { 
            titulo, cliente_id, servico_id, setor, descricao_detalhada, 
            resumo_curto, desafios, metodologias, link_oficial, 
            ano_desenvolvimento, status_solicitado, tecnologias, stakeholders,
            localizacao, kpis_impacto
        } = req.body;
        
        let imagem_url = null;
        if (req.files && req.files['cover_image']) {
            imagem_url = `/uploads/projects/${req.files['cover_image'][0].filename}`;
        }
        
        const userId = req.user.id;
        const userRole = req.user.role;

        // Verificar flag de aprovação
        const [config] = await connection.query(`SELECT valor FROM config_home WHERE chave = 'require_project_approval'`);
        const requireApproval = config.length > 0 && config[0].valor === '1';

        let finalStatus = status_solicitado || 'draft';
        if (finalStatus === 'active') {
            if (userRole !== 'admin_master' && requireApproval) {
                finalStatus = 'pending';
            }
        }

        const stakeholdersJson = stakeholders ? (typeof stakeholders === 'string' ? stakeholders : JSON.stringify(stakeholders)) : '[]';

        const [result] = await connection.query(`
            INSERT INTO projetos 
            (titulo, cliente_id, servico_id, setor, resumo_curto, descricao_detalhada, desafios, metodologias, link_oficial, ano_desenvolvimento, stakeholders, imagem_url, status, created_by, localizacao, kpis_impacto)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            titulo || null, 
            cliente_id || null, 
            servico_id || null, 
            setor || null, 
            resumo_curto || null, 
            descricao_detalhada || null, 
            desafios || null, 
            metodologias || null, 
            link_oficial || null, 
            ano_desenvolvimento || null, 
            stakeholdersJson || null, 
            imagem_url || null, 
            finalStatus || null, 
            userId || null, 
            localizacao || null, 
            kpis_impacto || null
        ]);
        
        const projetoId = result.insertId;

        // Inserir tecnologias
        if (tecnologias) {
            let tecsArray = typeof tecnologias === 'string' ? JSON.parse(tecnologias) : tecnologias;
            for (const techId of tecsArray) {
                await connection.query(
                    `INSERT INTO projeto_tecnologias (projeto_id, tecnologia_id) VALUES (?, ?)`,
                    [projetoId, techId]
                );
            }
        }

        // Inserir Galeria
        if (req.files && req.files['gallery']) {
            for (const file of req.files['gallery']) {
                await connection.query(
                    `INSERT INTO projeto_imagens (projeto_id, imagem_url) VALUES (?, ?)`,
                    [projetoId, `/uploads/projects/${file.filename}`]
                );
            }
        }

        // Inserir Updates (Histórico)
        const { updates } = req.body;
        if (updates) {
            let updatesArray = typeof updates === 'string' ? JSON.parse(updates) : updates;
            for (let i = 0; i < updatesArray.length; i++) {
                const u = updatesArray[i];
                const [uRes] = await connection.query(
                    `INSERT INTO project_updates (project_id, title, month_year, description, is_public) VALUES (?, ?, ?, ?, ?)`,
                    [projetoId, u.title, u.month_year, u.description, u.is_public ? 1 : 0]
                );
                const updateId = uRes.insertId;

                const updateGalleryFiles = req.files && req.files[`update_gallery_${i}`] ? req.files[`update_gallery_${i}`] : [];
                for (const file of updateGalleryFiles) {
                    await connection.query(
                        `INSERT INTO projeto_imagens (projeto_id, update_id, imagem_url) VALUES (?, ?, ?)`,
                        [projetoId, updateId, `/uploads/projects/${file.filename}`]
                    );
                }
            }
        }

        await connection.commit();
        res.status(201).json({ success: true, message: 'Projeto criado com sucesso', data: { id: projetoId, status: finalStatus } });
    } catch (e) {
        await connection.rollback();
        console.error('Erro createProject:', e);
        try { fs.writeFileSync(path.join(__dirname, '..', 'error_create.log'), JSON.stringify({ body: req.body, error: e.message, stack: e.stack }, null, 2)); } catch(ex){}
        res.status(500).json({ success: false, message: 'Erro ao criar projeto', error: e.message, stack: e.stack });
    } finally {
        connection.release();
    }
};

exports.updateProject = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Verificar permissão
        const [proj] = await connection.query('SELECT created_by, status FROM projetos WHERE id = ?', [id]);
        if (proj.length === 0) return res.status(404).json({ success: false, message: 'Projeto não encontrado' });
        
        if (userRole !== 'admin_master' && proj[0].created_by !== userId) {
            return res.status(403).json({ success: false, message: 'Sem permissão para editar este projeto' });
        }

        const { 
            titulo, cliente_id, servico_id, setor, descricao_detalhada, 
            resumo_curto, desafios, metodologias, link_oficial, 
            ano_desenvolvimento, status_solicitado, tecnologias, stakeholders,
            localizacao, kpis_impacto
        } = req.body;

        const stakeholdersJson = stakeholders ? (typeof stakeholders === 'string' ? stakeholders : JSON.stringify(stakeholders)) : '[]';

        // Lógica de status ao editar
        let finalStatus = proj[0].status; 
        if (status_solicitado) {
            if (userRole === 'admin_master') {
                finalStatus = status_solicitado;
            } else {
                if (status_solicitado === 'active') {
                    const [config] = await connection.query(`SELECT valor FROM config_home WHERE chave = 'require_project_approval'`);
                    const requireApproval = config.length > 0 && config[0].valor === '1';
                    finalStatus = requireApproval ? 'pending' : 'active';
                } else if (status_solicitado === 'draft') {
                    finalStatus = 'draft';
                }
            }
        }

        let updateQuery = `
            UPDATE projetos SET 
                titulo=?, cliente_id=?, servico_id=?, setor=?, resumo_curto=?, descricao_detalhada=?, 
                desafios=?, metodologias=?, link_oficial=?, ano_desenvolvimento=?, stakeholders=?, status=?, localizacao=?, kpis_impacto=?
        `;
        let params = [
            titulo || null, 
            cliente_id || null, 
            servico_id || null, 
            setor || null, 
            resumo_curto || null, 
            descricao_detalhada || null, 
            desafios || null, 
            metodologias || null, 
            link_oficial || null, 
            ano_desenvolvimento || null, 
            stakeholdersJson || null, 
            finalStatus || null, 
            localizacao || null, 
            kpis_impacto || null
        ];

        if (req.files && req.files['cover_image']) {
            updateQuery += `, imagem_url=?`;
            params.push(`/uploads/projects/${req.files['cover_image'][0].filename}`);
        }
        
        updateQuery += ` WHERE id=?`;
        params.push(id);

        await connection.query(updateQuery, params);

        // Atualizar tecnologias
        if (tecnologias) {
            let tecsArray = typeof tecnologias === 'string' ? JSON.parse(tecnologias) : tecnologias;
            await connection.query(`DELETE FROM projeto_tecnologias WHERE projeto_id = ?`, [id]);
            for (const techId of tecsArray) {
                await connection.query(
                    `INSERT INTO projeto_tecnologias (projeto_id, tecnologia_id) VALUES (?, ?)`,
                    [id, techId]
                );
            }
        }

        // Adicionar novas imagens na Galeria
        if (req.files && req.files['gallery']) {
            for (const file of req.files['gallery']) {
                await connection.query(
                    `INSERT INTO projeto_imagens (projeto_id, imagem_url) VALUES (?, ?)`,
                    [id, `/uploads/projects/${file.filename}`]
                );
            }
        }

        // Remover imagens deletadas da galeria (se enviado um array "removed_gallery")
        const { removed_gallery } = req.body;
        if (removed_gallery) {
            let removedArray = typeof removed_gallery === 'string' ? JSON.parse(removed_gallery) : removed_gallery;
            for (const imgId of removedArray) {
                await connection.query(`DELETE FROM projeto_imagens WHERE id = ? AND projeto_id = ?`, [imgId, id]);
            }
        }

        // Processar Updates (Histórico)
        const { updates, removed_updates } = req.body;
        if (removed_updates) {
            let removedUpdArray = typeof removed_updates === 'string' ? JSON.parse(removed_updates) : removed_updates;
            for (const remId of removedUpdArray) {
                await connection.query(`DELETE FROM project_updates WHERE id = ? AND project_id = ?`, [remId, id]);
            }
        }
        
        if (updates) {
            let updatesArray = typeof updates === 'string' ? JSON.parse(updates) : updates;
            for (let i = 0; i < updatesArray.length; i++) {
                const u = updatesArray[i];
                let updateId = u.id;
                
                if (updateId) {
                    await connection.query(
                        `UPDATE project_updates SET title=?, month_year=?, description=?, is_public=? WHERE id=? AND project_id=?`,
                        [u.title, u.month_year, u.description, u.is_public ? 1 : 0, updateId, id]
                    );
                } else {
                    const [uRes] = await connection.query(
                        `INSERT INTO project_updates (project_id, title, month_year, description, is_public) VALUES (?, ?, ?, ?, ?)`,
                        [id, u.title, u.month_year, u.description, u.is_public ? 1 : 0]
                    );
                    updateId = uRes.insertId;
                }

                // Inserir novas imagens deste update (se houver via upload)
                const updateGalleryFiles = req.files && req.files[`update_gallery_${i}`] ? req.files[`update_gallery_${i}`] : [];
                for (const file of updateGalleryFiles) {
                    await connection.query(
                        `INSERT INTO projeto_imagens (projeto_id, update_id, imagem_url) VALUES (?, ?, ?)`,
                        [id, updateId, `/uploads/projects/${file.filename}`]
                    );
                }
            }
        }

        await connection.commit();
        
        await logAudit({
            usuario_id: userId,
            acao: 'ATUALIZAR_PROJETO',
            tabela_afetada: 'projetos',
            registro_id: id,
            ip_originario: req.ip || req.connection.remoteAddress,
            detalhes: `Projeto '${titulo}' (ID: ${id}) atualizado.`
        });

        res.json({ success: true, message: 'Projeto atualizado com sucesso' });
    } catch (e) {
        await connection.rollback();
        console.error('Erro updateProject:', e);
        try { fs.writeFileSync(path.join(__dirname, '..', 'error_update.log'), JSON.stringify({ body: req.body, error: e.message, stack: e.stack }, null, 2)); } catch(ex){}
        res.status(500).json({ success: false, message: 'Erro ao atualizar projeto', error: e.message });
    } finally {
        connection.release();
    }
};

exports.deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const [proj] = await pool.query('SELECT titulo, created_by FROM projetos WHERE id = ?', [id]);
        if (proj.length === 0) return res.status(404).json({ success: false, message: 'Projeto não encontrado' });
        
        const projeto = proj[0];

        if (userRole !== 'admin_master' && projeto.created_by !== userId) {
            return res.status(403).json({ success: false, message: 'Sem permissão para excluir este projeto' });
        }

        await pool.query('DELETE FROM projetos WHERE id = ?', [id]);
        
        await logAudit({
            usuario_id: userId,
            acao: 'EXCLUIR_PROJETO',
            tabela_afetada: 'projetos',
            registro_id: id,
            ip_originario: req.ip || req.connection.remoteAddress,
            detalhes: `Projeto '${projeto.titulo}' (ID: ${id}) foi excluído pelo usuário.`
        });

        res.json({ success: true, message: 'Projeto excluído com sucesso' });
    } catch (e) {
        console.error('Erro deleteProject:', e);
        await logAudit({
            usuario_id: req.user?.id,
            acao: 'EXCLUIR_PROJETO',
            tabela_afetada: 'projetos',
            registro_id: req.params.id,
            ip_originario: req.ip || req.connection.remoteAddress,
            status: 'FALHA',
            detalhes: `Falha ao excluir projeto: ${e.message}`
        });
        res.status(500).json({ success: false, message: 'Erro ao excluir projeto' });
    }
};

exports.updateProjectStatus = async (req, res) => {
    // Apenas Master Admin
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!['active', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Status inválido' });
        }

        await pool.query('UPDATE projetos SET status = ? WHERE id = ?', [status, id]);
        res.json({ success: true, message: 'Status atualizado com sucesso' });
    } catch (e) {
        console.error('Erro updateProjectStatus:', e);
        res.status(500).json({ success: false, message: 'Erro ao atualizar status' });
    }
};

exports.getProjectUpdates = async (req, res) => {
    try {
        const { id } = req.params;
        const [updates] = await pool.query(
            'SELECT * FROM projeto_atualizacoes WHERE projeto_id = ? ORDER BY data_atualizacao DESC, created_at DESC',
            [id]
        );
        res.json({ success: true, data: updates });
    } catch (e) {
        console.error('Erro getProjectUpdates:', e);
        res.status(500).json({ success: false, message: 'Erro ao buscar atualizações do projeto' });
    }
};

exports.createProjectUpdate = async (req, res) => {
    try {
        const { id } = req.params;
        const { data_atualizacao, titulo, descricao } = req.body;
        
        // Verificação de permissão
        const userId = req.user.id;
        const userRole = req.user.role;
        const [proj] = await pool.query('SELECT created_by FROM projetos WHERE id = ?', [id]);
        
        if (proj.length === 0) return res.status(404).json({ success: false, message: 'Projeto não encontrado' });
        if (userRole !== 'admin_master' && proj[0].created_by !== userId) {
            return res.status(403).json({ success: false, message: 'Sem permissão para adicionar atualização' });
        }

        await pool.query(
            'INSERT INTO projeto_atualizacoes (projeto_id, data_atualizacao, titulo, descricao) VALUES (?, ?, ?, ?)',
            [id, data_atualizacao, titulo, descricao]
        );
        
        res.status(201).json({ success: true, message: 'Atualização criada com sucesso' });
    } catch (e) {
        console.error('Erro createProjectUpdate:', e);
        res.status(500).json({ success: false, message: 'Erro ao criar atualização' });
    }
};

exports.deleteProjectUpdate = async (req, res) => {
    try {
        const { update_id } = req.params;
        
        // Precisamos descobrir o projeto_id para checar permissões
        const [update] = await pool.query('SELECT projeto_id FROM projeto_atualizacoes WHERE id = ?', [update_id]);
        if (update.length === 0) return res.status(404).json({ success: false, message: 'Atualização não encontrada' });
        
        const projetoId = update[0].projeto_id;
        const userId = req.user.id;
        const userRole = req.user.role;

        const [proj] = await pool.query('SELECT created_by FROM projetos WHERE id = ?', [projetoId]);
        if (userRole !== 'admin_master' && proj[0].created_by !== userId) {
            return res.status(403).json({ success: false, message: 'Sem permissão para excluir esta atualização' });
        }

        await pool.query('DELETE FROM projeto_atualizacoes WHERE id = ?', [update_id]);
        res.json({ success: true, message: 'Atualização excluída com sucesso' });
    } catch (e) {
        console.error('Erro deleteProjectUpdate:', e);
        res.status(500).json({ success: false, message: 'Erro ao excluir atualização' });
    }
};
