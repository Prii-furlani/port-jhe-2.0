const express = require('express');
const router = express.Router();

// Import middlewares
const { verifyToken, requireMasterAdmin, optionalVerifyToken } = require('../middlewares/authMiddleware');
const upload = require('../config/upload');

// Import controllers
const authController = require('../controllers/authController');
const projectController = require('../controllers/projectController');
const clientController = require('../controllers/clientController');
const serviceController = require('../controllers/serviceController');
const telemetryController = require('../controllers/telemetryController');
const userTelemetryController = require('../controllers/userTelemetryController');
const userDashboardController = require('../controllers/userDashboardController');
const reviewController = require('../controllers/reviewController');
const settingsController = require('../controllers/settingsController');
const adminController = require('../controllers/adminController');
const auditController = require('../controllers/auditController');
const technologyController = require('../controllers/technologyController');
const uploadClient = require('../config/uploadClient');
const uploadProject = require('../config/uploadProject');
const pillarController = require('../controllers/pillarController');
const timelineController = require('../controllers/timelineController');

// Rota do Dashboard (Somente Admin Master)
router.get('/admin/dashboard/summary', verifyToken, requireMasterAdmin, adminController.getDashboardSummary);
router.get('/admin/telemetry/summary', verifyToken, requireMasterAdmin, telemetryController.getTelemetrySummary);
router.get('/admin/telemetry/export/pdf', verifyToken, requireMasterAdmin, telemetryController.exportPdfSummary);
router.get('/admin/audit-logs', verifyToken, requireMasterAdmin, auditController.getAuditLogs);
router.get('/admin/audit-logs/export/pdf', verifyToken, requireMasterAdmin, auditController.exportPdf);

// Rotas da Fila de Moderação (Somente Admin Master)
router.get('/admin/projects/pending', verifyToken, requireMasterAdmin, reviewController.getPendingProjects);
router.patch('/admin/projects/:id/approve', verifyToken, requireMasterAdmin, reviewController.approveProject);
router.patch('/admin/projects/:id/reject', verifyToken, requireMasterAdmin, reviewController.rejectProject);

// Rotas da Linha do Tempo (CRUD)
router.get('/timeline', timelineController.getAllEvents);
router.post('/timeline', verifyToken, requireMasterAdmin, timelineController.createEvent);
router.put('/timeline/:id', verifyToken, requireMasterAdmin, timelineController.updateEvent);
router.delete('/timeline/:id', verifyToken, requireMasterAdmin, timelineController.deleteEvent);

// Rotas de Pilares (CRUD)
router.get('/pillars', pillarController.getAllPillars);
router.post('/pillars', verifyToken, requireMasterAdmin, pillarController.createPillar);
router.put('/pillars/:id', verifyToken, requireMasterAdmin, pillarController.updatePillar);
router.delete('/pillars/:id', verifyToken, requireMasterAdmin, pillarController.deletePillar);

// Rotas de Clientes (CRUD)
router.get('/clients', clientController.getAllClients);
router.post('/clients', verifyToken, requireMasterAdmin, uploadClient.single('logo'), clientController.createClient);
router.put('/clients/:id', verifyToken, requireMasterAdmin, uploadClient.single('logo'), clientController.updateClient);
router.delete('/clients/:id', verifyToken, requireMasterAdmin, clientController.deleteClient);

// Rotas de Serviços (CRUD)
router.get('/services', serviceController.getAllServices);
router.post('/services', verifyToken, requireMasterAdmin, serviceController.createService);
router.put('/services/:id', verifyToken, requireMasterAdmin, serviceController.updateService);
router.delete('/services/:id', verifyToken, requireMasterAdmin, serviceController.deleteService);

// Rotas de Tecnologias (CRUD)
router.get('/technologies', technologyController.getAllTechnologies);
router.post('/technologies', verifyToken, requireMasterAdmin, technologyController.createTechnology);
router.put('/technologies/:id', verifyToken, requireMasterAdmin, technologyController.updateTechnology);
router.delete('/technologies/:id', verifyToken, requireMasterAdmin, technologyController.deleteTechnology);

// Health check
router.get('/health', (req, res) => res.json({ status: 'ok' }));

// Rotas de Autenticação
router.post('/auth/login', authController.login);
router.put('/auth/change-password', verifyToken, authController.changePassword);

// Rota de Telemetria e Dashboard do Usuário Comum
router.get('/user/telemetry', verifyToken, userTelemetryController.getUserTelemetry);
router.get('/user/dashboard-summary', verifyToken, userDashboardController.getDashboardSummary);

// Rotas Públicas de Portfólio e Configurações
router.get('/portfolio', clientController.getPortfolioClients);
router.get('/settings/home', settingsController.getHomeSettings);

// Rotas Protegidas (Requer Autenticação e Role de Admin)
router.put('/settings/home', verifyToken, requireMasterAdmin, upload.fields([
  { name: 'hero_image', maxCount: 1 },
  { name: 'logo_light', maxCount: 1 },
  { name: 'logo_dark', maxCount: 1 },
  { name: 'logo_footer', maxCount: 1 }
]), settingsController.updateHomeSettings);

// Rotas de Projetos (CRUD)
router.get('/projects', optionalVerifyToken, projectController.getAllProjects);
router.get('/projects/:id', optionalVerifyToken, projectController.getProjectById);
router.post('/projects', verifyToken, uploadProject.fields([{ name: 'cover_image', maxCount: 1 }, { name: 'gallery', maxCount: 10 }]), projectController.createProject);
router.put('/projects/:id', verifyToken, uploadProject.fields([{ name: 'cover_image', maxCount: 1 }, { name: 'gallery', maxCount: 10 }]), projectController.updateProject);
router.delete('/projects/:id', verifyToken, projectController.deleteProject);
router.patch('/projects/:id/status', verifyToken, requireMasterAdmin, projectController.updateProjectStatus);

module.exports = router;
