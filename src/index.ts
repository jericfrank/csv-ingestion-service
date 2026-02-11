import express, { Request, Response } from 'express';
import multer from 'multer';
import { Queue, Worker, Job } from 'bullmq';
import fs from 'fs';
import { parse } from 'csv-parse';

import { CsvRow, TransformData, TableName } from './types';
import db from './db';
import { connection } from './redis';
import { config } from './config';

const PORT = config.app.port;
const BATCH_SIZE = 1000;
const QUEUE_NAMES = { SPLITTER: 'csv-splitter', INSERTION: 'db-insertion' };

const app = express();
const upload = multer({ dest: 'uploads/' });

const splitterQueue = new Queue(QUEUE_NAMES.SPLITTER, { connection });
const insertionQueue = new Queue(QUEUE_NAMES.INSERTION, { connection });

const defaultJobOptions = {
  removeOnComplete: true,
  removeOnFail: 1000,
  attempts: 3,
  backoff: { type: 'exponential', delay: 1000 }
};

new Worker(QUEUE_NAMES.SPLITTER, async (job: Job) => {
  const { filePath, originalName, startTime } = job.data;
  let batch: CsvRow[] = [];
  let totalRows = 0;

  const parser = fs.createReadStream(filePath).pipe(parse({ columns: true }));

  console.log(`[PROCESS] File: ${originalName}`);

  for await (const row of parser) {
    batch.push(row);
    totalRows++;

    if (batch.length >= BATCH_SIZE) {
      await insertionQueue.add('insert-batch', { rows: [...batch], originalName, startTime }, defaultJobOptions);
      batch = [];
    }
  }

  await insertionQueue.add('insert-batch', { rows: batch, originalName, startTime, last: true }, defaultJobOptions);

  console.log(`[PROCESS] Total Rows: ${totalRows}`);
  await fs.promises.unlink(filePath);
}, { connection });

new Worker(QUEUE_NAMES.INSERTION, async (job: Job) => {
  const { rows, last, originalName, startTime } = job.data;

  try {
    if (rows.length > 0) {
      const formattedRows = rows.map(TransformData);
      await db(TableName).insert(formattedRows);
    }

    if (last) {
      const durationSeconds = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`[FINISH] Duration: ${durationSeconds}s | File: ${originalName}`);
    }
  } catch (err) {
    console.error(`[Worker ${job.id}] Insertion failed:`, err);
    throw err;
  }
}, { connection, concurrency: 5 });

app.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const startTime = Date.now();
    await splitterQueue.add('split-csv', {
      filePath: req.file.path,
      originalName: req.file.originalname,
      startTime,
    });

    res.json({ message: 'Processing started', file: req.file.originalname });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to enqueue job' });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));