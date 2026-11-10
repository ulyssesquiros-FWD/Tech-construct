const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

// Middlewares empresariales Tech-Construct S.A.
const {
  securityHeaders,
  requestLogger,
  rateLimiter,
  sanitizeInput,
  auditLogMiddleware,
  errorHandler
} = require('./middlewares');

const materialRoutes = require('./routes/materialRoutes');
const locationRoutes = require('./routes/locationRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const movementRoutes = require('./routes/movementRoutes');
const purchaseOrderRoutes = require('./routes/purchaseOrderRoutes');
const alertRoutes = require('./routes/alertRoutes');
const approvalRoutes = require('./routes/approvalRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

const app = express();

// 1. Cabeceras HTTP de Seguridad (Hardening)
app.use(securityHeaders);

// 2. Rastreo de Rendimiento y Logging de Solicitudes (Correlation ID & Performance)
app.use(requestLogger);

// 3. Limitador de Tasa Anti-Abuso / DoS (250 req/min por IP)
app.use(rateLimiter({ windowMs: 60 * 1000, maxRequests: 250 }));

// 4. CORS Empresarial
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-request-id']
}));

// 5. Parsers de Petición HTTP
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 6. Sanitizador contra Inyecciones XSS y Caracteres Nulos
app.use(sanitizeInput);

// 7. Bitácora Automática de Auditoría Forense en MySQL (POST/PUT/DELETE)
app.use(auditLogMiddleware);

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    system: 'Tech-Construct S.A. - Sistema de Gestión de Inventarios',
    admin: 'Ulysses Quirós',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Rutas de la API REST empresarial
app.use('/api/materiales', materialRoutes);
app.use('/api/ubicaciones', locationRoutes);
app.use('/api/proveedores', supplierRoutes);
app.use('/api/movimientos', movementRoutes);
app.use('/api/ordenes', purchaseOrderRoutes);
app.use('/api/alertas', alertRoutes);
app.use('/api/aprobaciones', approvalRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/categorias', categoryRoutes);

// Manejador centralizado de 404
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
});

// Manejador centralizado de excepciones y errores
app.use(errorHandler);

module.exports = app;
