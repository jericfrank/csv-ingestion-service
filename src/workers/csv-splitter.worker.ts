import { Worker, Job } from 'bullmq';
import fs from 'fs';
import { parse } from 'csv-parse';
import { connection } from '../redis';
import { QUEUE_NAMES, PROCESSING_CONFIG } from '../constants';
import { insertionQueue, createJobOptions } from '../queues/queue-factory';
import { CsvRow } from '../types';
import { logger } from '../utils/logger';

interface SplitterJobData {
  filePath: string;
  originalName: string;
  startTime: number;
}

interface BatchMetadata {
  originalName: string;
  startTime: number;
}

async function enqueueBatch(
  rows: CsvRow[],
  meta: BatchMetadata,
  isLast = false
): Promise<void> {
  await insertionQueue.add(
    'insert-batch',
    { rows, ...meta, last: isLast },
    createJobOptions()
  );
}

async function processCsvFile(job: Job<SplitterJobData>): Promise<void> {
  const { filePath, originalName, startTime } = job.data;
  const meta = { originalName, startTime };
  let batch: CsvRow[] = [];
  let totalRows = 0;

  logger.info('CSV_SPLITTER', `Processing file: ${originalName}`);

  try {
    const parser = fs.createReadStream(filePath).pipe(parse({ columns: true }));

    for await (const row of parser) {
      batch.push(row);
      totalRows++;

      if (batch.length >= PROCESSING_CONFIG.BATCH_SIZE) {
        await enqueueBatch([...batch], meta);
        batch = [];
      }
    }

    // Enqueue remaining rows
    if (batch.length > 0 || totalRows > 0) {
      await enqueueBatch(batch, meta, true);
    }

    logger.info('CSV_SPLITTER', `Completed processing`, {
      file: originalName,
      totalRows,
    });

    // Clean up uploaded file
    await fs.promises.unlink(filePath);
  } catch (error) {
    logger.error('CSV_SPLITTER', `Failed to process file: ${originalName}`, error);
    throw error;
  }
}

export const startCsvSplitterWorker = (): Worker => {
  const worker = new Worker<SplitterJobData>(
    QUEUE_NAMES.SPLITTER,
    processCsvFile,
    { connection }
  );

  worker.on('failed', (job, err) => {
    logger.error('CSV_SPLITTER', `Job failed: ${job?.id}`, err);
  });

  return worker;
};
