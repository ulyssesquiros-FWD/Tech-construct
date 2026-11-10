const request = require('supertest');
const app = require('../src/app');
const rateLimiter = require('../src/middlewares/rateLimiterMiddleware');
const sanitizeInput = require('../src/middlewares/sanitizerMiddleware');
const errorHandler = require('../src/middlewares/errorHandlerMiddleware');

describe('SUITE DE PRUEBAS DE MIDDLEWARES — TECH-CONSTRUCT S.A.', () => {

  test('1. Security Headers: Inyecta cabeceras de seguridad y oculta X-Powered-By', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(res.headers['x-xss-protection']).toBe('1; mode=block');
    expect(res.headers['strict-transport-security']).toBeDefined();
    expect(res.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  test('2. Request Logger: Genera X-Request-Id único y calcula X-Response-Time', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.headers['x-request-id']).toBeDefined();
    expect(res.headers['x-response-time']).toBeDefined();
    expect(res.headers['x-response-time']).toMatch(/^[0-9.]+ms$/);
  });

  test('3. Health Check: Valida identidad institucional de Tech-Construct y administrador Ulysses', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
    expect(res.body.system).toContain('Tech-Construct S.A.');
    expect(res.body.admin).toBe('Ulysses Quirós');
  });

  test('4. Sanitizer Middleware: Remueve scripts XSS, null bytes y recorta espacios', () => {
    const mockReq = {
      body: {
        nombre: '  Cemento Tolteca  ',
        descripcion: '<script>alert("hack")</script>Descripción de prueba',
        nested: {
          codigo: 'MAT-001\0'
        }
      },
      query: {
        filtro: '  activo  '
      },
      params: {}
    };
    const mockRes = {};
    const mockNext = jest.fn();

    sanitizeInput(mockReq, mockRes, mockNext);

    expect(mockReq.body.nombre).toBe('Cemento Tolteca');
    expect(mockReq.body.descripcion).toBe('Descripción de prueba');
    expect(mockReq.body.nested.codigo).toBe('MAT-001');
    expect(mockReq.query.filtro).toBe('activo');
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  test('5. Rate Limiter: Bloquea con HTTP 429 al superar el límite configurado', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production'; // Forzar activación del limiter

    const limiter = rateLimiter({ windowMs: 10000, maxRequests: 2 });
    const mockReq = {
      headers: {},
      socket: { remoteAddress: '192.168.1.100' }
    };
    
    let statusCode = null;
    let jsonResponse = null;
    const headersSent = {};

    const createMockRes = () => ({
      setHeader: (name, val) => { headersSent[name] = val; },
      status: (code) => {
        statusCode = code;
        return {
          json: (data) => { jsonResponse = data; }
        };
      }
    });

    const nextFn = jest.fn();

    // Petición 1: Aprobada
    limiter(mockReq, createMockRes(), nextFn);
    expect(nextFn).toHaveBeenCalledTimes(1);

    // Petición 2: Aprobada
    limiter(mockReq, createMockRes(), nextFn);
    expect(nextFn).toHaveBeenCalledTimes(2);

    // Petición 3: Excede el límite (2) -> HTTP 429
    limiter(mockReq, createMockRes(), nextFn);
    expect(nextFn).toHaveBeenCalledTimes(2); // No debe llamar next
    expect(statusCode).toBe(429);
    expect(jsonResponse.error).toBe('TOO_MANY_REQUESTS');

    process.env.NODE_ENV = originalEnv;
  });

  test('6. Error Handler Centralizado: Mapea errores de sintaxis y excepciones estándar', () => {
    const mockErr = new SyntaxError('Unexpected token');
    mockErr.status = 400;
    mockErr.body = '{ malformed';

    const mockReq = { id: 'req-test-uuid' };
    let capturedStatus = null;
    let capturedBody = null;

    const mockRes = {
      status: (code) => {
        capturedStatus = code;
        return {
          json: (data) => { capturedBody = data; }
        };
      }
    };

    errorHandler(mockErr, mockReq, mockRes, () => {});

    expect(capturedStatus).toBe(400);
    expect(capturedBody.error).toBe('INVALID_JSON_BODY');
    expect(capturedBody.requestId).toBe('req-test-uuid');
  });

  test('7. 404 Not Found: Formato estandarizado en rutas no existentes', async () => {
    const res = await request(app).get('/api/ruta-inexistente-de-prueba');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Ruta no encontrada');
  });
});
