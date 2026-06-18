import 'dotenv/config';
import { spawn } from 'child_process';
import http from 'http';
import path from 'path';

const PORT = process.env.PORT || 3000;
const ROOT = path.resolve('./');
const SERVER_FILE = path.join(ROOT, 'server.js');
const HEALTH_URL = `http://localhost:${PORT}/test-db`;

const waitForServer = (url, timeoutMs = 10000) => {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = () => {
      http.get(url, (res) => {
        resolve({ statusCode: res.statusCode, url });
      }).on('error', (err) => {
        if (Date.now() - start >= timeoutMs) {
          reject(new Error(`Server did not start within ${timeoutMs}ms: ${err.message}`));
        } else {
          setTimeout(attempt, 300);
        }
      });
    };
    attempt();
  });
};

const server = spawn('node', [SERVER_FILE], {
  cwd: ROOT,
  stdio: ['ignore', 'inherit', 'inherit']
});

server.on('error', (err) => {
  console.error('Failed to start server process:', err);
  process.exit(1);
});

const cleanup = () => {
  if (!server.killed) {
    server.kill();
  }
};

process.on('exit', cleanup);
process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));

(async () => {
  try {
    console.log(`Waiting for server on ${HEALTH_URL}...`);
    const result = await waitForServer(HEALTH_URL, 10000);
    console.log(`Server responded with status ${result.statusCode}`);
    if (result.statusCode >= 200 && result.statusCode < 500) {
      console.log('Smoke test passed.');
      process.exit(0);
    }
    console.error('Smoke test failed: unexpected status code', result.statusCode);
    process.exit(1);
  } catch (error) {
    console.error('Smoke test failed:', error.message);
    process.exit(1);
  } finally {
    cleanup();
  }
})();
