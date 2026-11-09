const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

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

// Middlewares globales
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    system: 'Constructora Del Valle S.A. - Sistema de Gestión de Inventarios',
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

// Manejador centralizado de errores
app.use((err, req, res, next) => {
  console.error('Error no controlado:', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

module.exports = app;
