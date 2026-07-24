const pool = require('../config/db');

// Busca todos os projetos que estão na Fila (Aguardando Moderação = pending)
exports.getPendingProjects = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    try {
      // Usando 'Serviço' em vez de 'Setor' no alias se preferir, ou usar 'setor' e mapear no frontend.
      // Retornaremos pending, mas também traremos rejected e active para poder filtrar nas abas do front se necessário,
      // ou podemos receber um query param de status. O prompt diz:
      // "Rota GET /api/admin/projects/pending: Traz todos os projetos com status = 'pending', incluindo dados do autor"
      // Faremos uma busca genérica baseada em query de status, padronizando 'pending' se não especificado.
      const statusFilter = req.query.status || 'pending';

      const [projects] = await connection.query(`
        SELECT 
          p.id, p.titulo as title, p.setor as service, p.status, p.criado_em as submitted_at, p.imagem_url as cover_image_url, p.review_feedback,
          c.nome as client_name,
          u.nome as author_name, u.email as author_email
        FROM projetos p
        LEFT JOIN usuarios u ON p.created_by = u.id
        LEFT JOIN clientes c ON p.cliente_id = c.id
        WHERE p.status = ?
        ORDER BY p.criado_em DESC
      `, [statusFilter]);

      res.json({ success: true, data: projects });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Erro em getPendingProjects:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar fila de revisão.' });
  }
};

exports.approveProject = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    try {
      await connection.query(`
        UPDATE projetos 
        SET status = 'active', review_feedback = NULL 
        WHERE id = ?
      `, [id]);

      res.json({ success: true, message: 'Projeto aprovado e publicado com sucesso!' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Erro em approveProject:', error);
    res.status(500).json({ success: false, message: 'Erro ao aprovar projeto.' });
  }
};

exports.rejectProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { review_feedback } = req.body;

    if (!review_feedback) {
      return res.status(400).json({ success: false, message: 'A justificativa de rejeição é obrigatória.' });
    }

    const connection = await pool.getConnection();

    try {
      await connection.query(`
        UPDATE projetos 
        SET status = 'rejected', review_feedback = ? 
        WHERE id = ?
      `, [review_feedback, id]);

      res.json({ success: true, message: 'Projeto rejeitado e autor notificado.' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Erro em rejectProject:', error);
    res.status(500).json({ success: false, message: 'Erro ao rejeitar projeto.' });
  }
};
