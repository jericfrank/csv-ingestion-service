import { Worker, Job } from 'bullmq';
import { connection } from '../redis';
import { QUEUE_NAMES, PROCESSING_CONFIG } from '../constants';
import { CsvRow, TransformData, TableName } from '../types';
import db from '../db';
import { logger } from '../utils/logger';

interface InsertionJobData {
  rows: CsvRow[];
  last: boolean;
  originalName: string;
  startTime: number;
}

async function insertBatchToDatabase(job: Job<InsertionJobData>): Promise<void> {
  const { rows, last, originalName, startTime } = job.data;

  try {
    if (rows.length > 0) {
      const formatted = rows.map(TransformData);
      await db(TableName).insert(formatted);
    }

    if (last) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      logger.info('DB_INSERTION', `File processing completed`, {
        file: originalName,
        duration: `${duration}s`,
      });
    }
  } catch (error) {
    logger.error('DB_INSERTION', `Failed to insert batch for ${originalName}`, error);
    throw error;
  }
}

export const startDbInsertionWorker = (): Worker => {
  const worker = new Worker<InsertionJobData>(
    QUEUE_NAMES.INSERTION,
    insertBatchToDatabase,
    {
      connection,
      concurrency: PROCESSING_CONFIG.INSERTION_CONCURRENCY,
    }
  );

  worker.on('failed', (job, err) => {
    logger.error('DB_INSERTION', `Job failed: ${job?.id}`, err);
  });

  return worker;
};
