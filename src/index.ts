import http from 'http';
import { testPostgresConnection, testAuthService, testFunctionService } from './services/neon.js';

const PORT = process.env.PORT || 3001;

export const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.url === '/' || req.url === '/health') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'ok', service: 'NCTGIS Neon App' }));
    return;
  }

  if (req.url === '/api/test-services') {
    try {
      const [pgResult, authResult, fnResult] = await Promise.all([
        testPostgresConnection(),
        testAuthService(),
        testFunctionService(),
      ]);

      res.writeHead(200);
      res.end(JSON.stringify({
        status: 'all_services_operational',
        services: {
          postgres: pgResult,
          auth: authResult,
          functions: fnResult,
        },
      }, null, 2));
    } catch (err: any) {
      res.writeHead(500);
      res.end(JSON.stringify({ status: 'error', error: err.message }));
    }
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`[NCTGIS App] Server running at http://localhost:${PORT}`);
  });
}
