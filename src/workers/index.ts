import { startCsvSplitterWorker } from './csv-splitter.worker';
import { startDbInsertionWorker } from './db-insertion.worker';
import { logger } from '../utils/logger';

export const startAllWorkers = () => {
  logger.info('WORKERS', 'Starting all workers...');

  const splitterWorker = startCsvSplitterWorker();
  const insertionWorker = startDbInsertionWorker();

  logger.info('WORKERS', 'All workers started successfully');

  return {
    splitterWorker,
    insertionWorker,
  };
};
