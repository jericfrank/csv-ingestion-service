import express from 'express';
import { config } from './config';
import { startAllWorkers } from './workers';
import routes from './routes';
import { logger } from './utils/logger';

const PORT = config.app.port;

const app = express();

// Initialize routes
app.use(routes);

// Start workers
startAllWorkers();

// Start server
app.listen(PORT, () => {
  logger.info('SERVER', `Server running on http://localhost:${PORT}`);
});